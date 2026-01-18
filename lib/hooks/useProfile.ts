import { useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { EquippedAccessories } from '@/types/accessory';

// Type definitions (will be auto-generated from Supabase later)
export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  total_savings_rp: number;
  level: number;
  current_xp: number;
  max_xp: number;
  health: number;
  mood: 'happy' | 'neutral' | 'sick';
  accessories: string[];  // owned accessory IDs
  equipped_accessories: EquippedAccessories | null;  // equipped by category
  streak_days: number;
  recipes_cooked: number;
  // Daily limit tracking
  daily_cook_count: number;
  last_cook_reset_date: string;
  // Health tracking
  last_health_check_at: string;
  consecutive_inactive_days: number;
  // Streak tracking
  last_cook_date: string | null;
  streak_shield_active: boolean;
  // Faint state
  is_fainted: boolean;
  faint_recovery_count: number;
  // Friend system
  friend_code: string | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch user profile data
 * @param userId - User ID to fetch profile for
 */
export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // Profile is fresh for 30 seconds (was 5 min)
    refetchOnWindowFocus: true, // Refetch when user comes back to tab
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', updates.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      // Invalidate and refetch profile cache
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
    },
  });
}

// Constants for gamification
const SICK_MODE_XP_MULTIPLIER = 0.75; // 75% XP when HP <= 20
const SICK_MODE_THRESHOLD = 20;

/**
 * Calculate exponential max XP for a level
 * Formula: 100 * 1.5^(level-1)
 */
export function calculateMaxXp(level: number): number {
  return Math.max(1, level) * 100;
}

/**
 * Hook to add XP to user profile (with auto-leveling)
 * Uses exponential XP scaling and applies sick mode reduction
 */
export function useAddXp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, xp }: { userId: string; xp: number }) => {
      // Fetch current profile including health for sick mode check
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('current_xp, max_xp, level, health')
        .eq('id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Apply sick mode XP reduction (75% when HP <= 20)
      let adjustedXp = xp;
      if (profile.health <= SICK_MODE_THRESHOLD) {
        adjustedXp = Math.floor(xp * SICK_MODE_XP_MULTIPLIER);
      }
      
      let newXp = profile.current_xp + adjustedXp;
      let newLevel = profile.level;
      let newMaxXp = profile.max_xp;
      
      // Level up logic with exponential formula + STRICT RESET
      while (newXp >= newMaxXp) {
        newXp = 0; // STRICT RESET - no overflow carry
        newLevel += 1;
        newMaxXp = calculateMaxXp(newLevel);
      }
      
      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          current_xp: newXp,
          level: newLevel,
          max_xp: newMaxXp,
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
    },
  });
}

/**
 * Hook to add gold (savings) to wallet
 */
export function useAddGold() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, gold, savingsRp }: { userId: string; gold: number; savingsRp: number }) => {
      const { data, error } = await supabase.rpc('add_gold', {
        p_user_id: userId,
        p_gold: gold,
        p_savings_rp: savingsRp,
      });
      
      if (error) {
        // Fallback if RPC doesn't exist - direct SQL update
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_balance, total_savings_rp')
          .eq('id', userId)
          .single();
        
        if (!profile) throw new Error('Profile not found');
        
        const { data: updated, error: updateError } = await supabase
          .from('profiles')
          .update({
            wallet_balance: profile.wallet_balance + gold,
            total_savings_rp: profile.total_savings_rp + savingsRp,
          })
          .eq('id', userId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return updated;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
    },
  });
}

/**
 * Hook for real-time profile updates
 * Subscribe to changes in the profile table
 */
export function useRealtimeProfile(userId: string | null) {
  const queryClient = useQueryClient();
  
  if (typeof window === 'undefined' || !userId) return;
  
  const channel = supabase
    .channel(`profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        // Update cache with new data
        queryClient.setQueryData(['profile', userId], payload.new);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Hook to get actual saved recipes count for user
 * More accurate than recipes_cooked in profiles
 */
export function useSavedRecipesCount(userId: string | null) {
  return useQuery({
    queryKey: ['saved-recipes-count', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { count, error } = await supabase
        .from('saved_recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to get total scans count (vision_scan + food_plate)
 */
export function useTotalScans(userId: string | null) {
  return useQuery({
    queryKey: ['total-scans', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { count, error } = await supabase
        .from('food_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('source', ['vision_scan', 'food_plate']); // Label decoder + Warteg scanner
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds (was 60s)
    refetchOnWindowFocus: true,
  });
}
