'use client';

import toast from 'react-hot-toast';

import { supabase } from '@/lib/supabase/client';
import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Plus, X, DollarSign, Flame, Clock, TrendingDown, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, Heart, Trash2, Search, SlidersHorizontal } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Recipe, SavedRecipe } from '@/types/recipe';
import { SavedRecipeCard } from '@/components/recipes/SavedRecipeCard';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { useSavedRecipes } from '@/lib/hooks/useRecipes';
import LivingBackground from '@/components/ui/LivingBackground';

const COOKING_TOOLS = [
  { id: 'rice_cooker', label: '🍚 Rice Cooker', name: 'Rice Cooker' },
  { id: 'stove', label: '🍳 Kompor/Wajan', name: 'Stove' },
  { id: 'kettle', label: '🔥 Kettle', name: 'Kettle' },
  { id: 'no_cook', label: '🥗 Tanpa Masak', name: 'No Cook' },
];

export default function RecipesPage() {
  // TanStack Query client for cache invalidation
  const queryClient = useQueryClient();

  // Tab State
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');

  // Generate Recipe State
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [budget, setBudget] = useState(15000);
  const [selectedTools, setSelectedTools] = useState<string[]>(['Rice Cooker']);
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // Saved Recipes - Now using React Query for caching!
  const { data: savedRecipesData, isLoading: isLoadingSaved, refetch: refetchSavedRecipes } = useSavedRecipes();
  const savedRecipes = savedRecipesData?.recipes ?? [];
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());

  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null);

  // Delete Modal State
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string, title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cook Recipe State (Gamification Overhaul)
  const [cookingRecipeId, setCookingRecipeId] = useState<string | null>(null);
  const [undoingRecipeId, setUndoingRecipeId] = useState<string | null>(null); // NEW: Undo last cook
  const [dailyCookCount, setDailyCookCount] = useState<number>(0);
  const DAILY_COOK_LIMIT = 5;

  // Search, Filter & Sort State (Phase 5.3)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Hemat' | 'Balance' | 'Premium'>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'cooked' | 'uncooked'>('all'); // Sudah/Belum Dimasak
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'calories' | 'favorite'>('date');

  // Pagination State for Saved Recipes
  const RECIPES_PER_PAGE = 5;
  const [visibleRecipesCount, setVisibleRecipesCount] = useState(RECIPES_PER_PAGE);

  // Handlers
  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddIngredient();
    }
  };

  const toggleTool = (toolName: string) => {
    if (selectedTools.includes(toolName)) {
      setSelectedTools(selectedTools.filter((t) => t !== toolName));
    } else {
      setSelectedTools([...selectedTools, toolName]);
    }
  };

  const handleGenerateRecipe = async () => {
    // Validation
    if (selectedTools.length === 0) {
      setError('Minimal pilih 1 alat masak ya! 🍳');
      return;
    }

    if (budget < 5000) {
      setError('Budget minimal Rp 5.000 bro 💸');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients, // Now sending ingredients to Groq!
          budget,
          tools: selectedTools,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal generate resep');
      }

      const data = await response.json();

      // Groq returns { recipes: [...] } - array of 3 options
      if (data.recipes && Array.isArray(data.recipes)) {
        // Map Groq format to our Recipe interface
        const mappedRecipes = data.recipes.map((r: any) => ({
          id: r.id,
          title: r.title,
          totalCostRp: r.shopping_cost, // Shopping cost only (pantry is free!)
          savingsVsBuyingRp: r.savings_vs_buying,
          calories: r.total_calories,
          protein: r.total_protein,
          fat: r.total_fat || 0,
          carbs: r.total_carbs || 0,
          ingredients: r.missing_ingredients.map((ing: any) => ({
            name: ing.item,
            qty: ing.qty,
            marketType: ing.marketType,
            estimatedPriceRp: ing.price,
          })),
          steps: r.cooking_steps,
          isRiceCookerOnly: r.is_rice_cooker_only,
          toolsRequired: r.tools_required,
          recipeType: r.type, // Hemat, Balance, Premium
          exceeds_budget: r.exceeds_budget, // Budget validation
          budget_warning: r.budget_warning, // Warning message
          validation: r.validation, // Recipe validation from API
        }));
        setRecipes(mappedRecipes);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Recipe generation error:', err);
      setError(err.message || 'Gagal generate resep. Coba lagi ya! 🙏');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync savedRecipeIds when savedRecipes changes (for quick lookup)
  useEffect(() => {
    if (savedRecipes.length > 0) {
      const titleSet = new Set<string>(savedRecipes.map((r: SavedRecipe) => r.recipe_title));
      setSavedRecipeIds(titleSet);
    }
  }, [savedRecipes]);

  // Save recipe to database
  const handleSaveRecipe = async (recipe: Recipe) => {
    setSavingRecipeId(recipe.id || recipe.title);
    try {
      // Get session token
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Sesi berakhir. Silakan masuk kembali.');
        return;
      }

      const response = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ recipe }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Gagal menyimpan resep');
        return;
      }

      // Show success toast (no rewards on save!)
      toast.success('Resep tersimpan! Masak untuk dapat hadiah 🍳');

      // OPTIMISTIC UPDATE: Add new recipe to cache immediately
      if (data.recipe) {
        queryClient.setQueryData(['savedRecipes'], (old: { recipes: SavedRecipe[]; count: number } | undefined) => {
          if (!old) return { recipes: [data.recipe], count: 1 };
          const newCache = {
            ...old,
            recipes: [data.recipe, ...old.recipes], // Prepend new recipe
            count: old.count + 1,
          };
          return newCache;
        });
      }

      // Invalidate related caches
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['saved-recipes-count'] }); // Match hook's query key

      setSavedRecipeIds(prev => new Set(prev).add(recipe.title));
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      toast.error('Gagal menyimpan resep. Silakan coba lagi.');
    } finally {
      setSavingRecipeId(null);
    }
  };

  // Delete saved recipe
  const handleDeleteRecipe = (recipeId: string, recipeTitle: string) => {
    setRecipeToDelete({ id: recipeId, title: recipeTitle });
  };

  const executeDeleteRecipe = async () => {
    if (!recipeToDelete) return;

    setIsDeleting(true);

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Sesi berakhir. Silakan masuk kembali.');
        return;
      }

      const response = await fetch(`/api/recipes/${recipeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus resep');
      }

      const data = await response.json();

      // Show localized delete message from API
      // The API handles the "minused rewards" message logic
      toast.success(data.message || 'Resep berhasil dihapus', {
        icon: '🗑️',
      });

      // Update cache with clawback values if recipe was cooked
      if (data.wasCooked && session.user.id) {
        queryClient.setQueryData(['profile', session.user.id], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            wallet_balance: data.newBalance,
            current_xp: data.newCurrentXp,
            total_savings_rp: data.newTotalSavings,
          };
        });
        console.log('[DELETE RECIPE] ✅ Cache updated with clawback values:', {
          newBalance: data.newBalance,
          newCurrentXp: data.newCurrentXp,
          newTotalSavings: data.newTotalSavings,
        });
      }

      // OPTIMISTIC UPDATE: Remove recipe from cache immediately
      queryClient.setQueryData(['savedRecipes'], (old: { recipes: SavedRecipe[]; count: number } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          recipes: old.recipes.filter((r: SavedRecipe) => r.id !== recipeToDelete.id),
          count: Math.max(0, old.count - 1),
        };
      });

      // Invalidate caches to refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['profile'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['nutritionSummary'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['foodLogs'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['saved-recipes-count'], refetchType: 'all' }); // FIX: Sync Profile count immediately

      setSavedRecipeIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeToDelete.title);
        return newSet;
      });
      setRecipeToDelete(null);
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      toast.error('Gagal menghapus resep');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = async (recipeId: string, currentStatus: boolean) => {
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Sesi berakhir. Silakan masuk kembali.');
        return;
      }

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_favorite: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengubah favorit');
      }

      // Update React Query cache for instant UI update
      queryClient.setQueryData(['savedRecipes'], (old: { recipes: SavedRecipe[]; count: number } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          recipes: old.recipes.map((r: SavedRecipe) =>
            r.id === recipeId ? { ...r, is_favorite: !currentStatus } : r
          )
        };
      });
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Gagal mengubah favorit');
    }
  };

  // Cook Recipe - Mark as cooked and grant rewards
  const handleCookRecipe = async (recipeId: string) => {
    setCookingRecipeId(recipeId);
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Sesi berakhir. Silakan masuk kembali.');
        return;
      }

      const response = await fetch(`/api/recipes/${recipeId}/cook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.error || 'Gagal memasak resep');
        return;
      }

      const payload = responseData.data;

      // Show localized success message from API
      toast.success(responseData.message || 'Hore! Masakan berhasil dibuat! 🍳', {
        duration: 3000,
        icon: '👨‍🍳',
        style: {
          background: '#ecfdf5',
          color: '#064e3b',
          fontWeight: 'bold',
        },
      });

      // Update cache with new values
      queryClient.setQueryData(['profile', session.user.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          wallet_balance: payload.newBalance,
          current_xp: payload.newXp,
          level: payload.newLevel,
          max_xp: payload.newMaxXp,
          health: payload.newHealth,
          daily_cook_count: payload.dailyCookCount,
          total_savings_rp: payload.newTotalSavings, // Update dashboard "Uang Hemat"
        };
      });

      // Update local daily cook count
      setDailyCookCount(payload.dailyCookCount);

      // OPTIMISTIC UPDATE: Update recipe cook status in cache immediately
      queryClient.setQueryData(['savedRecipes'], (old: { recipes: SavedRecipe[]; count: number } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          recipes: old.recipes.map((r: SavedRecipe) =>
            r.id === recipeId
              ? {
                ...r,
                first_cooked_at: r.first_cooked_at || new Date().toISOString(),
                last_cooked_at: new Date().toISOString(),
                times_cooked: (r.times_cooked || 0) + 1,
                is_cooked: true,
              }
              : r
          ),
        };
      });

      // Invalidate ALL caches to force dashboard refresh
      queryClient.invalidateQueries({ queryKey: ['profile'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['nutritionSummary'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['foodLogs'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['saved-recipes-count'], refetchType: 'all' }); // Match hook's query key
      // Invalidate history queries
      queryClient.invalidateQueries({ queryKey: ['economyHistory'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['xpHistory'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['nutritionHistory'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['foodLogHistory'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['streakHistory'], refetchType: 'all' }); // Streak calendar

    } catch (error: any) {
      console.error('Error cooking recipe:', error);
      toast.error('Gagal memasak resep');
    } finally {
      setCookingRecipeId(null);
    }
  };

  // Undo Last Cook - NEW: Delete most recent cook instance
  const handleUndoCook = async (recipeId: string) => {
    setUndoingRecipeId(recipeId);
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Sesi berakhir. Silakan masuk kembali.');
        return;
      }

      // Get most recent cook history for this recipe
      const { data: cookHistory, error: historyError } = await supabase
        .from('recipe_cook_history')
        .select('id')
        .eq('recipe_id', recipeId)
        .order('cooked_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (historyError || !cookHistory) {
        toast.error('Tidak ada riwayat masak untuk dibatalkan');
        return;
      }

      // Delete the cook history entry
      const response = await fetch(`/api/cook-history/${cookHistory.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.error || 'Gagal membatalkan masak');
        return;
      }

      const payload = responseData.data;

      // Show success toast
      toast.success(responseData.message || `Masak dibatalkan. -${payload.goldSubtracted}🪙 -${payload.xpSubtracted}XP`);

      // Update local profile cache
      queryClient.setQueryData(['profile'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          wallet_balance: payload.newBalance,
          current_xp: payload.newXp,
          total_savings_rp: payload.newSavings, // Update savings too!
        };
      });

      // Invalidate caches to refresh (but NOT savedRecipes - using optimistic updates)
      queryClient.invalidateQueries({ queryKey: ['profile'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['nutritionSummary'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['foodLogs'], refetchType: 'all' });
      // Invalidate history queries
      queryClient.invalidateQueries({ queryKey: ['economyHistory'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['xpHistory'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['nutritionHistory'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['foodLogHistory'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['streakHistory'], refetchType: 'all' }); // Streak calendar

      // OPTIMISTIC UPDATE: Decrement cook count and update status
      queryClient.setQueryData(['savedRecipes'], (old: { recipes: SavedRecipe[]; count: number } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          recipes: old.recipes.map((r: SavedRecipe) => {
            if (r.id !== recipeId) return r;
            const newTimesCooked = Math.max(0, (r.times_cooked || 0) - 1);
            return {
              ...r,
              times_cooked: newTimesCooked,
              // If no more cooks, reset the cook status
              first_cooked_at: newTimesCooked === 0 ? null : r.first_cooked_at,
              is_cooked: newTimesCooked > 0,
            };
          }),
        };
      });
    } catch (error: any) {
      console.error('Error undoing cook:', error);
      toast.error(error.message || 'Gagal membatalkan masakan');
    } finally {
      setUndoingRecipeId(null);
    }
  };

  // Load initial data on component mount
  // NOTE: refetchSavedRecipes() REMOVED - React Query auto-fetches if cache empty
  // Explicit refetch was overwriting optimistic cache with stale server data
  useEffect(() => {

    // Fetch initial daily cook count from profile
    const fetchDailyCookCount = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_cook_count, last_cook_reset_date')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        // CRITICAL FIX: Format local date without UTC conversion
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        if (profile.last_cook_reset_date < today) {
          setDailyCookCount(0);
        } else {
          setDailyCookCount(profile.daily_cook_count || 0);
        }
      }
    };
    fetchDailyCookCount();
  }, []);

  // NOTE: Tab-switch refetch REMOVED - optimistic updates now handle the data
  // Explicit refetch was overwriting cache with stale server data due to DB replication lag
  // useEffect(() => {
  //   if (activeTab === 'saved') {
  //     refetchSavedRecipes();
  //   }
  // }, [activeTab]);

  // Reset pagination when filters or search change
  useEffect(() => {
    setVisibleRecipesCount(RECIPES_PER_PAGE);
  }, [searchQuery, filterType, filterStatus, sortBy]);

  // Filter and sort saved recipes (Phase 5.3)
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = [...savedRecipes];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(r =>
        r.recipe_title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter (handles legacy types via casting)
    if (filterType !== 'All') {
      filtered = filtered.filter(r => {
        const type = (r.recipe_type || 'Balance') as string;
        if (filterType === 'Hemat') return type === 'Hemat';
        if (filterType === 'Balance') return type === 'Balance' || type === 'Comfort';
        if (filterType === 'Premium') return type === 'Premium' || type === 'Mewah';
        return false;
      });
    }

    // Status filter (Sudah/Belum Dimasak)
    if (filterStatus === 'cooked') {
      filtered = filtered.filter(r => r.first_cooked_at !== null);
    } else if (filterStatus === 'uncooked') {
      filtered = filtered.filter(r => !r.first_cooked_at);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'cost':
        sorted.sort((a, b) => a.shopping_cost - b.shopping_cost);
        break;
      case 'calories':
        sorted.sort((a, b) => a.total_calories - b.total_calories);
        break;
      case 'favorite':
        sorted.sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
        break;
      default: // date
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return sorted;
  }, [savedRecipes, searchQuery, filterType, filterStatus, sortBy]);

  const toggleRecipeExpansion = (recipeId: string) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* LIVING ATMOSPHERE - Same as Dashboard */}
      {/* LIVING ATMOSPHERE */}
      <LivingBackground />

      {/* MAIN CONTENT */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-emerald-600" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-teal-900">
                  Survival Chef
                </h1>
                <p className="text-teal-700 text-lg">
                  Racik resep hemat sesuai budget kos-kosan! 👨‍🍳✨
                </p>
              </div>
            </div>
          </motion.div>

          {/* TAB NAVIGATION */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${activeTab === 'generate'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'glass-card text-teal-700 hover:bg-white/60'
                }`}
            >
              ✨ Generate Resep
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${activeTab === 'saved'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'glass-card text-teal-700 hover:bg-white/60'
                }`}
            >
              📚 Koleksi Resep ({savedRecipes.length})
            </button>
          </div>

          {/* GENERATE TAB CONTENT */}
          {activeTab === 'generate' && (
            <>

              {/* 1. PANTRY SECTION (Input) */}
              <GlassCard className="mb-6 p-6">
                <h2 className="text-xl font-bold text-teal-900 mb-4 flex items-center gap-2">
                  🥘 Pantry
                </h2>

                {/* Ingredient Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Bahan yang Kamu Punya (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Contoh: Telur"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-200 text-black focus:border-emerald-500 focus:outline-none transition-colors bg-white/80"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddIngredient}
                      className="px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Ingredient Chips */}
                  {ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {ingredients.map((ingredient) => (
                        <motion.div
                          key={ingredient}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
                        >
                          <span>{ingredient}</span>
                          <button
                            onClick={() => handleRemoveIngredient(ingredient)}
                            className="hover:bg-emerald-200 rounded-full p-1 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Budget Slider */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Budget Masak (Rp 5.000 - Rp 100.000)
                  </label>
                  <div className="flex items-center gap-4">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    <input
                      type="range"
                      min="5000"
                      max="100000"
                      step="1000"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="flex-1 h-3 bg-emerald-100 rounded-full appearance-none cursor-pointer slider-thumb"
                    />
                    <motion.span
                      key={budget}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-amber-600 min-w-[120px] text-right"
                    >
                      Rp {budget.toLocaleString('id-ID')}
                    </motion.span>
                  </div>
                </div>

                {/* Cooking Tools Selector */}
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-3">
                    Alat Masak yang Tersedia
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {COOKING_TOOLS.map((tool) => (
                      <motion.button
                        key={tool.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTool(tool.name)}
                        className={`
                      px-4 py-3 rounded-xl font-medium text-sm transition-all
                      ${selectedTools.includes(tool.name)
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                            : 'bg-white/80 text-teal-700 border-2 border-emerald-200 hover:border-emerald-400'
                          }
                    `}
                      >
                        {tool.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* 2. CHEF SECTION (Action & Loading) */}
              <div className="mb-6">
                <AnimatedButton
                  onClick={handleGenerateRecipe}
                  variant="neon"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-3xl"
                      >
                        👨‍🍳
                      </motion.span>
                      <span>Sedang meracik bumbu...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ChefHat className="w-5 h-5" />
                      Racik Resep Hemat ✨
                    </span>
                  )}
                </AnimatedButton>

                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-700 text-center font-medium"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. MENU SECTION (Results) */}
              <AnimatePresence>
                {recipes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <h2 className="text-2xl font-bold text-teal-900 mb-4 flex items-center gap-2">
                      📋 Resep Rekomendasi
                    </h2>

                    <div className="space-y-4">
                      {recipes.map((recipe) => (
                        <RecipeCard
                          key={recipe.id || recipe.title}
                          recipe={recipe}
                          isExpanded={expandedRecipeId === (recipe.id || recipe.title)}
                          onToggle={() => toggleRecipeExpansion(recipe.id || recipe.title)}
                          userIngredients={ingredients}
                          onSave={handleSaveRecipe}
                          isSaved={savedRecipeIds.has(recipe.title)}
                          isSaving={savingRecipeId === (recipe.id || recipe.title)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* SAVED RECIPES TAB CONTENT */}
          {activeTab === 'saved' && (
            <div>
              {/* Daily Cook Limit Banner */}
              <div className={`mb-4 p-4 rounded-xl border-2 flex items-center justify-between ${dailyCookCount >= DAILY_COOK_LIMIT
                ? 'bg-amber-50 border-amber-300'
                : 'bg-emerald-50 border-emerald-200'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dailyCookCount >= DAILY_COOK_LIMIT
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-emerald-100 text-emerald-600'
                    }`}>
                    🍳
                  </div>
                  <div>
                    <p className={`font-bold ${dailyCookCount >= DAILY_COOK_LIMIT ? 'text-amber-800' : 'text-emerald-800'
                      }`}>
                      Masak Hari Ini: {dailyCookCount}/{DAILY_COOK_LIMIT}
                    </p>
                    {dailyCookCount >= DAILY_COOK_LIMIT ? (
                      <p className="text-sm text-amber-600">
                        ⚠️ Batas harian tercapai! Masak tetap dapat, tapi tanpa Gold & XP.
                      </p>
                    ) : (
                      <p className="text-sm text-emerald-600">
                        Masak {DAILY_COOK_LIMIT - dailyCookCount} resep lagi untuk dapatkan 🪙 & XP hari ini!
                      </p>
                    )}
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${dailyCookCount >= DAILY_COOK_LIMIT ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    style={{ width: `${Math.min(100, (dailyCookCount / DAILY_COOK_LIMIT) * 100)}%` }}
                  />
                </div>
              </div>
              {isLoadingSaved ? (
                <GlassCard className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <ChefHat className="w-16 h-16 text-emerald-500" />
                    </motion.div>
                    <p className="text-teal-700">Loading saved recipes...</p>
                  </div>
                </GlassCard>
              ) : savedRecipes.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Bookmark className="w-20 h-20 text-teal-300" />
                    <h3 className="text-2xl font-bold text-teal-900">Belum Ada Resep Tersimpan</h3>
                    <p className="text-teal-600">
                      Generate resep baru dan klik tombol &apos;Simpan&apos; untuk menyimpannya di sini!
                    </p>
                    <button
                      onClick={() => setActiveTab('generate')}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      ✨ Generate Resep Sekarang
                    </button>
                  </div>
                </GlassCard>
              ) : (
                <div className="space-y-6">
                  {/* SEARCH & FILTER BAR (Phase 5.3) */}
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari resep..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 focus:border-neon-green rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Filters Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Type Filters */}
                      <div className="flex gap-2">
                        {(['All', 'Hemat', 'Balance', 'Premium'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${filterType === type
                              ? 'bg-neon-green text-gray-900 shadow-lg shadow-neon-green/30'
                              : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-gray-200'
                              }`}
                          >
                            {type === 'All' && '📚 Semua'}
                            {type === 'Hemat' && '💰 Hemat'}
                            {type === 'Balance' && '🎯 Balance'}
                            {type === 'Premium' && '✨ Premium'}
                          </button>
                        ))}
                      </div>

                      {/* Filter Dropdown - Status */}
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2 bg-white/70 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:border-neon-green transition-all cursor-pointer"
                      >
                        <option value="all">📝 Semua Status</option>
                        <option value="cooked">🍳 Sudah Dimasak</option>
                        <option value="uncooked">📋 Belum Dimasak</option>
                      </select>

                      {/* Sort Dropdown */}
                      <div className="ml-auto">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-4 py-2 bg-white/70 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:border-neon-green transition-all cursor-pointer"
                        >
                          <option value="date">🕐 Terbaru</option>
                          <option value="cost">💰 Termurah</option>
                          <option value="calories">🔥 Kalori Terendah</option>
                          <option value="favorite">❤️ Favorit</option>
                        </select>
                      </div>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-gray-600 font-semibold">
                        {filteredAndSortedRecipes.length === savedRecipes.length ? (
                          `�📚 ${savedRecipes.length} resep tersimpan`
                        ) : (
                          `✨ Menampilkan ${filteredAndSortedRecipes.length} dari ${savedRecipes.length} resep`
                        )}
                      </p>
                      {(searchQuery || filterType !== 'All' || filterStatus !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterType('All');
                            setFilterStatus('all');
                            setSortBy('date');
                          }}
                          className="text-neon-green hover:text-emerald-600 font-semibold flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Recipe List */}
                  {filteredAndSortedRecipes.length === 0 ? (
                    <GlassCard className="p-8 text-center">
                      <SlidersHorizontal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-semibold">Tidak ada resep yang cocok dengan filter</p>
                      <p className="text-gray-500 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
                    </GlassCard>
                  ) : (
                    <div className="space-y-4">
                      {filteredAndSortedRecipes.slice(0, visibleRecipesCount).map((saved) => (
                        <SavedRecipeCard
                          key={saved.id}
                          savedRecipe={saved}
                          isExpanded={expandedRecipeId === saved.id}
                          onToggle={() => toggleRecipeExpansion(saved.id)}
                          onDelete={() => handleDeleteRecipe(saved.id, saved.recipe_title)}
                          onToggleFavorite={() => handleToggleFavorite(saved.id, saved.is_favorite)}
                          onCook={async () => handleCookRecipe(saved.id)}
                          isCooking={cookingRecipeId === saved.id}
                          onUndoCook={async () => handleUndoCook(saved.id)}
                          isUndoing={undoingRecipeId === saved.id}
                        />
                      ))}

                      {/* Load More Button */}
                      {visibleRecipesCount < filteredAndSortedRecipes.length && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-4 pb-2"
                        >
                          <button
                            onClick={() => setVisibleRecipesCount(prev => prev + RECIPES_PER_PAGE)}
                            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2"
                          >
                            <ChevronDown className="w-5 h-5" />
                            Muat {Math.min(RECIPES_PER_PAGE, filteredAndSortedRecipes.length - visibleRecipesCount)} Resep Lagi
                          </button>
                          <p className="text-center text-sm text-gray-500 mt-2">
                            Menampilkan {Math.min(visibleRecipesCount, filteredAndSortedRecipes.length)} dari {filteredAndSortedRecipes.length} resep
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>



      <DeleteConfirmationModal
        isOpen={!!recipeToDelete}
        onClose={() => setRecipeToDelete(null)}
        onConfirm={executeDeleteRecipe}
        title="Hapus Resep?"
        message="Apakah kamu yakin ingin menghapus resep ini dari koleksi?"
        itemName={recipeToDelete?.title}
        isDeleting={isDeleting}
      />

      {/* Custom CSS for slider thumb */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #10b981, #14b8a6);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }

        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #10b981, #14b8a6);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div >
  );
}

// Recipe Card Component
interface RecipeCardProps {
  recipe: Recipe;
  isExpanded: boolean;
  onToggle: () => void;
  userIngredients: string[];
  onSave?: (recipe: Recipe) => void;
  isSaved?: boolean;
  isSaving?: boolean;
}

function RecipeCard({ recipe, isExpanded, onToggle, userIngredients, onSave, isSaved, isSaving }: RecipeCardProps) {
  // Calculate match score
  const matchCount = recipe.ingredients.filter((ing) =>
    userIngredients.some((userIng) =>
      ing.name.toLowerCase().includes(userIng.toLowerCase()) ||
      userIng.toLowerCase().includes(ing.name.toLowerCase())
    )
  ).length;

  const matchPercentage = userIngredients.length > 0
    ? Math.round((matchCount / userIngredients.length) * 100)
    : 0;

  // @ts-ignore - recipeType may not be in Recipe interface yet
  const recipeType = recipe.recipeType || 'Balance';

  return (
    <GlassCard className="p-6" hover={true}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        {/* Title & Badges */}
        <div className="flex-1">
          {/* Recipe Type Badge */}
          <div className="mb-2 flex flex-wrap gap-2">
            {(() => {
              // @ts-ignore - recipeType comes from API map
              const rawType = recipe.recipeType || 'Balance';
              let displayType = rawType;
              if (rawType === 'Comfort') displayType = 'Balance';
              if (rawType === 'Mewah') displayType = 'Premium';

              const getColors = (type: string) => {
                if (type === 'Hemat') return 'bg-emerald-500 text-white shadow-emerald-200';
                if (type === 'Balance') return 'bg-blue-500 text-white shadow-blue-200';
                if (type === 'Premium') return 'bg-purple-500 text-white shadow-purple-200';
                return 'bg-blue-500 text-white shadow-blue-200';
              };

              return (
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${getColors(displayType)} transition-colors`}>
                  {displayType === 'Hemat' && '💰 Hemat'}
                  {displayType === 'Balance' && '🎯 Balance'}
                  {displayType === 'Premium' && '✨ Premium'}
                </span>
              );
            })()}

            {/* Budget Warning Badge - Shows when recipe exceeds budget */}
            {/* @ts-ignore - exceeds_budget is added in post-processing */}
            {recipe.exceeds_budget && (
              <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-orange-500 text-white shadow-lg shadow-orange-200 flex items-center gap-1">
                ⚠️ Melebihi Budget
              </span>
            )}
          </div>

          {/* Date Badge - Improved UI */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium mb-2 border border-teal-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Baru dibuat</span>
          </div>

          <h3 className="text-2xl font-bold text-teal-900 mb-3">{recipe.title}</h3>

          <div className="flex flex-wrap gap-2">
            {/* Cost Badge */}
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              <span>Rp {recipe.totalCostRp.toLocaleString('id-ID')}</span>
            </div>

            {/* Calories Badge */}
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              <Flame className="w-4 h-4" />
              <span>{recipe.calories} kkal</span>
            </div>

            {/* Protein Badge */}
            <div className="flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">
              <span>🥩 {recipe.protein || 0}g protein</span>
            </div>

            {/* Fat Badge */}
            {(recipe.fat || 0) > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                <span>🧈 {recipe.fat}g lemak</span>
              </div>
            )}

            {/* Carbs Badge */}
            {(recipe.carbs || 0) > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                <span>🍚 {recipe.carbs}g karbo</span>
              </div>
            )}

            {/* Savings Badge */}
            {recipe.savingsVsBuyingRp > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                <span>Hemat Rp {recipe.savingsVsBuyingRp.toLocaleString('id-ID')}</span>
              </div>
            )}

            {/* Match Score */}
            {userIngredients.length > 0 && matchPercentage > 0 && (
              <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                🎯 {matchPercentage}% Match
              </div>
            )}

            {/* Rice Cooker Only Badge */}
            {recipe.isRiceCookerOnly && (
              <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                🍚 Rice Cooker Only
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 self-center md:self-start">
          {/* Save Button */}
          {onSave && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSave(recipe)}
              disabled={isSaved || isSaving}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isSaved
                ? 'bg-green-500 text-white cursor-not-allowed'
                : isSaving
                  ? 'bg-gray-400 text-white cursor-wait'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              title={isSaved ? 'Sudah tersimpan' : isSaving ? 'Menyimpan...' : 'Simpan resep'}
            >
              {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </motion.button>
          )}

          {/* Expand Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-emerald-100 space-y-6">
              {/* Ingredients */}
              <div>
                <h4 className="text-lg font-bold text-teal-900 mb-3 flex items-center gap-2">
                  🛒 Belanja (Bahan yang Perlu Dibeli)
                </h4>
                <div className="space-y-2">
                  {(recipe.ingredients || []).map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white/60 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-teal-900">
                          {ing.name} - {ing.qty}
                        </p>
                        <p className="text-xs text-teal-600 mt-1">
                          <span className="px-2 py-0.5 bg-teal-100 rounded-full">
                            {ing.marketType === 'sachet' && '📦 Sachet'}
                            {ing.marketType === 'retail' && '🏪 Retail'}
                            {ing.marketType === 'wet_market' && '🌾 Pasar Basah'}
                          </span>
                        </p>
                      </div>
                      <span className="text-sm font-bold text-amber-700">
                        ~Rp {ing.estimatedPriceRp.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooking Steps */}
              <div>
                <h4 className="text-lg font-bold text-teal-900 mb-3 flex items-center gap-2">
                  📝 Cara Masak
                </h4>
                <div className="space-y-2">
                  {(recipe.steps || []).map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="flex-1 text-teal-800 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools Required */}
              {recipe.toolsRequired && recipe.toolsRequired.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-teal-700 mb-2">
                    Alat yang Diperlukan:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.toolsRequired.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
