import {
  MarketOffer,
  SAMPLE_PRODUCTS,
  PRICE_RANGES,
  US_CITY_ZIPS,
  Side,
  FreightMode,
  TempClass,
} from './types';

const CERTIFICATIONS = [
  'USDA Organic', 'Non-GMO Project', 'GAP Certified', 'SQF Level 2',
  'Rainforest Alliance', 'Fair Trade', 'Kosher', 'Halal',
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeOffer(id: string): MarketOffer {
  const categoryKeys = Object.keys(SAMPLE_PRODUCTS);
  const category = pick(categoryKeys);
  const productName = pick(SAMPLE_PRODUCTS[category]);
  const [minPrice, maxPrice] = PRICE_RANGES[category];
  const pricePerLbMicro = rand(minPrice, maxPrice);

  const origin = pick(US_CITY_ZIPS);
  const side: Side = Math.random() > 0.5 ? 'buy' : 'sell';
  const freightMode: FreightMode = Math.random() > 0.35 ? 'LTL' : 'FTL';
  const tempClass: TempClass =
    ['frozen', 'dairy', 'meat'].includes(category) ? 'reefer' : 'ambient';

  // 0–2 certifications
  const certCount = rand(0, 2);
  const certifications: string[] = [];
  const certPool = [...CERTIFICATIONS];
  for (let i = 0; i < certCount; i++) {
    const idx = Math.floor(Math.random() * certPool.length);
    certifications.push(...certPool.splice(idx, 1));
  }

  const now = Date.now();
  return {
    id,
    side,
    organizationName: generateOrgName(),
    city: origin.city,
    state: origin.state,
    zip: origin.zip,
    productName,
    category,
    quantityLbs: rand(500, 40000),
    pricePerLbMicro,
    freightMode,
    tempClass,
    certifications,
    expiresAt: now + 24 * 60 * 60 * 1000,
    createdAt: now - rand(0, 60 * 60 * 1000),
  };
}

let _counter = 1000;
function nextId() { return `offer-${++_counter}`; }

const ORG_ADJECTIVES = ['Pacific', 'Heartland', 'Summit', 'Prairie', 'Valley', 'Coastal', 'Blue Ridge', 'Cascade'];
const ORG_NOUNS = ['Foods', 'Produce', 'Growers', 'Trading', 'Distribution', 'Supply', 'Commodities', 'Harvest'];
function generateOrgName() {
  return `${pick(ORG_ADJECTIVES)} ${pick(ORG_NOUNS)}`;
}

export function seedOrderbook(count = 200): MarketOffer[] {
  return Array.from({ length: count }, () => makeOffer(nextId()));
}

export function replenishOrderbook(offers: MarketOffer[], target = 200): MarketOffer[] {
  const now = Date.now();
  // Remove expired offers
  const live = offers.filter(o => o.expiresAt > now);
  const needed = target - live.length;
  if (needed <= 0) return live;
  const newOffers = Array.from({ length: needed }, () => makeOffer(nextId()));
  return [...live, ...newOffers];
}
