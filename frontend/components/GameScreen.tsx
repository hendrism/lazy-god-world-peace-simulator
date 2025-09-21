'use client';

import { AnimatePresence, motion } from 'framer-motion';

import DecisionButton from '@/components/DecisionButton';
import EventCard from '@/components/EventCard';
import HeaderCard from '@/components/HeaderCard';
import LoadingState from '@/components/LoadingState';
import StatsPanel from '@/components/StatsPanel';
import { useGameSession } from '@/hooks/useGameSession';

export default function GameScreen() {
  const { state, currentEvent, isLoading, isProcessing, outcomeSummary, mode, error, choose, restartSession } =
    useGameSession();

  if (isLoading || !state) {
    return <LoadingState />;
  }

  const runEnded = state.run_status !== 'active';

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-5 pb-16">
      <HeaderCard state={state} outcomeSummary={outcomeSummary} mode={mode} />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {currentEvent && !runEnded ? (
          <EventCard key={currentEvent.id} event={currentEvent} nations={state.nations} isProcessing={isProcessing} />
        ) : (
          <motion.section
            key="run-complete"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="glass-panel rounded-3xl p-6 text-center"
          >
            <div className="text-4xl">✨</div>
            <h2 className="mt-3 text-xl font-semibold text-white/90">Run Complete</h2>
            <p className="mt-2 text-sm text-white/70">
              The world settles on your decisions. Your final score was{' '}
              <span className="font-semibold text-accent-amber">{state.score.toLocaleString()}</span>.
            </p>
            <button
              onClick={() => restartSession()}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-2 text-sm font-semibold text-night-900 shadow-lg"
            >
              Start a new run
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {!runEnded && currentEvent && (
        <div className="space-y-3">
          {currentEvent.choices.map((choice) => (
            <DecisionButton
              key={choice.key}
              choice={choice}
              onSelect={choose}
              disabled={isProcessing}
            />
          ))}
        </div>
      )}

      <StatsPanel state={state} />

      <footer className="mt-auto text-center text-[0.65rem] uppercase tracking-[0.3em] text-white/30">
        Lazy God Prototype · Optimized for Vercel Edge
      </footer>
    </div>
  );
}
