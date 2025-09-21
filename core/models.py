"""Data models for the Lazy God proof‑of‑concept.

This module defines simple dataclasses for the core entities used in the game.
The fields loosely follow the design described in the high‑level specification,
but many attributes are optional or simplified for the sake of brevity.
"""

from __future__ import annotations

import enum
import random
import uuid
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple


class Race(str, enum.Enum):
    elf = "Elf"
    orc = "Orc"
    human = "Human"
    dwarf = "Dwarf"
    undead = "Undead"
    fae = "Fae"
    lizardfolk = "Lizardfolk"
    djinn = "Djinn"
    golem = "Golem"
    merfolk = "Merfolk"


class EconomyType(str, enum.Enum):
    trade = "trade"
    resource_rich = "resource_rich"
    subsistence = "subsistence"
    magic_based = "magic_based"
    industrial = "industrial"
    pastoral = "pastoral"


class Demeanor(str, enum.Enum):
    aggressive = "aggressive"
    cautious = "cautious"
    diplomatic = "diplomatic"
    chaotic = "chaotic"
    stoic = "stoic"
    opportunistic = "opportunistic"


class StabilityState(str, enum.Enum):
    golden_age = "golden_age"
    peaceful = "peaceful"
    stable = "stable"
    tense = "tense"
    chaotic = "chaotic"


class Decision(str, enum.Enum):
    peace = "peace"
    hostile = "hostile"
    trade = "trade"


HiddenTrait = str  # for simplicity; would be enum in full implementation
RelationStatus = str  # neutral, allied, hostile, trading, etc.


@dataclass
class Nation:
    id: str
    name: str
    archetype: str
    primary_race: Race
    economy_type: EconomyType
    demeanor: Demeanor
    hidden_traits: List[HiddenTrait]
    relations: Dict[str, RelationStatus] = field(default_factory=dict)
    power: float = field(default_factory=lambda: round(random.random(), 2))
    population: int = field(default_factory=lambda: random.randint(10_000, 50_000_000))
    prosperity: float = field(default_factory=lambda: round(random.uniform(0.1, 0.9), 2))
    unrest: float = field(default_factory=lambda: round(random.uniform(0.0, 0.3), 2))
    last_interaction: str = "none"

    def to_dict(self) -> dict:
        return asdict(self)


class AssistantClass(str, enum.Enum):
    diplomat = "Diplomat"
    prophet = "Prophet"
    spy_network = "SpyNetwork"
    peacekeeper = "Peacekeeper"
    court_mage = "CourtMage"


@dataclass
class AssistantEffect:
    type: str
    magnitude: float
    charges: int = 0
    duration_turns: int = 0


@dataclass
class Assistant:
    id: str
    name: str
    clazz: AssistantClass
    rarity: str
    unlocked: bool
    level: int
    effect: AssistantEffect
    cooldown: int
    cooldown_remaining: int = 0
    flavor_text: str = ""

    def to_dict(self) -> dict:
        d = asdict(self)
        # convert nested AssistantEffect
        d["effect"] = asdict(self.effect)
        return d


class EventKind(str, enum.Enum):
    interaction = "interaction"
    disaster = "disaster"
    prophecy = "prophecy"
    random = "random"
    tech_magic = "tech_magic"


@dataclass
class EventChoiceEffect:
    target: str  # global, nation, relation, streak, score
    attribute: str
    delta: float


@dataclass
class EventChoice:
    key: str  # peace, hostile, trade, etc.
    label: str
    effects: List[EventChoiceEffect]
    constraints: List[str] = field(default_factory=list)


@dataclass
class EventResolution:
    chosen_key: str
    stability_delta: float
    score_delta: int
    relation_changes: List[Tuple[str, str, RelationStatus]]
    logs: List[str]


@dataclass
class Event:
    id: str
    kind: EventKind
    turn: int
    nations: List[str]
    summary: str
    choices: List[EventChoice]
    template_key: str = ""
    tags: List[str] = field(default_factory=list)
    assistant_influence: List[str] = field(default_factory=list)
    resolved: bool = False
    resolution: Optional[EventResolution] = None
    rng_seed: int = field(default_factory=lambda: random.randint(0, 10_000))

    def to_dict(self) -> dict:
        d = asdict(self)
        # Convert complex nested types to serializable forms
        d["kind"] = self.kind.value
        d["choices"] = [
            {
                "key": c.key,
                "label": c.label,
                "effects": [asdict(e) for e in c.effects],
                "constraints": c.constraints,
            }
            for c in self.choices
        ]
        if self.resolution:
            d["resolution"] = {
                "chosen_key": self.resolution.chosen_key,
                "stability_delta": self.resolution.stability_delta,
                "score_delta": self.resolution.score_delta,
                "relation_changes": [
                    {"a": a, "b": b, "new_status": status} for a, b, status in self.resolution.relation_changes
                ],
                "logs": self.resolution.logs,
            }
        return d


@dataclass
class GameState:
    run_id: str
    turn: int
    stability: float
    stability_state: StabilityState
    score: int
    peace_streak: int
    chaos_streak: int
    nations: Dict[str, Nation]
    assistants: Dict[str, Assistant]
    events_log: List[Event]
    world_theme: str
    run_status: str  # active, won, collapsed, turn_limit
    turn_limit: int
    seed: int
    stability_history: List[float]
    revealed_traits: Dict[str, List[str]]
    god_quips: List[str]
    assistant_notes: Dict[str, str]

    def to_dict(self) -> dict:
        return {
            "run_id": self.run_id,
            "turn": self.turn,
            "stability": self.stability,
            "stability_state": self.stability_state.value,
            "score": self.score,
            "peace_streak": self.peace_streak,
            "chaos_streak": self.chaos_streak,
            "nations": {nid: n.to_dict() for nid, n in self.nations.items()},
            "assistants": {aid: a.to_dict() for aid, a in self.assistants.items()},
            "events_log": [e.to_dict() for e in self.events_log],
            "world_theme": self.world_theme,
            "run_status": self.run_status,
            "turn_limit": self.turn_limit,
            "seed": self.seed,
            "stability_history": self.stability_history,
            "revealed_traits": self.revealed_traits,
            "god_quips": self.god_quips,
            "assistant_notes": self.assistant_notes,
        }
