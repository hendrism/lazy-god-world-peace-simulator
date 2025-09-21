# Lazy God – World Peace Simulator (Proof of Concept)

This repository contains a **proof‑of‑concept** implementation of **Lazy God – World Peace Simulator**, a mobile‑first roguelike diplomacy simulator.  
The code here follows the high‑level technical specification and provides a runnable prototype that demonstrates the core mechanics and exposes a small HTTP API.  

### Repository Structure

```
lazy-god-game/
├── backend/               # FastAPI server with run lifecycle and decision endpoints
│   ├── main.py            # Entry point for the API server
│   └── requirements.txt   # Python dependencies for the backend
├── core/                  # Game logic and data models
│   ├── __init__.py
│   ├── models.py          # Dataclass definitions for Nation, Assistant, Event, GameState
│   └── game.py            # Core engine: run creation and decision resolution
├── prototype/             # Simple command‑line interface to play a game
│   └── cli_game.py
├── docs/                  # JSON Schemas and documentation
│   ├── schemas/
│   │   ├── nation_schema.json
│   │   ├── assistant_schema.json
│   │   ├── event_schema.json
│   │   └── gamestate_schema.json
│   └── README.md
└── .gitignore            # Ignore Python bytecode and environment files
```

### Running the CLI Prototype

The command-line slice now mirrors the strengthened turn loop from the development plan. It supports deterministic seeding, curated nation archetypes, and authored event punchlines.

```bash
python3 -m venv .venv && source .venv/bin/activate  # optional: create a virtual environment
pip install -r backend/requirements.txt
python prototype/cli_game.py 1337  # optional seed for deterministic runs
```

During play you will see:

- A stability meter with the five named states (chaotic → golden_age).
- Eight themed nations per run, each with hidden traits the Prophet can reveal.
- Authored event summaries with unique punchlines and streak-based bonuses.

### Running the API Server

Launch the FastAPI service to drive the same engine over HTTP:

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

Key endpoints:

| Method | Path | Description |
|------:|------|-------------|
| `POST` | `/runs/start` | Start a new run. Optional body keys: `world_theme`, `turn_limit`, `difficulty`, `seed`. |
| `POST` | `/runs/{run_id}/next` | Generate the next event in the active run. |
| `POST` | `/runs/{run_id}/decision` | Resolve the pending event with a decision payload (`event_id`, `choice`). |
| `GET` | `/runs/{run_id}/state` | Inspect the full game state, including revealed traits and god quips. |

Example HTTPie session:

```bash
http POST :8000/runs/start seed:=2024
http POST :8000/runs/<run_id>/next
http POST :8000/runs/<run_id>/decision event_id=<event_id> choice=peace
```

All API responses conform to the JSON schemas in `docs/schemas/` and expose the deterministic seed, stability history, revealed traits, and authored quips to consumers.

### Next Steps

This proof of concept does not yet include a graphical user interface or persistence.  It is designed to demonstrate core mechanics and serve as a foundation for future development.  Contributions are welcome!
