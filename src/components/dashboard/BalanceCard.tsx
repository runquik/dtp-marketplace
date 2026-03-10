'use client';

import { GameState } from '@/lib/types';
import { microToUsd, formatUsd, formatLbs } from '@/lib/units';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props { gameState: GameState }

export default function BalanceCard({ gameState }: Props) {
  const balance = microToUsd(gameState.org.balance);
  const start = 10_000;
  const pnl = balance - start;
  const isPositive = pnl >= 0;
  const inventoryValue = gameState.inventory.reduce((s, i) => s + i.avgCostPerLb * i.quantityLbs, 0);

  const sparkData = [
    { v: start },
    ...[...gameState.matchHistory].reverse().map((m, i, arr) => ({
      v: start + arr.slice(0, i + 1).reduce((s, x) => s + x.balanceDelta / 1_000_000, 0),
    })),
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Balance */}
      <div className="col-span-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-4 text-white shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-teal-100 text-xs font-medium mb-1">Account Balance</div>
            <div className="text-3xl font-bold font-mono">{formatUsd(balance)}</div>
            <div className={`flex items-center gap-1 text-sm mt-0.5 ${isPositive ? 'text-teal-100' : 'text-red-200'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}{formatUsd(pnl)} P&L
            </div>
          </div>
          <div className="text-right">
            <div className="text-teal-100 text-xs font-medium mb-1">Total Saved</div>
            <div className="text-white text-xl font-bold">{formatUsd(gameState.totalSavingsUsd)}</div>
            <div className="text-teal-200 text-xs">vs legacy trade</div>
          </div>
        </div>
        {sparkData.length > 2 && (
          <div className="mt-3">
            <ResponsiveContainer width="100%" height={36}>
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="v" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} dot={false} />
                <Tooltip contentStyle={{ background: '#0f766e', border: 'none', borderRadius: 6, fontSize: 11, color: '#fff' }}
                  formatter={(v) => [typeof v === 'number' ? formatUsd(v) : String(v), 'Balance']}
                  labelFormatter={() => ''} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Inventory + Score */}
      <div className="flex flex-col gap-3">
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex-1">
          <div className="text-slate-400 text-xs font-medium mb-1">Inventory Value</div>
          <div className="text-slate-900 text-lg font-bold">{formatUsd(inventoryValue)}</div>
          <div className="text-slate-400 text-xs">{gameState.inventory.length} SKUs</div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 shadow-sm flex-1">
          <div className="text-amber-600 text-xs font-medium mb-1">Score</div>
          <div className="text-amber-700 text-lg font-bold">{gameState.score.toLocaleString()}</div>
          <div className="text-amber-500 text-xs">{gameState.streak}x streak</div>
        </div>
      </div>
    </div>
  );
}
