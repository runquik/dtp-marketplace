'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerOrg, BusinessType, FOOD_CATEGORIES } from '@/lib/types';
import Step1Name from './Step1Name';
import Step2BusinessType from './Step2BusinessType';
import Step3Categories from './Step3Categories';
import Step4Ready from './Step4Ready';

interface Props {
  onComplete: (org: Omit<PlayerOrg, 'id' | 'balance' | 'createdAt'>) => void;
}

export default function SetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('distributor');
  const [categories, setCategories] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const next = () => setStep(s => s + 1);

  const steps = [
    <Step1Name key="1" name={name} city={city} state={state} zip={zip}
      setName={setName} setCity={setCity} setState={setState} setZip={setZip} onNext={next} />,
    <Step2BusinessType key="2" businessType={businessType} setBusinessType={setBusinessType} onNext={next} />,
    <Step3Categories key="3" selected={categories} setSelected={setCategories} onNext={next} />,
    <Step4Ready key="4" name={name} businessType={businessType} categories={categories}
      onLaunch={() => onComplete({ name, businessType, city, state, zip, categories })} />,
  ];

  const STEP_LABELS = ['Your org', 'Business type', 'Categories', 'Ready'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4 py-12">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-100 mb-4">
          <span className="text-2xl">🥬</span>
          <span className="text-xl font-bold text-slate-900">DTP <span className="text-teal-600">Marketplace</span></span>
        </div>
        <p className="text-slate-500 text-sm">Direct Trade Protocol — Food Commodity Simulation</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-8">
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
              <div className={`w-6 h-0.5 mx-0.5 rounded ${i < step ? 'bg-teal-300' : 'bg-slate-200'}`} />
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
