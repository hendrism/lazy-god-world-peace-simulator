import json
from pathlib import Path

import jsonschema

from core.game import GameEngine
from core.models import Decision


SCHEMA_DIR = Path(__file__).resolve().parents[1] / "docs" / "schemas"


def _load_schema_store():
    store = {}
    for path in SCHEMA_DIR.glob("*.json"):
        schema = json.loads(path.read_text())
        if "$id" in schema:
            store[schema["$id"]] = schema
    return store


def test_gamestate_schema_accepts_engine_payload():
    store = _load_schema_store()
    gamestate_schema = store["gamestate.schema.json"]
    resolver = jsonschema.RefResolver.from_schema(gamestate_schema, store=store)

    engine = GameEngine(seed=55)
    state = engine.start_run(seed=55)
    run_id = state.run_id
    event, _ = engine.next_turn(run_id)
    assert event is not None
    state, error = engine.make_decision(run_id, event.id, Decision.peace)
    assert error is None
    assert state is not None

    jsonschema.Draft7Validator(gamestate_schema, resolver=resolver).validate(state.to_dict())


def test_event_schema_accepts_pending_event():
    store = _load_schema_store()
    event_schema = store["event.schema.json"]
    resolver = jsonschema.RefResolver.from_schema(event_schema, store=store)

    engine = GameEngine(seed=101)
    state = engine.start_run(seed=2025)
    run_id = state.run_id
    event, error = engine.next_turn(run_id)
    assert error is None
    assert event is not None

    jsonschema.Draft7Validator(event_schema, resolver=resolver).validate(event.to_dict())
