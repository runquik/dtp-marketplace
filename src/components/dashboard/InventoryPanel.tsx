'use client';

import { InventoryItem } from '@/lib/types';
import { formatUsd, formatLbs } from '@/lib/units';
import { Package, Hammer } from 'lucide-react';

interface Props { inventory: InventoryItem[] }

export default function InventoryPanel({ inventory }: Props) {
  if (inventory.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
        <div className="text-3xl mb-2">📦</div>
        <div className="text-slate-400 text-sm">No inventory yet. Buy from the orderbook or manufacture in the Workshop.</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold uppercase tracking-wide mb-3">
        <Package className="w-3.5 h-3.5" /> Inventory ({inventory.length} SKUs)
      </div>
      <div className="space-y-2">
        {inventory.map(item => (
          <div key={item.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              {item.isManufactured && <Hammer className="w-3 h-3 text-orange-400 shrink-0" />}
              <div className="min-w-0">
                <div className="text-slate-800 font-medium truncate">{item.productName}</div>
                <div className="text-slate-400 text-xs">{formatLbs(item.quantityLbs)}</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-slate-700 font-mono text-xs font-semibold">{formatUsd(item.avgCostPerLb)}/lb</div>
              <div className="text-slate-400 text-xs">{formatUsd(item.avgCostPerLb * item.quantityLbs)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
