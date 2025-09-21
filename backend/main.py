"""FastAPI server for Lazy God proof‑of‑concept.

This module exposes a minimal REST API for managing game runs.  The API
demonstrates how to start a run, advance turns, make decisions and query
the current state.  It uses the in‑memory GameEngine defined in
``core.game``.

Run this server with uvicorn::

    uvicorn backend.main:app --reload

"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from ..core.game import GameEngine


app = FastAPI(title="Lazy God API", version="0.1.0", description="Proof of concept for Lazy God game")

engine = GameEngine()


class StartRunRequest(BaseModel):
    world_theme: str = "classic_fantasy"
    turn_limit: int = 20
    difficulty: str = "normal"


class StartRunResponse(BaseModel):
    run_id: str
    state: dict


@app.post("/run/start", response_model=StartRunResponse)
async def start_run(payload: StartRunRequest):
    state = engine.start_run(
        world_theme=payload.world_theme, turn_limit=payload.turn_limit, difficulty=payload.difficulty
    )
    return StartRunResponse(run_id=state.run_id, state=state.to_dict())


class NextEventResponse(BaseModel):
    event: dict
    state: dict


@app.post("/run/next", response_model=NextEventResponse)
async def next_event(run_id: str):
    event, error = engine.next_turn(run_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    state = engine.get_state(run_id)
    assert state is not None
    return NextEventResponse(event=event.to_dict(), state=state.to_dict())


class DecisionRequest(BaseModel):
    run_id: str
    event_id: str
    choice: str


class DecisionResponse(BaseModel):
    updated_state: dict
    outcome: dict


@app.post("/run/decision", response_model=DecisionResponse)
async def decision(payload: DecisionRequest):
    state, error = engine.make_decision(payload.run_id, payload.event_id, payload.choice)
    if error:
        raise HTTPException(status_code=400, detail=error)
    assert state is not None
    # Return only diff of outcome (resolution) and updated state
    event = state.events_log[-1]
    assert event.resolution is not None
    outcome = {
        "chosen_key": event.resolution.chosen_key,
        "stability_delta": event.resolution.stability_delta,
        "score_delta": event.resolution.score_delta,
        "logs": event.resolution.logs,
    }
    return DecisionResponse(updated_state=state.to_dict(), outcome=outcome)


class StateResponse(BaseModel):
    state: dict


@app.get("/run/state/{run_id}", response_model=StateResponse)
async def get_state(run_id: str):
    state = engine.get_state(run_id)
    if not state:
        raise HTTPException(status_code=404, detail="RUN_NOT_FOUND")
    return StateResponse(state=state.to_dict())
