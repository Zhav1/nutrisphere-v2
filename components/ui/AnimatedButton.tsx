'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glow?: boolean;
}

/**
 * AnimatedButton - Reusable button with Framer Motion micro-interactions
 * Features: Press effect, hover lift, glow animation, loading state
 */
export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  glow = false,
  className = '',
  disabled,
  ...motionProps
}: AnimatedButtonProps) {
  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 text-white shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    ghost: 'bg-transparent border-2 border-green-600 text-green-700 hover:bg-green-50',
    neon: 'bg-gradient-to-r from-neon-green to-green-600 text-white shadow-lg hover:shadow-glow-green',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${glow ? 'shadow-glow-green' : ''}
        rounded-xl
        font-semibold
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        relative
        overflow-hidden
        ${className}
      `}
      disabled={disabled || isLoading}
      {...motionProps}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}
