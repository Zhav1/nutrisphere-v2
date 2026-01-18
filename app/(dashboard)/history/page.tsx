'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, Sparkles, History } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useProfile } from '@/lib/hooks/useProfile';
import {
    TimePeriod,
    useNutritionHistory,
    useEconomyHistory,
    useXPHistory,
    useFoodLogHistory,
} from '@/lib/hooks/useHistory';
import TimeFilter from '@/components/history/TimeFilter';

// PERFORMANCE: Dynamic imports for heavy chart components (recharts is ~150KB)
const ChartSkeleton = () => (
    <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse rounded-2xl" />
);

const NutritionTrendChart = dynamic(() => import('@/components/history/NutritionTrendChart'), {
    loading: () => <ChartSkeleton />,
    ssr: false, // Charts don't need SSR
});

const EconomyChart = dynamic(() => import('@/components/history/EconomyChart'), {
    loading: () => <ChartSkeleton />,
    ssr: false,
});

const XPProgressChart = dynamic(() => import('@/components/history/XPProgressChart'), {
    loading: () => <ChartSkeleton />,
    ssr: false,
});

const FoodLogTimeline = dynamic(() => import('@/components/history/FoodLogTimeline'), {
    loading: () => <div className="h-48 bg-slate-100 animate-pulse rounded-2xl" />,
});

export default function HistoryPage() {
    // PERFORMANCE: Get userId from centralized AuthContext
    const { userId } = useAuth();
    const [period, setPeriod] = useState<TimePeriod>('7d');

    // Fetch profile for XP/level data
    const { data: profile } = useProfile(userId);

    // Fetch history data
    const { data: nutritionData, isLoading: nutritionLoading } = useNutritionHistory(userId, period);
    const { data: economyData, isLoading: economyLoading } = useEconomyHistory(userId, period);
    const { data: xpData, isLoading: xpLoading } = useXPHistory(userId, period);
    const { data: foodLogData, isLoading: foodLogLoading } = useFoodLogHistory(userId, period);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
        },
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">
            {/* Background Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-200 rounded-full blur-3xl opacity-40"
                    animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute top-20 right-10 w-[400px] h-[400px] bg-lime-200 rounded-full blur-3xl opacity-30"
                    animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />
                <motion.div
                    className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-teal-100 rounded-full blur-3xl opacity-35"
                    animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <History className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-teal-900">Riwayat</h1>
                                <p className="text-teal-700">Perjalanan nutrisimu</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Time Filter */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <TimeFilter value={period} onChange={setPeriod} />
                    </motion.div>

                    {/* Stats Cards Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Nutrition Trend Card */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-teal-100 transition-shadow duration-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-lg font-bold text-teal-900">Tren Nutrisi</h3>
                                </div>
                                <NutritionTrendChart
                                    data={nutritionData || []}
                                    isLoading={nutritionLoading}
                                />
                            </div>
                        </motion.div>

                        {/* Economy Card */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-yellow-100 transition-shadow duration-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <Wallet className="w-5 h-5 text-amber-600" />
                                    <h3 className="text-lg font-bold text-teal-900">Gold & Penghematan</h3>
                                </div>
                                <EconomyChart
                                    data={economyData || []}
                                    isLoading={economyLoading}
                                />
                            </div>
                        </motion.div>

                        {/* XP Progress Card */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-purple-100 transition-shadow duration-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    <h3 className="text-lg font-bold text-teal-900">Progres XP</h3>
                                </div>
                                <XPProgressChart
                                    data={xpData || []}
                                    isLoading={xpLoading}
                                    currentLevel={profile?.level ?? 1}
                                    currentXp={profile?.current_xp ?? 0}
                                    maxXp={profile?.max_xp ?? 100}
                                />
                            </div>
                        </motion.div>

                        {/* Food Log Timeline Card */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-100 transition-shadow duration-300 h-[500px] flex flex-col">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-teal-100/50 shrink-0">
                                    <History className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-bold text-teal-900">Log Makanan</h3>
                                </div>
                                <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                    <FoodLogTimeline
                                        data={foodLogData?.groupedByDate || []}
                                        isLoading={foodLogLoading}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
