'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import NutriGotchiLoader from '@/components/ui/NutriGotchiLoader';
import { supabase } from '@/lib/supabase/client';
import AuthInput from '@/components/ui/AuthInput';
import SocialButton from '@/components/ui/SocialButton';
import NutriGotchiAvatar from '@/components/ui/NutriGotchiAvatar';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation
    if (!displayName.trim()) {
      setError('Masukkan nama lengkap Anda');
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError('Masukkan alamat email Anda');
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

    if (!password) {
      setError('Masukkan password Anda');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            full_name: displayName.trim(), // Also set full_name for Google compatibility
          },
        },
      });

      if (error) {
        // Comprehensive error handling with user-friendly Indonesian messages
        const errorMessage = error.message.toLowerCase();

        // Email already registered
        if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
          throw new Error('Email sudah terdaftar. Silakan login atau gunakan email lain.');
        }

        // Invalid email
        if (errorMessage.includes('invalid email')) {
          throw new Error('Format email tidak valid. Contoh: nama@email.com');
        }

        // Weak password
        if (errorMessage.includes('password') && errorMessage.includes('weak')) {
          throw new Error('Password terlalu lemah. Gunakan kombinasi huruf dan angka.');
        }

        // Rate limiting
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          throw new Error('Terlalu banyak percobaan. Tunggu beberapa menit sebelum mencoba lagi.');
        }

        // Network errors
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          throw new Error('Koneksi bermasalah. Periksa internet Anda dan coba lagi.');
        }

        // Generic fallback - show actual error for debugging
        console.error('Unhandled signup error:', error.message);
        throw new Error(`Gagal membuat akun: ${error.message}`);
      }

      console.log('✅ Registration successful:', data);
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center pt-20 pb-10">
      {/* Back Button */}
      <BackButton variant="dark" href="/" />

      {/* Loading Overlay */}
      <NutriGotchiLoader
        variant="overlay"
        isVisible={loading}
        message="Membuat akun..."
      />

      {/* Aurora Gradient Background */}
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
            background: 'radial-gradient(circle, #a78bfa 0%, #8b5cf6 50%, transparent 70%)',
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
            background: 'radial-gradient(circle, #fb923c 0%, #f97316 50%, transparent 70%)',
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
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-purple-400/30 rounded-full blur-3xl scale-150" />
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
                Mulai petualangan{' '}
                <span className="text-neon-green">nutrisimu</span>!
              </h2>
              <p className="text-gray-400 text-lg max-w-md">
                Gabung sekarang dan raih level NutriGotchi tertinggi dengan gaya hidup sehat & hemat!
              </p>
            </motion.div>

            {/* Decorative Elements */}
            <div className="flex gap-4 items-center">
              {['🎮', '⭐', '🏆'].map((emoji, index) => (
                <motion.div
                  key={index}
                  className="text-4xl"
                  animate={{
                    y: [-5, 5, -5],
                    rotate: [-10, 10, -10],
                    scale: [1, 1.1, 1],
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
                  Buat <span className="text-neon-green">Akun Baru</span>
                </h1>
                <p className="text-gray-400">
                  Mulai perjalananmu jadi master nutrisi!
                </p>
              </div>

              {/* Success Alert */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-neon-green/10 border border-neon-green/50 rounded-xl text-neon-green text-sm"
                >
                  🎉 Akun berhasil dibuat! Cek email untuk verifikasi. Redirecting...
                </motion.div>
              )}

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
              <form onSubmit={handleEmailRegister} className="space-y-6">
                <AuthInput
                  label="Nama Lengkap"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  icon={User}
                  required
                />

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
                  placeholder="Minimal 6 karakter"
                  icon={Lock}
                  required
                  minLength={6}
                />

                {/* Primary Button with Shimmer */}
                <motion.button
                  type="submit"
                  disabled={loading || success}
                  className="group relative w-full px-8 py-4 bg-gradient-to-r from-neon-green to-emerald-500 text-gray-900 font-bold text-lg rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,136,0.4)]"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Membuat Akun...' : success ? 'Berhasil! ✓' : 'Daftar Sekarang'}
                    {!loading && !success && <ArrowRight className="w-5 h-5" />}
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
                    Atau daftar dengan
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <SocialButton
                icon="google"
                provider="Google"
                onClick={handleGoogleRegister}
                loading={loading}
              />

              {/* Login Link */}
              <p className="text-center text-gray-400 mt-8">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  className="text-neon-green hover:text-emerald-400 font-semibold transition-colors"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>

            {/* Mobile-only tagline */}
            <p className="lg:hidden text-center text-gray-400 mt-6">
              🎮 Level Up Nutrisimu! ⭐
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
