import { supabase } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  // Stats from profiles table
  total_scans?: number; // Dynamic from food_logs
  total_recipes_saved?: number; // Dynamic from saved_recipes
  current_streak?: number;
  nutrigotchi_level?: number;
  nutrigotchi_xp?: number;
  gold?: number;
}

/**
 * Fetch the current user's profile
 * Combines Supabase Auth user data with profiles table data
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Parallel data fetching for performance
  const [profileResponse, savedRecipesResponse, scansResponse] = await Promise.all([
    // 1. Get Profile Data
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    
    // 2. Count Saved Recipes
    supabase
      .from('saved_recipes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),

    // 3. Count Scans (from food_logs)
    // Sources: 'vision_scan' (label decoder) and 'food_plate' (warteg scanner)
    supabase
      .from('food_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('source', ['vision_scan', 'food_plate'])
  ]);

  const { data: profileData, error } = profileResponse;

  if (error) {
    console.error('Error fetching profile:', error);
    // Return basic profile from auth if profiles table fails
    return {
      id: user.id,
      email: user.email || '',
      display_name: null,
      avatar_url: null,
      created_at: user.created_at,
      updated_at: new Date().toISOString(),
      gold: 0,
    };
  }

  // Combine profile data with auth email and counts
  return { 
    ...profileData, 
    email: user.email || profileData.email || '',
    total_recipes_saved: savedRecipesResponse.count || 0,
    total_scans: scansResponse.count || 0,
    gold: profileData.wallet_balance || 0, // Map wallet_balance to gold
    // current_streak is already in profileData
    // nutrigotchi_level is alias for level
    nutrigotchi_level: profileData.level,
    nutrigotchi_xp: profileData.current_xp
  };
}

/**
 * Update the current user's profile
 */
export async function updateProfile(updates: { 
  display_name?: string;
  avatar_url?: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw error;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
