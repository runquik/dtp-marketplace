'use client';

interface Props {
  name: string; city: string; state: string; zip: string;
  setName: (v: string) => void; setCity: (v: string) => void;
  setState: (v: string) => void; setZip: (v: string) => void;
  onNext: () => void;
}

export default function Step1Name({ name, city, state, zip, setName, setCity, setState, setZip, onNext }: Props) {
  const valid = name.trim().length >= 2 && zip.trim().length === 5;
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
      <div className="text-3xl mb-2">🏢</div>
      <h2 className="text-slate-900 text-2xl font-bold mb-1">Your organization</h2>
      <p className="text-slate-500 text-sm mb-6">
        Set up your mock trading account. No real money — just the protocol in action.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">Organization name</label>
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
            placeholder="e.g. Cascade Fresh Foods"
            value={name} onChange={e => setName(e.target.value)} autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">City</label>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              placeholder="Portland" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">State</label>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              placeholder="OR" maxLength={2} value={state} onChange={e => setState(e.target.value.toUpperCase())} />
          </div>
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">ZIP code</label>
          <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            placeholder="97201" maxLength={5} value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, ''))} />
          <p className="text-slate-400 text-xs mt-1">Used for real freight distance calculations.</p>
        </div>
      </div>
      <button onClick={onNext} disabled={!valid}
        className="mt-6 w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-sm">
        Continue →
      </button>
    </div>
  );
}
