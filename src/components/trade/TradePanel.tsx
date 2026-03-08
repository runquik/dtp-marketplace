'use client';

import { useState, useEffect } from 'react';
import { MarketOffer, FreightQuote, GameState } from '@/lib/types';
import { microToUsd, formatUsd, formatLbs } from '@/lib/units';
import { Zap, Truck, AlertCircle } from 'lucide-react';

interface Props {
  selectedOffer: MarketOffer | null;
  gameState: GameState;
  playerZip: string;
  onExecuteTrade: (offer: MarketOffer, quote: FreightQuote, side: 'buy' | 'sell', qty: number) => void;
}

export default function TradePanel({ selectedOffer, gameState, playerZip, onExecuteTrade }: Props) {
  const [quantity, setQuantity] = useState('');
  const [freightQuote, setFreightQuote] = useState<FreightQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedOffer) {
      setQuantity(String(Math.min(selectedOffer.quantityLbs, 5000)));
      setFreightQuote(null);
      setError('');
    }
  }, [selectedOffer]);

  const getFreightQuote = async () => {
    if (!selectedOffer || !quantity) return;
    setQuoting(true);
    setError('');
    try {
      const res = await fetch('/api/freight/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originZip: selectedOffer.zip,
          destZip: playerZip || '97201',
          quantityLbs: parseFloat(quantity),
          freightMode: selectedOffer.freightMode,
          tempClass: selectedOffer.tempClass,
        }),
      });
      if (!res.ok) throw new Error('Freight API error');
      setFreightQuote(await res.json());
    } catch (e) {
      setError('Could not get freight quote. Try again.');
    } finally {
      setQuoting(false);
    }
  };

  const runMatch = async () => {
    if (!selectedOffer || !freightQuote) return;
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;
    setMatching(true);
    // Small delay for feel
    await new Promise(r => setTimeout(r, 600));
    const playerSide = selectedOffer.side === 'buy' ? 'sell' : 'buy';
    onExecuteTrade(selectedOffer, freightQuote, playerSide, qty);
    setMatching(false);
    setFreightQuote(null);
    setQuantity('');
  };

  if (!selectedOffer) {
    return (
      <div className="bg-[#1a1d27] rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center text-center min-h-48">
        <div className="text-slate-500 text-sm">
          Select an offer from the orderbook to start a trade
        </div>
      </div>
    );
  }

  const priceUsd = microToUsd(selectedOffer.pricePerLbMicro);
  const qty = parseFloat(quantity) || 0;
  const tradeSide = selectedOffer.side === 'buy' ? 'sell' : 'buy';
  const estimatedTotal = priceUsd * qty + (freightQuote?.totalUsd ?? 0);
  const canAfford = tradeSide === 'sell' || gameState.org.balance / 1_000_000 >= estimatedTotal;

  return (
    <div className="bg-[#1a1d27] rounded-xl border border-slate-700 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-white font-semibold">{selectedOffer.productName}</div>
          <div className="text-slate-400 text-xs mt-0.5">{selectedOffer.organizationName} · {selectedOffer.city}, {selectedOffer.state}</div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${
          tradeSide === 'buy' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
        }`}>
          You {tradeSide.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-[#0f1117] rounded-lg p-3">
          <div className="text-slate-400 text-xs mb-1">Offer price</div>
          <div className="text-white font-mono font-semibold">{formatUsd(priceUsd)}/lb</div>
        </div>
        <div className="bg-[#0f1117] rounded-lg p-3">
          <div className="text-slate-400 text-xs mb-1">Available qty</div>
          <div className="text-white font-mono font-semibold">{formatLbs(selectedOffer.quantityLbs)}</div>
        </div>
      </div>

      <div>
        <label className="block text-slate-300 text-sm mb-1">Quantity (lbs)</label>
        <input
          type="number"
          className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-400 transition-colors"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          min={1}
          max={selectedOffer.quantityLbs}
          placeholder="Enter quantity"
        />
      </div>

      <button
        onClick={getFreightQuote}
        disabled={!quantity || quoting}
        className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white py-2.5 rounded-lg transition-colors text-sm"
      >
        <Truck className="w-4 h-4" />
        {quoting ? 'Getting quote...' : freightQuote ? 'Refresh Freight Quote' : 'Get Freight Quote'}
      </button>

      {freightQuote && (
        <div className="bg-[#0f1117] rounded-lg p-3 text-sm space-y-1.5">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Freight Quote</div>
          <div className="flex justify-between">
            <span className="text-slate-400">Distance</span>
            <span className="text-slate-200">{freightQuote.miles.toLocaleString()} miles</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Transit time</span>
            <span className="text-slate-200">{freightQuote.transitDays} day{freightQuote.transitDays !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Freight total</span>
            <span className="text-slate-200">{formatUsd(freightQuote.totalUsd)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-slate-700 pt-1.5 mt-1">
            <span className="text-slate-300">Landed cost</span>
            <span className="text-white">{formatUsd(priceUsd + freightQuote.perLbUsd)}/lb</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!canAfford && (
        <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-400/10 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Insufficient balance for this trade
        </div>
      )}

      <button
        onClick={runMatch}
        disabled={!freightQuote || matching || !canAfford || qty <= 0}
        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-colors"
      >
        <Zap className="w-4 h-4" />
        {matching ? 'Matching...' : 'Execute Trade'}
      </button>

      {freightQuote && canAfford && (
        <div className="text-center text-slate-500 text-xs">
          Estimated total: {formatUsd(estimatedTotal)} · Balance after: {formatUsd(
            (gameState.org.balance / 1_000_000) - (tradeSide === 'buy' ? estimatedTotal : -estimatedTotal)
          )}
        </div>
      )}
    </div>
  );
}
