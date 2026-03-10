'use client';

import { useState, useEffect } from 'react';
import { MarketOffer, FreightQuote, GameState, getCategoryMeta } from '@/lib/types';
import { microToUsd, formatUsd, formatLbs } from '@/lib/units';
import { Zap, Truck, AlertCircle, Package } from 'lucide-react';

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
      setQuantity(String(Math.min(selectedOffer.quantityLbs, 2000)));
      setFreightQuote(null);
      setError('');
    }
  }, [selectedOffer]);

  const getFreightQuote = async () => {
    if (!selectedOffer || !quantity) return;
    setQuoting(true); setError('');
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
      if (!res.ok) throw new Error();
      setFreightQuote(await res.json());
    } catch { setError('Could not get freight quote. Try again.'); }
    finally { setQuoting(false); }
  };

  const runMatch = async () => {
    if (!selectedOffer || !freightQuote) return;
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;
    setMatching(true);
    await new Promise(r => setTimeout(r, 700));
    const playerSide = selectedOffer.side === 'buy' ? 'sell' : 'buy';
    onExecuteTrade(selectedOffer, freightQuote, playerSide, qty);
    setMatching(false);
    setFreightQuote(null);
    setQuantity('');
  };

  if (!selectedOffer) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center min-h-40 shadow-sm">
        <div className="text-3xl mb-2">👆</div>
        <div className="text-slate-500 text-sm">Select an offer from the orderbook to start a trade</div>
      </div>
    );
  }

  const cat = getCategoryMeta(selectedOffer.category);
  const priceUsd = microToUsd(selectedOffer.pricePerLbMicro);
  const qty = parseFloat(quantity) || 0;
  const tradeSide = selectedOffer.side === 'buy' ? 'sell' : 'buy';

  // Inventory gate for sells
  const inventoryItem = tradeSide === 'sell'
    ? gameState.inventory.find(i => i.productName === selectedOffer.productName)
    : null;
  const hasInventory = tradeSide === 'buy' || (inventoryItem && inventoryItem.quantityLbs >= qty);
  const inventoryAvailable = inventoryItem?.quantityLbs ?? 0;

  const estimatedTotal = priceUsd * qty + (freightQuote?.totalUsd ?? 0);
  const canAfford = tradeSide === 'sell' || gameState.org.balance / 1_000_000 >= estimatedTotal;
  const tradeValueMicro = priceUsd * qty * 1_000_000;
  const capMicro = gameState.org.maxTradeCapMicro ?? Number.MAX_SAFE_INTEGER;
  const exceedsCap = tradeValueMicro > capMicro;
  const capUsd = capMicro / 1_000_000;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full ${cat.color}`}>{cat.emoji} {cat.label}</span>
          </div>
          <div className="text-slate-900 font-bold">{selectedOffer.productName}</div>
          <div className="text-slate-400 text-xs">{selectedOffer.organizationName} · {selectedOffer.city}, {selectedOffer.state}</div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
          tradeSide === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
        }`}>
          You {tradeSide.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-slate-400 text-xs mb-0.5">Offer price</div>
          <div className="text-slate-900 font-mono font-bold">{formatUsd(priceUsd)}<span className="text-slate-400 font-normal text-xs">/lb</span></div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-slate-400 text-xs mb-0.5">Available</div>
          <div className="text-slate-900 font-mono font-bold text-sm">{formatLbs(selectedOffer.quantityLbs)}</div>
        </div>
      </div>

      {/* Inventory warning for sells */}
      {tradeSide === 'sell' && (
        <div className={`rounded-xl px-4 py-3 flex items-start gap-2 ${
          inventoryItem ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'
        }`}>
          <Package className={`w-4 h-4 mt-0.5 shrink-0 ${inventoryItem ? 'text-green-500' : 'text-amber-500'}`} />
          <div className="text-sm">
            {inventoryItem ? (
              <span className="text-green-700">
                You have <strong>{formatLbs(inventoryAvailable)}</strong> of {selectedOffer.productName} in inventory.
              </span>
            ) : (
              <span className="text-amber-700">
                You don&apos;t have <strong>{selectedOffer.productName}</strong> in inventory. Buy it first, or manufacture it in the Workshop.
              </span>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="block text-slate-700 text-sm font-medium mb-1">
          Quantity (lbs){tradeSide === 'sell' && inventoryItem && ` — max ${formatLbs(inventoryAvailable)}`}
        </label>
        <input type="number"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          value={quantity} onChange={e => setQuantity(e.target.value)}
          min={1} max={tradeSide === 'sell' ? inventoryAvailable : selectedOffer.quantityLbs}
          placeholder="Enter quantity" />
      </div>

      <button onClick={getFreightQuote} disabled={!quantity || quoting || !hasInventory}
        className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 py-2.5 rounded-xl transition text-sm font-medium">
        <Truck className="w-4 h-4" />
        {quoting ? 'Getting quote…' : freightQuote ? 'Refresh Freight Quote' : 'Get Freight Quote'}
      </button>

      {freightQuote && (
        <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1 border border-slate-100">
          <div className="text-slate-500 text-xs font-bold uppercase mb-2">Freight Quote ({freightQuote.mode})</div>
          <div className="flex justify-between"><span className="text-slate-400">Distance</span><span className="text-slate-700">{freightQuote.miles.toLocaleString()} mi</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Transit</span><span className="text-slate-700">{freightQuote.transitDays} day{freightQuote.transitDays !== 1 ? 's' : ''}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Freight total</span><span className="text-slate-700">{formatUsd(freightQuote.totalUsd)}</span></div>
          <div className="flex justify-between font-bold border-t border-slate-200 pt-1.5 mt-1">
            <span className="text-slate-700">Landed cost</span>
            <span className="text-teal-600">{formatUsd(priceUsd + freightQuote.perLbUsd)}/lb</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2 border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {!canAfford && (
        <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0" />Insufficient balance for this trade
        </div>
      )}

      {exceedsCap && qty > 0 && (
        <div className="flex items-start gap-2 text-amber-700 text-sm bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Trade value exceeds your ${capUsd.toLocaleString()} cap.{' '}
            Complete more trades to unlock higher limits.
          </span>
        </div>
      )}

      <button onClick={runMatch}
        disabled={!freightQuote || matching || !canAfford || qty <= 0 || !hasInventory || exceedsCap}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-sm">
        <Zap className="w-4 h-4" />
        {matching ? 'Executing…' : 'Execute Trade via DTP'}
      </button>
    </div>
  );
}
