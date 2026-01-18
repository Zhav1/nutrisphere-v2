import { SurvivalRecipe } from '@/types/recipe';
/**
 * Recipe Service
 * Handles recipe generation logic and "Single-Use" economy constraints
 */
/**
 * Generates a budget-friendly recipe using Groq/Llama 3
 * @param budget - User budget in IDR
 * @param tools - Available cooking tools (e.g., "Rice Cooker")
 * @returns SurvivalRecipe object
 */
export async function generateRecipe(
  budget: number, 
  tools: string = 'Rice Cooker'
): Promise<SurvivalRecipe> {
  try {
    const response = await fetch('/api/generate-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget, tools }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate recipe');
    }
    
    const recipe: SurvivalRecipe = await response.json();
    return recipe;
  } catch (error) {
    console.error('Recipe generation error:', error);
    throw new Error('Failed to generate recipe');
  }
}
/**
 * Validates that a recipe follows "Single-Use" economy constraints
 * @param recipe - Recipe to validate
 * @returns true if valid, false otherwise
 */
export function validateSingleUseConstraints(recipe: SurvivalRecipe): boolean {
  // Check that all ingredients have granular pricing
  const hasGranularPricing = recipe.ingredients.every(
    (ingredient) => ingredient.estimatedPriceRp > 0 && ingredient.estimatedPriceRp < 50000
  );
  
  // Check that marketType is not 'bulk' (only retail, sachet, wet_market)
  const hasValidMarketType = recipe.ingredients.every(
    (ingredient) => ['retail', 'sachet', 'wet_market'].includes(ingredient.marketType)
  );
  
  // Check that total cost doesn't exceed reasonable limits
  const withinBudget = recipe.totalCostRp <= 50000;
  
  return hasGranularPricing && hasValidMarketType && withinBudget;
}
/**
 * Calculates the gold reward for cooking a recipe
 * Based on savingsVsBuyingRp (1 Rp saved = 0.1 Gold)
 */
export function calculateGoldReward(recipe: SurvivalRecipe): number {
  return Math.floor(recipe.savingsVsBuyingRp * 0.1);
}
/**
 * Calculates NutriGotchi XP gained from a recipe
 * Based on nutritional value (calories + protein * 2)
 */
export function calculateXpGain(recipe: SurvivalRecipe): number {
  const baseXp = 10;
  const nutritionBonus = Math.floor((recipe.calories / 100) + (recipe.protein * 2));
  return baseXp + nutritionBonus;
}
