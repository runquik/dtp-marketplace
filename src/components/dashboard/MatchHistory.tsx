'use client';

import { TradeMatch } from '@/lib/types';
import { formatUsd, formatPct, formatLbs } from '@/lib/units';

interface Props { matches: TradeMatch[] }

export default function MatchHistory({ matches }: Props) {
  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
        <div className="text-3xl mb-2">📋</div>
        <div className="text-slate-400 text-sm">No trades yet. Pick an offer and execute your first trade.</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="text-slate-600 text-xs font-semibold uppercase tracking-wide mb-3">Recent Trades</div>
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {matches.slice(0, 10).map(m => (
          <div key={m.matchId} className="flex items-center justify-between text-sm bg-slate-50 rounded-xl px-3 py-2">
            <div className="flex-1 min-w-0">
              <div className="text-slate-800 font-medium truncate">{m.offer.productName}</div>
              <div className="text-slate-400 text-xs">{formatLbs(m.quantityLbs)} · {m.playerSide === 'buy' ? '🔵 Bought' : '🟠 Sold'}</div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="text-green-600 text-xs font-bold">-{formatPct(m.savingsPct)}</div>
              <div className="text-slate-400 text-xs">saved {formatUsd(m.savingsUsd)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
