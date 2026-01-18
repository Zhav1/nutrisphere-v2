import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { APP_MESSAGES } from '@/lib/constants';
import { successResponse, errorResponse } from '@/lib/apiResponse';

// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/recipes/:id
 * Deletes a saved recipe
 * 
 * GAMIFICATION OVERHAUL: If recipe was cooked, subtracts gold_earned from user's wallet
 * Implements Option B: Math.max(0, balance - gold) to prevent negative balance
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== [DELETE RECIPE] API Called ===', params.id);
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Create Supabase client with token
    const supabase = createApiClient(token);
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // =====================================================
    // GAMIFICATION OVERHAUL: Clawback gold, savings, and XP if recipe was cooked
    // =====================================================
    
    // 1. Get recipe details before deletion (include all fields for logic)
    const { data: recipe, error: recipeError } = await supabase
      .from('saved_recipes')
      .select('first_cooked_at, gold_earned, xp_earned, savings_vs_buying, recipe_title, times_cooked')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error on 0 rows

    if (recipeError) {
      console.error('[DELETE RECIPE] Database error:', recipeError);
      return errorResponse('Database error while fetching recipe', 500);
    }

    if (!recipe) {
      console.log('[DELETE RECIPE] Recipe not found or already deleted:', params.id);
      return errorResponse('Recipe not found or already deleted', 404);
    }

    let goldSubtracted = 0;
    let xpSubtracted = 0;
    let savingsSubtracted = 0;
    let newBalance = 0;
    let newCurrentXp = 0;
    let newTotalSavings = 0;
    let totalCooks = 0;

    // 2. If recipe was cooked (one or more times), subtract ALL rewards
    if (recipe?.first_cooked_at) {
      // Query ALL cook history for this recipe
      const { data: cookHistory, error: historyError } = await supabase
        .from('recipe_cook_history')
        .select('gold_earned, xp_earned')
        .eq('recipe_id', params.id);

      if (!historyError && cookHistory && cookHistory.length > 0) {
        // Sum all rewards from all cooks
        const totalGold = cookHistory.reduce((sum, h) => sum + (h.gold_earned || 0), 0);
        const totalXp = cookHistory.reduce((sum, h) => sum + (h.xp_earned || 0), 0);
        totalCooks = cookHistory.length;
        
        console.log('[DELETE RECIPE] 🔄 Recipe cooked ${totalCooks}x, subtracting ALL rewards:', {
          totalGold,
          totalXp,
          savings: recipe.savings_vs_buying,
          cooks: totalCooks
        });

        // Get current profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('wallet_balance, current_xp, total_savings_rp')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          const currentBalance = profile.wallet_balance || 0;
          const currentXp = profile.current_xp || 0;
          const currentSavings = profile.total_savings_rp || 0;

          // Subtract ALL rewards (floor at 0 to prevent negative)
          newBalance = Math.max(0, currentBalance - totalGold);
          newCurrentXp = Math.max(0, currentXp - totalXp);
          newTotalSavings = Math.max(0, currentSavings - (recipe.savings_vs_buying || 0));

          goldSubtracted = currentBalance - newBalance;
          xpSubtracted = currentXp - newCurrentXp;
          savingsSubtracted = currentSavings - newTotalSavings;

          // Update profile with all subtractions
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              wallet_balance: newBalance,
              current_xp: newCurrentXp,
              total_savings_rp: newTotalSavings,
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('[DELETE RECIPE] ⚠️ Failed to update profile:', updateError);
          } else {
            console.log('[DELETE RECIPE] ✅ Profile updated:', {
              goldSubtracted,
              xpSubtracted,
              savingsSubtracted,
              newBalance,
              newCurrentXp,
              newTotalSavings,
            });
          }
        }
      }
    }

    // 3. Food logs will be deleted automatically via CASCADE
    // When recipe is deleted → cook_history is deleted → food_logs are deleted
    console.log('[DELETE RECIPE] Food logs will be cascaded automatically');

    // 4. Delete the recipe
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[DELETE RECIPE] Error:', error);
      throw error;
    }

    console.log('[DELETE RECIPE] ✅ Deleted:', params.id);

    // Return with all subtraction info for frontend cache update
    // Return with all subtraction info for frontend cache update
    const message = recipe?.first_cooked_at
      ? `Resep dihapus (${totalCooks}x dimasak). -${goldSubtracted}🪙 -${xpSubtracted}XP -Rp${savingsSubtracted.toLocaleString()}`
      : 'Resep berhasil dihapus';

    return successResponse({
      goldSubtracted,
      xpSubtracted,
      savingsSubtracted,
      newBalance,
      newCurrentXp,
      newTotalSavings,
      wasCooked: !!recipe?.first_cooked_at,
      totalCooks,
    }, message);

  } catch (error: any) {
    console.error('[DELETE RECIPE] ❌ Error:', error);
    
    return errorResponse(error?.message || 'Failed to delete recipe', 500);
  }
}

/**
 * PATCH /api/recipes/:id
 * Updates a saved recipe (e.g., toggle favorite)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== [PATCH RECIPE] API Called ===', params.id);
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Create Supabase client with token
    const supabase = createApiClient(token);
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { is_favorite } = body;

    if (typeof is_favorite !== 'boolean') {
      return errorResponse('Invalid input: is_favorite must be a boolean', 400);
    }

    // Update recipe
    const { data, error } = await supabase
      .from('saved_recipes')
      .update({ 
        is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[PATCH RECIPE] Error:', error);
      throw error;
    }

    console.log('[PATCH RECIPE] ✅ Updated:', params.id);

    return successResponse({
      recipe: data,
    }, 'Recipe updated successfully');

  } catch (error: any) {
    console.error('[PATCH RECIPE] ❌ Error:', error);
    
    return errorResponse(error?.message || 'Failed to update recipe', 500);
  }
}
