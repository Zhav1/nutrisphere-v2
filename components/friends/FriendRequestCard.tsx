'use client';

import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import type { PendingRequest } from '@/types/friend';
import { useRespondToRequest } from '@/lib/hooks/useFriends';
import NutriGotchiAvatar from '@/components/ui/NutriGotchiAvatar';
import toast from 'react-hot-toast';

interface FriendRequestCardProps {
    request: PendingRequest;
    accessoriesMap?: Map<string, any>; // Optional: batch-fetched accessories
    onResponded?: () => void;
}

/**
 * FriendRequestCard - Displays a pending friend request with accept/reject actions
 */
export default function FriendRequestCard({ request, accessoriesMap, onResponded }: FriendRequestCardProps) {
    const respondToRequest = useRespondToRequest();

    const handleAccept = () => {
        // Fire mutation (non-blocking) - cache updated via onMutate
        respondToRequest.mutate(
            { friendshipId: request.friendship_id, action: 'accept' },
            {
                onSuccess: () => toast.success(`${request.sender.display_name || 'User'} ditambahkan sebagai teman!`),
                onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal menerima permintaan')
            }
        );
    };

    const handleReject = () => {
        // Fire mutation (non-blocking) - cache updated via onMutate
        respondToRequest.mutate(
            { friendshipId: request.friendship_id, action: 'reject' },
            {
                onSuccess: () => toast.success('Permintaan ditolak'),
                onError: (error) => toast.error(error instanceof Error ? error.message : 'Gagal menolak permintaan')
            }
        );
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays} hari lalu`;
        if (diffHours > 0) return `${diffHours} jam lalu`;
        if (diffMins > 0) return `${diffMins} menit lalu`;
        return 'Baru saja';
    };

    const isLoading = respondToRequest.isPending;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-4 shadow-sm"
        >
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <NutriGotchiAvatar
                        size="sm"
                        mood={request.sender.mood}
                        health={request.sender.health}
                        equippedAccessories={[]}
                        showHealthBar={false}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 truncate">
                        {request.sender.display_name || 'Pengguna NutriSphere'}
                    </h4>
                    <p className="text-xs text-slate-500">
                        Level {request.sender.level} • {formatTimeAgo(request.created_at)}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        title="Terima"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Check className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={isLoading}
                        className="p-2 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors disabled:opacity-50"
                        title="Tolak"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
