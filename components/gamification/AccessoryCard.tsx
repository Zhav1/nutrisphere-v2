'use client';

import { motion } from 'framer-motion';
import { Coins, Lock, Check, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import { Accessory } from '@/types/accessory';
import { ACCESSORY_COMPONENTS, hasAccessorySVG } from '@/lib/data/accessorySVGs';

interface AccessoryCardProps {
    accessory: Accessory;
    isOwned: boolean;
    isLocked: boolean;
    canAfford: boolean;
    userLevel: number;
    onPurchase: () => void;
    isPurchasing?: boolean;
    // Props for equip/unequip
    isEquipped?: boolean;
    onToggleEquip?: () => void;
    isTogglingEquip?: boolean;
}

// Default preview sizes by category
const PREVIEW_SIZES: Record<string, number> = {
    hat: 60,
    outfit: 70,
    pet: 50,
    background: 60,
};

// Category background colors for visual distinction
const CATEGORY_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
    hat: { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', icon: '🎩' },
    outfit: { bg: 'from-purple-50 to-indigo-50', border: 'border-purple-200', icon: '👕' },
    pet: { bg: 'from-pink-50 to-rose-50', border: 'border-pink-200', icon: '🐾' },
    background: { bg: 'from-cyan-50 to-teal-50', border: 'border-cyan-200', icon: '🌄' },
};

/**
 * AccessoryCard - Shop item card with actual SVG preview
 * Features:
 * - Real SVG accessory preview (not emoji)
 * - Category-based styling
 * - Purchase/Equip states
 * - Smooth animations
 */
export default function AccessoryCard({
    accessory,
    isOwned,
    isLocked,
    canAfford,
    userLevel,
    onPurchase,
    isPurchasing = false,
    isEquipped = false,
    onToggleEquip,
    isTogglingEquip = false,
}: AccessoryCardProps) {
    const isDisabled = isOwned || isLocked || !canAfford || isPurchasing;
    const categoryStyle = CATEGORY_COLORS[accessory.category] || CATEGORY_COLORS.hat;
    const previewSize = PREVIEW_SIZES[accessory.category] || 50;

    // Get the SVG component for this accessory
    const AccessoryComponent = ACCESSORY_COMPONENTS[accessory.name];

    return (
        <motion.div
            whileHover={!isDisabled || isOwned ? { scale: 1.03, y: -4 } : {}}
            whileTap={!isDisabled || isOwned ? { scale: 0.98 } : {}}
            className={`
                relative rounded-2xl overflow-hidden border-2 transition-all duration-200
                ${isEquipped
                    ? 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-400 ring-2 ring-emerald-300 ring-offset-2'
                    : isOwned
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
                        : isLocked
                            ? 'bg-gray-100 border-gray-200 opacity-60'
                            : `bg-gradient-to-br ${categoryStyle.bg} ${categoryStyle.border} hover:shadow-lg hover:shadow-emerald-100`
                }
            `}
        >
            {/* Equipped Badge */}
            {isEquipped && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1 shadow-md"
                >
                    <Sparkles className="w-3 h-3" />
                    Dipasang
                </motion.div>
            )}

            {/* Preview Area */}
            <div className="relative aspect-square flex items-center justify-center p-4">
                {/* Animated background pattern for premium feel */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]" />
                </div>

                {/* Accessory Preview - SVG or Fallback */}
                <motion.div
                    className="relative z-10"
                    animate={!isLocked && !isDisabled ? {
                        y: [0, -3, 0],
                        rotate: [0, 2, 0, -2, 0],
                    } : {}}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    {AccessoryComponent ? (
                        // Render actual SVG accessory
                        <div className="transform scale-110">
                            <AccessoryComponent size={previewSize} />
                        </div>
                    ) : accessory.image_url ? (
                        // Fallback to image_url if provided
                        <img
                            src={accessory.image_url}
                            alt={accessory.name}
                            className="w-16 h-16 object-contain"
                        />
                    ) : (
                        // Final fallback: category icon with styled container
                        <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm shadow-inner flex items-center justify-center">
                            <span className="text-4xl opacity-80">{categoryStyle.icon}</span>
                        </div>
                    )}
                </motion.div>

                {/* Owned Badge (if not equipped) */}
                {isOwned && !isEquipped && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                    >
                        <Check className="w-5 h-5 text-white" />
                    </motion.div>
                )}

                {/* Locked Overlay */}
                {isLocked && (
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Lock className="w-10 h-10 text-white mb-2 drop-shadow-lg" />
                        </motion.div>
                        <span className="text-sm text-white font-bold bg-gray-900/50 px-3 py-1 rounded-full">
                            Level {accessory.required_level}
                        </span>
                    </div>
                )}

                {/* Rarity shimmer effect for expensive items */}
                {accessory.price_gold >= 500 && !isOwned && !isLocked && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                            repeatDelay: 2,
                        }}
                    />
                )}
            </div>

            {/* Info Area */}
            <div className="p-3 bg-white/50 backdrop-blur-sm">
                <h4 className="font-bold text-teal-900 text-sm mb-0.5 truncate">
                    {accessory.name}
                </h4>

                {accessory.description && (
                    <p className="text-xs text-teal-600/80 mb-2 line-clamp-1">
                        {accessory.description}
                    </p>
                )}

                {/* Price / Status Row */}
                <div className="flex items-center justify-between gap-2">
                    {isOwned ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-medium">Dimiliki</span>
                        </div>
                    ) : isLocked ? (
                        <div className="flex items-center gap-1 text-gray-500">
                            <Lock className="w-4 h-4" />
                            <span className="text-xs font-medium">Lvl {accessory.required_level}</span>
                        </div>
                    ) : (
                        <div className={`flex items-center gap-1 ${canAfford ? 'text-amber-600' : 'text-red-500'}`}>
                            <Coins className="w-4 h-4" />
                            <span className="text-sm font-bold">{accessory.price_gold.toLocaleString()}</span>
                        </div>
                    )}

                    {/* Buy Button (for unowned, unlocked items) */}
                    {!isOwned && !isLocked && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onPurchase}
                            disabled={!canAfford || isPurchasing}
                            className={`
                                px-4 py-1.5 rounded-xl text-xs font-bold transition-all
                                ${canAfford && !isPurchasing
                                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md hover:shadow-lg hover:from-emerald-500 hover:to-teal-600'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }
                            `}
                        >
                            {isPurchasing ? (
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="inline-block"
                                >
                                    ⏳
                                </motion.span>
                            ) : (
                                'Beli'
                            )}
                        </motion.button>
                    )}

                    {/* Equip/Unequip Toggle (for owned items) */}
                    {isOwned && onToggleEquip && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onToggleEquip}
                            disabled={isTogglingEquip}
                            className={`
                                px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1
                                ${isEquipped
                                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    : 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-md hover:shadow-lg'
                                }
                            `}
                        >
                            {isTogglingEquip ? (
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="inline-block"
                                >
                                    ⏳
                                </motion.span>
                            ) : isEquipped ? (
                                <>
                                    <ToggleRight className="w-4 h-4" />
                                    Lepas
                                </>
                            ) : (
                                <>
                                    <ToggleLeft className="w-4 h-4" />
                                    Pasang
                                </>
                            )}
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
