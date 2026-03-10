'use client';

import { BusinessType, BUSINESS_TYPES } from '@/lib/types';

interface Props {
  businessType: BusinessType;
  setBusinessType: (t: BusinessType) => void;
  onNext: () => void;
}

export default function Step2BusinessType({ businessType, setBusinessType, onNext }: Props) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
      <div className="text-3xl mb-2">🏷️</div>
      <h2 className="text-slate-900 text-2xl font-bold mb-1">Your main business</h2>
      <p className="text-slate-500 text-sm mb-1">
        What best describes your primary role? <strong>Everyone can buy and sell</strong> — this just sets your profile.
      </p>
      <div className="grid grid-cols-2 gap-2 mt-5">
        {BUSINESS_TYPES.map(bt => (
          <button key={bt.id} onClick={() => setBusinessType(bt.id)}
            className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
              businessType === bt.id
                ? 'border-teal-400 bg-teal-50'
                : 'border-slate-100 bg-slate-50 hover:border-slate-200'
            }`}>
            <div className="text-2xl mb-1">{bt.emoji}</div>
            <div className={`font-semibold text-sm ${businessType === bt.id ? 'text-teal-700' : 'text-slate-800'}`}>{bt.label}</div>
            <div className="text-slate-400 text-xs mt-0.5 leading-tight">{bt.description}</div>
          </button>
        ))}
      </div>
      <button onClick={onNext}
        className="mt-5 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm">
        Continue →
      </button>
    </div>
  );
}
