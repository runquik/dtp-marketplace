'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerOrg, Role, FOOD_CATEGORIES } from '@/lib/types';
import Step1Name from './Step1Name';
import Step2Role from './Step2Role';
import Step3Categories from './Step3Categories';
import Step4Ready from './Step4Ready';

interface Props {
  onComplete: (org: Omit<PlayerOrg, 'id' | 'balance' | 'createdAt'>) => void;
}

export default function SetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('both');
  const [categories, setCategories] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const next = () => setStep(s => s + 1);

  const handleLaunch = () => {
    onComplete({ name, role, city, state, zip, categories });
  };

  const steps = [
    <Step1Name key="1" name={name} city={city} state={state} zip={zip}
      setName={setName} setCity={setCity} setState={setState} setZip={setZip}
      onNext={next} />,
    <Step2Role key="2" role={role} setRole={setRole} onNext={next} />,
    <Step3Categories key="3" selected={categories} setSelected={setCategories} onNext={next} />,
    <Step4Ready key="4" name={name} role={role} categories={categories} onLaunch={handleLaunch} />,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1117] px-4">
      {/* Logo / title */}
      <div className="mb-10 text-center">
        <div className="text-3xl font-bold text-white tracking-tight">
          DTP <span className="text-green-400">Marketplace</span>
        </div>
        <p className="text-slate-400 text-sm mt-1">Direct Trade Protocol — Simulation</p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-8 rounded-full transition-colors ${
              i <= step ? 'bg-green-400' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
