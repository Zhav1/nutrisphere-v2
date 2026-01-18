'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NutriGotchiLoaderProps {
    /** Display variant */
    variant?: 'inline' | 'overlay' | 'button';
    /** Loading message */
    message?: string;
    /** Size of the loader */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show the loader */
    isVisible?: boolean;
    /** Custom CSS classes */
    className?: string;
}

/**
 * Branded Loading Component with NutriGotchi Theme
 * 
 * Features cooking-themed animations that match the app's identity:
 * - Bouncing chef character
 * - Floating food ingredients
 * - Shimmer text effect
 */
export default function NutriGotchiLoader({
    variant = 'inline',
    message = 'Memuat...',
    size = 'md',
    isVisible = true,
    className = '',
}: NutriGotchiLoaderProps) {
    // Size configurations
    const sizeConfig = {
        sm: { emoji: 'text-2xl', text: 'text-xs', container: 'gap-2' },
        md: { emoji: 'text-4xl', text: 'text-sm', container: 'gap-3' },
        lg: { emoji: 'text-6xl', text: 'text-lg', container: 'gap-4' },
    };

    const config = sizeConfig[size];

    // Floating food ingredients animation
    const FloatingIngredients = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {['🥦', '🍳', '🥕', '🍅', '🧅'].map((emoji, index) => (
                <motion.div
                    key={index}
                    className="absolute text-2xl opacity-60"
                    initial={{
                        x: Math.random() * 100 - 50,
                        y: 100 + Math.random() * 50,
                        opacity: 0
                    }}
                    animate={{
                        y: -100,
                        opacity: [0, 0.6, 0],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: index * 0.5,
                        ease: 'easeOut',
                    }}
                    style={{
                        left: `${20 + index * 15}%`,
                    }}
                >
                    {emoji}
                </motion.div>
            ))}
        </div>
    );

    // Chef character animation
    const ChefAnimation = () => (
        <motion.div
            className={`${config.emoji} select-none`}
            animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            👨‍🍳
        </motion.div>
    );

    // Shimmer text effect
    const ShimmerText = ({ text }: { text: string }) => (
        <div className="relative overflow-hidden">
            <span className={`${config.text} font-medium text-teal-700`}>
                {text}
            </span>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
        </div>
    );

    // Cooking pot bubbles animation
    const CookingPot = () => (
        <div className="relative">
            <motion.div
                className={`${config.emoji} select-none`}
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
            >
                🍲
            </motion.div>
            {/* Bubbles */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute -top-2 text-xs select-none"
                    style={{ left: `${30 + i * 20}%` }}
                    animate={{
                        y: [-5, -20],
                        opacity: [0.8, 0],
                        scale: [0.5, 1],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.25,
                    }}
                >
                    💨
                </motion.div>
            ))}
        </div>
    );

    // Button variant (for use inside buttons)
    if (variant === 'button') {
        return (
            <motion.div
                className={`flex items-center justify-center ${config.container} ${className}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <CookingPot />
                <ShimmerText text={message} />
            </motion.div>
        );
    }

    // Overlay variant (full-screen)
    if (variant === 'overlay') {
        return (
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm ${className}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FloatingIngredients />

                        <motion.div
                            className="relative z-10 flex flex-col items-center gap-6"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        >
                            {/* Glowing background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/50 to-teal-200/50 rounded-full blur-3xl scale-150" />

                            <ChefAnimation />

                            <div className="text-center relative z-10">
                                <ShimmerText text={message} />
                                <p className="text-xs text-teal-500 mt-1">NutriSphere</p>
                            </div>

                            {/* Progress dots */}
                            <div className="flex gap-2">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-emerald-400"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    // Inline variant (default)
    return (
        <motion.div
            className={`flex items-center justify-center ${config.container} ${className}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <ChefAnimation />
            <div className="flex flex-col items-start">
                <ShimmerText text={message} />
                {size !== 'sm' && (
                    <p className="text-xs text-teal-500">Mohon tunggu...</p>
                )}
            </div>
        </motion.div>
    );
}

/**
 * Hook for managing loader visibility with delay
 * Prevents flash on fast loads by only showing loader after 150ms
 */
export function useDelayedLoader(isLoading: boolean, delay: number = 150) {
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isLoading) {
            timeout = setTimeout(() => setShowLoader(true), delay);
        } else {
            setShowLoader(false);
        }

        return () => clearTimeout(timeout);
    }, [isLoading, delay]);

    return showLoader;
}
