'use client';

import { TradeMatch } from '@/lib/types';
import { formatUsd, formatPct, formatLbs } from '@/lib/units';
import { TrendingDown } from 'lucide-react';

interface Props { matches: TradeMatch[] }

export default function MatchHistory({ matches }: Props) {
  return (
    <div className="bg-[#1a1d27] rounded-xl border border-slate-700 p-4">
      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
        <TrendingDown className="w-3.5 h-3.5" /> Recent Trades
      </div>
      {matches.length === 0 ? (
        <div className="text-slate-600 text-sm text-center py-4">
          No trades yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {matches.slice(0, 10).map(m => (
            <div key={m.matchId} className="flex items-center justify-between text-sm bg-[#0f1117] rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="text-slate-200 truncate">{m.offer.productName}</div>
                <div className="text-slate-500 text-xs">
                  {formatLbs(m.quantityLbs)} · {m.playerSide === 'buy' ? 'Bought' : 'Sold'}
                </div>
              </div>
              <div className="text-right ml-2 shrink-0">
                <div className="text-green-400 text-xs font-semibold">
                  -{formatPct(m.savingsPct)}
                </div>
                <div className="text-slate-500 text-xs">saved {formatUsd(m.savingsUsd)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
