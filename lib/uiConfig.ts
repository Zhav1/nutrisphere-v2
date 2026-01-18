import { HealthGrade } from '@/types/user';

export const HEALTH_GRADE_CONFIG: Record<
  HealthGrade,
  { label: string; color: string; bgGradient: string; emoji: string; glow: string; text: string; bg: string }
> = {
  A: {
    label: 'Sehat Banget!',
    color: 'text-green-700',
    bgGradient: 'from-green-500 to-emerald-700',
    emoji: '✅',
    glow: 'shadow-glow-green',
    text: 'text-green-700',
    bg: 'bg-green-50',
  },
  B: {
    label: 'Cukup Baik',
    color: 'text-yellow-700',
    bgGradient: 'from-amber-500 to-orange-600',
    emoji: '👍',
    glow: 'shadow-glow-orange',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
  },
  C: {
    label: 'Hati-hati',
    color: 'text-orange-700',
    bgGradient: 'from-orange-500 to-red-600',
    emoji: '⚠️',
    glow: 'shadow-glow-orange',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  D: {
    label: 'Tidak Sehat',
    color: 'text-red-700',
    bgGradient: 'from-red-600 to-rose-800',
    emoji: '❌',
    glow: 'shadow-glow-orange',
    text: 'text-red-700',
    bg: 'bg-red-50',
  },
};
