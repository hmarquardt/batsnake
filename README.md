# BATSNAKE

Batsnake is a first-person 3D wildlife survival game about Cuban boas hunting bats at a cave flight line. One shared chamber supports two different embodied and sensory experiences: fly toward moonlight using echolocation, or hang above the stream and read living heat before committing to a physical strike.

This repository is a no-build static application. It does not require npm, Node.js, a bundler, a compiler, or a runtime internet connection.

## Play

From the repository root:

```bash
python3 -m http.server 8080
```

Open <http://localhost:8080>. Use a current desktop Chrome, Edge, Firefox, or Safari with WebGL2, ES modules, WebAssembly, pointer lock, and Web Audio enabled. Headphones are recommended. Opening `index.html` through `file://` is intentionally intercepted with startup instructions because browsers block module and WASM loading there.

### Bat controls

| Input | Action |
|---|---|
| Mouse | Steer, pitch, and bank |
| Space | Flap; reserve regenerates while gliding |
| Shift | Dive and accelerate |
| S | Spread wings / brake |
| E or primary click | Emit echolocation pulse |
| Escape | Pause |
| R | Restart run |

Reach the moonlit mouth. The flight model includes momentum, drag, lift, gravity, diving, soft stall, speed-dependent turning, collision response, banked camera motion, and flap cadence. Score rewards progress, survival, and clean flight while penalizing collisions and unnecessary calls.

### Snake controls

| Input | Action |
|---|---|
| Mouse | Aim the head within the anchor’s arc |
| A / D | Shift coils around the anchor |
| W / S | Extend / retract |
| Hold primary click | Tension the strike |
| Release primary click | Commit to a physical lunge |
| T | Toggle heat-pit perception |
| Q / E | Transfer awareness between three snakes |
| Escape | Pause |
| R | Restart hunt |

Capture four bats before the departure stream ends. Strikes have charge, travel time, swept collision, capture, recoil, and recovery; the bat must be led rather than clicked.

## Current vertical slice

- Art-directed tropical limestone chamber with a deep roost, narrow entrance, diagonal flow, columns, ceiling shelf, wet formations, guano zones, dust, droplets, fog, and controlled moonlight.
- Animated reactive flock with path bias, separation, player avoidance, snake avoidance, panic, and recycled departure traffic.
- Reusable world-space echolocation wave with a moving surface band, after-trace, landmark returns, biological snake response, cooldown, threat cost, and directional synthesized echoes.
- Occlusion-respecting thermal view using visible heat proxy geometry, separate warm core/cool membrane values, additive heat bloom, distance haze, and transient hooks for thermal wakes.
- Three spline-like segmented boas, embodied head view, facial pits, jaw, eyes, tongue, coils, imperfect companion AI, physical strikes, capture, and cooldown.
- Complete menu, settings, both objectives, pause, outcomes, scoring, restart, quality profiles, missing-asset fallbacks, and performance overlay.
- Local Three.js 0.185.1 and Rapier 0.19.3, pinned with per-file SHA-256 checksums.
- Procedural Web Audio cave bed and positional calls, flaps, drips, impacts, strikes, and captures. No remote media is requested.

## Offline dependency integrity

All runtime dependencies are committed in `vendor/`. Verify them using only Python’s standard library:

```bash
python3 tools/verify-vendor.py
```

`tools/fetch-vendor.py` can restore a missing exact file when online. It verifies the payload before writing and refuses to overwrite a changed local file. Normal play never invokes it.

## Layout

- `src/core/` — lifecycle, fixed loop, state, input, settings, assets, events
- `src/world/` — chamber composition, materials, lighting, navigation, physics
- `src/entities/` — bat flight/flock and snake rig/network/AI/strike
- `src/gameplay/` — modes, objectives, scoring, collision policy
- `src/sensory/` — echolocation, thermal proxies/wakes, threat state
- `src/effects/`, `src/audio/`, `src/ui/` — presentation boundaries
- `vendor/` — exact local runtime libraries
- `assets/` — replacement-ready model, texture, audio, HDR, and font slots
- `docs/` — architecture, design, art direction, manifest, performance, roadmap
- `tools/` — standard-library dependency retrieval and verification

## Graphics and accessibility

Low, medium, and high profiles change pixel ratio, shadows, bloom, particles, and future-run flock density without a page reload. Resolution scale is independently adjustable. Reduced camera motion removes bank/wingbeat/FOV emphasis; reduced flashing is reserved by sensory systems as their intensity ceiling. Volume buses, sensory intensity, fullscreen, and an optional performance overlay are included. Settings live only in `localStorage`; there are no cookies, analytics, or telemetry.

## Captures

Run the local server at 1440×900 or 1920×1080. Hide the performance overlay for art captures; show it for profiling captures. Recommended frames are the live title view, a bat echo band crossing the central column, normal snake vision, and thermal view with a charged strike. Browser screenshots work directly; Chrome’s DevTools capture produces full-resolution PNGs.

## GitHub Pages

The application uses only repository-relative URLs and needs no rewrite rules. In repository **Settings → Pages**, choose **Deploy from a branch**, select the desired branch and `/ (root)`, then save. `index.html` is the entry point. A project site such as `https://name.github.io/batsnake/` works because import-map and asset paths are relative.

## Known limitations

The first slice uses procedural animal and cave render assets; the snakes are transform-driven rather than skinned, distant and near bats share the same instanced silhouette, thermal wakes are lightweight sprites, cave collision is intentionally coarser than render geometry, and echolocation approximates reflection through tagged surface responses instead of acoustic ray tracing. Flock density changes on the next run after changing quality. See [NEXT_STEPS.md](docs/NEXT_STEPS.md) and [ASSET_MANIFEST.md](docs/ASSET_MANIFEST.md).
