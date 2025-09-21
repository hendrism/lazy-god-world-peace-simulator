import type { DecisionKey, GameEventChoice, StabilityState } from '@/types/game';

export function getRaceEmoji(race: string): string {
  const normalized = race.toLowerCase();
  const mapping: Record<string, string> = {
    elf: '🌿',
    orc: '🛡️',
    human: '🏛️',
    dwarf: '⛏️',
    undead: '💀',
    fae: '🦋',
    lizardfolk: '🦎',
    djinn: '🪔',
    golem: '🗿',
    merfolk: '🌊',
  };
  return mapping[normalized] ?? '🌐';
}

export function getStabilityLabel(state: StabilityState): string {
  switch (state) {
    case 'golden_age':
      return 'Golden Age';
    case 'peaceful':
      return 'Peaceful';
    case 'stable':
      return 'Stable';
    case 'tense':
      return 'Tense';
    case 'chaotic':
      return 'Chaotic';
    default:
      return 'Unknown';
  }
}

export function formatPopulation(population: number): string {
  if (population >= 1_000_000_000) {
    return `${(population / 1_000_000_000).toFixed(1)}B`;
  }
  if (population >= 1_000_000) {
    return `${(population / 1_000_000).toFixed(1)}M`;
  }
  if (population >= 1_000) {
    return `${(population / 1_000).toFixed(1)}K`;
  }
  return population.toString();
}

export function summarizeChoiceImpact(choice: GameEventChoice): {
  stabilityDelta: number;
  scoreDelta: number;
} {
  return choice.effects.reduce(
    (acc, effect) => {
      if (effect.target === 'global' && effect.attribute === 'stability') {
        acc.stabilityDelta += effect.delta;
      }
      if (effect.target === 'score' && effect.attribute === 'points') {
        acc.scoreDelta += effect.delta;
      }
      return acc;
    },
    { stabilityDelta: 0, scoreDelta: 0 },
  );
}

export function formatDecisionLabel(choice: DecisionKey): string {
  return choice.charAt(0).toUpperCase() + choice.slice(1);
}
