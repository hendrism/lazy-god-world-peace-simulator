'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface OnboardingOverlayProps {
  open: boolean;
  onClose: () => void;
  onLaunchRun: (seed: number | null) => Promise<void> | void;
  isProcessing: boolean;
  sessionId: string | null;
  activeSeed: number | null;
  mode: 'live' | 'mock';
}

const INTRO_STEPS = [
  'Advance turns with the buttons below each event card. Each choice shifts world stability and your score.',
  'Watch the stability meter and streak counters. Peace streaks unlock trait intel; chaos streaks trigger penalties.',
  'When the run ends, capture the summary for playtest notes or replay the same seed to compare outcomes.',
];

export default function OnboardingOverlay({
  open,
  onClose,
  onLaunchRun,
  isProcessing,
  sessionId,
  activeSeed,
  mode,
}: OnboardingOverlayProps) {
  const [seedInput, setSeedInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSeedInput('');
      setIsSubmitting(false);
    }
  }, [open]);

  const seedIsValid = useMemo(() => {
    if (seedInput.trim() === '') return true;
    return /^\d{1,10}$/.test(seedInput.trim());
  }, [seedInput]);

  const handleLaunch = async (seed: number | null) => {
    if (isProcessing || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onLaunchRun(seed);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSeed = async () => {
    if (!seedIsValid) return;
    const trimmed = seedInput.trim();
    const parsed = trimmed ? Number.parseInt(trimmed, 10) : null;
    await handleLaunch(parsed);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/90 px-4 py-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -32 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="glass-panel max-w-xl rounded-3xl border border-white/10 bg-night-900/80 p-8 text-white/90 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">World Peace Briefing</p>
                <h2 className="mt-2 text-2xl font-semibold">Lazy God Orientation</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60 transition hover:bg-white/10"
              >
                Skip
              </button>
            </div>

            <p className="mt-4 text-sm text-white/70">
              You are the cosmic admin on duty. Decisions you make on each turn ripple through stability, streak bonuses, and the
              fate of eight eccentric nations.
            </p>

            <ul className="mt-5 space-y-3 text-sm text-white/75">
              {INTRO_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-[2px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/70">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[0.7rem] text-white/60">
              <p className="uppercase tracking-[0.25em] text-white/40">Session Details</p>
              <div className="mt-2 flex flex-col gap-1 text-xs">
                <span>Mode · {mode === 'live' ? 'FastAPI Connected' : 'Offline Simulation'}</span>
                <span>Session ID · {sessionId ?? 'pending'}</span>
                <span>Active Seed · {activeSeed ?? 'random'}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[0.65rem] uppercase tracking-[0.25em] text-white/40">Custom Seed (optional)</label>
                <input
                  value={seedInput}
                  onChange={(event) => setSeedInput(event.target.value)}
                  placeholder="Enter up to 10 digits"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-night-950/60 px-4 py-3 text-sm text-white focus:border-accent-primary focus:outline-none"
                />
                {!seedIsValid && (
                  <p className="mt-1 text-xs text-rose-300/80">Seeds must be numeric and up to 10 digits.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => void handleLaunch(null)}
                  disabled={isProcessing || isSubmitting}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-3 text-sm font-semibold text-night-900 shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessing || isSubmitting ? 'Preparing…' : 'Launch with random seed'}
                </button>
                <button
                  onClick={() => void handleSubmitSeed()}
                  disabled={!seedIsValid || isProcessing || isSubmitting}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Use custom seed
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-full border border-transparent px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/50 transition hover:border-white/20 hover:bg-white/5"
              >
                Continue current run
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
