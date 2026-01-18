'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Mail, Calendar, Edit3, X, LogOut,
  Flame, ChefHat, Camera, Trophy, Coins, Star,
  Check, Loader2, Lock, Eye, EyeOff, KeyRound, Users, Copy
} from 'lucide-react';
import { getUserProfile, updateProfile, signOut, UserProfile } from '@/services/profileService';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import NutriGotchiAvatar from '@/components/ui/NutriGotchiAvatar';
import OAuthProviderBadge from '@/components/ui/OAuthProviderBadge';
import { useProfile, useSavedRecipesCount, useTotalScans, calculateMaxXp } from '@/lib/hooks/useProfile';
import { useEquippedAccessories } from '@/lib/hooks/useAccessories';
import LivingBackground from '@/components/ui/LivingBackground';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client'; // Needed for password change
import toast from 'react-hot-toast';
import NProgress from 'nprogress';

/**
 * Profile Page - Fresh Eco-Glass Design
 * Uses same hooks as Dashboard for data consistency
 */
export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Change Password States
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // PERFORMANCE: Get user from centralized AuthContext
  const { user, userId, isLoading: authLoading } = useAuth();
  const userEmail = user?.email || '';

  // Detect authentication provider (email or google)
  const authProvider = user?.app_metadata?.provider as 'email' | 'google' | undefined;
  const isEmailAuth = authProvider === 'email';
  const isGoogleAuth = authProvider === 'google';

  // Redirect if not authenticated
  useEffect(() => {
    // Only redirect if NOT in the middle of a manual sign out
    if (!authLoading && !user && !signingOut) {
      router.push('/login');
    }
  }, [authLoading, user, router, signingOut]);

  // Use same hooks as dashboard for consistent data
  const { data: profile, isLoading } = useProfile(userId);
  const { data: actualRecipesCount } = useSavedRecipesCount(userId);
  const { data: totalScans } = useTotalScans(userId);
  const { data: equippedAccessoriesData } = useEquippedAccessories(
    userId,
    profile?.equipped_accessories ?? null
  );

  // Set edit name when profile loads
  useEffect(() => {
    if (profile?.display_name) {
      setEditName(profile.display_name);
    }
  }, [profile?.display_name]);

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ display_name: editName.trim() });
      toast.success('Profil berhasil diperbarui! ✨');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    NProgress.start();
    try {
      // 1. Clear local storage explicitly
      localStorage.clear();
      sessionStorage.clear();

      // 2. AWAIT Supabase Sign Out with global scope to invalidate server-side
      // This ensures the token is revoked before redirect, preventing stale sessions
      await supabase.auth.signOut({ scope: 'global' });

      // 3. Clear cookies explicitly via document.cookie (Client side fallback)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      toast.success('Sampai jumpa lagi! 👋');

      // 4. Use router.push + refresh for proper server revalidation
      // This ensures middleware runs with cleared cookies
      router.push('/login');
      router.refresh();

    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force hard reload even on error
      window.location.href = '/login';
    }
  };

  // Handle Change Password with current password verification
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword) {
      toast.error('Masukkan password saat ini');
      return;
    }
    if (!newPassword) {
      toast.error('Masukkan password baru');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    if (currentPassword === newPassword) {
      toast.error('Password baru harus berbeda dari password saat ini');
      return;
    }

    setChangingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Password saat ini salah');
        setChangingPassword(false);
        return;
      }

      // Step 2: Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error('Gagal mengubah password: ' + updateError.message);
        return;
      }

      // Success!
      toast.success('Password berhasil diubah! 🔐');
      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Change password error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading || !userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-emerald-200 rounded-full blur-3xl opacity-40" />
          <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-lime-200 rounded-full blur-3xl opacity-30" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Stats data - using real data from hooks
  const stats = [
    {
      label: 'Streak',
      value: profile.streak_days ?? 0,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Resep Tersimpan',
      value: actualRecipesCount ?? profile.recipes_cooked ?? 0,
      icon: ChefHat,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      label: 'Total Scan',
      value: totalScans ?? 0,
      icon: Camera,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Gold',
      value: profile.wallet_balance ?? 0,
      icon: Coins,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* LOGOUT OVERLAY - Blocks interaction during signout to prevent UX confusion */}
      {signingOut && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-16 h-16 text-emerald-500" />
          </motion.div>
          <p className="mt-4 text-lg font-medium text-teal-700">Keluar dari akun...</p>
        </div>
      )}

      <LivingBackground />

      {/* MAIN CONTENT */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3">
              <User className="w-10 h-10 text-emerald-600" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-teal-900">
                  Profil Saya
                </h1>
                <p className="text-teal-700">Kelola informasi akun Anda</p>
              </div>
            </div>
          </motion.div>

          {/* PROFILE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-8">
              {/* Avatar & Name Section */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                {/* NutriGotchi Avatar instead of initials */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    animate={{
                      y: [-4, 4, -4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <NutriGotchiAvatar
                      mood={profile.mood ?? 'neutral'}
                      health={profile.health ?? 100}
                      size="lg"
                      animate={true}
                      showHealthBar={false}
                      equippedAccessories={equippedAccessoriesData ?? []}
                    />
                  </motion.div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-4 py-2 border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-semibold text-lg text-gray-700"
                        placeholder="Nama tampilan"
                        autoFocus
                      />
                      <AnimatedButton
                        onClick={handleSave}
                        disabled={saving}
                        variant="primary"
                        size="sm"
                        className="!p-2 !rounded-xl"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={() => {
                          setIsEditing(false);
                          setEditName(profile.display_name || '');
                        }}
                        variant="secondary"
                        size="sm"
                        className="!p-2 !rounded-xl"
                      >
                        <X className="w-5 h-5" />
                      </AnimatedButton>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <h2 className="text-2xl font-bold text-slate-800">
                        {profile.display_name || 'Pengguna NutriSphere'}
                      </h2>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit nama"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Email */}
                  <div className="flex items-center gap-2 text-slate-500 mt-2">
                    <Mail className="w-4 h-4" />
                    <span>{userEmail}</span>
                  </div>

                  {/* Member Since */}
                  <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>Bergabung {formatDate(profile.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200/60 my-6" />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">             {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center p-4 bg-white/60 rounded-2xl border border-white/50 hover:shadow-lg transition-shadow"
                >
                  <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-2`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </motion.div>
              ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* FRIEND CODE & FRIENDS SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Friend Code Display */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Kode Teman</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                        {profile.friend_code || 'Belum tersedia'}
                      </span>
                      {profile.friend_code && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(profile.friend_code!);
                            toast.success('Kode teman disalin!');
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Salin kode"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-1">Bagikan kode ini untuk menambah teman</p>
                  </div>
                </div>

                {/* Friends Button */}
                <button
                  onClick={() => router.push('/friends')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all"
                >
                  <Users className="w-5 h-5" />
                  Lihat Teman
                </button>
              </div>
            </GlassCard>
          </motion.div>

          {/* NUTRIGOTCHI LEVEL (if available) */}
          {(profile.level !== undefined) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                      <Trophy className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">NutriGotchi Level</h3>
                      <p className="text-slate-500 text-sm">Keep going to level up!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">Lv. {profile.level}</div>
                    <div className="text-sm text-slate-500">{profile.current_xp || 0} XP</div>
                  </div>
                </div>
                {/* XP Progress Bar */}
                <div className="mt-4 h-3 bg-purple-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(profile.current_xp / calculateMaxXp(profile.level)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* AUTHENTICATION METHOD SECTION */}
          {/* Show password section ONLY for email auth users */}
          {isEmailAuth && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <GlassCard className="p-6">
                <button
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                      <KeyRound className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-slate-800">Ubah Password</h3>
                      <p className="text-slate-500 text-sm">Perbarui password akun Anda</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: showPasswordSection ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>

                {/* Collapsible Password Form */}
                {showPasswordSection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 pt-6 border-t border-slate-200 space-y-4"
                  >
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                          placeholder="Masukkan password saat ini"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Password Baru
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                          placeholder="Minimal 6 karakter"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Konfirmasi Password Baru
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                          placeholder="Ulangi password baru"
                        />
                      </div>
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p className="text-red-500 text-sm mt-1">Password tidak cocok</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <AnimatedButton
                      onClick={handleChangePassword}
                      disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                      variant="neon"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Mengubah Password...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Ubah Password
                        </>
                      )}
                    </AnimatedButton>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* Show OAuth provider badge for Google users */}
          {isGoogleAuth && (
            <OAuthProviderBadge provider="google" />
          )}

          {/* SIGN OUT BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AnimatedButton
              onClick={handleSignOut}
              disabled={signingOut}
              variant="secondary"
              className="w-full !bg-white/60 !border !border-red-200 !text-red-600 hover:!bg-red-50 hover:!border-red-300 flex items-center justify-center gap-3"
            >
              {signingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
              {signingOut ? 'Keluar...' : 'Keluar dari Akun'}
            </AnimatedButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
