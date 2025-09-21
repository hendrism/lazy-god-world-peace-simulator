'use client';

import { motion } from 'framer-motion';

import { getRaceEmoji, getStabilityLabel } from '@/lib/formatters';
import type { GameAssistant, GameState } from '@/types/game';

interface StatsPanelProps {
  state: GameState;
}

function AssistantBadge({ assistant }: { assistant: GameAssistant }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-night-900/70 text-xl">
        🔮
      </div>
      <div>
        <p className="text-sm font-semibold text-white/90">{assistant.name}</p>
        <p className="text-xs text-white/60">{assistant.flavor_text || `${assistant.clazz} · Lv ${assistant.level}`}</p>
      </div>
      <span className="ml-auto rounded-full bg-accent-primary/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent-primary">
        Ready
      </span>
    </div>
  );
}

export default function StatsPanel({ state }: StatsPanelProps) {
  const assistants = Object.values(state.assistants);
  const trendingNations = Object.values(state.nations)
    .sort((a, b) => b.prosperity - a.prosperity)
    .slice(0, 3);

  return (
    <motion.section
      layout
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="glass-panel rounded-3xl p-5"
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
        <span>Strategic Overview</span>
        <span>{getStabilityLabel(state.stability_state)}</span>
      </div>
      <div className="mt-4 grid gap-4">
        <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
          <div className="rounded-2xl bg-night-900/70 px-4 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/40">Peace Streak</p>
            <p className="mt-1 text-xl font-semibold text-accent-secondary">{state.peace_streak}</p>
          </div>
          <div className="rounded-2xl bg-night-900/70 px-4 py-3">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/40">Chaos Streak</p>
            <p className="mt-1 text-xl font-semibold text-rose-300">{state.chaos_streak}</p>
          </div>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">Trusted Assistants</p>
          <div className="mt-2 space-y-2">
            {assistants.map((assistant) => (
              <AssistantBadge key={assistant.id} assistant={assistant} />
            ))}
            {assistants.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 bg-night-900/50 px-4 py-6 text-center text-xs text-white/50">
                Assistants will join your cause as you progress.
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">Prosperous Nations</p>
          <div className="mt-3 flex flex-col gap-2">
            {trendingNations.map((nation) => (
              <div
                key={nation.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-night-900/60 px-4 py-3 text-sm text-white/80"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getRaceEmoji(nation.primary_race)}</span>
                  <div>
                    <p className="font-semibold">{nation.name}</p>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">{Math.round(nation.prosperity * 100)}% Prosperity</p>
                  </div>
                </div>
                <span className="text-xs text-white/50">Power {Math.round(nation.power * 100)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
