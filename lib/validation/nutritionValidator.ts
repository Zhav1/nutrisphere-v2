/**
 * Nutrition Validator
 * 
 * Validates AI-generated nutrition data against knowledge base
 * and applies fixes/warnings when values are suspicious.
 */

import {
  findFoodByName,
  validateNutritionAgainstKnowledge,
  checkMisidentification,
  ValidationResult,
  ValidationIssue,
} from '@/lib/knowledge';

// ============================================================================
// TYPES
// ============================================================================

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  sodium?: number;
}

export interface ValidatedNutritionResult {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  originalData: NutritionData;
  validatedData: NutritionData;
  issues: ValidationIssue[];
  warnings: string[];
  possibleMisidentification?: string[];
}

export interface FoodPlateValidationResult {
  overallConfidence: 'high' | 'medium' | 'low';
  validatedFoods: ValidatedFoodItem[];
  totalIssues: number;
  suggestedActions: string[];
}

export interface ValidatedFoodItem {
  name: string;
  originalNutrition: NutritionData;
  validatedNutrition: NutritionData;
  confidence: 'high' | 'medium' | 'low';
  issues: string[];
  wasRepaired: boolean;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Calculate confidence level based on validation issues
 */
function calculateConfidence(issues: ValidationIssue[]): 'high' | 'medium' | 'low' {
  if (issues.length === 0) return 'high';
  
  const hasCritical = issues.some(i => 
    i.type === 'macro_mismatch' || 
    i.type === 'unrealistic'
  );
  
  if (hasCritical || issues.length >= 3) return 'low';
  if (issues.length >= 1) return 'medium';
  return 'high';
}

/**
 * Repair nutrition values that are out of bounds
 * Uses the nearest valid value from knowledge base
 */
function repairNutritionValue(
  value: number,
  expectedRange: { min: number; max: number } | undefined
): number {
  if (!expectedRange) return value;
  
  if (value < expectedRange.min) {
    return expectedRange.min;
  }
  if (value > expectedRange.max) {
    return expectedRange.max;
  }
  return value;
}

/**
 * Validate single food item nutrition
 */
export function validateFoodNutrition(
  foodName: string,
  nutrition: NutritionData
): ValidatedNutritionResult {
  const result = validateNutritionAgainstKnowledge(
    foodName,
    nutrition.calories,
    nutrition.protein,
    nutrition.carbs,
    nutrition.fat
  );
  
  // Check for possible misidentification
  const misidSuggestions = checkMisidentification(foodName);
  
  // Calculate confidence
  const confidence = calculateConfidence(result.issues);
  
  // Apply repairs for out-of-bounds values
  let validatedData: NutritionData = { ...nutrition };
  const warnings: string[] = [];
  
  for (const issue of result.issues) {
    if (issue.type === 'out_of_bounds' && issue.expectedRange) {
      const field = issue.field as keyof NutritionData;
      const originalValue = nutrition[field];
      const repairedValue = repairNutritionValue(
        originalValue as number,
        issue.expectedRange
      );
      
      if (originalValue !== repairedValue) {
        (validatedData as Record<string, number>)[field] = repairedValue;
        warnings.push(
          `${field} disesuaikan dari ${originalValue} ke ${repairedValue}`
        );
      }
    }
  }
  
  // Add misidentification warning
  if (misidSuggestions && misidSuggestions.length > 0) {
    warnings.push(
      `Mungkin sebenarnya: ${misidSuggestions.join(', ')}`
    );
  }
  
  return {
    isValid: result.isValid,
    confidence,
    originalData: nutrition,
    validatedData,
    issues: result.issues,
    warnings,
    possibleMisidentification: misidSuggestions || undefined,
  };
}

/**
 * Validate full food plate analysis result
 */
export function validateFoodPlateAnalysis(
  foodName: string,
  components: string[],
  totalNutrition: NutritionData
): FoodPlateValidationResult {
  const validatedFoods: ValidatedFoodItem[] = [];
  let totalIssues = 0;
  const suggestedActions: string[] = [];
  
  // Validate total
  const totalValidation = validateFoodNutrition(foodName, totalNutrition);
  totalIssues += totalValidation.issues.length;
  
  validatedFoods.push({
    name: foodName,
    originalNutrition: totalNutrition,
    validatedNutrition: totalValidation.validatedData,
    confidence: totalValidation.confidence,
    issues: totalValidation.issues.map(i => i.message),
    wasRepaired: JSON.stringify(totalNutrition) !== JSON.stringify(totalValidation.validatedData),
  });
  
  // Check each component for known issues
  for (const component of components) {
    const misid = checkMisidentification(component);
    if (misid) {
      suggestedActions.push(
        `"${component}" mungkin sebenarnya ${misid.join(' atau ')}`
      );
    }
  }
  
  // Calculate overall confidence
  let overallConfidence: 'high' | 'medium' | 'low' = 'high';
  if (totalIssues > 0) overallConfidence = 'medium';
  if (totalIssues >= 3 || totalValidation.confidence === 'low') {
    overallConfidence = 'low';
  }
  
  // Add suggested actions based on confidence
  if (overallConfidence === 'low') {
    suggestedActions.push('Pertimbangkan untuk menggunakan data preset');
  }
  if (totalValidation.possibleMisidentification?.length) {
    suggestedActions.push('Cek kembali identifikasi makanan');
  }
  
  return {
    overallConfidence,
    validatedFoods,
    totalIssues,
    suggestedActions,
  };
}

/**
 * Quick sanity check without knowledge base lookup
 * For fast pre-validation
 */
export function quickSanityCheck(nutrition: NutritionData): {
  pass: boolean;
  reason?: string;
} {
  // Check macro-calorie consistency
  const expectedCalories = 
    nutrition.protein * 4 + 
    nutrition.carbs * 4 + 
    nutrition.fat * 9;
  
  const deviation = nutrition.calories > 0
    ? Math.abs(nutrition.calories - expectedCalories) / nutrition.calories
    : 0;
  
  if (deviation > 0.3) {
    return {
      pass: false,
      reason: `Kalori tidak konsisten dengan makro (diff: ${Math.round(deviation * 100)}%)`,
    };
  }
  
  // Absolute sanity bounds
  if (nutrition.calories > 2000) {
    return {
      pass: false,
      reason: 'Kalori per porsi > 2000 tidak realistis',
    };
  }
  
  if (nutrition.protein > 150 || nutrition.carbs > 200 || nutrition.fat > 100) {
    return {
      pass: false,
      reason: 'Nilai makro tidak realistis untuk 1 porsi',
    };
  }
  
  return { pass: true };
}

/**
 * Get confidence label in Indonesian
 */
export function getConfidenceLabel(confidence: 'high' | 'medium' | 'low'): {
  label: string;
  color: string;
  emoji: string;
} {
  switch (confidence) {
    case 'high':
      return { label: 'Tinggi', color: 'text-green-600', emoji: '✓' };
    case 'medium':
      return { label: 'Sedang', color: 'text-amber-600', emoji: '⚠' };
    case 'low':
      return { label: 'Rendah', color: 'text-red-600', emoji: '⚠' };
  }
}

/**
 * Format validation issues for UI display
 */
export function formatIssuesForUI(issues: ValidationIssue[]): string[] {
  return issues.map(issue => {
    switch (issue.type) {
      case 'out_of_bounds':
        return `⚠ ${issue.message}`;
      case 'macro_mismatch':
        return `❌ ${issue.message}`;
      case 'misidentification':
        return `🔍 ${issue.message}`;
      case 'unrealistic':
        return `❌ ${issue.message}`;
      default:
        return issue.message;
    }
  });
}
