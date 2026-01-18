'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface AILoadingAnimationProps {
  stage: 'idle' | 'processing_vision' | 'complete' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
  type?: 'label' | 'food'; // Different themes for label vs food scanner
}

// Fun loading messages that rotate
const loadingMessages = {
  label: [
    { emoji: '🔍', text: 'Membaca label nutrisi...' },
    { emoji: '🧮', text: 'Menghitung kalori...' },
    { emoji: '🥗', text: 'Menganalisis kandungan gizi...' },
    { emoji: '📊', text: 'Membuat laporan kesehatan...' },
    { emoji: '🤖', text: 'AI sedang berpikir keras...' },
    { emoji: '✨', text: 'Hampir selesai nih!' },
  ],
  food: [
    { emoji: '📸', text: 'Mengenali makanan...' },
    { emoji: '🍛', text: 'Wah, kelihatan enak!' },
    { emoji: '🥢', text: 'Menganalisis porsi...' },
    { emoji: '🔬', text: 'Menghitung nutrisi per item...' },
    { emoji: '🧠', text: 'AI sedang bekerja keras...' },
    { emoji: '⚡', text: 'Sebentar lagi selesai!' },
  ],
};

// Fun facts shown during loading
const funFacts = [
  '💡 Nasi putih 1 centong = ~130 kalori',
  '💡 Protein membantu otot recover setelah olahraga',
  '💡 Minum air putih 8 gelas sehari itu penting!',
  '💡 Sayuran hijau kaya akan serat dan vitamin',
  '💡 Gula berlebih bisa bikin ngantuk lho!',
  '💡 Tempe = superfood Indonesia, protein tinggi!',
  '💡 Jalan kaki 30 menit bakar ~150 kalori',
];

export default function AILoadingAnimation({ 
  stage, 
  errorMessage, 
  onRetry,
  type = 'label'
}: AILoadingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = loadingMessages[type];

  // Rotate messages every 2 seconds
  useEffect(() => {
    if (stage !== 'processing_vision') return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [stage, messages.length]);

  // Rotate fun facts every 4 seconds
  useEffect(() => {
    if (stage !== 'processing_vision') return;
    
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [stage]);

  // Animate progress
  useEffect(() => {
    if (stage !== 'processing_vision') {
      setProgress(stage === 'complete' ? 100 : 0);
      return;
    }

    // Smooth progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Cap at 90% until actually complete
        return prev + Math.random() * 5;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [stage]);

  if (stage === 'idle') return null;

  const isError = stage === 'error';
  const isComplete = stage === 'complete';
  const currentMessage = messages[messageIndex];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/90 to-teal-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl"
      >
        {/* Animated NutriGotchi Character */}
        <div className="mb-6 relative">
          {isError ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-7xl"
            >
              😵
            </motion.div>
          ) : isComplete ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-7xl"
            >
              🎉
            </motion.div>
          ) : (
            <div className="relative w-32 h-32 mx-auto">
              {/* Pulsing background rings */}
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-200"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 rounded-full bg-emerald-300"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.3, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
              
              {/* NutriGotchi Character */}
              <motion.div
                className="absolute inset-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [-5, 5, -5],
                  rotate: [-3, 3, -3]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                {/* Face */}
                <div className="relative">
                  {/* Eyes */}
                  <div className="flex gap-3 mb-1">
                    <motion.div
                      className="w-3 h-3 bg-white rounded-full"
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    />
                    <motion.div
                      className="w-3 h-3 bg-white rounded-full"
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    />
                  </div>
                  {/* Mouth - thinking */}
                  <motion.div
                    className="w-4 h-2 bg-white/80 rounded-full mx-auto"
                    animate={{ scaleX: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              {/* Floating icons around character */}
              <motion.div
                className="absolute -top-2 -right-2 text-2xl"
                animate={{ 
                  y: [-5, 5, -5],
                  rotate: [0, 10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔍
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-2 text-2xl"
                animate={{ 
                  y: [5, -5, 5],
                  rotate: [0, -10, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                📊
              </motion.div>
              <motion.div
                className="absolute top-1/2 -right-4 text-xl"
                animate={{ 
                  x: [-3, 3, -3],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨
              </motion.div>
            </div>
          )}
        </div>

        {/* Message with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isError ? 'error' : isComplete ? 'complete' : messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            {!isError && !isComplete && (
              <span className="text-3xl mr-2">{currentMessage.emoji}</span>
            )}
            <h2 className="text-xl font-bold text-gray-800 inline">
              {isError ? 'Oops! Gagal Memproses' : isComplete ? 'Selesai! 🎊' : currentMessage.text}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Error details */}
        {isError && errorMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 text-sm mb-6 bg-red-50 p-3 rounded-xl"
          >
            {errorMessage}
          </motion.p>
        )}

        {/* Progress bar with gradient */}
        {!isError && !isComplete && (
          <div className="mb-4">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 bg-[length:200%_100%]"
                style={{ width: `${Math.min(progress, 95)}%` }}
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              {Math.round(Math.min(progress, 95))}%
            </p>
          </div>
        )}

        {/* Fun Fact */}
        {!isError && !isComplete && (
          <AnimatePresence mode="wait">
            <motion.div
              key={factIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-200"
            >
              <p className="text-xs text-amber-800">
                {funFacts[factIndex]}
              </p>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Retry button for errors */}
        {isError && onRetry && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onRetry}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold w-full transition-all shadow-lg"
          >
            🔄 Coba Lagi
          </motion.button>
        )}

        {/* Processing hint */}
        {!isError && !isComplete && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-400 mt-4"
          >
            Powered by Gemini AI ✨
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
