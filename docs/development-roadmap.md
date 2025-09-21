# Development Plan: Lazy God – World Peace Simulator

## Immediate Goal
Deliver a self-contained build that one person can play end-to-end to evaluate the full fantasy of being a "lazy god". The focus is on polishing the existing Python/FastAPI prototype, wrapping it with a lightweight web client, and filling in just enough content and meta systems to make a single run feel complete.

## Milestone 0 – Stabilize the Prototype (1 sprint)
1. **Core Engine Hardening**
   - Tighten turn loop: ensure start → event selection → decision resolution → stability update → end-of-run works without manual resets.
   - Formalize the stability meter (5 named states) and score calculation inside the engine and expose through backend responses.
   - Add deterministic seeding to support quick iteration and regression checks.
2. **Content Sweep**
   - Expand nation generator to at least 8 themed archetypes with distinct modifiers.
   - Create a bank of 30–40 interaction events covering diplomacy, disasters, and comedic beats.
   - Introduce light hidden trait reveals (Prophet hints, streak bonuses) and scripted god quips tied to stability swings.
3. **Quality & Tooling**
   - Flesh out schema validations, pytest coverage, and linting for core + backend.
   - Document how to launch a run via CLI or API so playtesters can start immediately.

**Exit Criteria**: CLI/API runs stay stable for 10+ turns, stability/score feedback is legible, and there is enough authored content that consecutive runs feel fresh.

## Milestone 1 – Wrap with a Solo-Friendly UI (1 sprint)
1. **FastAPI Cleanup**
   - Normalize payloads for game state, pending event, and decision outcomes.
   - Add a lightweight session manager to keep a single user's run alive between requests.
2. **Web Client Vertical Slice**
   - Build a mobile-first React page that consumes the API and mirrors the CLI flow (two nations, choices, stability meter, score, assistant hints).
   - Include simple animations/feedback for stability shifts and streak milestones.
   - Ship a basic onboarding overlay (what is happening, how to advance turns).
3. **Playtest Harness**
   - Add seed selector + restart controls in the UI so the solo player can explore quickly.
   - Capture run summary at the end (final stability, score, highlights) for manual review.

**Exit Criteria**: A single user can launch the web client locally, play a 5–10 minute session without crashes, and understand outcomes through UI feedback.

## Milestone 2 – Meta Progression Taste Test (1 sprint)
1. **Assistant System**
   - Implement Prophet (baseline) and Diplomat with simple unlock logic (e.g., reach streak of 5).
   - Surface assistant hints and cooldowns in the UI.
2. **Persistent Profile (Local)**
   - Store unlock flags and high scores in a JSON/SQLite file on the backend.
   - Display progression summary when starting a new run.
3. **Narrative Polish**
   - Add god commentary variations for win/loss states and assistant triggers.
   - Sprinkle in 5–7 rare events to reward repeated playthroughs.

**Exit Criteria**: Completing runs feeds into light progression that persists between sessions and showcases the long-term direction of the game.

## After Playable – Stretch Backlog
Once the solo-playable slice feels satisfying, tackle the larger PRD beats:
- **Mobile/Offline Support**: Evaluate Expo/React Native port, add save/resume.
- **Expanded Content & Systems**: Scale nations/events, deepen stability dynamics, introduce additional assistants and meta tree.
- **Live Ops Foundations**: Persistence service, telemetry, cosmetic hooks, localization.
- **Community & Social**: Leaderboards, shareable run summaries, daily challenges.

This ordering keeps the near-term focus on moment-to-moment fun and clarity for a single evaluator while leaving space for the ambitious long-term vision once the core loop earns its keep.
