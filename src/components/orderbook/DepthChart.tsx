'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MarketOffer } from '@/lib/types';
import { microToUsd } from '@/lib/units';

interface Props { offers: MarketOffer[] }

export default function DepthChart({ offers }: Props) {
  const data = useMemo(() => {
    if (!offers.length) return [];

    const prices = offers.map(o => microToUsd(o.pricePerLbMicro));
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const bins = 20;
    const step = (maxP - minP) / bins || 0.1;

    return Array.from({ length: bins }, (_, i) => {
      const lo = minP + i * step;
      const hi = lo + step;
      const buys = offers.filter(o => o.side === 'buy' && microToUsd(o.pricePerLbMicro) >= lo && microToUsd(o.pricePerLbMicro) < hi);
      const sells = offers.filter(o => o.side === 'sell' && microToUsd(o.pricePerLbMicro) >= lo && microToUsd(o.pricePerLbMicro) < hi);
      return {
        price: `$${((lo + hi) / 2).toFixed(2)}`,
        buy: buys.reduce((s, o) => s + o.quantityLbs, 0),
        sell: sells.reduce((s, o) => s + o.quantityLbs, 0),
      };
    });
  }, [offers]);

  return (
    <div className="bg-[#1a1d27] rounded-xl border border-slate-700 p-4">
      <div className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wide">
        Market Depth — All Categories
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="price" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#0f1117', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#fff' }}
          />
          <Area type="monotone" dataKey="buy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} name="Buy vol (lbs)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="sell" stroke="#f97316" fill="#f97316" fillOpacity={0.25} name="Sell vol (lbs)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
