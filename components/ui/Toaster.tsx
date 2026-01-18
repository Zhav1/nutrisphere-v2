'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

/**
 * Toast notification provider with custom styling
 * Wraps react-hot-toast with NutriSphere theme
 */
export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 3000,
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        },
        // Success toast
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            background: '#064e3b',
            border: '1px solid #10b981',
          },
        },
        // Error toast
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: '#7f1d1d',
            border: '1px solid #ef4444',
          },
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: '#fbbf24',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
