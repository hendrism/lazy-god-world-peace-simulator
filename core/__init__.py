"""Core logic and data models for the Lazy God proof‑of‑concept.

This package contains simple Python classes representing nations, assistants,
events and the overall game state.  The code here is intentionally light‑weight
and deterministic to enable reproducible runs in the CLI and API layers.

The design is inspired by the technical specification provided in the PRD.
"""

from .models import Decision, Nation, Assistant, Event, GameState, StabilityState
from .game import GameEngine

__all__ = [
    "Decision",
    "Nation",
    "Assistant",
    "Event",
    "GameState",
    "StabilityState",
    "GameEngine",
]
