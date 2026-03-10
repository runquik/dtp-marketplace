import {
  MarketOffer,
  MARKET_PRODUCTS,
  US_CITY_ZIPS,
  REEFER_CATEGORIES,
  Side,
  FreightMode,
  TempClass,
} from './types';

const CERTIFICATIONS = [
  'USDA Organic', 'Non-GMO Project', 'GAP Certified', 'SQF Level 2',
  'Rainforest Alliance', 'Fair Trade', 'Kosher', 'Halal', 'FSMA 204',
];

const ORG_ADJECTIVES = ['Pacific', 'Heartland', 'Summit', 'Prairie', 'Valley', 'Coastal', 'Blue Ridge', 'Cascade', 'Sunbelt', 'Great Plains'];
const ORG_NOUNS = ['Foods', 'Produce', 'Growers', 'Trading', 'Distribution', 'Supply', 'Commodities', 'Harvest', 'Fresh Co.', 'Ag Partners'];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function generateOrgName() {
  return `${pick(ORG_ADJECTIVES)} ${pick(ORG_NOUNS)}`;
}

let _counter = 1000;
function nextId() { return `offer-${++_counter}`; }

function makeOffer(): MarketOffer {
  const categoryKeys = Object.keys(MARKET_PRODUCTS);
  const category = pick(categoryKeys);
  const product = pick(MARKET_PRODUCTS[category]);
  const pricePerLbMicro = rand(product.priceRange[0], product.priceRange[1]);

  const origin = pick(US_CITY_ZIPS);
  const side: Side = Math.random() > 0.5 ? 'buy' : 'sell';

  // Temp class is determined by category, not random
  const tempClass: TempClass = REEFER_CATEGORIES.has(category) ? 'reefer' : 'ambient';

  // Quantity: larger for raw/commodity, smaller for value-added/packaging
  const isHighValue = ['meat', 'dairy', 'value-added'].includes(category);
  const maxQty = isHighValue ? 5000 : 40000;
  const minQty = category === 'packaging' ? 200 : 500;
  const quantityLbs = rand(minQty, maxQty);

  // FTL only makes sense for large quantities
  const freightMode: FreightMode = quantityLbs > 20000 ? (Math.random() > 0.4 ? 'FTL' : 'LTL') : 'LTL';

  // 0-2 certifications, more likely for organic/produce
  const certCount = category === 'produce' ? rand(0, 3) : rand(0, 1);
  const certifications: string[] = [];
  const certPool = [...CERTIFICATIONS];
  for (let i = 0; i < certCount; i++) {
    if (certPool.length === 0) break;
    const idx = Math.floor(Math.random() * certPool.length);
    certifications.push(...certPool.splice(idx, 1));
  }

  const now = Date.now();
  return {
    id: nextId(),
    side,
    organizationName: generateOrgName(),
    city: origin.city,
    state: origin.state,
    zip: origin.zip,
    productName: product.name,
    category,
    quantityLbs,
    pricePerLbMicro,
    freightMode,
    tempClass,
    certifications,
    expiresAt: now + 24 * 60 * 60 * 1000,
    createdAt: now - rand(0, 60 * 60 * 1000),
  };
}

export function seedOrderbook(count = 200): MarketOffer[] {
  return Array.from({ length: count }, makeOffer);
}

export function replenishOrderbook(offers: MarketOffer[], target = 200): MarketOffer[] {
  const now = Date.now();
  const live = offers.filter(o => o.expiresAt > now);
  const needed = Math.max(0, target - live.length);
  return [...live, ...Array.from({ length: needed }, makeOffer)];
}
