# Browser validation matrix — 0.5.0-rc1

| Browser | Version | Platform | Result | Known differences | Degraded features | Workaround |
|---|---|---|---|---|---|---|
| Chrome | 125+ | macOS 14.5 (Apple M2) | Pass | — | — | — |
| Edge | 125+ | macOS 14.5 (Apple M2) | Pass | — | — | — |
| Firefox | 126+ | macOS 14.5 (Apple M2) | Pass | Web Audio `AudioContext` resume requires user gesture; pointer-lock API has slightly different error shape | None | First click handles both; pointer-lock error is caught and shows a notice |
| Safari | 17.5+ | macOS 14.5 (Apple M2) | Pass | Requires `webkitAudioContext` fallback; WebGL2 performance is slightly lower than Chromium | None | Fallback is built into AudioManager; Safari is not a target for peak GPU performance |

## Tested features

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| Startup / loading screen | ✓ | ✓ | ✓ | ✓ |
| WebGL2 rendering | ✓ | ✓ | ✓ | ✓ |
| Import maps | ✓ | ✓ | ✓ | ✓ |
| Rapier WASM | ✓ | ✓ | ✓ | ✓ |
| GLB loading (hero bat) | ✓ | ✓ | ✓ | ✓ |
| Pointer lock | ✓ | ✓ | ✓ | ✓ |
| Web Audio (procedural) | ✓ | ✓ | ✓ | ✓ |
| Gamepad API | ✓ | ✓ | ✓ | limited |
| Fullscreen API | ✓ | ✓ | ✓ | ✓ |
| localStorage | ✓ | ✓ | ✓ | ✓ |
| Focus loss / pause | ✓ | ✓ | ✓ | ✓ |
| Window resize | ✓ | ✓ | ✓ | ✓ |
| Quality changes | ✓ | ✓ | ✓ | ✓ |
| Bat mode (all difficulties) | ✓ | ✓ | ✓ | ✓ |
| Snake mode (all difficulties) | ✓ | ✓ | ✓ | ✓ |
| Same-seed replay | ✓ | ✓ | ✓ | ✓ |
| Opposite perspective switch | ✓ | ✓ | ✓ | ✓ |

## Resolution testing

| Viewport | Results |
|---|---|
| 1920×1080 | Pass on all browsers |
| 1440×900 | Pass on all browsers |
| 1366×768 | Pass on all browsers |

## Notes

- Safari's Gamepad API support is partial; basic axis/button polling works but vibration is not supported.
- Firefox may show a brief WASM compile stall on first load; subsequent loads are cached.
- All browsers require HTTPS (or localhost) for pointer lock, fullscreen, and Web Audio. `file://` is intercepted.
- Audio is gated behind a user gesture on first load across all browsers.
