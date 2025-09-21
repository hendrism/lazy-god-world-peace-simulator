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

from core.game import GameEngine
from core.models import Decision


app = FastAPI(title="Lazy God API", version="0.1.0", description="Proof of concept for Lazy God game")

engine = GameEngine()


class StartRunRequest(BaseModel):
    world_theme: str = "classic_fantasy"
    turn_limit: int = 20
    difficulty: str = "normal"
    seed: int | None = None


class StartRunResponse(BaseModel):
    run_id: str
    state: dict


@app.post("/runs/start", response_model=StartRunResponse)
async def start_run(payload: StartRunRequest):
    state = engine.start_run(
        world_theme=payload.world_theme,
        turn_limit=payload.turn_limit,
        difficulty=payload.difficulty,
        seed=payload.seed,
    )
    return StartRunResponse(run_id=state.run_id, state=state.to_dict())


class NextEventResponse(BaseModel):
    event: dict
    state: dict


@app.post("/runs/{run_id}/next", response_model=NextEventResponse)
async def next_event(run_id: str):
    event, error = engine.next_turn(run_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    state = engine.get_state(run_id)
    if state is None:
        raise HTTPException(status_code=404, detail="RUN_NOT_FOUND")
    if event is None:
        raise HTTPException(status_code=400, detail="NO_EVENT")
    return NextEventResponse(event=event.to_dict(), state=state.to_dict())


class DecisionRequest(BaseModel):
    event_id: str
    choice: Decision


class DecisionResponse(BaseModel):
    state: dict
    outcome_summary: str


@app.post("/runs/{run_id}/decision", response_model=DecisionResponse)
async def decision(run_id: str, payload: DecisionRequest):
    state, error = engine.make_decision(run_id, payload.event_id, payload.choice)
    if error:
        raise HTTPException(status_code=400, detail=error)
    if state is None:
        raise HTTPException(status_code=404, detail="RUN_NOT_FOUND")
    if not state.events_log:
        raise HTTPException(status_code=400, detail="NO_EVENT")
    event = state.events_log[-1]
    summary = event.resolution.logs[-1] if event.resolution and event.resolution.logs else "Decision applied."
    return DecisionResponse(state=state.to_dict(), outcome_summary=summary)


class StateResponse(BaseModel):
    state: dict


@app.get("/runs/{run_id}/state", response_model=StateResponse)
async def get_state(run_id: str):
    state = engine.get_state(run_id)
    if not state:
        raise HTTPException(status_code=404, detail="RUN_NOT_FOUND")
    return StateResponse(state=state.to_dict())
