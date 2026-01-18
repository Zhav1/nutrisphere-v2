'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import NutriGotchiLoader from '@/components/ui/NutriGotchiLoader';
import { supabase } from '@/lib/supabase/client';
import AuthInput from '@/components/ui/AuthInput';
import SocialButton from '@/components/ui/SocialButton';
import NutriGotchiAvatar from '@/components/ui/NutriGotchiAvatar';

function SearchParamsHandler({ onParams }: { onParams: (redirect: string, reason: string | null) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onParams(searchParams.get('redirect') || '/home', searchParams.get('reason'));
  }, [searchParams, onParams]);
  return null;
}

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState('/home');

  // Handle search params with useCallback to prevent re-renders
  const handleParams = useCallback((redirect: string, reason: string | null) => {
    setRedirectTo(redirect);
    if (reason === 'unauthenticated') {
      setError('Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.');
    } else if (reason === 'no_profile') {
      setError('Profil tidak ditemukan. Silakan daftar ulang atau hubungi support.');
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!email.trim()) {
      setError('Masukkan alamat email Anda');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Masukkan password Anda');
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid. Contoh: nama@email.com');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Comprehensive error handling with user-friendly Indonesian messages
        // Security Note: We use generic "Email atau password salah" for auth errors
        // to prevent account enumeration attacks

        const errorMessage = error.message.toLowerCase();

        // Email not verified
        if (errorMessage.includes('email not confirmed') || errorMessage.includes('not confirmed')) {
          throw new Error('Email belum diverifikasi. Cek inbox atau folder spam Anda untuk link verifikasi.');
        }

        // Invalid credentials (wrong email OR wrong password - don't reveal which!)
        if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
          throw new Error('Email atau password salah. Periksa kembali dan coba lagi.');
        }

        // User not found (treat same as wrong password for security)
        if (errorMessage.includes('user not found') || errorMessage.includes('no user')) {
          throw new Error('Email atau password salah. Belum punya akun? Daftar di bawah.');
        }

        // Rate limiting
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
          throw new Error('Terlalu banyak percobaan. Tunggu beberapa menit sebelum mencoba lagi.');
        }

        // Network/connection errors
        if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
          throw new Error('Koneksi bermasalah. Periksa internet Anda dan coba lagi.');
        }

        // Account disabled/banned
        if (errorMessage.includes('disabled') || errorMessage.includes('banned') || errorMessage.includes('blocked')) {
          throw new Error('Akun ini telah dinonaktifkan. Hubungi support untuk bantuan.');
        }

        // Generic fallback with original error for debugging
        console.error('Unhandled auth error:', error.message);
        throw new Error('Gagal masuk. Silakan coba lagi atau hubungi support.');
      }

      console.log('✅ Login successful:', data);

      // Verify session is stored
      const { data: sessionCheck } = await supabase.auth.getSession();
      console.log('🔍 Session check:', sessionCheck);

      // Check if user has a profile, if not create one automatically
      if (data.user) {
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (profileError || !existingProfile) {
          console.log('📝 No profile found, creating new profile...');

          // Generate friend code (NS-XXXXXXXX format)
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let friendCode = 'NS-';
          for (let i = 0; i < 8; i++) {
            friendCode += chars.charAt(Math.floor(Math.random() * chars.length));
          }

          // Auto-create profile with friend code
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'NutriUser',
              friend_code: friendCode,
            });

          if (createError) {
            console.error('❌ Failed to create profile:', createError);
            throw new Error('Gagal membuat profil: ' + createError.message);
          }

          console.log('✅ New profile created with friend code:', friendCode);
        } else {
          console.log('✅ Profile exists:', existingProfile.id);
        }
      }

      // Redirect with delay to ensure session and profile are ready
      setTimeout(() => {
        console.log(`🚀 Attempting redirect to ${redirectTo}...`);
        router.push(redirectTo);
      }, 100);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Include redirect destination in callback URL for Google OAuth
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      if (redirectTo && redirectTo !== '/home') {
        callbackUrl.searchParams.set('redirect', redirectTo);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center pt-20 pb-10">
      <Suspense fallback={null}>
        <SearchParamsHandler onParams={handleParams} />
      </Suspense>
      {/* Back Button */}
      <BackButton variant="dark" href="/" />

      {/* Loading Overlay */}
      <NutriGotchiLoader
        variant="overlay"
        isVisible={loading}
        message="Sedang masuk..."
      />

      {/* Aurora Gradient Background (reused from landing page) */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30 mix-blend-screen filter blur-3xl"
          style={{
            background: 'radial-gradient(circle, #00ff88 0%, #10b981 50%, transparent 70%)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/4 right-0 w-96 h-96 rounded-full opacity-30 mix-blend-screen filter blur-3xl"
          style={{
            background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 50%, transparent 70%)',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full opacity-30 mix-blend-screen filter blur-3xl"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, #14b8a6 50%, transparent 70%)',
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Main Content - Split Screen Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT SIDE - Visual Hook (Hidden on mobile) */}
          <motion.div
            className="hidden lg:flex flex-col items-center justify-center space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Floating NutriGotchi Mascot with Glow for Dark Background */}
            <motion.div
              className="relative"
              animate={{
                y: [-10, 10, -10],
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Glow effect for contrast on dark bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-3xl scale-150" />
              <div className="relative">
                <NutriGotchiAvatar
                  mood="happy"
                  health={100}
                  size="xl"
                  animate={true}
                  showHealthBar={false}
                />
              </div>
            </motion.div>

            {/* Catchphrase */}
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-white">
                Siap makan enak{' '}
                <span className="text-neon-green">modal 10rb</span>?
              </h2>
              <p className="text-gray-400 text-lg max-w-md">
                Masuk sekarang dan mulai perjalananmu menuju hidup sehat dengan budget mahasiswa!
              </p>
            </motion.div>

            {/* Decorative Elements */}
            <div className="flex gap-4 items-center">
              {['🥦', '💰', '📸'].map((emoji, index) => (
                <motion.div
                  key={index}
                  className="text-4xl"
                  animate={{
                    y: [-5, 5, -5],
                    rotate: [-10, 10, -10],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT SIDE - Glassmorphism Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Glass Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,255,136,0.1)]">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Masuk ke <span className="text-neon-green">Portal</span>
                </h1>
                <p className="text-gray-400">
                  Akses dashboard nutrisimu sekarang!
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <AuthInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  icon={Mail}
                  required
                />

                <AuthInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={Lock}
                  required
                />

                {/* Forgot Password Link */}
                <div className="flex justify-end -mt-4">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Lupa Password?
                  </Link>
                </div>

                {/* Primary Button with Shimmer */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full px-8 py-4 bg-gradient-to-r from-neon-green to-emerald-500 text-gray-900 font-bold text-lg rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,136,0.4)]"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Memproses...' : 'Masuk Sekarang'}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </span>

                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900/50 text-gray-400">
                    Atau masuk dengan
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <SocialButton
                icon="google"
                provider="Google"
                onClick={handleGoogleLogin}
                loading={loading}
              />

              {/* Register Link */}
              <p className="text-center text-gray-400 mt-8">
                Belum punya akun?{' '}
                <Link
                  href="/register"
                  className="text-neon-green hover:text-emerald-400 font-semibold transition-colors"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>

            {/* Mobile-only tagline */}
            <p className="lg:hidden text-center text-gray-400 mt-6">
              🥦 Nutrisi Sehat, Budget Hemat 💰
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<NutriGotchiLoader variant="overlay" isVisible message="Loading..." />}>
      <LoginPage />
    </Suspense>
  );
}
