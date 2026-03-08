import { GameState, MarketOffer } from './types';

const GAME_KEY = 'dtp_game_state';
const OFFERS_KEY = 'dtp_offers';

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(state));
  } catch { /* storage full or SSR */ }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
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
