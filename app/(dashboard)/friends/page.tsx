'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, ChevronDown, ChevronUp, Loader2, Bell } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useFriendsList, useFriendshipRealtimeSync } from '@/lib/hooks/useFriends';
import GlassCard from '@/components/ui/GlassCard';
import FriendCard from '@/components/friends/FriendCard';
import FriendRequestCard from '@/components/friends/FriendRequestCard';
import FriendSearchModal from '@/components/friends/FriendSearchModal';

/**
 * Friends Page - Main friends list with pending requests
 * Uses eco-glass aesthetic matching the dashboard
 * Now with Supabase Realtime for cross-user sync
 */
export default function FriendsPage() {
    const router = useRouter();
    // PERFORMANCE: Get userId from centralized AuthContext
    const { userId, isLoading: authLoading, isAuthenticated } = useAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [requestsExpanded, setRequestsExpanded] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    // Supabase Realtime subscription for cross-user sync
    useFriendshipRealtimeSync(userId);

    // Fetch friends data
    const { data, isLoading, refetch } = useFriendsList();

    if (!userId || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-emerald-200 rounded-full blur-3xl opacity-40" />
                    <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-lime-200 rounded-full blur-3xl opacity-30" />
                </div>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader2 className="w-12 h-12 text-emerald-500" />
                </motion.div>
            </div>
        );
    }

    const friends = data?.friends ?? [];
    const pendingIncoming = data?.pending_incoming ?? [];
    const pendingOutgoing = data?.pending_outgoing ?? [];
    const hasPendingRequests = pendingIncoming.length > 0;

    // Create accessories map from batch-fetched data (performance optimization)
    const accessoriesMap = new Map(
        data?.accessories?.map(a => [a.id, a]) ?? []
    );

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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="w-10 h-10 text-emerald-600" />
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-teal-900">
                                        Teman
                                    </h1>
                                    <p className="text-teal-700">{friends.length} teman</p>
                                </div>
                            </div>

                            {/* Add Friend Button */}
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-shadow"
                            >
                                <UserPlus className="w-5 h-5" />
                                <span className="hidden sm:inline">Cari Teman</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* PENDING REQUESTS SECTION */}
                    {hasPendingRequests && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <GlassCard className="p-4">
                                <button
                                    onClick={() => setRequestsExpanded(!requestsExpanded)}
                                    className="w-full flex items-center justify-between mb-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-amber-500" />
                                        <h2 className="font-semibold text-slate-800">
                                            Permintaan Teman
                                        </h2>
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-sm font-medium">
                                            {pendingIncoming.length}
                                        </span>
                                    </div>
                                    {requestsExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {requestsExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-3 overflow-hidden"
                                        >
                                            {pendingIncoming.map((request) => (
                                                <FriendRequestCard
                                                    key={request.friendship_id}
                                                    request={request}
                                                    accessoriesMap={accessoriesMap}
                                                />
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* PENDING OUTGOING (optional display) */}
                    {pendingOutgoing.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <GlassCard className="p-4">
                                <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 text-slate-400" />
                                    Menunggu Konfirmasi
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-sm">
                                        {pendingOutgoing.length}
                                    </span>
                                </h2>
                                <div className="space-y-2">
                                    {pendingOutgoing.map((friendship) => (
                                        <div
                                            key={friendship.id}
                                            className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 text-sm text-slate-600"
                                        >
                                            <span className="flex-1 truncate">
                                                {friendship.friend.display_name || 'Pengguna NutriSphere'}
                                            </span>
                                            <span className="text-xs text-slate-400">Waiting...</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* FRIENDS LIST */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlassCard className="p-6">
                            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-600" />
                                Daftar Teman
                            </h2>

                            {friends.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-600 mb-2">
                                        Belum Ada Teman
                                    </h3>
                                    <p className="text-slate-400 mb-6">
                                        Cari dan tambahkan teman untuk melihat profil mereka
                                    </p>
                                    <button
                                        onClick={() => setIsSearchOpen(true)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Cari Teman
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {friends.map((friendship, index) => (
                                        <motion.div
                                            key={friendship.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + index * 0.05 }}
                                        >
                                            <FriendCard
                                                friendship={friendship}
                                                accessoriesMap={accessoriesMap}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                </div>
            </div>

            {/* Search Modal */}
            <FriendSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </div>
    );
}
