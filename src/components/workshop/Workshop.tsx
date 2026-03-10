'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe, InventoryItem, GameState } from '@/lib/types';
import { RECIPES } from '@/lib/recipes';
import { formatUsd, formatLbs } from '@/lib/units';
import { Hammer, CheckCircle, XCircle, ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  gameState: GameState;
  onManufacture: (recipe: Recipe) => string | null;
}

function IngredientRow({ ing, inventory }: { ing: { productName: string; quantityLbs: number }; inventory: InventoryItem[] }) {
  const item = inventory.find(i => i.productName === ing.productName);
  const have = item?.quantityLbs ?? 0;
  const enough = have >= ing.quantityLbs;
  return (
    <div className={`flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0 text-sm`}>
      <div className="flex items-center gap-2">
        {enough
          ? <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
          : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
        <span className={enough ? 'text-slate-700' : 'text-red-500'}>{ing.productName}</span>
      </div>
      <span className={`text-xs font-mono ${enough ? 'text-slate-400' : 'text-red-400'}`}>
        {ing.quantityLbs} lbs
        {!enough && <span className="ml-1 text-red-300">(have {have.toFixed(0)})</span>}
      </span>
    </div>
  );
}

function RecipeCard({ recipe, gameState, onSelect }: { recipe: Recipe; gameState: GameState; onSelect: () => void }) {
  const canMake = recipe.ingredients.every(ing => {
    const item = gameState.inventory.find(i => i.productName === ing.productName);
    return item && item.quantityLbs >= ing.quantityLbs;
  });
  const canAfford = gameState.org.balance / 1_000_000 >= recipe.processingFeeUsd;
  const ready = canMake && canAfford;

  // Estimate margin
  const totalIngredientCost = recipe.ingredients.reduce((sum, ing) => {
    const item = gameState.inventory.find(i => i.productName === ing.productName);
    return sum + (item?.avgCostPerLb ?? 0) * ing.quantityLbs;
  }, 0);
  const costBasis = (totalIngredientCost + recipe.processingFeeUsd) / recipe.outputQuantityLbs;
  const margin = recipe.suggestedSellPricePerLbUsd - costBasis;
  const marginPct = costBasis > 0 ? (margin / costBasis) * 100 : null;

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all ${
      ready ? 'border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-300' : 'border-slate-100'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="text-3xl">{recipe.emoji}</div>
          {ready && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> Ready!
            </span>
          )}
        </div>
        <div className="font-bold text-slate-900 text-sm mb-1">{recipe.outputProductName}</div>
        <div className="text-slate-400 text-xs mb-3 leading-tight">{recipe.description}</div>

        <div className="bg-slate-50 rounded-xl p-3 mb-3">
          <div className="text-slate-500 text-xs font-semibold uppercase mb-2">Ingredients needed</div>
          {recipe.ingredients.map(ing => (
            <IngredientRow key={ing.productName} ing={ing} inventory={gameState.inventory} />
          ))}
          <div className="flex items-center justify-between pt-2 mt-1 text-xs">
            <span className="text-slate-400">Processing fee</span>
            <span className={`font-semibold ${canAfford ? 'text-slate-600' : 'text-red-500'}`}>
              {formatUsd(recipe.processingFeeUsd)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs mb-3">
          <div>
            <div className="text-slate-400">Output</div>
            <div className="text-slate-700 font-semibold">{formatLbs(recipe.outputQuantityLbs)}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400">Sell price guide</div>
            <div className="text-teal-600 font-semibold">{formatUsd(recipe.suggestedSellPricePerLbUsd)}/lb</div>
          </div>
          {marginPct !== null && (
            <div className="text-right">
              <div className="text-slate-400">Est. margin</div>
              <div className={`font-semibold ${marginPct > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {marginPct > 0 ? '+' : ''}{marginPct.toFixed(0)}%
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onSelect}
          disabled={!ready}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            ready
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-sm'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Hammer className="w-4 h-4" />
          {ready ? 'Manufacture' : 'Missing ingredients'}
          {ready && <ChevronRight className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}

function ManufactureModal({ recipe, onConfirm, onCancel, loading }: {
  recipe: Recipe; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}>
        {loading ? (
          <div className="p-10 text-center">
            <div className="text-5xl mb-4 animate-bounce">{recipe.emoji}</div>
            <div className="text-slate-900 font-bold text-lg mb-2">Manufacturing…</div>
            <div className="text-slate-400 text-sm">Combining ingredients and processing</div>
            <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                initial={{ width: '0%' }} animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }} />
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-4xl mb-3 text-center">{recipe.emoji}</div>
            <div className="text-center mb-4">
              <div className="text-slate-900 font-bold text-lg">{recipe.outputProductName}</div>
              <div className="text-slate-400 text-sm mt-1">
                This will consume the listed ingredients and charge {formatUsd(recipe.processingFeeUsd)} in processing fees.
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 mb-5 text-sm text-center">
              <div className="text-emerald-700 font-semibold">You&apos;ll receive {formatLbs(recipe.outputQuantityLbs)}</div>
              <div className="text-emerald-500 text-xs">Suggested sell price: {formatUsd(recipe.suggestedSellPricePerLbUsd)}/lb</div>
            </div>
            <div className="flex gap-3">
              <button onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold hover:from-teal-600 hover:to-emerald-600 transition shadow-sm">
                Manufacture
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Workshop({ gameState, onManufacture }: Props) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ recipe: Recipe; success: boolean; error?: string } | null>(null);

  const handleConfirm = async () => {
    if (!selectedRecipe) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2200)); // manufacture animation
    const err = onManufacture(selectedRecipe);
    setLoading(false);
    setSelectedRecipe(null);
    setLastResult({ recipe: selectedRecipe, success: !err, error: err ?? undefined });
    if (!err) setTimeout(() => setLastResult(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Hammer className="w-6 h-6" />
          <span className="font-bold text-lg">Workshop</span>
        </div>
        <p className="text-orange-100 text-sm">
          Turn raw ingredients from the orderbook into finished, value-added goods. Buy inputs, manufacture, then sell at a markup.
        </p>
      </div>

      {/* Success/error toast */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl px-4 py-3 flex items-center gap-3 ${
              lastResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
            {lastResult.success ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-green-700 text-sm font-medium">
                  {lastResult.recipe.emoji} {lastResult.recipe.outputProductName} ({formatLbs(lastResult.recipe.outputQuantityLbs)}) added to inventory! +10 pts
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-red-700 text-sm">{lastResult.error}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory hint */}
      {gameState.inventory.length === 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-amber-700 text-sm">
          <strong>Your inventory is empty.</strong> Head to the Market tab and buy some raw materials first — look for Fresh Strawberries, Rolled Oats, Roma Tomatoes, or other ingredients.
        </div>
      )}

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {RECIPES.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} gameState={gameState} onSelect={() => setSelectedRecipe(recipe)} />
        ))}
      </div>

      {/* Modals */}
      {selectedRecipe && !loading && (
        <ManufactureModal recipe={selectedRecipe} onConfirm={handleConfirm}
          onCancel={() => setSelectedRecipe(null)} loading={false} />
      )}
      {selectedRecipe && loading && (
        <ManufactureModal recipe={selectedRecipe} onConfirm={handleConfirm}
          onCancel={() => {}} loading={true} />
      )}
    </div>
  );
}
