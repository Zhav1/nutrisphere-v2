'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, ShoppingBag, Sparkles, Package } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AccessoryCardSkeleton from '@/components/shop/AccessoryCardSkeleton';

import { useAccessories, usePurchaseAccessory, useToggleEquipAccessory, useEquippedAccessories, useOwnedAccessories } from '@/lib/hooks/useAccessories';
import { useProfile } from '@/lib/hooks/useProfile';
import { useAuth } from '@/lib/contexts/AuthContext';
import AccessoryCard from '@/components/gamification/AccessoryCard';
import NutriGotchiAvatar from '@/components/ui/NutriGotchiAvatar';
import { Accessory, AccessoryCategory } from '@/types/accessory';

const CATEGORY_TABS: { id: AccessoryCategory | 'all' | 'owned'; label: string; emoji: string }[] = [
    { id: 'all', label: 'Semua', emoji: '✨' },
    { id: 'owned', label: 'Koleksiku', emoji: '📦' },
    { id: 'hat', label: 'Topi', emoji: '🎩' },
    { id: 'outfit', label: 'Outfit', emoji: '👕' },
    { id: 'background', label: 'Background', emoji: '🖼️' },
    { id: 'pet', label: 'Pet', emoji: '🐾' },
    { id: 'consumable', label: 'Konsumabel', emoji: '🛡️' },
];

export default function ShopPage() {
    // PERFORMANCE: Get userId from centralized AuthContext
    const { userId } = useAuth();
    const [activeCategory, setActiveCategory] = useState<AccessoryCategory | 'all' | 'owned'>('all');

    // Fetch data
    const { data: profile, isLoading: profileLoading } = useProfile(userId);
    const { data: accessories, isLoading: accessoriesLoading } = useAccessories();
    const purchaseMutation = usePurchaseAccessory();
    const toggleEquipMutation = useToggleEquipAccessory();

    // Get owned and equipped accessories with full details
    const ownedAccessoryIds = profile?.accessories ?? [];
    const equippedMap = profile?.equipped_accessories ?? null;
    const { data: ownedAccessoriesData } = useOwnedAccessories(userId, ownedAccessoryIds);
    const { data: equippedAccessoriesData } = useEquippedAccessories(userId, equippedMap);

    // Create a set of equipped IDs for quick lookup
    const equippedIds = new Set(equippedMap ? Object.values(equippedMap).filter(Boolean) : []);

    // Filter accessories by category
    const filteredAccessories = (() => {
        if (activeCategory === 'owned') {
            return ownedAccessoriesData ?? [];
        }
        if (activeCategory === 'all') {
            return accessories ?? [];
        }
        return accessories?.filter(acc => acc.category === activeCategory) ?? [];
    })();

    // Handle purchase
    const handlePurchase = async (accessory: Accessory) => {
        if (!userId || !profile) return;

        try {
            await purchaseMutation.mutateAsync({
                userId,
                accessoryId: accessory.id,
                price: accessory.price_gold,
            });

            toast.success(`Berhasil membeli ${accessory.name}! 🎉`);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Insufficient gold balance') {
                    toast.error('Gold tidak cukup! 💰');
                } else if (error.message === 'Accessory already owned') {
                    toast.error('Aksesoris sudah dimiliki!');
                } else {
                    toast.error('Gagal membeli aksesoris');
                }
            }
        }
    };

    // Handle equip/unequip toggle
    const handleToggleEquip = async (accessory: Accessory) => {
        if (!userId) return;

        const isCurrentlyEquipped = equippedIds.has(accessory.id);

        try {
            await toggleEquipMutation.mutateAsync({
                userId,
                accessory,
                equip: !isCurrentlyEquipped,
            });

            toast.success(
                isCurrentlyEquipped
                    ? `${accessory.name} dilepas`
                    : `${accessory.name} dipasang! ✨`
            );
        } catch (error) {
            toast.error('Gagal mengubah aksesoris');
        }
    };

    const isLoading = profileLoading || accessoriesLoading;
    const userGold = profile?.wallet_balance ?? 0;
    const userLevel = profile?.level ?? 1;

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">
            {/* Background Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-amber-200 rounded-full blur-3xl opacity-30"
                    animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-20 -left-32 w-[400px] h-[400px] bg-emerald-200 rounded-full blur-3xl opacity-40"
                    animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Title and Gold Balance */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-teal-900 flex items-center gap-2">
                                    <ShoppingBag className="w-8 h-8" />
                                    Toko Aksesoris
                                </h1>
                                <p className="text-teal-600">Hiasi NutriGotchi-mu dengan aksesoris keren!</p>
                            </div>

                            {/* Gold Balance */}
                            <motion.div
                                className="flex items-center gap-2 bg-amber-100 px-5 py-3 rounded-full shadow-md"
                                whileHover={{ scale: 1.02 }}
                            >
                                <Coins className="w-6 h-6 text-amber-600" />
                                <span className="text-xl font-bold text-amber-700">
                                    {userGold.toLocaleString()}
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Preview Card + Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        {/* NutriGotchi Preview with Accessories */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-1"
                        >
                            <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-6 shadow-lg">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-emerald-500" />
                                    <h3 className="font-bold text-teal-900">Preview</h3>
                                </div>

                                {/* Avatar Preview */}
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <NutriGotchiAvatar
                                            mood={profile?.mood ?? 'neutral'}
                                            health={profile?.health ?? 100}
                                            size="xl"
                                            animate={true}
                                            equippedAccessories={equippedAccessoriesData ?? []}
                                            showHealthBar={true}
                                        />
                                    </div>

                                    {/* Level Badge */}
                                    <div className="mt-6 mb-4">
                                        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                                            Level {userLevel}
                                        </div>
                                    </div>

                                    {/* Slot Indicators */}
                                    <div className="w-full">
                                        <p className="text-xs text-teal-600 text-center mb-3">Slot Aksesoris</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { id: 'hat', emoji: '🎩', label: 'Topi' },
                                                { id: 'outfit', emoji: '👕', label: 'Outfit' },
                                                { id: 'pet', emoji: '🐾', label: 'Pet' },
                                                { id: 'background', emoji: '🌄', label: 'BG' },
                                            ].map((slot) => {
                                                const equipped = equippedAccessoriesData?.find(a => a.category === slot.id);
                                                return (
                                                    <div
                                                        key={slot.id}
                                                        className={`
                                                            flex flex-col items-center p-2 rounded-xl transition-all
                                                            ${equipped
                                                                ? 'bg-emerald-100 border-2 border-emerald-400'
                                                                : 'bg-gray-100 border-2 border-dashed border-gray-300'
                                                            }
                                                        `}
                                                        title={equipped ? equipped.name : `${slot.label} kosong`}
                                                    >
                                                        <span className={`text-lg ${equipped ? '' : 'opacity-40'}`}>
                                                            {slot.emoji}
                                                        </span>
                                                        <span className={`text-[10px] font-medium mt-0.5 ${equipped ? 'text-emerald-700' : 'text-gray-400'}`}>
                                                            {equipped ? '✓' : '—'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 w-full">
                                        <div className="flex justify-around text-center">
                                            <div>
                                                <p className="text-lg font-bold text-teal-900">{ownedAccessoryIds.length}</p>
                                                <p className="text-xs text-teal-600">Dimiliki</p>
                                            </div>
                                            <div className="w-px bg-gray-200" />
                                            <div>
                                                <p className="text-lg font-bold text-emerald-600">{equippedAccessoriesData?.length ?? 0}</p>
                                                <p className="text-xs text-teal-600">Dipasang</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Category Tabs + Grid */}
                        <div className="lg:col-span-3">
                            {/* Category Tabs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap gap-2 mb-6"
                            >
                                {CATEGORY_TABS.map((tab) => (
                                    <motion.button
                                        key={tab.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveCategory(tab.id)}
                                        className={`
                      px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2
                      ${activeCategory === tab.id
                                                ? tab.id === 'owned'
                                                    ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-md'
                                                    : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md'
                                                : 'bg-white/70 backdrop-blur-xl border border-white/60 text-teal-700 hover:bg-white/90'
                                            }
                    `}
                                    >
                                        <span>{tab.emoji}</span>
                                        <span>{tab.label}</span>
                                        {tab.id === 'owned' && ownedAccessoryIds.length > 0 && (
                                            <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                                                {ownedAccessoryIds.length}
                                            </span>
                                        )}
                                    </motion.button>
                                ))}
                            </motion.div>

                            {/* Accessories Grid */}
                            {isLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <AccessoryCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredAccessories.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl p-12 text-center"
                                >
                                    {activeCategory === 'owned' ? (
                                        <>
                                            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                            <p className="text-lg font-medium text-teal-900">
                                                Belum punya aksesoris
                                            </p>
                                            <p className="text-sm text-teal-600">
                                                Beli aksesoris pertamamu di toko!
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                            <p className="text-lg font-medium text-teal-900">
                                                Belum ada aksesoris di kategori ini
                                            </p>
                                            <p className="text-sm text-teal-600">
                                                Nantikan update terbaru!
                                            </p>
                                        </>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                                >
                                    {filteredAccessories.map((accessory, index) => {
                                        const isOwned = ownedAccessoryIds.includes(accessory.id);
                                        const isLocked = accessory.required_level > userLevel;
                                        const canAfford = userGold >= accessory.price_gold;
                                        const isEquipped = equippedIds.has(accessory.id);

                                        return (
                                            <motion.div
                                                key={accessory.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 * Math.min(index, 5) }}
                                            >
                                                <AccessoryCard
                                                    accessory={accessory}
                                                    isOwned={isOwned}
                                                    isLocked={isLocked}
                                                    canAfford={canAfford}
                                                    userLevel={userLevel}
                                                    onPurchase={() => handlePurchase(accessory)}
                                                    isPurchasing={purchaseMutation.isPending}
                                                    isEquipped={isEquipped}
                                                    onToggleEquip={isOwned ? () => handleToggleEquip(accessory) : undefined}
                                                    isTogglingEquip={toggleEquipMutation.isPending}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
