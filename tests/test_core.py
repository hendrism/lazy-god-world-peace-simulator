import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from core.game import GameEngine
from core.models import Decision, StabilityState


def test_run_generates_event_and_updates_state():
    engine = GameEngine(seed=123)
    state = engine.start_run(seed=123)
    run_id = state.run_id

    assert len(state.nations) >= 8
    assert all(n.archetype for n in state.nations.values())
    assert state.seed == 123
    assert "assistant_prophet" in state.assistants
    assert state.assistants["assistant_prophet"].unlocked is True
    assert "assistant_diplomat" in state.assistants
    assert state.assistants["assistant_diplomat"].unlocked is False
    assert "assistant_prophet" in state.assistant_notes

    event, error = engine.next_turn(run_id)
    assert error is None
    assert event is not None
    assert event.template_key
    assert event.tags

    updated_state, error = engine.make_decision(run_id, event.id, Decision.peace)
    assert error is None
    assert updated_state is not None
    assert 0.0 <= updated_state.stability <= 1.0
    assert updated_state.score >= 0
    assert updated_state.stability_history[-1] == updated_state.stability
    assert updated_state.events_log[-1].resolution is not None
    assert any(log.startswith("Punchline") for log in updated_state.events_log[-1].resolution.logs)
    assert "assistant_prophet" in updated_state.assistant_notes


def test_stability_transitions_cover_thresholds():
    engine = GameEngine(seed=42)
    assert engine._compute_stability_state(0.95) == StabilityState.golden_age
    assert engine._compute_stability_state(0.75) == StabilityState.peaceful
    assert engine._compute_stability_state(0.5) == StabilityState.stable
    assert engine._compute_stability_state(0.25) == StabilityState.tense
    assert engine._compute_stability_state(0.05) == StabilityState.chaotic


def test_deterministic_seed_produces_matching_events():
    engine_one = GameEngine(seed=99)
    engine_two = GameEngine(seed=99)

    state_one = engine_one.start_run(seed=2024)
    state_two = engine_two.start_run(seed=2024)

    event_one, _ = engine_one.next_turn(state_one.run_id)
    event_two, _ = engine_two.next_turn(state_two.run_id)

    assert event_one is not None and event_two is not None
    assert event_one.summary == event_two.summary
    assert event_one.template_key == event_two.template_key


def test_peace_streak_triggers_trait_reveal():
    engine = GameEngine(seed=7)
    state = engine.start_run(seed=7)
    run_id = state.run_id

    for _ in range(3):
        event, _ = engine.next_turn(run_id)
        assert event is not None
        state, error = engine.make_decision(run_id, event.id, Decision.peace)
        assert error is None
        assert state is not None

    assert any(traits for traits in state.revealed_traits.values())
    assert state.peace_streak >= 3 or state.chaos_streak == 0
    assert state.god_quips


def test_diplomat_unlocks_and_grants_bonus():
    engine = GameEngine(seed=21)
    state = engine.start_run(seed=21)
    run_id = state.run_id

    # Apply a hostile decision to keep stability from reaching the cap later.
    event, _ = engine.next_turn(run_id)
    assert event is not None
    state, error = engine.make_decision(run_id, event.id, Decision.hostile)
    assert error is None
    assert state is not None
    assert state.assistants["assistant_diplomat"].unlocked is False

    # Chain peace decisions to unlock the diplomat.
    last_event = None
    for _ in range(5):
        event, _ = engine.next_turn(run_id)
        assert event is not None
        last_event = event
        state, error = engine.make_decision(run_id, event.id, Decision.peace)
        assert error is None
        assert state is not None

    diplomat = state.assistants["assistant_diplomat"]
    assert diplomat.unlocked is True
    assert diplomat.cooldown_remaining == 0
    assert last_event is not None
    resolution = state.events_log[-1].resolution
    assert resolution is not None
    assert any("Assistant unlocked" in log for log in resolution.logs)

    # The next peace decision should trigger the diplomat bonus.
    event, _ = engine.next_turn(run_id)
    assert event is not None
    state, error = engine.make_decision(run_id, event.id, Decision.peace)
    assert error is None
    assert state is not None
    resolution = state.events_log[-1].resolution
    assert resolution is not None
    assert any("smooths tensions" in log for log in resolution.logs)
    diplomat = state.assistants["assistant_diplomat"]
    assert diplomat.cooldown_remaining == diplomat.cooldown
    assert "Diplomat" in state.assistant_notes["assistant_diplomat"]
