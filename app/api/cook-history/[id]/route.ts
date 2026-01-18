import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/cook-history/:id
 * Deletes a single cook instance (undo last cook)
 * Subtracts gold, XP, and nutrition from that specific cook
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== [DELETE COOK] API Called ===', params.id);
    
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

    // 1. Get cook history entry (verify ownership and get details)
    const { data: cookEntry, error: cookError } = await supabase
      .from('recipe_cook_history')
      .select('*, saved_recipes(id, recipe_title, times_cooked, first_cooked_at, last_cooked_at, savings_vs_buying)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (cookError || !cookEntry) {
      console.error('[DELETE COOK] Not found or unauthorized:', cookError);
      return errorResponse('Cook entry not found or unauthorized', 404);
    }

    const recipe = cookEntry.saved_recipes;
    const goldToSubtract = cookEntry.gold_earned || 0;
    const xpToSubtract = cookEntry.xp_earned || 0;
    const savingsToSubtract = recipe.savings_vs_buying || 0; // Get savings from recipe

    console.log('[DELETE COOK] Deleting cook:', {
      cookId: params.id,
      recipeTitle: recipe.recipe_title,
      goldToSubtract,
      xpToSubtract,
      savingsToSubtract,
    });

    // 2. Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance, current_xp, total_savings_rp')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse('Profile not found', 404);
    }

    // 3. Calculate new values (subtract, floor at 0)
    const currentBalance = profile.wallet_balance || 0;
    const currentXp = profile.current_xp || 0;
    const currentSavings = profile.total_savings_rp || 0;
    
    const newBalance = Math.max(0, currentBalance - goldToSubtract);
    const newXp = Math.max(0, currentXp - xpToSubtract);
    const newSavings = Math.max(0, currentSavings - savingsToSubtract);

    // 4. Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        wallet_balance: newBalance,
        current_xp: newXp,
        total_savings_rp: newSavings, // Also update savings!
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[DELETE COOK] Profile update failed:', updateError);
      return errorResponse('Failed to update profile', 500);
    }

    // 5. Get previous cook to update last_cooked_at
    const { data: previousCook } = await supabase
      .from('recipe_cook_history')
      .select('cooked_at')
      .eq('recipe_id', recipe.id)
      .neq('id', params.id)
      .order('cooked_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 6. Update recipe (decrement cook count, update timestamps)
    const newCookCount = Math.max(0, (recipe.times_cooked || 1) - 1);
    const recipeUpdate: any = {
      times_cooked: newCookCount,
    };

    if (newCookCount === 0) {
      // No more cooks - reset to uncooked state
      recipeUpdate.first_cooked_at = null;
      recipeUpdate.last_cooked_at = null;
    } else if (previousCook) {
      // Update last_cooked_at to previous cook's timestamp
      recipeUpdate.last_cooked_at = previousCook.cooked_at;
    }

    const { error: recipeUpdateError } = await supabase
      .from('saved_recipes')
      .update(recipeUpdate)
      .eq('id', recipe.id);

    if (recipeUpdateError) {
      console.error('[DELETE COOK] Recipe update failed:', recipeUpdateError);
    }

    // 7. Delete cook history (CASCADE will delete food_logs automatically)
    const { error: deleteError } = await supabase
      .from('recipe_cook_history')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('[DELETE COOK] Delete failed:', deleteError);
      return errorResponse('Failed to delete cook entry', 500);
    }

    console.log('[DELETE COOK] ✅ Success:', {
      goldSubtracted: currentBalance - newBalance,
      xpSubtracted: currentXp - newXp,
      savingsSubtracted: currentSavings - newSavings,
      newBalance,
      newXp,
      newSavings,
      newCookCount,
    });

    return successResponse(
      {
        goldSubtracted: currentBalance - newBalance,
        xpSubtracted: currentXp - newXp,
        savingsSubtracted: currentSavings - newSavings,
        newBalance,
        newXp,
        newSavings,
        newCookCount,
        recipeId: recipe.id,
      },
      `Masak dibatalkan. -${currentBalance - newBalance}🪙 -${currentXp - newXp}XP -Rp${(currentSavings - newSavings).toLocaleString()}`
    );

  } catch (error: any) {
    console.error('[DELETE COOK] ❌ Error:', error);
    return errorResponse(error?.message || 'Failed to delete cook', 500);
  }
}
