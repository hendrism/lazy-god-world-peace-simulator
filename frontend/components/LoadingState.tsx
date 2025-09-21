'use client';

import { motion } from 'framer-motion';

export default function LoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <motion.div
        className="gradient-ring flex h-28 w-28 items-center justify-center rounded-full bg-night-800/60 shadow-card"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
      >
        <motion.span
          className="text-4xl"
          animate={{ scale: [0.9, 1.05, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          🌍
        </motion.span>
      </motion.div>
      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-wide">Summoning the council…</p>
        <p className="text-sm text-white/70">
          Preparing nations, assistants, and omens for your next divine intervention.
        </p>
      </div>
    </div>
  );
}
