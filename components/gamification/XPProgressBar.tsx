'use client';

import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';

interface XPProgressBarProps {
    currentXp: number;
    maxXp: number;
    level: number;
    showLabel?: boolean;
    animate?: boolean;
    onLevelUp?: () => void;
}

/**
 * XPProgressBar - Animated XP visualization with level display
 * Features:
 * - Gradient fill with sparkle effect
 * - Level badge with glow
 * - Progress percentage display
 */
export default function XPProgressBar({
    currentXp,
    maxXp,
    level,
    showLabel = true,
    animate = true,
}: XPProgressBarProps) {
    const percentage = Math.min((currentXp / maxXp) * 100, 100);
    const isCloseToLevelUp = percentage >= 80;

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between items-center mb-2">
                    {/* Level Badge */}
                    <motion.div
                        className="flex items-center gap-1.5"
                        animate={isCloseToLevelUp ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <div className={`
              flex items-center justify-center w-7 h-7 rounded-full 
              bg-gradient-to-br from-amber-400 to-yellow-500 
              shadow-md ${isCloseToLevelUp ? 'shadow-amber-300' : ''}
            `}>
                            <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="text-sm font-bold text-teal-900">
                            Level {level}
                        </span>
                        {isCloseToLevelUp && (
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </motion.div>
                        )}
                    </motion.div>

                    {/* XP Counter */}
                    <span className="text-xs font-medium text-teal-600">
                        {currentXp} / {maxXp} XP
                    </span>
                </div>
            )}

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-amber-100 rounded-full overflow-hidden shadow-inner">
                <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full"
                    initial={animate ? { width: 0 } : { width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />

                {/* Shimmer effect when close to level up */}
                {isCloseToLevelUp && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                )}
            </div>

            {/* Level up hint */}
            {isCloseToLevelUp && (
                <motion.p
                    className="text-xs text-amber-600 mt-1 text-center font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    🎉 Hampir naik level!
                </motion.p>
            )}
        </div>
    );
}
