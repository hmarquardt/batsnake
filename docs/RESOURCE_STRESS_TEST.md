# Resource stress test — 0.5.0-rc1

## Milestone 7 rerun — 2026-08-03

The exact 50 Bat restarts, 50 Snake restarts, 25 Bat/Snake switches, and 25 same-seed Bat replays were rerun in installed Chrome 150.0.7871.187 after sensory prewarm and boa changes. There were no browser errors and the replay seed remained `RC-STRESS-01`.

| Snapshot | Scene children | Renderer geometries | Renderer textures | Scene geometries | Materials | Mixers | Event subscriptions | Echo pool | Thermal pool | Flock / snakes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Bat before | 28 | 139 | 29 | 168 | 82 | 1 | 37 | 24 | 0 | 34 / 3 |
| Bat after 50 | 28 | 126 | 29 | 168 | 82 | 1 | 37 | 24 | 0 | 34 / 3 |
| Snake before | 28 | 117 | 26 | 160 | 74 | 0 | 34 | 0 | 112 | 42 / 3 |
| Snake after 50 | 28 | 115 | 26 | 160 | 74 | 0 | 34 | 0 | 112 | 42 / 3 |
| After 25 switches (Bat) | 28 | 126 | 29 | 168 | 82 | 1 | 37 | 24 | 0 | 34 / 3 |
| After 25 same-seed replays | 28 | 126 | 29 | 168 | 82 | 1 | 37 | 24 | 0 | 34 / 3 |
| Menu after | 17 | 39 | 26 | 37 | 27 | 0 | 25 | 0 | 0 | 0 / 0 |

The shared echo pulse geometry/material is an intentional application-lifetime cache. Mode-owned return/trail pools, animal materials, subscriptions, and mixers remained at their mode baselines. Renderer geometry counts decreased after warm disposal/reuse rather than growing. AudioContext remained one; live sources were two to three and the one outstanding timer was the bounded ambience timer already present in the baseline.

## RC baseline — 2026-08-01

Executed 2026-08-01 on the host documented in `BROWSER_MATRIX.md`, using the installed Google Chrome 150.0.7871.187 binary headlessly at 1440×900, medium quality, production hero bat enabled, and fixed seed `RC-STRESS-01`.

The exact sequence was 50 Bat same-seed restarts, 50 Snake same-seed restarts, 25 Bat/Snake mode switches, and 25 additional same-seed replays. Instrumentation sampled Three.js renderer memory, scene traversal, live mode fields, the application EventBus, outstanding `setTimeout` handles, and live scheduled Web Audio source nodes.

## Finding and fix

The first run falsified the no-leak claim: renderer textures grew from 22 at menu startup to 159 after the sequence. Each cloned skinned hero bat could allocate a skeleton bone texture, but `ModelAdapter.disposeRoot()` did not dispose cloned skeletons. The adapter now deduplicates and disposes its cloned skeletons. The complete sequence was then rerun twice; renderer textures stayed bounded (27 throughout active Bat samples, 24 throughout active Snake samples).

## Final before/after evidence

| Metric | Bat before | Bat after 50 | Snake before | Snake after 50 | After 25 switches + 25 replays (Bat) | Menu before → after |
|---|---:|---:|---:|---:|---:|---:|
| Scene direct children | 22 | 22 | 22 | 22 | 22 | 11 → 11 |
| Renderer geometries | 123 | 110 | 98 | 100 | 110 | 35 → 35 |
| Renderer textures | 27 | 27 | 24 | 24 | 27 | 22 → 24 |
| Scene-traversed geometries | 153 | 153 | 145 | 145 | 153 | 34 → 34 |
| Scene-traversed materials | 71 | 71 | 63 | 63 | 71 | 16 → 16 |
| Animation mixers | 1 | 1 | 0 | 0 | 1 | 0 → 0 |
| Live AudioBuffer/Oscillator sources | 2 | 2 | 2 | 2 | 2 | 0 → 2 |
| Outstanding timers | 1 | 1 | 1 | 1 | 1 | 0 → 1 |
| EventBus subscriptions | 37 | 37 | 34 | 34 | 37 | 25 → 25 |
| Echo return pool / active | 24 / 0 | 24 / 0 | 0 / 0 | 0 / 0 | 24 / 0 | 0 / 0 → 0 / 0 |
| Thermal trail pool / active | 0 / 0 | 0 / 0 | 112 / 0 | 112 / 0 | 0 / 0 | 0 / 0 → 0 / 0 |
| Flock count | 34 | 34 | 42 | 42 | 34 | 0 → 0 |
| Snake count | 3 | 3 | 3 | 3 | 3 | 0 → 0 |

The two post-start menu textures are bounded first-use renderer caches; they appeared once and did not grow across the repeated sequences. The two live audio sources are the application-lifetime looping cave ambience and its LFO. The one outstanding timeout is the single replaceable toast dismissal timer and does not multiply across restarts. Same-seed identity remained `RC-STRESS-01` after all 25 replays. No page or console errors occurred in the final run.

## Measurement limits

- Browsers do not expose a complete list of all AudioNodes. The test counted live scheduled oscillator/buffer-source nodes, plus the one AudioContext; short-lived gains, filters, and panners are garbage-collected but not directly enumerable.
- Browser timer instrumentation covered `setTimeout`; the single application `requestAnimationFrame` loop is intentionally persistent and not counted as a timer.
- Renderer memory counters reflect uploaded/live WebGL resources and may settle downward after asynchronous model loading. Boundedness across identical active-mode samples is the release criterion, not equality between unlike modes.

## Milestone 6 regression rerun — 2026-08-02

The complete 50 Bat / 50 Snake / 25 switch / 25 same-seed sequence was rerun after the authored environment landed, using the same Chrome binary, 1440×900 viewport, medium profile, production hero bat, and `RC-STRESS-01`. The environment is application-lifetime state, so its larger fixed baseline is expected; it must not grow per session.

| Metric | Bat before → after 50 | Snake before → after 50 | After switches + replays (Bat) | Menu before → after |
|---|---:|---:|---:|---:|
| Scene direct children | 28 → 28 | 28 → 28 | 28 | 17 → 17 |
| Renderer geometries | 126 → 113 | 103 → 105 | 113 | 36 → 38 |
| Renderer textures | 29 → 29 | 26 → 26 | 29 | 23 → 26 |
| Scene-traversed geometries | 156 → 156 | 148 → 148 | 156 | 37 → 37 |
| Scene-traversed materials | 82 → 82 | 74 → 74 | 82 | 27 → 27 |
| Mixers / EventBus subscriptions | 1 / 37 → 1 / 37 | 0 / 34 → 0 / 34 | 1 / 37 | 0 / 25 → 0 / 25 |
| Echo pool / thermal pool | 24 / 0 → 24 / 0 | 0 / 112 → 0 / 112 | 24 / 0 | 0 / 0 → 0 / 0 |
| Flock / snakes | 34 / 3 → 34 / 3 | 42 / 3 → 42 / 3 | 34 / 3 | 0 / 0 → 0 / 0 |

Live scheduled audio sources varied between two and four while short ambience one-shots completed and settled to the two application-lifetime ambience sources at menu; the single toast timer remained one. Final seed identity remained `RC-STRESS-01`; no page or console errors occurred. The three menu texture additions are bounded first-use caches, consistent with the earlier measurement limitation. No unbounded Milestone 6 growth was observed.
