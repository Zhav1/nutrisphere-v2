'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Lock, Check, ShoppingBag } from 'lucide-react';
import { Accessory, AccessoryCategory } from '@/types/accessory';
import AccessoryCard from '@/components/gamification/AccessoryCard';

interface AccessoryShopProps {
    isOpen: boolean;
    onClose: () => void;
    accessories: Accessory[];
    ownedAccessoryIds: string[];
    userGold: number;
    userLevel: number;
    onPurchase: (accessory: Accessory) => void;
    isPurchasing?: boolean;
}

const CATEGORY_LABELS: Record<AccessoryCategory, { label: string; emoji: string }> = {
    hat: { label: 'Topi', emoji: '🎩' },
    outfit: { label: 'Outfit', emoji: '👕' },
    background: { label: 'Background', emoji: '🖼️' },
    pet: { label: 'Pet', emoji: '🐾' },
    consumable: { label: 'Konsumabel', emoji: '🛡️' },
};

/**
 * AccessoryShop - Modal for browsing and purchasing NutriGotchi accessories
 */
export default function AccessoryShop({
    isOpen,
    onClose,
    accessories,
    ownedAccessoryIds,
    userGold,
    userLevel,
    onPurchase,
    isPurchasing = false,
}: AccessoryShopProps) {
    // Group accessories by category
    const groupedAccessories = accessories.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<AccessoryCategory, Accessory[]>);

    const categories = Object.keys(groupedAccessories) as AccessoryCategory[];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-3xl z-50 overflow-hidden flex flex-col shadow-2xl"
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <ShoppingBag className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-teal-900">Toko Aksesoris</h2>
                                    <p className="text-sm text-teal-600">Hiasi NutriGotchi-mu!</p>
                                </div>
                            </div>

                            {/* Gold Balance */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
                                    <Coins className="w-5 h-5 text-amber-600" />
                                    <span className="font-bold text-amber-700">{userGold.toLocaleString()}</span>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            {categories.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
                                    <p className="text-lg font-medium">Belum ada aksesoris tersedia</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {categories.map((category) => (
                                        <div key={category}>
                                            {/* Category Header */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-2xl">{CATEGORY_LABELS[category].emoji}</span>
                                                <h3 className="text-lg font-bold text-teal-900">
                                                    {CATEGORY_LABELS[category].label}
                                                </h3>
                                                <span className="text-sm text-teal-600">
                                                    ({groupedAccessories[category].length})
                                                </span>
                                            </div>

                                            {/* Accessories Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {groupedAccessories[category].map((accessory) => {
                                                    const isOwned = ownedAccessoryIds.includes(accessory.id);
                                                    const isLocked = accessory.required_level > userLevel;
                                                    const canAfford = userGold >= accessory.price_gold;

                                                    return (
                                                        <AccessoryCard
                                                            key={accessory.id}
                                                            accessory={accessory}
                                                            isOwned={isOwned}
                                                            isLocked={isLocked}
                                                            canAfford={canAfford}
                                                            userLevel={userLevel}
                                                            onPurchase={() => onPurchase(accessory)}
                                                            isPurchasing={isPurchasing}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
