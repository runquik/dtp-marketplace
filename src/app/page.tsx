'use client';

import { useEffect, useState } from 'react';
import { PlayerOrg, MarketOffer, FreightQuote } from '@/lib/types';
import { useGameState } from '@/hooks/useGameState';
import SetupWizard from '@/components/wizard/SetupWizard';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  const { state, loaded, createOrg, executeTrade, resetGame } = useGameState();
  const [mounted, setMounted] = useState(false);

  // Avoid SSR/hydration mismatch with localStorage
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !loaded) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading…</div>
      </div>
    );
  }

  if (!state) {
    return (
      <SetupWizard
        onComplete={(partial) => createOrg(partial)}
      />
    );
  }

  const handleTrade = (offer: MarketOffer, quote: FreightQuote, side: 'buy' | 'sell', qty: number) => {
    executeTrade(offer, quote, side, qty);
  };

  return (
    <Dashboard
      gameState={state}
      onExecuteTrade={handleTrade}
      onReset={resetGame}
    />
  );
}
