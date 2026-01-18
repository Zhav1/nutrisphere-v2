'use client';

import { motion } from 'framer-motion';

interface HealthBarProps {
    health: number; // 0-100
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    animate?: boolean;
    isFainted?: boolean;
}

// Constants for gamification
const SICK_MODE_THRESHOLD = 20;

/**
 * HealthBar - Animated health visualization with color gradient based on level
 * Now supports:
 * - True zero HP (0%, not minimum 5%)
 * - Fainted state visual (ghostly pulsing, skull icon)
 * - Sick mode warning at HP <= 20
 */
export default function HealthBar({
    health,
    size = 'md',
    showLabel = true,
    animate = true,
    isFainted = false,
}: HealthBarProps) {
    // Clamp health between 0-100 (allow true zero!)
    const clampedHealth = Math.max(0, Math.min(100, health));

    // Check if in sick mode or fainted
    const isSickMode = clampedHealth <= SICK_MODE_THRESHOLD && clampedHealth > 0;
    const isZeroHealth = clampedHealth === 0 || isFainted;

    // Determine color based on health level
    const getHealthColor = () => {
        if (isZeroHealth) return 'from-gray-500 to-gray-600';
        if (clampedHealth >= 60) return 'from-emerald-400 to-green-500';
        if (clampedHealth >= 20) return 'from-amber-400 to-orange-500';
        return 'from-red-500 to-rose-600';
    };

    const getTrackColor = () => {
        if (isZeroHealth) return 'bg-gray-300';
        if (clampedHealth >= 60) return 'bg-emerald-100';
        if (clampedHealth >= 20) return 'bg-amber-100';
        return 'bg-red-200';
    };

    const getTextColor = () => {
        if (isZeroHealth) return 'text-gray-500';
        if (clampedHealth >= 60) return 'text-emerald-600';
        if (clampedHealth >= 20) return 'text-amber-600';
        return 'text-red-600';
    };

    const sizeClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-teal-700 flex items-center gap-1">
                        {isZeroHealth ? '💀' : '❤️'} Kesehatan
                        {/* Fainted indicator */}
                        {isZeroHealth && (
                            <motion.span
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-gray-500 font-bold"
                            >
                                (Pingsan!)
                            </motion.span>
                        )}
                        {/* Sick mode indicator */}
                        {isSickMode && !isZeroHealth && (
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="text-red-600 font-bold"
                            >
                                💀
                            </motion.span>
                        )}
                    </span>
                    <span className={`text-xs font-bold ${getTextColor()}`}>
                        {clampedHealth}%
                    </span>
                </div>
            )}

            {/* Health Bar */}
            <div className={`w-full ${sizeClasses[size]} ${getTrackColor()} rounded-full overflow-hidden shadow-inner`}>
                <motion.div
                    className={`h-full bg-gradient-to-r ${getHealthColor()} rounded-full shadow-sm`}
                    initial={animate ? { width: 0 } : { width: `${clampedHealth}%` }}
                    animate={{
                        width: `${isZeroHealth ? 0 : clampedHealth}%`,
                        // Different effects for different states
                        opacity: isZeroHealth ? [0.3, 0.5, 0.3] : isSickMode ? [0.7, 1, 0.7] : 1,
                    }}
                    transition={{
                        width: { duration: 1, ease: 'easeOut' },
                        opacity: { duration: 1.5, repeat: (isZeroHealth || isSickMode) ? Infinity : 0 }
                    }}
                />
            </div>

            {/* Status messages */}
            {isZeroHealth && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 flex items-center gap-1 text-xs text-gray-500 font-medium"
                >
                    <span>💀 NutriGotchi pingsan! Masak untuk membangunkan.</span>
                </motion.div>
            )}
            {isSickMode && !isZeroHealth && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium"
                >
                    <span>⚠️ Kritis! XP -25%</span>
                </motion.div>
            )}
        </div>
    );
}


