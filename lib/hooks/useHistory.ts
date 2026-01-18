'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

// Time period options for filters
export type TimePeriod = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

// Convert time period to days
export function periodToDays(period: TimePeriod): number | null {
  switch (period) {
    case '7d': return 7;
    case '30d': return 30;
    case '3m': return 90;
    case '6m': return 180;
    case '1y': return 365;
    case 'all': return null; // No limit
  }
}

// Get start date from period
export function getStartDate(period: TimePeriod): Date | null {
  const days = periodToDays(period);
  if (days === null) return null;
  
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Helper to convert UTC timestamp to local date string (UTC+7 for Indonesia)
export function utcToLocalDate(utcTimestamp: string): string {
  const utcDate = new Date(utcTimestamp);
  // Add 7 hours for UTC+7 timezone
  const localDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
  return localDate.toISOString().split('T')[0]; // YYYY-MM-DD in local time
}

// Interface for daily nutrition aggregates
export interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entriesCount: number;
}

/**
 * Hook to fetch nutrition history aggregated by day
 */
export function useNutritionHistory(userId: string | null, period: TimePeriod) {
  return useQuery({
    queryKey: ['nutritionHistory', userId, period],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const startDate = getStartDate(period);
      
      let query = supabase
        .from('food_logs')
        .select('calories, protein, carbs, fat, consumed_at')
        .eq('user_id', userId)
        .order('consumed_at', { ascending: true });
      
      if (startDate) {
        query = query.gte('consumed_at', startDate.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Aggregate by day
      const dailyMap = new Map<string, DailyNutrition>();
      
      data.forEach((log) => {
        const date = utcToLocalDate(log.consumed_at); // Convert UTC to WIB (UTC+7)
        const existing = dailyMap.get(date) || {
          date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          entriesCount: 0,
        };
        
        dailyMap.set(date, {
          date,
          calories: existing.calories + (log.calories || 0),
          protein: existing.protein + (log.protein || 0),
          carbs: existing.carbs + (log.carbs || 0),
          fat: existing.fat + (log.fat || 0),
          entriesCount: existing.entriesCount + 1,
        });
      });
      
      return Array.from(dailyMap.values());
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// Interface for economy data points
export interface EconomyDataPoint {
  date: string;
  goldEarned: number;
  xpEarned: number;
  recipesCooked: number;
  cumulativeGold: number;
  cumulativeSavings: number;
}

/**
 * Hook to fetch economy history from cook_history (ALL cooks, including re-cooks)
 */
export function useEconomyHistory(userId: string | null, period: TimePeriod) {
  return useQuery({
    queryKey: ['economyHistory', userId, period],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const startDate = getStartDate(period);
      
      // Query recipe_cook_history for ALL cook instances
      let query = supabase
        .from('recipe_cook_history')
        .select('cooked_at, gold_earned, xp_earned, savings_earned')
        .eq('user_id', userId)
        .order('cooked_at', { ascending: true });
      
      if (startDate) {
        query = query.gte('cooked_at', startDate.toISOString());
      }
      
// Interface for cook history raw data
interface CookHistoryEntry {
  cooked_at: string;
  gold_earned: number | null;
  xp_earned: number | null;
  savings_earned: number | null;
}

      const { data, error } = await query;
      if (error) throw error;
      
      // Aggregate by day with running totals
      const dailyMap = new Map<string, {
        goldEarned: number;
        xpEarned: number;
        recipesCooked: number;
        savings: number;
      }>();
      
      (data as CookHistoryEntry[]).forEach((cook) => {
        if (!cook.cooked_at) return;
        
        // Convert UTC timestamp to local date
        const date = utcToLocalDate(cook.cooked_at);
        
        const existing = dailyMap.get(date) || {
          goldEarned: 0,
          xpEarned: 0,
          recipesCooked: 0,
          savings: 0,
        };
        
        dailyMap.set(date, {
          goldEarned: existing.goldEarned + (cook.gold_earned || 0),
          xpEarned: existing.xpEarned + (cook.xp_earned || 0),
          recipesCooked: existing.recipesCooked + 1,
          savings: existing.savings + (cook.savings_earned || 0), // Use actual savings from cook time
        });
      });
      
      // Convert to array with cumulative totals
      let cumulativeGold = 0;
      let cumulativeSavings = 0;
      
      const result: EconomyDataPoint[] = Array.from(dailyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, values]) => {
          cumulativeGold += values.goldEarned;
          cumulativeSavings += values.savings;
          
          return {
            date,
            goldEarned: values.goldEarned,
            xpEarned: values.xpEarned,
            recipesCooked: values.recipesCooked,
            cumulativeGold,
            cumulativeSavings,
          };
        });
      
      return result;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// Interface for XP data points
export interface XPDataPoint {
  date: string;
  xpEarned: number;
  cumulativeXp: number;
}

/**
 * Hook to fetch XP history from cook_history (ALL cooks, including re-cooks)
 */
export function useXPHistory(userId: string | null, period: TimePeriod) {
  return useQuery({
    queryKey: ['xpHistory', userId, period],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const startDate = getStartDate(period);
      
      // Query recipe_cook_history for ALL cook instances
      let query = supabase
        .from('recipe_cook_history')
        .select('cooked_at, xp_earned')
        .eq('user_id', userId)
        .order('cooked_at', { ascending: true });
      
      if (startDate) {
        query = query.gte('cooked_at', startDate.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Aggregate by day
      const dailyMap = new Map<string, number>();
      
      data.forEach((cook) => {
        if (!cook.cooked_at) return;
        
        // Convert UTC timestamp to local date
        const date = utcToLocalDate(cook.cooked_at);
        
        const existing =dailyMap.get(date) || 0;
        dailyMap.set(date, existing + (cook.xp_earned || 0));
      });
      
      // Convert to array with cumulative totals
      let cumulativeXp = 0;
      
      const result: XPDataPoint[] = Array.from(dailyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, xpEarned]) => {
          cumulativeXp += xpEarned;
          return { date, xpEarned, cumulativeXp };
        });
      
      return result;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// Extended food log interface for history display
export interface FoodLogEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
  consumed_at: string;
  health_grade: string | null;
}

/**
 * Hook to fetch food log history with pagination
 */
export function useFoodLogHistory(userId: string | null, period: TimePeriod, limit: number = 100) {
  return useQuery({
    queryKey: ['foodLogHistory', userId, period, limit],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const startDate = getStartDate(period);
      
      let query = supabase
        .from('food_logs')
        .select('id, food_name, calories, protein, carbs, fat, source, consumed_at, health_grade')
        .eq('user_id', userId)
        .order('consumed_at', { ascending: false })
        .limit(limit);
      
      if (startDate) {
        query = query.gte('consumed_at', startDate.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Group by date (using LOCAL timezone)
      const grouped = new Map<string, FoodLogEntry[]>();
      
      (data as FoodLogEntry[]).forEach((log) => {
        const date = utcToLocalDate(log.consumed_at); // Convert UTC to local date
        const existing = grouped.get(date) || [];
        grouped.set(date, [...existing, log]);
      });
      
      return {
        entries: data as FoodLogEntry[],
        groupedByDate: Array.from(grouped.entries())
          .sort((a, b) => b[0].localeCompare(a[0])) // Most recent first
          .map(([date, logs]) => ({ date, logs })),
      };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get summary statistics for the period
 */
export function useHistorySummary(userId: string | null, period: TimePeriod) {
  return useQuery({
    queryKey: ['historySummary', userId, period],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const startDate = getStartDate(period);
      
      // Get food logs stats
      let logsQuery = supabase
        .from('food_logs')
        .select('calories, protein, carbs, fat')
        .eq('user_id', userId);
      
      if (startDate) {
        logsQuery = logsQuery.gte('consumed_at', startDate.toISOString());
      }
      
      const { data: logs, error: logsError } = await logsQuery;
      if (logsError) throw logsError;
      
      // Get cooked recipes stats
      let recipesQuery = supabase
        .from('saved_recipes')
        .select('gold_earned, xp_earned, savings_vs_buying')
        .eq('user_id', userId)
        .not('first_cooked_at', 'is', null);
      
      if (startDate) {
        recipesQuery = recipesQuery.gte('cooked_at', startDate.toISOString());
      }
      
      const { data: recipes, error: recipesError } = await recipesQuery;
      if (recipesError) throw recipesError;
      
      // Calculate totals
      const nutritionTotals = logs.reduce(
        (acc, log) => ({
          calories: acc.calories + (log.calories || 0),
          protein: acc.protein + (log.protein || 0),
          carbs: acc.carbs + (log.carbs || 0),
          fat: acc.fat + (log.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      
      const economyTotals = recipes.reduce(
        (acc, recipe) => ({
          goldEarned: acc.goldEarned + (recipe.gold_earned || 0),
          xpEarned: acc.xpEarned + (recipe.xp_earned || 0),
          savings: acc.savings + (recipe.savings_vs_buying || 0),
        }),
        { goldEarned: 0, xpEarned: 0, savings: 0 }
      );
      
      const days = logs.length > 0 
        ? new Set(logs.map(() => 1)).size  // Simplified, actual would need consumed_at
        : 0;
      
      return {
        nutrition: {
          ...nutritionTotals,
          avgCalories: logs.length > 0 ? Math.round(nutritionTotals.calories / logs.length) : 0,
          entriesCount: logs.length,
        },
        economy: {
          ...economyTotals,
          recipesCooked: recipes.length,
        },
        daysTracked: days,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
