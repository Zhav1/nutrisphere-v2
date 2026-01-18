"use client";

import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/lib/contexts/AuthContext";

/**
 * Dashboard Layout
 * Wraps all dashboard pages with:
 * - AuthProvider: Centralized auth state (PERFORMANCE: eliminates redundant auth calls)
 * - Navbar: Dynamic navigation
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {/* Dynamic Navbar - Floating Glass Pill */}
      <Navbar />

      {/* Main Content Area with navbar padding */}
      <main className="pt-24 min-h-screen">
        {children}
      </main>
    </AuthProvider>
  );
}
