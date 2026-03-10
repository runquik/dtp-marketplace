'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState, PlayerOrg, MarketOffer, FreightQuote, TradeMatch,
  InventoryItem, Recipe, ManufactureRecord, BusinessType,
} from '@/lib/types';
import { loadGameState, saveGameState, clearGameState } from '@/lib/storage';
import { computeSavings } from '@/lib/calculator';
import { microToUsd, usdToMicro } from '@/lib/units';

const STARTING_BALANCE = 10_000_000_000; // $10,000 in microdollars

function makeInitialState(org: PlayerOrg): GameState {
  return { org, inventory: [], matchHistory: [], manufactureHistory: [], totalSavingsUsd: 0, score: 0, streak: 0 };
}

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadGameState();
    setState(saved);
    setLoaded(true);
  }, []);

  const persist = useCallback((next: GameState) => {
    setState(next);
    saveGameState(next);
  }, []);

  const createOrg = useCallback((partial: Omit<PlayerOrg, 'id' | 'balance' | 'createdAt'>) => {
    const org: PlayerOrg = {
      ...partial,
      id: `org-${Date.now()}`,
      balance: STARTING_BALANCE,
      createdAt: Date.now(),
    };
    persist(makeInitialState(org));
  }, [persist]);

  const resetGame = useCallback(() => {
    clearGameState();
    setState(null);
  }, []);

  /**
   * Check if the player has enough inventory to fulfill a sell trade.
   * Returns the inventory item if found, null if insufficient.
   */
  const checkInventoryForSell = useCallback(
    (productName: string, quantityLbs: number): InventoryItem | null => {
      if (!state) return null;
      const item = state.inventory.find(i => i.productName === productName);
      if (!item || item.quantityLbs < quantityLbs) return null;
      return item;
    },
    [state],
  );

  const executeTrade = useCallback(
    (
      offer: MarketOffer,
      freightQuote: FreightQuote,
      playerSide: 'buy' | 'sell',
      quantityLbs: number,
    ): TradeMatch | null => {
      if (!state) return null;

      const unitPriceUsd = microToUsd(offer.pricePerLbMicro);

      // Inventory gate: can't sell what you don't have
      if (playerSide === 'sell') {
        const invItem = checkInventoryForSell(offer.productName, quantityLbs);
        if (!invItem) return null;
      }

      const savings = computeSavings(unitPriceUsd, freightQuote.perLbUsd, quantityLbs);
      const totalCostMicro = usdToMicro(unitPriceUsd * quantityLbs + freightQuote.totalUsd);
      const totalRevenueMicro = usdToMicro(unitPriceUsd * quantityLbs - freightQuote.totalUsd);
      const balanceDelta = playerSide === 'buy' ? -totalCostMicro : Math.max(0, totalRevenueMicro);

      if (playerSide === 'buy' && state.org.balance + balanceDelta < 0) return null;

      const points = Math.max(5, Math.round(savings.savingsPct * 3));

      const match: TradeMatch = {
        matchId: `match-${Date.now()}`,
        playerSide,
        offer,
        freightQuote,
        quantityLbs,
        dtpLandedCostPerLb: savings.dtpLandedCost,
        legacyLandedCostPerLb: savings.legacyLandedCost,
        savingsPct: savings.savingsPct,
        savingsUsd: savings.savingsTotal,
        cycleTimeSavedDays: savings.cycleTimeSavedDays,
        pointsEarned: points,
        balanceDelta,
        timestamp: Date.now(),
      };

      // Update inventory
      let nextInventory = [...state.inventory];
      if (playerSide === 'buy') {
        const existing = nextInventory.find(i => i.productName === offer.productName);
        if (existing) {
          const totalQty = existing.quantityLbs + quantityLbs;
          existing.avgCostPerLb =
            (existing.avgCostPerLb * existing.quantityLbs + unitPriceUsd * quantityLbs) / totalQty;
          existing.quantityLbs = totalQty;
        } else {
          nextInventory.push({
            id: `inv-${Date.now()}`,
            productName: offer.productName,
            category: offer.category,
            quantityLbs,
            avgCostPerLb: unitPriceUsd,
            acquiredAt: Date.now(),
            isManufactured: false,
          });
        }
      } else {
        // Selling: deplete inventory
        const idx = nextInventory.findIndex(i => i.productName === offer.productName);
        if (idx >= 0) {
          nextInventory[idx] = { ...nextInventory[idx], quantityLbs: nextInventory[idx].quantityLbs - quantityLbs };
          if (nextInventory[idx].quantityLbs <= 0) nextInventory.splice(idx, 1);
        }
      }

      const next: GameState = {
        org: { ...state.org, balance: state.org.balance + balanceDelta },
        inventory: nextInventory,
        matchHistory: [match, ...state.matchHistory].slice(0, 50),
        manufactureHistory: state.manufactureHistory,
        totalSavingsUsd: state.totalSavingsUsd + savings.savingsTotal,
        score: state.score + points,
        streak: state.streak + 1,
      };

      persist(next);
      return match;
    },
    [state, persist, checkInventoryForSell],
  );

  /**
   * Manufacture finished goods from ingredients in inventory.
   * Returns error string if something is wrong, null on success.
   */
  const manufacture = useCallback(
    (recipe: Recipe): string | null => {
      if (!state) return 'No game state';

      // Check ingredients
      for (const ing of recipe.ingredients) {
        const item = state.inventory.find(i => i.productName === ing.productName);
        if (!item || item.quantityLbs < ing.quantityLbs) {
          return `Need ${ing.quantityLbs} lbs of ${ing.productName} (have ${item?.quantityLbs.toFixed(0) ?? 0} lbs)`;
        }
      }

      // Check balance for processing fee
      const feeMicro = usdToMicro(recipe.processingFeeUsd);
      if (state.org.balance < feeMicro) {
        return `Insufficient balance for processing fee ($${recipe.processingFeeUsd})`;
      }

      // Consume ingredients
      let nextInventory = [...state.inventory];
      for (const ing of recipe.ingredients) {
        const idx = nextInventory.findIndex(i => i.productName === ing.productName);
        if (idx < 0) return 'Ingredient not found'; // shouldn't happen
        const remaining = nextInventory[idx].quantityLbs - ing.quantityLbs;
        if (remaining <= 0.001) {
          nextInventory.splice(idx, 1);
        } else {
          nextInventory[idx] = { ...nextInventory[idx], quantityLbs: remaining };
        }
      }

      // Add finished goods
      const existing = nextInventory.find(i => i.productName === recipe.outputProductName);
      // Estimate cost basis: ingredient cost + processing fee
      const totalIngredientCost = recipe.ingredients.reduce((sum, ing) => {
        const item = state.inventory.find(i => i.productName === ing.productName);
        return sum + (item?.avgCostPerLb ?? 0) * ing.quantityLbs;
      }, 0);
      const costBasisPerLb = (totalIngredientCost + recipe.processingFeeUsd) / recipe.outputQuantityLbs;

      if (existing) {
        const totalQty = existing.quantityLbs + recipe.outputQuantityLbs;
        existing.avgCostPerLb =
          (existing.avgCostPerLb * existing.quantityLbs + costBasisPerLb * recipe.outputQuantityLbs) / totalQty;
        existing.quantityLbs = totalQty;
      } else {
        nextInventory.push({
          id: `inv-mfg-${Date.now()}`,
          productName: recipe.outputProductName,
          category: recipe.outputCategory,
          quantityLbs: recipe.outputQuantityLbs,
          avgCostPerLb: costBasisPerLb,
          acquiredAt: Date.now(),
          isManufactured: true,
        });
      }

      const record: ManufactureRecord = {
        id: `mfg-${Date.now()}`,
        recipeId: recipe.id,
        outputProductName: recipe.outputProductName,
        outputQuantityLbs: recipe.outputQuantityLbs,
        ingredientsConsumed: recipe.ingredients,
        processingFeeUsd: recipe.processingFeeUsd,
        timestamp: Date.now(),
      };

      const next: GameState = {
        org: { ...state.org, balance: state.org.balance - feeMicro },
        inventory: nextInventory,
        matchHistory: state.matchHistory,
        manufactureHistory: [record, ...state.manufactureHistory].slice(0, 30),
        totalSavingsUsd: state.totalSavingsUsd,
        score: state.score + 10, // bonus points for manufacturing
        streak: state.streak,
      };

      persist(next);
      return null; // success
    },
    [state, persist],
  );

  return { state, loaded, createOrg, executeTrade, manufacture, checkInventoryForSell, resetGame };
}
