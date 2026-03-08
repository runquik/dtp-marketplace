'use client';

import { FOOD_CATEGORIES } from '@/lib/types';

interface Props {
  selected: string[];
  setSelected: (s: string[]) => void;
  onNext: () => void;
}

export default function Step3Categories({ selected, setSelected, onNext }: Props) {
  const toggle = (id: string) => {
    setSelected(
      selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id],
    );
  };

  return (
    <div className="bg-[#1a1d27] rounded-2xl p-8 border border-slate-700">
      <h2 className="text-white text-2xl font-semibold mb-2">Your categories</h2>
      <p className="text-slate-400 text-sm mb-6">
        Which product categories do you work in? This filters your orderbook view.
        You can skip this for now.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {FOOD_CATEGORIES.map(cat => {
          const active = selected.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggle(cat.id)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                active
                  ? 'border-green-400 bg-green-400/10 text-green-300'
                  : 'border-slate-600 bg-[#0f1117] text-slate-300 hover:border-slate-400'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-lg transition-colors"
      >
        {selected.length > 0 ? 'Continue →' : 'Skip for now →'}
      </button>
    </div>
  );
}
