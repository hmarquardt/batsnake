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

`GameplayMenu` is a persistent UI reference built from those implemented bindings, reachable from both menu and pause states. Bat/Snake tabs keep keyboard/mouse and gamepad maps legible at narrower desktop heights, while input-device events select the emphasized map. It owns modal focus/return focus but never changes game phase; opening it over pause leaves the run paused. Contextual onboarding remains optional, transient, action-gated, and cleared when a mode is disposed.

## Entity boundaries

`BatPlayer` composes `BatFlightController` and `BatCamera`. The controller owns motion state, not the camera. `BatFlock` owns `BatAgent` simulation data and four instanced render batches: normal bodies/wings and thermal bodies/membranes. This makes a future GLB renderer replaceable without rewriting ecology logic.

`SnakeNetwork` owns three independent `SnakeController`, `SnakeStrike`, `SnakeRig`, and `SnakeAI` sets. The selected controller receives input in snake mode; the rest still make noisy local decisions. The rig only visualizes controller state. A finished skinned/spline GLB can therefore replace it without changing targeting, strike, or scoring rules.

## Sensory systems

`EcholocationSystem` emits a quick or deep `EcholocationPulse` with world origin, radius, duration, range, and acoustic-memory envelope. Shared cave-material history uniforms produce the moving band, recent passed-surface trace, procedural ridges, and grazing contours. The shared spatial service selects delayed hard returns from walls, floor/shelf, columns, mouth, and nearby organic responders. The shell remains a readable wavefront rather than a brightness switch; this is an authored reflection model, not multi-bounce acoustic simulation.

`App.init()` owns one bounded echolocation pulse geometry/material for the application lifetime. Before menu, an echo-only loading pass compiles the selected profile's actual authored echo renderables and submits them to a temporary 2×2 target, then restores visibility/uniforms and disposes the target. Calls therefore mutate pooled state rather than constructing shader materials or geometries. This prewarm never creates a mode or advances encounter state; diagnostics are exposed through `App.sensoryDiagnostics` and the optional performance overlay.

`ThermalVisionSystem` toggles registered regional heat meshes that remain in the normal depth graph, so walls still occlude bats. Torso, head, root, membrane, snake head, and snake body retain distinct values. Fog/background move toward cool near-black while a bounded profile-specific world-space history retains motion direction. Focus adjusts local/peripheral clarity without selecting a target. It remains separate from snake control; accessibility-through-wall highlighting is intentionally absent.

## Rendering

The renderer uses ACES filmic tone mapping and sRGB output. `CaveGenerator` builds one authored variable elliptical shell and named landmark sequence around the unchanged route network. Instanced breakdown, ceiling ribs, fangs, roost silhouettes, vegetation, and distant scenery bound repeated detail; hero columns, draperies, shelves, and fallen sections carry distinctive silhouettes. Locally generated limestone, seep, bedding, fracture, guano, and vegetation maps require no asset request. Dormant echo copies are hidden outside an active call.

`caveSectionAt()` is the common macro envelope for shell construction, soft collision, and nearby wall returns. Solid landmarks use simplified compound sphere proxies; cavity, roost, and mouth response volumes reflect sound but never resolve as physical solids. EffectComposer owns the render, restrained bloom, and output passes. Quality settings modify pixel ratio, shadows, bloom, sensory history, and bounded particle/distant detail only. Fog and darkness are gameplay state, not missing light.

## Audio

`AudioManager` creates one context after an explicit play interaction, with master, effects, ambience, and creature gain buses. The current sound set is generated locally: a filtered noise/low-frequency ambience loop and short positioned oscillator envelopes for calls, formation-specific reflections, flaps, impacts, strikes, captures, and drips. `CaveAmbience` weights drips, colony wings, open-air wind, entrance insects, and deep resonance from camera region and existing encounter density. The camera updates the Web Audio listener each frame. Failure disables sound and posts a notice without stopping play.

## Assets and failures

`AssetManager` caches GLB, texture, and HDR promises, emits progress/error events, returns `null` for optional assets, and throws descriptive errors for required assets. The first slice is entirely procedural and is therefore playable with every future asset slot empty. `vendor-lock.json` is the source of truth for third-party bytes. Direct file use, WebGL2 failure, Rapier failure, pointer-lock denial, audio denial, and optional asset failure have distinct user-visible paths.

## Event flow

The application `EventBus` carries cross-system facts rather than mutable services: `echolocation-pulse`, `snake-strike-started`, `bat-captured`, `player-collision`, `near-miss`, `thermal-changed`, `snake-switched`, `settings-changed`, `asset-error`, and `notice`. Owners still call their tightly coupled children directly. Unsubscribe functions are stored by modes to prevent listeners leaking across restarts.

## Milestone 2 visual adapters and spatial authority

`SpatialQuerySystem` now owns reusable analytic queries over the authored tunnel and a bounded set of important formations. `CaveGenerator` registers columns, the shelf, major stalactites, and the mouth; `SnakeNetwork` registers live head/coil bounds. Echolocation reflection selection, AI line of sight, thermal-history rejection, bat obstacle anticipation, near-miss distance, and soft player resolution call this service. Three.js remains the render source and Rapier retains fixed colliders for broad walls and the same major obstacle set.

Creature gameplay still terminates at controller state. `BatFirstPersonRig` reads velocity, bank, flap cadence, brake/dive input, and collision/near-miss events. `SnakeRig` deforms one continuous tube along stable Catmull-Rom control points and exposes mouth, capture, heat, echo, visual-state, and body-bound accessors. `SnakeFirstPersonRig` is a camera-local facial adapter. These form the replacement seam for GLB visuals; they do not create a second controller stack.

Echo and thermal profile budgets live in `Settings.profile()`. Both systems expose their latest CPU update time. `PostProcessing` resets and accumulates renderer counters across composer passes, allowing `PerformanceOverlay` to report render time, sensory time, draw calls, triangles, textures, render targets, flock size, particles, and physics cadence. See `SENSORY_RENDERING.md` for the complete sensory pipeline.

## Milestone 3 session architecture

`App.startMode()` creates one session context: normalized seed, root `Random`, difficulty, weighted encounter profile, `EncounterDirector`, and shared `FlightRouteNetwork`. Named random forks isolate systems so adding cosmetic sampling does not silently reorder AI choices. The director publishes bounded phase/density/panic/pressure state; it never sets a creature transform. `BatFlock` owns role/route decisions, while each `SnakeAI` owns a bounded `SnakeMemory`.

`InputManager` now exposes semantic actions/axes from keyboard, pointer, and `GamepadManager`; modes remain device-agnostic. Active-device changes only swap HUD labels. Dead zone, sensitivity, invert Y, and controller enable state are validated and persisted. Invalid saved settings are clamped or replaced by defaults.

`ModelAdapter` is the single optional GLB seam. It loads through `AssetManager`, validates metadata, resolves nodes/clips, owns an animation mixer and cloned presentation resources, registers heat/echo regions, exposes attachment transforms, and disposes itself. It consumes the same visual state as `BatFirstPersonRig`; gameplay never reaches into the model. See `MODEL_INTEGRATION.md`.

The overlay adds seed, phase, route occupancy, panic count, average snake alertness, active device, and director CPU time. Event queues remain synchronous/bounded; route counts and snake histories reuse fixed records. Same-seed determinism applies to broad fixed-step encounter behavior, not render interpolation or cross-browser bit identity.

## Milestone 4 presentation adapters

`ModelAdapter` now skeleton-clones the project-created hero bat, validates node/clip/resource budgets before hiding the fallback, owns one mixer, and performs state-transition cross-fades. Load generations prevent late asynchronous completion from attaching after disposal. Captured prey uses the same adapter through a guarded factory; repeated captures restart the one-shot clip. Controller state remains the only gameplay source.

`SnakeRig` remains procedural by measured design: three controllers each feed one 40×14 dynamically deformed body geometry shared by normal, echo, and heat meshes. A tapered neck, rostral plane, paired mandibles, pits, tongue, four anchor-offset coils, captured attachment, identity treatment, and recovery shapes are presentation children. Coils compress with visual charge and react to capture without feeding controller state backward. Miss classification occurs only after the unchanged `SnakeStrike` result and cannot change collision or timing. See `BOA_ASSET_DECISION.md`.

Quality profiles now share a fixed simulated flock count at the former medium boundary. Quality-dependent state is restricted to renderer resolution, shadows/bloom, particles, echo histories/returns/detail, and thermal trail budgets. A paused-loop same-seed construction test verifies exact low/medium/high state equality in both modes.

Audio and haptic responses subscribe to physical events. Delayed reflection timers and ambience modulation are bounded and disposed; Gamepad vibration is guarded, optional, and attenuated by reduced-sensory settings. No presentation feature creates a runtime network request.

The Bat soft launch remains inside `BatFlightController` and `BatMode`: a lower initial velocity plus four seconds of tapering lift retains flight momentum, while a six-second empty target list prevents introductory AI strike pressure. Collision still resolves through the shared spatial service. Its event now produces local dust and dull contact audio; only `EcholocationSystem.emit()` can create the player acoustic pulse and memory.
