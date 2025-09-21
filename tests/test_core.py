import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from core.game import GameEngine
from core.models import Decision, StabilityState


def test_run_generates_event_and_updates_state():
    engine = GameEngine(seed=123)
    state = engine.start_run()
    run_id = state.run_id

    event, error = engine.next_turn(run_id)
    assert error is None
    assert event is not None

    updated_state, error = engine.make_decision(run_id, event.id, Decision.peace)
    assert error is None
    assert updated_state is not None
    assert 0.0 <= updated_state.stability <= 1.0
    assert updated_state.score >= 0


def test_stability_transitions_cover_thresholds():
    engine = GameEngine(seed=42)
    assert engine._compute_stability_state(0.95) == StabilityState.golden_age
    assert engine._compute_stability_state(0.75) == StabilityState.peaceful
    assert engine._compute_stability_state(0.5) == StabilityState.stable
    assert engine._compute_stability_state(0.25) == StabilityState.tense
    assert engine._compute_stability_state(0.05) == StabilityState.chaotic
