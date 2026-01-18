'use client';

// Saved Recipe Card Component - REDESIGNED for better mobile UX
import { SavedRecipe } from '@/types/recipe';
import GlassCard from '@/components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ChevronUp, ChevronDown, Flame, ChefHat, Loader2, Clock } from 'lucide-react';

interface SavedRecipeCardProps {
  savedRecipe: SavedRecipe;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onCook?: () => Promise<void>;
  isCooking?: boolean;
  onUndoCook?: () => Promise<void>;
  isUndoing?: boolean;
}

export function SavedRecipeCard({
  savedRecipe,
  isExpanded,
  onToggle,
  onDelete,
  onToggleFavorite,
  onCook,
  isCooking = false,
  onUndoCook,
  isUndoing = false,
}: SavedRecipeCardProps) {
  const recipeType = savedRecipe.recipe_type || 'Balance';

  // Normalize legacy types
  let displayType: string = recipeType;
  if ((recipeType as string) === 'Comfort') displayType = 'Balance';
  if ((recipeType as string) === 'Mewah') displayType = 'Premium';

  // Type badge styling - PRIMARY (larger, more prominent)
  const typeBadgeConfig = {
    Hemat: { bg: 'bg-emerald-500', text: 'text-white', icon: '💰', shadow: 'shadow-emerald-200/50' },
    Balance: { bg: 'bg-blue-500', text: 'text-white', icon: '⚖️', shadow: 'shadow-blue-200/50' },
    Premium: { bg: 'bg-purple-500', text: 'text-white', icon: '✨', shadow: 'shadow-purple-200/50' },
  };
  const typeConfig = typeBadgeConfig[displayType as keyof typeof typeBadgeConfig] || typeBadgeConfig.Balance;

  // Calculate rewards
  const baseGold: Record<string, number> = { Hemat: 15, Balance: 25, Premium: 40 };
  const baseXp: Record<string, number> = { Hemat: 25, Balance: 35, Premium: 50 };
  const potentialGold = baseGold[displayType] || 25;
  const potentialXp = baseXp[displayType] || 25;

  return (
    <GlassCard
      className="p-4 md:p-5 transition-all active:scale-[0.99]"
      hover={true}
      onClick={(e) => {
        // Prevent toggle if clicking on buttons or interactive elements
        if ((e.target as HTMLElement).closest('button')) return;
        onToggle();
      }}
    >
      {/* ROW 1: Primary Badge + Secondary Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* PRIMARY: Type Badge - Large & Prominent */}
        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${typeConfig.bg} ${typeConfig.text} shadow-lg ${typeConfig.shadow}`}>
          {typeConfig.icon} {displayType}
        </span>

        {/* SECONDARY: Cooked Status - Smaller */}
        {savedRecipe.first_cooked_at ? (
          <span className="px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
            <ChefHat className="w-3 h-3" />
            Dimasak {savedRecipe.times_cooked && savedRecipe.times_cooked > 1 ? `${savedRecipe.times_cooked}x` : ''}
          </span>
        ) : (
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
            Belum dimasak
          </span>
        )}

        {/* SECONDARY: Rice Cooker Only - Outline Style */}
        {savedRecipe.is_rice_cooker_only && (
          <span className="px-2 py-1 rounded-md text-xs font-medium border border-purple-300 text-purple-600 bg-purple-50">
            🍚 Rice Cooker
          </span>
        )}

        {/* XP Earned - Small, subtle */}
        {savedRecipe.first_cooked_at && savedRecipe.xp_earned > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
            +{savedRecipe.xp_earned} XP
          </span>
        )}
      </div>

      {/* ROW 2: Title */}
      <h3 className="text-lg md:text-xl font-bold text-teal-900 mb-2 leading-tight">
        {savedRecipe.recipe_title}
      </h3>

      {/* ROW 3: Key Stats - Cost & Calories (Most Important) */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 text-amber-700 font-bold">
          <span className="text-base">💵</span>
          <span>Rp {savedRecipe.shopping_cost.toLocaleString('id-ID')}</span>
        </div>
        <span className="text-gray-300">•</span>
        <div className="flex items-center gap-1 text-orange-600 font-semibold">
          <Flame className="w-4 h-4" />
          <span>{savedRecipe.total_calories} kkal</span>
        </div>
        {savedRecipe.savings_vs_buying > 0 && (
          <>
            <span className="text-gray-300">•</span>
            <span className="text-green-600 text-sm font-medium">
              Hemat {Math.round(savedRecipe.savings_vs_buying / 1000)}k
            </span>
          </>
        )}
      </div>

      {/* ROW 4: Compact Macros Bar */}
      <div className="flex items-center gap-1 mb-4 text-xs">
        <div className="flex items-center gap-1 px-2 py-1 bg-cyan-50 text-cyan-700 rounded-md">
          <span className="font-bold">{savedRecipe.total_protein || 0}g</span>
          <span className="text-cyan-500">Protein</span>
        </div>
        {(savedRecipe.total_fat || 0) > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md">
            <span className="font-bold">{savedRecipe.total_fat}g</span>
            <span className="text-yellow-500">Lemak</span>
          </div>
        )}
        {(savedRecipe.total_carbs || 0) > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md">
            <span className="font-bold">{savedRecipe.total_carbs}g</span>
            <span className="text-amber-500">Karbo</span>
          </div>
        )}
        {/* Date - Very subtle */}
        <div className="ml-auto flex items-center gap-1 text-gray-400">
          <Clock className="w-3 h-3" />
          <span>
            {savedRecipe.created_at
              ? new Date(savedRecipe.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              })
              : '-'}
          </span>
        </div>
      </div>

      {/* ROW 5: Actions - Better Grouped */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Primary Action: Cook Button */}
        {onCook && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card toggle
              onCook();
            }}
            disabled={isCooking}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCooking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memasak...</span>
              </>
            ) : (
              <>
                <ChefHat className="w-4 h-4" />
                <span>{savedRecipe.first_cooked_at ? 'Masak Lagi!' : 'Masak!'}</span>
                <span className="text-xs opacity-80">+{potentialGold}🪙</span>
              </>
            )}
          </motion.button>
        )}

        {/* Undo Button - Secondary, smaller */}
        {savedRecipe.first_cooked_at && onUndoCook && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onUndoCook();
            }}
            disabled={isUndoing}
            className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {isUndoing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>↩️</span>}
          </motion.button>
        )}

        {/* Icon Buttons Group - Increased Spacing */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Favorite */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${savedRecipe.is_favorite
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'
              }`}
          >
            <Heart className={`w-4 h-4 ${savedRecipe.is_favorite ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Delete */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-9 h-9 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>

          {/* Expand - Ghost style to reduce visual noise */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
            <div className="border-t border-teal-100 pt-4 mt-4 space-y-4">
              {/* Ingredients */}
              <div>
                <h4 className="text-sm font-bold text-teal-800 mb-2">🛒 Bahan Belanja</h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {savedRecipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center px-3 py-2 bg-teal-50/70 rounded-lg text-sm"
                    >
                      <span className="text-teal-800">
                        <span className="font-medium">{ing.name}</span>
                        <span className="text-teal-500 ml-1">({ing.qty})</span>
                      </span>
                      <span className="text-amber-600 font-semibold">
                        Rp {ing.estimatedPriceRp.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooking Steps */}
              <div>
                <h4 className="text-sm font-bold text-teal-800 mb-2">👨‍🍳 Cara Masak</h4>
                <div className="space-y-2">
                  {savedRecipe.cooking_steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-sm">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <p className="flex-1 text-teal-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools Required */}
              {savedRecipe.tools_required && savedRecipe.tools_required.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-teal-600 mb-1.5">Alat yang Diperlukan</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {savedRecipe.tools_required.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
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
