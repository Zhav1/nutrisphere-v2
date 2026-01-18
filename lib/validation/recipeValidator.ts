/**
 * Recipe Validator
 * 
 * Validates AI-generated recipes against knowledge base:
 * - Ingredient prices vs market reference
 * - Step validation for tool constraints
 * - Savings reality check
 * - Nutrition consistency
 */

import {
  loadMarketPrices,
  getPriceRange,
  MarketPrice,
} from '@/lib/knowledge';

// ============================================================================
// TYPES
// ============================================================================

export interface RecipeIngredient {
  item: string;
  qty: string;
  price: number;
  marketType?: 'sachet' | 'retail' | 'wet_market';
}

export interface RecipeValidationResult {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  flags: RecipeValidationFlag[];
  corrections: PriceCorrection[];
  warnings: string[];
  adjustedTotalCost?: number;
}

export interface RecipeValidationFlag {
  type: 'price_under_market' | 'price_over_market' | 'step_violates_tool' | 
        'savings_unrealistic' | 'total_mismatch' | 'nutrition_impossible';
  field: string;
  message: string;
}

export interface PriceCorrection {
  ingredient: string;
  originalPrice: number;
  suggestedPrice: number;
  reason: string;
}

// ============================================================================
// TOOL CONSTRAINTS
// ============================================================================

const TOOL_FORBIDDEN_WORDS: Record<string, string[]> = {
  'No Cook': ['masak', 'goreng', 'rebus', 'kukus', 'panaskan', 'api', 'kompor', 'oven', 'microwave'],
  'Rice Cooker': ['goreng', 'oven', 'wajan', 'frying pan', 'grill'],
  'Kompor Listrik': ['oven', 'microwave'],
};

const TOOL_ALLOWED_WORDS: Record<string, string[]> = {
  'No Cook': ['campur', 'aduk', 'iris', 'potong', 'rendam', 'dinginkan'],
  'Rice Cooker': ['masak', 'kukus', 'rebus', 'rice cooker', 'magic com', 'magic jar'],
  'Microwave Only': ['microwave', 'panaskan', 'lelehkan'],
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate ingredient prices against market reference
 */
function validateIngredientPrices(
  ingredients: RecipeIngredient[]
): { flags: RecipeValidationFlag[]; corrections: PriceCorrection[] } {
  const flags: RecipeValidationFlag[] = [];
  const corrections: PriceCorrection[] = [];

  for (const ingredient of ingredients) {
    const priceRef = getPriceRange(ingredient.item);
    
    if (!priceRef) continue; // No reference, skip

    // Check if under market minimum
    if (ingredient.price < priceRef.priceRange.min * 0.7) {
      flags.push({
        type: 'price_under_market',
        field: `ingredient.${ingredient.item}`,
        message: `Harga ${ingredient.item} (Rp${ingredient.price.toLocaleString()}) di bawah harga pasar minimum (Rp${priceRef.priceRange.min.toLocaleString()})`,
      });
      corrections.push({
        ingredient: ingredient.item,
        originalPrice: ingredient.price,
        suggestedPrice: priceRef.priceRange.min,
        reason: 'Di bawah harga pasar',
      });
    }

    // Check if over market maximum (with 50% tolerance for premium/organic)
    if (ingredient.price > priceRef.priceRange.max * 1.5) {
      flags.push({
        type: 'price_over_market',
        field: `ingredient.${ingredient.item}`,
        message: `Harga ${ingredient.item} (Rp${ingredient.price.toLocaleString()}) jauh di atas harga pasar (Rp${priceRef.priceRange.max.toLocaleString()})`,
      });
      corrections.push({
        ingredient: ingredient.item,
        originalPrice: ingredient.price,
        suggestedPrice: priceRef.priceRange.max,
        reason: 'Di atas harga pasar',
      });
    }
  }

  return { flags, corrections };
}

/**
 * Validate cooking steps against tool constraints
 */
function validateCookingSteps(
  steps: string[],
  tools: string[]
): RecipeValidationFlag[] {
  const flags: RecipeValidationFlag[] = [];

  for (const tool of tools) {
    const forbidden = TOOL_FORBIDDEN_WORDS[tool] || [];
    
    for (let i = 0; i < steps.length; i++) {
      const stepLower = steps[i].toLowerCase();
      
      for (const word of forbidden) {
        if (stepLower.includes(word)) {
          flags.push({
            type: 'step_violates_tool',
            field: `step.${i + 1}`,
            message: `Langkah ${i + 1} menggunakan "${word}" tapi tool "${tool}" tidak mendukung ini`,
          });
        }
      }
    }
  }

  return flags;
}

/**
 * Validate savings claim
 */
function validateSavings(
  totalCost: number,
  claimedSavings: number
): RecipeValidationFlag | null {
  // Savings should be between 20-70% of total cost typically
  const savingsRatio = claimedSavings / (totalCost + claimedSavings);
  
  if (savingsRatio > 0.8) {
    return {
      type: 'savings_unrealistic',
      field: 'savings',
      message: `Klaim hemat ${Math.round(savingsRatio * 100)}% tidak realistis (biasanya 20-60%)`,
    };
  }

  return null;
}

/**
 * Validate total cost matches sum of ingredients
 */
function validateTotalCost(
  ingredients: RecipeIngredient[],
  claimedTotal: number
): { flag: RecipeValidationFlag | null; calculatedTotal: number } {
  const calculatedTotal = ingredients.reduce((sum, ing) => sum + ing.price, 0);
  const deviation = Math.abs(calculatedTotal - claimedTotal) / claimedTotal;

  if (deviation > 0.15) {
    return {
      flag: {
        type: 'total_mismatch',
        field: 'total_cost',
        message: `Total Rp${claimedTotal.toLocaleString()} tidak sesuai dengan jumlah bahan Rp${calculatedTotal.toLocaleString()}`,
      },
      calculatedTotal,
    };
  }

  return { flag: null, calculatedTotal };
}

/**
 * Calculate confidence based on validation flags
 */
function calculateRecipeConfidence(flags: RecipeValidationFlag[]): 'high' | 'medium' | 'low' {
  if (flags.length === 0) return 'high';
  
  const hasCritical = flags.some(f => 
    f.type === 'step_violates_tool' || 
    f.type === 'savings_unrealistic'
  );
  
  if (hasCritical || flags.length >= 3) return 'low';
  if (flags.length >= 1) return 'medium';
  return 'high';
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validate a complete recipe
 */
export async function validateRecipe(
  recipe: {
    title: string;
    totalCostRp: number;
    savingsVsBuyingRp: number;
    ingredients: RecipeIngredient[];
    cookingSteps: string[];
    calories?: number;
    protein?: number;
  },
  tools: string[]
): Promise<RecipeValidationResult> {
  const flags: RecipeValidationFlag[] = [];
  const warnings: string[] = [];

  // Ensure knowledge base is loaded
  try {
    await loadMarketPrices();
  } catch (e) {
    console.warn('[RecipeValidator] Knowledge base not available');
  }

  // 1. Validate ingredient prices
  const priceValidation = validateIngredientPrices(recipe.ingredients);
  flags.push(...priceValidation.flags);

  // 2. Validate cooking steps
  const stepFlags = validateCookingSteps(recipe.cookingSteps, tools);
  flags.push(...stepFlags);

  // 3. Validate savings
  const savingsFlag = validateSavings(recipe.totalCostRp, recipe.savingsVsBuyingRp);
  if (savingsFlag) flags.push(savingsFlag);

  // 4. Validate total cost
  const totalValidation = validateTotalCost(recipe.ingredients, recipe.totalCostRp);
  if (totalValidation.flag) flags.push(totalValidation.flag);

  // Generate warnings in Indonesian
  for (const flag of flags) {
    warnings.push(flag.message);
  }

  // Calculate adjusted total if corrections exist
  let adjustedTotalCost: number | undefined;
  if (priceValidation.corrections.length > 0) {
    adjustedTotalCost = recipe.ingredients.reduce((sum, ing) => {
      const correction = priceValidation.corrections.find(c => c.ingredient === ing.item);
      return sum + (correction ? correction.suggestedPrice : ing.price);
    }, 0);
  }

  return {
    isValid: flags.length === 0,
    confidence: calculateRecipeConfidence(flags),
    flags,
    corrections: priceValidation.corrections,
    warnings,
    adjustedTotalCost,
  };
}

/**
 * Get confidence label in Indonesian
 */
export function getRecipeConfidenceLabel(confidence: 'high' | 'medium' | 'low'): {
  label: string;
  color: string;
  emoji: string;
} {
  switch (confidence) {
    case 'high':
      return { label: 'Harga Akurat', color: 'text-green-600', emoji: '✓' };
    case 'medium':
      return { label: 'Perlu Dicek', color: 'text-amber-600', emoji: '⚠' };
    case 'low':
      return { label: 'Tidak Akurat', color: 'text-red-600', emoji: '❌' };
  }
}

/**
 * Apply price corrections to ingredients
 */
export function applyPriceCorrections(
  ingredients: RecipeIngredient[],
  corrections: PriceCorrection[]
): RecipeIngredient[] {
  return ingredients.map(ing => {
    const correction = corrections.find(c => c.ingredient === ing.item);
    if (correction) {
      return { ...ing, price: correction.suggestedPrice };
    }
    return ing;
  });
}
