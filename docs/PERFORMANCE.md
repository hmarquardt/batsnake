# Performance

## Targets and profiles

The target is 60 FPS at medium on a recent desktop and graceful integrated-GPU behavior. Device pixel ratio is capped at 2 before the quality and user resolution multipliers.

| Profile | Pixel factor | Particles | Flock target | Shadows | Bloom |
|---|---:|---:|---:|---|---|
| Low | 0.70 | 90 | 22 | Off | Off |
| Medium | 1.00 | 180 | 34 | 1024 directional | On, restrained |
| High | 1.25 | 300 | 48 | 1024 directional | On, restrained |

Render resolution, shadow state, bloom, and particle draw range change immediately. Flock count is allocated when a run starts, so quality changes its density on restart. Physics remains 60 Hz in all profiles.

## Current costs

The cave shell and echo shell share one moderately tessellated tube geometry. Repeated wall rocks, formations, all bat bodies, all bat wings, and both thermal bat layers are instanced. Three placeholder snakes use individual segments for deformation and are the largest avoidable draw-call group. Flock separation is currently O(n²), acceptable at the capped slice counts but the clearest CPU scaling limit. Bloom adds multiple full-screen passes. Shadowed instanced cave detail is the principal GPU cost.

## Profiling

Enable **Performance overlay** in Settings. It reports rolling FPS/frame time, renderer draw calls and triangles, texture count, active bats, particle budget, and the fixed physics rate. For deeper work, use the browser Performance panel for a 10-second bat flight and a 10-second thermal hunt separately. Inspect `renderer.info`, long animation frames, shader compilation, and Web Audio graph lifetime. Profile at native and 1.5× device pixel ratio.

## Optimization path

1. Replace O(n²) separation with a small uniform spatial hash.
2. Instance snake segments per material or move the production rig to skinning.
3. Allocate thermal proxies only for the high/medium flock subset; use a single billboard impostor at distance.
4. Add frustum/distance gates for formation shadows and echo landmarks.
5. Render thermal wakes into a quarter-resolution temporal target on high, disable on low.
6. Add measured ambient occlusion only if GPU budget remains; the first slice deliberately omits a costly AO pass.
7. Pool impact rings and wake sprites after production effect counts grow.

The game avoids per-frame texture allocation, remote resources, unbounded particle emitters, and high-detail mesh collision. Temporary vector allocation remains an improvement opportunity in flock and collision code.
