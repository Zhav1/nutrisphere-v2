// CRITICAL: Required to prevent static rendering at build time
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { calculateLevelProgress, calculateHealthScore } from '@/lib/gamification';
import { getWIBDate } from '@/lib/dateUtils';
import { APP_MESSAGES } from '@/lib/constants';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/**
 * POST /api/food-logs/save
 * Saves a food log and awards XP + Gold based on health grade
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== [SAVE FOOD LOG] API Called ===');
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse(APP_MESSAGES.ERRORS.UNAUTHORIZED, 401);
    }

    // Create Supabase client with Authorization header (matches recipe save pattern)
    const supabase = createApiClient(token);

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[SAVE FOOD LOG] Auth error:', authError);
      return errorResponse('Sesi berakhir. Silakan login kembali.', 401);
    }

    console.log('[SAVE FOOD LOG] User authenticated:', user.id);

    // Parse request body
    const body = await request.json();
    const { foodLog } = body;

    if (!foodLog) {
      return errorResponse('Missing food log data', 400);
    }

    // Prepare food log data
    const foodLogData = {
      user_id: user.id,
      food_name: foodLog.food_name,
      calories: Math.round(foodLog.calories || 0),
      protein: Number((foodLog.protein || 0).toFixed(1)),
      carbs: Number((foodLog.carbs || 0).toFixed(1)),
      fat: Number((foodLog.fat || 0).toFixed(1)),
      sugar: Number((foodLog.sugar || 0).toFixed(1)),
      sodium: Math.round(foodLog.sodium || 0),
      health_grade: foodLog.health_grade || null,
      source: foodLog.source || 'vision_scan',
      meal_type: foodLog.meal_type || null,
      image_url: foodLog.image_url || null,
      nutrition_data: foodLog.nutrition_data || null,
      consumed_at: foodLog.consumed_at || new Date().toISOString(),
    };

    console.log('[SAVE FOOD LOG] Inserting food log:', foodLogData.food_name);

    // Insert food log
    const { data: savedLog, error: insertError } = await supabase
      .from('food_logs')
      .insert(foodLogData)
      .select()
      .single();

    if (insertError) {
      console.error('[SAVE FOOD LOG] Insert error:', insertError);
      return errorResponse(insertError.message, 500);
    }

    console.log('[SAVE FOOD LOG] ✅ Food log saved! ID:', savedLog.id);

    // 🛡️ ANTI-CHEAT: Only award XP for actual meal photos (food_plate)
    // Scanning nutrition labels (vision_scan) does NOT earn XP
    // This prevents users from gaming NutriGotchi by just scanning packages
    const xpEligibleSources = ['food_plate'];
    const shouldAwardXp = xpEligibleSources.includes(foodLog.source);
    
    let xpEarned = 0;
    let goldEarned = 0;

    if (shouldAwardXp) {
      // 🪙 CALCULATE XP & GOLD REWARDS (only for food_plate)
      // XP based on health grade: A=30, B=20, C=10, D=5
      const gradeXp: Record<string, number> = { 'A': 30, 'B': 20, 'C': 10, 'D': 5 };
      const baseXp = gradeXp[foodLog.health_grade] || 15;

      // 🪙 REBALANCED REWARD LOGIC (Dec 15, 2024)
      // Gold should be LOWER than Cooking (which gives 15-40 Gold)
      // Base: 10 Gold + Bonus: +15 Gold for healthy food (Grade A/B) -> Max 25
      const baseScanGold = 10;
      const isHealthy = ['A', 'B'].includes(foodLog.health_grade);
      goldEarned = baseScanGold + (isHealthy ? 15 : 0);
      xpEarned = baseXp;

      console.log('[SAVE FOOD LOG] 🪙 Rewards (food_plate):', { xpEarned, goldEarned, healthGrade: foodLog.health_grade });
    } else {
      // Label scan – no XP to prevent cheating
      console.log('[SAVE FOOD LOG] ⚠️ No XP awarded - source is:', foodLog.source, '(only food_plate gets XP)');
    }

    // Get current profile
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance, total_savings_rp, current_xp, max_xp, level, streak_days')
      .eq('id', user.id)
      .single();

    // Create profile if doesn't exist
    if (profileError?.code === 'PGRST116' || !profile) {
      console.log('[SAVE FOOD LOG] Creating profile...');
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: user.email?.split('@')[0] || 'User',
          wallet_balance: 0,
          total_savings_rp: 0,
          current_xp: 0,
          max_xp: 100,
          level: 1,
          health: 100,
          mood: 'neutral',
          recipes_cooked: 0,
          streak_days: 0,
        })
        .select()
        .single();
      profile = newProfile;
    }

    // UPDATE PROFILE WITH REWARDS (Using centralized gamification logic)
    if (profile && shouldAwardXp && (xpEarned > 0 || goldEarned > 0)) {
      
      const { newXp, newLevel, newMaxXp, leveledUp } = calculateLevelProgress(
        profile.current_xp || 0,
        profile.level || 1,
        xpEarned
      );

      const currentBalance = Number(profile.wallet_balance) || 0;
      const newBalance = currentBalance + goldEarned;

      // Update profile with XP and Gold
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          wallet_balance: newBalance,
          current_xp: newXp,
          level: newLevel,
          max_xp: newMaxXp,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('[SAVE FOOD LOG] Profile update error:', updateError);
      } else {
        console.log('[SAVE FOOD LOG] ✅ Profile updated! Balance:', newBalance, 'XP:', newXp, leveledUp ? '🎉 LEVEL UP!' : '');
      }
    } else if (profile) {
      console.log('[SAVE FOOD LOG] 📝 Food logged (no XP/Gold - label scan)');
    }

    // 💚 REBALANCED HEALTH LOGIC (Dec 15, 2024)
    // Using Centralized Gamification Logic + WIB Timezone
    try {
      // 1. Fetch recent logs (last 3 days)
      const threeDaysAgo = getWIBDate();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data: recentLogs } = await supabase
        .from('food_logs')
        .select('health_grade')
        .eq('user_id', user.id)
        .gte('consumed_at', threeDaysAgo.toISOString())
        .not('health_grade', 'is', null);

      // 2. Calculate score using centralized logic
      const { health: finalHealth, mood: finalMood } = calculateHealthScore(recentLogs || []);

      console.log('[SAVE FOOD LOG] 💚 Health Calc (Centralized):', {
        logCount: recentLogs?.length || 0,
        finalHealth,
        finalMood
      });

      // 3. Update Profile
      const { error: healthUpdateError } = await supabase
        .from('profiles')
        .update({
          health: finalHealth,
          mood: finalMood
        })
        .eq('id', user.id);

      if (healthUpdateError) console.error('[SAVE FOOD LOG] Health update failed:', healthUpdateError);

    } catch (err) {
      console.warn('[SAVE FOOD LOG] Health calc failed:', err);
    }

    // Return success with rewards
    return successResponse({
      foodLogId: savedLog.id,
      xpEarned,
      goldEarned,
      source: foodLog.source,
      // For dashboard nutrition display
      nutrition: {
        calories: foodLogData.calories,
        protein: foodLogData.protein,
        carbs: foodLogData.carbs,
        fat: foodLogData.fat,
        sugar: foodLogData.sugar,
      }
    }, APP_MESSAGES.SUCCESS.FOOD_LOG_SAVED);

  } catch (error: any) {
    console.error('[SAVE FOOD LOG] ❌ Error:', error);
    return errorResponse(error?.message || 'Failed to save food log', 500);
  }
}
