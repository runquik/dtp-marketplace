'use client';

import { InventoryItem } from '@/lib/types';
import { formatUsd, formatLbs } from '@/lib/units';
import { Package } from 'lucide-react';

interface Props { inventory: InventoryItem[] }

export default function InventoryPanel({ inventory }: Props) {
  return (
    <div className="bg-[#1a1d27] rounded-xl border border-slate-700 p-4">
      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
        <Package className="w-3.5 h-3.5" /> Inventory
      </div>
      {inventory.length === 0 ? (
        <div className="text-slate-600 text-sm text-center py-4">
          No inventory yet. Buy something from the orderbook.
        </div>
      ) : (
        <div className="space-y-2">
          {inventory.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <div className="text-slate-200 font-medium">{item.productName}</div>
                <div className="text-slate-500 text-xs">{formatLbs(item.quantityLbs)}</div>
              </div>
              <div className="text-right">
                <div className="text-white font-mono text-xs">{formatUsd(item.avgCostPerLb)}/lb</div>
                <div className="text-slate-400 text-xs">{formatUsd(item.avgCostPerLb * item.quantityLbs)} total</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
