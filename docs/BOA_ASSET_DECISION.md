# Cuban boa asset decision — Milestone 7

## Decision: retain and finish the procedural rig

The existing procedural boa remains the production path for this browser budget. This is an explicit game-quality decision, not a refusal to use a conventional asset. The animal's spline is already the exact visual expression of authoritative `SnakeController` and `SnakeStrike` state, preserves deterministic strike geometry, shares one body topology across normal/thermal/echo views, and costs no network, skinning, decoder, or asset-pipeline complexity.

A skinned GLB could improve static facial topology and authored scales, but it would still need procedural spline guidance, strike-state adaptation, three sensory registrations, anchor wrapping, and capture attachment. It would therefore add a skeleton/mixer and a second deformation contract without fixing support contact or timing readability by itself.

## Review performed

The rig was reviewed from Snake first-person, normal third-person, thermal/echo registrations, idle anchor posture, full charge, lunge, recovery, and capture. Fixed local review frames are under the gitignored `captures/milestone-7/` set. Automated state forcing verifies presentation only; human first-run/readability gates remain open.

The five most obvious weaknesses were:

1. The head read as stacked ellipsoids, with a blunt snout and weak cranial plane.
2. The body-to-head transition narrowed abruptly and exposed the procedural seam on side passes.
3. Three identical torus coils looked detached from stone and did not visibly compress with charge.
4. The lower jaw was one rounded mass, so gape and mouth contact lacked anatomical structure.
5. The fallback captured bat sat shallowly at the mouth and the anchored body did not react enough to the struggle.

## Production pass

The retained path now adds a tapered neck bridge, a flatter rostral plane, paired mandible rails, four varied/asymmetric support coils, anchor-specific wrap offsets, tighter coil compression during charge, restrained coil reaction during capture, and a larger/deeper mouth attachment. The existing heat-pit rows, eye placement, forked tongue, generated scale-relief texture, deterministic dorsal/lateral color pattern, S-curve, traveling lunge power wave, miss-specific recovery, thermal head/body regions, and organic echo regions remain.

Gameplay still owns charge, release, swept strike, miss classification, capture, and recovery timing. The rig consumes those states and cannot move a hit test or change simulation. Capture remains brief and non-gory.

## Budget comparison

| Concern | Procedural production path | Skinned GLB path |
|---|---|---|
| Strike integration | Direct Catmull-Rom control from authoritative state | Requires skeleton-to-spline adaptation |
| Runtime deformation | 560 vertices / 1,092 triangles per body, shared by normal/heat/echo | Skinning plus spline guidance; unknown until asset exists |
| Facial fidelity | Improved bounded primitives; still stylized | Potentially stronger authored skull/jaw topology |
| Anchor contact | Direct per-anchor coil placement and compression | Requires attachment/IK or authored variants |
| Sensory registration | Existing exact body/head meshes | Additional node/region metadata and validation |
| Lifecycle | Mode-owned resources, exercised by stress test | New mixer, skeleton clone, texture, and disposal paths |
| Asset/dependency risk | Project-owned code and generated texture | New local asset pipeline, provenance, and fallback |

The procedural path wins for this milestone because its remaining limitations are presentation details, while a GLB's largest costs are integration details. A future replacement is justified only if a reviewed asset demonstrably improves close facial and coil contact quality within the same simulation and resource budgets.
