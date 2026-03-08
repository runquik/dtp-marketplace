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

  const filtered = useMemo(() => {
    return offers.filter(o => {
      if (sideFilter !== 'all' && o.side !== sideFilter) return false;
      if (catFilter !== 'all' && o.category !== catFilter) return false;
      return true;
    });
  }, [offers, sideFilter, catFilter]);

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {(['all', 'buy', 'sell'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSideFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sideFilter === s
                ? s === 'buy' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : s === 'sell' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'bg-slate-600 text-white border border-slate-500'
                : 'bg-[#1a1d27] text-slate-400 border border-slate-700 hover:border-slate-500'
            }`}
          >
            {s === 'all' ? 'All' : s.toUpperCase()}
          </button>
        ))}
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="text-xs bg-[#1a1d27] border border-slate-700 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-400"
        >
          <option value="all">All categories</option>
          {FOOD_CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <span className="text-slate-500 text-xs ml-auto">{filtered.length} offers</span>
      </div>

      {/* Offer list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.slice(0, 60).map(offer => (
          <OfferCard
            key={offer.id}
            offer={offer}
            selected={selectedOffer?.id === offer.id}
            onSelect={() => onSelect(offer)}
          />
        ))}
      </div>
    </div>
  );
}
