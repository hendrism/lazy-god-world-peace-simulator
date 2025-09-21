'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { getStabilityLabel } from '@/lib/formatters';
import type { RunSummary } from '@/hooks/useGameSession';

interface RunSummaryCardProps {
  summary: RunSummary;
  onReplaySeed: (seed: number) => Promise<void> | void;
  onOpenControls: () => void;
}

export default function RunSummaryCard({ summary, onReplaySeed, onOpenControls }: RunSummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const formattedSummary = useMemo(
    () =>
      JSON.stringify(
        {
          run_id: summary.runId,
          seed: summary.seed,
          score: summary.score,
          stability: summary.finalStability,
          stability_state: summary.stabilityState,
          turns: summary.turns,
          peace_streak: summary.peaceStreak,
          chaos_streak: summary.chaosStreak,
          quips: summary.notableQuips,
          decision_log: summary.decisionLog,
          completed_at: summary.completedAt,
        },
        null,
        2,
      ),
    [summary],
  );

  const stabilityLabel = getStabilityLabel(summary.stabilityState);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Unable to copy run summary', error);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="glass-panel rounded-3xl border border-white/10 bg-night-900/80 p-6 text-white/90 shadow-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">Run Complete</p>
          <h2 className="mt-2 text-2xl font-semibold">World Status · {stabilityLabel}</h2>
          <p className="mt-1 text-sm text-white/70">Seed {summary.seed} · {summary.turns} turns resolved</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right text-sm">
          <span className="rounded-full bg-accent-primary/20 px-3 py-1 font-semibold text-accent-primary">
            Score {summary.score.toLocaleString()}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
            Stability {Math.round(summary.finalStability * 100)}%
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-white/40">Highlights</p>
            <ul className="mt-2 space-y-2">
              <li>Peace Streak · {summary.peaceStreak}</li>
              <li>Chaos Streak · {summary.chaosStreak}</li>
              <li>Completion · {new Date(summary.completedAt).toLocaleString()}</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-white/40">God Quips</p>
            {summary.notableQuips.length ? (
              <ul className="mt-2 space-y-2">
                {summary.notableQuips.map((quip) => (
                  <li key={quip} className="flex gap-2">
                    <span className="text-lg">✨</span>
                    <span>{quip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-white/50">No notable divine commentary recorded.</p>
            )}
          </div>
        </div>

        <div className="flex h-full flex-col gap-3">
          <div className="rounded-2xl border border-white/10 bg-night-950/60 p-4 text-xs text-white/70">
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-white/40">Decision Log Snapshot</p>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[0.7rem] leading-relaxed text-white/70">
              {summary.decisionLog.length ? summary.decisionLog.join('\n') : 'No resolution logs captured.'}
            </pre>
          </div>
          <div className="mt-auto flex flex-wrap gap-3">
            <button
              onClick={() => void onReplaySeed(summary.seed)}
              className="flex-1 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2 text-sm font-semibold text-night-900 shadow-lg transition hover:opacity-95"
            >
              Replay seed {summary.seed}
            </button>
            <button
              onClick={onOpenControls}
              className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              Try a new seed
            </button>
            <button
              onClick={() => void handleCopy()}
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60 transition hover:bg-white/10"
            >
              {copied ? 'Summary copied!' : 'Copy summary JSON'}
            </button>
          </div>
        </div>
      </div>

      <textarea
        readOnly
        value={formattedSummary}
        className="sr-only"
        aria-hidden="true"
      />
    </motion.section>
  );
}
