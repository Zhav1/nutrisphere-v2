'use client';

import { motion } from 'framer-motion';

export default function LivingBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-200 rounded-full blur-3xl opacity-40"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-20 right-10 w-[400px] h-[400px] bg-lime-200 rounded-full blur-3xl opacity-30"
        animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-teal-100 rounded-full blur-3xl opacity-35"
        animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </div>
  );
}
