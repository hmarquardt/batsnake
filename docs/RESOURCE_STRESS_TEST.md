# Resource stress test — 0.5.0-rc1

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
