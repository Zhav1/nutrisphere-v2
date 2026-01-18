import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface Ingredient {
  name: string;
  qty: string;
  marketType: 'retail' | 'sachet' | 'wet_market';
  estimatedPriceRp: number;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  total_cost_rp: number;
  savings_vs_buying_rp: number;
  calories: number;
  protein: number;
  ingredients: Ingredient[];
  steps: string[];
  is_rice_cooker_only: boolean;
  tools_required: string[];
  is_favorite: boolean;
  times_cooked: number;
  created_at: string;
  last_cooked_at: string | null;
}

/**
 * Hook to fetch user's recipes
 * @param userId - User ID to fetch recipes for
 */
export function useRecipes(userId: string | null) {
  return useQuery({
    queryKey: ['recipes', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Recipe[];
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // Recipes are fresh for 10 minutes
  });
}

/**
 * Helper to get auth token for API calls
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * useSavedRecipes - Fetches all saved recipes with caching
 * OPTIMISTIC UPDATE SUPPORT: staleTime prevents auto-refetch from overwriting cache
 */
export function useSavedRecipes() {
  return useQuery({
    queryKey: ['savedRecipes'],
    queryFn: async () => {
      console.log('[useSavedRecipes] Fetching saved recipes...');
      
      const token = await getAuthToken();
      if (!token) {
        console.warn('[useSavedRecipes] No auth token - user may be logged out');
        return { recipes: [], count: 0 };
      }

      // Add timestamp to prevent browser caching
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/recipes?_t=${timestamp}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        console.error('[useSavedRecipes] API error:', res.status);
        if (res.status === 401) {
          return { recipes: [], count: 0 };
        }
        throw new Error('Failed to load saved recipes');
      }

      const responseData = await res.json();
      // Handle standardized successResponse structure (data.data.recipes)
      // Fallback for flat structure if needed during transition
      const payload = responseData.data || responseData; 
      const recipes = payload.recipes || [];
      
      console.log('[useSavedRecipes] Fetched', recipes.length, 'recipes');
      
      return {
        recipes: recipes,
        count: recipes.length
      };
    },
    // OPTIMISTIC UPDATE FIX: Increase staleTime to prevent auto-refetch from overwriting cache
    // Data is considered "fresh" for 30 seconds - optimistic updates won't be overwritten
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes when unmounted
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnMount: false, // Don't refetch on component mount - use cached data
    retry: 1,
  });
}

/**
 * Hook to fetch favorite recipes only
 */
export function useFavoriteRecipes(userId: string | null) {
  return useQuery({
    queryKey: ['recipes', userId, 'favorites'],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Recipe[];
    },
    enabled: !!userId,
  });
}

/**
 * Hook to save a new recipe
 */
export function useSaveRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recipe: Omit<Recipe, 'id' | 'created_at' | 'last_cooked_at' | 'times_cooked' | 'is_favorite'>) => {
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          ...recipe,
          is_favorite: false,
          times_cooked: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Recipe;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', data.user_id] });
    },
  });
}

/**
 * Hook to toggle favorite status
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ recipeId, isFavorite }: { recipeId: string; isFavorite: boolean }) => {
      const { data, error } = await supabase
        .from('recipes')
        .update({ is_favorite: !isFavorite })
        .eq('id', recipeId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Recipe;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', data.user_id] });
    },
  });
}

/**
 * Hook to mark recipe as cooked (increments count, updates stats)
 */
export function useMarkRecipeCooked() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recipeId: string) => {
      // Use Supabase's built-in increment
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('user_id, times_cooked')
        .eq('id', recipeId)
        .single();
      
      if (recipeError) throw recipeError;
      
      // Update recipe
      const { data, error } = await supabase
        .from('recipes')
        .update({
          times_cooked: recipe.times_cooked + 1,
          last_cooked_at: new Date().toISOString(),
        })
        .eq('id', recipeId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Increment user's recipes_cooked stat
      await supabase
        .from('profiles')
        .select('recipes_cooked')
        .eq('id', recipe.user_id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            return supabase
              .from('profiles')
              .update({ recipes_cooked: profile.recipes_cooked + 1 })
              .eq('id', recipe.user_id);
          }
        });
      
      return data as Recipe;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', data.user_id] });
      queryClient.invalidateQueries({ queryKey: ['profile', data.user_id] });
    },
  });
}

/**
 * Hook to delete a recipe
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, userId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', result.userId] });
    },
  });
}
