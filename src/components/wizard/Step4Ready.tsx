'use client';

import { BusinessType, BUSINESS_TYPES, FOOD_CATEGORIES } from '@/lib/types';

interface Props { name: string; businessType: BusinessType; categories: string[]; onLaunch: () => void; }

export default function Step4Ready({ name, businessType, categories, onLaunch }: Props) {
  const bt = BUSINESS_TYPES.find(b => b.id === businessType);
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
      <div className="text-5xl mb-3">🎉</div>
      <h2 className="text-slate-900 text-2xl font-bold mb-1">You&apos;re ready to trade</h2>
      <p className="text-slate-500 text-sm mb-5">
        <strong>{name}</strong> · {bt?.emoji} {bt?.label}
      </p>

      <div className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl p-5 mb-5 text-white">
        <div className="text-5xl font-bold mb-1">$10,000</div>
        <div className="text-teal-100 text-sm">starting play money</div>
        <div className="text-teal-200 text-xs mt-1">No real money. No real contracts.</div>
      </div>

      <div className="text-left space-y-2 mb-5 text-sm">
        {[
          ['🗂️', 'Browse a live orderbook of food commodity offers'],
          ['🚚', 'Get real freight quotes (actual road distances via OSRM)'],
          ['🏭', 'Manufacture raw materials into value-added finished goods'],
          ['💰', 'See exactly what you save vs legacy brokered trade'],
          ['💾', 'Your account persists across sessions'],
        ].map(([e, t]) => (
          <div key={t} className="flex items-start gap-2 text-slate-600">
            <span className="text-base">{e}</span><span>{t}</span>
          </div>
        ))}
      </div>

      <button onClick={onLaunch}
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-md hover:shadow-lg">
        Enter the Market →
      </button>
    </div>
  );
}
