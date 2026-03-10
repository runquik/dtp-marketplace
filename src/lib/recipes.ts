import { Recipe } from './types';

/**
 * Manufacturing recipes for the Workshop.
 * All quantities in lbs (the DTP trade unit).
 * suggestedSellPricePerLbUsd reflects realistic value-added retail margins.
 */
export const RECIPES: Recipe[] = [
  {
    id: 'strawberry-jam',
    emoji: '🍓',
    outputProductName: 'Strawberry Jam (12oz jars)',
    outputCategory: 'value-added',
    outputQuantityLbs: 18,  // 24 × 12oz = 18 lbs output
    outputTempClass: 'ambient',
    ingredients: [
      { productName: 'Fresh Strawberries', quantityLbs: 25 },
      { productName: 'Cane Sugar',         quantityLbs: 10 },
      { productName: 'Fruit Pectin',       quantityLbs: 0.5 },
      { productName: '12oz Glass Jars w/ Lids', quantityLbs: 8 },
    ],
    processingFeeUsd: 45,
    description: 'Cook down fresh strawberries with sugar and pectin, fill and seal jars. Ready for retail or food service.',
    suggestedSellPricePerLbUsd: 4.50,
  },
  {
    id: 'blueberry-jam',
    emoji: '🫐',
    outputProductName: 'Blueberry Jam (12oz jars)',
    outputCategory: 'value-added',
    outputQuantityLbs: 18,
    outputTempClass: 'ambient',
    ingredients: [
      { productName: 'Fresh Blueberries', quantityLbs: 25 },
      { productName: 'Cane Sugar',        quantityLbs: 10 },
      { productName: 'Fruit Pectin',      quantityLbs: 0.5 },
      { productName: '12oz Glass Jars w/ Lids', quantityLbs: 8 },
    ],
    processingFeeUsd: 45,
    description: 'Small-batch blueberry jam. High-value retail item from commodity berries.',
    suggestedSellPricePerLbUsd: 5.00,
  },
  {
    id: 'granola',
    emoji: '🥣',
    outputProductName: 'Artisan Granola (12oz bags)',
    outputCategory: 'value-added',
    outputQuantityLbs: 20,
    outputTempClass: 'ambient',
    ingredients: [
      { productName: 'Rolled Oats',        quantityLbs: 15 },
      { productName: 'Raw Honey',          quantityLbs: 4 },
      { productName: 'Mixed Nuts',         quantityLbs: 4 },
      { productName: 'Chia Seeds',         quantityLbs: 1 },
      { productName: 'Kraft Stand-Up Pouches', quantityLbs: 3 },
    ],
    processingFeeUsd: 35,
    description: 'Baked granola with honey, nuts, and seeds. Substantial margin over raw inputs.',
    suggestedSellPricePerLbUsd: 6.00,
  },
  {
    id: 'trail-mix',
    emoji: '🥜',
    outputProductName: 'Trail Mix (12oz bags)',
    outputCategory: 'value-added',
    outputQuantityLbs: 15,
    outputTempClass: 'ambient',
    ingredients: [
      { productName: 'Mixed Nuts',         quantityLbs: 8 },
      { productName: 'Dried Cranberries',  quantityLbs: 5 },
      { productName: 'Kraft Stand-Up Pouches', quantityLbs: 2 },
    ],
    processingFeeUsd: 20,
    description: 'Simple blending and packaging of nuts and dried fruit into retail units.',
    suggestedSellPricePerLbUsd: 7.50,
  },
  {
    id: 'tomato-sauce',
    emoji: '🍅',
    outputProductName: 'Tomato Pasta Sauce (25oz jars)',
    outputCategory: 'value-added',
    outputQuantityLbs: 30,
    outputTempClass: 'ambient',
    ingredients: [
      { productName: 'Roma Tomatoes',      quantityLbs: 40 },
      { productName: 'Cane Sugar',         quantityLbs: 1 },
      { productName: '12oz Glass Jars w/ Lids', quantityLbs: 12 },
    ],
    processingFeeUsd: 60,
    description: 'Crushed and cooked Roma tomatoes jarred as sauce. Turns commodity tomatoes into premium shelf product.',
    suggestedSellPricePerLbUsd: 3.50,
  },
  {
    id: 'frozen-berry-pack',
    emoji: '🫐',
    outputProductName: 'Frozen Mixed Berry Pack (2lb bags)',
    outputCategory: 'frozen',
    outputQuantityLbs: 40,
    outputTempClass: 'reefer',
    ingredients: [
      { productName: 'Fresh Blueberries',  quantityLbs: 20 },
      { productName: 'Fresh Strawberries', quantityLbs: 20 },
      { productName: 'Kraft Stand-Up Pouches', quantityLbs: 3 },
    ],
    processingFeeUsd: 80,
    description: 'IQF (individually quick frozen) and bagged for retail. Processing converts perishable fresh fruit into shelf-stable frozen.',
    suggestedSellPricePerLbUsd: 3.25,
  },
  {
    id: 'salsa',
    emoji: '🌶️',
    outputProductName: 'Fresh Salsa (16oz jars)',
    outputCategory: 'value-added',
    outputQuantityLbs: 20,
    outputTempClass: 'ambient',
    ingredients: [
      { productName: 'Roma Tomatoes',      quantityLbs: 20 },
      { productName: 'Jalapeño Peppers',   quantityLbs: 4 },
      { productName: 'Cane Sugar',         quantityLbs: 0.5 },
      { productName: '12oz Glass Jars w/ Lids', quantityLbs: 8 },
    ],
    processingFeeUsd: 40,
    description: 'Chunky salsa made from fresh tomatoes and jalapeños. Strong retail demand.',
    suggestedSellPricePerLbUsd: 4.00,
  },
  {
    id: 'chia-pudding-mix',
    emoji: '🥄',
    outputProductName: 'Chia Pudding Mix (8oz pouches)',
    outputCategory: 'value-added',
    outputQuantityLbs: 12,
    outputTempClass: 'ambient',
    ingredients: [
      { productName: 'Chia Seeds',         quantityLbs: 10 },
      { productName: 'Cane Sugar',         quantityLbs: 2 },
      { productName: 'Kraft Stand-Up Pouches', quantityLbs: 2 },
    ],
    processingFeeUsd: 25,
    description: 'Blended chia seed and sugar mix in retail pouches. Minimal processing, strong markup.',
    suggestedSellPricePerLbUsd: 8.00,
  },
];

export function getRecipe(id: string): Recipe | undefined {
  return RECIPES.find(r => r.id === id);
}
