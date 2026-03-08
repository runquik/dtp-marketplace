export type Role = 'buyer' | 'seller' | 'both';

export interface PlayerOrg {
  id: string;
  name: string;
  role: Role;
  city: string;
  state: string;
  zip: string;
  categories: string[];
  balance: number; // microdollars — starts at 10_000_000_000 ($10,000)
  createdAt: number;
}

export interface InventoryItem {
  id: string;
  productName: string;
  category: string;
  quantityLbs: number;
  avgCostPerLb: number; // USD
  acquiredAt: number;
}

export type Side = 'buy' | 'sell';
export type FreightMode = 'LTL' | 'FTL';
export type TempClass = 'ambient' | 'reefer';

export interface MarketOffer {
  id: string;
  side: Side;
  organizationName: string;
  city: string;
  state: string;
  zip: string;
  productName: string;
  category: string;
  quantityLbs: number;
  pricePerLbMicro: number; // microdollars per lb
  freightMode: FreightMode;
  tempClass: TempClass;
  certifications: string[];
  expiresAt: number;
  createdAt: number;
}

export interface FreightQuote {
  originZip: string;
  destZip: string;
  miles: number;
  transitDays: number;
  totalUsd: number;
  perLbUsd: number;
}

export interface TradeMatch {
  matchId: string;
  playerSide: Side;
  offer: MarketOffer;
  freightQuote: FreightQuote;
  quantityLbs: number;
  // DTP economics
  dtpLandedCostPerLb: number;
  legacyLandedCostPerLb: number;
  savingsPct: number;
  savingsUsd: number;
  cycleTimeSavedDays: number;
  // game
  pointsEarned: number;
  balanceDelta: number; // microdollars (negative = spent, positive = received)
  timestamp: number;
}

export interface GameState {
  org: PlayerOrg;
  inventory: InventoryItem[];
  matchHistory: TradeMatch[];
  totalSavingsUsd: number;
  score: number;
  streak: number;
}

export const FOOD_CATEGORIES = [
  { id: 'produce', label: 'Fresh Produce' },
  { id: 'frozen', label: 'Frozen Foods' },
  { id: 'dairy', label: 'Dairy & Eggs' },
  { id: 'meat', label: 'Meat & Seafood' },
  { id: 'dry-goods', label: 'Dry Goods & Grains' },
  { id: 'beverages', label: 'Beverages & Juice' },
] as const;

export type CategoryId = (typeof FOOD_CATEGORIES)[number]['id'];

export const SAMPLE_PRODUCTS: Record<string, string[]> = {
  produce: ['Organic IQF Blueberries', 'Roma Tomatoes', 'Baby Spinach', 'Russet Potatoes', 'Navel Oranges'],
  frozen: ['IQF Strawberries', 'Frozen Corn', 'Frozen Green Beans', 'IQF Mango Chunks'],
  dairy: ['Sharp Cheddar Block', 'Whole Milk', 'Grade A Eggs', 'Cultured Butter'],
  meat: ['Boneless Chicken Breast', 'Atlantic Salmon Fillet', 'Ground Beef 80/20'],
  'dry-goods': ['Hard Red Wheat', 'Long Grain White Rice', 'Black Beans', 'Rolled Oats'],
  beverages: ['NFC Orange Juice', 'Apple Juice Concentrate', 'Cranberry Juice'],
};

// Price ranges per category in microdollars per lb (min, max)
export const PRICE_RANGES: Record<string, [number, number]> = {
  produce:    [800_000,  2_800_000],
  frozen:     [900_000,  2_500_000],
  dairy:      [1_500_000, 4_000_000],
  meat:       [3_500_000, 8_000_000],
  'dry-goods':[300_000,  900_000],
  beverages:  [600_000,  2_200_000],
};

export const US_CITY_ZIPS: Array<{ city: string; state: string; zip: string }> = [
  { city: 'Portland', state: 'OR', zip: '97201' },
  { city: 'Seattle', state: 'WA', zip: '98101' },
  { city: 'Los Angeles', state: 'CA', zip: '90001' },
  { city: 'Fresno', state: 'CA', zip: '93701' },
  { city: 'Salinas', state: 'CA', zip: '93901' },
  { city: 'Denver', state: 'CO', zip: '80201' },
  { city: 'Chicago', state: 'IL', zip: '60601' },
  { city: 'Minneapolis', state: 'MN', zip: '55401' },
  { city: 'Kansas City', state: 'MO', zip: '64101' },
  { city: 'Dallas', state: 'TX', zip: '75201' },
  { city: 'Houston', state: 'TX', zip: '77001' },
  { city: 'Atlanta', state: 'GA', zip: '30301' },
  { city: 'Miami', state: 'FL', zip: '33101' },
  { city: 'Philadelphia', state: 'PA', zip: '19101' },
  { city: 'New York', state: 'NY', zip: '10001' },
  { city: 'Boston', state: 'MA', zip: '02101' },
  { city: 'Charlotte', state: 'NC', zip: '28201' },
  { city: 'Nashville', state: 'TN', zip: '37201' },
  { city: 'Phoenix', state: 'AZ', zip: '85001' },
  { city: 'Salt Lake City', state: 'UT', zip: '84101' },
];
