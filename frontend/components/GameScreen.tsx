'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import DecisionButton from '@/components/DecisionButton';
import EventCard from '@/components/EventCard';
import HeaderCard from '@/components/HeaderCard';
import LoadingState from '@/components/LoadingState';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import RunSummaryCard from '@/components/RunSummaryCard';
import StatsPanel from '@/components/StatsPanel';
import { useGameSession } from '@/hooks/useGameSession';

const INTRO_STORAGE_KEY = 'lazy-god-intro-v1';

export default function GameScreen() {
  const {
    state,
    currentEvent,
    isLoading,
    isProcessing,
    outcomeSummary,
    mode,
    error,
    choose,
    restartSession,
    sessionId,
    lastRunSummary,
    clearError,
    profileSummary,
  } = useGameSession();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [introChecked, setIntroChecked] = useState(false);

  useEffect(() => {
    if (introChecked) return;
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem(INTRO_STORAGE_KEY);
    if (!seen) {
      setControlsOpen(true);
    }
    setIntroChecked(true);
  }, [introChecked]);

  const closeOverlay = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INTRO_STORAGE_KEY, '1');
    }
    setControlsOpen(false);
  }, []);

  const openOverlay = useCallback(() => {
    setControlsOpen(true);
  }, []);

  const handleLaunchWithSeed = useCallback(
    async (seed: number | null) => {
      await restartSession({ seed, resume: false });
    },
    [restartSession],
  );

  const streakHighlight = useMemo(() => {
    if (!outcomeSummary) return null;
    const lower = outcomeSummary.toLowerCase();
    if (lower.includes('streak')) {
      return outcomeSummary;
    }
    return null;
  }, [outcomeSummary]);

  if (isLoading || !state) {
    return <LoadingState />;
  }

  const runEnded = state.run_status !== 'active';
  const activeSeed = state.seed ?? null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={openOverlay}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/50 transition hover:border-white/20 hover:bg-white/10"
        >
          Session Controls
        </button>
        <span className="text-[0.6rem] uppercase tracking-[0.25em] text-white/30">Session · {sessionId ?? 'pending'}</span>
      </div>

      <HeaderCard state={state} outcomeSummary={outcomeSummary} mode={mode} />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          <span>{error}</span>
          <button onClick={clearError} className="text-xs uppercase tracking-[0.2em] text-rose-100/70 hover:text-rose-50">
            Dismiss
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {streakHighlight && (
          <motion.div
            key={streakHighlight}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-accent-secondary/40 bg-accent-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-secondary"
          >
            {streakHighlight}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentEvent && !runEnded ? (
          <EventCard
            key={currentEvent.id}
            event={currentEvent}
            nations={state.nations}
            assistants={state.assistants}
            assistantNotes={state.assistant_notes}
            isProcessing={isProcessing}
          />
        ) : (
          <RunSummaryCard
            key="run-complete"
            summary={(() => {
              if (lastRunSummary) return lastRunSummary;
              const lastEvent = state.events_log[state.events_log.length - 1];
              return {
                runId: state.run_id,
                seed: state.seed,
                score: state.score,
                finalStability: state.stability,
                stabilityState: state.stability_state,
                result: state.run_status,
                turns: state.turn,
                peaceStreak: state.peace_streak,
                chaosStreak: state.chaos_streak,
                notableQuips: state.god_quips.slice(-3),
                decisionLog: lastEvent?.resolution?.logs?.slice(-4) ?? [],
                completedAt: new Date().toISOString(),
              };
            })()}
            onReplaySeed={async (seed) => {
              await restartSession({ seed, resume: false });
            }}
            onOpenControls={openOverlay}
          />
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

      <footer className="mt-auto px-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-white/30">
        Lazy God Prototype · Optimized for Vercel Edge
      </footer>

      <OnboardingOverlay
        open={controlsOpen}
        onClose={closeOverlay}
        onLaunchRun={handleLaunchWithSeed}
        isProcessing={isProcessing || isLoading}
        sessionId={sessionId}
        activeSeed={activeSeed}
        mode={mode}
        profileSummary={profileSummary}
      />
    </div>
  );
}
