"""Persistent profile storage for Lazy God meta progression."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from core.models import Event, GameState


@dataclass
class PlayerProfile:
    """Dataclass describing the persisted player progression."""

    total_runs: int = 0
    victories: int = 0
    collapses: int = 0
    highest_score: int = 0
    best_stability: float = 0.0
    rare_events_seen: List[str] = field(default_factory=list)
    unlocked_assistants: Dict[str, bool] = field(
        default_factory=lambda: {"assistant_prophet": True}
    )
    last_run: Optional[Dict[str, Any]] = None
    last_unlocks: List[str] = field(default_factory=list)

    def to_summary(self) -> Dict[str, Any]:
        return {
            "total_runs": self.total_runs,
            "victories": self.victories,
            "collapses": self.collapses,
            "highest_score": self.highest_score,
            "best_stability": round(self.best_stability, 3),
            "rare_events_seen": list(self.rare_events_seen),
            "unlocked_assistants": dict(self.unlocked_assistants),
            "last_run": self.last_run,
            "last_unlocks": list(self.last_unlocks),
        }


class ProfileStore:
    """Load and persist player profile data to a JSON file."""

    def __init__(self, path: Optional[Path] = None) -> None:
        self.path = path or Path(__file__).resolve().parent / "player_profile.json"
        self._profile = self._load()

    def _load(self) -> PlayerProfile:
        if not self.path.exists():
            return PlayerProfile()
        try:
            data = json.loads(self.path.read_text())
        except json.JSONDecodeError:
            return PlayerProfile()
        return self._from_dict(data)

    def _from_dict(self, data: Dict[str, Any]) -> PlayerProfile:
        unlocked = data.get("unlocked_assistants", {})
        if "assistant_prophet" not in unlocked:
            unlocked["assistant_prophet"] = True
        profile = PlayerProfile(
            total_runs=data.get("total_runs", 0),
            victories=data.get("victories", 0),
            collapses=data.get("collapses", 0),
            highest_score=data.get("highest_score", 0),
            best_stability=data.get("best_stability", 0.0),
            rare_events_seen=list(dict.fromkeys(data.get("rare_events_seen", []))),
            unlocked_assistants=unlocked,
            last_run=data.get("last_run"),
            last_unlocks=data.get("last_unlocks", []),
        )
        return profile

    def _save(self) -> None:
        self.path.write_text(json.dumps(asdict(self._profile), indent=2))

    def get_summary(self) -> Dict[str, Any]:
        return self._profile.to_summary()

    def unlocked_flags(self) -> Dict[str, bool]:
        flags = dict(self._profile.unlocked_assistants)
        if "assistant_prophet" not in flags:
            flags["assistant_prophet"] = True
        return flags

    def ingest_resolution(self, state: GameState, event: Optional[Event]) -> Dict[str, Any]:
        """Update the profile with details from the resolved state."""

        updated = False
        new_unlocks: List[str] = []
        for assistant in state.assistants.values():
            if assistant.unlocked and not self._profile.unlocked_assistants.get(assistant.id):
                self._profile.unlocked_assistants[assistant.id] = True
                new_unlocks.append(assistant.name)
                updated = True
        if new_unlocks:
            self._profile.last_unlocks = new_unlocks
        elif state.run_status != "active":
            self._profile.last_unlocks = []
        if event and "rare" in event.tags:
            if event.template_key not in self._profile.rare_events_seen:
                self._profile.rare_events_seen.append(event.template_key)
                updated = True
        if state.run_status != "active":
            self._profile.total_runs += 1
            if state.run_status == "won":
                self._profile.victories += 1
            elif state.run_status == "collapsed":
                self._profile.collapses += 1
            self._profile.highest_score = max(self._profile.highest_score, state.score)
            self._profile.best_stability = max(self._profile.best_stability, state.stability)
            last_run = {
                "run_id": state.run_id,
                "score": state.score,
                "stability": round(state.stability, 3),
                "stability_state": state.stability_state.value,
                "turns": state.turn,
                "result": state.run_status,
                "seed": state.seed,
                "ended_at": datetime.utcnow().isoformat() + "Z",
            }
            if event:
                last_run["last_event"] = event.template_key
            self._profile.last_run = last_run
            updated = True
        if updated:
            self._save()
        return self._profile.to_summary()


PROFILE_STORE = ProfileStore()
