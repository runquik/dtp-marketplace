'use client';

import { useState } from 'react';
import { EntityType, ENTITY_TYPES } from '@/lib/types';
import { CheckCircle, XCircle, Loader2, Wallet } from 'lucide-react';

interface Props {
  legalName: string;    setLegalName: (v: string) => void;
  dba: string;          setDba: (v: string) => void;
  entityType: EntityType; setEntityType: (v: EntityType) => void;
  stateOfInc: string;   setStateOfInc: (v: string) => void;
  ein: string;          setEin: (v: string) => void;
  nearAccountId: string; setNearAccountId: (v: string) => void;
  einVerified: boolean; setEinVerified: (v: boolean) => void;
  nearVerified: boolean; setNearVerified: (v: boolean) => void;
  onNext: () => void;
}

type VerifyState = 'idle' | 'checking' | 'ok' | 'error';

function formatEin(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}-${d.slice(2)}`;
}

export default function StepLegal({
  legalName, setLegalName, dba, setDba,
  entityType, setEntityType, stateOfInc, setStateOfInc,
  ein, setEin, nearAccountId, setNearAccountId,
  einVerified, setEinVerified, nearVerified, setNearVerified,
  onNext,
}: Props) {
  const [einState, setEinState] = useState<VerifyState>('idle');
  const [einError, setEinError] = useState('');
  const [nearState, setNearState] = useState<VerifyState>('idle');
  const [nearError, setNearError] = useState('');

  const einDigits = ein.replace(/\D/g, '');
  const canVerifyEin = einDigits.length === 9 && legalName.trim().length >= 2 && stateOfInc.trim().length === 2;
  const canProceed = legalName.trim().length >= 2 && stateOfInc.trim().length === 2 && einVerified;

  async function verifyEin() {
    setEinState('checking'); setEinError(''); setEinVerified(false);
    try {
      const res = await fetch('/api/verify/ein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ein: einDigits, legalName: legalName.trim(), state: stateOfInc }),
      });
      const data = await res.json() as { valid: boolean; verifiedEntity: boolean; error?: string };
      if (data.valid && data.verifiedEntity) {
        setEinState('ok'); setEinVerified(true);
      } else {
        setEinState('error'); setEinError(data.error ?? 'Verification failed. Check your EIN and legal name.');
      }
    } catch {
      setEinState('error'); setEinError('Could not reach verification service. Try again.');
    }
  }

  async function verifyNear() {
    if (!nearAccountId.trim()) return;
    setNearState('checking'); setNearError(''); setNearVerified(false);
    try {
      const res = await fetch('/api/verify/near-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: nearAccountId.trim().toLowerCase() }),
      });
      const data = await res.json() as { valid: boolean; error?: string; network?: string };
      if (data.valid) {
        setNearState('ok'); setNearVerified(true);
      } else {
        setNearState('error'); setNearError(data.error ?? 'Account not found.');
      }
    } catch {
      setNearState('error'); setNearError('Could not reach NEAR RPC. Try again.');
    }
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-5">
      <div>
        <div className="text-3xl mb-2">🏛️</div>
        <h2 className="text-slate-900 text-2xl font-bold mb-1">Legal identity</h2>
        <p className="text-slate-500 text-sm">
          This information is used to verify your business and build trust with counterparties.
          Your EIN is never stored in plaintext.
        </p>
      </div>

      {/* Legal name + DBA */}
      <div className="space-y-3">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">Legal entity name <span className="text-red-400">*</span></label>
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            placeholder="e.g. Cascade Fresh Foods LLC"
            value={legalName} onChange={e => { setLegalName(e.target.value); setEinVerified(false); setEinState('idle'); }}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">DBA / trade name <span className="text-slate-400 font-normal">(optional)</span></label>
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            placeholder="Shown on listings if different from legal name"
            value={dba} onChange={e => setDba(e.target.value)}
          />
        </div>
      </div>

      {/* Entity type + state of inc */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">Entity type <span className="text-red-400">*</span></label>
          <select
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 transition bg-white"
            value={entityType} onChange={e => setEntityType(e.target.value as EntityType)}
          >
            {ENTITY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">State of formation <span className="text-red-400">*</span></label>
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition uppercase"
            placeholder="OR"
            maxLength={2}
            value={stateOfInc}
            onChange={e => { setStateOfInc(e.target.value.toUpperCase()); setEinVerified(false); setEinState('idle'); }}
          />
        </div>
      </div>

      {/* EIN */}
      <div>
        <label className="block text-slate-700 text-sm font-medium mb-1">
          Employer Identification Number (EIN) <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition font-mono"
            placeholder="XX-XXXXXXX"
            value={ein}
            onChange={e => { setEin(formatEin(e.target.value)); setEinVerified(false); setEinState('idle'); }}
          />
          <button
            onClick={verifyEin}
            disabled={!canVerifyEin || einState === 'checking'}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm flex items-center gap-1.5 transition"
          >
            {einState === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
          </button>
        </div>
        <p className="text-slate-400 text-xs mt-1">Your EIN is hashed — the raw number is never stored.</p>
        {einState === 'ok' && (
          <div className="mt-2 flex items-center gap-1.5 text-green-700 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" /> Business verified
          </div>
        )}
        {einState === 'error' && (
          <div className="mt-2 flex items-center gap-1.5 text-red-600 text-sm">
            <XCircle className="w-4 h-4" /> {einError}
          </div>
        )}
      </div>

      {/* NEAR wallet */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700 text-sm font-medium">NEAR wallet <span className="text-slate-400 font-normal">(optional for now — required for on-chain settlement)</span></span>
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition font-mono text-sm"
            placeholder="yourname.near or yourname.testnet"
            value={nearAccountId}
            onChange={e => { setNearAccountId(e.target.value.toLowerCase()); setNearVerified(false); setNearState('idle'); }}
          />
          <button
            onClick={verifyNear}
            disabled={!nearAccountId.trim() || nearState === 'checking'}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 rounded-xl font-medium text-sm flex items-center gap-1.5 transition"
          >
            {nearState === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
          </button>
        </div>
        {nearState === 'ok' && (
          <div className="mt-2 flex items-center gap-1.5 text-green-700 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" /> Account found on-chain
          </div>
        )}
        {nearState === 'error' && (
          <div className="mt-2 flex items-center gap-1.5 text-red-600 text-sm">
            <XCircle className="w-4 h-4" /> {nearError}
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
      >
        Continue →
      </button>
    </div>
  );
}
