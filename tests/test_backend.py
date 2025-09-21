import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

PROFILE_PATH = ROOT / "backend" / "player_profile.json"
if PROFILE_PATH.exists():
    PROFILE_PATH.unlink()

from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_start_and_get_state_flow():
    response = client.post("/runs/start", json={})
    assert response.status_code == 200
    payload = response.json()
    run_id = payload["run_id"]
    session_id = payload["session_id"]
    assert session_id
    profile = payload["profile_summary"]
    assert "total_runs" in profile
    assert "unlocked_assistants" in profile

    state_resp = client.get(f"/runs/{run_id}/state")
    assert state_resp.status_code == 200
    state = state_resp.json()["state"]
    assert "stability" in state
    assert "score" in state
    assert "seed" in state
    assert "stability_history" in state
    assert "assistant_notes" in state


def test_next_and_decision_cycle():
    response = client.post("/runs/start", json={})
    payload = response.json()
    run_id = payload["run_id"]
    session_id = payload["session_id"]

    next_resp = client.post(f"/runs/{run_id}/next", json={"session_id": session_id})
    assert next_resp.status_code == 200
    next_payload = next_resp.json()
    assert next_payload["session_id"] == session_id
    event = next_payload["event"]
    assert event["template_key"]
    assert "tags" in event

    decision_body = {"event_id": event["id"], "choice": "peace", "session_id": session_id}
    decision_resp = client.post(f"/runs/{run_id}/decision", json=decision_body)
    assert decision_resp.status_code == 200
    outcome = decision_resp.json()
    assert outcome["session_id"] == session_id
    assert "state" in outcome
    assert "outcome_summary" in outcome
    assert "profile_summary" in outcome
