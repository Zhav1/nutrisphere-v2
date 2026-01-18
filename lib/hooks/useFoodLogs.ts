import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type FoodSource = 'vision_scan' | 'ocr_scan' | 'object_detection' | 'manual' | 'recipe';
export type HealthGrade = 'A' | 'B' | 'C' | 'D';

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs?: number; // Optional to match scan results
  fat?: number; // Optional to match scan results
  sugar: number;
  sodium: number;
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
  health_grade: HealthGrade | null;
  meal_type: MealType | null;
  source: FoodSource;
  image_url: string | null;
  // Legacy OCR fields (optional for backward compatibility)
  ocr_raw_text?: string | null;
  ocr_sanitized_data?: NutritionalInfo | null;
  // New Vision field
  nutrition_data?: NutritionalInfo | null;
  consumed_at: string;
  created_at: string;
}

/**
 * Hook to fetch user's food logs
 * @param userId - User ID to fetch logs for
 * @param limit - Number of logs to fetch (default: 50)
 */
export function useFoodLogs(userId: string | null, limit = 50) {
  return useQuery({
    queryKey: ['foodLogs', userId, limit],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .order('consumed_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as FoodLog[];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
  });
}

/**
 * Hook to fetch food logs for a specific date range
 */
export function useFoodLogsByDateRange(
  userId: string | null,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['foodLogs', userId, 'range', startDate, endDate],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('consumed_at', startDate)
        .lte('consumed_at', endDate)
        .order('consumed_at', { ascending: false });
      
      if (error) throw error;
      return data as FoodLog[];
    },
    enabled: !!userId && !!startDate && !!endDate,
  });
}

/**
 * Hook to add a new food log entry
 */
export function useAddFoodLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: Omit<FoodLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('food_logs')
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      
      // Trigger NutriGotchi health recalculation
      try {
      const { error: rpcError } = await supabase.rpc(
        'calculate_nutrigotchi_health',
        { p_user_id: log.user_id }
      );

      if (rpcError) {
        console.warn('Health calculation failed:', rpcError.message);
      }
    } catch (err) {
      console.warn('Health calculation failed:', err);
    }
      
      return data as FoodLog;
    },
    onSuccess: (data) => {
      // Invalidate food logs cache
      queryClient.invalidateQueries({ queryKey: ['foodLogs', data.user_id] });
      // Invalidate profile cache (health may have changed)
      queryClient.invalidateQueries({ queryKey: ['profile', data.user_id] });
    },
  });
}

/**
 * Hook to bulk insert multiple food logs (for object detection)
 * Inserts all logs in a single transaction
 */
export function useBulkAddFoodLogs() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (logs: Omit<FoodLog, 'id' | 'created_at'>[]) => {
      if (logs.length === 0) throw new Error('No food logs to insert');
      
      const { data, error } = await supabase
        .from('food_logs')
        .insert(logs)
        .select();
      
      if (error) throw error;
      
      // Trigger NutriGotchi health recalculation
      if (data && data.length > 0) {
        try {
          await supabase.rpc('calculate_nutrigotchi_health', { p_user_id: logs[0].user_id });
        } catch (err) {
          console.warn('Health calculation failed:', err);
        }
      }
      
      return data as FoodLog[];
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['foodLogs', data[0].user_id] });
        queryClient.invalidateQueries({ queryKey: ['profile', data[0].user_id] });
      }
    },
  });
}

/**
 * Hook to update a food log entry
 */
export function useUpdateFoodLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FoodLog> & { id: string }) => {
      const { data, error } = await supabase
        .from('food_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as FoodLog;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['foodLogs', data.user_id] });
    },
  });
}

/**
 * Hook to delete a food log entry
 */
export function useDeleteFoodLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, userId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['foodLogs', result.userId] });
    },
  });
}

/**
 * Hook to get nutrition summary (aggregates)
 */
export function useNutritionSummary(userId: string | null, days: number = 7) {
  return useQuery({
    queryKey: ['nutritionSummary', userId, days],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      // Calculate start of day based on calendar date (not rolling 24h window)
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Set to start of today (00:00:00)
      startDate.setDate(startDate.getDate() - (days - 1)); // Go back (days - 1) calendar days
      
      const { data, error } = await supabase
        .from('food_logs')
        .select('calories, protein, carbs, fat, sugar, sodium, consumed_at')
        .eq('user_id', userId)
        .gte('consumed_at', startDate.toISOString());
      
      if (error) throw error;
      
      // Calculate totals and averages
      const totals = data.reduce(
        (acc, log) => ({
          calories: acc.calories + log.calories,
          protein: acc.protein + log.protein,
          carbs: acc.carbs + log.carbs,
          fat: acc.fat + log.fat,
          sugar: acc.sugar + log.sugar,
          sodium: acc.sodium + log.sodium,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, sodium: 0 }
      );
      
      const count = data.length || 1;
      const averages = {
        calories: Math.round(totals.calories / count),
        protein: Number((totals.protein / count).toFixed(1)),
        carbs: Number((totals.carbs / count).toFixed(1)),
        fat: Number((totals.fat / count).toFixed(1)),
        sugar: Number((totals.sugar / count).toFixed(1)),
        sodium: Number((totals.sodium / count).toFixed(1)),
      };
      
      return {
        totals,
        averages,
        // Count unique WIB dates (UTC+7)\r\n        daysTracked: new Set(data.map(log => {\r\n          const utcDate = new Date(log.consumed_at);\r\n          const wibDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));\r\n          return `${wibDate.getUTCFullYear()}-${String(wibDate.getUTCMonth() + 1).padStart(2, '0')}-${String(wibDate.getUTCDate()).padStart(2, '0')}`;\r\n        })).size,
        entriesCount: count,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes,
  });
}
