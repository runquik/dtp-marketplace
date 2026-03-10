'use client';

import { MarketOffer, getCategoryMeta } from '@/lib/types';
import { microToUsd, formatUsd, formatLbs } from '@/lib/units';
import { Thermometer, Truck } from 'lucide-react';

interface Props { offer: MarketOffer; selected: boolean; onSelect: () => void; }

export default function OfferCard({ offer, selected, onSelect }: Props) {
  const cat = getCategoryMeta(offer.category);
  const priceUsd = microToUsd(offer.pricePerLbMicro);

  return (
    <button onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
        selected
          ? 'border-teal-400 bg-teal-50 shadow-sm'
          : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
      }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              offer.side === 'buy'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {offer.side.toUpperCase()}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${cat.color}`}>
              {cat.emoji} {cat.label}
            </span>
          </div>
          <div className="text-slate-900 text-sm font-semibold truncate">{offer.productName}</div>
          <div className="text-slate-500 text-xs">{offer.organizationName} · {offer.city}, {offer.state}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-slate-900 font-mono text-sm font-bold">
            {formatUsd(priceUsd)}<span className="text-slate-400 font-normal text-xs">/lb</span>
          </div>
          <div className="text-slate-500 text-xs">{formatLbs(offer.quantityLbs)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Truck className="w-3 h-3" />{offer.freightMode}
        </span>
        {offer.tempClass === 'reefer' && (
          <span className="flex items-center gap-1 text-xs text-sky-600 bg-sky-50 px-1.5 rounded">
            <Thermometer className="w-3 h-3" />Reefer
          </span>
        )}
        {offer.certifications.slice(0, 2).map(cert => (
          <span key={cert} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100">
            {cert.split(' ')[0]}
          </span>
        ))}
      </div>
    </button>
  );
}
