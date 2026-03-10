// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

export type BusinessType =
  | 'manufacturer'
  | 'farmer'
  | 'distributor'
  | 'retailer'
  | 'processor'
  | 'foodservice';

export const BUSINESS_TYPES: { id: BusinessType; label: string; emoji: string; description: string }[] = [
  { id: 'farmer',       emoji: '🌾', label: 'Farm / Grower',        description: 'You grow or raise primary agricultural goods.' },
  { id: 'manufacturer', emoji: '🏭', label: 'Manufacturer',          description: 'You process raw inputs into finished food products.' },
  { id: 'processor',    emoji: '🧊', label: 'Co-packer / Processor', description: 'You co-manufacture or provide cold-storage services.' },
  { id: 'distributor',  emoji: '🚚', label: 'Distributor',           description: 'You aggregate and move goods to buyers regionally.' },
  { id: 'retailer',     emoji: '🛒', label: 'Retailer / Grocery',    description: 'You sell directly to end consumers.' },
  { id: 'foodservice',  emoji: '🍽️', label: 'Food Service',          description: 'You supply restaurants, schools, or institutions.' },
];

export interface PlayerOrg {
  id: string;
  name: string;
  businessType: BusinessType;
  city: string;
  state: string;
  zip: string;
  categories: string[];
  balance: number;
  createdAt: number;
}

export interface InventoryItem {
  id: string;
  productName: string;
  category: string;
  quantityLbs: number;
  avgCostPerLb: number;
  acquiredAt: number;
  isManufactured: boolean;
}

// ---------------------------------------------------------------------------
// Orderbook
// ---------------------------------------------------------------------------

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
  pricePerLbMicro: number;
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
  mode: FreightMode;
}

// ---------------------------------------------------------------------------
// Trades
// ---------------------------------------------------------------------------

export interface TradeMatch {
  matchId: string;
  playerSide: Side;
  offer: MarketOffer;
  freightQuote: FreightQuote;
  quantityLbs: number;
  dtpLandedCostPerLb: number;
  legacyLandedCostPerLb: number;
  savingsPct: number;
  savingsUsd: number;
  cycleTimeSavedDays: number;
  pointsEarned: number;
  balanceDelta: number;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Manufacturing
// ---------------------------------------------------------------------------

export interface RecipeIngredient {
  productName: string;
  quantityLbs: number;
}

export interface Recipe {
  id: string;
  emoji: string;
  outputProductName: string;
  outputCategory: string;
  outputQuantityLbs: number;
  outputTempClass: TempClass;
  ingredients: RecipeIngredient[];
  processingFeeUsd: number;
  description: string;
  suggestedSellPricePerLbUsd: number;
}

export interface ManufactureRecord {
  id: string;
  recipeId: string;
  outputProductName: string;
  outputQuantityLbs: number;
  ingredientsConsumed: RecipeIngredient[];
  processingFeeUsd: number;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

export interface GameState {
  org: PlayerOrg;
  inventory: InventoryItem[];
  matchHistory: TradeMatch[];
  manufactureHistory: ManufactureRecord[];
  totalSavingsUsd: number;
  score: number;
  streak: number;
}

// ---------------------------------------------------------------------------
// Catalog data
// ---------------------------------------------------------------------------

export const FOOD_CATEGORIES = [
  { id: 'produce',     label: 'Fresh Produce',      emoji: '🥬', color: 'bg-green-100 text-green-800',   border: 'border-green-200' },
  { id: 'frozen',      label: 'Frozen Foods',       emoji: '🧊', color: 'bg-sky-100 text-sky-800',       border: 'border-sky-200' },
  { id: 'dairy',       label: 'Dairy & Eggs',       emoji: '🧀', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' },
  { id: 'meat',        label: 'Meat & Seafood',     emoji: '🥩', color: 'bg-red-100 text-red-800',       border: 'border-red-200' },
  { id: 'dry-goods',   label: 'Dry Goods & Grains', emoji: '🌾', color: 'bg-amber-100 text-amber-800',   border: 'border-amber-200' },
  { id: 'beverages',   label: 'Beverages',          emoji: '🧃', color: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
  { id: 'packaging',   label: 'Packaging',          emoji: '📦', color: 'bg-slate-100 text-slate-700',   border: 'border-slate-200' },
  { id: 'value-added', label: 'Value-Added',        emoji: '🫙', color: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
] as const;

export type CategoryId = (typeof FOOD_CATEGORIES)[number]['id'];

export function getCategoryMeta(id: string) {
  return FOOD_CATEGORIES.find(c => c.id === id) ?? { id, label: id, emoji: '📦', color: 'bg-slate-100 text-slate-700', border: 'border-slate-200' };
}

export const REEFER_CATEGORIES = new Set(['produce', 'frozen', 'dairy', 'meat']);

export const MARKET_PRODUCTS: Record<string, { name: string; priceRange: [number, number] }[]> = {
  produce: [
    { name: 'Organic IQF Blueberries',  priceRange: [1_200_000, 2_800_000] },
    { name: 'Fresh Strawberries',        priceRange: [600_000,  1_500_000] },
    { name: 'Roma Tomatoes',             priceRange: [400_000,  900_000] },
    { name: 'Baby Spinach',              priceRange: [1_200_000, 2_200_000] },
    { name: 'Russet Potatoes',           priceRange: [200_000,  500_000] },
    { name: 'Navel Oranges',             priceRange: [500_000,  1_000_000] },
    { name: 'Fresh Blueberries',         priceRange: [1_500_000, 3_500_000] },
    { name: 'Jalapeño Peppers',          priceRange: [600_000,  1_400_000] },
  ],
  frozen: [
    { name: 'IQF Strawberries',          priceRange: [900_000,  2_200_000] },
    { name: 'Frozen Sweet Corn',         priceRange: [600_000,  1_100_000] },
    { name: 'Frozen Green Beans',        priceRange: [700_000,  1_300_000] },
    { name: 'IQF Mango Chunks',          priceRange: [1_000_000, 2_500_000] },
    { name: 'Frozen Mixed Berries',      priceRange: [1_200_000, 2_600_000] },
  ],
  dairy: [
    { name: 'Sharp Cheddar Block',       priceRange: [2_500_000, 4_500_000] },
    { name: 'Whole Milk',                priceRange: [400_000,  700_000] },
    { name: 'Grade A Large Eggs',        priceRange: [1_500_000, 2_800_000] },
    { name: 'Cultured Butter',           priceRange: [3_000_000, 5_500_000] },
  ],
  meat: [
    { name: 'Boneless Chicken Breast',   priceRange: [2_500_000, 4_500_000] },
    { name: 'Atlantic Salmon Fillet',    priceRange: [6_000_000, 10_000_000] },
    { name: 'Ground Beef 80/20',         priceRange: [3_500_000, 5_500_000] },
  ],
  'dry-goods': [
    { name: 'Hard Red Wheat',            priceRange: [200_000,  450_000] },
    { name: 'Long Grain White Rice',     priceRange: [300_000,  600_000] },
    { name: 'Rolled Oats',               priceRange: [350_000,  650_000] },
    { name: 'Cane Sugar',                priceRange: [350_000,  650_000] },
    { name: 'Raw Honey',                 priceRange: [2_500_000, 5_000_000] },
    { name: 'Fruit Pectin',              priceRange: [3_000_000, 6_000_000] },
    { name: 'Mixed Nuts',                priceRange: [4_000_000, 8_000_000] },
    { name: 'Dried Cranberries',         priceRange: [2_000_000, 4_000_000] },
    { name: 'Chia Seeds',                priceRange: [2_500_000, 4_500_000] },
    { name: 'Black Beans',               priceRange: [500_000,  900_000] },
  ],
  beverages: [
    { name: 'NFC Orange Juice',          priceRange: [800_000,  1_600_000] },
    { name: 'Apple Juice Concentrate',   priceRange: [600_000,  1_200_000] },
    { name: 'Cranberry Juice',           priceRange: [700_000,  1_400_000] },
  ],
  packaging: [
    { name: '12oz Glass Jars w/ Lids',   priceRange: [500_000,  900_000] },
    { name: '8oz Glass Jars w/ Lids',    priceRange: [600_000,  1_100_000] },
    { name: 'Kraft Stand-Up Pouches',    priceRange: [300_000,  600_000] },
    { name: 'PET Plastic Bottles 16oz',  priceRange: [400_000,  800_000] },
  ],
};

export const US_CITY_ZIPS: Array<{ city: string; state: string; zip: string }> = [
  { city: 'Portland',       state: 'OR', zip: '97201' },
  { city: 'Seattle',        state: 'WA', zip: '98101' },
  { city: 'Fresno',         state: 'CA', zip: '93701' },
  { city: 'Salinas',        state: 'CA', zip: '93901' },
  { city: 'Stockton',       state: 'CA', zip: '95201' },
  { city: 'Denver',         state: 'CO', zip: '80201' },
  { city: 'Chicago',        state: 'IL', zip: '60601' },
  { city: 'Minneapolis',    state: 'MN', zip: '55401' },
  { city: 'Kansas City',    state: 'MO', zip: '64101' },
  { city: 'Dallas',         state: 'TX', zip: '75201' },
  { city: 'Atlanta',        state: 'GA', zip: '30301' },
  { city: 'Miami',          state: 'FL', zip: '33101' },
  { city: 'Philadelphia',   state: 'PA', zip: '19101' },
  { city: 'New York',       state: 'NY', zip: '10001' },
  { city: 'Charlotte',      state: 'NC', zip: '28201' },
  { city: 'Nashville',      state: 'TN', zip: '37201' },
  { city: 'Phoenix',        state: 'AZ', zip: '85001' },
  { city: 'Salt Lake City', state: 'UT', zip: '84101' },
  { city: 'Boise',          state: 'ID', zip: '83701' },
  { city: 'Green Bay',      state: 'WI', zip: '54301' },
];
