'use client';

import { useState, useMemo } from 'react';
import { MarketOffer, FOOD_CATEGORIES } from '@/lib/types';
import OfferCard from './OfferCard';

interface Props {
  offers: MarketOffer[];
  selectedOffer: MarketOffer | null;
  onSelect: (offer: MarketOffer) => void;
  playerCategories: string[];
}

export default function Orderbook({ offers, selectedOffer, onSelect, playerCategories }: Props) {
  const [sideFilter, setSideFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [catFilter, setCatFilter] = useState<string>('all');

  const filtered = useMemo(() =>
    offers.filter(o => {
      if (sideFilter !== 'all' && o.side !== sideFilter) return false;
      if (catFilter !== 'all' && o.category !== catFilter) return false;
      return true;
    }), [offers, sideFilter, catFilter]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {(['all', 'buy', 'sell'] as const).map(s => (
          <button key={s} onClick={() => setSideFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
              sideFilter === s
                ? s === 'buy'  ? 'bg-blue-500 text-white'
                  : s === 'sell' ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}>
            {s === 'all' ? 'All offers' : s === 'buy' ? '🔵 Buy' : '🟠 Sell'}
          </button>
        ))}
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="text-xs bg-white border border-slate-200 text-slate-600 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-400">
          <option value="all">All categories</option>
          {FOOD_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <span className="text-slate-400 text-xs ml-auto">{filtered.length} offers</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.slice(0, 60).map(offer => (
          <OfferCard key={offer.id} offer={offer} selected={selectedOffer?.id === offer.id} onSelect={() => onSelect(offer)} />
        ))}
      </div>
    </div>
  );
}
