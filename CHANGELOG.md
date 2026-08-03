# Changelog

## Milestone 6 — The Cave

- Replaced the uniform tube-and-rock treatment with one authored cave sequence: Roost Vault, Guano Shelf, Fang Ceiling, Split Column, Bell Chamber, Curtain Wall, Broken Pillar, Moon Gallery, and Moon Gate.
- Added regionally clustered limestone morphology, a bounded Cuban exterior glimpse, locally generated surface variation, wet seep zones, guano ecology, a 96-silhouette roost colony that depletes with departure progress, and physically supported boa posts.
- Made fog, dust, droplets, entrance leaves, insects, and procedural ambience respond to cave region or existing airflow/director state. No gameplay system, runtime asset request, or external byte was added.
- Reconciled variable elliptical shell collision with echolocation wall sampling; separated reflective cavity/roost volumes from solid collision; refined compound landmark proxies while retaining all five routes and three snake anchors.
- Cull dormant authored echo meshes outside a call. At 1920×1080 medium, normal Bat presentation measured 273 accumulated composer calls / 114,572 triangles and thermal Snake measured 316 / 120,212 in the final diagnostic; these are diagnostic counters, not a 60 FPS certification.
- Reran Chrome lifecycle/opposite-perspective smoke, 13-check regression, 50/50/25/25 resource stress, same-seed quality identity, local-only request audit, JavaScript parsing, and vendor verification. Human RC gates remain blocked exactly as documented in `docs/RELEASE_CHECKLIST.md`.

## 0.5.0-rc1 — Release Candidate

Release verification currently reports **RC STATUS: BLOCKED**. See `docs/RELEASE_CHECKLIST.md`; the candidate is not ready to tag until the listed human, multi-seed, stable-browser, gamepad, and performance gates are completed.

### RC truth-reconciliation fixes

- Dispose cloned hero-bat skeletons so their renderer bone textures do not grow across restarts and perspective switches. The first 50/50/25/25 stress run grew to 159 textures; the final rerun remained bounded at 27 in Bat and 24 in Snake.
- Add stall-speed hysteresis and reset the previous-stall flag so the stall cue emits once per genuine stall/restall transition instead of oscillating at the threshold.
- Fall back to `AudioListener.setPosition()` / `setOrientation()` when Firefox does not expose Chromium-style listener AudioParams.
- Clear delayed cue timers and active ambience-duck timers whenever a run restarts, changes perspective, or returns to menu, preventing old-mode audio from leaking into the new state.
- Replace vague browser passes and unqualified performance claims with exact executed versions, measured limitations, and explicit untested states.

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

- Field Study, Night Flight, and Flight Line are configured to differ through density, snake reaction, panic, duration, target, call cooldown, and route pressure. The required 30-session human difficulty validation remains incomplete.
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
