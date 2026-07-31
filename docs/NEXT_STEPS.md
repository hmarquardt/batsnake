# Batsnake implementation checklist

This file tracks the first playable vertical slice. The checked items are verified in the repository, not merely planned.

## Milestone 3 baseline evaluation — 2026-07-31

Commit `6e47e04` was served locally and the twelve Milestone 2 captures were reviewed before Milestone 3 changes. Four automated 12-second bat sessions and four 12-second snake sessions exercised the real fixed-step modes in Chromium WebGL2. Vendor verification passed for all 19 pinned files and the browser reported no application exceptions.

### Where repeated runs feel identical

- [ ] Every bat follows the same sinusoidal center corridor toward the same altitude. Random spawn positions change the scatter, but route spread settles into a narrow 1.5–2.3 m band with no tactical branches or named route identity.
- [ ] All four bat-player runs reached the same `z=48.1` resolution point in approximately the same time under the same flap cadence. There is no session rhythm, alternate escape condition, or final-pressure variation.
- [ ] Flock panic was absent from most sampled intervals and involved only two bats in the one active sample. Panic does not yet propagate as an emergence-scale event.
- [ ] AI bats differ only through random initial position, speed, and flap phase. There are no leaders, followers, edge flyers, juveniles, or fast escape roles, so silhouettes and decisions converge quickly.
- [ ] `Math.random()` still controls bat creation/recycling and snake decision timers. Runs cannot be named, copied, or reproduced; even broad capture/traffic outcomes drift without an intentional seed.
- [ ] Snake AI selects the nearest visible bat and rolls one aggression probability. It holds no route, miss, success, congestion, panic, or player-sighting memory and cannot adapt its anchored posture.
- [ ] Companion strikes can capture bats, but the AI path does not emit the same strike-start event used by player-facing cause/effect. Across baseline samples, captures varied from zero to two while the recorded strike signal remained zero.
- [ ] Snake mode always presents the same 68-second stream, four-capture target, anchor order, immediate switching, thermal treatment, and broad strike decision. Rapid post cycling has no tactical cost.
- [ ] Echolocation has one call range/cooldown/memory behavior. A bat cannot trade local certainty for stealth or make a conspicuously deep call.
- [ ] Thermal vision has no focused-pit state. The player receives broad awareness but cannot narrow motion perception or trade peripheral clarity for intercept stability.
- [ ] Existing scoring is mostly progress/capture totals. It does not describe route quality, call discipline, strike efficiency, intercept timing, snake use, flock context, seed, or difficulty.
- [ ] The title screen offers mode selection but no difficulty or reproducible session identity. The end screen can restart only the current generic run and does not distinguish same-seed replay from a new encounter.
- [ ] Controls are mouse/keyboard only. First-run learning relies on persistent HUD control strings rather than contextual prompts that retire after demonstrated actions.
- [ ] The GLTF loader exists in `AssetManager`, but no model metadata schema or visual adapter validates nodes, clips, axes, scale, heat/echo regions, attachments, fallback, and disposal end to end.
- [ ] Milestone 2 captures prove sensory layering and embodiment, but traffic composition is visually similar between frames; the thermal flock frame can be extremely sparse/dark and does not communicate departure rhythm by itself.

### Milestone 3 work checklist

- [x] Replace gameplay `Math.random()` with one injected deterministic random service and expose copyable session seed/difficulty identity.
- [x] Add authored encounter profiles and a phase director that influences density, route pressure, panic, alertness, quiet intervals, peaks, and resolution without steering creatures directly.
- [x] Build multiple authored route corridors, per-bat roles, congestion/threat-aware route selection, bounded panic propagation, and player influence.
- [x] Add bounded snake memory, intercept-aware strike decisions, slow anchored repositioning, and world-readable posture adaptation.
- [x] Add tap quick calls, hold/release full calls, thermal focus, strike-geometry feedback, and a switching readiness cost.
- [x] Add Field Study, Night Flight, and Flight Line behavior profiles with persisted selection and descriptions.
- [x] Redesign mode-specific scoring and field-report outcomes with seed replay/new-encounter actions.
- [x] Add contextual non-pausing onboarding and expanded offline field notes.
- [x] Add gamepad polling, mappings, settings, device detection, and contextual labels for both modes.
- [x] Validate one optional local hero-bat GLB through metadata, animation, sensory/attachment registration, and procedural fallback.
- [x] Drive procedural audio and airflow cues from encounter phase and route pressure.
- [x] Profile peak traffic, run determinism/regression/failure matrices, create 16 ignored captures, update documentation, and commit.

### Milestone 3 validation report

- [x] Exact repeated seed/difficulty runs produced identical profile, phase output, bat roles, routes, sampled positions, panic count, route occupancy, and snake alertness under fixed-step Chromium testing; a new seed produced a different profile and flow.
- [x] All eight profiles are selectable from deterministic weighted input and all five routes carry traffic. Field Study, Night Flight, and Flight Line produce distinct density, pressure, duration, target, reaction, panic, cooldown, and scoring parameters.
- [x] Bat regression covered quick/deep call envelopes, route switching, panic, collision rhythm, AI sighting/adaptation, same/new seed, three quality allocations, and animated/procedural visual paths.
- [x] Snake regression covered thermal/focus adaptation, reposition, charge/release/cancel, switching lock, AI strikes/memory, captures/misses, stream resolution, and each difficulty.
- [x] Gamepad polling covered dead-zone normalization, device switching, thermal/action mapping, disconnect clearing, enable/disable, invert Y, and contextual labels without affecting mouse/keyboard input.
- [x] GLB checks covered local load, named nodes, three clips, mixer, scale/orientation, heat/echo regions, attachments, disposal, disabled model, missing file, invalid metadata, missing-node/clip fallback, and procedural continuity.
- [x] Corrupt settings are sanitized, unknown seeds normalize safely, optional assets fail visibly without stopping play, and direct-file/WebGL2/audio/pointer-lock/resize/fullscreen paths retain their existing guards.
- [x] Chromium reported no application exceptions or failed runtime loads, and every observed request remained on the local origin. Low, medium, and high remained functional.
- [x] The gitignored `captures/` set contains all 16 Milestone 3 frames. Static syntax and vendor checksum verification pass.

## Milestone 2 baseline evaluation — 2026-07-31

The committed vertical slice was run from `python3 -m http.server 8080` and both modes were exercised in a 1440×900 Chromium WebGL2 session before Milestone 2 edits. Baseline captures are stored locally under the gitignored `captures/` directory. `python3 tools/verify-vendor.py` passed for all 19 pinned files.

### Observed visual and gameplay shortcomings

- [ ] Echolocation is dominated by the single shared cave-shell band. Large tube facets read as a geometric grid, while columns, shelves, stalactites, and snakes do not leave independently timed spatial memories.
- [ ] Echo landmark points share one global opacity, so returns do not arrive according to feature distance and do not communicate individual reflector strength or direction.
- [ ] The existing shader trace fades uniformly behind the band and is tied to one active pulse; there is no layered one-to-three-second acoustic memory or overlap between successive scene memories.
- [ ] Snake echo response is a small head-mounted light rather than a soft head/body/coil return driven by posture and motion.
- [ ] Synthesized echo delays use fixed offsets unrelated to the actual chamber, central columns, floor, mouth, or snake locations.
- [ ] Thermal activation changes fog and exposes two proxy batches, but baseline screenshots remain nearly indistinguishable from normal snake vision. Bat torso and membrane proxies share transforms and do not express head, roots, muscle activity, distance, or adaptation.
- [ ] Thermal wakes allocate new sprites/materials and are not reliably visible; they are not depth-tested against the same spatial-query model and do not provide convincing high-quality temporal persistence.
- [ ] The bat has no first-person wing, shoulder, forelimb, or claw context. Flight-state changes are communicated almost entirely by camera/FOV and therefore do not read in screenshots.
- [ ] Bat camera stabilization and body rhythm have no collision/near-miss recovery state; near-miss panic exists only as HUD/effect events.
- [ ] Flock bats use one capsule and one flat wing plane. At distance they collapse into bright horizontal slivers, and thermal body matrices inherit the wing transform rather than a distinct core transform.
- [ ] The boa body reads as spaced spheres. A new Catmull-Rom curve and many vectors are allocated every update; segment volume/taper do not follow tension, the unused tension value changes nothing, and the neck/head transition can visibly disconnect.
- [ ] Strike preparation changes only charge, jaw angle, and the HUD reticle. Coils do not tighten, the neck does not form an S-curve, and breathing/head steadiness do not change.
- [ ] Capture has no attached struggling bat, mouth contact pose, follow-through, or coil response; snake switching remains a short global cinema-bar flash around a hard camera relocation.
- [ ] Cave silhouettes are strongly faceted and repetitive. Rock clusters have limited material variation, wetness is uniform by material, mineral runoff is absent, guano uses simple circles, the entrance disk clips to white, and no vegetation silhouette frames the mouth.
- [ ] Major stalactites are visible but absent from gameplay collision and shared sensory queries. The world duplicates analytic sphere logic instead of exposing one documented ray/visibility/nearest-surface service.
- [ ] Current flock, flight, collision, audio-listener, and snake-rig paths allocate temporary vectors/matrices per frame. Baseline isolated update loops measured roughly 8 ms for 300 bat-flock/echo updates and 5.2 ms for 300 snake-flock/thermal updates in headless software rendering; renderer counters from the final composer pass are not meaningful (`1` call / `1` triangle) and need better overlay sampling.
- [ ] Pointer-lock denial feedback is correct but sits across the center of automated captures; capture tooling needs a documented way to dismiss notices without weakening the player-facing failure path.

### Milestone 2 work checklist

- [x] Add a shared `SpatialQuerySystem` for analytic tunnel surfaces, tagged formation bounds, line of sight, reflection selection, bat anticipation, and near-miss queries.
- [x] Build layered echo wavefront, injected surface response, decaying multi-surface memory, pooled reflected clusters, organic snake returns, and geometry-derived positional audio.
- [x] Build registered regional heat emitters, smooth biological adaptation, occlusion-aware persistence, pooled profile-specific trails, and high-quality world-space temporal history.
- [x] Add an asset-ready first-person bat visual driven by the existing controller state and event impulses.
- [x] Replace visible snake spheres with a continuous deformation mesh while preserving `SnakeController` and `SnakeStrike` interfaces; add tension, follow-through, capture attachment, and sensory switching state.
- [x] Refine the existing cave’s material breakup, entrance framing, moisture/mineral cues, mist depth, ceiling detail, and ambush-zone composition.
- [x] Expand only the major gameplay colliders and route sensory/gameplay visibility checks through the shared spatial-query layer.
- [x] Add profile-specific sensory budgets and meaningful sensory timing/render-target counters to the performance overlay.
- [x] Complete the required bat, snake, settings, failure, offline, and 12-frame capture matrix; keep captures gitignored.
- [x] Update all Milestone 2 documents and re-run syntax, browser, offline, and vendor verification before commit.

### Milestone 2 validation report

- [x] Both modes initialized and rendered in Chromium WebGL2 with no application exceptions; all runtime requests stayed on the local origin.
- [x] Bat flight exercised flap, glide, brake, dive, collision/near-miss impulses, repeated pulse histories, snake return, capture outcome, and final approach.
- [x] Snake hunt exercised normal/thermal transitions, visibility queries, switching transition, charge/cancel, lunge, miss/recoil, capture attachment, companion updates, and stream timing.
- [x] Low, medium, and high budgets rendered without recreating the application; reduced flashing and reduced camera motion remained wired into the upgraded effects.
- [x] The local `captures/` set contains all 12 named milestone frames and remains ignored by Git.
- [x] Failure coverage confirmed direct-file instructions, WebGL2 failure UI, optional-asset fallback, pointer-lock denial notice, audio interaction gating, resize, and local-only module/WASM loading.
- [x] Static syntax checks and `python3 tools/verify-vendor.py` pass for 19 pinned files.

## Foundation

- [x] Inspect the new repository and preserve its clean Git history.
- [x] Create the application, world, entity, sensory, effects, audio, UI, asset, shader, vendor, tool, and documentation directories.
- [x] Vendor exact Three.js and Rapier browser distributions.
- [x] Record and verify dependency checksums.
- [x] Add file-protocol, WebGL2, WASM, asset, pointer-lock, audio, and module-load failure messages.

## Shared world

- [x] Implement the fixed-step application lifecycle and event flow.
- [x] Compose the moonlit cave chamber, central roost, shaft-like diagonal flow, landmarks, hazards, flight lanes, and three ambush zones.
- [x] Add simple Rapier collision volumes independently of render detail.
- [x] Add wet limestone materials, guano, mist, dust, drips, moonlight, fog, and restrained post-processing.
- [x] Add live quality switching and the performance overlay (flock allocation updates on the next run).

## Bat experience

- [x] Implement momentum-based first-person flight, banking, flap energy, glide, dive, braking, stall, collision response, and camera motion.
- [x] Implement world-space echolocation wavefronts, transient surface traces, biological returns, cooldown, threat propagation, and spatial echo audio.
- [x] Implement a reactive animated flock with path following, separation, obstacle/threat avoidance, panic, and escape behavior.
- [x] Implement the escape objective, scoring, capture, escape, end screen, and restart.

## Snake experience

- [x] Implement the embodied segmented boa rig, anchored aim/reposition controls, tongue and breathing motion, and snake switching.
- [x] Implement charge, commitment, moving lunge, swept collision, capture/miss, recoil, and recovery.
- [x] Implement occlusion-respecting heat signatures, depth-preserving thermal perception, restrained wakes, distance haze, and sensory transition.
- [x] Implement companion awareness and imperfect AI strikes.
- [x] Implement the capture objective, scoring, stream ending, end screen, and restart.

## Completion and verification

- [x] Add procedural local audio and documented replacement paths.
- [x] Finish architecture, design, art direction, asset manifest, performance, licensing, and README documentation.
- [x] Exercise the menu, both modes, echolocation, thermal perception, and strike state in headless Chrome with no application exceptions.
- [x] Verify restart/pause wiring, settings persistence, pointer-lock recovery messaging, and live render-profile changes.
- [x] Run `python3 tools/verify-vendor.py` successfully (19 files across two dependencies).
- [x] Verify all runtime URLs are repository-relative and GitHub Pages project-path compatible.
- [x] Capture the complete Milestone 2 screenshot set locally under the gitignored `captures/` directory.

## After the vertical slice

- [ ] Replace procedural bats and snakes with optimized, licensed GLB rigs while preserving controller interfaces.
- [ ] Replace generated materials and audio with production assets listed in `ASSET_MANIFEST.md`.
- [x] Upgrade echolocation with layered surface reconstruction and reflected hit clustering.
- [x] Upgrade thermal wakes with bounded occlusion-aware world-space temporal persistence at high quality.
- [ ] Evaluate depth-buffer reconstruction and a low-resolution thermal accumulation target against the stable profile budgets before adopting them.
- [x] Add desktop gamepad support, dead zone/sensitivity/invert controls, active-device detection, and contextual labels.
- [ ] Add user-defined remapping and mobile-specific messaging only if later scope requires them.
