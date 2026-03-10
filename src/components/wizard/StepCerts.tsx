'use client';

import { useState } from 'react';
import { Certification, CertType, CERT_TYPES } from '@/lib/types';
import { CheckCircle, XCircle, Loader2, Plus, Trash2, ShieldCheck, Shield } from 'lucide-react';

interface Props {
  certifications: Certification[];
  setCertifications: (c: Certification[]) => void;
  onNext: () => void;
}

interface DraftCert {
  type: CertType;
  certNumber: string;
  issuingBody: string;
  expiresAt: string;  // date string yyyy-mm-dd
}

type VerifyState = 'idle' | 'checking' | 'ok' | 'error';

const CERT_EMOJI: Record<CertType, string> = {
  usda_organic: '🌿', fda_facility: '🏭', sqf: '🏆',
  brc: '🏅', gap: '🌱', non_gmo: '🚫', kosher: '✡️', halal: '☪️', fsma: '📋',
};

export default function StepCerts({ certifications, setCertifications, onNext }: Props) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<DraftCert>({
    type: 'usda_organic', certNumber: '', issuingBody: '', expiresAt: '',
  });
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [verifyResult, setVerifyResult] = useState<{ verifiedByDtp: boolean; note?: string } | null>(null);
  const [verifyError, setVerifyError] = useState('');

  const selectedCertMeta = CERT_TYPES.find(c => c.id === draft.type)!;
  const canVerify = draft.certNumber.trim().length >= 3;
  const canAdd = canVerify && draft.expiresAt && verifyState === 'ok';

  async function verifyCert() {
    setVerifyState('checking'); setVerifyResult(null); setVerifyError('');
    try {
      const res = await fetch('/api/verify/cert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certType: draft.type,
          certNumber: draft.certNumber.trim(),
          issuingBody: draft.issuingBody.trim(),
        }),
      });
      const data = await res.json() as {
        valid: boolean; verifiedByDtp: boolean; note?: string;
        operationName?: string; certifyingAgent?: string; error?: string;
      };
      if (data.valid) {
        setVerifyState('ok');
        setVerifyResult({ verifiedByDtp: data.verifiedByDtp, note: data.note ?? data.operationName });
        if (data.certifyingAgent && !draft.issuingBody) {
          setDraft(d => ({ ...d, issuingBody: data.certifyingAgent! }));
        }
      } else {
        setVerifyState('error');
        setVerifyError(data.error ?? 'Certification not found or invalid.');
      }
    } catch {
      setVerifyState('error'); setVerifyError('Could not reach verification service.');
    }
  }

  function addCert() {
    if (!canAdd) return;
    const cert: Certification = {
      id: `cert-${Date.now()}`,
      type: draft.type,
      certNumber: draft.certNumber.trim(),
      issuingBody: draft.issuingBody.trim() || selectedCertMeta.label,
      expiresAt: new Date(draft.expiresAt).getTime(),
      verifiedByDtp: verifyResult?.verifiedByDtp ?? false,
      verifiedAt: Date.now(),
    };
    setCertifications([...certifications, cert]);
    setAdding(false);
    setDraft({ type: 'usda_organic', certNumber: '', issuingBody: '', expiresAt: '' });
    setVerifyState('idle'); setVerifyResult(null);
  }

  function removeCert(id: string) {
    setCertifications(certifications.filter(c => c.id !== id));
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
      <div className="text-3xl mb-2">📜</div>
      <h2 className="text-slate-900 text-2xl font-bold mb-1">Certifications</h2>
      <p className="text-slate-500 text-sm mb-6">
        Add your organic, food safety, or other certifications. These are displayed to counterparties before they commit to a trade.
        USDA Organic and FDA numbers are auto-verified. All others are self-attested and expire-tracked.
      </p>

      {/* Existing certs */}
      {certifications.length > 0 && (
        <div className="space-y-2 mb-4">
          {certifications.map(cert => {
            const meta = CERT_TYPES.find(c => c.id === cert.type);
            const expDate = new Date(cert.expiresAt);
            const isExpired = cert.expiresAt < Date.now();
            const expiringSoon = !isExpired && cert.expiresAt < Date.now() + 60 * 24 * 60 * 60 * 1000;
            return (
              <div key={cert.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">{CERT_EMOJI[cert.type]}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 font-medium text-sm">{meta?.label ?? cert.type}</span>
                      {cert.verifiedByDtp
                        ? <span className="flex items-center gap-0.5 text-green-600 text-xs font-medium"><ShieldCheck className="w-3 h-3" /> DTP Verified</span>
                        : <span className="flex items-center gap-0.5 text-slate-400 text-xs"><Shield className="w-3 h-3" /> Self-attested</span>
                      }
                    </div>
                    <div className="text-slate-400 text-xs font-mono">{cert.certNumber}</div>
                    <div className={`text-xs ${isExpired ? 'text-red-500' : expiringSoon ? 'text-amber-500' : 'text-slate-400'}`}>
                      {isExpired ? 'EXPIRED' : expiringSoon ? 'Expiring soon' : 'Expires'} {expDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button onClick={() => removeCert(cert.id)} className="text-slate-300 hover:text-red-400 transition ml-3">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add cert form */}
      {adding ? (
        <div className="border border-slate-200 rounded-xl p-4 space-y-3 mb-4">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">Certification type</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white transition"
              value={draft.type}
              onChange={e => { setDraft({ ...draft, type: e.target.value as CertType, certNumber: '', issuingBody: '' }); setVerifyState('idle'); setVerifyResult(null); }}
            >
              {CERT_TYPES.map(c => <option key={c.id} value={c.id}>{CERT_EMOJI[c.id]} {c.label}</option>)}
            </select>
            <p className="text-slate-400 text-xs mt-1">{selectedCertMeta.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1">Certificate number</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-sm font-mono"
                  placeholder={selectedCertMeta.placeholder}
                  value={draft.certNumber}
                  onChange={e => { setDraft({ ...draft, certNumber: e.target.value }); setVerifyState('idle'); setVerifyResult(null); }}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1">Expiration date</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-sm"
                value={draft.expiresAt}
                onChange={e => setDraft({ ...draft, expiresAt: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">Issuing body <span className="text-slate-400 font-normal">(auto-filled for USDA)</span></label>
            <input
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition text-sm"
              placeholder="e.g. Oregon Tilth, SCS Global Services"
              value={draft.issuingBody}
              onChange={e => setDraft({ ...draft, issuingBody: e.target.value })}
            />
          </div>

          {/* Verify */}
          <button
            onClick={verifyCert}
            disabled={!canVerify || verifyState === 'checking'}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition"
          >
            {verifyState === 'checking' ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : 'Verify Certification'}
          </button>

          {verifyState === 'ok' && (
            <div className="flex items-start gap-2 text-green-700 text-sm bg-green-50 rounded-xl px-3 py-2 border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <div>
                {verifyResult?.verifiedByDtp ? 'DTP verified ✓' : 'Accepted (self-attested)'}
                {verifyResult?.note && <div className="text-xs text-green-600 mt-0.5">{verifyResult.note}</div>}
              </div>
            </div>
          )}
          {verifyState === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2 border border-red-100">
              <XCircle className="w-4 h-4 shrink-0" /> {verifyError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setAdding(false); setVerifyState('idle'); setVerifyResult(null); }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={addCert}
              disabled={!canAdd}
              className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition"
            >
              Add Certification
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-400 hover:text-teal-600 py-3 rounded-xl text-sm font-medium transition mb-4"
        >
          <Plus className="w-4 h-4" /> Add a certification
        </button>
      )}

      <button
        onClick={onNext}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
      >
        {certifications.length === 0 ? 'Skip for now →' : `Continue with ${certifications.length} cert${certifications.length !== 1 ? 's' : ''} →`}
      </button>
    </div>
  );
}
