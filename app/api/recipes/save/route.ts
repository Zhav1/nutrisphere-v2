import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

/**
 * POST /api/recipes/save
 * Saves a generated recipe to user's collection
 * 
 * FIXED: Reads auth token from Authorization header (since cookies aren't being sent)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== [SAVE RECIPE] API Called ===');
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to save recipes.' },
        { status: 401 }
      );
    }
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return []; }, // Not using cookies - return empty array
          setAll() {}, // No-op for API routes
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}` // Use token from header
          }
        }
      }
    );
    
    // 🛑 VALIDATE USER identity first using their token (Security Layer)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[SAVE RECIPE] ❌ Token validation failed');
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or expired token.' },
        { status: 401 }
      );
    }

    // 🚀 REVERTED TO STANDARD CLIENT (USER REQUEST)
    // Using default Supabase client with Publishable Key.
    // This RESPECTS Row Level Security (RLS).
    // If this fails, it means the database RLS policies are blocking the user.

    console.log('[SAVE RECIPE] ✅ User authenticated:', user.email);

    const { recipe } = await request.json();
    
    if (!recipe || !recipe.title) {
      return NextResponse.json(
        { error: 'Invalid input: recipe object with title is required' },
        { status: 400 }
      );
    }

    console.log('[SAVE RECIPE] Saving recipe:', recipe.title);

    // FIXED: Trust AI-provided type if present and cost aligns
    const shoppingCost = recipe.totalCostRp || 0;
    const aiType = recipe.recipeType as 'Hemat' | 'Balance' | 'Premium' | undefined;
    
    // Determine type: Trust AI if provided, otherwise calculate from cost
    let determinedRecipeType: 'Hemat' | 'Balance' | 'Premium';
    if (aiType && ['Hemat', 'Balance', 'Premium'].includes(aiType)) {
      // Trust AI type - it knows the recipe context better
      determinedRecipeType = aiType;
    } else if (shoppingCost <= 15000) {
      determinedRecipeType = 'Hemat';
    } else if (shoppingCost <= 35000) {
      determinedRecipeType = 'Balance';
    } else {
      determinedRecipeType = 'Premium';
    }
    
    // Ensure savings has a minimum value (default 2000 if missing)
    const savingsAmount = Math.max(Math.round(Number(recipe.savingsVsBuyingRp) || 2000), 1000);
    
    // Prepare recipe data for database
    const recipeData = {
      user_id: user.id,
      recipe_title: recipe.title,
      recipe_type: determinedRecipeType,
      description: recipe.description || null,
      total_calories: Math.round(Number(recipe.calories) || 0),
      total_protein: Math.round(Number(recipe.protein) || 0),
      total_fat: Math.round(Number(recipe.fat) || 0),
      total_carbs: Math.round(Number(recipe.carbs) || 0),
      shopping_cost: Math.round(Number(recipe.totalCostRp) || 0),
      savings_vs_buying: savingsAmount,
      ingredients: recipe.ingredients || [],
      cooking_steps: recipe.steps || [],
      tools_required: recipe.toolsRequired || [],
      is_rice_cooker_only: recipe.isRiceCookerOnly || false,
      is_favorite: false,
    };

    // Check for duplicate recipe title before saving
    const { data: existingRecipe } = await supabase
      .from('saved_recipes')
      .select('id, recipe_title, first_cooked_at, times_cooked')
      .eq('user_id', user.id)
      .eq('recipe_title', recipe.title)
      .maybeSingle();

    if (existingRecipe) {
      console.log('[SAVE RECIPE] ⚠️ Duplicate recipe found:', existingRecipe.id);
      return NextResponse.json({
        success: false,
        isDuplicate: true,
        existingRecipeId: existingRecipe.id,
        message: existingRecipe.first_cooked_at 
          ? `You already saved and cooked this recipe${existingRecipe.times_cooked && existingRecipe.times_cooked > 1 ? ` ${existingRecipe.times_cooked} times` : ''}! Find it in Saved Recipes.`
          : 'You already saved this recipe! Find it in Saved Recipes.',
      }, { status: 409 });
    }

    // Insert into database using STANDARD client
    const { data, error } = await supabase
      .from('saved_recipes')
      .insert(recipeData)
      .select()
      .single();

    if (error) {
      console.error('[SAVE RECIPE] Database error:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Recipe with this title already saved!' },
          { status: 409 }
        );
      }
      // Log more details about the permission error
      if (error.code === '42501') {
         console.error('[SAVE RECIPE] 🔒 PERMISSION DENIED. RLS is blocking this insert.');
      }
      throw error;
    }

    console.log('[SAVE RECIPE] ✅ Recipe saved successfully! ID:', data.id);

    // =====================================================
    // GAMIFICATION OVERHAUL: No rewards on save!
    // Rewards are only granted when user marks recipe as "cooked"
    // via POST /api/recipes/:id/cook endpoint
    // =====================================================

    // Calculate potential rewards for display in UI (but don't grant them)
    // ECONOMY REBALANCE: Reduced gold rewards to make accessories harder to buy
    const recipeType = determinedRecipeType;
    const baseGold: Record<string, number> = { 'Hemat': 15, 'Balance': 25, 'Premium': 40 };
    // Savings bonus: 2% of savings, capped at 20 gold max
    const savingsBonus = Math.min(20, Math.floor(savingsAmount * 0.02));
    const potentialGold = (baseGold[recipeType] || 25) + savingsBonus;
    
    const baseXp: Record<string, number> = { 'Hemat': 25, 'Balance': 35, 'Premium': 50 };
    const potentialXp = baseXp[recipeType] || 25;

    console.log('[SAVE RECIPE] 💡 Potential rewards (granted on cook):', { 
      recipeType, potentialGold, potentialXp 
    });

    // Return success with info about needing to "cook" for rewards
    return NextResponse.json({
      success: true,
      recipe: data, // Include full recipe for frontend optimistic update
      recipeId: data.id,
      message: 'Recipe saved! Mark as "Cooked" to earn XP & Gold 🍳',
      goldEarned: 0,  // No rewards on save
      xpEarned: 0,    // No rewards on save
      potentialGold,  // What they'll earn when cooked
      potentialXp,    // What they'll earn when cooked
      isCooked: false,
    });

  } catch (error: any) {
    console.error('[SAVE RECIPE] ❌ Error:', error);
    
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to save recipe',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
