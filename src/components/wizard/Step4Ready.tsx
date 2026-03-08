'use client';

import { Role } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

interface Props {
  name: string;
  role: Role;
  categories: string[];
  onLaunch: () => void;
}

export default function Step4Ready({ name, role, categories, onLaunch }: Props) {
  return (
    <div className="bg-[#1a1d27] rounded-2xl p-8 border border-slate-700 text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle className="text-green-400 w-14 h-14" />
      </div>

      <h2 className="text-white text-2xl font-semibold mb-2">You&apos;re ready</h2>
      <p className="text-slate-400 text-sm mb-6">
        <span className="text-white font-medium">{name}</span> is set up as a{' '}
        <span className="text-green-400">{role}</span>.
        {categories.length > 0 && (
          <> Your orderbook will show {categories.join(', ')} trades.</>
        )}
      </p>

      <div className="bg-[#0f1117] rounded-xl p-4 mb-6 border border-slate-700">
        <div className="text-4xl font-bold text-white mb-1">$10,000</div>
        <div className="text-slate-400 text-sm">starting play money</div>
        <div className="text-slate-500 text-xs mt-2">
          No real money. No real contracts. Just the protocol in action.
        </div>
      </div>

      <div className="text-left space-y-2 mb-6 text-sm text-slate-400">
        <div className="flex items-center gap-2"><span className="text-green-400">✓</span> Browse a live orderbook of 200 food trade offers</div>
        <div className="flex items-center gap-2"><span className="text-green-400">✓</span> Get real freight quotes (actual road distances)</div>
        <div className="flex items-center gap-2"><span className="text-green-400">✓</span> Run matches and see exactly what you save vs legacy brokered trade</div>
        <div className="flex items-center gap-2"><span className="text-green-400">✓</span> Your account and history persist across sessions</div>
      </div>

      <button
        onClick={onLaunch}
        className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3.5 rounded-lg text-lg transition-colors"
      >
        Enter the Market
      </button>
    </div>
  );
}
