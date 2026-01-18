'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    User, Calendar, UserMinus, Loader2,
    Flame, ChefHat, Trophy, Star
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useFriendProfile, useRemoveFriend } from '@/lib/hooks/useFriends';
import { useEquippedAccessories } from '@/lib/hooks/useAccessories';
import { calculateMaxXp } from '@/lib/hooks/useProfile';
import GlassCard from '@/components/ui/GlassCard';
import BackButton from '@/components/ui/BackButton';
import NutriGotchiAvatar from '@/components/ui/NutriGotchiAvatar';
import NutriGotchiLoader from '@/components/ui/NutriGotchiLoader';
import NProgress from 'nprogress';
import toast from 'react-hot-toast';

/**
 * Friend Detail Page - View friend's profile
 * Similar to own profile page but without edit/signout functionality
 */
export default function FriendDetailPage({ params }: { params: { id: string } }) {
    const friendshipId = params.id;

    const router = useRouter();
    // PERFORMANCE: Get userId from centralized AuthContext
    const { userId, isLoading: authLoading, isAuthenticated } = useAuth();
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch friend profile
    const { data, isLoading, error } = useFriendProfile(friendshipId);
    const removeFriend = useRemoveFriend();

    // Parse equipped accessories for avatar
    const equippedAccessoriesMap = data?.profile?.equipped_accessories ?? null;
    const { data: equippedAccessoriesData } = useEquippedAccessories(
        data?.profile?.id ?? null,
        equippedAccessoriesMap
    );

    const handleRemoveFriend = async () => {
        try {
            NProgress.start();
            await removeFriend.mutateAsync(friendshipId);
            toast.success('Teman dihapus');
            router.push('/friends');
        } catch (error) {
            NProgress.done();
            toast.error(error instanceof Error ? error.message : 'Gagal menghapus teman');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (!userId || isLoading) {
        return <NutriGotchiLoader variant="overlay" message="Memuat profil teman..." />;
    }

    if (error || !data?.profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700 mb-2">
                        Profil Tidak Ditemukan
                    </h2>
                    <p className="text-slate-500 mb-6">
                        {error instanceof Error ? error.message : 'Tidak dapat memuat profil teman'}
                    </p>
                    <BackButton variant="light" href="/friends" position="inline" />
                </div>
            </div>
        );
    }

    const profile = data.profile;

    // Stats data
    const stats = [
        {
            label: 'Streak',
            value: profile.streak_days,
            icon: Flame,
            color: 'text-orange-500',
            bgColor: 'bg-orange-100'
        },
        {
            label: 'Resep Tersimpan',
            value: profile.recipes_saved ?? 0,
            icon: ChefHat,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100'
        },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">
            {/* LIVING ATMOSPHERE */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-200 rounded-full blur-3xl opacity-40"
                    animate={{
                        x: [0, 40, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute top-20 right-10 w-[400px] h-[400px] bg-lime-200 rounded-full blur-3xl opacity-30"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />
                <motion.div
                    className="absolute -bottom-20 left-1/4 w-[500px] h-[500px] bg-teal-200 rounded-full blur-3xl opacity-30"
                    animate={{
                        x: [0, 60, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                />
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* HEADER */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        {/* Back Button */}
                        <div className="mb-4">
                            <BackButton variant="light" href="/friends" position="inline" />
                        </div>

                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <User className="w-10 h-10 text-emerald-600" />
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-teal-900">
                                    Profil Teman
                                </h1>
                                <p className="text-teal-700">{profile.friend_code}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* PROFILE CARD */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <GlassCard className="p-8">
                            {/* Avatar & Name Section */}
                            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                                {/* NutriGotchi Avatar */}
                                <div className="relative flex-shrink-0">
                                    <motion.div
                                        animate={{ y: [-4, 4, -4] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <NutriGotchiAvatar
                                            mood={profile.mood}
                                            health={profile.health}
                                            size="lg"
                                            animate={true}
                                            showHealthBar={false}
                                            equippedAccessories={equippedAccessoriesData ?? []}
                                        />
                                    </motion.div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white">
                                        <Star className="w-4 h-4 text-white fill-white" />
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-2xl font-bold text-slate-800 mt-2">
                                        {profile.display_name || 'Pengguna NutriSphere'}
                                    </h2>

                                    {/* Friend Code */}
                                    <div className="flex items-center gap-2 text-slate-500 mt-2">
                                        <User className="w-4 h-4" />
                                        <span>{profile.friend_code}</span>
                                    </div>

                                    {/* Member Since */}
                                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Bergabung {formatDate(profile.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-200/60 my-6" />

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        className="text-center p-4 bg-white/60 rounded-2xl border border-white/50 hover:shadow-lg transition-shadow"
                                    >
                                        <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-2`}>
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                                        <div className="text-xs text-slate-500">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* LEVEL CARD */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                                        <Trophy className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">NutriGotchi Level</h3>
                                        <p className="text-slate-500 text-sm">Teman ini sudah level {profile.level}!</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-purple-600">Lv. {profile.level}</div>
                                    <div className="text-sm text-slate-500">{profile.current_xp} XP</div>
                                </div>
                            </div>
                            {/* XP Progress Bar */}
                            <div className="mt-4 h-3 bg-purple-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(profile.current_xp / calculateMaxXp(profile.level)) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* REMOVE FRIEND BUTTON */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        {showRemoveConfirm ? (
                            <GlassCard className="p-6 border-red-200">
                                <div className="text-center">
                                    <UserMinus className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                        Hapus {profile.display_name} dari daftar teman?
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Anda tidak akan bisa melihat profil mereka lagi.
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => setShowRemoveConfirm(false)}
                                            className="px-6 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleRemoveFriend}
                                            disabled={removeFriend.isPending}
                                            className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
                                        >
                                            {removeFriend.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Hapus Teman
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        ) : (
                            <button
                                onClick={() => setShowRemoveConfirm(true)}
                                className="w-full p-4 bg-white/60 backdrop-blur-sm border border-red-200 text-red-600 font-semibold rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-3"
                            >
                                <UserMinus className="w-5 h-5" />
                                Hapus dari Daftar Teman
                            </button>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
