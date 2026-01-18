'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface HealthCheckResult {
  previous_health: number;
  new_health: number;
  health_change: number;
  inactive_days: number;
  mood: 'happy' | 'neutral' | 'sick';
  message: string;
}

/**
 * Hook to check and apply health decay on app load
 * Checks if > 24h since last health check and applies penalties if needed
 */
export function useHealthCheck(userId: string | null) {
  const queryClient = useQueryClient();
  const [lastCheckResult, setLastCheckResult] = useState<HealthCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const checkHealth = async () => {
      setIsChecking(true);
      try {
        // Get last health check time from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('last_health_check_at')
          .eq('id', userId)
          .single();

        if (!profile) {
          setIsChecking(false);
          return;
        }

        const lastCheck = new Date(profile.last_health_check_at || 0);
        const hoursSinceCheck = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60);

        // Only check if > 24 hours since last check
        if (hoursSinceCheck >= 24) {
          console.log('[HealthCheck] Applying health decay, hours since check:', hoursSinceCheck);

          // Call RPC to apply health decay
          const { data, error } = await supabase.rpc('check_and_apply_health_decay', {
            p_user_id: userId,
          });

          if (error) {
            console.error('[HealthCheck] RPC error:', error);
            // Fallback: just update last_health_check_at if RPC doesn't exist
            await supabase
              .from('profiles')
              .update({ last_health_check_at: new Date().toISOString() })
              .eq('id', userId);
          } else if (data) {
            console.log('[HealthCheck] Result:', data);
            setLastCheckResult(data as HealthCheckResult);

            // Invalidate profile cache to refresh UI
            queryClient.invalidateQueries({ queryKey: ['profile', userId] });
          }
        } else {
          console.log('[HealthCheck] Skipping, only', Math.round(hoursSinceCheck), 'hours since last check');
        }
      } catch (error) {
        console.error('[HealthCheck] Error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkHealth();
  }, [userId, queryClient]);

  return {
    lastCheckResult,
    isChecking,
  };
}

/**
 * Hook to get daily cook count and reset if needed
 */
export function useDailyCookStatus(userId: string | null) {
  const [dailyCount, setDailyCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchDailyStatus = async () => {
      setIsLoading(true);
      try {
        // Call RPC to get current count (resets if needed)
        const { data, error } = await supabase.rpc('reset_daily_cook_if_needed', {
          p_user_id: userId,
        });

        if (error) {
          console.error('[DailyCook] RPC error:', error);
          // Fallback: read directly from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('daily_cook_count, last_cook_reset_date')
            .eq('id', userId)
            .single();

          if (profile) {
            const today = new Date().toISOString().split('T')[0];
            const lastReset = profile.last_cook_reset_date;

            if (lastReset < today) {
              // Reset count if last reset was before today
              await supabase
                .from('profiles')
                .update({ daily_cook_count: 0, last_cook_reset_date: today })
                .eq('id', userId);
              setDailyCount(0);
            } else {
              setDailyCount(profile.daily_cook_count || 0);
            }
          }
        } else {
          setDailyCount(data ?? 0);
        }
      } catch (error) {
        console.error('[DailyCook] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyStatus();
  }, [userId]);

  return {
    dailyCount,
    remainingCooks: Math.max(0, 5 - dailyCount),
    hasReachedLimit: dailyCount >= 5,
    isLoading,
  };
}
