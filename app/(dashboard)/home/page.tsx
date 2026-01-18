'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Camera, Utensils, History, Wallet, TrendingUp, Flame, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useProfile, useSavedRecipesCount } from '@/lib/hooks/useProfile';
import { useNutritionSummary } from '@/lib/hooks/useFoodLogs';
import { useEquippedAccessories } from '@/lib/hooks/useAccessories';
import { useMidnightInvalidation } from '@/lib/hooks/useMidnightReset';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client'; // Still needed for daily cook count reset
import { formatCurrency } from '@/lib/constants';

// PERFORMANCE: Dynamic imports for heavy components (reduces initial bundle)
const NutriGotchiAvatar = dynamic(() => import('@/components/ui/NutriGotchiAvatar'), {
  loading: () => <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />,
  ssr: true, // Keep SSR since it's above the fold
});

const RecentRecipes = dynamic(() => import('@/components/dashboard/RecentRecipes'), {
  loading: () => <div className="h-48 bg-slate-100 animate-pulse rounded-2xl" />,
});

const LevelUpModal = dynamic(() => import('@/components/gamification/LevelUpModal'), {
  ssr: false, // Modal doesn't need SSR
});

const FaintedModal = dynamic(() => import('@/components/gamification/FaintedModal'), {
  ssr: false,
});

const HabitHubWidget = dynamic(() => import('@/components/gamification/HabitHubWidget'), {
  loading: () => <div className="h-24 bg-slate-100 animate-pulse rounded-2xl" />,
});

const XPProgressBar = dynamic(() => import('@/components/gamification/XPProgressBar'));

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 10) return { text: 'Selamat Pagi', emoji: '☀️' };
  if (hour >= 10 && hour < 15) return { text: 'Selamat Siang', emoji: '🌤️' };
  if (hour >= 15 && hour < 18) return { text: 'Selamat Sore', emoji: '🌥️' };
  return { text: 'Selamat Malam', emoji: '🌙' };
}

// Daily nutrition targets (in grams, except calories)
const NUTRITION_TARGETS = {
  protein: 60,   // g per day
  carbs: 250,    // g per day
  fat: 65,       // g per day  
  calories: 2000,// kkal per day
};

export default function DashboardPage() {
  // PERFORMANCE: Get userId from centralized AuthContext (eliminates redundant auth call)
  const { userId } = useAuth();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [adjustedDailyCookCount, setAdjustedDailyCookCount] = useState<number>(0);

  // Auto-invalidate caches at midnight for daily resets
  useMidnightInvalidation(userId);

  // Fetch real profile data
  const { data: profile, isLoading } = useProfile(userId);

  // Check and reset daily cook count on page load (same logic as recipes page)
  useEffect(() => {
    const checkAndResetDailyCookCount = async () => {
      if (!userId || !profile) return;

      // CRITICAL FIX: Format local date without UTC conversion
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      const lastResetDate = profile.last_cook_reset_date;

      // DEBUG: Log exact values
      console.log('[Dashboard] 📅 Daily count check:', {
        currentCount: profile.daily_cook_count,
        lastResetDate,
        today,
        needsReset: lastResetDate < today,
      });

      if (lastResetDate < today) {
        // New day! Reset count client-side for instant UI update
        setAdjustedDailyCookCount(0);
        console.log('[Dashboard] 🔄 New day detected! Resetting:', lastResetDate, '→', today);

        // Also update backend database for consistency
        try {
          await supabase
            .from('profiles')
            .update({ daily_cook_count: 0, last_cook_reset_date: today })
            .eq('id', userId);
          console.log('[Dashboard] ✅ Backend daily cook count reset complete');
        } catch (error) {
          console.error('[Dashboard] ❌ Backend reset failed:', error);
        }
      } else {
        // Same day, use actual count
        setAdjustedDailyCookCount(profile.daily_cook_count ?? 0);
        console.log('[Dashboard] ⏭️ Same day, using actual count:', profile.daily_cook_count);
      }
    };

    checkAndResetDailyCookCount();
  }, [userId, profile?.daily_cook_count, profile?.last_cook_reset_date]);

  // Fetch real nutrition summary from today's food logs
  const { data: nutritionData, isLoading: nutritionLoading } = useNutritionSummary(userId, 1);

  // Fetch equipped accessories
  const { data: equippedAccessoriesData } = useEquippedAccessories(
    userId,
    profile?.equipped_accessories ?? null
  );

  // Fetch actual saved recipes count (fixes mismatch with profile.recipes_cooked)
  const { data: actualRecipesCount } = useSavedRecipesCount(userId);

  // Check for level up
  useEffect(() => {
    if (profile && previousLevel !== null && profile.level > previousLevel) {
      setShowLevelUp(true);
    }
    if (profile) {
      setPreviousLevel(profile.level);
    }
  }, [profile?.level]);

  // Calculate today's nutrition from food logs
  const todayNutrition = {
    protein: { current: Math.round(nutritionData?.totals?.protein ?? 0), target: NUTRITION_TARGETS.protein },
    carbs: { current: Math.round(nutritionData?.totals?.carbs ?? 0), target: NUTRITION_TARGETS.carbs },
    fat: { current: Math.round(nutritionData?.totals?.fat ?? 0), target: NUTRITION_TARGETS.fat },
    calories: { current: Math.round(nutritionData?.totals?.calories ?? 0), target: NUTRITION_TARGETS.calories },
  };

  const hasNoFoodLogs = !nutritionLoading && (nutritionData?.entriesCount ?? 0) === 0;

  // Use real data or fallback to defaults
  const userData = {
    nutriGotchi: {
      mood: profile?.mood ?? 'neutral' as const,
      health: profile?.health ?? 100,
      level: profile?.level ?? 1,
      currentXp: profile?.current_xp ?? 0,
      maxXp: profile?.max_xp ?? 100,
    },
    economy: {
      moneySaved: profile?.total_savings_rp ?? 0,
      gold: profile?.wallet_balance ?? 0,
    },
    stats: {
      streakDays: profile?.streak_days ?? 0,
      recipesCooked: actualRecipesCount ?? profile?.recipes_cooked ?? 0,  // Use actual count
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        newLevel={userData.nutriGotchi.level}
        rewards={{ gold: userData.nutriGotchi.level * 10 }}
      />

      {/* Fainted Modal - shows when HP reaches 0 or is_fainted is true */}
      <FaintedModal
        isOpen={profile?.is_fainted === true || (profile?.health === 0)}
        recoveryCount={profile?.faint_recovery_count ?? 0}
        recoveryTarget={3}
      />

      {/* LIVING ATMOSPHERE - Morning Sunlight Through Leaves */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Emerald Blob - Top Left */}
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-200 rounded-full blur-3xl opacity-40"
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Lime Blob - Top Right */}
        <motion.div
          className="absolute top-20 right-10 w-[400px] h-[400px] bg-lime-200 rounded-full blur-3xl opacity-30"
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Teal Blob - Bottom Center */}
        <motion.div
          className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-teal-100 rounded-full blur-3xl opacity-35"
          animate={{
            x: [0, 30, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

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
            <h1 className="text-4xl md:text-5xl font-bold text-teal-900 mb-2">
              {getGreeting().text}, {profile?.display_name || 'Sahabat Nutri'}! {getGreeting().emoji}
            </h1>
            <p className="text-teal-700 text-lg">
              Siap tingkatin level nutrisimu hari ini?
            </p>
          </motion.div>

          {/* BENTO GRID with Staggered Entrance */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 1. NUTRI-GOTCHI FLOATING BUBBLE */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-2"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="relative backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-6 md:p-8 min-h-[320px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-shadow duration-300">
                {/* Soft Green Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-teal-50/30 to-transparent rounded-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  {/* Floating Bubble with Avatar */}
                  <motion.div
                    className="flex-shrink-0 relative"
                    animate={{
                      y: [-8, 8, -8],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Glass Bubble Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-2xl scale-125" />
                    <NutriGotchiAvatar
                      mood={userData.nutriGotchi.mood}
                      health={userData.nutriGotchi.health}
                      size="lg"
                      animate={true}
                      equippedAccessories={equippedAccessoriesData ?? []}
                    />
                  </motion.div>

                  {/* Speech Bubble - Juicy Green */}
                  <div className="flex-1 space-y-4">
                    <motion.div
                      className="relative bg-emerald-500 text-white rounded-2xl p-4 shadow-lg"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <p className="font-medium">
                        {userData.nutriGotchi.health > 80
                          ? "Wah sehat banget nih! Gas masak lagi bro! 💪"
                          : userData.nutriGotchi.health > 50
                            ? "Lumayan nih, tapi bisa lebih sehat lagi! 🍃"
                            : "Butuh makan sehat nih... 😔"}
                      </p>
                      {/* Tail */}
                      <div className="absolute -left-2 top-6 w-0 h-0 border-t-8 border-t-transparent border-r-12 border-r-emerald-500 border-b-8 border-b-transparent" />
                    </motion.div>

                    {/* XP Progress Bar */}
                    <XPProgressBar
                      currentXp={userData.nutriGotchi.currentXp}
                      maxXp={userData.nutriGotchi.maxXp}
                      level={userData.nutriGotchi.level}
                      showLabel={true}
                      animate={true}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. ECONOMY CARD - Frosted Glass */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-6 h-full shadow-sm hover:shadow-xl hover:shadow-yellow-100 transition-shadow duration-300">
                <div className="flex items-center gap-2 mb-6">
                  <Wallet className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-teal-900">Ekonomi</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-teal-700 mb-2">Uang Hemat</p>
                    <motion.p
                      className="text-3xl font-bold text-amber-600"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      {formatCurrency(userData.economy.moneySaved)}
                    </motion.p>
                    <p className="text-xs text-teal-600 mt-1">vs budget tersedia</p>
                  </div>

                  <div className="pt-4 border-t border-teal-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🪙</span>
                        <span className="text-sm text-teal-700">Gold</span>
                      </div>
                      <motion.span
                        className="text-2xl font-bold text-yellow-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        {userData.economy.gold}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 3. QUICK ACTIONS - Tactile Cards */}
            <motion.div variants={itemVariants} className="md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* PRIMARY: Scan - Juicy Green Gradient */}
                <Link href="/scan">
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl p-6 cursor-pointer shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-shadow duration-300"
                  >
                    {/* 3D Inner Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                        <Camera className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Scan Makanan</h3>
                        <p className="text-sm text-emerald-50">Deteksi nutrisi otomatis</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* Cook Action - Active Gradient */}
                <Link href="/recipes">
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl p-6 cursor-pointer shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-shadow duration-300"
                  >
                    {/* 3D Inner Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                        <Utensils className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Masak Hemat</h3>
                        <p className="text-sm text-orange-50">Resep sesuai budget</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* Shop Action - NEW */}
                <Link href="/shop">
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl p-6 cursor-pointer shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-shadow duration-300"
                  >
                    {/* 3D Inner Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                        <ShoppingBag className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Toko</h3>
                        <p className="text-sm text-purple-50">Aksesoris NutriGotchi</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* History Action - NOW ACTIVE */}
                <Link href="/history">
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl p-6 cursor-pointer shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-shadow duration-300"
                  >
                    {/* 3D Inner Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                        <History className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Riwayat</h3>
                        <p className="text-sm text-blue-50">Statistik & grafik</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* 4. NUTRITION PROGRESS - Liquid Bars */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-2"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-teal-100 transition-shadow duration-300">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-teal-900">Nutrisi Hari Ini</h3>
                </div>

                {hasNoFoodLogs ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">📸</div>
                    <p className="text-teal-700 font-medium">Belum ada data nutrisi</p>
                    <p className="text-teal-600 text-sm">Scan makanan pertamamu!</p>
                    <Link href="/scan">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg text-sm font-medium shadow-md"
                      >
                        Scan Sekarang
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <LiquidBar
                      label="Protein"
                      emoji="🥩"
                      current={todayNutrition.protein.current}
                      target={todayNutrition.protein.target}
                      color="from-cyan-400 to-blue-500"
                      trackBg="bg-cyan-100"
                      unit="g"
                      delay={1.2}
                    />
                    <LiquidBar
                      label="Karbohidrat"
                      emoji="🍚"
                      current={todayNutrition.carbs.current}
                      target={todayNutrition.carbs.target}
                      color="from-amber-400 to-yellow-500"
                      trackBg="bg-amber-100"
                      unit="g"
                      delay={1.4}
                    />
                    <LiquidBar
                      label="Lemak"
                      emoji="🧈"
                      current={todayNutrition.fat.current}
                      target={todayNutrition.fat.target}
                      color="from-yellow-400 to-orange-500"
                      trackBg="bg-yellow-100"
                      unit="g"
                      delay={1.6}
                    />
                    <LiquidBar
                      label="Kalori"
                      emoji="🔥"
                      current={todayNutrition.calories.current}
                      target={todayNutrition.calories.target}
                      color="from-rose-400 to-red-500"
                      trackBg="bg-rose-100"
                      unit="kkal"
                      delay={1.8}
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* 5. HABIT HUB - Streak & Quota */}
            <HabitHubWidget
              streakDays={userData.stats.streakDays}
              dailyCookCount={adjustedDailyCookCount}
              userId={userId}
              streakShieldActive={profile?.streak_shield_active}
            />

            {/* RECENT RECIPES WIDGET */}
            <motion.div variants={itemVariants} className="md:col-span-3">
              <RecentRecipes />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Liquid Progress Bar Component
interface LiquidBarProps {
  label: string;
  emoji: string;
  current: number;
  target: number;
  color: string;
  trackBg: string;
  unit?: string;  // NEW: optional unit like 'g' or 'kkal'
  delay: number;
}

function LiquidBar({ label, emoji, current, target, color, trackBg, unit = 'g', delay }: LiquidBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isOverTarget = current > target;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="text-sm font-medium text-teal-900">{label}</span>
        </div>
        <span className={`text-sm font-bold ${isOverTarget ? 'text-red-600' : 'text-teal-700'}`}>
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <div className={`w-full h-3 ${trackBg} rounded-full overflow-hidden shadow-inner`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full shadow-sm`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay, duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
