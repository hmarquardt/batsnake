# Model integration

## Pilot and contract

Milestone 3 includes one project-created `hero-bat-pilot.glb` plus sidecar metadata. It is intentionally tiny, locally served, animated, and licensed with the project. `ModelAdapter` consumes bat visual state; it never owns position, flight, collision, heat gameplay, echo gameplay, scoring, or input. `BatFirstPersonRig` remains the safe fallback.

Metadata fields:

| Field | Meaning |
|---|---|
| `assetId`, `localPath`, `license` | Stable identity, repository-relative GLB, reviewed rights |
| `expectedScaleMeters` | Real-world target scale before adapter normalization |
| `forwardAxis`, `upAxis` | DCC/export coordinate contract (+Z, +Y preferred) |
| `namedNodes` | Required or optional semantic transforms |
| `animations` | Semantic state-to-clip names |
| `heatRegions`, `echoRegions` | Nodes registered with sensory adapters |
| `attachmentPoints` | Camera, capture, mouth, or effect transforms |
| `lod` | Optional future level metadata |
| `fallback` | Existing procedural visual class |

The runtime version in `src/assets/ModelMetadata.js` maps semantic names (`root`, `leftWing`, `rightWing`, `head`, `body`, `mouth`) to GLB node names and visual states (`flap`, `glide`, `brake`) to clips. Node names use alphanumerics/underscores because loader animation binding sanitizes punctuation.

## Load sequence and failure policy

1. `AssetManager.glb()` loads and caches the optional local file through the vendored `GLTFLoader`.
2. The adapter validates minimum metadata, clones the scene, applies explicit scale/orientation, and attaches below the first-person camera.
3. Named nodes and clips are resolved. Materials remain inspectable Three.js materials; production adapters may tune only documented presentation properties.
4. An `AnimationMixer` maps controller-derived visual state to fades between clips.
5. Region nodes receive heat metadata and echo response tags. Attachment queries return named transforms without exposing bones to gameplay.
6. Disposal stops actions, removes the root, and disposes cloned geometry/material resources.

Disabled, missing, invalid, oversized/rejected, missing-node, or missing-animation assets emit a restrained notice or return `false`; the procedural rig stays enabled. Optional model failure cannot stop startup. The pilot toggle in Settings exercises this path. A production asset should add asset-specific limits (byte size, triangle/material/texture budget) during inspection before the procedural rig is hidden.

## Replacing the bat or boa

For a bat, normalize to meters/Y-up/+Z, retain center-of-mass root, export named head/body/wing/capture nodes, provide semantic clips listed in `ASSET_MANIFEST.md`, then extend metadata rather than changing the controller. Register torso/head/root/membrane heat separately and an organic echo root. Test all flight states, sensory passes, quality levels, missing parts, disposal, and fallback.

For a future boa, the same adapter concept consumes anchor, head/direction, tension, strike state, awareness, and capture state. The GLB must expose mouth/jaw, head heat pits, body heat/echo regions, capture transform, and a spline/skinning control seam. `SnakeController`, `SnakeStrike`, and `SnakeMemory` remain authoritative.

Before any external asset is copied into the repository, update `LICENSES.md` with author, exact source/version, required attribution, commercial use, modification, redistribution, retrieval date, and modifications. Unknown-license files are rejected.

