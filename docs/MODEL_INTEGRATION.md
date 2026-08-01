# Model integration

## Production bat and contract

Milestone 4 replaces the Milestone 3 pilot at runtime with the project-created `hero-bat.glb` and `hero-bat.metadata.json`. The deterministic generator uses only Python’s standard library and creates the mesh, 15-bone skin, three materials, attachments, and six clips. `ModelAdapter` consumes bat visual state; it never owns position, flight, collision, heat gameplay, echo gameplay, scoring, or input. `BatFirstPersonRig` remains the complete safe fallback.

Metadata fields:

| Field | Meaning |
|---|---|
| `assetId`, `path`, `license` | Stable identity, repository-relative GLB, reviewed rights |
| `expectedScale`, `maxBytes`, `maxTriangles`, `maxBones`, `maxMaterials`, `maxTextures` | Normalization and hard presentation budgets |
| `forwardAxis`, `upAxis` | DCC/export coordinate contract (+Z, +Y preferred) |
| `nodes` | Required semantic transforms |
| `animations` | Semantic state-to-clip names |
| `heatRegions`, `echoRegions` | Nodes registered with sensory adapters |
| `attachments` | Camera, capture, mouth, or effect transforms |
| `lod` | Optional future level metadata |
| `fallback` | Existing procedural visual class |

The runtime version in `src/assets/ModelMetadata.js` maps semantic names to GLB nodes and the states `flap`, `glide`, `brake`, `dive`, `panic`, and `captured` to clips. Node names use alphanumerics/underscores because loader animation binding sanitizes punctuation. Heat descriptors identify torso, head, paired wing roots, and paired membranes independently.

## Load sequence and failure policy

1. `AssetManager.glb()` loads and caches the optional local file through the vendored `GLTFLoader`.
2. The adapter validates the complete metadata boundary, skeleton-clones the scene, applies explicit scale/orientation, and attaches below the first-person camera.
3. Named nodes and clips are resolved. Materials remain inspectable Three.js materials; production adapters may tune only documented presentation properties.
4. One `AnimationMixer` maps controller-derived visual state to one-time cross-fades between clips. Brake/dive poses have a short readability hold; captured plays once and clamps.
5. Region nodes receive heat metadata and echo response tags. Attachment queries return named transforms without exposing bones to gameplay.
6. Disposal stops actions, removes the root, and disposes cloned geometry/material resources.

Disabled, missing, invalid, oversized/rejected, missing-node, or missing-animation assets emit a restrained notice or return `false`; the procedural rig stays enabled. It is hidden only after the full production contract succeeds. Optional model failure cannot stop startup. The Settings toggle exercises this path.

## Milestone 4 hero-bat budget

| Bytes | Triangles | Vertices | Bones | Materials | Textures | Mixers | Clips |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 70,824 | 782 | 547 | 15 | 3 | 0 | 1 | 6 |

Integrated bounds are 0.4194 × 0.0606 × 0.2029 m at runtime scale, Y-up and +Z forward, with the root at center of mass. First-person placement keeps head and torso below frame; wing effort enters at the lower periphery during flap/brake. Captured prey reuses the same asset and `CapturePoint`, with late loads disposal-guarded and repeated one-shot capture clips restarted. Flock rendering deliberately remains the bounded instanced procedural representation: three normal draws plus four sensory batches serve the fixed gameplay count without one mixer per bat.

## Replacing the bat or boa

For a bat, normalize to meters/Y-up/+Z, retain center-of-mass root, export named head/body/wing/capture nodes, provide semantic clips listed in `ASSET_MANIFEST.md`, then extend metadata rather than changing the controller. Register torso/head/root/membrane heat separately and an organic echo root. Test all flight states, sensory passes, quality levels, missing parts, disposal, and fallback.

For a future boa, the same adapter concept consumes anchor, head/direction, tension, strike state, awareness, and capture state. The GLB must expose mouth/jaw, head heat pits, body heat/echo regions, capture transform, and a spline/skinning control seam. `SnakeController`, `SnakeStrike`, and `SnakeMemory` remain authoritative.

Before any external asset is copied into the repository, update `LICENSES.md` with author, exact source/version, required attribution, commercial use, modification, redistribution, retrieval date, and modifications. Unknown-license files are rejected.
