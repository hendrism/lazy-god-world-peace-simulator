'use client';

import { motion } from 'framer-motion';

import { getStabilityLabel } from '@/lib/formatters';
import type { GameState } from '@/types/game';

interface HeaderCardProps {
  state: GameState;
  outcomeSummary: string | null;
  mode: 'live' | 'mock';
}

export default function HeaderCard({ state, outcomeSummary, mode }: HeaderCardProps) {
  const stabilityPercent = Math.round(state.stability * 100);
  const stabilityLabel = getStabilityLabel(state.stability_state);

  return (
    <motion.section
      layout
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="glass-panel gradient-ring rounded-3xl p-5 text-white/90"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">Turn {state.turn}</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight">Lazy God Console</h1>
          <p className="mt-1 text-[0.75rem] uppercase tracking-[0.25em] text-white/50">
            World Theme · {state.world_theme.replace('_', ' ')}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-end justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm sm:w-auto sm:flex-col sm:items-end sm:text-right">
          <div className="w-full text-left text-[0.6rem] uppercase tracking-[0.25em] text-white/50 sm:text-right">
            Score
          </div>
          <p className="text-xl font-semibold text-accent-amber">{state.score.toLocaleString()}</p>
          <p className="text-[0.7rem] text-white/60">Peace Streak {state.peace_streak}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.25em] text-white/50">
            <span>World Stability</span>
            <span className="font-medium text-white/70">{stabilityLabel}</span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-secondary to-accent-primary"
              initial={{ width: 0 }}
              animate={{ width: `${stabilityPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-2 text-right text-xs font-semibold text-accent-secondary">{stabilityPercent}%</div>
        </div>
        <div className="flex flex-wrap gap-2 text-[0.7rem] text-white/70">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium">
            Mode · {mode === 'live' ? 'Connected' : 'Offline Simulation'}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium">
            Chaos Streak · {state.chaos_streak}
          </span>
          {state.run_status !== 'active' && (
            <span className="rounded-full border border-accent-amber/40 bg-accent-amber/20 px-3 py-1 font-semibold text-accent-amber">
              Run Status · {state.run_status.replace('_', ' ')}
            </span>
          )}
        </div>
        {outcomeSummary && (
          <p className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/80">
            {outcomeSummary}
          </p>
        )}
      </div>
    </motion.section>
  );
}
