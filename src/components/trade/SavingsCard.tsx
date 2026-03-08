'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TradeMatch } from '@/lib/types';
import { computeSavings } from '@/lib/calculator';
import { formatUsd, formatPct, formatLbs } from '@/lib/units';
import { X, TrendingDown, Clock } from 'lucide-react';

interface Props {
  match: TradeMatch;
  onClose: () => void;
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-sm font-mono ${highlight ? 'text-white font-semibold' : 'text-slate-300'}`}>
        {value}
      </span>
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
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#1a1d27] rounded-2xl border border-slate-700 w-full max-w-lg overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Header */}
          <div className="bg-green-500/10 border-b border-green-500/20 px-6 py-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <TrendingDown className="w-5 h-5" />
                <span className="font-semibold text-lg">Trade Complete</span>
              </div>
              <div className="text-white text-3xl font-bold">
                You saved {formatUsd(savings.savingsTotal)}
              </div>
              <div className="text-green-400 text-sm mt-0.5">
                {formatPct(savings.savingsPct)} below legacy brokered trade
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-5">
            {/* Product summary */}
            <div className="text-slate-400 text-sm mb-4">
              <span className="text-white font-medium">{match.offer.productName}</span>
              {' — '}{formatLbs(match.quantityLbs)} · {match.playerSide === 'buy' ? 'Purchased' : 'Sold'} from{' '}
              {match.offer.city}, {match.offer.state}
            </div>

            {/* Side-by-side cost breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* DTP column */}
              <div className="bg-[#0f1117] rounded-xl p-4 border border-green-500/20">
                <div className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-3">
                  Via DTP
                </div>
                <Row label="Unit price" value={`${formatUsd(savings.dtpUnitPrice)}/lb`} />
                <Row label="Freight" value={`${formatUsd(savings.dtpFreight)}/lb`} />
                <div className="flex justify-between items-center pt-2 mt-1">
                  <span className="text-slate-300 text-sm font-medium">Landed cost</span>
                  <span className="text-white font-bold font-mono">{formatUsd(savings.dtpLandedCost)}/lb</span>
                </div>
              </div>

              {/* Legacy column */}
              <div className="bg-[#0f1117] rounded-xl p-4 border border-slate-700">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">
                  Legacy brokered
                </div>
                <Row label="Unit price" value={`${formatUsd(savings.dtpUnitPrice)}/lb`} />
                <Row label="Broker fee (+8%)" value={`+${formatUsd(savings.legacyBrokerMarkup)}/lb`} />
                <Row label="Freight markup (+20%)" value={`+${formatUsd(savings.legacyFreightMarkup)}/lb`} />
                <Row label="Net-30 capital cost" value={`+${formatUsd(savings.legacyPaymentDelay)}/lb`} />
                <div className="flex justify-between items-center pt-2 mt-1">
                  <span className="text-slate-400 text-sm font-medium">Landed cost</span>
                  <span className="text-slate-300 font-bold font-mono line-through">{formatUsd(savings.legacyLandedCost)}/lb</span>
                </div>
              </div>
            </div>

            {/* Cycle time banner */}
            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-5">
              <Clock className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="text-white text-sm font-medium">18 days faster settlement</div>
                <div className="text-slate-400 text-xs">DTP settles in &lt;24h vs. net-30 payment terms</div>
              </div>
            </div>

            {/* Points */}
            <div className="flex items-center justify-between text-sm mb-5">
              <span className="text-slate-400">Points earned</span>
              <span className="text-yellow-400 font-bold text-lg">+{match.pointsEarned}</span>
            </div>

            {/* Actions */}
            <button
              onClick={onClose}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-lg transition-colors"
            >
              Make Another Trade
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
