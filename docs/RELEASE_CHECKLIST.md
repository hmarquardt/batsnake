# Release checklist — 0.5.0-rc1

This is the authoritative release gate. A checked item has evidence from the reconciled RC baseline plus the Milestone 6 regression recorded in `CHANGELOG.md`. Partial automation is not a pass for a gate that calls for human judgment or physical hardware. Continuing environment development did not waive or complete any unresolved RC gate.

## Pre-release

- [ ] All 13 RC hardening items are complete. `RELEASE_HARDENING.md` does not exist, so the referenced set cannot be identified or verified.
- [ ] HUD is simpler and remains understandable. The five Bat and two Snake removals are present and the remaining DOM fits the tested viewports, but no human playability pass verified that availability, braking, exit direction, reserve, and body-tension cues remain understandable.
- [ ] Audio events are distinct. Event routing was exercised, but no event-by-event eyes-closed listening pass was performed; distinguishability and the collision-versus-echolocation requirement remain unverified.
- [ ] Difficulty profiles feel meaningfully different. Parameter differences are verified in code, but the required five seeds per mode per difficulty (30 sessions) were not played and recorded.
- [ ] Snake strike timing is learnable. Charge, release, lead miss, and recovery executed in Chrome and Firefox automation, but the required 20 human-controlled Night Flight strikes and learning-curve judgment were not performed.
- [ ] Pause/focus/restart behavior is safe. Pause/resume, pointer-lock loss, restart, resize, switch, and return-to-menu passed automation. Actual OS focus loss and accidental release behavior were not directly tested.
- [x] Repeated sessions do not leak resources. The exact 50 Bat restarts, 50 Snake restarts, 25 mode switches, and 25 same-seed replays completed after fixing undisposed skeleton bone textures. Active-mode counts were bounded; see `RESOURCE_STRESS_TEST.md`.
- [x] Chrome, Edge, Firefox, and Safari status is documented exactly in `BROWSER_MATRIX.md`, including untested browsers and supplemental engine coverage.
- [ ] Medium performance is release-ready at 1920×1080. Prior 16.7 ms/vsync figures remain historical. The RC diagnostic exposed first-use sensory spikes; the 2026-08-02 environment rerun again measured low p95 CPU/submit time but inconsistent headless cadence and a 91.4 ms first deep-echo submit spike. No interactive trace or GPU timing exists; see `PERFORMANCE.md`.
- [ ] Public README is understandable immediately. Its factual browser/offline claims were reconciled, but no new-reader human review was performed.
- [x] Release metadata exists: `CHANGELOG.md`, this checklist, browser/performance records, and the Settings version string are present.
- [x] Version is identified internally as `0.5.0-rc1` in README and Settings.
- [x] No npm or build step has been introduced. No package manifest or lockfile exists; runtime remains direct ES modules/import maps.
- [x] Offline runtime remains intact. The 2026-08-02 Chrome smoke again made 90 local-origin requests and zero non-local requests; the environment diagnostic also observed zero external requests.
- [x] Vendor verification passes. `python3 tools/verify-vendor.py` passed all 19 files across both pinned dependencies on 2026-08-02.

## Browser validation

- [ ] Google Chrome 150.0.7871.187 desktop — partial automated pass only; human audio/playability, natural outcomes, collision/capture, fullscreen UI flow, and physical gamepad coverage are incomplete.
- [ ] Microsoft Edge desktop — not installed and not directly tested.
- [ ] Mozilla Firefox 150.0.1 desktop — installed but not directly tested. Playwright Firefox Nightly 151.0 passed the automated smoke after an AudioListener compatibility fix; this is supplemental evidence, not a stable-Firefox pass.
- [ ] Safari 18.6 desktop — installed but not directly tested. The available Playwright WebKit runtime could not launch on macOS 15.6.1 and is not counted as a pass.

Exact machine, GPU, viewport, date, coverage, and limitations are in `BROWSER_MATRIX.md`.

## Post-release and platform checks

- [ ] Confirm GitHub Pages renders correctly. Not executed; no deployment was made.
- [x] Direct `file://` shows the fatal-error interceptor. Chrome displayed the serve-over-HTTP explanation and command.
- [x] Pointer lock, fullscreen, and Web Audio initialization paths work on a first local Chrome visit. Pointer-lock loss paused, fullscreen entered/exited, and AudioContext initialized. Audible output quality was not evaluated.
- [x] localStorage persists across reload. A stored Field Study setting and sentinel value survived a Chrome reload.

## Evidence executed on 2026-08-01

- `python3 tools/verify-vendor.py` — pass, 19 files / 2 dependencies.
- `node --check` for every `src/**/*.js` file — pass.
- Installed Chrome 150.0.7871.187 smoke at 1440×900, resized to 1366×768 — no page/console errors and no non-local requests after fixes.
- Playwright Firefox Nightly 151.0 smoke at 1440×900, resized to 1366×768 — no page/console errors after fixes.
- Playwright WebKit revision 2311 launch — not tested: binary requires macOS 26.2 and aborts on macOS 15.6.1.
- Full 50/50/25/25 resource stress sequence — pass after the bone-texture disposal fix; see `RESOURCE_STRESS_TEST.md`.
- Installed Chrome 1920×1080 medium performance diagnostics — measured; see `PERFORMANCE.md`.
- Direct-file, fullscreen, and localStorage checks in installed Chrome — pass with limitations above.

## Milestone 6 regression evidence executed on 2026-08-02

- `node --check` for every `src/**/*.js` file and `python3 tools/verify-vendor.py` — pass.
- Installed Chrome 150.0.7871.187 lifecycle/opposite-perspective smoke — pass with forced outcomes; no errors, 90 local requests, zero non-local.
- Thirteen-check Chrome regression — pass, including all modes/difficulties starting, bounded restart disposal, semantic input, fallback assets, audio denial, and local-only operation.
- Full 50/50/25/25 resource sequence — pass with the larger fixed cave baseline bounded; see `RESOURCE_STRESS_TEST.md`.
- Same-seed low/medium/high construction snapshots — identical within each mode (`fd9da6…` Bat, `51ecb1…` Snake).
- Five routes × 99 collision samples — four centerlines clear; two small Shelf/Guano brush samples recorded, no route blocked.
- Twenty fixed-camera Milestone 6 after views plus before references — captured locally under gitignored `captures/milestone-6/`.
- Installed Chrome 1920×1080 medium environment diagnostic — measured, not a 60 FPS pass; see `PERFORMANCE.md`.

These automated environment results do not complete the human audio, first-run/HUD, strike-learning, difficulty, stable-browser, physical-gamepad, or interactive-performance gates below.

## Release decision

**RC STATUS: BLOCKED**

Concrete blockers:

1. Complete and record the blind event-by-event audio listening pass, including proof that collision cannot be confused with echolocation.
2. Complete and record human first-run Bat/Snake and reduced-HUD playability review.
3. Complete and record 20 player-controlled Night Flight strikes with the requested learning-curve fields.
4. Complete and record five seeds per mode per difficulty (30 sessions) with individual-seed outcomes.
5. Complete direct stable-browser coverage on the browsers actually being claimed, plus physical gamepad coverage where supported.
6. Resolve or explicitly accept the first-use sensory shader spikes with an interactive performance trace; the current headless run is insufficient to certify 60 FPS.

Do not tag or publish `v0.5.0-rc1` while this status is BLOCKED.
