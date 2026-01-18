import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface StreakDate {
  date: string; // YYYY-MM-DD
  count: number;
}

/**
 * Hook to fetch distinct dates where the user cooked at least one recipe.
 * Used for the Streak Calendar and Weekly Streak Strip.
 * CRITICAL: Queries recipe_cook_history (actual cook events) not saved_recipes
 * Uses WIB (UTC+7) timezone conversion to match cook route
 */
export function useStreakHistory(userId: string | null) {
  return useQuery({
    queryKey: ['streakHistory', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      // Fetch from recipe_cook_history which has individual cook events
      const { data, error } = await supabase
        .from('recipe_cook_history')
        .select('cooked_at')
        .eq('user_id', userId)
        .order('cooked_at', { ascending: false });

      if (error) throw error;

      // Process dates with WIB timezone conversion (UTC+7)
      // The cook route stores dates in WIB, so we need to match that
      const uniqueDates = new Set<string>();
      const WIB_OFFSET = 7 * 60 * 60 * 1000; // 7 hours in ms
      
      data?.forEach((entry) => {
        if (entry.cooked_at) {
          // cooked_at is stored as ISO string. Convert to WIB date
          const utcDate = new Date(entry.cooked_at);
          const wibDate = new Date(utcDate.getTime() + WIB_OFFSET);
          const year = wibDate.getUTCFullYear();
          const month = String(wibDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(wibDate.getUTCDate()).padStart(2, '0');
          const dateStr = year + '-' + month + '-' + day;
          uniqueDates.add(dateStr);
        }
      });

      // Convert Set to Array of objects
      return Array.from(uniqueDates).map(date => ({ date, count: 1 }));
    },
    enabled: !!userId,
    // Data should update quickly after cooking
    staleTime: 1000 * 30, // 30 seconds
  });
}
