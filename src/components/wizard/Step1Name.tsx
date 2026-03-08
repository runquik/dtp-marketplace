'use client';

interface Props {
  name: string; city: string; state: string; zip: string;
  setName: (v: string) => void;
  setCity: (v: string) => void;
  setState: (v: string) => void;
  setZip: (v: string) => void;
  onNext: () => void;
}

export default function Step1Name({ name, city, state, zip, setName, setCity, setState, setZip, onNext }: Props) {
  const valid = name.trim().length >= 2 && zip.trim().length === 5;

  return (
    <div className="bg-[#1a1d27] rounded-2xl p-8 border border-slate-700">
      <h2 className="text-white text-2xl font-semibold mb-2">Your organization</h2>
      <p className="text-slate-400 text-sm mb-6">
        This is your mock trading account. No real money, no real contracts — just the protocol in action.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm mb-1">Organization name</label>
          <input
            className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-400 transition-colors"
            placeholder="e.g. Cascade Fresh Foods"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 text-sm mb-1">City</label>
            <input
              className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-400 transition-colors"
              placeholder="Portland"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1">State</label>
            <input
              className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-400 transition-colors"
              placeholder="OR"
              maxLength={2}
              value={state}
              onChange={e => setState(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-1">ZIP code</label>
          <input
            className="w-full bg-[#0f1117] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-400 transition-colors"
            placeholder="97201"
            maxLength={5}
            value={zip}
            onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
          />
          <p className="text-slate-500 text-xs mt-1">Used for real freight distance calculations.</p>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!valid}
        className="mt-6 w-full bg-green-500 hover:bg-green-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}
