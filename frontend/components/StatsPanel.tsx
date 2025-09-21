'use client';

import { motion } from 'framer-motion';

import { getRaceEmoji, getStabilityLabel } from '@/lib/formatters';
import type { GameAssistant, GameState } from '@/types/game';

interface StatsPanelProps {
  state: GameState;
}

interface AssistantBadgeProps {
  assistant: GameAssistant;
  note?: string;
}

function AssistantBadge({ assistant, note }: AssistantBadgeProps) {
  const unlocked = assistant.unlocked;
  let statusLabel = 'Ready';
  let statusClass = 'bg-accent-primary/20 text-accent-primary';
  if (!unlocked) {
    statusLabel = 'Locked';
    statusClass = 'bg-white/10 text-white/60';
  } else if (assistant.cooldown_remaining > 0) {
    statusLabel = `Cooldown ${assistant.cooldown_remaining}`;
    statusClass = 'bg-white/10 text-white/70';
  }

  return (
    <div
      className={`flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 ${
        unlocked ? 'bg-white/5' : 'bg-night-900/40'
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-night-900/70 text-xl">
        🔮
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white/90">{assistant.name}</p>
        <p className="truncate text-xs text-white/60">
          {note || assistant.flavor_text || `${assistant.clazz} · Lv ${assistant.level}`}
        </p>
      </div>
      <span
        className={`ml-auto rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${statusClass}`}
      >
        {statusLabel}
      </span>
    </div>
  );
}

export default function StatsPanel({ state }: StatsPanelProps) {
  const assistants = Object.values(state.assistants);
  const assistantNotes = state.assistant_notes ?? {};
  const trendingNations = Object.values(state.nations)
    .sort((a, b) => b.prosperity - a.prosperity)
    .slice(0, 3);

  return (
    <motion.section
      layout
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="glass-panel rounded-3xl p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-white/50">
        <span>Strategic Overview</span>
        <span className="font-medium text-white/60">{getStabilityLabel(state.stability_state)}</span>
      </div>
      <div className="mt-4 grid gap-4">
        <div className="grid grid-cols-1 gap-3 text-[0.75rem] text-white/70 sm:grid-cols-2">
          <div className="rounded-2xl bg-night-900/70 px-4 py-3">
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-white/40">Peace Streak</p>
            <p className="mt-1 text-2xl font-semibold leading-tight text-accent-secondary">{state.peace_streak}</p>
          </div>
          <div className="rounded-2xl bg-night-900/70 px-4 py-3">
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-white/40">Chaos Streak</p>
            <p className="mt-1 text-2xl font-semibold leading-tight text-rose-300">{state.chaos_streak}</p>
          </div>
        </div>
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.25em] text-white/50">Trusted Assistants</p>
          <div className="mt-2 space-y-2">
            {assistants.map((assistant) => (
              <AssistantBadge key={assistant.id} assistant={assistant} note={assistantNotes[assistant.id]} />
            ))}
            {assistants.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 bg-night-900/50 px-4 py-6 text-center text-[0.7rem] text-white/50">
                Assistants will join your cause as you progress.
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.25em] text-white/50">Prosperous Nations</p>
          <div className="mt-3 flex flex-col gap-2">
            {trendingNations.map((nation) => (
              <div
                key={nation.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-night-900/60 px-4 py-3 text-sm text-white/80"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-xl">{getRaceEmoji(nation.primary_race)}</span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{nation.name}</p>
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                      {Math.round(nation.prosperity * 100)}% Prosperity
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[0.65rem] text-white/50">Power {Math.round(nation.power * 100)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
