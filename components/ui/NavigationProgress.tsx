'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
    minimum: 0.3,
    easing: 'ease',
    speed: 500,
    showSpinner: false,
    trickle: true,
    trickleSpeed: 200,
});

/**
 * NProgress Navigation Progress Bar
 * Triggers on link click BEFORE navigation for instant feedback
 */
export default function NavigationProgress() {
    const pathname = usePathname();

    useEffect(() => {
        // Complete the progress bar when pathname actually changes
        NProgress.done();
    }, [pathname]);

    useEffect(() => {
        // Global click handler - start NProgress on link clicks BEFORE navigation
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor && anchor.href && !anchor.target) {
                // Check if it's an internal link (same origin)
                const url = new URL(anchor.href);
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    // Start progress immediately on click
                    NProgress.start();
                }
            }
        };

        // Add listener to document
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
            NProgress.done();
        };
    }, [pathname]);

    return null;
}
