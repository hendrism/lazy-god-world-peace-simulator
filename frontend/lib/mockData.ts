import type { DecisionKey, GameEvent, GameNation, GameState, StabilityState } from '@/types/game';

const mockNations: GameNation[] = [
  {
    id: 'nation_auria',
    name: 'Auria',
    primary_race: 'Elf',
    economy_type: 'trade',
    demeanor: 'diplomatic',
    hidden_traits: ['star_touched', 'pacifist'],
    relations: {},
    power: 0.64,
    population: 12000000,
    prosperity: 0.82,
    unrest: 0.08,
    last_interaction: 'peace',
  },
  {
    id: 'nation_brakka',
    name: 'Brakka Dominion',
    primary_race: 'Orc',
    economy_type: 'industrial',
    demeanor: 'aggressive',
    hidden_traits: ['iron_legions'],
    relations: {},
    power: 0.78,
    population: 18000000,
    prosperity: 0.54,
    unrest: 0.21,
    last_interaction: 'hostile',
  },
  {
    id: 'nation_celes',
    name: 'Celestial Concord',
    primary_race: 'Human',
    economy_type: 'magic_based',
    demeanor: 'cautious',
    hidden_traits: ['oracle_council'],
    relations: {},
    power: 0.6,
    population: 23000000,
    prosperity: 0.75,
    unrest: 0.13,
    last_interaction: 'trade',
  },
  {
    id: 'nation_draxi',
    name: 'Draxi Swarm',
    primary_race: 'Lizardfolk',
    economy_type: 'resource_rich',
    demeanor: 'chaotic',
    hidden_traits: ['stormborn'],
    relations: {},
    power: 0.69,
    population: 14000000,
    prosperity: 0.48,
    unrest: 0.27,
    last_interaction: 'hostile',
  },
  {
    id: 'nation_eiren',
    name: 'Eiren Monastery',
    primary_race: 'Fae',
    economy_type: 'pastoral',
    demeanor: 'stoic',
    hidden_traits: ['luminous_sages'],
    relations: {},
    power: 0.4,
    population: 9000000,
    prosperity: 0.66,
    unrest: 0.05,
    last_interaction: 'peace',
  },
  {
    id: 'nation_fjord',
    name: 'Fjordheim Clans',
    primary_race: 'Dwarf',
    economy_type: 'industrial',
    demeanor: 'opportunistic',
    hidden_traits: ['rune_forges'],
    relations: {},
    power: 0.71,
    population: 15000000,
    prosperity: 0.58,
    unrest: 0.16,
    last_interaction: 'trade',
  },
];

function buildMockEvent(id: string, summary: string, nations: [string, string], turn: number): GameEvent {
  return {
    id,
    kind: 'interaction',
    turn,
    nations,
    summary,
    assistant_influence: ['assistant_prophet'],
    resolved: false,
    choices: [
      {
        key: 'peace',
        label: 'Broker harmony',
        effects: [
          { target: 'global', attribute: 'stability', delta: 0.12 },
          { target: 'score', attribute: 'points', delta: 120 },
        ],
        constraints: [],
      },
      {
        key: 'hostile',
        label: 'Amplify rivalry',
        effects: [
          { target: 'global', attribute: 'stability', delta: -0.18 },
          { target: 'score', attribute: 'points', delta: 80 },
        ],
        constraints: [],
      },
      {
        key: 'trade',
        label: 'Forge trade pact',
        effects: [
          { target: 'global', attribute: 'stability', delta: 0.05 },
          { target: 'score', attribute: 'points', delta: 90 },
        ],
        constraints: [],
      },
    ],
  };
}

export interface MockSession {
  state: GameState;
  events: GameEvent[];
}

export function createMockSession(): MockSession {
  const baseState: GameState = {
    run_id: 'mock_run',
    turn: 1,
    stability: 0.62,
    stability_state: 'stable',
    score: 360,
    peace_streak: 2,
    chaos_streak: 0,
    nations: Object.fromEntries(mockNations.map((nation) => [nation.id, nation])),
    assistants: {
      assistant_prophet: {
        id: 'assistant_prophet',
        name: 'The Prophet',
        clazz: 'Prophet',
        rarity: 'rare',
        unlocked: true,
        level: 1,
        effect: { type: 'instability_prediction', magnitude: 0.2, charges: 0, duration_turns: 0 },
        cooldown: 3,
        cooldown_remaining: 0,
        flavor_text: 'The Prophet whispers of coming storms.',
      },
    },
    events_log: [],
    world_theme: 'classic_fantasy',
    run_status: 'active',
    turn_limit: 20,
    seed: 1337,
    stability_history: [0.62],
    revealed_traits: Object.fromEntries(mockNations.map((nation) => [nation.id, []])),
    god_quips: [],
  };

  const events: GameEvent[] = [
    buildMockEvent(
      'event_mock_1',
      'Aurian envoys arrive in Brakka seeking a ceasefire.',
      ['nation_auria', 'nation_brakka'],
      1,
    ),
    buildMockEvent(
      'event_mock_2',
      'Celestial mages offer protective wards to the Draxi Swarm.',
      ['nation_celes', 'nation_draxi'],
      2,
    ),
    buildMockEvent(
      'event_mock_3',
      'Fjordheim traders request sanctuary within the Eiren glades.',
      ['nation_fjord', 'nation_eiren'],
      3,
    ),
  ];

  return { state: baseState, events };
}

export function computeStabilityState(stability: number): StabilityState {
  if (stability >= 0.9) return 'golden_age';
  if (stability >= 0.7) return 'peaceful';
  if (stability >= 0.4) return 'stable';
  if (stability >= 0.2) return 'tense';
  return 'chaotic';
}

export function applyMockChoice(
  state: GameState,
  event: GameEvent,
  choice: DecisionKey,
): { updatedState: GameState; outcome: string } {
  const nextState: GameState = {
    ...state,
    events_log: [...state.events_log, { ...event, resolved: true }],
  };

  const previousStabilityState = nextState.stability_state;

  const selectedChoice = event.choices.find((c) => c.key === choice);
  if (!selectedChoice) {
    return {
      updatedState: nextState,
      outcome: 'Choice echoed through the void with no response.',
    };
  }

  let stabilityDelta = 0;
  let scoreDelta = 0;
  selectedChoice.effects.forEach((effect) => {
    if (effect.target === 'global' && effect.attribute === 'stability') {
      stabilityDelta += effect.delta;
    }
    if (effect.target === 'score' && effect.attribute === 'points') {
      scoreDelta += effect.delta;
    }
  });

  const stability = Math.min(1, Math.max(0, Number((nextState.stability + stabilityDelta).toFixed(2))));
  const score = Math.round(nextState.score + scoreDelta);

  const peaceStreak = choice === 'peace' ? nextState.peace_streak + 1 : choice === 'hostile' ? 0 : nextState.peace_streak;
  const chaosStreak = choice === 'hostile' ? nextState.chaos_streak + 1 : choice === 'peace' ? 0 : nextState.chaos_streak;

  const stability_state = computeStabilityState(stability);
  const stability_history = [...nextState.stability_history, stability];
  const god_quips = [...nextState.god_quips];
  if (stability_state !== previousStabilityState) {
    god_quips.push(`The heavens shift to a ${stability_state.replace('_', ' ')} era.`);
  }

  let run_status: GameState['run_status'] = nextState.run_status;
  if (stability <= 0) {
    run_status = 'collapsed';
  } else if (nextState.turn + 1 > nextState.turn_limit) {
    run_status = 'turn_limit';
  }

  const outcomeParts: string[] = [];
  if (stabilityDelta > 0) outcomeParts.push(`Stability rose by ${(stabilityDelta * 100).toFixed(0)}%`);
  if (stabilityDelta < 0) outcomeParts.push(`Stability fell by ${Math.abs(stabilityDelta * 100).toFixed(0)}%`);
  if (scoreDelta) outcomeParts.push(`Score ${scoreDelta > 0 ? 'increased' : 'decreased'} by ${Math.abs(scoreDelta)}`);

  const outcome = outcomeParts.length
    ? outcomeParts.join(' · ')
    : 'The world watches, uncertain of the outcome.';

  return {
    updatedState: {
      ...nextState,
      stability,
      score,
      peace_streak: peaceStreak,
      chaos_streak: chaosStreak,
      stability_state,
      stability_history,
      god_quips,
      turn: nextState.turn + 1,
      run_status,
    },
    outcome,
  };
}
