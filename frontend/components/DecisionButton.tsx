'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';

import { formatDecisionLabel, summarizeChoiceImpact } from '@/lib/formatters';
import type { DecisionKey, GameEventChoice } from '@/types/game';

const choiceColors: Record<DecisionKey, string> = {
  peace: 'from-emerald-400/90 to-teal-400/80',
  hostile: 'from-rose-500/80 to-orange-400/80',
  trade: 'from-amber-400/90 to-yellow-300/80',
};

interface DecisionButtonProps {
  choice: GameEventChoice;
  onSelect: (choice: DecisionKey) => void | Promise<void>;
  disabled?: boolean;
}

export default function DecisionButton({ choice, onSelect, disabled }: DecisionButtonProps) {
  const impact = summarizeChoiceImpact(choice);
  const gradientClass = choiceColors[choice.key] ?? 'from-accent-primary/80 to-accent-secondary/80';

  return (
    <motion.button
      layout
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      disabled={disabled}
      onClick={() => onSelect(choice.key)}
      className={clsx(
        'group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/10 px-5 py-4 text-left text-white shadow-lg transition',
        disabled ? 'opacity-60' : 'hover:border-white/25 hover:shadow-xl',
      )}
    >
      <div className={clsx('absolute inset-0 bg-gradient-to-r opacity-90', gradientClass)} aria-hidden />
      <div className="relative z-10 flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
          {formatDecisionLabel(choice.key)}
        </span>
        <span className="text-base font-medium text-white/90">{choice.label}</span>
        <div className="flex flex-wrap gap-2 text-xs text-white/80">
          {impact.stabilityDelta !== 0 && (
            <span className="rounded-full bg-white/15 px-3 py-1">
              Stability {impact.stabilityDelta > 0 ? '▲' : '▼'} {Math.abs(impact.stabilityDelta * 100).toFixed(0)}%
            </span>
          )}
          {impact.scoreDelta !== 0 && (
            <span className="rounded-full bg-white/15 px-3 py-1">Score {impact.scoreDelta > 0 ? '+' : '-'}{Math.abs(impact.scoreDelta)}</span>
          )}
        </div>
      </div>
      <motion.span
        className="relative z-10 text-2xl opacity-80"
        animate={{ rotate: disabled ? 0 : [0, 5, -5, 0] }}
        transition={{ duration: 2.5, repeat: disabled ? 0 : Infinity, ease: 'easeInOut' }}
      >
        {choice.key === 'peace' ? '🕊️' : choice.key === 'hostile' ? '⚔️' : '🤝'}
      </motion.span>
    </motion.button>
  );
}
