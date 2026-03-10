'use client';

import { FOOD_CATEGORIES } from '@/lib/types';

interface Props {
  selected: string[];
  setSelected: (s: string[]) => void;
  onNext: () => void;
}

export default function Step3Categories({ selected, setSelected, onNext }: Props) {
  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
      <div className="text-3xl mb-2">🛒</div>
      <h2 className="text-slate-900 text-2xl font-bold mb-1">Your categories</h2>
      <p className="text-slate-500 text-sm mb-5">
        Which product categories do you work in? Filters your default orderbook view. You can skip and see everything.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {FOOD_CATEGORIES.map(cat => {
          const active = selected.includes(cat.id);
          return (
            <button key={cat.id} onClick={() => toggle(cat.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                active ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
              }`}>
              <span className="text-lg">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
      <button onClick={onNext}
        className="mt-5 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm">
        {selected.length > 0 ? 'Continue →' : 'Skip — show everything →'}
      </button>
    </div>
  );
}
