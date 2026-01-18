'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Sparkles, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import AuthInput from '@/components/ui/AuthInput';
import BackButton from '@/components/ui/BackButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Gagal mengirim email reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Back Button */}
      <BackButton variant="dark" href="/login" />

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

      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,255,136,0.1)]">
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              className="inline-block mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10 text-neon-green mx-auto" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Lupa <span className="text-neon-green">Password</span>?
            </h1>
            <p className="text-gray-400">
              Masukkan email kamu dan kami akan kirim link untuk reset password.
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <CheckCircle className="w-20 h-20 text-neon-green mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Terkirim! 📧</h2>
              <p className="text-gray-400 mb-6">
                Cek inbox email <span className="text-neon-green font-semibold">{email}</span> untuk link reset password.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Tidak menemukan email? Cek folder spam atau tunggu beberapa menit.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                <ArrowLeft size={18} />
                Kembali ke Login
              </Link>
            </motion.div>
          ) : (
            <>
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
              <form onSubmit={handleResetPassword} className="space-y-6">
                <AuthInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  icon={Mail}
                  required
                />

                {/* Submit Button */}
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
                    {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                    {!loading && <Mail className="w-5 h-5" />}
                  </span>

                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.button>
              </form>

              {/* Back to Login Link */}
              <p className="text-center text-gray-400 mt-8">
                Ingat password?{' '}
                <Link
                  href="/login"
                  className="text-neon-green hover:text-emerald-400 font-semibold transition-colors"
                >
                  Login di sini
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
