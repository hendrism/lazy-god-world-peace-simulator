"""Core game engine for the Lazy God proof‑of‑concept.

The GameEngine class encapsulates the core loop of starting a run, generating
events, resolving player decisions and updating game state.  It is designed
to be deterministic when provided with a seed so that runs can be replayed
and debugged.
"""

from __future__ import annotations

import random
import uuid
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from .models import (
    Nation,
    Race,
    EconomyType,
    Demeanor,
    HiddenTrait,
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
)


class Decision(str, enum.Enum):
    peace = "peace"
    hostile = "hostile"
    trade = "trade"


class GameEngine:
    """Encapsulates the game state and rules.

    The engine maintains a mapping of run_id to game state.  For simplicity
    this proof‑of‑concept keeps everything in memory; a production system
    would persist state in a database.
    """

    def __init__(self, seed: Optional[int] = None) -> None:
        self.rng = random.Random(seed)
        self.active_runs: Dict[str, GameState] = {}

    def _generate_nation(self) -> Nation:
        # Generate a nation with random attributes
        nid = f"nation_{uuid.uuid4().hex[:8]}"
        name = self._make_name()
        race = self.rng.choice(list(Race))
        economy = self.rng.choice(list(EconomyType))
        demeanor = self.rng.choice(list(Demeanor))
        hidden_traits: List[HiddenTrait] = self.rng.sample(
            [
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
            ],
            k=self.rng.randint(1, 3),
        )
        return Nation(
            id=nid,
            name=name,
            primary_race=race,
            economy_type=economy,
            demeanor=demeanor,
            hidden_traits=hidden_traits,
        )

    def _make_name(self) -> str:
        syllables = ["Ar", "Bel", "Cor", "Dor", "El", "Fa", "Gal", "Har", "Iv", "Jar"]
        return self.rng.choice(syllables) + self.rng.choice(syllables) + self.rng.choice(["ia", "on", "en", "ar", "ur"])

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
    ) -> GameState:
        """Initialize a new game run with a set of nations and assistants."""
        run_id = f"run_{uuid.uuid4().hex[:8]}"
        # Generate nations (for proof‑of‑concept we create 6)
        nations = {n.id: n for n in (self._generate_nation() for _ in range(6))}
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
        # Choose two random nations for the event
        nation_ids = self.rng.sample(list(state.nations.keys()), k=2)
        # Compose summary
        summary = f"Encounter between {state.nations[nation_ids[0]].name} and {state.nations[nation_ids[1]].name}."
        # Define generic choices
        choices = [
            EventChoice(
                key="peace",
                label="Broker peace",
                effects=[EventChoiceEffect(target="global", attribute="stability", delta=0.1), EventChoiceEffect(target="score", attribute="points", delta=100.0)],
            ),
            EventChoice(
                key="hostile",
                label="Encourage conflict",
                effects=[EventChoiceEffect(target="global", attribute="stability", delta=-0.2), EventChoiceEffect(target="score", attribute="points", delta=50.0)],
            ),
            EventChoice(
                key="trade",
                label="Promote trade",
                effects=[EventChoiceEffect(target="global", attribute="stability", delta=0.05), EventChoiceEffect(target="score", attribute="points", delta=70.0)],
            ),
        ]
        event = Event(
            id=f"event_{uuid.uuid4().hex[:8]}",
            kind=EventKind.interaction,
            turn=state.turn,
            nations=nation_ids,
            summary=summary,
            choices=choices,
            assistant_influence=list(state.assistants.keys()),
        )
        return event

    def get_state(self, run_id: str) -> Optional[GameState]:
        return self.active_runs.get(run_id)

    def make_decision(self, run_id: str, event_id: str, choice_key: str) -> Tuple[Optional[GameState], Optional[str]]:
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
        choice: Optional[EventChoice] = next((c for c in event.choices if c.key == choice_key), None)
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
        # Update stability and compute new state
        state.stability = max(0.0, min(1.0, round(state.stability + stability_delta, 2)))
        state.score += score_delta
        # Update streaks
        if choice_key == "peace":
            state.peace_streak += 1
            state.chaos_streak = 0
        elif choice_key == "hostile":
            state.chaos_streak += 1
            state.peace_streak = 0
        else:
            # trade resets nothing
            pass
        # Determine stability state
        state.stability_state = self._compute_stability_state(state.stability)
        # Mark event resolved
        event.resolved = True
        event.resolution = EventResolution(
            chosen_key=choice_key,
            stability_delta=stability_delta,
            score_delta=score_delta,
            relation_changes=relation_changes,
            logs=[f"Decision {choice_key} applied. Stability change {stability_delta}, score change {score_delta}."]
        )
        # Advance to next turn if not ended
        state.turn += 1
        # End conditions
        if state.stability <= 0.0:
            state.run_status = "collapsed"
        elif state.turn > state.turn_limit:
            state.run_status = "turn_limit"
        return state, None

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
