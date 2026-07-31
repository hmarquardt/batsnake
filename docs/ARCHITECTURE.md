# Architecture

## Lifecycle and state

`main.js` dynamically imports `App`, so import/WASM startup failures can become a visible field-equipment error instead of a blank page. `App.init()` checks WebGL2, creates the renderer and scene, initializes Rapier, builds the shared cave, creates presentation systems, and only then removes loading. `GameState` owns the small state graph:

`loading → menu → playing ⇄ paused → ended → playing or menu`

Changing mode disposes mode-owned meshes, listeners, sensory state, and HUD before constructing the next mode. Shared cave geometry, renderer, physics world, audio context, settings, and UI shell survive between runs.

## Frame and physics flow

`GameLoop` caps long frame deltas, accumulates time, and runs at most five 1/60-second fixed steps before one variable update and render. Fixed updates advance Rapier, creature controllers, flock decisions, strike trajectories, collision tests, and objectives. Variable updates handle cameras, sensory visuals, atmosphere, audio listener, HUD, FOV, and profiling. This keeps strike and flight behavior stable across variable render rates.

Rapier holds deliberately simple static chamber volumes. Player flight uses a matching soft sphere resolver for readable sliding/collision response; fast snake heads use a swept segment against bat spheres to avoid tunneling. Render detail is never treated as authoritative collision detail.

## Input flow

`InputManager` owns keyboard, pointer button edges, accumulated pointer-lock deltas, and lock errors. Modes consume semantic state directly; no controller attaches its own browser listeners. Pointer-lock loss pauses a live run. The canvas can request lock again after denial. `Escape` and `R` are application actions; creature controls remain mode-local.

## Entity boundaries

`BatPlayer` composes `BatFlightController` and `BatCamera`. The controller owns motion state, not the camera. `BatFlock` owns `BatAgent` simulation data and four instanced render batches: normal bodies/wings and thermal bodies/membranes. This makes a future GLB renderer replaceable without rewriting ecology logic.

`SnakeNetwork` owns three independent `SnakeController`, `SnakeStrike`, `SnakeRig`, and `SnakeAI` sets. The selected controller receives input in snake mode; the rest still make noisy local decisions. The rig only visualizes controller state. A finished skinned/spline GLB can therefore replace it without changing targeting, strike, or scoring rules.

## Sensory systems

`EcholocationSystem` emits an `EcholocationPulse` with world origin, radius, duration, and range. A second chamber surface uses a world-position shader: only the moving band, a short passed-surface trace, and grazing contours contribute. Tagged landmarks create sparse hard returns. The expanding shell is a readable wavefront rather than a brightness switch. Snake rigs subscribe to the pulse event and briefly develop an organic return/awareness response. This version does not solve multi-bounce acoustics; depth-buffer reconstruction and reflected hit clusters are the documented upgrade.

`ThermalVisionSystem` toggles dedicated heat proxy meshes that remain in the normal depth graph, so walls still occlude bats. Body proxies are brighter than membrane proxies. Fog/background move toward cool near-black while transient wake sprites retain motion direction. It is a separate system from snake control; accessibility-through-wall highlighting is intentionally absent.

## Rendering

The renderer uses ACES filmic tone mapping and sRGB output. The chamber shell is a deformed, vertex-colored interior tube; instanced clusters, formations, columns, entrance haze, and deposits break silhouette and repetition. EffectComposer owns the render, restrained bloom, and output passes. Quality settings modify pixel ratio, shadows, bloom, and particle draw range. Fog and darkness are gameplay state, not missing light.

## Audio

`AudioManager` creates one context after an explicit play interaction, with master, effects, ambience, and creature gain buses. The current sound set is generated locally: a filtered noise/low-frequency ambience loop and short positioned oscillator envelopes for calls, reflections, flaps, impacts, strikes, captures, and drips. `CaveAmbience`, `EcholocationAudio`, and `CreatureAudio` are replacement facades for future licensed buffers. The camera updates the Web Audio listener each frame. Failure disables sound and posts a notice without stopping play.

## Assets and failures

`AssetManager` caches GLB, texture, and HDR promises, emits progress/error events, returns `null` for optional assets, and throws descriptive errors for required assets. The first slice is entirely procedural and is therefore playable with every future asset slot empty. `vendor-lock.json` is the source of truth for third-party bytes. Direct file use, WebGL2 failure, Rapier failure, pointer-lock denial, audio denial, and optional asset failure have distinct user-visible paths.

## Event flow

The application `EventBus` carries cross-system facts rather than mutable services: `echolocation-pulse`, `snake-strike-started`, `bat-captured`, `player-collision`, `near-miss`, `thermal-changed`, `snake-switched`, `settings-changed`, `asset-error`, and `notice`. Owners still call their tightly coupled children directly. Unsubscribe functions are stored by modes to prevent listeners leaking across restarts.

## Milestone 2 visual adapters and spatial authority

`SpatialQuerySystem` now owns reusable analytic queries over the authored tunnel and a bounded set of important formations. `CaveGenerator` registers columns, the shelf, major stalactites, and the mouth; `SnakeNetwork` registers live head/coil bounds. Echolocation reflection selection, AI line of sight, thermal-history rejection, bat obstacle anticipation, near-miss distance, and soft player resolution call this service. Three.js remains the render source and Rapier retains fixed colliders for broad walls and the same major obstacle set.

Creature gameplay still terminates at controller state. `BatFirstPersonRig` reads velocity, bank, flap cadence, brake/dive input, and collision/near-miss events. `SnakeRig` deforms one continuous tube along stable Catmull-Rom control points and exposes mouth, capture, heat, echo, visual-state, and body-bound accessors. `SnakeFirstPersonRig` is a camera-local facial adapter. These form the replacement seam for GLB visuals; they do not create a second controller stack.

Echo and thermal profile budgets live in `Settings.profile()`. Both systems expose their latest CPU update time. `PostProcessing` resets and accumulates renderer counters across composer passes, allowing `PerformanceOverlay` to report render time, sensory time, draw calls, triangles, textures, render targets, flock size, particles, and physics cadence. See `SENSORY_RENDERING.md` for the complete sensory pipeline.
