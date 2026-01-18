'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NutriGotchiLoader from './NutriGotchiLoader';

interface NavigationLoaderContextValue {
    startLoading: (message?: string) => void;
    stopLoading: () => void;
}

// Hook to use navigation loading in any component
export function useNavigationLoader() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('Memuat...');

    const startLoading = useCallback((msg?: string) => {
        setMessage(msg || 'Memuat...');
        setIsLoading(true);
    }, []);

    const stopLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    return { isLoading, message, startLoading, stopLoading };
}

/**
 * PageTransition - Shows a loading overlay during route changes
 * Place this component at the layout level to catch all route changes
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
    const [isNavigating, setIsNavigating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Memuat halaman...');
    const pathname = usePathname();

    // Reset loading state when pathname changes (navigation complete)
    useEffect(() => {
        // Small delay to prevent flash
        const timer = setTimeout(() => {
            setIsNavigating(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <>
            {children}

            {/* Navigation Loading Overlay */}
            <AnimatePresence>
                {isNavigating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center"
                    >
                        <NutriGotchiLoader
                            variant="inline"
                            message={loadingMessage}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/**
 * NavigationLink - A Link component that shows loading during navigation
 * Use this instead of regular Link for pages that need loading indicator
 */
import Link from 'next/link';

interface NavigationLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    loadingMessage?: string;
    onClick?: () => void;
}

export function NavigationLink({
    href,
    children,
    className,
    loadingMessage = 'Memuat halaman...',
    onClick
}: NavigationLinkProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);

    // Reset loading when pathname changes (navigation complete)
    useEffect(() => {
        setIsLoading(false);
    }, [pathname]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onClick?.();
        setIsLoading(true);
        router.push(href);
    };

    return (
        <>
            <Link
                href={href}
                className={className}
                onClick={handleClick}
            >
                {children}
            </Link>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex items-center justify-center"
                    >
                        <NutriGotchiLoader
                            variant="inline"
                            message={loadingMessage}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
