# Release test matrix

This matrix records release-focused checks above the milestone implementation matrices. Browser checks use the served, build-free application and cleared `batsnake.settings.v1` / `batsnake.guidance.v1` storage unless noted.

The authoritative release decision is `RELEASE_CHECKLIST.md`. Earlier rows below are retained as implementation-regression history and must not be interpreted as full browser, listening, human-playability, difficulty, or release passes.

## RC truth-reconciliation run — 2026-08-01

| Area | Executed evidence | Result |
|---|---|---|
| Static/offline | All `src/**/*.js` parsed with `node --check`; vendor verifier passed 19 files / 2 dependencies; no package manifest exists | Pass |
| Installed Chrome | Chrome 150.0.7871.187 at 1440×900/1366×768 exercised startup, GLB, both basic control flows, pause/resume, pointer-lock loss, resize, forced reports, same-seed replay, both perspective switches, and menu cleanup; 90 requests, all local | Partial automated pass |
| Firefox engine | Playwright Firefox Nightly 151.0 found an AudioListener crash; after the compatibility fix the same smoke completed with no errors and 89 local-only requests | Partial automated pass; stable Firefox 150.0.1 not directly tested |
| WebKit | Cached Playwright WebKit revision 2311 aborted before page load because it requires macOS 26.2 | Not tested |
| Resource lifecycle | Required 50 Bat restarts, 50 Snake restarts, 25 switches, 25 same-seed replays | Pass after fixing skeleton bone-texture disposal; see `RESOURCE_STRESS_TEST.md` |
| Opposite perspective | Seed, difficulty, profile preserved both directions; thermal/focus/strike/call/HUD/body classes cleaned; menu FOV returned to 72; final Chrome run measured zero deferred/duck audio timers after each switch | Pass in Chrome and Firefox Nightly automation; transient-audio reset confirmed in final Chrome run |
| Platform | Direct-file fatal UI, fullscreen entry/exit, and localStorage reload persistence | Pass in Chrome headless |
| Performance | Installed Chrome 1920×1080 medium diagnostic separated JS/fixed/render-submit and recorded first-use sensory spikes | Measured, not a 60 FPS certification; see `PERFORMANCE.md` |
| Milestone 7 sensory performance | Installed Chrome 150.0.7871.187 at 1440×900 Medium; isolated pulse/cave cold paths, loading prewarm, quick/deep/thermal/focus/biological activation matrix | Echo hitch resolved; quick/deep/focus/biological ≤3.0 ms and fresh Snake-first thermal 17.8 ms. Still not an interactive 1920×1080 or GPU-headroom certification; see `SENSORY_PERFORMANCE.md` |
| Audio identity | Routing exercised; no human listening | Not tested as a release gate |
| Human playability / HUD | No human novice-perspective session | Not tested |
| Strike learning | One automated lead miss per engine; no 20-attempt human series | Not tested as required |
| Difficulty | Configuration differs; no 30-session evidence set | Not tested as required |
| Gamepad | No physical controller attached/tested | Not tested |

## Milestone 6 environment regression — 2026-08-02

| Area | Executed evidence | Result |
|---|---|---|
| Authored space | Fixed-camera before set plus 20-view after set at 1440×900; named mouth, roost, landmarks, routes, wetness, ecology, echo, thermal, perspectives, peak, menu, and quality views | Captured locally under gitignored `captures/milestone-6/`; visual judgment is development evidence, not novice playtest evidence |
| Route/collision agreement | 99 centerline samples per route against a 0.42-radius soft sphere after proxy refinement | Central, High, Lower, and Arc clear; Shelf has two localized Guano Shelf brush samples, max 0.318 m displacement, rather than a blocked corridor |
| Chrome lifecycle | Existing installed-Chrome RC smoke rerun at 1440×900 → 1366×768 | Pass with forced outcomes; startup, GLB, controls, pause/pointer loss, replay, both switches, cleanup, 90 local requests / zero non-local, no errors |
| Resource lifecycle | Exact 50/50/25/25 sequence rerun | Pass; fixed environment baseline and active-mode resources bounded, see `RESOURCE_STRESS_TEST.md` |
| Quality identity | Same seed/state serialized for low, medium, and high in both modes | Exact hashes match within each mode; 34 Bat-mode flock and 42 Snake-mode flock in every profile |
| Performance (Milestone 6 historical) | Installed Chrome, 1920×1080 medium, 180-frame normal/echo/thermal segments | Measured pre-fix baseline; CPU p95 low, headless cadence inconsistent, first echo submit spike 91.4 ms. Milestone 7 removed the activation spike; neither run is a 60 FPS certification |
| Static/offline/vendor | Every source file parsed; browser request audit; `tools/verify-vendor.py` | Pass; zero non-local runtime requests, 19 vendored files / 2 dependencies verified |
| Human RC gates | Audio identity, novice playability/HUD, 20 strikes, 30 difficulty sessions, physical gamepad, stable-browser interaction | Still not tested; Milestone 6 does not resolve them |

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

## Post-fix Bat and Snake usability — 2026-08-01

The Gameplay reference was compared row-by-row with `KEY_ACTIONS`, `GAMEPAD_BUTTONS`, `InputManager.actionDown()`, `actionReleased()`, and `axis()`. Keyboard/mouse and gamepad groups are separate. Standard gamepad labels map as follows: Bat A/RB flap, LT dive, LB brake, B call, Y restart, Menu pause; Snake right stick aim, left stick reposition, X thermal, LT focus, RT strike, LB/RB switch, Y restart, Menu pause. Snake left-stick Y is normalized so up extends like `W`.

| Snake first-run step | Observed result |
|---|---|
| Start and wait three seconds | Normal thermal-off cave view; controller stayed anchored at post 0; no strike state |
| Aim head | Yaw changed from `0` to `-0.041`; anchored-body prompt retired |
| Toggle thermal and identify motion | Thermal became active with 42 registered moving heat sources |
| Focus | Focus blended to `0.81`; prompt identified narrowed flight-path attention |
| Reposition around anchor | D/W input produced `0.49` lateral offset and `0.42` extension |
| Hold and lead | Strike entered `prepare` and reached `0.50` charge after 0.55 seconds |
| Release | `snake-strike-started` emitted; the finite lunge resolved as an overreach miss |
| Recover | Controller returned from `recover` to `idle`; guidance named travel time and recovery |
| Switch post | Q/E changed selected snake from 0 to 1 and retired switch guidance |

At 1920×1080, 1440×900, and 1366×768 the tabbed Gameplay sheet measured 653 CSS pixels high with equal client/scroll height and `scrollTop=0`. Bat/Snake tabs, active-device label, top Close control, keyboard table, and gamepad table remained visible. Opening from pause selected the active animal, closing retained `paused`, and focus returned to the Gameplay button. Browser review reported no page exceptions or remote requests.
