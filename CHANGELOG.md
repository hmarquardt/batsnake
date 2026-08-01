# Changelog

## 0.5.0-rc1 — Release Candidate

### HUD

- Removed call-type indicator from Bat HUD (player already knows what they triggered; audio differentiates quick vs deep).
- Removed flight score from Bat HUD (end screen only; not needed during play).
- Removed reticle from Bat HUD (no aiming target in bat mode).
- Removed compass arrow from Bat HUD (airflow audio and visual cues already communicate direction).
- Removed echo pulse meter from Bat HUD (visual and audio echolocation feedback already communicates readiness).
- Removed observation post label from Snake HUD (head posture and camera position already indicate which post).
- Removed strike readiness meter from Snake HUD (body tension, S-curve, and head steadiness already communicate charge level).

### Audio

- Added `near-miss` sound (sharp high-band whoosh).
- Added `player-stalled` sound (descending whoosh with low sawtooth).
- Added `snake-switched` sound (two-tone transition ping).
- Added `thermal-toggle` sound (ascending/descending filter sweep).
- Added `flock-panic` sound (ambient-disturbance whoosh).
- Added `end-transition` sound (resolving tone on session end).
- Added dynamic ducking: ambience volume reduces during strike and capture events.
- Added `duck()` helper for future event-driven audio side-chaining.

### Difficulty tuning

- Field Study, Night Flight, and Flight Line differ behaviorally through density, snake reaction, panic, duration, target, call cooldown, and route pressure.
- Flight Line doubles the snake body coil compression during charge for clearer strike preparation.
- Flight Line increases the S-curve neck tension during charge for more visible body language.

### Snake strike readability

- Doubled coil compression during charge (`.07 → .14`) so the body visibly bunches.
- Increased S-curve neck tension lateral offset during charge (`.72 + tension * 1.05 → .72 + tension * 1.35`).
- Added pulsing thermal head glow during charge (intensity scales with tension).
- Miss-reason-specific recovery shapes are retained (overreach sags, obstruction shakes, poor lead stays clean).

### Lifecycle safety

- Stall/restall transitions emit a single `player-stalled` event per transition (not every frame).
- Flock panic emits `flock-panic` only when panicCount >= 4 and at most once per 800ms.
- All deferred audio timers and duck timers are cleared on `dispose()`.
- All event unsubscribers are collected and invoked on `dispose()`.

### Resource management

- Audio duck timer tracking with `duckTimers` Set, cleared on dispose.
- `performance.now()` throttling on stall, panic, thermal-toggle, breath, and tension prevents audio callback buildup.

### Same-seed opposite perspective

- End screen now offers "See this flight line from the other side" when ending a run.
- Preserves seed, difficulty, and encounter profile; switches Bat ↔ Snake.
- Player actions naturally diverge the simulation after the switch.

### Documentation

- Added `CHANGELOG.md`.
- Added `docs/RELEASE_CHECKLIST.md`.
- Added `docs/BROWSER_MATRIX.md`.
- Added `docs/BIOLOGY_NOTES.md`.
- Updated `docs/PERFORMANCE.md` with release candidate measurements.
- Rewrote README top section for immediate visitor comprehension.
- Version `0.5.0-rc1` displayed in Settings panel.
