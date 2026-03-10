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
    const minP = Math.min(...prices), maxP = Math.max(...prices);
    const bins = 20, step = (maxP - minP) / bins || 0.1;
    return Array.from({ length: bins }, (_, i) => {
      const lo = minP + i * step, hi = lo + step;
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
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <div className="text-slate-500 text-xs font-semibold mb-3 uppercase tracking-wide">Market Depth</div>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="price" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#475569' }} itemStyle={{ color: '#0f172a' }} />
          <Area type="monotone" dataKey="buy" stroke="#2563eb" fill="#eff6ff" fillOpacity={0.8} name="Buy vol (lbs)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="sell" stroke="#ea580c" fill="#fff7ed" fillOpacity={0.8} name="Sell vol (lbs)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
