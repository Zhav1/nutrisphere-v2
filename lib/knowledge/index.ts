/**
 * Knowledge Base Parser & Cache Manager
 * 
 * Parses markdown knowledge files at startup and provides
 * fast lookup for nutrition validation and recipe checking.
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// TYPES
// ============================================================================

export interface NutritionBounds {
  value: number;
  min: number;
  max: number;
}

export interface FoodKnowledge {
  name: string;
  englishName: string;
  category: 'staple' | 'protein' | 'vegetable' | 'soup' | 'snack' | 'beverage' | 'dessert';
  portion: {
    description: string;
    grams: number;
  };
  nutrition: {
    calories: NutritionBounds;
    protein: NutritionBounds;
    carbs: NutritionBounds;
    fat: NutritionBounds;
  };
  commonMisidentifications: string[];
  flags: string[];
}

export interface MarketPrice {
  item: string;
  unit: string;
  priceRange: {
    min: number;
    max: number;
  };
  marketType: 'sachet' | 'retail' | 'wet_market';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  field: string;
  type: 'out_of_bounds' | 'macro_mismatch' | 'misidentification' | 'unrealistic';
  message: string;
  aiValue?: number;
  expectedRange?: { min: number; max: number };
}

// ============================================================================
// CACHE
// ============================================================================

let foodCache: Map<string, FoodKnowledge> | null = null;
let priceCache: Map<string, MarketPrice> | null = null;
let misidentificationMap: Map<string, string[]> | null = null;

// Normalize food names for lookup
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

// ============================================================================
// PARSERS
// ============================================================================

/**
 * Parse Indonesian foods markdown into structured data
 */
function parseFoodKnowledge(markdown: string): Map<string, FoodKnowledge> {
  const foods = new Map<string, FoodKnowledge>();
  
  // Match each food section (### Food Name)
  const foodSections = markdown.split(/^### /gm).slice(1);
  
  for (const section of foodSections) {
    try {
      const lines = section.split('\n').filter(l => l.trim());
      if (lines.length < 3) continue;
      
      const name = lines[0].trim();
      const normalizedName = normalizeName(name);
      
      // Extract fields
      const englishMatch = section.match(/\*\*English\*\*:\s*(.+)/);
      const categoryMatch = section.match(/\*\*Category\*\*:\s*(\w+)/);
      const portionMatch = section.match(/\*\*Portion\*\*:\s*(.+?)(?:\((\d+)g\))?/);
      
      // Extract nutrition with bounds
      const caloriesMatch = section.match(/Calories:\s*(\d+)\s*\(min:\s*(\d+),\s*max:\s*(\d+)\)/);
      const proteinMatch = section.match(/Protein:\s*([\d.]+)g\s*\(min:\s*([\d.]+),\s*max:\s*([\d.]+)\)/);
      const carbsMatch = section.match(/Carbs:\s*([\d.]+)g\s*\(min:\s*([\d.]+),\s*max:\s*([\d.]+)\)/);
      const fatMatch = section.match(/Fat:\s*([\d.]+)g\s*\(min:\s*([\d.]+),\s*max:\s*([\d.]+)\)/);
      
      // Extract misidentifications and flags
      const misidMatch = section.match(/\*\*Common Misidentifications\*\*:\s*(.+)/);
      const flagsMatch = section.match(/\*\*Flags\*\*:\s*(.+)/);
      
      if (!caloriesMatch) continue; // Skip if no nutrition data
      
      const food: FoodKnowledge = {
        name,
        englishName: englishMatch?.[1]?.trim() || name,
        category: (categoryMatch?.[1] || 'staple') as FoodKnowledge['category'],
        portion: {
          description: portionMatch?.[1]?.trim() || '1 porsi',
          grams: parseInt(portionMatch?.[2] || '100'),
        },
        nutrition: {
          calories: {
            value: parseInt(caloriesMatch[1]),
            min: parseInt(caloriesMatch[2]),
            max: parseInt(caloriesMatch[3]),
          },
          protein: {
            value: parseFloat(proteinMatch?.[1] || '0'),
            min: parseFloat(proteinMatch?.[2] || '0'),
            max: parseFloat(proteinMatch?.[3] || '50'),
          },
          carbs: {
            value: parseFloat(carbsMatch?.[1] || '0'),
            min: parseFloat(carbsMatch?.[2] || '0'),
            max: parseFloat(carbsMatch?.[3] || '100'),
          },
          fat: {
            value: parseFloat(fatMatch?.[1] || '0'),
            min: parseFloat(fatMatch?.[2] || '0'),
            max: parseFloat(fatMatch?.[3] || '50'),
          },
        },
        commonMisidentifications: misidMatch?.[1]
          ?.split(',')
          .map(s => s.trim().replace(/"/g, ''))
          .filter(Boolean) || [],
        flags: flagsMatch?.[1]
          ?.split(',')
          .map(s => s.trim())
          .filter(Boolean) || [],
      };
      
      foods.set(normalizedName, food);
      
      // Also add English name as key
      if (food.englishName) {
        foods.set(normalizeName(food.englishName), food);
      }
    } catch (error) {
      console.warn('[Knowledge] Failed to parse food section:', error);
    }
  }
  
  return foods;
}

/**
 * Parse market prices markdown into structured data
 */
function parseMarketPrices(markdown: string): Map<string, MarketPrice> {
  const prices = new Map<string, MarketPrice>();
  
  // Match table rows: | Item | Unit | Min | Max | Type |
  const tableRowRegex = /\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\w+)\s*\|/g;
  
  let match;
  while ((match = tableRowRegex.exec(markdown)) !== null) {
    const item = match[1].trim();
    if (item === 'Item' || item.startsWith('---')) continue; // Skip headers
    
    const price: MarketPrice = {
      item,
      unit: match[2].trim(),
      priceRange: {
        min: parseInt(match[3]),
        max: parseInt(match[4]),
      },
      marketType: match[5].trim() as MarketPrice['marketType'],
    };
    
    prices.set(normalizeName(item), price);
  }
  
  return prices;
}

/**
 * Build misidentification reverse lookup
 */
function buildMisidentificationMap(foods: Map<string, FoodKnowledge>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  
  for (const [key, food] of foods) {
    for (const misid of food.commonMisidentifications) {
      const normalizedMisid = normalizeName(misid);
      const existing = map.get(normalizedMisid) || [];
      existing.push(food.name);
      map.set(normalizedMisid, existing);
    }
  }
  
  return map;
}

// ============================================================================
// LOADERS
// ============================================================================

/**
 * Load and cache food knowledge from markdown
 */
export async function loadFoodKnowledge(): Promise<Map<string, FoodKnowledge>> {
  if (foodCache) return foodCache;
  
  try {
    const filePath = path.join(process.cwd(), 'lib', 'knowledge', 'indonesian_foods.md');
    const content = fs.readFileSync(filePath, 'utf-8');
    foodCache = parseFoodKnowledge(content);
    misidentificationMap = buildMisidentificationMap(foodCache);
    console.log(`[Knowledge] Loaded ${foodCache.size} foods`);
    return foodCache;
  } catch (error) {
    console.error('[Knowledge] Failed to load food knowledge:', error);
    return new Map();
  }
}

/**
 * Load and cache market prices from markdown
 */
export async function loadMarketPrices(): Promise<Map<string, MarketPrice>> {
  if (priceCache) return priceCache;
  
  try {
    const filePath = path.join(process.cwd(), 'lib', 'knowledge', 'market_prices.md');
    const content = fs.readFileSync(filePath, 'utf-8');
    priceCache = parseMarketPrices(content);
    console.log(`[Knowledge] Loaded ${priceCache.size} price entries`);
    return priceCache;
  } catch (error) {
    console.error('[Knowledge] Failed to load market prices:', error);
    return new Map();
  }
}

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/**
 * Find food by Indonesian or English name (fuzzy)
 */
export function findFoodByName(query: string): FoodKnowledge | null {
  if (!foodCache) return null;
  
  const normalized = normalizeName(query);
  
  // Exact match
  if (foodCache.has(normalized)) {
    return foodCache.get(normalized)!;
  }
  
  // Partial match
  for (const [key, food] of foodCache) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return food;
    }
  }
  
  return null;
}

/**
 * Get price range for an ingredient
 */
export function getPriceRange(ingredient: string): MarketPrice | null {
  if (!priceCache) return null;
  
  const normalized = normalizeName(ingredient);
  
  // Exact match
  if (priceCache.has(normalized)) {
    return priceCache.get(normalized)!;
  }
  
  // Partial match
  for (const [key, price] of priceCache) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return price;
    }
  }
  
  return null;
}

/**
 * Check if a food name is a known misidentification
 */
export function checkMisidentification(foodName: string): string[] | null {
  if (!misidentificationMap) return null;
  
  const normalized = normalizeName(foodName);
  return misidentificationMap.get(normalized) || null;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate nutrition values against known bounds
 */
export function validateNutritionAgainstKnowledge(
  foodName: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const suggestions: string[] = [];
  
  const food = findFoodByName(foodName);
  
  if (!food) {
    // No reference data - just do basic sanity checks
    return validateBasicSanity(calories, protein, carbs, fat);
  }
  
  // Check calories bounds
  if (calories < food.nutrition.calories.min || calories > food.nutrition.calories.max) {
    issues.push({
      field: 'calories',
      type: 'out_of_bounds',
      message: `Kalori ${calories} di luar range normal (${food.nutrition.calories.min}-${food.nutrition.calories.max})`,
      aiValue: calories,
      expectedRange: { min: food.nutrition.calories.min, max: food.nutrition.calories.max },
    });
    suggestions.push(`Kalori ${food.name} biasanya ${food.nutrition.calories.value} kcal`);
  }
  
  // Check protein bounds
  if (protein < food.nutrition.protein.min || protein > food.nutrition.protein.max) {
    issues.push({
      field: 'protein',
      type: 'out_of_bounds',
      message: `Protein ${protein}g di luar range normal (${food.nutrition.protein.min}-${food.nutrition.protein.max}g)`,
      aiValue: protein,
      expectedRange: { min: food.nutrition.protein.min, max: food.nutrition.protein.max },
    });
  }
  
  // Check carbs bounds
  if (carbs < food.nutrition.carbs.min || carbs > food.nutrition.carbs.max) {
    issues.push({
      field: 'carbs',
      type: 'out_of_bounds',
      message: `Karbohidrat ${carbs}g di luar range normal (${food.nutrition.carbs.min}-${food.nutrition.carbs.max}g)`,
      aiValue: carbs,
      expectedRange: { min: food.nutrition.carbs.min, max: food.nutrition.carbs.max },
    });
  }
  
  // Check fat bounds
  if (fat < food.nutrition.fat.min || fat > food.nutrition.fat.max) {
    issues.push({
      field: 'fat',
      type: 'out_of_bounds',
      message: `Lemak ${fat}g di luar range normal (${food.nutrition.fat.min}-${food.nutrition.fat.max}g)`,
      aiValue: fat,
      expectedRange: { min: food.nutrition.fat.min, max: food.nutrition.fat.max },
    });
  }
  
  // Check macro-calorie consistency
  const expectedCalories = protein * 4 + carbs * 4 + fat * 9;
  const calorieDeviation = Math.abs(calories - expectedCalories) / calories;
  
  if (calorieDeviation > 0.20) {
    issues.push({
      field: 'macro_consistency',
      type: 'macro_mismatch',
      message: `Kalori tidak konsisten dengan makro (expected ~${Math.round(expectedCalories)}, got ${calories})`,
      aiValue: calories,
    });
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Basic sanity check when no reference data available
 */
function validateBasicSanity(
  calories: number,
  protein: number,
  carbs: number,
  fat: number
): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  // Check macro-calorie consistency
  const expectedCalories = protein * 4 + carbs * 4 + fat * 9;
  const calorieDeviation = calories > 0 
    ? Math.abs(calories - expectedCalories) / calories 
    : 0;
  
  if (calorieDeviation > 0.25) {
    issues.push({
      field: 'macro_consistency',
      type: 'macro_mismatch',
      message: `Kalori tidak konsisten dengan makro`,
      aiValue: calories,
    });
  }
  
  // Absolute bounds check
  if (calories > 1500) {
    issues.push({
      field: 'calories',
      type: 'unrealistic',
      message: `Kalori ${calories} terlalu tinggi untuk 1 porsi`,
    });
  }
  
  if (protein > 100) {
    issues.push({
      field: 'protein',
      type: 'unrealistic',
      message: `Protein ${protein}g tidak realistis`,
    });
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions: [],
  };
}

/**
 * Validate ingredient price against market reference
 */
export function validateIngredientPrice(
  ingredient: string,
  price: number
): { valid: boolean; suggestion?: number; message?: string } {
  const priceRef = getPriceRange(ingredient);
  
  if (!priceRef) {
    return { valid: true }; // No reference, assume valid
  }
  
  if (price < priceRef.priceRange.min) {
    return {
      valid: false,
      suggestion: priceRef.priceRange.min,
      message: `Harga ${ingredient} terlalu murah (min Rp ${priceRef.priceRange.min.toLocaleString()})`,
    };
  }
  
  if (price > priceRef.priceRange.max * 1.5) {
    return {
      valid: false,
      suggestion: priceRef.priceRange.max,
      message: `Harga ${ingredient} terlalu mahal (max ~Rp ${priceRef.priceRange.max.toLocaleString()})`,
    };
  }
  
  return { valid: true };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize knowledge base (call at server startup)
 */
export async function initializeKnowledgeBase(): Promise<void> {
  await Promise.all([
    loadFoodKnowledge(),
    loadMarketPrices(),
  ]);
  console.log('[Knowledge] Knowledge base initialized');
}
