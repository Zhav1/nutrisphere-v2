'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Eye, UserMinus, Flame, ChefHat, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { FriendWithProfile } from '@/types/friend';
import { useRemoveFriend } from '@/lib/hooks/useFriends';
import { useEquippedAccessories } from '@/lib/hooks/useAccessories';
import NutriGotchiAvatar from '@/components/ui/NutriGotchiAvatar';
import toast from 'react-hot-toast';

interface FriendCardProps {
    friendship: FriendWithProfile;
    accessoriesMap?: Map<string, any>; // Optional: batch-fetched accessories
    onRemoved?: () => void;
}

/**
 * FriendCard - Displays a friend in the list with actions
 * Uses eco-glass aesthetic matching the app design
 */
export default function FriendCard({ friendship, accessoriesMap, onRemoved }: FriendCardProps) {
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
    const removeFriend = useRemoveFriend();

    const friend = friendship.friend;

    // Use batched accessories if provided, otherwise fetch individually (backward compat)
    const { data: fetchedAccessories } = useEquippedAccessories(
        friend.id,
        friend.equipped_accessories ?? null
    );

    // Get accessories from map or fetched data
    const equippedAccessories = accessoriesMap
        ? Object.values(friend.equipped_accessories || {})
            .map(id => accessoriesMap.get(id as string))
            .filter(Boolean)
        : fetchedAccessories;

    const handleViewDetails = () => {
        router.push(`/friends/${friendship.id}`);
    };

    const handleRemove = () => {
        // Close modal immediately - optimistic update already happened
        setShowConfirm(false);

        // Fire mutation (non-blocking) - cache already updated via onMutate
        removeFriend.mutate(friendship.id, {
            onSuccess: () => toast.success('Teman dihapus'),
            onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal menghapus teman')
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 shadow-lg shadow-emerald-100/30 hover:shadow-xl transition-shadow"
        >
            {/* Main content */}
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <NutriGotchiAvatar
                        size="sm"
                        mood={friend.mood}
                        health={friend.health}
                        equippedAccessories={equippedAccessories ?? []}
                        showHealthBar={false}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                        {friend.display_name || 'Pengguna NutriSphere'}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">
                        Level {friend.level}
                    </p>
                    {/* Mini stats */}
                    <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-orange-500">
                            <Flame className="w-3 h-3" />
                            {friend.streak_days}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                            <ChefHat className="w-3 h-3" />
                            {friend.recipes_saved ?? 0}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleViewDetails}
                        className="p-2 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                        title="Lihat Detail"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="p-2 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                        title="Hapus Teman"
                    >
                        <UserMinus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Confirmation modal */}
            {showConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 z-10"
                >
                    <User className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-center text-slate-700 mb-4">
                        Hapus <strong>{friend.display_name}</strong> dari daftar teman?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={removeFriend.isPending}
                            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                            {removeFriend.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Hapus
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
