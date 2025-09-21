'use client';

import { motion } from 'framer-motion';

import { formatPopulation, getRaceEmoji } from '@/lib/formatters';
import type { GameEvent, GameNation } from '@/types/game';

interface EventCardProps {
  event: GameEvent;
  nations: Record<string, GameNation>;
  isProcessing: boolean;
}

function NationPanel({ nation }: { nation: GameNation }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
      <div className="text-3xl drop-shadow">{getRaceEmoji(nation.primary_race)}</div>
      <p className="mt-3 text-base font-semibold">{nation.name}</p>
      <p className="text-xs uppercase tracking-[0.25em] text-white/40">{nation.primary_race}</p>
      <div className="mt-3 grid w-full grid-cols-2 gap-2 text-[0.7rem] text-white/70">
        <div className="rounded-lg bg-night-900/70 px-2 py-1">
          <p className="font-semibold text-white/80">{formatPopulation(nation.population)}</p>
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">Citizens</p>
        </div>
        <div className="rounded-lg bg-night-900/70 px-2 py-1">
          <p className="font-semibold text-white/80">{Math.round(nation.prosperity * 100)}%</p>
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">Prosperity</p>
        </div>
      </div>
    </div>
  );
}

export default function EventCard({ event, nations, isProcessing }: EventCardProps) {
  const [firstNation, secondNation] = event.nations.map((id) => nations[id]).filter(Boolean);

  return (
    <motion.section
      key={event.id}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="glass-panel rounded-3xl p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-accent-secondary/90">Turn Event</p>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-white/60">
          {event.kind}
        </span>
      </div>
      <h2 className="mt-3 text-lg font-semibold text-white/90">{event.summary}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {firstNation && <NationPanel nation={firstNation} />}
        {secondNation && <NationPanel nation={secondNation} />}
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-night-900/80 px-4 py-3 text-xs text-white/70">
        <p className="font-semibold uppercase tracking-[0.25em] text-white/40">Divine Insight</p>
        <p className="mt-1 leading-relaxed">
          {isProcessing
            ? 'Intervention in progress… interpreting the ripples across the astral sea.'
            : 'Choose how to guide these nations. Your influence will echo across prosperity and conflict.'}
        </p>
      </div>
    </motion.section>
  );
}
