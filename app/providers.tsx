'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { NavbarProvider } from '@/lib/contexts/NavbarContext';

/**
 * Global providers for the application
 * - TanStack Query: Server state management with caching
 * - NavbarProvider: Dynamic navbar visibility control
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Data is fresh for 1 minute
        gcTime: 5 * 60 * 1000, // Garbage collection after 5 minutes (renamed from cacheTime)
        refetchOnWindowFocus: false, // Don't refetch on tab focus (mobile-first)
        retry: 1, // Retry failed queries once
      },
      mutations: {
        retry: 0, // Don't retry mutations
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <NavbarProvider>
        {children}
      </NavbarProvider>
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

