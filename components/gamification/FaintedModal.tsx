'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Heart, ChefHat, X } from 'lucide-react';
import Link from 'next/link';
import NutriGotchiAvatar from '@/components/ui/NutriGotchiAvatar';

interface FaintedModalProps {
    isOpen: boolean;
    onClose?: () => void;
    recoveryCount: number;
    recoveryTarget: number;
}

/**
 * FaintedModal - Shows when NutriGotchi HP reaches 0
 * Displays revival progress and encourages cooking
 */
export default function FaintedModal({
    isOpen,
    onClose,
    recoveryCount,
    recoveryTarget,
}: FaintedModalProps) {
    const progress = (recoveryCount / recoveryTarget) * 100;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 
                       rounded-3xl shadow-2xl border border-slate-700 overflow-hidden"
                    >
                        {/* Header Glow Effect */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-red-500/20 to-transparent" />

                        {/* Close Button (optional) */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/50 
                           hover:bg-slate-700/50 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        )}

                        {/* Content */}
                        <div className="relative p-8 text-center">
                            {/* Fainted Icon */}
                            <motion.div
                                animate={{
                                    rotate: [0, -5, 5, -5, 0],
                                    y: [0, -5, 0],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="mx-auto mb-4"
                            >
                                <div className="relative inline-block">
                                    <NutriGotchiAvatar
                                        mood="sick"
                                        health={0}
                                        size="lg"
                                        animate={true}
                                        showHealthBar={false}
                                    />
                                    {/* Dizzy Stars */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                        className="absolute -top-2 left-1/2 -translate-x-1/2"
                                    >
                                        <span className="text-2xl">💫</span>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="mb-2"
                            >
                                <Skull className="w-8 h-8 mx-auto text-red-400 mb-2" />
                                <h2 className="text-2xl font-bold text-white">
                                    NutriGotchi Pingsan! 😵
                                </h2>
                            </motion.div>

                            {/* Description */}
                            <p className="text-slate-400 mb-6 max-w-xs mx-auto">
                                NutriGotchi kamu kelaparan karena jarang masak.
                                Masak <span className="text-amber-400 font-bold">{recoveryTarget} resep</span> untuk membangunkannya!
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400 flex items-center gap-1">
                                        <ChefHat className="w-4 h-4" /> Progress Revival
                                    </span>
                                    <span className="text-amber-400 font-bold">
                                        {recoveryCount} / {recoveryTarget}
                                    </span>
                                </div>
                                <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-amber-500 to-green-500 rounded-full relative"
                                    >
                                        {/* Shimmer */}
                                        <motion.div
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        />
                                    </motion.div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {recoveryTarget - recoveryCount} resep lagi untuk revival!
                                </p>
                            </div>

                            {/* Hearts Preview */}
                            <div className="flex justify-center gap-2 mb-6">
                                {Array.from({ length: recoveryTarget }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Heart
                                            className={`w-6 h-6 ${i < recoveryCount
                                                    ? 'text-green-400 fill-green-400'
                                                    : 'text-slate-600'
                                                }`}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <Link href="/recipes">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 
                             text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30
                             hover:shadow-amber-500/50 transition-all"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <ChefHat className="w-5 h-5" />
                                        Masak Sekarang!
                                    </span>
                                </motion.button>
                            </Link>

                            {/* Tip */}
                            <p className="text-xs text-slate-500 mt-4">
                                💡 Tip: Tidak ada XP & Gold saat pingsan. Bangunkan dulu NutriGotchi!
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
