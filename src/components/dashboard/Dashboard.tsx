'use client';

import { useState } from 'react';
import { GameState, MarketOffer, FreightQuote, TradeMatch, Recipe } from '@/lib/types';
import { useOrderbook } from '@/hooks/useOrderbook';
import { microToUsd, formatUsd } from '@/lib/units';
import { computeSavings } from '@/lib/calculator';
import { usdToMicro } from '@/lib/units';
import TickerBar from '@/components/orderbook/TickerBar';
import Orderbook from '@/components/orderbook/Orderbook';
import DepthChart from '@/components/orderbook/DepthChart';
import TradePanel from '@/components/trade/TradePanel';
import SavingsCard from '@/components/trade/SavingsCard';
import BalanceCard from '@/components/dashboard/BalanceCard';
import InventoryPanel from '@/components/dashboard/InventoryPanel';
import MatchHistory from '@/components/dashboard/MatchHistory';
import Workshop from '@/components/workshop/Workshop';
import { RotateCcw, ShoppingBag, Hammer, Star } from 'lucide-react';
import { BUSINESS_TYPES } from '@/lib/types';

interface Props {
  gameState: GameState;
  onExecuteTrade: (offer: MarketOffer, quote: FreightQuote, side: 'buy' | 'sell', qty: number) => void;
  onManufacture: (recipe: Recipe) => string | null;
  onReset: () => void;
}

type Tab = 'market' | 'workshop';

export default function Dashboard({ gameState, onExecuteTrade, onManufacture, onReset }: Props) {
  const { offers, loading, removeOffer } = useOrderbook();
  const [selectedOffer, setSelectedOffer] = useState<MarketOffer | null>(null);
  const [lastMatch, setLastMatch] = useState<TradeMatch | null>(null);
  const [tab, setTab] = useState<Tab>('market');
  const bt = BUSINESS_TYPES.find(b => b.id === gameState.org.businessType);

  const handleTradeComplete = (
    offer: MarketOffer,
    quote: FreightQuote,
    side: 'buy' | 'sell',
    qty: number,
  ) => {
    onExecuteTrade(offer, quote, side, qty);
    removeOffer(offer.id);
    setSelectedOffer(null);

    // Build match locally for savings card (state updates are async)
    const unitPrice = microToUsd(offer.pricePerLbMicro);
    const savings = computeSavings(unitPrice, quote.perLbUsd, qty);
    const points = Math.max(5, Math.round(savings.savingsPct * 3));
    const totalCost = usdToMicro(unitPrice * qty + quote.totalUsd);
    const balanceDelta = side === 'buy' ? -totalCost : Math.max(0, usdToMicro(unitPrice * qty - quote.totalUsd));

    setLastMatch({
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
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Ticker */}
      {!loading && <TickerBar offers={offers} />}

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-slate-900">
            DTP <span className="text-teal-600">Market</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 rounded-full px-3 py-1 text-sm border border-slate-100">
            <span>{bt?.emoji}</span>
            <span className="text-slate-600 font-medium">{gameState.org.name}</span>
            <span className="text-slate-400">· {gameState.org.city}, {gameState.org.state}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-slate-900 font-bold font-mono">
            {formatUsd(microToUsd(gameState.org.balance))}
          </div>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            {gameState.score.toLocaleString()}
          </div>
          <button onClick={() => { if (confirm('Reset your account? This cannot be undone.')) onReset(); }}
            className="text-slate-300 hover:text-slate-500 transition-colors" title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-4">
        <div className="flex gap-1">
          {([
            { id: 'market',   label: 'Market',   icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'workshop', label: 'Workshop',  icon: <Hammer className="w-4 h-4" /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}>
              {t.icon}{t.label}
              {t.id === 'workshop' && gameState.inventory.length > 0 && (
                <span className="bg-teal-100 text-teal-600 text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {gameState.inventory.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">
        {tab === 'market' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-4">
            {/* Left: account summary + orderbook */}
            <div className="flex flex-col gap-4 min-h-0">
              <BalanceCard gameState={gameState} />
              <div className="flex flex-col min-h-0" style={{ height: '520px' }}>
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  Live Orderbook · {loading ? '…' : `${offers.length} offers`}
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  {loading ? (
                    <div className="text-slate-400 text-sm text-center py-12">Loading orderbook…</div>
                  ) : (
                    <Orderbook offers={offers} selectedOffer={selectedOffer}
                      onSelect={setSelectedOffer} playerCategories={gameState.org.categories} />
                  )}
                </div>
              </div>
              <DepthChart offers={offers} />
            </div>

            {/* Right: trade + history */}
            <div className="flex flex-col gap-4">
              <TradePanel selectedOffer={selectedOffer} gameState={gameState}
                playerZip={gameState.org.zip} onExecuteTrade={handleTradeComplete} />
              <MatchHistory matches={gameState.matchHistory} />
              <InventoryPanel inventory={gameState.inventory} />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Workshop gameState={gameState} onManufacture={onManufacture} />
          </div>
        )}
      </div>

      {lastMatch && <SavingsCard match={lastMatch} onClose={() => setLastMatch(null)} />}
    </div>
  );
}
