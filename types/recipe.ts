export interface Ingredient {
  name: string;
  qty: string; // e.g., "2 pcs" or "100g"
  marketType: 'retail' | 'sachet' | 'wet_market'; // Enforces "Single-Use" logic
  estimatedPriceRp: number; // Granular price (e.g., 500 for a sachet)
}

export interface SurvivalRecipe {
  id: string;
  title: string;
  totalCostRp: number;
  savingsVsBuyingRp: number; // (Market Price of dish) - (TotalCost)
  calories: number;
  protein: number;
  fat: number;       // NEW: grams of fat
  carbs: number;     // NEW: grams of carbohydrates
  ingredients: Ingredient[];
  steps: string[]; // Tailored for Rice Cooker / Basic Pan
  isRiceCookerOnly: boolean;
  toolsRequired?: string[]; // List of required tools
  generatedAt: Date;
}

/**
 * Saved Recipe (Database Model)
 * Represents a recipe saved to user's collection in Supabase
 */
export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_title: string;
  recipe_type: 'Hemat' | 'Balance' | 'Premium';
  description: string | null;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  shopping_cost: number;
  savings_vs_buying: number;
  ingredients: Ingredient[];
  cooking_steps: string[];
  tools_required: string[];
  is_rice_cooker_only: boolean;
  is_favorite: boolean;
  // Cooking status fields
  is_cooked: boolean; // DEPRECATED: Use first_cooked_at instead
  cooked_at: string | null; // DEPRECATED: Use first/last_cooked_at
  first_cooked_at: string | null; // NEW: When recipe was first cooked
  last_cooked_at: string | null; // NEW: When recipe was last cooked
  times_cooked: number; // NEW: Total cook count
  gold_earned: number;
  xp_earned: number;
  // Timestamps
  created_at: string;
  updated_at: string;
}

// NEW: Recipe cooking history entry
export interface RecipeCookHistory {
  id: string;
  recipe_id: string;
  user_id: string;
  cooked_at: string;
  gold_earned: number;
  xp_earned: number;
  hit_daily_limit: boolean;
  created_at: string;
}


// Alias for consistency with database schema
export type Recipe = SurvivalRecipe;