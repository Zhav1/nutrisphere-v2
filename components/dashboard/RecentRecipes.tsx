'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, ArrowRight, Bookmark, DollarSign, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { useSavedRecipes } from '@/lib/hooks/useRecipes';
import { SavedRecipe } from '@/types/recipe';

/**
 * Dashboard widget showing 3 most recent saved recipes
 * Redesigned with maximum contrast for readability
 */
export default function RecentRecipes() {
  const router = useRouter();
  // Use shared React Query hook for consistency across app
  const { data, isLoading } = useSavedRecipes();
  const recipes = data?.recipes.slice(0, 3) || []; // Only take 3 most recent
  
  // Loading handled by hook
  const loading = isLoading;

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentRecipesCollapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Save collapse state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('recentRecipesCollapsed', String(newState));
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-gray-900/90 border border-neon-green/30 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-center h-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <ChefHat className="w-10 h-10 text-neon-green drop-shadow-lg" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-2 border-neon-green/30 rounded-3xl p-10 text-center shadow-2xl shadow-neon-green/10">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-neon-green/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-neon-green/20">
              <Bookmark className="w-10 h-10 text-neon-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">
              Belum Ada Resep Tersimpan
            </h3>
            <p className="text-gray-300 mb-8 text-base leading-relaxed">
              Mulai generate dan simpan resep favoritmu sekarang!
            </p>
            <Link href="/recipes">
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-neon-green via-emerald-400 to-emerald-500 text-gray-900 font-bold text-base rounded-xl shadow-2xl shadow-neon-green/40"
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)' }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Generate Resep Sekarang
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - IMPROVED CONTRAST */}
      <div className="backdrop-blur-md bg-gray-900/80 border-2 border-neon-green/40 rounded-2xl p-4 shadow-xl shadow-neon-green/10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
            <div className="bg-neon-green/20 p-2 rounded-lg border border-neon-green/40">
              <Bookmark className="w-6 h-6 text-neon-green" />
            </div>
            Resep Terakhir
          </h2>
          <div className="flex items-center gap-3">
            {/* Toggle Collapse Button */}
            <motion.button
              onClick={toggleCollapse}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-white/20 text-white rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isCollapsed ? 'Show recipes' : 'Hide recipes'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </motion.button>
            {/* View All Button */}
            <Link href="/recipes?tab=saved">
              <motion.button
                className="px-4 py-2 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 text-neon-green hover:text-white flex items-center gap-2 text-sm font-bold rounded-lg transition-all shadow-lg"
                whileHover={{ x: 5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recipe Cards Grid - COLLAPSIBLE */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recipes.map((recipe: SavedRecipe, index: number) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div
                    className="backdrop-blur-xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border-2 border-white/20 hover:border-neon-green/60 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-2xl hover:shadow-neon-green/30 group"
                    onClick={() => router.push('/recipes?tab=saved')}
                  >
                    {/* Recipe Title - HIGH CONTRAST */}
                    <h3 className="font-bold text-white text-lg mb-4 line-clamp-2 leading-tight drop-shadow-md group-hover:text-neon-green transition-colors">
                      {recipe.recipe_title}
                    </h3>

                    {/* Recipe Type Badge - BRIGHT */}
                    <div className="flex items-center gap-2 mb-4">
                      {(() => {
                        const rawType = recipe.recipe_type || 'Balance';
                        let displayType: 'Hemat' | 'Balance' | 'Premium' = rawType;
                        // Handle legacy types safely
                        if ((rawType as string) === 'Comfort') displayType = 'Balance';
                        if ((rawType as string) === 'Mewah') displayType = 'Premium';

                        const getColors = (type: string) => {
                          if (type === 'Hemat') return 'bg-emerald-500 text-white shadow-emerald-200';
                          if (type === 'Balance') return 'bg-blue-500 text-white shadow-blue-200';
                          if (type === 'Premium') return 'bg-purple-500 text-white shadow-purple-200';
                          return 'bg-blue-500 text-white shadow-blue-200';
                        };

                        return (
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg ${getColors(displayType)} uppercase tracking-wide`}>
                            {displayType === 'Hemat' && '💰 Hemat'}
                            {displayType === 'Balance' && '🎯 Balance'}
                            {displayType === 'Premium' && '✨ Premium'}
                          </span>
                        );
                      })()}
                      {recipe.is_favorite && (
                        <span className="text-2xl drop-shadow-lg animate-pulse">❤️</span>
                      )}
                    </div>

                    {/* Stats - COLOR-CODED WITH HIGH CONTRAST */}
                    <div className="flex items-center gap-5 text-sm mb-4">
                      <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-2 rounded-lg border border-emerald-400/40">
                        <DollarSign className="w-4 h-4 text-emerald-300" />
                        <span className="font-bold text-emerald-200">
                          Rp {recipe.shopping_cost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-2 rounded-lg border border-orange-400/40">
                        <Flame className="w-4 h-4 text-orange-300" />
                        <span className="font-bold text-orange-200">
                          {recipe.total_calories} kal
                        </span>
                      </div>
                    </div>

                    {/* Hover Indicator - BRIGHT */}
                    <div className="pt-4 border-t-2 border-white/10 group-hover:border-neon-green/30 transition-colors">
                      <span className="text-sm text-gray-400 group-hover:text-neon-green font-semibold transition-colors flex items-center gap-2">
                        <span>Klik untuk detail</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
