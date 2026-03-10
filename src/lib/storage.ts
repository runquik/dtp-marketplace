import { GameState, MarketOffer, PlayerOrg } from './types';

const GAME_KEY = 'dtp_game_state';
const OFFERS_KEY = 'dtp_offers';

/** Migrate older PlayerOrg shapes to the current schema without losing state. */
function migrateOrg(org: Partial<PlayerOrg> & Record<string, unknown>): PlayerOrg {
  return {
    // legacy fallbacks
    legalName:            (org.legalName as string) ?? (org.name as string) ?? 'Unknown',
    dba:                  org.dba as string | undefined,
    name:                 (org.name as string) ?? (org.legalName as string) ?? 'Unknown',
    entityType:           (org.entityType as PlayerOrg['entityType']) ?? 'llc',
    stateOfIncorporation: (org.stateOfIncorporation as string) ?? (org.state as string) ?? 'XX',
    einLast4:             (org.einLast4 as string) ?? '****',
    businessType:         (org.businessType as PlayerOrg['businessType']) ?? 'distributor',
    city:                 (org.city as string) ?? '',
    state:                (org.state as string) ?? '',
    zip:                  (org.zip as string) ?? '',
    categories:           (org.categories as string[]) ?? [],
    id:                   (org.id as string) ?? `org-${Date.now()}`,
    balance:              (org.balance as number) ?? 10_000_000_000,
    createdAt:            (org.createdAt as number) ?? Date.now(),
    verifiedEntity:       (org.verifiedEntity as boolean) ?? false,
    verifiedAt:           org.verifiedAt as number | undefined,
    certifications:       (org.certifications as PlayerOrg['certifications']) ?? [],
    tradeCount:           (org.tradeCount as number) ?? 0,
    disputeCount:         (org.disputeCount as number) ?? 0,
    totalVolumeUsdMicro:  (org.totalVolumeUsdMicro as number) ?? 0,
    maxTradeCapMicro:     (org.maxTradeCapMicro as number) ?? 5_000_000_000,
    nearAccountId:        org.nearAccountId as string | undefined,
  };
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(state));
  } catch { /* storage full or SSR */ }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState & { org: Record<string, unknown> };
    return { ...parsed, org: migrateOrg(parsed.org) };
  } catch { return null; }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(GAME_KEY);
    localStorage.removeItem(OFFERS_KEY);
  } catch { /* noop */ }
}

export function saveOffers(offers: MarketOffer[]): void {
  try {
    localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
  } catch { /* noop */ }
}

export function loadOffers(): MarketOffer[] | null {
  try {
    const raw = localStorage.getItem(OFFERS_KEY);
    return raw ? (JSON.parse(raw) as MarketOffer[]) : null;
  } catch { return null; }
}
