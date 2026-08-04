# Sensory performance — Milestone 7

## Decision

The Milestone 6 first-deep-call spike was reproducible and avoidable. A cold deep call measured 71.8 ms in `App.render()` in the isolated attribution run (the earlier environment diagnostic measured 91.4 ms). Emission JavaScript was only 1.3 ms. Hiding all 32 cave echo surfaces still left a 52.7 ms first render and one new program, proving the newly allocated pulse sphere/shader was a major source. Activating the cave response without a pulse measured 61.3 ms and two new program variants. Disabling bloom did not remove the spike (60.7 ms). Web Audio was muted for these attribution runs.

The fix uses one application-lifetime pulse geometry/material and prewarms the actual bounded cave echo renderables while the loading screen is present. Prewarm temporarily hides unrelated renderables, compiles the selected profile's exact objects, submits them to a 2×2 local render target, restores all visibility/uniform state, and disposes the temporary target. It emits no pulse, starts no mode or encounter timer, and makes no request.

On the development M2 at Medium, the post-fix first deep render was 3.3 ms in the isolated cold-page check. A separate fresh Snake-first page measured first thermal at 17.8 ms; every other final sensory activation was 3.0 ms or less. This meets the milestone's under-33-ms activation-submit target. Headless cadence is not claimed as sustained 60 FPS or GPU time.

## Setup

- Date: 2026-08-03
- Browser: Google Chrome 150.0.7871.187, headless, WebGL2
- OS / machine: macOS 15.6.1 (24G90), MacBook Air Mac14,2
- GPU: Apple M2 8-core GPU through ANGLE Metal
- Viewport: 1440×900
- Quality: Medium, resolution scale 1
- Audio: master volume zero for render attribution
- Hero bat GLB: disabled to isolate sensory rendering
- Timer: `performance.now()` around activation, `App.update()`, and `App.render()`; renderer counters before/after

The browser exposed program and renderer memory counters, but not reliable per-draw geometry-upload bytes, texture-upload bytes, or GPU duration. “Submit” below is the CPU duration of the renderer/composer call.

## Post-fix activation matrix

| Activation | Activation JS | Render p95 / max | Update p95 / max | Programs before → after | Renderer geometry before → after | Textures | RTs | Draw-call delta at sampled endpoints |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| First quick call | 1.1 ms | 2.3 / 2.5 ms | 0.3 / 0.3 ms | 62 → 62 | 136 → 138 | 26 → 26 | 13 | +32 |
| First deep call after quick | 0.6 ms | 2.2 / 3.0 ms | 0.2 / 0.3 ms | 62 → 62 | 140 → 140 | 26 → 26 | 13 | +2 at endpoint; pulse memory was already active |
| Second deep call | 0.4 ms | 2.0 / 2.0 ms | 0.2 / 0.3 ms | 62 → 62 | 141 → 141 | 26 → 26 | 13 | Endpoint varied with encounter traffic |
| First thermal activation, fresh Snake-first page | 0.4 ms | 1.9 / 17.8 ms | 0.3 / 0.4 ms | 57 → 62 | 115 → 123 | 25 → 25 | 13 | +13; 12 trail slots active |
| Second thermal activation | 0.2 ms | 1.6 / 1.8 ms | 0.2 / 0.2 ms | 59 → 59 | 142 → 142 | 26 → 26 | 13 | +2 |
| First thermal focus | 0.1 ms | 1.9 / 2.9 ms | 0.2 / 0.2 ms | 59 → 59 | 142 → 142 | 26 → 26 | 13 | Encounter-dependent |
| First snake biological return | 0.1 ms | 2.4 / 3.0 ms | 0.2 / 0.3 ms | 62 → 62 | 142 → 142 | 26 → 26 | 13 | Organic response resources already resident |

The sequence used one fixed Bat seed and one fixed Snake seed. Pool use remained bounded: quick scheduled four return slots, deep scheduled at most ten, and thermal retained its fixed 112-slot allocation with profile-limited active samples. Material/scene-count changes late in the Bat sequence were caused by encounter/capture presentation appearing and disappearing while the loop continued; program, renderer texture, and post-fix sensory resource counts did not grow at activation.

## Startup tradeoff

The selected-profile prewarm measured 73.7 ms total: 56.6 ms asynchronous compile plus 16.9 ms offscreen submit. It compiled 23 exact program variants observable at that point, covers 32 authored echo renderables plus the shared pulse, and allocated one temporary 2×2 render target that was disposed before menu. A page-ready sample measured 264.5 ms; a second same-browser page measured 401.6 ms, demonstrating enough headless scheduling variance that these page-ready figures are not used to claim a cache benefit. The internal prewarm timer is the defensible incremental cost.

A roughly 74 ms loading-stage cost is accepted in exchange for removing the 60–90 ms gameplay hitch. No fake percentage was added; the loading message reads “Preparing sensory field…”.

## Allocation and lifecycle audit

- `EcholocationPulse` no longer constructs or disposes geometry/material per call. One bounded application-lifetime resource is shared by every session.
- Cave echo materials and histories remain shared and bounded; per-draw landmark uniforms are mutated, not allocated.
- `EchoReturnPool` is mode-owned and fixed at 24 slots. It creates one geometry/material per Bat mode and disposes both with the mode.
- `ThermalVisionSystem` creates one fixed 112-slot instanced pool per Snake mode and disposes it with the mode.
- A fresh Snake-first thermal activation still initializes five programs and eight renderer geometries, but its 17.8 ms maximum remained below the 33 ms target. Prewarming that additional mode-specific matrix was rejected to keep startup bounded.
- No sensory activation creates a texture, render target, animation mixer, or unbounded Web Audio graph.
- The rerun of 50 Bat restarts, 50 Snake restarts, 25 switches, and 25 same-seed replays returned to bounded baselines. See `RESOURCE_STRESS_TEST.md`.

## Remaining limitation

These runs prove CPU update/submit behavior and bounded browser resources on the named setup. They do not provide GPU timing, quantify GPU headroom, or complete the RC's human interactive 1920×1080 performance gate.
