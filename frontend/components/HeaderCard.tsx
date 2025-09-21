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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Turn {state.turn}</p>
          <h1 className="mt-1 text-2xl font-semibold">Lazy God Console</h1>
          <p className="text-xs text-white/60">World Theme · {state.world_theme.replace('_', ' ')}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">Score</p>
          <p className="text-lg font-semibold text-accent-amber">{state.score.toLocaleString()}</p>
          <p className="text-[0.65rem] text-white/50">Peace Streak {state.peace_streak}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
            <span>World Stability</span>
            <span>{stabilityLabel}</span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-secondary to-accent-primary"
              initial={{ width: 0 }}
              animate={{ width: `${stabilityPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-1 text-right text-xs font-semibold text-accent-secondary">{stabilityPercent}%</div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
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
          <p className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/80">
            {outcomeSummary}
          </p>
        )}
      </div>
    </motion.section>
  );
}
