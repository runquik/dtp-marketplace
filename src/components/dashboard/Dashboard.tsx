'use client';

import { useState } from 'react';
import { GameState, MarketOffer, TradeMatch } from '@/lib/types';
import { useOrderbook } from '@/hooks/useOrderbook';
import { formatUsd, microToUsd } from '@/lib/units';
import TickerBar from '@/components/orderbook/TickerBar';
import Orderbook from '@/components/orderbook/Orderbook';
import DepthChart from '@/components/orderbook/DepthChart';
import TradePanel from '@/components/trade/TradePanel';
import SavingsCard from '@/components/trade/SavingsCard';
import BalanceCard from '@/components/dashboard/BalanceCard';
import InventoryPanel from '@/components/dashboard/InventoryPanel';
import MatchHistory from '@/components/dashboard/MatchHistory';
import { RotateCcw, Star, Zap } from 'lucide-react';

interface Props {
  gameState: GameState;
  onExecuteTrade: (offer: MarketOffer, quote: import('@/lib/types').FreightQuote, side: 'buy' | 'sell', qty: number) => void;
  onReset: () => void;
}

export default function Dashboard({ gameState, onExecuteTrade, onReset }: Props) {
  const { offers, loading, removeOffer } = useOrderbook();
  const [selectedOffer, setSelectedOffer] = useState<MarketOffer | null>(null);
  const [lastMatch, setLastMatch] = useState<TradeMatch | null>(null);

  const handleExecute = (
    offer: MarketOffer,
    quote: import('@/lib/types').FreightQuote,
    side: 'buy' | 'sell',
    qty: number,
  ) => {
    onExecuteTrade(offer, quote, side, qty);
    removeOffer(offer.id);
    setSelectedOffer(null);
    // Show savings card using the newly minted match (first in history)
    // We rely on parent updating gameState, then read from history
    setTimeout(() => {
      setLastMatch(null); // will be re-set by effect below
    }, 0);
  };

  // Show savings card for the most recent match after a trade
  const handleTradeComplete = (
    offer: MarketOffer,
    quote: import('@/lib/types').FreightQuote,
    side: 'buy' | 'sell',
    qty: number,
  ) => {
    onExecuteTrade(offer, quote, side, qty);
    removeOffer(offer.id);
    setSelectedOffer(null);
    // We need the match that was just created — it will be gameState.matchHistory[0]
    // But state hasn't updated yet. Use a temp placeholder so SavingsCard opens.
    // The parent will re-render with the new match in history.
    // Workaround: store the executed offer/quote and compute locally
    const { computeSavings } = require('@/lib/calculator');
    const { microToUsd: m2u } = require('@/lib/units');
    const unitPrice = m2u(offer.pricePerLbMicro);
    const savings = computeSavings(unitPrice, quote.perLbUsd, qty);
    const points = Math.max(5, Math.round(savings.savingsPct * 3));
    const totalCostMicro = Math.round((unitPrice * qty + quote.totalUsd) * 1_000_000);
    const balanceDelta = side === 'buy' ? -totalCostMicro : totalCostMicro;
    const match: TradeMatch = {
      matchId: `match-${Date.now()}`,
      playerSide: side,
      offer,
      freightQuote: quote,
      quantityLbs: qty,
      dtpLandedCostPerLb: savings.dtpLandedCost,
      legacyLandedCostPerLb: savings.legacyLandedCost,
      savingsPct: savings.savingsPct,
      savingsUsd: savings.savingsTotal,
      cycleTimeSavedDays: 18,
      pointsEarned: points,
      balanceDelta,
      timestamp: Date.now(),
    };
    setLastMatch(match);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      {/* Ticker */}
      {!loading && <TickerBar offers={offers} />}

      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold text-lg">
            DTP <span className="text-green-400">Market</span>
          </span>
          <span className="text-slate-500 text-sm hidden sm:inline">
            {gameState.org.name} · {gameState.org.city}, {gameState.org.state}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Star className="w-4 h-4" />
            <span className="font-bold">{gameState.score}</span>
          </div>
          {gameState.streak > 1 && (
            <div className="flex items-center gap-1 text-orange-400 text-sm">
              <Zap className="w-4 h-4" />
              <span>{gameState.streak}x streak</span>
            </div>
          )}
          <div className="text-white font-mono font-semibold hidden sm:block">
            {formatUsd(microToUsd(gameState.org.balance))}
          </div>
          <button
            onClick={() => { if (confirm('Reset your account? This cannot be undone.')) onReset(); }}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Reset account"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-4 p-4 min-h-0">

        {/* Left: orderbook + depth */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
              Live Orderbook · {loading ? '…' : offers.length} offers
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {loading ? (
                <div className="text-slate-600 text-sm p-8 text-center">Loading orderbook…</div>
              ) : (
                <Orderbook
                  offers={offers}
                  selectedOffer={selectedOffer}
                  onSelect={setSelectedOffer}
                  playerCategories={gameState.org.categories}
                />
              )}
            </div>
          </div>
          <DepthChart offers={offers} />
        </div>

        {/* Right: account + trade */}
        <div className="flex flex-col gap-4">
          <BalanceCard gameState={gameState} />

          <TradePanel
            selectedOffer={selectedOffer}
            gameState={gameState}
            playerZip={gameState.org.zip}
            onExecuteTrade={handleTradeComplete}
          />

          <div className="grid grid-cols-1 gap-4">
            <MatchHistory matches={gameState.matchHistory} />
            <InventoryPanel inventory={gameState.inventory} />
          </div>
        </div>
      </div>

      {/* Savings modal */}
      {lastMatch && (
        <SavingsCard match={lastMatch} onClose={() => setLastMatch(null)} />
      )}
    </div>
  );
}
