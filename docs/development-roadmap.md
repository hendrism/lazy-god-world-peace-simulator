# Development Plan: Lazy God – World Peace Simulator

## Status Snapshot
- ✅ **Milestone 0 – Stabilize the Prototype** complete. The core engine now supports deterministic seeding, expanded content, and end-to-end CLI/API runs that stay stable for 10+ turns.
- ✅ **Milestone 1 – Solo-Friendly UI Vertical Slice** implemented in this sprint. A persistent session manager, onboarding overlay, seed controls, and animated feedback now wrap the FastAPI backend for playtesting.
- ⏭️ **Milestone 2 – Meta Progression Taste Test** is next, focusing on assistants, persistence, and narrative polish atop the new session framework.

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
1. **FastAPI Cleanup** ✅
   - Normalize payloads for game state, pending event, and decision outcomes with explicit response envelopes.
   - Add a lightweight session manager to keep a single user's run alive between requests via reusable session IDs.
2. **Web Client Vertical Slice** ✅
   - Build a mobile-first React page that consumes the API and mirrors the CLI flow (two nations, choices, stability meter, score, assistant hints).
   - Include simple animations/feedback for stability shifts and streak milestones using Framer Motion callouts.
   - Ship a basic onboarding overlay (what is happening, how to advance turns) with seed-aware session controls.
3. **Playtest Harness** ✅
   - Add seed selector + restart controls in the UI so the solo player can explore quickly.
   - Capture run summary at the end (final stability, score, highlights) for manual review and clipboard export.

**Exit Criteria**: ✅ A single user can launch the web client locally, play a 5–10 minute session without crashes, and understand outcomes through UI feedback.

## Milestone 2 – Meta Progression Taste Test (1 sprint)
1. **Assistant System** – *in progress*
   - ✅ Implement Prophet (baseline) alongside a Diplomat who unlocks after a peace streak of five and grants a stability bonus.
   - ⏭️ Surface assistant hints and cooldowns in the UI.
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

## Milestone 3 – Community Playtest Prep (1–2 sprints)
1. **Stability & Telemetry Hardening**
   - Stand up opt-in analytics with privacy-safe event batching to capture session length, drop-off points, and assistant usage.
   - Instrument backend errors and latency budgets, surfacing dashboards/alerts ahead of external playtests.
   - Expand automated regression suite (API contract tests + storybook visual diffs) to guard against rapid iteration regressions.
2. **Content & UX Polish**
   - Author 20+ additional mid/late-run events with branching resolutions that showcase assistant synergies.
   - Layer in dynamic soundtrack cues and haptic-friendly feedback hooks for mobile browsers.
   - Add accessibility passes: keyboard navigation, screen-reader labels, colorblind-safe stability meter palettes.
3. **Playtest Operations**
   - Package Docker-based deployment for cloud staging with seeded progression data.
   - Create feedback pipelines (in-game bug reporter, survey links) wired to a triage board.
   - Produce a short tutorial video and quickstart doc for community hosts.

**Exit Criteria**: A limited external cohort can onboard without developer hand-holding, with telemetry and tooling ready to absorb qualitative feedback.

## Milestone 4 – Live Ops Foundations (2–3 sprints)
1. **Scalable Persistence Layer**
   - Migrate profile data to a managed database (Supabase/Postgres or DynamoDB) with migration scripts and environment isolation.
   - Add auth-lite identities (magic link or device code) to sync progression across devices while respecting the "lazy" fantasy.
2. **Dynamic Content Delivery**
   - Build a content pipeline for hot-loading new events/assistants without redeploying the backend (CMS or Git-based registry).
   - Enable limited-time challenges and rotating modifiers with server-driven configurations.
3. **Monetization-Adjacent Hooks**
   - Introduce cosmetic unlock slots (divine avatar frames, godly office décor) gated by achievements only—no payments yet.
   - Prototype a soft-currency loop (Favor) earned from streaks to unlock cosmetics and meta upgrades.

**Exit Criteria**: The game can run as a small live service with safe content updates, synchronized progression, and the scaffolding for future monetization experiments.

## Vision Horizon – Full Release Readiness
- **Co-op & Asynchronous Play**: Explore duet runs where two lazy gods negotiate over shared stability, and weekly asynchronous challenges with ghost data.
- **Narrative Campaign**: Ship a multi-chapter arc with bespoke art, voiceover, and scripted assistant evolutions.
- **Mod & Creator Tools**: Expose event scripting toolkit and moderation pipeline for community-authored content.
- **Commercialization**: Evaluate premium unlocks, season passes, or DLC expansions once retention metrics justify investment.

Delivering Milestones 3 and 4 positions the team for a confident early access launch, while the Vision Horizon captures the stretch goals that can be sequenced based on player demand and team capacity.
