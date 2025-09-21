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

The command‑line game allows you to experience a short play session directly in your terminal.  To run it:

```bash
cd lazy-god-game
python3 -m venv venv && source venv/bin/activate  # optional: create a virtual environment
pip install -r backend/requirements.txt
python prototype/cli_game.py
```

The CLI will generate two nations per turn and present you with three options: **peace**, **hostile** or **trade**.  Decisions affect world stability and your score.  The game ends when either the stability falls below zero or you reach the turn limit.

### Running the API Server

This prototype includes a minimal REST API implemented with **FastAPI**.  To launch the server:

```bash
cd lazy-god-game
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

The API exposes endpoints such as:

| Method | Path              | Description                  |
|------:|-------------------|------------------------------|
| `POST` | `/run/start`      | Start a new run              |
| `POST` | `/run/decision`   | Submit a player decision     |
| `GET`  | `/run/state/{id}` | Fetch the current game state |

Use a tool like [HTTPie](https://httpie.io/) or curl to interact with the service.

### Next Steps

This proof of concept does not yet include a graphical user interface or persistence.  It is designed to demonstrate core mechanics and serve as a foundation for future development.  Contributions are welcome!
