export const LB_PER_KG = 2.20462;
export const lbToKg = (lb: number) => lb / LB_PER_KG;
export const kgToLb = (kg: number) => kg * LB_PER_KG;

export const microToUsd = (micro: number) => micro / 1_000_000;
export const usdToMicro = (usd: number) => Math.round(usd * 1_000_000);

export const formatUsd = (usd: number) =>
  '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatMicro = (micro: number) => formatUsd(microToUsd(micro));

export const formatLbs = (lbs: number) =>
  lbs.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' lbs';

export const formatPct = (pct: number) =>
  pct.toFixed(1) + '%';
