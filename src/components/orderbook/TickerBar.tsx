'use client';

import { motion } from 'framer-motion';
import { MarketOffer } from '@/lib/types';
import { microToUsd, formatUsd } from '@/lib/units';

interface Props { offers: MarketOffer[] }

export default function TickerBar({ offers }: Props) {
  const items = offers.slice(0, 20);
  return (
    <div className="overflow-hidden bg-slate-900 py-2 relative">
      <motion.div className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}>
        {[...items, ...items].map((o, i) => (
          <span key={i} className="text-xs flex items-center gap-1.5">
            <span className={o.side === 'buy' ? 'text-blue-400' : 'text-orange-400'}>
              {o.side.toUpperCase()}
            </span>
            <span className="text-slate-200">{o.productName}</span>
            <span className="text-slate-500">{o.quantityLbs.toLocaleString()} lbs</span>
            <span className="text-green-400 font-mono">{formatUsd(microToUsd(o.pricePerLbMicro))}/lb</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">{o.city}, {o.state}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
