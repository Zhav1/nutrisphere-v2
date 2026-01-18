'use client';

import { motion } from 'framer-motion';

interface ConfidenceBadgeProps {
  confidence: number; // 0-100
  size?: 'sm' | 'md';
}

/**
 * Visual badge showing AI detection confidence level
 * Green (80-100%): High confidence
 * Yellow (50-79%): Medium confidence
 * Red (0-49%): Low confidence
 */
export default function ConfidenceBadge({ confidence, size = 'sm' }: ConfidenceBadgeProps) {
  // Determine color based on confidence level
  const getColorClasses = () => {
    if (confidence >= 80) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
      };
    } else if (confidence >= 50) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: '~',
      };
    } else {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '?',
      };
    }
  };

  const colors = getColorClasses();
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : 'text-sm px-3 py-1';

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1 rounded-full font-medium border
        ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}
      `}
      title={`AI Confidence: ${confidence}%`}
    >
      <span>{colors.icon}</span>
      <span>{confidence}%</span>
    </motion.span>
  );
}
