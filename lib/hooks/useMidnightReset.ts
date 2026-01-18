'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to automatically invalidate relevant queries at midnight
 * Ensures daily metrics (nutrition, cooking limits, etc.) reset properly
 */
export function useMidnightInvalidation(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const checkAndInvalidate = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // Next midnight
      
      const msUntilMidnight = midnight.getTime() - now.getTime();

      console.log('[MidnightInvalidation] Scheduling invalidation in', Math.round(msUntilMidnight / 1000 / 60), 'minutes');

      // Schedule invalidation at midnight
      const timeout = setTimeout(() => {
        console.log('[MidnightInvalidation] 🕛 Midnight! Invalidating daily caches...');
        
        // Invalidate all daily-based queries
        queryClient.invalidateQueries({ queryKey: ['nutritionSummary', userId] });
        queryClient.invalidateQueries({ queryKey: ['profile', userId] });
        queryClient.invalidateQueries({ queryKey: ['foodLogs', userId] });
        queryClient.invalidateQueries({ queryKey: ['nutritionHistory', userId] });
        
        // Reschedule for next midnight
        checkAndInvalidate();
      }, msUntilMidnight);

      return timeout;
    };

    const timeout = checkAndInvalidate();

    return () => {
      clearTimeout(timeout);
    };
  }, [userId, queryClient]);
}

/**
 * Hook to check if data from profile needs client-side reset
 * Returns adjusted daily_cook_count based on current date
 * Uses WIB (UTC+7) timezone for Indonesian users
 */
export function useAdjustedDailyCookCount(
  dailyCookCount: number | undefined,
  lastResetDate: string | undefined
): number {
  if (dailyCookCount === undefined) return 0;
  if (!lastResetDate) return dailyCookCount;

  // Get today in WIB (UTC+7)
  const now = new Date();
  const wibNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const year = wibNow.getUTCFullYear();
  const month = String(wibNow.getUTCMonth() + 1).padStart(2, '0');
  const day = String(wibNow.getUTCDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
  // If last reset was before today (WIB), count should be 0
  if (lastResetDate < today) {
    return 0;
  }

  return dailyCookCount;
}
