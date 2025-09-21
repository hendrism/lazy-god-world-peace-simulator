"""FastAPI server for Lazy God proof‑of‑concept.

This module exposes a minimal REST API for managing game runs.  The API
demonstrates how to start a run, advance turns, make decisions and query
the current state.  It uses the in‑memory GameEngine defined in
``core.game``.

Run this server with uvicorn::

    uvicorn backend.main:app --reload

"""

from __future__ import annotations

import uuid
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from core.game import GameEngine
from core.models import Decision
from .profile_store import PROFILE_STORE


app = FastAPI(title="Lazy God API", version="0.2.0", description="Proof of concept for Lazy God game")

engine = GameEngine()


class SessionManager:
    """Lightweight in-memory session manager.

    Each client is assigned a session identifier that maps to a single
    run identifier.  The mapping allows clients to reconnect without
    remembering their run id explicitly, satisfying the "solo player"
    use case described in the development roadmap.
    """

    def __init__(self) -> None:
        self._session_runs: Dict[str, str] = {}

    def resolve_run_id(self, session_id: str) -> Optional[str]:
        return self._session_runs.get(session_id)

    def attach(self, session_id: str, run_id: str) -> None:
        self._session_runs[session_id] = run_id

    def new_session(self, run_id: str) -> str:
        session_id = uuid.uuid4().hex
        self.attach(session_id, run_id)
        return session_id

    def clear(self, session_id: str) -> None:
        self._session_runs.pop(session_id, None)


sessions = SessionManager()


def _serialize_state(state: Any) -> Dict[str, Any]:
    """Return a dict representation that FastAPI can serialise."""

    return state.to_dict()


def _serialize_event(event: Any) -> Optional[Dict[str, Any]]:
    if not event:
        return None
    return event.to_dict()


def _pending_event_for_state(state: Any) -> Optional[Dict[str, Any]]:
    if not state.events_log:
        return None
    event = state.events_log[-1]
    if not event.resolved:
        return _serialize_event(event)
    return None


class StartRunRequest(BaseModel):
    world_theme: str = "classic_fantasy"
    turn_limit: int = 20
    difficulty: str = "normal"
    seed: int | None = Field(default=None, description="Optional deterministic seed")
    session_id: str | None = Field(default=None, description="Existing session identifier")
    resume: bool = Field(default=True, description="Resume existing session when possible")


class StartRunResponse(BaseModel):
    run_id: str
    session_id: str
    state: dict
    pending_event: Optional[dict]
    profile_summary: dict


@app.post("/runs/start", response_model=StartRunResponse)
async def start_run(payload: StartRunRequest):
    session_id = payload.session_id
    existing_state = None
    if session_id:
        run_id = sessions.resolve_run_id(session_id)
        if run_id:
            existing_state = engine.get_state(run_id)
            if existing_state and payload.resume and existing_state.run_status == "active":
                return StartRunResponse(
                    run_id=existing_state.run_id,
                    session_id=session_id,
                    state=_serialize_state(existing_state),
                    pending_event=_pending_event_for_state(existing_state),
                    profile_summary=PROFILE_STORE.get_summary(),
                )

    state = engine.start_run(
        world_theme=payload.world_theme,
        turn_limit=payload.turn_limit,
        difficulty=payload.difficulty,
        seed=payload.seed,
        profile_unlocks=PROFILE_STORE.unlocked_flags(),
    )

    if session_id:
        sessions.attach(session_id, state.run_id)
    else:
        session_id = sessions.new_session(state.run_id)

    return StartRunResponse(
        run_id=state.run_id,
        session_id=session_id,
        state=_serialize_state(state),
        pending_event=_pending_event_for_state(state),
        profile_summary=PROFILE_STORE.get_summary(),
    )


class NextEventResponse(BaseModel):
    run_id: str
    session_id: Optional[str]
    event: dict
    state: dict


class NextEventRequest(BaseModel):
    session_id: str | None = None


@app.post("/runs/{run_id}/next", response_model=NextEventResponse)
async def next_event(run_id: str, payload: Optional[NextEventRequest] = None):
    resolved_run_id = run_id
    session_id = payload.session_id if payload else None
    if session_id:
        resolved = sessions.resolve_run_id(session_id)
        if resolved:
            resolved_run_id = resolved
    event, error = engine.next_turn(resolved_run_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    state = engine.get_state(resolved_run_id)
    if state is None:
        raise HTTPException(status_code=404, detail="RUN_NOT_FOUND")
    if event is None:
        raise HTTPException(status_code=400, detail="NO_EVENT")
    if session_id:
        sessions.attach(session_id, state.run_id)
        active_session = session_id
    else:
        active_session = sessions.new_session(state.run_id)
    return NextEventResponse(
        run_id=state.run_id,
        session_id=active_session,
        event=_serialize_event(event),
        state=_serialize_state(state),
    )


class DecisionRequest(BaseModel):
    event_id: str
    choice: Decision
    session_id: str | None = None


class DecisionResponse(BaseModel):
    run_id: str
    session_id: Optional[str]
    state: dict
    resolved_event: dict
    outcome_summary: str
    profile_summary: Optional[dict]


@app.post("/runs/{run_id}/decision", response_model=DecisionResponse)
async def decision(run_id: str, payload: DecisionRequest):
    resolved_run_id = run_id
    if payload.session_id:
        resolved = sessions.resolve_run_id(payload.session_id)
        if resolved:
            resolved_run_id = resolved
    state, error = engine.make_decision(resolved_run_id, payload.event_id, payload.choice)
    if error:
        raise HTTPException(status_code=400, detail=error)
    if state is None:
        raise HTTPException(status_code=404, detail="RUN_NOT_FOUND")
    if not state.events_log:
        raise HTTPException(status_code=400, detail="NO_EVENT")
    event = state.events_log[-1]
    summary = event.resolution.logs[-1] if event.resolution and event.resolution.logs else "Decision applied."
    session_id = payload.session_id
    if session_id:
        sessions.attach(session_id, state.run_id)
    return DecisionResponse(
        run_id=state.run_id,
        session_id=session_id,
        state=_serialize_state(state),
        resolved_event=_serialize_event(event),
        outcome_summary=summary,
        profile_summary=PROFILE_STORE.ingest_resolution(state, event),
    )


class StateResponse(BaseModel):
    state: dict


@app.get("/runs/{run_id}/state", response_model=StateResponse)
async def get_state(run_id: str):
    state = engine.get_state(run_id)
    if not state:
        raise HTTPException(status_code=404, detail="RUN_NOT_FOUND")
    return StateResponse(state=_serialize_state(state))
