'use client';

import { GameState, TRADE_CAP_LEVELS } from '@/lib/types';
import { microToUsd, formatUsd } from '@/lib/units';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, ShieldCheck, Shield } from 'lucide-react';

interface Props { gameState: GameState }

export default function BalanceCard({ gameState }: Props) {
  const balance = microToUsd(gameState.org.balance);
  const start = 10_000;
  const pnl = balance - start;
  const isPositive = pnl >= 0;
  const inventoryValue = gameState.inventory.reduce((s, i) => s + i.avgCostPerLb * i.quantityLbs, 0);

  const tradeCount = gameState.org.tradeCount ?? 0;
  const capMicro = gameState.org.maxTradeCapMicro ?? 5_000_000_000;
  const capUsd = capMicro / 1_000_000;
  const nextLevel = TRADE_CAP_LEVELS.find(l => l.minTrades > tradeCount);
  const isVerified = gameState.org.verifiedEntity;

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

      {/* Inventory + Trust */}
      <div className="flex flex-col gap-3">
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex-1">
          <div className="text-slate-400 text-xs font-medium mb-1">Inventory Value</div>
          <div className="text-slate-900 text-lg font-bold">{formatUsd(inventoryValue)}</div>
          <div className="text-slate-400 text-xs">{gameState.inventory.length} SKUs</div>
        </div>
        <div className={`rounded-2xl p-3 border shadow-sm flex-1 ${isVerified ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className={`text-xs font-medium mb-1 flex items-center gap-1 ${isVerified ? 'text-green-600' : 'text-slate-400'}`}>
            {isVerified ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
            Trade Cap
          </div>
          <div className={`text-lg font-bold ${isVerified ? 'text-green-700' : 'text-slate-700'}`}>
            {capMicro >= Number.MAX_SAFE_INTEGER ? 'Unlimited' : `$${(capUsd / 1000).toFixed(0)}k`}
          </div>
          <div className={`text-xs ${isVerified ? 'text-green-500' : 'text-slate-400'}`}>
            {tradeCount} trade{tradeCount !== 1 ? 's' : ''} · {nextLevel ? `$${(nextLevel.capMicro / 1_000_000_000).toFixed(0)}k after ${nextLevel.minTrades}` : 'max level'}
          </div>
        </div>
      </div>
    </div>
  );
}
