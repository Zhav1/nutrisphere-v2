'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChefHat, Coins, Sparkles, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import { supabase } from '@/lib/supabase/client';

// Typewriter hook
function useTypewriter(words: string[], typingSpeed = 150, deletingSpeed = 100, delayBetweenWords = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          // Word complete, wait then start deleting
          setTimeout(() => setIsDeleting(true), delayBetweenWords);
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          // Deletion complete, move to next word
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, wordIndex, isDeleting, words, typingSpeed, deletingSpeed, delayBetweenWords]);

  return displayText;
}

export default function HomePage() {
  const router = useRouter();
  const rotatingWords = ['Mahasiswa', 'Anak Kos', 'Dompet Tipis', 'Generasi Hemat'];
  const typedWord = useTypewriter(rotatingWords);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Smart redirect - if authenticated, go to dashboard, else go to login
  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 relative overflow-hidden pt-20">
      {/* Dynamic Aurora Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Aurora Blobs */}
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

        {/* Grid Overlay for Depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Mouse Parallax Background - Interactive floating emojis */}
      <ParallaxBackground />

      {/* Floating 3D Emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { emoji: '🥦', x: '10%', y: '20%', delay: 0, duration: 15 },
          { emoji: '🪙', x: '80%', y: '30%', delay: 2, duration: 18 },
          { emoji: '📸', x: '15%', y: '70%', delay: 1, duration: 20 },
          { emoji: '🍳', x: '85%', y: '60%', delay: 3, duration: 17 },
          { emoji: '💰', x: '50%', y: '80%', delay: 1.5, duration: 19 },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-6xl opacity-20"
            style={{ left: item.x, top: item.y }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-10, 10, -10],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            className="max-w-5xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >

            {/* Main Headline */}
            <motion.h1
              className="text-6xl md:text-8xl font-black mb-6 leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="bg-gradient-to-r from-neon-green via-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,136,0.5)]">
                NutriSphere
              </span>
            </motion.h1>

            {/* Typewriter Sub-headline */}
            <div className="h-16 mb-8">
              <p className="text-2xl md:text-4xl font-bold text-white">
                Nutrisi untuk{' '}
                <span className="text-neon-green relative">
                  {typedWord}
                  <motion.span
                    className="inline-block w-1 h-8 md:h-10 bg-neon-green ml-1"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </span>
              </p>
            </div>

            <motion.p
              className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Aplikasi nutrisi pertama yang{' '}
              <span className="text-neon-green font-semibold">memahami realita mahasiswa</span>:
              Budget terbatas, tanpa kulkas, tanpa ribet.
            </motion.p>

            {/* Glowing CTA - Smart Redirect */}
            <motion.button
              onClick={handleGetStarted}
              disabled={isCheckingAuth}
              className="group relative px-10 py-5 bg-gradient-to-r from-neon-green to-emerald-500 text-gray-900 font-bold text-lg rounded-full overflow-hidden shadow-[0_0_30px_rgba(0,255,136,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{
                scale: isCheckingAuth ? 1 : 1.05,
                boxShadow: isCheckingAuth ? undefined : '0 0 50px rgba(0, 255, 136, 0.8)',
              }}
              whileTap={{ scale: isCheckingAuth ? 1 : 0.95 }}
              animate={{
                y: isCheckingAuth ? 0 : [0, -5, 0],
              }}
              transition={{
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                {isCheckingAuth ? 'Memuat...' : isAuthenticated ? 'Masuk ke Dashboard' : 'Mulai Sekarang'}
                {!isCheckingAuth && (
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </span>

              {/* Shimmer Effect */}
              {!isCheckingAuth && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.button>
          </motion.div>
        </section>

        {/* Bento Grid Feature Showcase */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Grid - Asymmetric Bento Layout */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {/* Large Card - Scan Feature (Spans 2 rows, 4 cols on desktop) */}
              <motion.div
                className="md:col-span-4 md:row-span-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  className="h-full min-h-[400px] rounded-3xl p-8 md:p-12 backdrop-blur-md bg-white/5 border border-white/10 relative overflow-hidden group cursor-pointer"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Gradient Glow on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <motion.div
                    className="text-7xl mb-6"
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Camera className="w-20 h-20 text-neon-green drop-shadow-[0_0_20px_rgba(0,255,136,0.6)]" />
                  </motion.div>

                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Scan Tanpa Ketik
                  </h3>
                  <p className="text-lg text-gray-300 mb-6 leading-relaxed max-w-md">
                    AI membaca label gizi & mendeteksi makanan otomatis. Arahkan, klik, selesai!
                  </p>

                  {/* Floating Particles */}
                  <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-neon-green/20 blur-2xl animate-pulse" />
                  <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-cyan-400/20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                </motion.div>
              </motion.div>

              {/* Small Card 1 - Recipe (2 cols) */}
              <motion.div
                className="md:col-span-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="h-full min-h-[190px] rounded-3xl p-6 md:p-8 backdrop-blur-md bg-white/5 border border-white/10 group cursor-pointer relative overflow-hidden"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <motion.div
                    whileHover={{ rotate: [0, 10, -10, 0] }}
                  >
                    <ChefHat className="w-12 h-12 text-amber-400 mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Resep Hemat
                  </h3>
                  <p className="text-sm text-gray-400">
                    Bahan eceran, tidak ada yang busuk!
                  </p>
                </motion.div>
              </motion.div>

              {/* Small Card 2 - Gold System (2 cols) */}
              <motion.div
                className="md:col-span-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className="h-full min-h-[190px] rounded-3xl p-6 md:p-8 backdrop-blur-md bg-white/5 border border-white/10 group cursor-pointer relative overflow-hidden"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    <Coins className="w-12 h-12 text-purple-400 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Hemat = Gold
                  </h3>
                  <p className="text-sm text-gray-400">
                    Masak sendiri dapat emas virtual!
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Stats Section - Glassmorphism */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            className="max-w-4xl mx-auto backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
              {[
                { value: '0%', label: 'Biaya', icon: '💸' },
                { value: 'AI-Powered', label: 'Teknologi', icon: '🤖' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-neon-green mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 py-8 mt-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400 mb-2">
              © 2024 NutriSphere - Demokratisasi Nutrisi untuk Setiap Kantong Mahasiswa
            </p>
            <p className="text-sm text-gray-500">
              Powered by Gemini Vision AI + TensorFlow.js
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
