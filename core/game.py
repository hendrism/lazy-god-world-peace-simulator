"""Core game engine for the Lazy God proof‑of‑concept.

The GameEngine class encapsulates the core loop of starting a run, generating
events, resolving player decisions and updating game state.  It is designed
to be deterministic when provided with a seed so that runs can be replayed
and debugged.
"""

from __future__ import annotations

import random
import uuid
from typing import Dict, List, Optional, Tuple, Union

from .models import (
    Nation,
    Race,
    EconomyType,
    Demeanor,
    Assistant,
    AssistantClass,
    AssistantEffect,
    Event,
    EventKind,
    EventChoice,
    EventChoiceEffect,
    EventResolution,
    GameState,
    StabilityState,
    Decision,
)

from .content import EVENT_TEMPLATES, NATION_ARCHETYPES, EventTemplate, NationArchetype


GOD_QUIPS = {
    StabilityState.golden_age: "Behold! Mortals write musicals about your benevolence.",
    StabilityState.peaceful: "A serene hum blankets the world—don't nap through it.",
    StabilityState.stable: "Steady as a cosmic sofa. Comfortable, but keep an eye open.",
    StabilityState.tense: "You can almost hear the tea cups rattling. Maybe intervene?",
    StabilityState.chaotic: "Fires everywhere. Some metaphorical, some disappointingly real.",
}


class GameEngine:
    """Encapsulates the game state and rules.

    The engine maintains a mapping of run_id to game state.  For simplicity
    this proof‑of‑concept keeps everything in memory; a production system
    would persist state in a database.
    """

    def __init__(self, seed: Optional[int] = None) -> None:
        self.seed = seed if seed is not None else random.randint(1, 1_000_000)
        self.rng = random.Random(self.seed)
        self.active_runs: Dict[str, GameState] = {}
        self.run_rngs: Dict[str, random.Random] = {}

    def _generate_nation(self, run_id: str, archetype: NationArchetype) -> Nation:
        run_rng = self.run_rngs[run_id]
        nid = f"nation_{run_rng.getrandbits(32):08x}"
        name = self._make_name(run_rng, archetype)
        prosperity = round(run_rng.uniform(*archetype.prosperity_range), 2)
        unrest = round(run_rng.uniform(*archetype.unrest_range), 2)
        power = round(run_rng.uniform(*archetype.power_range), 2)
        population = run_rng.randint(15_000, 90_000_000)
        base_traits = list(archetype.hidden_traits)
        optional_traits = [
            "blood_feud",
            "xenophile",
            "zealot",
            "isolationist",
            "mercantile",
            "mystic",
            "martial_culture",
            "expansionist",
            "pacifist",
            "plutocracy",
            "festival_culture",
            "storm_riders",
            "shadow_brokers",
        ]
        # ensure optional traits differ from base ones
        extra_choices = [t for t in optional_traits if t not in base_traits]
        run_rng.shuffle(extra_choices)
        hidden_traits: List[HiddenTrait] = base_traits + extra_choices[: max(0, 3 - len(base_traits))]
        return Nation(
            id=nid,
            name=name,
            archetype=archetype.key,
            primary_race=archetype.race,
            economy_type=archetype.economy,
            demeanor=archetype.demeanor,
            hidden_traits=hidden_traits,
            power=power,
            population=population,
            prosperity=prosperity,
            unrest=unrest,
        )

    def _make_name(self, run_rng: random.Random, archetype: NationArchetype) -> str:
        prefix = run_rng.choice(archetype.name_prefixes)
        suffix = run_rng.choice(archetype.name_suffixes)
        joiner = " " if run_rng.random() > 0.5 else ""
        return prefix + joiner + suffix

    def _generate_assistant(self) -> Assistant:
        # For now, return a Prophet assistant at level 1
        return Assistant(
            id="assistant_prophet",
            name="The Prophet",
            clazz=AssistantClass.prophet,
            rarity="rare",
            unlocked=True,
            level=1,
            effect=AssistantEffect(type="instability_prediction", magnitude=0.2),
            cooldown=3,
            flavor_text="The Prophet whispers of coming storms.",
        )

    def start_run(
        self,
        world_theme: str = "classic_fantasy",
        turn_limit: int = 20,
        difficulty: str = "normal",
        seed: Optional[int] = None,
    ) -> GameState:
        """Initialize a new game run with a set of nations and assistants."""
        run_id = f"run_{uuid.uuid4().hex[:8]}"
        run_seed = seed if seed is not None else self.rng.randint(1, 9_999_999)
        self.run_rngs[run_id] = random.Random(run_seed)
        # Generate nations from curated archetypes
        run_rng = self.run_rngs[run_id]
        archetypes = run_rng.sample(NATION_ARCHETYPES, k=min(8, len(NATION_ARCHETYPES)))
        nations = {}
        for archetype in archetypes:
            nation = self._generate_nation(run_id, archetype)
            nations[nation.id] = nation
        # A single unlocked assistant
        assistants = {"assistant_prophet": self._generate_assistant()}
        state = GameState(
            run_id=run_id,
            turn=1,
            stability=0.5,
            stability_state=StabilityState.stable,
            score=0,
            peace_streak=0,
            chaos_streak=0,
            nations=nations,
            assistants=assistants,
            events_log=[],
            world_theme=world_theme,
            run_status="active",
            turn_limit=turn_limit,
            seed=run_seed,
            stability_history=[0.5],
            revealed_traits={nid: [] for nid in nations},
            god_quips=[],
        )
        self.active_runs[run_id] = state
        return state

    def _compute_stability_state(self, stability: float) -> StabilityState:
        if stability >= 0.9:
            return StabilityState.golden_age
        elif stability >= 0.7:
            return StabilityState.peaceful
        elif stability >= 0.4:
            return StabilityState.stable
        elif stability >= 0.2:
            return StabilityState.tense
        else:
            return StabilityState.chaotic

    def _generate_event(self, state: GameState) -> Event:
        run_rng = self.run_rngs[state.run_id]
        # Choose two random nations for the event
        nation_ids = run_rng.sample(list(state.nations.keys()), k=2)
        template = run_rng.choice(EVENT_TEMPLATES)
        name_a = state.nations[nation_ids[0]].name
        name_b = state.nations[nation_ids[1]].name
        summary = template.summary_template.format(a=name_a, b=name_b)
        choices = self._build_choices_from_template(template)
        event = Event(
            id=f"event_{run_rng.getrandbits(32):08x}",
            kind=template.kind,
            turn=state.turn,
            nations=nation_ids,
            summary=summary,
            choices=choices,
            template_key=template.key,
            tags=list(template.tags),
            assistant_influence=list(state.assistants.keys()),
            rng_seed=run_rng.randint(0, 10_000),
        )
        return event

    def _build_choices_from_template(self, template: EventTemplate) -> List[EventChoice]:
        return [
            EventChoice(key="peace", label="Champion cooperation", effects=list(template.peace_effects)),
            EventChoice(key="hostile", label="Apply divine pressure", effects=list(template.hostile_effects)),
            EventChoice(key="trade", label="Broker clever trade", effects=list(template.trade_effects)),
        ]

    def get_state(self, run_id: str) -> Optional[GameState]:
        return self.active_runs.get(run_id)

    def make_decision(
        self, run_id: str, event_id: str, choice_key: Union[str, Decision]
    ) -> Tuple[Optional[GameState], Optional[str]]:
        """Resolve a decision for a given event and update game state.

        Returns a tuple (updated_state, error_message).  If error_message is not None,
        no state update is performed.
        """
        state = self.active_runs.get(run_id)
        if state is None:
            return None, "RUN_NOT_FOUND"
        # Find the event in the log (events are appended).  For this simple impl
        # we assume the last event is the one awaiting resolution.
        if not state.events_log:
            return None, "NO_ACTIVE_EVENT"
        event = state.events_log[-1]
        if event.id != event_id:
            return None, "EVENT_ID_MISMATCH"
        if event.resolved:
            return None, "EVENT_ALREADY_RESOLVED"
        # Validate choice
        choice_key_value = choice_key.value if isinstance(choice_key, Decision) else choice_key
        choice: Optional[EventChoice] = next((c for c in event.choices if c.key == choice_key_value), None)
        if not choice:
            return None, "INVALID_CHOICE"
        # Apply effects
        stability_delta = 0.0
        score_delta = 0
        relation_changes: List[Tuple[str, str, str]] = []
        logs: List[str] = []
        for effect in choice.effects:
            if effect.target == "global" and effect.attribute == "stability":
                stability_delta += effect.delta
            elif effect.target == "score" and effect.attribute == "points":
                score_delta += int(effect.delta)
        previous_stability_state = state.stability_state
        # Update stability and compute new state
        state.stability = max(0.0, min(1.0, round(state.stability + stability_delta, 3)))
        state.score += score_delta
        # Update streaks
        if choice_key_value == Decision.peace.value:
            state.peace_streak += 1
            state.chaos_streak = 0
        elif choice_key_value == Decision.hostile.value:
            state.chaos_streak += 1
            state.peace_streak = 0
        else:
            # trade resets nothing
            pass
        streak_logs: List[str] = []
        if state.peace_streak and state.peace_streak % 3 == 0:
            bonus = 75
            state.score += bonus
            streak_logs.append(f"Peace streak of {state.peace_streak}! Bonus score +{bonus}.")
            reveal = self._reveal_hidden_trait(state, event.nations)
            if reveal:
                streak_logs.append(reveal)
        if state.chaos_streak and state.chaos_streak % 3 == 0:
            penalty = 40
            state.score = max(0, state.score - penalty)
            streak_logs.append(f"Chaos streak of {state.chaos_streak}. Divine cleanup tax -{penalty}.")
        # Determine stability state
        state.stability_state = self._compute_stability_state(state.stability)
        state.stability_history.append(state.stability)
        quip = None
        if state.stability_state != previous_stability_state:
            quip = GOD_QUIPS[state.stability_state]
            state.god_quips.append(quip)
        # Prophet hint on positive stability swing
        hint: Optional[str] = None
        if stability_delta > 0 and "assistant_prophet" in state.assistants:
            hint = self._reveal_hidden_trait(state, event.nations)
        resolution_logs = [
            f"Decision {choice_key_value} applied. Stability change {stability_delta:+.2f}, score change {score_delta:+d}."
        ]
        if streak_logs:
            resolution_logs.extend(streak_logs)
        if quip:
            resolution_logs.append(f"God quip: {quip}")
        if hint:
            resolution_logs.append(hint)
        resolution_logs.append("Punchline: " + self._derive_punchline(event))
        # Mark event resolved
        event.resolved = True
        event.resolution = EventResolution(
            chosen_key=choice_key_value,
            stability_delta=stability_delta,
            score_delta=score_delta,
            relation_changes=relation_changes,
            logs=resolution_logs,
        )
        # Advance to next turn if not ended
        state.turn += 1
        # End conditions
        if state.stability <= 0.0:
            state.run_status = "collapsed"
        elif state.turn > state.turn_limit:
            state.run_status = "turn_limit"
        return state, None

    def _derive_punchline(self, event: Event) -> str:
        if event.template_key:
            for template in EVENT_TEMPLATES:
                if template.key == event.template_key:
                    return template.punchline
        summary = event.summary
        # Attempt to match the template punchline based on key prefix
        for template in EVENT_TEMPLATES:
            if summary.startswith(template.summary_template.split("{", 1)[0]):
                return template.punchline
        return "The gods shrug enigmatically."

    def _reveal_hidden_trait(self, state: GameState, nation_ids: List[str]) -> Optional[str]:
        run_rng = self.run_rngs[state.run_id]
        candidates: List[Tuple[str, str]] = []
        for nid in nation_ids:
            known = set(state.revealed_traits[nid])
            hidden = [trait for trait in state.nations[nid].hidden_traits if trait not in known]
            if hidden:
                trait = run_rng.choice(hidden)
                candidates.append((nid, trait))
        if not candidates:
            return None
        nid, trait = run_rng.choice(candidates)
        state.revealed_traits[nid].append(trait)
        nation_name = state.nations[nid].name
        readable_trait = trait.replace("_", " ")
        return f"Prophet reveals that {nation_name} hides the trait: {readable_trait}."

    def next_turn(self, run_id: str) -> Tuple[Optional[Event], Optional[str]]:
        """Advance the run by generating a new event if possible.

        Returns (event, error_message).  If no error_message, event will be created and logged.
        """
        state = self.active_runs.get(run_id)
        if state is None:
            return None, "RUN_NOT_FOUND"
        if state.run_status != "active":
            return None, "RUN_ENDED"
        # If there is a pending unresolved event, do not create a new one
        if state.events_log and not state.events_log[-1].resolved:
            return None, "EVENT_PENDING"
        # Generate a new event and append to log
        event = self._generate_event(state)
        state.events_log.append(event)
        return event, None

    def end_run(self, run_id: str, reason: str) -> dict:
        state = self.active_runs.get(run_id)
        if not state:
            return {"run_id": run_id, "reason": "RUN_NOT_FOUND", "final_score": 0}
        state.run_status = reason
        summary = {
            "run_id": run_id,
            "reason": reason,
            "final_score": state.score,
            "turns_played": state.turn,
            "stability": state.stability,
        }
        return summary
