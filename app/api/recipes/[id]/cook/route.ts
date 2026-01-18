import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { calculateLevelProgress, calculateMaxXp } from '@/lib/gamification';
import { getWIBTodayString, isTodayWIB, isYesterdayWIB, getWIBDate } from '@/lib/dateUtils';
import { APP_MESSAGES } from '@/lib/constants';
import { successResponse, errorResponse } from '@/lib/apiResponse';

// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';



/**
 * POST /api/recipes/:id/cook
 * Marks a saved recipe as "cooked" and grants XP/Gold rewards
 * 
 * Rewards are only granted if:
 * 1. Recipe exists and belongs to user
 * 2. Recipe is not already cooked
 * 3. User has not exceeded daily cook limit (5/day)
 * 
 * If daily limit exceeded:
 * - Recipe is marked as cooked
 * - But NO XP/Gold is granted
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== [COOK RECIPE] API Called ===', params.id);

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create Supabase client with token
    const supabase = createApiClient(token);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[COOK RECIPE] User:', user.email);

    // Call RPC to cook recipe and grant rewards
    // BYPASS RPC: Use manual logic to ensure XP reset and limits work correctly
    return await fallbackCookRecipe(supabase, user.id, params.id);

    /* 
    const { data, error } = await supabase.rpc('cook_recipe_and_grant_rewards', {
      p_user_id: user.id,
      p_recipe_id: params.id,
    });
    /* 
    const { data, error } = await supabase.rpc('cook_recipe_and_grant_rewards', {
      p_user_id: user.id,
      p_recipe_id: params.id,
    });
    
    if (error) {
       console.error('[COOK RECIPE] RPC Error:', error);
       return await fallbackCookRecipe(supabase, user.id, params.id);
    }
    */
    
    // NOTE: All logic below is handled by fallbackCookRecipe now
    // This return ensures we don't fall through to undefined variables
    return;

  } catch (error: any) {
    console.error('[COOK RECIPE] ❌ Error:', error);
    return errorResponse(error?.message || APP_MESSAGES.ERRORS.GENERIC, 500);
  }
}

/**
 * Fallback implementation with full gamification logic:
 * - Streak tracking (increment/reset, XP bonuses at 7/14/30 days)
 * - Faint state handling (revival mechanic - cook 3 recipes to revive)
 * - Streak shield protection
 * - Strict XP reset to 0 on level up
 */
async function fallbackCookRecipe(supabase: any, userId: string, recipeId: string) {
  console.log('[COOK RECIPE] Using fallback implementation with streak & faint logic');

  // Constants
  const DAILY_LIMIT = 5;
  const SICK_THRESHOLD = 20;
  const SICK_MULTIPLIER = 0.75;
  const HEALTH_RECOVERY = 8;
  const FAINT_RECOVERY_RECIPES = 3;
  const FAINT_REVIVE_HEALTH = 20;

  // Streak XP bonus thresholds
  const STREAK_BONUS_7 = 0.10;  // +10% XP
  const STREAK_BONUS_14 = 0.20; // +20% XP
  const STREAK_BONUS_30 = 0.50; // +50% XP

  // 1. Get recipe
  const { data: recipe, error: recipeError } = await supabase
    .from('saved_recipes')
    .select('*')
    .eq('id', recipeId)
    .eq('user_id', userId)
    .single();

  if (recipeError || !recipe) {
    return NextResponse.json(
      { error: 'Recipe not found' },
      { status: 404 }
    );
  }

  // ✅ REMOVED is_cooked check to allow recipe re-cooking
  // Users can now cook the same recipe multiple times
  // Each cook respects the daily limit and grants rewards accordingly

  // 2. Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Profile not found' },
      { status: 404 }
    );
  }

  // ==========================================
  // 3. FAINT STATE HANDLING
  // ==========================================
  const isFainted = profile.is_fainted || false;
  let faintRecoveryCount = profile.faint_recovery_count || 0;
  let revivingFromFaint = false;
  let stillFainted = isFainted;

  if (isFainted) {
    console.log('[COOK RECIPE] 💀 User is FAINTED! Recovery progress:', faintRecoveryCount + 1, '/', FAINT_RECOVERY_RECIPES);
    faintRecoveryCount += 1;

    if (faintRecoveryCount >= FAINT_RECOVERY_RECIPES) {
      // REVIVED!
      revivingFromFaint = true;
      stillFainted = false;
      faintRecoveryCount = 0;
      console.log('[COOK RECIPE] 🎉 USER REVIVED from faint!');
    }
  }

  // ==========================================
  // 4. STREAK CALCULATION
  // ==========================================
  // CRITICAL FIX: Use WIB (UTC+7) timezone via shared utility
  const today = getWIBTodayString();
  const lastCookDate = profile.last_cook_date;
  let newStreakDays = profile.streak_days || 0;
  let streakShieldUsed = false;

  // DEBUG: Log date comparison from shared utility
  console.log('[COOK RECIPE] 📅 STREAK DEBUG (Standardized WIB):', {
    today,
    lastCookDate,
    isToday: isTodayWIB(lastCookDate),
    isYesterday: isYesterdayWIB(lastCookDate),
    currentStreak: newStreakDays,
  });

  if (!lastCookDate) {
    // First ever cook
    newStreakDays = 1;
    console.log('[COOK RECIPE] 🔥 First cook ever! Starting streak at 1');
  } else if (isTodayWIB(lastCookDate)) {
    // Already cooked today, keep streak as is
    console.log('[COOK RECIPE] 🔥 Already cooked today, streak stays at:', newStreakDays);
  } else if (isYesterdayWIB(lastCookDate)) {
    // Consecutive day - increment streak
    newStreakDays += 1;
    console.log('[COOK RECIPE] 🔥 Consecutive day! Streak now:', newStreakDays);
  } else {
    // Gap > 1 day - check for streak shield
    if (profile.streak_shield_active) {
      // Use shield, keep streak
      streakShieldUsed = true;
      console.log('[COOK RECIPE] 🛡️ Streak Shield ACTIVATED! Streak protected:', newStreakDays);
    } else {
      // Reset streak
      console.log('[COOK RECIPE] 💔 Streak broken! Was:', newStreakDays, ', now resetting to 1');
      newStreakDays = 1;
    }
  }

  // ==========================================
  // 5. XP & GOLD CALCULATION
  // ==========================================

  // Check and reset daily count
  let currentCount = profile.daily_cook_count || 0;
  const resetDate = profile.last_cook_reset_date;
  
  if (resetDate < today) {
    console.log('[COOK RECIPE] 🔄 RESETTING daily count! Old date:', resetDate, '→ New date:', today);
    currentCount = 0;
    await supabase
      .from('profiles')
      .update({ daily_cook_count: 0, last_cook_reset_date: today })
      .eq('id', userId);
  }

  const canEarnRewards = currentCount < DAILY_LIMIT && !isFainted;

  // Base rewards by recipe type
  const baseGold: Record<string, number> = { Hemat: 15, Balance: 25, Premium: 40 };
  const baseXp: Record<string, number> = { Hemat: 25, Balance: 35, Premium: 50 };

  let goldEarned = baseGold[recipe.recipe_type] || 25;
  let xpEarned = baseXp[recipe.recipe_type] || 25;

  // Apply streak XP bonus
  let streakMultiplier = 1.0;
  if (newStreakDays >= 30) {
    streakMultiplier = 1 + STREAK_BONUS_30;
  } else if (newStreakDays >= 14) {
    streakMultiplier = 1 + STREAK_BONUS_14;
  } else if (newStreakDays >= 7) {
    streakMultiplier = 1 + STREAK_BONUS_7;
  }

  if (streakMultiplier > 1.0) {
    const originalXp = xpEarned;
    xpEarned = Math.floor(xpEarned * streakMultiplier);
    console.log('[COOK RECIPE] 🔥 Streak bonus applied!', { streak: newStreakDays, multiplier: streakMultiplier, originalXp, newXp: xpEarned });
  }

  // Apply sick mode reduction
  if (profile.health <= SICK_THRESHOLD && profile.health > 0) {
    xpEarned = Math.floor(xpEarned * SICK_MULTIPLIER);
    console.log('[COOK RECIPE] 😷 Sick mode XP reduction applied');
  }

  // No rewards if over daily limit OR fainted
  if (!canEarnRewards) {
    goldEarned = 0;
    xpEarned = 0;
    if (isFainted) {
      console.log('[COOK RECIPE] 💀 No rewards - user is fainted. Cooking toward revival...');
    } else {
      console.log('[COOK RECIPE] ⚠️ Daily limit reached! No rewards granted.');
    }
  }

  // ==========================================
  // 6. LEVEL UP CALCULATION (Centralized Logic)
  // ==========================================
  // Use shared utility to ensure STRICT RESET logic matches Food Logs
  const { newXp, newLevel, newMaxXp, leveledUp } = calculateLevelProgress(
    profile.current_xp || 0,
    profile.level || 1,
    xpEarned
  );

  console.log('[COOK RECIPE] Level Progress:', { currentXp: profile.current_xp, xpEarned, newXp, newLevel, leveledUp });

  // ==========================================
  // 7. HEALTH CALCULATION
  // ==========================================
  // Use nullish coalescing (??) instead of OR (||) to preserve health=0 as valid
  let newHealth = profile.health ?? 100;

  if (revivingFromFaint) {
    // Reviving from faint - set to revival HP
    newHealth = FAINT_REVIVE_HEALTH;
    console.log('[COOK RECIPE] 💚 Revived! Health set to:', newHealth);
  } else if (!isFainted) {
    // Normal health recovery
    newHealth = Math.min(100, newHealth + HEALTH_RECOVERY);
  }
  // If still fainted, no health recovery

  // ==========================================
  // 8. UPDATE RECIPE COOK TIMESTAMPS & INSERT HISTORY
  // ==========================================
  console.log('[COOK RECIPE] Updating recipe cook status...');
  
  const cookTimestamp = new Date().toISOString();
  const isFirstCook = !recipe.first_cooked_at;
  
  // Update recipe with new timestamps
  console.log('[COOK RECIPE] 📝 Attempting to update recipe:', {
    recipeId,
    currentTimesCooked: recipe.times_cooked,
    newTimesCooked: (recipe.times_cooked || 0) + 1,
    first_cooked_at: recipe.first_cooked_at || cookTimestamp,
    last_cooked_at: cookTimestamp,
  });
  
  const { data: updateResult, error: recipeUpdateError } = await supabase
    .from('saved_recipes')
    .update({
      // New fields
      first_cooked_at: recipe.first_cooked_at || cookTimestamp,
      last_cooked_at: cookTimestamp,
      times_cooked: (recipe.times_cooked || 0) + 1,
      // Keep old fields for backward compatibility
      is_cooked: true,
      cooked_at: recipe.cooked_at || cookTimestamp,
      gold_earned: goldEarned,
      xp_earned: xpEarned,
    })
    .eq('id', recipeId)
    .select();
  
  if (recipeUpdateError) {
    console.error('[COOK RECIPE] ❌ Recipe update FAILED:', {
      error: recipeUpdateError,
      message: recipeUpdateError.message,
      details: recipeUpdateError.details,
      hint: recipeUpdateError.hint,
      code: recipeUpdateError.code,
    });
  } else {
    console.log('[COOK RECIPE] ✅ Recipe updated successfully:', updateResult);
  }
  
  // Insert into cook history for timeline tracking
  const { data: cookHistoryEntry, error: historyError } = await supabase
    .from('recipe_cook_history')
    .insert({
      recipe_id: recipeId,
      user_id: userId,
      cooked_at: cookTimestamp,
      gold_earned: goldEarned,
      xp_earned: xpEarned,
      savings_earned: recipe.savings_vs_buying || 0, // Track actual savings at cook time
      hit_daily_limit: !canEarnRewards || currentCount >= DAILY_LIMIT,
    })
    .select()
    .single();
  
  if (historyError) {
    console.error('[COOK RECIPE] ⚠️ Cook history insert failed:', historyError);
  } else {
    console.log('[COOK RECIPE] ✅ Cook history recorded ID:', cookHistoryEntry?.id);
  }



  // ==========================================
  // 9. LOG NUTRITION TO FOOD_LOGS (with cook history link)
  // ==========================================
  console.log('[COOK RECIPE] Logging nutrition to food_logs...');
  const { error: foodLogError } = await supabase
    .from('food_logs')
    .insert({
      user_id: userId,
      food_name: recipe.recipe_title,
      calories: recipe.total_calories || 0,
      protein: recipe.total_protein || 0,
      fat: recipe.total_fat || 0,
      carbs: recipe.total_carbs || 0,
      source: 'recipe',
      cook_history_id: cookHistoryEntry?.id, // Link for deletion tracking
    });

  if (foodLogError) {
    console.error('[COOK RECIPE] ⚠️ Food log failed:', foodLogError);
  }

  // ==========================================
  // 10. UPDATE PROFILE
  // ==========================================
  const newDailyCount = canEarnRewards && !isFainted ? currentCount + 1 : currentCount;
  const recipesSavings = recipe.savings_vs_buying || 0;
  const newTotalSavings = (profile.total_savings_rp || 0) + recipesSavings;

  const newMood = stillFainted ? 'sick' : (newHealth >= 60 ? 'happy' : newHealth >= 20 ? 'neutral' : 'sick');

  console.log('[COOK RECIPE] Updating profile...');
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      wallet_balance: (profile.wallet_balance || 0) + goldEarned,
      current_xp: newXp,
      level: newLevel,
      max_xp: newMaxXp,
      health: newHealth,
      mood: newMood,
      total_savings_rp: newTotalSavings,
      // Streak fields
      streak_days: newStreakDays,
      last_cook_date: today,
      streak_shield_active: streakShieldUsed ? false : profile.streak_shield_active,
      // Faint fields
      is_fainted: stillFainted,
      faint_recovery_count: faintRecoveryCount,
      // Daily limit
      ...(profile.daily_cook_count !== undefined ? { daily_cook_count: newDailyCount } : {}),
      ...(profile.consecutive_inactive_days !== undefined ? { consecutive_inactive_days: 0 } : {}),
    })
    .eq('id', userId);

  if (profileUpdateError) {
    console.error('[COOK RECIPE] ⚠️ Profile update failed:', profileUpdateError);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }

  console.log('[COOK RECIPE] ✅ Success!', { goldEarned, xpEarned, streak: newStreakDays, fainted: stillFainted });

  // ==========================================
  // 11. BUILD RESPONSE
  // ==========================================

  let message = APP_MESSAGES.SUCCESS.RECIPE_COOKED;
  
  if (revivingFromFaint) {
    message = APP_MESSAGES.GAMIFICATION.REVIVED(newHealth);
  } else if (isFainted && !revivingFromFaint) {
    message = APP_MESSAGES.GAMIFICATION.STILL_FAINTED(faintRecoveryCount, FAINT_RECOVERY_RECIPES);
  } else if (!canEarnRewards && currentCount >= DAILY_LIMIT) {
    message = APP_MESSAGES.ERRORS.DAILY_LIMIT;
  } else if (leveledUp) {
    message = APP_MESSAGES.GAMIFICATION.LEVEL_UP(newLevel);
  } else if (newStreakDays >= 7 && newStreakDays % 7 === 0) {
    const bonusPercent = newStreakDays >= 30 ? 50 : newStreakDays >= 14 ? 20 : 10;
    message = APP_MESSAGES.GAMIFICATION.STREAK_BONUS(newStreakDays, bonusPercent);
  }

  // Use standardized success response
  // We explicitly passthrough specific fields for backward compatibility with frontend
  return successResponse(
    {
      goldEarned,
      xpEarned,
      newBalance: (profile.wallet_balance || 0) + goldEarned,
      newXp,
      newLevel,
      newMaxXp,
      newHealth,
      newTotalSavings,
      dailyCookCount: newDailyCount,
      hitDailyLimit: currentCount >= DAILY_LIMIT,
      leveledUp, // Now correctly defined
      streakDays: newStreakDays,
      streakMultiplier,
      streakShieldUsed,
      isFainted: stillFainted,
      faintRecoveryCount,
      revivedFromFaint: revivingFromFaint,
    },
    message
  );
}

