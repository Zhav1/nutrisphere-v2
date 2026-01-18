"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePendingRequestsCount } from '@/lib/hooks/useFriends';
import { Menu, X, ChefHat, ScanLine, Home, User, LogIn, LogOut, ShoppingBag, History, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useProfile } from "@/lib/hooks/useProfile";
import { useEquippedAccessories } from "@/lib/hooks/useAccessories";
import { useNavbar } from "@/lib/contexts/NavbarContext";
import NutriGotchiAvatar from "@/components/ui/NutriGotchiAvatar";
import ProfileMenu from "@/components/layout/ProfileMenu";

/**
 * Dynamic Navbar - "Masterpiece" Edition
 * Features:
 * - Chameleon Theming: White text on dark pages, green on light pages
 * - Auth-Aware: Shows "Masuk" for guests, "Profile" for logged-in users
 * - Floating Dock: Premium top-4 gap with glass effect
 * - Scroll-aware: Morphs into solid glass on scroll
 * - Waterfall mobile menu with spring animations
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // Profile dropdown state
  const pathname = usePathname();
  const router = useRouter();

  // Logout handler - Fixed for production redirect reliability
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Clear storage first
      localStorage.clear();
      sessionStorage.clear();

      // AWAIT signOut with global scope for server-side token invalidation
      await supabase.auth.signOut({ scope: 'global' });

      setUserId(null);
      setUserEmail('');

      // Use router.push + refresh for proper middleware revalidation
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: hard reload to login
      window.location.href = '/login';
    } finally {
      setLoggingOut(false);
      setIsOpen(false);
    }
  };

  // Fetch real profile
  const { data: profile } = useProfile(userId);

  // Fetch equipped accessories for avatar
  const { data: equippedAccessoriesData } = useEquippedAccessories(
    userId,
    profile?.equipped_accessories ?? null
  );

  // Fetch pending friend requests for badge (only if logged in)
  const { data: pendingCounts } = usePendingRequestsCount();

  // ========================================
  // PAGE DETECTION
  // ========================================
  const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isAuthPage = authPages.includes(pathname);
  const isLandingPage = pathname === "/";
  const darkPages = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  const isDarkPage = darkPages.includes(pathname);

  // ========================================
  // AUTH STATE CHECK - Must be before early return
  // ========================================
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? '');
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? '');
    });

    return () => subscription.unsubscribe();
  }, []);

  // User is only considered "logged in" if they have both auth session AND profile
  const isLoggedIn = !!userId && !!profile;

  // Detect scroll to change glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ========================================
  // EARLY RETURN - Must be AFTER all hooks
  // ========================================
  // Get navbar context for dynamic hiding
  const { isNavbarHidden } = useNavbar();

  // Hide navbar completely on auth pages or when context says so
  if (isAuthPage || isNavbarHidden || loggingOut) {
    return null;
  }

  // ========================================
  // NAV LINKS - Dynamic based on auth state
  // ========================================
  const navLinks = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Scan Makanan", href: "/scan", icon: ScanLine },
    { name: "Masak Hemat", href: "/recipes", icon: ChefHat },
    { name: "Toko", href: "/shop", icon: ShoppingBag },
    { name: "Riwayat", href: "/history", icon: History },
    { name: "Teman", href: "/friends", icon: Users },
  ];

  // Dynamic Profile Link Content
  const getProfileLinkContent = () => {
    if (!profile) return { name: "Profile", icon: User };

    // Get first name
    const firstName = profile.display_name?.split(' ')[0] || "Profile";

    return {
      name: firstName,
      icon: User, // Fallback icon, but we'll use Avatar in render
      isAvatar: true
    };
  };

  // Add Profile or Login based on auth state
  const authLink = isLoggedIn
    ? { ...getProfileLinkContent(), href: "/profile" }
    : { name: "Masuk", href: "/login", icon: LogIn, isAvatar: false };

  // ========================================
  // CHAMELEON COLORS
  // ========================================
  // Text color: White on dark pages (at top), Green otherwise
  const textColor = scrolled
    ? "text-slate-600"
    : isDarkPage
      ? "text-white/90"
      : "text-slate-600";

  const textColorHover = scrolled || !isDarkPage
    ? "group-hover:text-emerald-600"
    : "group-hover:text-white";

  // Logo text gradient
  const logoTextColor = scrolled
    ? "from-emerald-700 to-teal-600"
    : isDarkPage
      ? "from-white to-white"
      : "from-emerald-700 to-teal-600";

  // Hamburger colors
  const hamburgerColor = scrolled
    ? "text-slate-700"
    : isDarkPage
      ? "text-white"
      : "text-slate-700";

  const hamburgerHoverBg = scrolled || !isDarkPage
    ? "hover:bg-emerald-50"
    : "hover:bg-white/10";

  // Navbar background
  const navBg = scrolled
    ? "bg-white/95 shadow-lg shadow-emerald-500/5 border-b border-white/20"
    : isDarkPage
      ? "bg-slate-900/80 border border-white/10"
      : "bg-white/80 shadow-xl shadow-emerald-500/10 border border-white/30";

  // Logo icon style
  const logoIconStyle = scrolled || !isDarkPage
    ? "bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-300/50 group-hover:shadow-emerald-400/60"
    : "bg-white/20 backdrop-blur-sm shadow-white/20 group-hover:bg-white/30";

  return (
    <>
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-200 ${scrolled
          ? "top-0 px-0"
          : "top-4 px-4"
          }`}
        style={{ willChange: 'transform' }}
      >
        <div
          className={`max-w-7xl mx-auto flex items-center justify-between h-16 px-6 transition-all duration-200 relative ${scrolled
            ? "max-w-full rounded-none"
            : "max-w-5xl rounded-2xl"
            } ${navBg}`}
        >
          {/* 1. LOGO (Left) */}
          <Link
            href={isLoggedIn ? "/home" : "/"}
            className="flex items-center gap-2 font-bold text-xl tracking-tight group"
          >
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-300 ${logoIconStyle} group-hover:scale-105`}>
              <span className="font-black text-lg">N</span>
            </span>
            <span className={`hidden sm:inline bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ${logoTextColor}`}>
              NutriSphere
            </span>
          </Link>

          {/* 2. CENTERED DESKTOP MENU (Nav Links Only) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-1">
            {!isLandingPage && navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium transition-colors rounded-full group"
                >
                  {/* Active indicator bubble with smooth animation */}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-bubble"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-50 rounded-full -z-10 border border-emerald-200/50 shadow-sm"
                      transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                    />
                  )}
                  <span className={`flex items-center gap-2 transition-colors duration-200 ${isActive
                    ? "text-emerald-700"
                    : `${textColor} ${textColorHover}`
                    }`}>
                    <link.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="relative">
                      {link.name}
                      {/* Notification badge for Teman link */}
                      {link.name === 'Teman' && pendingCounts?.hasPending && (
                        <span
                          className={`absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full ${pendingCounts.incoming > 0 ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                          title={
                            pendingCounts.incoming > 0
                              ? `${pendingCounts.incoming} permintaan masuk`
                              : `${pendingCounts.outgoing} permintaan terkirim`
                          }
                        />
                      )}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* 3. RIGHT SIDE (Auth + Mobile) */}
          <div className="flex items-center gap-2">

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-1">
              {isLoggedIn ? (
                <>
                  {/* PROFILE BUTTON WITH DROPDOWN */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className={`relative px-4 py-2 text-sm font-medium transition-all rounded-full group ${pathname === '/profile'
                        ? 'bg-gradient-to-r from-emerald-100 to-teal-50 border border-emerald-200/50 shadow-sm'
                        : ''
                        }`}
                    >
                      <span className={`flex items-center gap-2 transition-colors duration-200 ${pathname === '/profile'
                        ? 'text-emerald-700'
                        : `${textColor} ${textColorHover}`
                        }`}>
                        {profile && (
                          <div className="-ml-1">
                            <NutriGotchiAvatar
                              size="xs"
                              mood={profile.mood}
                              health={profile.health}
                              equippedAccessories={equippedAccessoriesData ?? []}
                              showHealthBar={false}
                              className={pathname === '/profile'
                                ? "drop-shadow-sm"
                                : "opacity-90 grayscale-[0.3] group-hover:grayscale-0 group-hover:opacity-100 transition-all"}
                            />
                          </div>
                        )}
                        {getProfileLinkContent().name}
                      </span>
                    </button>

                    {/* PROFILE DROPDOWN MENU */}
                    <ProfileMenu
                      isOpen={isProfileMenuOpen}
                      onClose={() => setIsProfileMenuOpen(false)}
                      userName={profile?.display_name || 'User'}
                      userEmail={userEmail}
                      userMood={profile?.mood}
                      userHealth={profile?.health}
                      equippedAccessories={equippedAccessoriesData ?? []}
                      onLogout={handleLogout}
                      isLoggingOut={loggingOut}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* LOGIN BUTTON */}
                  <Link
                    href="/login"
                    className="relative px-4 py-2 text-sm font-medium transition-all rounded-full group bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25"
                  >
                    <span className="flex items-center gap-2">
                      <LogIn size={18} strokeWidth={2} />
                      Masuk
                    </span>
                  </Link>

                  {/* Register link - only on landing */}
                  {isLandingPage && (
                    <Link
                      href="/register"
                      className="relative px-4 py-2 text-sm font-medium transition-all rounded-full group"
                    >
                      <span className={`flex items-center gap-2 transition-colors duration-200 ${textColor} ${textColorHover}`}>
                        Daftar
                      </span>
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* MOBILE HAMBURGER BUTTON */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2.5 rounded-xl transition-colors ${hamburgerColor} ${hamburgerHoverBg}`}
              whileTap={{ scale: 0.95 }}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} className="text-emerald-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE FULLSCREEN WATERFALL MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-gradient-to-b from-white via-emerald-50 to-teal-50 pt-24 px-6 md:hidden flex flex-col will-change-transform"
          >
            {/* Menu Items with Waterfall Animation */}
            <div className="flex flex-col space-y-3 mt-4">
              {/* Build mobile menu items: on landing page only show auth links */}
              {(isLandingPage
                ? (isLoggedIn ? [authLink] : [authLink, { name: "Daftar", href: "/register", icon: LogIn }])
                : [...navLinks, authLink]
              ).map((link, i) => {
                const isActive = pathname === link.href;
                const isAuthButton = link.name === "Masuk" || link.name === "Daftar";
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -40, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      delay: 0.05 + i * 0.04,
                      duration: 0.2,
                      ease: "easeOut"
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-semibold border transition-all duration-300 ${isAuthButton && !isLoggedIn
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/25"
                        : isActive
                          ? "bg-gradient-to-r from-emerald-100 to-teal-50 border-emerald-200 text-emerald-700 shadow-lg shadow-emerald-100/50"
                          : "border-white/50 bg-white/60 text-slate-600 hover:bg-white/80 hover:text-emerald-600 hover:border-emerald-100"
                        }`}
                    >
                      <span className={`p-2 rounded-xl ${isAuthButton && !isLoggedIn
                        ? "bg-white/20 text-white"
                        : isActive
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-300/50"
                          : "bg-slate-100 text-slate-500"
                        }`}>
                        <link.icon size={22} />
                      </span>
                      <span className="relative">
                        {link.name}
                        {/* Notification badge for Teman link */}
                        {link.name === 'Teman' && pendingCounts?.hasPending && (
                          <span
                            className={`absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full ${pendingCounts.incoming > 0 ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                          />
                        )}
                      </span>
                      {isActive && !isAuthButton && (
                        <motion.span
                          className="ml-auto text-emerald-500"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Mobile Logout Button - only when logged in */}
              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, x: -40, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    delay: 0.25,
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                >
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-semibold border transition-all duration-300 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300"
                  >
                    <span className="p-2 rounded-xl bg-red-500 text-white shadow-md shadow-red-300/50">
                      <LogOut size={22} />
                    </span>
                    <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Decorative Bottom Element */}
            <motion.div
              className="mt-auto mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/50 text-sm text-slate-500">
                <span className="bg-gradient-to-tr from-emerald-500 to-teal-400 w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold">
                  N
                </span>
                <span>NutriSphere v1.0</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
