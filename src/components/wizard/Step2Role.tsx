'use client';

import { Role } from '@/lib/types';

interface Props {
  role: Role;
  setRole: (r: Role) => void;
  onNext: () => void;
}

const ROLES: { id: Role; label: string; description: string }[] = [
  { id: 'buyer', label: 'Buyer', description: 'You purchase goods from producers and distributors.' },
  { id: 'seller', label: 'Seller', description: 'You grow, manufacture, or distribute goods for sale.' },
  { id: 'both', label: 'Both', description: 'You buy and sell — a distributor or co-op.' },
];

export default function Step2Role({ role, setRole, onNext }: Props) {
  return (
    <div className="bg-[#1a1d27] rounded-2xl p-8 border border-slate-700">
      <h2 className="text-white text-2xl font-semibold mb-2">Your role</h2>
      <p className="text-slate-400 text-sm mb-6">How do you primarily participate in the market?</p>

      <div className="space-y-3">
        {ROLES.map(r => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
              role === r.id
                ? 'border-green-400 bg-green-400/10 text-white'
                : 'border-slate-600 bg-[#0f1117] text-slate-300 hover:border-slate-400'
            }`}
          >
            <div className="font-semibold">{r.label}</div>
            <div className="text-sm text-slate-400 mt-0.5">{r.description}</div>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-lg transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}
