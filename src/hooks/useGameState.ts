'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerOrg, MarketOffer, FreightQuote, TradeMatch, InventoryItem } from '@/lib/types';
import { loadGameState, saveGameState, clearGameState } from '@/lib/storage';
import { computeSavings } from '@/lib/calculator';
import { microToUsd, usdToMicro } from '@/lib/units';

const STARTING_BALANCE = 10_000_000_000; // $10,000 in microdollars

function makeInitialState(org: PlayerOrg): GameState {
  return { org, inventory: [], matchHistory: [], totalSavingsUsd: 0, score: 0, streak: 0 };
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

  const executeTrade = useCallback(
    (
      offer: MarketOffer,
      freightQuote: FreightQuote,
      playerSide: 'buy' | 'sell',
      quantityLbs: number,
    ): TradeMatch | null => {
      if (!state) return null;

      const unitPriceUsd = microToUsd(offer.pricePerLbMicro);
      const savings = computeSavings(unitPriceUsd, freightQuote.perLbUsd, quantityLbs);

      const totalCostMicro = usdToMicro(unitPriceUsd * quantityLbs + freightQuote.totalUsd);
      const totalRevenueMicro = usdToMicro(
        unitPriceUsd * quantityLbs * (playerSide === 'sell' ? 1 : 1),
      );

      // Balance impact
      const balanceDelta =
        playerSide === 'buy' ? -totalCostMicro : totalRevenueMicro;

      if (playerSide === 'buy' && state.org.balance + balanceDelta < 0) {
        return null; // insufficient funds
      }

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
          const item: InventoryItem = {
            id: `inv-${Date.now()}`,
            productName: offer.productName,
            category: offer.category,
            quantityLbs,
            avgCostPerLb: unitPriceUsd,
            acquiredAt: Date.now(),
          };
          nextInventory.push(item);
        }
      } else {
        // Selling: deplete inventory if we have it
        const idx = nextInventory.findIndex(i => i.productName === offer.productName);
        if (idx >= 0) {
          nextInventory[idx].quantityLbs -= quantityLbs;
          if (nextInventory[idx].quantityLbs <= 0) nextInventory.splice(idx, 1);
        }
      }

      const next: GameState = {
        org: {
          ...state.org,
          balance: state.org.balance + balanceDelta,
        },
        inventory: nextInventory,
        matchHistory: [match, ...state.matchHistory].slice(0, 50),
        totalSavingsUsd: state.totalSavingsUsd + savings.savingsTotal,
        score: state.score + points,
        streak: state.streak + 1,
      };

      persist(next);
      return match;
    },
    [state, persist],
  );

  return { state, loaded, createOrg, executeTrade, resetGame };
}
