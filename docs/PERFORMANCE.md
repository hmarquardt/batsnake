# Performance

## Targets and profiles

The target is 60 FPS at medium on a recent desktop and graceful integrated-GPU behavior. Device pixel ratio is capped at 2 before the quality and user resolution multipliers.

| Profile | Pixel factor | Particles | Flock | Echo histories / returns | Thermal samples | Shadows / bloom |
|---|---:|---:|---:|---:|---:|---|
| Low | 0.70 | 90 | 34 | 1 / 4 | 12 | Off / off |
| Medium | 1.00 | 180 | 34 | 2 / 10 | 48 | 1024 directional / restrained |
| High | 1.25 | 300 | 34 | 3 / 18 | 112 | 1024 directional / restrained |

Render resolution, shadow state, bloom, sensory persistence, and particle draw range change with quality. Simulated flock count is fixed at the medium boundary (34 in bat mode, 42 in snake mode after the mode supplement), so cosmetic quality cannot change encounter outcomes. Physics remains 60 Hz in all profiles.

## Current costs

The cave shell and echo shell share one moderately tessellated tube geometry. Repeated wall rocks, three eroded formation profiles, guano, mineral streaks, vegetation, flock bodies, and heat regions are instanced. Each boa uses one 560-vertex / 1,092-triangle continuously deformed body shared by its normal, heat, and echo presentations, plus bounded head/facial meshes and three coil loops. Flock separation remains O(n²), acceptable at the fixed slice counts but still the clearest CPU scaling limit. Bloom adds multiple full-screen passes. Shadowed instanced cave detail and high pixel ratio are the principal GPU costs.

The milestone software-WebGL capture run at 756×414 reported 81 accumulated composer calls, about 92.8k triangles, 19 textures, and two composer render targets in the high-profile bat scene. At this diagnostic resolution, the overlay held 60 FPS; these numbers are for regression comparison, not a discrete-GPU benchmark. Isolated sensory updates are normally below timer resolution and are displayed separately from total render time.

## Profiling

Enable **Performance overlay** in Settings. It reports rolling FPS/frame time, composer render time, sensory CPU time, accumulated draw calls and triangles, texture/render-target count, active bats, particle budget, and fixed physics rate. For deeper work, use the browser Performance panel for a 10-second bat flight and a 10-second thermal hunt separately. Inspect `renderer.info`, long animation frames, shader compilation, and Web Audio graph lifetime. Profile at native and 1.5× device pixel ratio and record viewport/GPU with captures.

## Optimization path

1. Replace O(n²) separation with a small uniform spatial hash.
2. Move the production boa to a skinned/spline GLB while retaining the current single-mesh deformation budget.
3. Allocate thermal proxies only for the high/medium flock subset; use a single billboard impostor at distance.
4. Add frustum/distance gates for formation shadows and echo landmarks.
5. Optionally replace high’s bounded world-space history with a quarter-resolution motion-aware temporal target after measuring occlusion artifacts.
6. Add measured ambient occlusion only if GPU budget remains; the first slice deliberately omits a costly AO pass.
7. Pool impact rings and wake sprites after production effect counts grow.

The game avoids per-frame geometry/material/texture allocation, remote resources, unbounded emitters, and high-detail mesh collision. Echo clusters and thermal history use fixed pools; shared query records and creature matrices are reused. The O(n²) flock neighbor loop and full-scene heat-emitter traversal remain the largest CPU cleanup opportunities.

## Milestone 3 budgets and profiling

The director is one constant-size phase calculation. Route occupancy is one bounded pass over the existing flock, five route counters are reused, every snake owns five decaying route values, and random streams hold a single integer state. Behavioral histories and call/strike events cannot grow with session length. The pilot GLB adds one small mixer, three actions, three triangle meshes, and four sensory proxies only when enabled.

The debug overlay now includes session seed, director phase/time, five route occupancies, panic count, average snake alertness, and active input device. Profile peak traffic rather than stillness: use a fixed seed, advance to the peak phase, record ten seconds with and without thermal/echo, and compare director, sensory, flock, fixed-step, and render timing. Same-seed samples make regressions comparable.

Milestone 4 fixes the simulated flock at the previous medium boundary. A paused-loop construction test produced identical SHA-256 snapshots across low, medium, and high for both modes (`724cf7…` for 34 bat-mode agents and `d9d6bf…` for 42 snake-mode agents). All loops remain bounded and medium remains the default.

## Milestone 4A hero-bat budget

The production hero bat is 70,824 bytes, 782 triangles, 547 vertices, 15 bones, three materials, zero textures, one active mixer, and six clips. Runtime metadata rejects more than 900 triangles, 15 bones, three materials, or zero textures before hiding the procedural fallback. The model adds three creature draw calls; regional heat uses six tiny proxy meshes only when the adapter is active. The flock retains its seven instanced normal/thermal batches to avoid per-animal mixers and skinned draws. No render target or quality-dependent gameplay behavior was added.

## Milestone 4 measured profile

Chrome WebGL2 (`ANGLE Metal Renderer: Apple M2`) was measured at 1920×1080 with all agents released, panic active, and thermal active in snake mode. Each row is 120 animation frames. Frame times include vsync and therefore demonstrate sustained presentation rather than isolated GPU time.

| Quality | Mode | Median / p95 / max frame | Submit p95 | Sensory CPU p95 | Calls | Triangles | Renderer textures |
|---|---|---:|---:|---:|---:|---:|---:|
| Low | Bat | 16.7 / 17.5 / 17.7 ms | 1.5 ms | <0.1 ms | 173 | 107,709 | 27 |
| Low | Snake thermal | 16.7 / 17.6 / 17.7 ms | 1.5 ms | 0.1 ms | 208 | 131,829 | 27 |
| Medium | Bat | 16.7 / 17.5 / 17.7 ms | 2.1 ms | <0.1 ms | 203 | 137,416 | 30 |
| Medium | Snake thermal | 16.7 / 17.6 / 17.7 ms | 1.8 ms | 0.1 ms | 238 | 162,800 | 30 |
| High | Bat | 16.7 / 17.5 / 33.4 ms | 1.8 ms | <0.1 ms | 203 | 137,416 | 33 |
| High | Snake thermal | 16.7 / 17.6 / 17.7 ms | 2.0 ms | 0.1 ms | 238 | 162,800 | 33 |

The composer owns two full-resolution RGBA16F buffers and bloom owns one half-resolution bright buffer plus ten half-resolution-downsampled RGBA16F buffers: 13 bounded render targets, unchanged by Milestone 4. Approximate color allocation at device scale 1 is 23.7 MB low, 48.4 MB medium, and 75.6 MB high. Milestone 4 adds six cave `DataTexture`s (four 128² limestone/roughness maps and two 64² alpha masks) plus one shared 128² boa scale map, about 0.45 MB including generated mip levels. It adds no downloaded texture bytes.

No unbounded geometry, trail, echo-history, event, or mixer collection is used. Thermal trails cap at 112, echo histories at three, echo return pools at the profile limit, impact effects use existing bounded lifetimes, and each captured model load is generation/disposal guarded. Avoidable per-frame color allocation in thermal cave blending was removed. Snake body deformation updates 1,680 position and normal components per animal per frame; the measured sensory CPU figure includes heat traversal/trails but the browser does not expose a separate reliable deformation timer, so that cost remains a profiling limitation.
