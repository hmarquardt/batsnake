# Asset manifest and replacement candidates

Procedural placeholders are project-created and safe to ship. No unknown-license asset may enter `assets/`. Production files use meters, Y-up, forward +Z, and origins described below. GLB is preferred; textures use PNG/JPEG/KTX2 only after the required local decoder is vendored and pinned.

| Priority / asset | Purpose and visual description | Scale, format, orientation, origin | Animation / geometry budget | Textures / LOD | Placeholder and integration | Source / license |
|---|---|---|---|---|---|---|
| 1 Cuban boa | Realistic adult *Chilabothrus angulifer*; detailed head, heat pits, eyes, jaw, tongue, irregular scales, suspended muscular coils | 2.5–4 m body; GLB; Y-up, +Z head-forward; root at ceiling anchor, head child addressable | 45–70k triangles hero, 20k mid; clips `idle_breathe`, `tongue_flick`, `prepare`, `strike`, `recoil`, `capture`, `jaw_open`; spline-compatible spine or 48+ bones | 2× 4K sets hero: base color, normal, ORM; optional subtle mouth transmission; LOD 35k/12k/3k | Continuous procedural tube/head in `SnakeRig`; consume `getVisualState()`, `getMouthWorldPosition()`, `getCaptureAttachment()`, `getBodyBounds()`, heat emitters, and echo responders. Controller remains authoritative | Commission or scan-derived model with species review. License pending; commercial modification required |
| 2 Cave bat | Cuban cave bat silhouette with legible ears/muzzle and anatomically articulated fingers/membrane | 0.25–0.45 m wingspan; GLB; Y-up, +Z flight; origin at center of mass | 18–28k hero, 5–8k near-flock; clips `flap`, `glide`, `bank_l`, `bank_r`, `dive`, `climb`, `panic`, `fold`; distant GPU animation variant | 2K base/normal/ORM plus opacity or transmission membrane; LOD 20k/7k/1.5k/200-tri impostor | Articulated procedural flock and `BatFirstPersonRig`; adapter reads speed, bank, flap, brake, dive, collision, and panic without owning flight. Preserve regional heat registration | Commission or museum/open biodiversity source only after license review; pending |
| 3 Cave rock kit | Tropical solution-cave wall modules, shelves, columns, broken limestone; no repeated boulder look | 0.5–8 m; GLB; Y-up; origins at support plane | 6–30k per hero module; collision proxy meshes separate | 2–4K tileable limestone plus macro masks; 3 LODs; vertex colors for wetness/stain | Deformed tube, instanced icosahedra, three columns | Photogrammetry or authored kit; CC0/commercial-modifiable required; pending |
| 4 Stalactites / stalagmites | Water-shaped formations with broken tips, soda straws, merged bases | 0.2–8 m; GLB; Y-up; ceiling assets origin at attachment | 500–8k each; grouped instancing variants | Shared 2K limestone atlas; 2 LODs | Instanced tapered cones in `CaveGenerator` | Authored/scan source; license pending |
| 5 Wet limestone material | Dark gray-green limestone with believable calcite, wet films, runoff roughness | Material package; meter-scaled UV/triplanar | N/A | 2K/4K base color, normal, roughness, AO, height; wetness macro mask | Vertex color plus physical roughness/clearcoat materials | Substance/authored or CC0 library; exact license pending |
| 6 Guano / mineral decals | Matte guano accumulation, pale calcite runs, iron/manganese staining | 0.25–3 m decals; glTF planes or local textures | <200 triangles each | 1–2K RGBA base/normal/roughness; atlas preferred | Procedural dark floor circles and vertex stains | Project-created or CC0; pending production |
| 7 Cave debris | Limestone chips, shed organic fragments, roots near entrance | 0.03–1 m; GLB; origin at contact point | 100–3k each; instanced | 1–2K shared atlas; LOD/impostor | Small rock cluster silhouettes | Authored/scan source; license pending |
| 8 Mist / dust | Irregular humidity sheet, dust motes, droplet streaks without magical sparkle | PNG sprite sheets or small volume texture | Quad particles; 8–16 frame sheets | 512–1024 RGBA; one low-res variant | Procedural points/sprites in effects modules | Project-created simulation/render; license project-owned |
| 9 Creature audio | Close/distant wingbeats, bat social/panic calls, boa scales/coils, tongue, strike, restrained capture | WAV masters, OGG runtime; mono for position, 48 kHz | Loop-clean and one-shot variations; peaks normalized conservatively | 3–6 variations per action; distance layers | Web Audio oscillators/noise in audio facades | Original field recording or licensed library with commercial edit rights; pending |
| 10 Cave ambience | Deep room tone, sparse drips, distant colony, entrance air; no music bed | WAV masters, OGG runtime; mono positional plus stereo bed, 48 kHz | 2–4 minute seamless beds, randomized one-shots | Low/medium bitrate variants if measured | Generated filtered-noise bed and positional drip tones | Original field recording or clearly licensed archive; pending |

## Additional future assets

- Entrance HDR/environment: overcast tropical moonlit exterior, 2K RGBE/HDR, local only, used primarily for reflection/light probe; license pending.
- Rock normal detail and particle atlases: derive in-house when possible so distribution and modification are unambiguous.
- UI symbols: project-authored SVG for echo, heat, reserve, threat, and anchor identity; avoid icon libraries.
- Documentary field text: fact-check species/location claims before release and record editorial sources separately from distributable asset licenses.

## Integration procedure

1. Record the candidate’s source, author, exact license/version, attribution, commercial/modification status, and retrieval date in `LICENSES.md` before copying bytes.
2. Normalize in DCC to meters, Y-up, +Z forward, specified origin, named materials, and clip names. Keep source files outside runtime if their redistribution license differs.
3. Export GLB with no external URI. Validate scale, normals, tangents, animation loops, bounds, and browser decoder requirements.
4. Add an optional `AssetManager` load with procedural fallback. Never delete the fallback until the production asset passes low-profile testing.
5. Connect visuals to the existing controller interface; do not move strike, scoring, flock, or sensory logic into the asset.
6. Measure triangles, textures, draw calls, GPU time, memory, and LOD transitions. Update this manifest and `PERFORMANCE.md` with observed numbers.
7. If a decoder becomes necessary, vendor only its exact browser files and update `vendor-lock.json`, `LICENSES.md`, and both vendor tools.

## Visual adapter contract

`src/entities/CreatureVisualState.js` defines the shared JSDoc records. A bat replacement must accept wing state, speed, bank, flap/glide/brake/dive, collision impulse, and panic; register torso/head/root/membrane heat regions; and provide bounds without modifying `BatFlightController`. A boa replacement must accept anchor, head position/direction, charge, awareness, and strike state; expose mouth/capture transforms and body bounds; and register separate head/body heat and echo responders. GLB animation clips are blended by the adapter from these parameters—gameplay code never selects bones or materials directly.

The deterministic limestone color/roughness `DataTexture`, mineral streak geometry, entrance haze, bat/boa meshes, and all sensory markers are project-created runtime placeholders. They introduce no external license or runtime file request.

## Milestone 3 GLB pilot

| Asset | Purpose | Runtime file / metadata | Scale and axes | Nodes / clips | Sensory and attachments | License / fallback |
|---|---|---|---|---|---|---|
| Hero bat pipeline pilot | Validate one complete production-model seam; intentionally not final art | `assets/models/bats/hero-bat-pilot.glb`; `hero-bat-pilot.metadata.json`; generated by `tools/create-pilot-glb.py` | 0.36 m expected span; Y-up; +Z forward; center-of-mass root | `HeroBat`, `Body`, `Head`, `Wing_L`, `Wing_R`, `Mouth`; `flap`, `glide`, `brake` | Body/head/wing heat regions; organic root echo; head camera and body capture attachments | Project-created MIT asset; `BatFirstPersonRig` on disabled/missing/invalid/node/clip failure |

The pilot is 2,584 bytes and uses no textures or external buffers. It verifies animation mixing, material inspection, normalized scale, coordinate correction, named transforms, optional sensory registration, disposal, and the Settings opt-out. See `MODEL_INTEGRATION.md` for the schema and production handoff.

## Milestone 4 production hero bat

| Asset | Creation and rights | Runtime specification | Animation and sensory contract | Fallback / lower cost |
|---|---|---|---|---|
| Hero bat | Original Batsnake geometry, skin, materials, and animation; deterministically generated by `tools/create-hero-bat-glb.py`; MIT; no external bytes | `assets/models/bats/hero-bat.glb` (70,824 bytes) plus `hero-bat.metadata.json`; 0.4194 m span, Y-up, +Z forward; 782 triangles, 547 vertices, 15 bones, 3 materials, 0 textures | `flap`, `glide`, `brake`, `dive`, `panic`, `captured`; torso/head/wing-root/membrane heat; organic root echo; mouth/capture transforms | `BatFirstPersonRig` for every failure/opt-out; existing instanced procedural flock retained as the documented lower-cost representation |

## Milestone 4 procedural production assets

| Asset | Creation / runtime form | Budget and contract | Failure behavior |
|---|---|---|---|
| Boa visual | Original deterministic Three.js geometry and 128² generated scale-relief map in `SnakeRig.js`; MIT | Per animal: one 560-vertex / 1,092-triangle body geometry shared by normal, heat, and echo meshes; bounded head, jaw, eyes, ten heat pits, tongue, three coils; no bones or mixer | No file load exists; the procedural animal is the complete production/fallback path and preserves `SnakeController` / `SnakeStrike` interfaces |
| Cave surface kit | Original deterministic displacement, vertex color, instancing, and six generated `DataTexture`s in `CaveGenerator.js` / `CaveMaterials.js`; MIT | Four 128² limestone/roughness maps, two 64² alpha masks; three formation profiles; batched rock, deposits, runoff, guano, vegetation, and Narrows curtain; established collisions/routes unchanged | No file load exists; shader/material failure follows the existing WebGL startup error, while optional creature assets remain independent |
| Procedural audio | Original Web Audio synthesis/noise in `AudioManager.js`; MIT | One 2-second mono noise buffer, one 16-second stereo ambience buffer, bounded event one-shots and at most ten delayed reflections per call | Web Audio denial/unavailability posts one notice and play continues silently |
