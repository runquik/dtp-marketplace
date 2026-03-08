export interface SavingsBreakdown {
  // DTP side
  dtpUnitPrice: number;       // USD/lb
  dtpFreight: number;         // USD/lb
  dtpLandedCost: number;      // USD/lb total

  // Legacy side — line-item markups
  legacyBrokerMarkup: number;   // +8% on unit price
  legacyFreightMarkup: number;  // +20% on freight cost
  legacyPaymentDelay: number;   // cost of net-30 capital (~7% APR × 30 days = 1.93%)
  legacyLandedCost: number;     // USD/lb total

  // Summary
  savingsPerLb: number;
  savingsPct: number;        // 0–100
  savingsTotal: number;      // USD for full quantity
  cycleTimeSavedDays: number; // 18 days: immediate DTP settlement vs net-30
}

/**
 * Compute DTP savings vs the traditional broker-mediated equivalent.
 *
 * Legacy assumptions (publicly documented industry norms):
 *   - Food brokers: 5–10% commission on unit price (we use 8%)
 *   - 3PL freight markups: 15–25% on freight cost (we use 20%)
 *   - Net-30 payment terms: cost of capital at 7% APR for 30 days ≈ 1.93%
 *   - Cycle time: broker-mediated trades settle in ~30 days; DTP settles in <24h
 */
export function computeSavings(
  unitPriceUsd: number,
  freightPerLbUsd: number,
  quantityLbs: number,
): SavingsBreakdown {
  const dtpLandedCost = unitPriceUsd + freightPerLbUsd;

  const legacyBrokerMarkup  = unitPriceUsd * 0.08;
  const legacyFreightMarkup = freightPerLbUsd * 0.20;
  const legacyPaymentDelay  = dtpLandedCost * 0.0193; // 7% APR × 30/365

  const legacyLandedCost =
    dtpLandedCost + legacyBrokerMarkup + legacyFreightMarkup + legacyPaymentDelay;

  const savingsPerLb = legacyLandedCost - dtpLandedCost;
  const savingsPct   = (savingsPerLb / legacyLandedCost) * 100;
  const savingsTotal = savingsPerLb * quantityLbs;

  return {
    dtpUnitPrice: unitPriceUsd,
    dtpFreight: freightPerLbUsd,
    dtpLandedCost,
    legacyBrokerMarkup,
    legacyFreightMarkup,
    legacyPaymentDelay,
    legacyLandedCost,
    savingsPerLb,
    savingsPct,
    savingsTotal,
    cycleTimeSavedDays: 18,
  };
}
