# Batsnake implementation checklist

This file tracks the first playable vertical slice. The checked items are verified in the repository, not merely planned.

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
- [ ] Capture the complete production screenshot set; the verified live-menu capture is complete.

## After the vertical slice

- [ ] Replace procedural bats and snakes with optimized, licensed GLB rigs while preserving controller interfaces.
- [ ] Replace generated materials and audio with production assets listed in `ASSET_MANIFEST.md`.
- [ ] Upgrade echolocation with depth reconstruction and reflected hit clustering.
- [ ] Upgrade thermal wakes to a temporal render target at high quality.
- [ ] Add gamepad support, remapping, wider accessibility controls, and mobile-specific messaging.
