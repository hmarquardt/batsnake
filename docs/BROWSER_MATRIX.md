# Browser validation matrix — 0.5.0-rc1

## Test host

- Date: 2026-08-01
- Machine: MacBook Air, model identifier Mac14,2
- OS: macOS 15.6.1 (24G90), arm64
- GPU: Apple M2 integrated GPU, 8 cores; Metal supported
- Memory: 16 GB
- Served from: `http://127.0.0.1:8081/`

## Exact browser status

| Browser actually launched or inspected | Exact version/build | Viewport | Result | Scope and limitation |
|---|---|---:|---|---|
| Google Chrome desktop binary, headless | 150.0.7871.187 (7871.187) | 1440×900; resized to 1366×768 | Partial automated pass | Installed application binary. Startup, both control flows, pause/resume, pointer-lock loss, resize, end/replay, both opposite-side switches, return-to-menu, fullscreen, storage, direct-file guard, local-only requests, and performance/stress ran. No human listening/playability, natural completion/capture, or physical gamepad. |
| Playwright Firefox Nightly | 151.0 (15126.6.11) | 1440×900; resized to 1366×768 | Partial automated pass | Supplemental engine run. Initial run found an `AudioListener.positionX` incompatibility; rerun passed after fallback to `setPosition`/`setOrientation`. This is not Mozilla Firefox 150.0.1 stable. |
| Mozilla Firefox desktop | 150.0.1 (15026.4.27) | — | Not directly tested | Installed, but not launched for interactive validation. Compatibility expectation is informed by the Nightly engine pass only. |
| Safari desktop | 18.6 (20621.3.11.11.3) | — | Not directly tested | Installed, but not launched for interactive validation. Do not infer a pass from WebKit expectations. |
| Playwright WebKit revision 2311 | Playwright wrapper 1.0; cached engine revision 2311 | — | Not tested: launch blocked | The cached runtime was built for macOS 26.2 and aborted on macOS 15.6.1 with missing `_WKBrowserContext`; no application page loaded. |
| Microsoft Edge desktop | Not installed | — | Not directly tested | Chromium compatibility is expected but is not measured and is not a pass. |

Headless Chrome reports a reduced UA version (`HeadlessChrome/150.0.0.0`); the exact launched application version above comes from that binary’s `Info.plist`. Firefox reported `Firefox/151.0` in-page. Firefox WebGL identified the renderer only as “Apple M1, or similar”; no more specific Firefox GPU string is claimed.

## Automated feature evidence

| Feature | Chrome 150.0.7871.187 | Playwright Firefox Nightly 151.0 | Stable Firefox / Safari / Edge |
|---|---|---|---|
| Load screen → WebGL2 → Rapier WASM → menu | Pass | Pass | Not directly tested |
| Hero bat GLB and animation mixer | Pass | Pass | Not directly tested |
| Gameplay tabs | Pass | Pass | Not directly tested |
| Bat steering, flap, brake, quick/deep call | Pass | Pass | Not directly tested |
| Bat collision, snake near miss, natural escape/capture | Not completed | Not completed | Not directly tested |
| Bat end report and same-seed replay | Pass with forced end | Pass with forced end | Not directly tested |
| Snake thermal, reposition, charge/release, lead miss, recovery, switch | Pass | Pass | Not directly tested |
| Snake capture and natural stream expiry | Not completed | Not completed | Not directly tested |
| Pause/resume and pointer-lock loss pause | Pass | Pass | Not directly tested |
| Resize | Pass | Pass | Not directly tested |
| Fullscreen | Pass in Chrome headless platform check | Not completed | Not directly tested |
| Bat → Snake opposite-side replay | Pass | Pass | Not directly tested |
| Snake → Bat opposite-side replay | Pass | Pass | Not directly tested |
| Return to menu / mode-specific state cleanup | Pass | Pass | Not directly tested |
| Keyboard/mouse | Pass for exercised actions | Pass for exercised actions | Not directly tested |
| Physical gamepad | Not tested | Not tested | Not directly tested |
| Audible cue identity | Not listened | Not listened | Not directly tested |

## Opposite-perspective state evidence

Both automated engines preserved the exact seed, difficulty, and selected encounter profile in both directions. Bat → Snake started with thermal off, focus zero, strike idle, Bat HUD hidden, and Snake HUD visible. Snake → Bat removed thermal/focus body classes, started with call unarmed and no echo pulse, hid Snake HUD, and showed Bat HUD. A final Chrome rerun measured zero deferred audio timers and zero duck timers after each direction switch. Return-to-menu restored camera FOV to exactly 72 and hid both HUDs. Small transient FOV values immediately after a switch were produced by the existing mode camera easing and returned to 72 at menu; no stale thermal, focus, strike, call, or transient audio state remained.

## Compatibility expectations (not passes)

- Edge is expected to share Chromium’s import-map, WebGL2, WASM, pointer-lock, fullscreen, localStorage, and Web Audio behavior, but was not installed.
- Stable Firefox is expected to benefit from the verified AudioListener fallback, but its exact desktop build was not run.
- Safari is expected to use `webkitAudioContext` where required, but its installed desktop application was not run and gamepad behavior remains unknown here.
- All browsers require a served HTTP(S) origin for normal module/WASM behavior. The intentional `file://` interceptor was directly verified in Chrome.
