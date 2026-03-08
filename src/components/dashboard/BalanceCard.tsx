'use client';

import { GameState } from '@/lib/types';
import { microToUsd, formatUsd } from '@/lib/units';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface Props { gameState: GameState }

export default function BalanceCard({ gameState }: Props) {
  const balance = microToUsd(gameState.org.balance);
  const start = 10_000;
  const pnl = balance - start;
  const isPositive = pnl >= 0;

  // Build sparkline from match history (reversed = chronological)
  const sparkData = [
    { v: start },
    ...[...gameState.matchHistory].reverse().map((m, i) => ({
      v: start + [...gameState.matchHistory].reverse().slice(0, i + 1).reduce((s, x) => s + x.balanceDelta / 1_000_000, 0),
    })),
    { v: balance },
  ];

  return (
    <div className="bg-[#1a1d27] rounded-xl border border-slate-700 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Account Balance</div>
          <div className="text-white text-3xl font-bold font-mono">{formatUsd(balance)}</div>
          <div className={`text-sm mt-0.5 font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{formatUsd(pnl)} from start
          </div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total Savings</div>
          <div className="text-green-400 text-xl font-bold">{formatUsd(gameState.totalSavingsUsd)}</div>
          <div className="text-slate-500 text-xs">vs legacy trade</div>
        </div>
      </div>

      {sparkData.length > 2 && (
        <ResponsiveContainer width="100%" height={48}>
          <LineChart data={sparkData}>
            <Line type="monotone" dataKey="v" stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth={1.5} dot={false} />
            <Tooltip
              contentStyle={{ background: '#0f1117', border: '1px solid #334155', borderRadius: 6, fontSize: 11 }}
              formatter={(v) => [typeof v === 'number' ? formatUsd(v) : String(v), 'Balance']}
              labelFormatter={() => ''}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
