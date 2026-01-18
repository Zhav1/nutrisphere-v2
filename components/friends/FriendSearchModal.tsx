'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Loader2, Clock, Check, Users } from 'lucide-react';
import { useSearchUsers, useSendFriendRequest } from '@/lib/hooks/useFriends';
import type { UserSearchResult } from '@/types/friend';
import NutriGotchiAvatar from '@/components/ui/NutriGotchiAvatar';
import toast from 'react-hot-toast';
import { useDebouncedCallback } from 'use-debounce';

interface FriendSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * FriendSearchModal - Search for users and send friend requests
 * Fullscreen modal with search input and results
 */
export default function FriendSearchModal({ isOpen, onClose }: FriendSearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserSearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const searchUsers = useSearchUsers();
    const sendRequest = useSendFriendRequest();

    // Debounced search
    const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        try {
            const response = await searchUsers.mutateAsync(searchQuery);
            setResults(response.results);
            setHasSearched(true);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Gagal mencari pengguna');
        }
    }, 300);

    const handleInputChange = (value: string) => {
        setQuery(value);
        debouncedSearch(value);
    };

    const handleSendRequest = async (userId: string) => {
        try {
            const response = await sendRequest.mutateAsync(userId);
            toast.success(response.message || 'Permintaan teman dikirim!');

            // Update local results to reflect new status
            setResults(prev => prev.map(r =>
                r.id === userId
                    ? { ...r, friendship_status: 'pending' as const, pending_direction: 'outgoing' as const }
                    : r
            ));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal mengirim permintaan');
        }
    };

    const handleClose = useCallback(() => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
        onClose();
    }, [onClose]);

    const getStatusButton = (result: UserSearchResult) => {
        const { friendship_status, pending_direction } = result;

        if (friendship_status === 'accepted') {
            return (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-600 text-sm">
                    <Check className="w-4 h-4" />
                    Teman
                </span>
            );
        }

        if (friendship_status === 'pending') {
            if (pending_direction === 'outgoing') {
                return (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-600 text-sm">
                        <Clock className="w-4 h-4" />
                        Menunggu
                    </span>
                );
            } else {
                return (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-sm">
                        <Users className="w-4 h-4" />
                        Minta Anda
                    </span>
                );
            }
        }

        // No existing friendship
        return (
            <button
                onClick={() => handleSendRequest(result.id)}
                disabled={sendRequest.isPending}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm disabled:opacity-50"
            >
                {sendRequest.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <UserPlus className="w-4 h-4" />
                )}
                Tambah
            </button>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Cari Teman</h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search input */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder="Cari dengan nama atau kode teman (NS-XXXXXXXX)"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Results */}
                        <div className="p-4 max-h-[60dvh] overflow-y-auto">
                            {searchUsers.isPending && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                </div>
                            )}

                            {!searchUsers.isPending && hasSearched && results.length === 0 && (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">Tidak ada pengguna ditemukan</p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Coba cari dengan nama atau kode teman lain
                                    </p>
                                </div>
                            )}

                            {!searchUsers.isPending && !hasSearched && query.length === 0 && (
                                <div className="text-center py-8">
                                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">Masukkan nama atau kode teman</p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Minimal 2 karakter untuk mencari
                                    </p>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className="space-y-3">
                                    {results.map((result, index) => (
                                        <motion.div
                                            key={result.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                                        >
                                            {/* Avatar */}
                                            <NutriGotchiAvatar
                                                size="xs"
                                                mood={result.mood}
                                                health={100}
                                                equippedAccessories={[]}
                                                showHealthBar={false}
                                            />

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-slate-800 truncate">
                                                    {result.display_name || 'Pengguna NutriSphere'}
                                                </h4>
                                                <p className="text-xs text-slate-500">
                                                    Level {result.level} • {result.friend_code}
                                                </p>
                                            </div>

                                            {/* Action button */}
                                            {getStatusButton(result)}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
