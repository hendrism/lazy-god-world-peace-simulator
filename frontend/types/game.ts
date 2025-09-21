export type StabilityState = 'golden_age' | 'peaceful' | 'stable' | 'tense' | 'chaotic';
export type RunStatus = 'active' | 'won' | 'collapsed' | 'turn_limit' | string;
export type DecisionKey = 'peace' | 'hostile' | 'trade' | (string & {});

export interface GameNation {
  id: string;
  name: string;
  primary_race: string;
  economy_type: string;
  demeanor: string;
  hidden_traits: string[];
  relations: Record<string, string>;
  power: number;
  population: number;
  prosperity: number;
  unrest: number;
  last_interaction: string;
}

export interface GameAssistantEffect {
  type: string;
  magnitude: number;
  charges: number;
  duration_turns: number;
}

export interface GameAssistant {
  id: string;
  name: string;
  clazz: string;
  rarity: string;
  unlocked: boolean;
  level: number;
  effect: GameAssistantEffect;
  cooldown: number;
  cooldown_remaining: number;
  flavor_text: string;
}

export interface GameEventChoiceEffect {
  target: string;
  attribute: string;
  delta: number;
}

export interface GameEventChoice {
  key: DecisionKey;
  label: string;
  effects: GameEventChoiceEffect[];
  constraints: string[];
}

export interface GameEventResolution {
  chosen_key: DecisionKey;
  stability_delta: number;
  score_delta: number;
  relation_changes: Array<{ a: string; b: string; new_status: string }>;
  logs: string[];
}

export interface GameEvent {
  id: string;
  kind: string;
  turn: number;
  nations: string[];
  summary: string;
  choices: GameEventChoice[];
  assistant_influence: string[];
  resolved: boolean;
  resolution?: GameEventResolution;
  rng_seed?: number;
}

export interface GameState {
  run_id: string;
  turn: number;
  stability: number;
  stability_state: StabilityState;
  score: number;
  peace_streak: number;
  chaos_streak: number;
  nations: Record<string, GameNation>;
  assistants: Record<string, GameAssistant>;
  events_log: GameEvent[];
  world_theme: string;
  run_status: RunStatus;
  turn_limit: number;
}

export interface StartRunResponse {
  run_id: string;
  state: GameState;
}

export interface NextEventResponse {
  event: GameEvent;
  state: GameState;
}

export interface DecisionResponse {
  state: GameState;
  outcome_summary: string;
}
