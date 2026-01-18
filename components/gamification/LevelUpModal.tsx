'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Gift, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    newLevel: number;
    rewards?: {
        gold?: number;
        accessory?: string;
    };
}

/**
 * LevelUpModal - Celebration modal when user levels up
 * Features confetti animation and reward display
 */
export default function LevelUpModal({
    isOpen,
    onClose,
    newLevel,
    rewards,
}: LevelUpModalProps) {
    // Trigger confetti on open
    useEffect(() => {
        if (isOpen && typeof window !== 'undefined') {
            // Fire confetti from both sides
            const duration = 2000;
            const end = Date.now() + duration;

            const interval = setInterval(() => {
                if (Date.now() > end) {
                    clearInterval(interval);
                    return;
                }

                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#10b981', '#34d399', '#fbbf24', '#f59e0b'],
                });
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#10b981', '#34d399', '#fbbf24', '#f59e0b'],
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-1 max-w-sm w-full shadow-2xl"
                            initial={{ scale: 0.5, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.5, rotate: 10 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        >
                            <div className="bg-white rounded-[22px] p-6 text-center">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>

                                {/* Celebration Icon */}
                                <motion.div
                                    className="relative w-24 h-24 mx-auto mb-6"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {/* Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full blur-xl opacity-50" />

                                    {/* Star Background */}
                                    <div className="relative w-full h-full bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-xl">
                                        <Star className="w-12 h-12 text-white fill-white" />
                                    </div>

                                    {/* Sparkles */}
                                    <motion.div
                                        className="absolute -top-2 -right-2"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Sparkles className="w-8 h-8 text-amber-400" />
                                    </motion.div>
                                </motion.div>

                                {/* Title */}
                                <motion.h2
                                    className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Level Up! 🎉
                                </motion.h2>

                                {/* Level Display */}
                                <motion.div
                                    className="text-6xl font-black text-teal-900 mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: 'spring', damping: 10 }}
                                >
                                    {newLevel}
                                </motion.div>

                                <p className="text-teal-600 mb-6">
                                    Kamu sudah mencapai level {newLevel}!
                                </p>

                                {/* Rewards Section */}
                                {rewards && (rewards.gold || rewards.accessory) && (
                                    <motion.div
                                        className="bg-amber-50 rounded-2xl p-4 mb-6"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Gift className="w-5 h-5 text-amber-600" />
                                            <span className="font-bold text-amber-800">Hadiah!</span>
                                        </div>

                                        {rewards.gold && (
                                            <p className="text-amber-700">
                                                +{rewards.gold} 🪙 Gold
                                            </p>
                                        )}

                                        {rewards.accessory && (
                                            <p className="text-amber-700">
                                                🎁 {rewards.accessory}
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {/* Continue Button */}
                                <motion.button
                                    onClick={onClose}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    Lanjutkan 🚀
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
