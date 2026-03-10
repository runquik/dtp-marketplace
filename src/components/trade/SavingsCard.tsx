'use client';

import { motion } from 'framer-motion';
import { TradeMatch } from '@/lib/types';
import { computeSavings } from '@/lib/calculator';
import { formatUsd, formatPct, formatLbs } from '@/lib/units';
import { X, TrendingDown, Clock, Star } from 'lucide-react';

interface Props { match: TradeMatch; onClose: () => void; }

function Row({ label, value, plus }: { label: string; value: string; plus?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className={`text-sm font-mono font-semibold ${plus ? 'text-red-500' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}

export default function SavingsCard({ match, onClose }: Props) {
  const savings = computeSavings(
    match.dtpLandedCostPerLb - match.freightQuote.perLbUsd,
    match.freightQuote.perLbUsd,
    match.quantityLbs,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}>

        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-500 px-6 py-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-teal-100 text-sm font-medium">
              <TrendingDown className="w-4 h-4" /> Trade Complete
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-4xl font-bold mb-1">You saved {formatUsd(savings.savingsTotal)}</div>
          <div className="text-teal-100">{formatPct(savings.savingsPct)} below what this trade would cost through a traditional broker</div>
        </div>

        <div className="px-6 py-5">
          <div className="text-slate-500 text-sm mb-4">
            <span className="text-slate-900 font-semibold">{match.offer.productName}</span>
            {' — '}{formatLbs(match.quantityLbs)} · {match.playerSide === 'buy' ? 'Purchased from' : 'Sold to'}{' '}
            {match.offer.city}, {match.offer.state}
          </div>

          {/* Side-by-side */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
              <div className="text-teal-700 text-xs font-bold uppercase tracking-wide mb-3">Via DTP</div>
              <Row label="Unit price" value={`${formatUsd(savings.dtpUnitPrice)}/lb`} />
              <Row label="Freight" value={`${formatUsd(savings.dtpFreight)}/lb`} />
              <div className="flex justify-between pt-2 mt-1">
                <span className="text-slate-700 text-sm font-bold">Landed</span>
                <span className="text-teal-700 font-bold font-mono">{formatUsd(savings.dtpLandedCost)}/lb</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-3">Legacy broker</div>
              <Row label="Unit price" value={`${formatUsd(savings.dtpUnitPrice)}/lb`} />
              <Row label="+8% broker fee" value={`+${formatUsd(savings.legacyBrokerMarkup)}/lb`} plus />
              <Row label="+20% freight markup" value={`+${formatUsd(savings.legacyFreightMarkup)}/lb`} plus />
              <Row label="Net-30 capital" value={`+${formatUsd(savings.legacyPaymentDelay)}/lb`} plus />
              <div className="flex justify-between pt-2 mt-1">
                <span className="text-slate-500 text-sm font-bold">Landed</span>
                <span className="text-slate-400 font-bold font-mono line-through">{formatUsd(savings.legacyLandedCost)}/lb</span>
              </div>
            </div>
          </div>

          {/* Cycle time */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
            <Clock className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <div className="text-slate-900 text-sm font-semibold">18 days faster to settlement</div>
              <div className="text-slate-400 text-xs">DTP settles in &lt;24h vs. net-30 payment terms</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <span className="text-slate-500 text-sm">Points earned</span>
            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xl">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              +{match.pointsEarned}
            </div>
          </div>

          <button onClick={onClose}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm">
            Make Another Trade
          </button>
        </div>
      </motion.div>
    </div>
  );
}
