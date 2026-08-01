# Release test matrix

This matrix records release-focused checks above the milestone implementation matrices. Browser checks use the served, build-free application and cleared `batsnake.settings.v1` / `batsnake.guidance.v1` storage unless noted.

## First-run Bat audit — 2026-08-01

The pre-fix controller started at `(1, 3, -45)`, facing `+Z` (`yaw 0`, `pitch 0`) with velocity `(0, 0, 7)` m/s. A deterministic replay of that transform at zero input did not collide or emit echolocation in eight seconds. The apparent autonomy was therefore the intended momentum model, not synthetic input. The early presentation still failed: the game did not explain the glide persistently, boas could begin audible AI strikes during the opening seconds, and any player-caused cave contact spawned an expanding additive ring close enough to the sonar vocabulary to be misread.

Event routing identified the exact responses:

| Condition | Visual | Camera/body | Audio | Sensory state |
|---|---|---|---|---|
| Cave collision, before fix | Expanding additive `RingGeometry` | Short collision impulse and wing tuck | Square-wave low tone plus 500 Hz noise | No actual echo history, but the ring resembled a return |
| Cave collision, current | Twelve local limestone dust points | Short collision impulse and disrupted wingbeat | Dull 62 Hz triangle impact plus low 220 Hz debris | No echo event, wavefront, outline, or memory |
| Cave near miss / obstacle anticipation | No impact effect | Controller applies slight steering bias | None | None |
| Stall | No pulse or flash | Falling flight state; lowered rhythm | None | None |
| Snake near miss | Short directional slipstream | Panic roll and wing disturbance | Strike/miss movement audio | No echo history |
| Intentional echolocation | Traveling cave/return reconstruction | None | Quick chirp, or deeper call plus body resonance and delayed returns | Emits `echolocation-pulse`; quick/deep histories remain distinct |
| Panic | Living traffic and first-person cadence changes | Restrained panic roll | Event-dependent animal movement | No automatic player call |

The current soft launch starts at `(-1.2, 3.4, -49.5)`, faces `+Z`, and carries `(0, 0, 5.5)` m/s. Lift assistance tapers to zero over four seconds; it does not stop motion or hover the bat. Player-targeted and flock-targeted boa pressure is held for six seconds. At zero input, the first obstacle-ahead query is the first column at `6.35 s`; after `8.07 s` there is still no collision.

## First-run acceptance flow

| Step | Expected | 1440×900 Chrome WebGL2 result |
|---:|---|---|
| 1 | Clear settings/guidance; start Bat at default Night Flight | Pass — production asset path loaded locally |
| 2 | Touch no controls for three seconds | Pass — position `(-1.2, 0.95, -35.85)`, zero collisions |
| 3 | Observe no unrelated sensory response | Pass — zero flap, near-miss, collision, or echo events; zero impact effects |
| 4 | Steer | Pass — injected mouse movement changed yaw to `-0.0598` radians |
| 5 | Flap once | Pass — exactly one `bat-flap` event |
| 6 | Tap quick call | Pass — exactly one `echolocation-pulse` of kind `quick`; score recorded one quick call |
| 7 | Brake before the first narrowing | Pass — brake input reduced speed without collision or sensory activation |
| 8 | Audit collision identity | Pass — rock contact created `impact`; echo count stayed unchanged |
| 9 | Audit near-miss identity | Pass — snake near miss created `slipstream`, not rock dust or sonar |
| 10 | Open Gameplay from menu and pause | Pass — Bat/Snake sections present; paused state remained paused |
| 11 | Browser/runtime hygiene | Pass — no page exceptions and no requests outside the local origin |

Web Audio was stubbed for the automated movement run to avoid headless device initialization; event-to-audio routing was audited directly. Live audio retains the existing local procedural path. Pointer lock, gamepad, reduced sensory options, fallback assets, quality determinism, and lifecycle coverage remain in the Milestone 4 validation record.
