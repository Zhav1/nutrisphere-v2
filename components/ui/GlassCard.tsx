'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'light' | 'medium' | 'dark';
  hover?: boolean;
  glow?: 'green' | 'purple' | 'orange' | 'blue' | 'none';
}

/**
 * GlassCard - Reusable glassmorphism card component with Framer Motion
 * Provides backdrop blur, transparency, and optional hover effects
 */
export default function GlassCard({
  children,
  variant = 'light',
  hover = true,
  glow = 'none',
  className = '',
  ...motionProps
}: GlassCardProps) {
  const variantClasses = {
    light: 'glass-card',
    medium: 'glass-card-medium',
    dark: 'glass-card-dark',
  };

  const glowClasses = {
    green: 'hover:shadow-glow-green',
    purple: 'hover:shadow-glow-purple',
    orange: 'hover:shadow-glow-orange',
    blue: 'hover:shadow-glow-blue',
    none: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      transition={{ duration: 0.3 }}
      className={`
        ${variantClasses[variant]}
        ${glowClasses[glow]}
        rounded-2xl
        shadow-lg
        transition-all
        duration-300
        ${className}
      `}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
