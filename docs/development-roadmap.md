# Development Plan: Lazy God – World Peace Simulator

## 0. Baseline Assessment (Current State)
- **Playable Scope**: Python proof-of-concept with in-memory game engine (`core/`), FastAPI backend (`backend/`), and CLI prototype (`prototype/`).
- **Game Systems**: Procedural nation generation (race, economy, demeanor, hidden traits), three-choice interaction events, stability meter (0.0–1.0 → 5 states), score/streak logic, single assistant (Prophet), simple run lifecycle (start, next turn, decision, end).
- **Tooling**: JSON Schemas, lightweight tests, no persistence, no mobile UI, limited content variety.
- **Gap vs. PRD**: Missing mobile UX, assistant progression, meta upgrades, god personality systems, expanded events, world types, monetization, accessibility, and online/community features.

The following roadmap iteratively expands the prototype into the full PRD vision while keeping runs short, replayable, and content rich.

## Phase 1 – MVP Feature Completion (aligns with PRD §6)
1. **Nation & Event System Enhancements**
   - Extend generators to reach 6–10 distinct races/economies with themed descriptors and unique modifiers.
   - Introduce basic hidden trait revelation logic (chance per turn, Prophet hinting) and assistant hooks.
   - Add binary decision flow enforcing one pending event at a time and expose through backend API.
2. **Stability & Scoring Polish**
   - Implement the three-state meter (Peaceful/Neutral/Chaotic) with thresholds and visuals (API enum + frontend asset).
   - Add peace streak multiplier logic and scoreboard payloads.
3. **Assistants & Meta Unlocks**
   - Implement Diplomat (conflict reduction) and Prophet (instability warnings) with unlock conditions and persistent meta profile (temporary JSON storage).
4. **God Commentary Layer**
   - Author text-only quips tied to stability transitions, streaks, and assistant triggers.
5. **Frontend Prototype**
   - Build mobile-first web UI (React or Expo/React Native web) mirroring CLI flow: display two nations, decision buttons, stability meter, score.
6. **Technical Foundations**
   - Set up automated testing (pytest, linting, TypeScript checks), CI workflow, and documentation on running MVP.

**Exit Criteria**: Playable vertical slice on web/mobile browser featuring 5–10 minute runs, two assistants, textual commentary, persistence of meta unlocks, and basic analytics hooks.

## Phase 2 – Mobile Experience & Infrastructure
1. **Mobile Client**
   - Choose tech stack (React Native + Expo). Port MVP UI, ensure thumb-friendly layout, haptics, offline cache.
   - Implement save/resume (local storage + backend sync) and simple tutorial/onboarding.
2. **Backend Services**
   - Introduce persistence layer (SQLite/PostgreSQL) for runs, profiles, unlocks. Add authentication scaffold (guest + optional account).
   - Harden API (validation via schemas, rate limiting, deterministic seeds for replays).
3. **Audio & Personality**
   - Expand god commentary bank, add optional VO stubs, integrate sound effects for stability shifts.
4. **QA & Telemetry**
   - Add unit/integration tests for engine, instrumentation for decision analytics, crash/error reporting.

**Exit Criteria**: Mobile build testable on devices, resilient backend with persistent profiles, richer feedback loop (audio/visual), instrumentation baseline.

## Phase 3 – Content & Systems Depth
1. **Nation & Event Diversity**
   - Scale to 20+ nations, economy variants, demeanor-specific event chains. Introduce rarity tiers and event modifiers driven by world stability.
   - Implement hidden trait discovery mechanics (spies, upgrades) and relational memory between nations (rivalries, alliances).
2. **Advanced Assistants & Upgrades**
   - Add Peacekeeper, Spy Network, Court Mage with cooldowns, unique UI interactions, and upgrade tracks.
   - Build meta-progression tree (currency rewards, unlock requirements, difficulty mutators).
3. **Dynamic World Stability**
   - Expand meter to 5-state spectrum described in PRD with escalating event probabilities and recovery mechanics.
4. **Narrative & Humor Systems**
   - Create templated storytelling snippets, god personas with selectable voice packs, and dynamic reactions to streaks/failures.

**Exit Criteria**: Runs feel varied with deeper assistant management, world state evolution, and narrative flavor meeting mid-term PRD expectations.

## Phase 4 – Late-Game & Replayability Hooks
1. **Cosmic & Rival Threats**
   - Add multi-continent worlds, rival gods affecting events, global crises (asteroids, eldritch awakenings).
2. **Campaign & Scenario Mode**
   - Scripted runs with specific objectives, branching events, narrative arcs.
3. **Prestige/Ascension**
   - Introduce reset loop rewarding prestige currency unlocking new themes, modifiers, and higher difficulties.
4. **Social Features**
   - Leaderboards, shareable run summaries, daily challenges with fixed seeds.

**Exit Criteria**: High replayability with long-term goals, social competition, and multiple late-game systems.

## Phase 5 – Live Operations & Monetization (Vision Stage)
1. **Cosmetics & Personalization**
   - Cosmetic god skins, assistant outfits, world themes purchasable or unlockable; ensure no pay-to-win.
2. **Seasonal Content Pipeline**
   - Tooling for monthly content drops (nations, events, assistants), live ops calendar, limited-time challenges.
3. **Community & Accessibility Enhancements**
   - Player quote sharing, localization, screen-reader-friendly UI, colorblind options, configurable text size.
4. **Monetization Infrastructure**
   - In-app purchase framework, cosmetic store, analytics for conversion funnels.

**Exit Criteria**: Sustainable content cadence, ethical monetization, robust accessibility support, community engagement loop.

## Cross-Cutting Workstreams
- **Design**: Iterate on open questions (decision depth, randomness vs. determinism, alternate scoring paths) via prototypes and user research each phase.
- **Production**: Maintain backlog using roadmap phases, establish milestones, and conduct regular playtests.
- **Engineering**: Continuous refactoring, performance profiling for mobile, automated regression tests, documentation.
- **Art/Audio**: Develop visual identity, UI themes per world type, SFX/VO library; coordinate with monetization cosmetics.

## Milestone Dependencies
- Phase 1 completion is prerequisite for mobile build (Phase 2).
- Persistent data models introduced in Phase 2 underpin expansions in Phases 3–5.
- Content tooling should be built during Phase 3 to support later live ops.

## Risk Mitigation & Research Tasks
- **Decision Complexity**: Prototype variants (binary vs. ternary choices, auto-resolve assistants) to finalize design direction early in Phase 1.
- **Randomness vs. Determinism**: Add seed controls and telemetry to study player sentiment.
- **Scoring Variants**: Experiment with chaos-aligned scoring paths during Phase 3 content expansion.
- **Performance**: Monitor mobile performance budgets; test on low-end devices starting Phase 2.

## Deliverables Summary
| Phase | Target Duration | Key Deliverables |
|-------|-----------------|------------------|
| 1 | 2 sprints | MVP slice: web/mobile prototype, assistants (Diplomat & Prophet), streak scoring, commentary |
| 2 | 2–3 sprints | Mobile build, persistence, onboarding, audio, analytics |
| 3 | 3–4 sprints | Expanded content set, meta progression, full stability ladder |
| 4 | 3–4 sprints | Late-game systems, campaigns, social hooks |
| 5 | Ongoing | Monetization, seasonal updates, accessibility/localization |

This roadmap bridges the current proof-of-concept to the full Lazy God PRD, sequencing core systems, content, and infrastructure so each phase is playable and testable while unlocking long-term scalability.
