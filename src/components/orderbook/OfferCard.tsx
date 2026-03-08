'use client';

import { MarketOffer } from '@/lib/types';
import { microToUsd, formatUsd, formatLbs } from '@/lib/units';
import { Thermometer, Truck } from 'lucide-react';

interface Props {
  offer: MarketOffer;
  selected: boolean;
  onSelect: () => void;
}

export default function OfferCard({ offer, selected, onSelect }: Props) {
  const priceUsd = microToUsd(offer.pricePerLbMicro);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        selected
          ? 'border-green-400 bg-green-400/5'
          : 'border-slate-700 bg-[#1a1d27] hover:border-slate-500'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                offer.side === 'buy'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-orange-500/20 text-orange-400'
              }`}
            >
              {offer.side.toUpperCase()}
            </span>
            <span className="text-white text-sm font-medium truncate">{offer.productName}</span>
          </div>
          <div className="text-slate-400 text-xs truncate">{offer.organizationName}</div>
          <div className="text-slate-500 text-xs mt-0.5">{offer.city}, {offer.state}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-white font-mono text-sm font-semibold">
            {formatUsd(priceUsd)}<span className="text-slate-400 font-normal">/lb</span>
          </div>
          <div className="text-slate-400 text-xs">{formatLbs(offer.quantityLbs)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Truck className="w-3 h-3" />{offer.freightMode}
        </span>
        {offer.tempClass === 'reefer' && (
          <span className="flex items-center gap-1 text-xs text-blue-400/70">
            <Thermometer className="w-3 h-3" />Reefer
          </span>
        )}
        {offer.certifications.map(cert => (
          <span key={cert} className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
            {cert.split(' ')[0]}
          </span>
        ))}
      </div>
    </button>
  );
}
