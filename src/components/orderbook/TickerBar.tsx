'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MarketOffer } from '@/lib/types';
import { microToUsd, formatUsd } from '@/lib/units';

interface Props { offers: MarketOffer[] }

export default function TickerBar({ offers }: Props) {
  const items = offers.slice(0, 24);

  return (
    <div className="overflow-hidden bg-[#0f1117] border-b border-slate-800 py-2 relative">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {[...items, ...items].map((offer, i) => (
          <span key={i} className="text-xs flex items-center gap-1.5">
            <span className={offer.side === 'buy' ? 'text-blue-400' : 'text-orange-400'}>
              {offer.side.toUpperCase()}
            </span>
            <span className="text-slate-300">{offer.productName}</span>
            <span className="text-slate-500">{offer.quantityLbs.toLocaleString()} lbs</span>
            <span className="text-white font-mono">
              {formatUsd(microToUsd(offer.pricePerLbMicro))}/lb
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">{offer.city}, {offer.state}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
