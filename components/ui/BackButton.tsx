'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    /** Navigation target URL */
    href?: string;
    /** Custom click handler (overrides href navigation) */
    onClick?: () => void;
    /** Button label text */
    label?: string;
    /** Visual variant - 'dark' for auth pages, 'light' for dashboard */
    variant?: 'dark' | 'light';
    /** Position style - 'fixed' stays in viewport, 'static' flows with content */
    position?: 'fixed' | 'static' | 'inline';
    /** Additional CSS classes */
    className?: string;
}

/**
 * Unified Back Button Component
 * 
 * Used across all pages for consistent navigation UX.
 * - Dark variant: Glass pill with white text (for dark backgrounds like auth pages)
 * - Light variant: Glass card with teal text (for light backgrounds like dashboard)
 */
export default function BackButton({
    href = '/',
    onClick,
    label = 'Kembali',
    variant = 'light',
    position = 'fixed',
    className = '',
}: BackButtonProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        } else if (href) {
            e.preventDefault();
            router.push(href);
        }
    };

    // Base styles shared by both variants
    const baseStyles = `
    flex items-center gap-2 px-4 py-2.5 rounded-full
    backdrop-blur-sm transition-all duration-300
    group cursor-pointer z-50
  `;

    // Position styles
    const positionStyles = {
        fixed: 'fixed top-6 left-6',
        static: 'absolute top-6 left-6',
        inline: 'relative',
    };

    // Variant-specific styles
    const variantStyles = {
        dark: `
      bg-white/10 border border-white/20 
      text-white/90 hover:bg-white/20 hover:text-white
      shadow-lg shadow-black/10
    `,
        light: `
      bg-white/70 border border-white/60 
      text-teal-700 hover:bg-white/90 hover:text-teal-900
      shadow-sm hover:shadow-md hover:shadow-teal-100/50
    `,
    };

    const content = (
        <motion.div
            className={`
        ${baseStyles}
        ${positionStyles[position]}
        ${variantStyles[variant]}
        ${className}
      `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform duration-200"
            />
            <span className="text-sm font-medium">{label}</span>
        </motion.div>
    );

    // If onClick is provided, return a button element
    if (onClick) {
        return (
            <button onClick={handleClick} type="button">
                {content}
            </button>
        );
    }

    // Otherwise, use Next.js Link for proper navigation
    return (
        <Link href={href} onClick={handleClick}>
            {content}
        </Link>
    );
}
