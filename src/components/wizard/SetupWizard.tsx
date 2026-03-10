'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerOrg, BusinessType, EntityType, Certification } from '@/lib/types';
import Step1Name from './Step1Name';
import StepLegal from './StepLegal';
import Step2BusinessType from './Step2BusinessType';
import Step3Categories from './Step3Categories';
import StepCerts from './StepCerts';
import Step4Ready from './Step4Ready';

interface Props {
  onComplete: (org: Omit<PlayerOrg, 'id' | 'balance' | 'createdAt'>) => void;
}

export default function SetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  // Step 0: basic org info
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Step 1: legal identity
  const [legalName, setLegalName] = useState('');
  const [dba, setDba] = useState('');
  const [entityType, setEntityType] = useState<EntityType>('llc');
  const [stateOfInc, setStateOfInc] = useState('');
  const [ein, setEin] = useState('');
  const [nearAccountId, setNearAccountId] = useState('');
  const [einVerified, setEinVerified] = useState(false);
  const [nearVerified, setNearVerified] = useState(false);

  // Step 2: business type
  const [businessType, setBusinessType] = useState<BusinessType>('distributor');

  // Step 3: categories
  const [categories, setCategories] = useState<string[]>([]);

  // Step 4: certifications
  const [certifications, setCertifications] = useState<Certification[]>([]);

  const next = () => setStep(s => s + 1);

  // After legalName is set, pre-fill display name if not set yet
  const handleLegalNext = () => {
    if (!name.trim()) setName(dba.trim() || legalName.trim());
    next();
  };

  const STEP_LABELS = ['Your org', 'Legal identity', 'Business type', 'Categories', 'Certifications', 'Ready'];

  const steps = [
    <Step1Name key="name"
      name={name} city={city} state={state} zip={zip}
      setName={setName} setCity={setCity} setState={setState} setZip={setZip}
      onNext={next}
    />,
    <StepLegal key="legal"
      legalName={legalName} setLegalName={setLegalName}
      dba={dba} setDba={setDba}
      entityType={entityType} setEntityType={setEntityType}
      stateOfInc={stateOfInc} setStateOfInc={setStateOfInc}
      ein={ein} setEin={setEin}
      nearAccountId={nearAccountId} setNearAccountId={setNearAccountId}
      einVerified={einVerified} setEinVerified={setEinVerified}
      nearVerified={nearVerified} setNearVerified={setNearVerified}
      onNext={handleLegalNext}
    />,
    <Step2BusinessType key="biztype"
      businessType={businessType} setBusinessType={setBusinessType}
      onNext={next}
    />,
    <Step3Categories key="cats"
      selected={categories} setSelected={setCategories}
      onNext={next}
    />,
    <StepCerts key="certs"
      certifications={certifications} setCertifications={setCertifications}
      onNext={next}
    />,
    <Step4Ready key="ready"
      name={name || legalName} businessType={businessType} categories={categories}
      onLaunch={() => onComplete({
        legalName: legalName || name,
        dba: dba || undefined,
        name: name || dba || legalName,
        entityType,
        stateOfIncorporation: stateOfInc || state,
        einLast4: ein.replace(/\D/g, '').slice(-4) || '****',
        businessType,
        city, state, zip, categories,
        verifiedEntity: einVerified,
        verifiedAt: einVerified ? Date.now() : undefined,
        certifications,
        tradeCount: 0,
        disputeCount: 0,
        totalVolumeUsdMicro: 0,
        maxTradeCapMicro: 5_000_000_000, // $5k first trade cap
        nearAccountId: nearVerified ? nearAccountId : undefined,
      })}
    />,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4 py-12">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-100 mb-4">
          <span className="text-2xl">🥬</span>
          <span className="text-xl font-bold text-slate-900">DTP <span className="text-teal-600">Marketplace</span></span>
        </div>
        <p className="text-slate-500 text-sm">Direct Trade Protocol — Food & Ag B2B</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-8 flex-wrap justify-center">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === step ? 'bg-teal-500 text-white shadow-sm' :
              i < step  ? 'bg-teal-100 text-teal-700' :
                          'bg-slate-100 text-slate-400'
            }`}>
              <span>{i < step ? '✓' : i + 1}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-4 h-0.5 mx-0.5 rounded ${i < step ? 'bg-teal-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
