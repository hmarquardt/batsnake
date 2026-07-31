# Performance

## Targets and profiles

The target is 60 FPS at medium on a recent desktop and graceful integrated-GPU behavior. Device pixel ratio is capped at 2 before the quality and user resolution multipliers.

| Profile | Pixel factor | Particles | Flock | Echo histories / returns | Thermal samples | Shadows / bloom |
|---|---:|---:|---:|---:|---:|---|
| Low | 0.70 | 90 | 22 | 1 / 4 | 12 | Off / off |
| Medium | 1.00 | 180 | 34 | 2 / 10 | 48 | 1024 directional / restrained |
| High | 1.25 | 300 | 48 | 3 / 18 | 112 | 1024 directional / restrained |

Render resolution, shadow state, bloom, and particle draw range change immediately. Flock count is allocated when a run starts, so quality changes its density on restart. Physics remains 60 Hz in all profiles.

## Current costs

The cave shell and echo shell share one moderately tessellated tube geometry. Repeated wall rocks, formations, bat regions, and heat regions are instanced. Each placeholder boa uses one 408-vertex continuously deformed tube plus small head/facial meshes; this removes the former sphere-per-segment draw-call pattern. Flock separation remains O(n²), acceptable at the capped slice counts but still the clearest CPU scaling limit. Bloom adds multiple full-screen passes. Shadowed instanced cave detail and high pixel ratio are the principal GPU costs.

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

Quality still controls allocated flock size, so profile changes take effect for the next run. At current profile bases (22/34/48), difficulty density produces approximately 20–57 bat agents; all loops remain bounded. Medium remains the default. The Milestone 3 software-WebGL regression used exact 60 Hz manual steps to verify identical same-seed profile, roles, routes, positions, panic, and alertness across repeated runs; visual frame-rate figures should still be measured on the target hardware.
