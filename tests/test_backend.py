import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_start_and_get_state_flow():
    response = client.post("/runs/start", json={})
    assert response.status_code == 200
    payload = response.json()
    run_id = payload["run_id"]

    state_resp = client.get(f"/runs/{run_id}/state")
    assert state_resp.status_code == 200
    state = state_resp.json()["state"]
    assert "stability" in state
    assert "score" in state
    assert "seed" in state
    assert "stability_history" in state


def test_next_and_decision_cycle():
    response = client.post("/runs/start", json={})
    run_id = response.json()["run_id"]

    next_resp = client.post(f"/runs/{run_id}/next")
    assert next_resp.status_code == 200
    event = next_resp.json()["event"]
    assert event["template_key"]
    assert "tags" in event

    decision_body = {"event_id": event["id"], "choice": "peace"}
    decision_resp = client.post(f"/runs/{run_id}/decision", json=decision_body)
    assert decision_resp.status_code == 200
    outcome = decision_resp.json()
    assert "state" in outcome
    assert "outcome_summary" in outcome
