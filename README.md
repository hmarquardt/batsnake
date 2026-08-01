# BATSNAKE · 0.5.0-rc1

**Fly as a bat. Hunt as a boa.** One cave, two radically different senses.

Batsnake is a first-person 3D game about Cuban boas hunting bats at a cave flight line. In **Bat** mode, you navigate toward moonlight using echolocation — quick taps for nearby geometry, deep held calls for a wider picture. In **Snake** mode, you hang above the stream, toggle thermal vision, read living heat, and commit to physical lunges. The same seed produces the same encounter in both modes.

No npm, no build step, no runtime internet. Open the folder and serve it:

```bash
python3 -m http.server 8080
```

Then visit <http://localhost:8080> in a current desktop Chrome, Edge, Firefox, or Safari. Works fully offline once loaded. Headphones recommended.

Choose **Gameplay** on the main menu for a persistent Bat and Snake reference. The same reference is available from the pause menu.

### Bat controls

| Input | Action |
|---|---|
| Mouse | Steer, pitch, and bank |
| Space | Flap; reserve regenerates while gliding |
| Shift | Dive and accelerate |
| S | Spread wings / brake |
| Tap E / primary click | Quick call: nearby geometry, low warning cost |
| Hold and release E / primary click | Deep call: longer memory, cooldown, and warning cost |
| Escape | Pause |
| R | Restart run |

Reach the moonlit mouth. The flight model includes momentum, drag, lift, gravity, diving, soft stall, speed-dependent turning, collision response, banked camera motion, and flap cadence. A centered soft launch preserves airborne momentum while providing a six-second learning envelope before boa pressure begins. Score rewards progress, survival, and clean flight while penalizing collisions and unnecessary calls.

### Snake controls

| Input | Action |
|---|---|
| Mouse | Aim the head within the anchor’s arc |
| A / D | Shift coils around the anchor |
| W / S | Extend / retract |
| Hold primary click | Tension the strike |
| Release primary click | Commit to a physical lunge |
| T | Toggle heat-pit perception |
| F or secondary click | Narrow heat focus and steady the head |
| Q / E | Transfer awareness between three snakes |
| Escape | Pause |
| R | Restart hunt |

Capture the difficulty-specific target before the stream ends. Strikes have charge, travel time, swept collision, capture, recoil, and recovery; the bat must be led rather than clicked. Focus sacrifices peripheral heat clarity, while switching posts carries a brief adaptation and charge cost.

Common dual-stick gamepads are optional. Bat: sticks steer/look, south/right shoulder flaps, left trigger dives, left shoulder brakes, and east calls. Snake: right stick aims, left stick repositions, left trigger focuses, right trigger strikes, shoulders switch, and west toggles thermal. Settings include dead zone, sensitivity, invert Y, enable/disable, and contextual HUD labels.

## Milestone 4: Creature Fidelity

- A deterministic, project-created skinned hero bat replaces the pipeline pilot: six blended states, anatomical finger/membrane structure, regional heat, organic echo response, and restrained first-person placement. The procedural wing rig remains a complete fallback.
- Boas retain the Milestone 3 controller and strike interfaces while gaining a continuous muscular body, shaped head/jaw, eyes, pit rows, tongue, breathing, preparation compression, contact attachment, and distinct recovery presentation.
- Cave layout and collision remain unchanged. Deterministic limestone textures, displaced silhouettes, batched formations, localized wetness, mineral/guano residue, entrance vegetation, and ambush-zone identities reduce primitive repetition.
- Echolocation, thermal focus, procedural audio, event-tied camera response, and optional gamepad vibration were refined without adding a gameplay subsystem or runtime network dependency.
- Low, medium, and high now simulate identical seeded encounters. They vary only presentation budgets; medium remains the target profile.

## Milestone 3: Living Hunt

- Every run receives a copyable seed and one of eight authored encounter profiles. A seven-phase director shapes stillness, buildup, peak traffic, disruption, final stream, and resolution without directly steering creatures.
- Five invisible corridors support central speed, high flight, low column weaving, shelf cover, and a wide outside arc. Leaders, followers, edge flyers, juveniles, and fast escape flyers react differently to traffic, panic, calls, and strikes.
- Boas keep bounded short-term memory of routes, calls, misses, successful lanes, local traffic, player sightings, and confidence. Companions adjust slowly around their anchors and avoid duplicate lunges without becoming perfectly coordinated.
- Field Study, Night Flight, and Flight Line alter behavioral pressure, reaction, panic, density, encounter timing, recovery, targets, and score multiplier—not health.
- Quick/deep bat calls and broad/focused snake heat create sensory discipline. Field reports expose meaningful performance facts and offer same-seed replay or a fresh encounter.
- Contextual first-run prompts record learned actions locally and can be disabled. A project-created animated hero-bat GLB validates the complete optional model pipeline and procedural fallback.

The Milestone 2 sensory and embodiment foundation remains intact:

- Art-directed tropical limestone chamber with a deep roost, narrow entrance, diagonal flow, columns, ceiling shelf, wet formations, guano zones, dust, droplets, fog, and controlled moonlight.
- Animated reactive flock with path bias, separation, player avoidance, snake avoidance, panic, and recycled departure traffic.
- Layered world-space echolocation with a traveling shell, formation-specific surface response, overlapping acoustic memories, delayed reflected clusters, organic head/coil returns, cooldown, threat cost, and geometry-derived positional echoes.
- Occlusion-respecting thermal adaptation with distinct torso, head, wing-root, membrane, snake-head, and snake-body values plus bounded world-space persistence trails.
- First-person bat wings react to flap, glide, brake, dive, bank, collision, and panic. Three continuously deformed spline boas expose facial pits, jaws, tongue, tightening coils, capture attachment, and a sensory awareness transfer.
- Shared spatial queries drive major-formation collision, echo reflectors, line of sight, thermal persistence rejection, obstacle anticipation, and near-miss distance.
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
- `src/gameplay/` — modes, director/profiles, seeds, difficulty, onboarding, objectives, scoring
- `src/world/FlightRouteNetwork.js` / `AirflowSystem.js` — authored route ecology and draft cues
- `src/assets/` — optional GLB adapter and metadata contract
- `src/sensory/` — echolocation, thermal proxies/wakes, threat state
- `src/effects/`, `src/audio/`, `src/ui/` — presentation boundaries
- `vendor/` — exact local runtime libraries
- `assets/` — replacement-ready model, texture, audio, HDR, and font slots
- `docs/` — architecture, design, art direction, manifest, performance, roadmap
- `tools/` — standard-library dependency retrieval and verification

## Graphics and accessibility

Low, medium, and high profiles change pixel ratio, shadows, bloom, particles, pulse-history count, acoustic-memory duration, reflected-return count, and thermal-persistence budget without changing simulated creatures or outcomes. Resolution scale is independently adjustable. Reduced camera motion limits camera/body impulses and skips the traveling snake-switch camera; reduced flashing softens wavefront peaks, return onset, thermal adaptation, and vibration intensity. Vibration has its own setting and fails silently when unsupported. Volume buses, sensory intensity, fullscreen, and an optional performance overlay are included. Settings live only in `localStorage`; there are no cookies, analytics, or telemetry.

## Captures

The final local, uncommitted Milestone 4 set lives in `captures/milestone-4/`:

1. Run `python3 -m http.server 8080`, open the game at 1440×900 or 1920×1080, and create `captures/` if needed. The directory is gitignored.
2. Use fixed seed `M4-MOON-RUN-4271` and capture the twenty required menu, bat anatomy, traffic, echo, thermal, strike, contact, escape, report, and quality moments.
3. Name frames `m4-01-…` through `m4-20-…`; record seed, profile, difficulty, viewport, browser, GPU, quality, and active asset path in `metadata.json`.
4. Keep `captures/` gitignored. The release set is evidence, not a runtime dependency.

Milestone 2 frames may remain locally beside this set. Do not commit large PNGs unless a release task explicitly asks for them.

## GitHub Pages

The application uses only repository-relative URLs and needs no rewrite rules. In repository **Settings → Pages**, choose **Deploy from a branch**, select the desired branch and `/ (root)`, then save. `index.html` is the entry point. A project site such as `https://name.github.io/batsnake/` works because import-map and asset paths are relative.

## Release validation

The first-run Bat movement, event identity, persistent Gameplay reference, and requested steer/flap/call/brake flow are recorded in [docs/RELEASE_TEST_MATRIX.md](docs/RELEASE_TEST_MATRIX.md).

## Known limitations

The boa and cave are deliberately bounded procedural production treatments rather than external scan assets. Echo travel fronts can still show bands across nearby faceted surfaces. Determinism covers encounter structure and fixed-step AI decisions, not cross-browser floating-point-perfect input replay, audio noise, or cosmetic particles. See [ENCOUNTER_DESIGN.md](docs/ENCOUNTER_DESIGN.md), [MODEL_INTEGRATION.md](docs/MODEL_INTEGRATION.md), [SENSORY_RENDERING.md](docs/SENSORY_RENDERING.md), and [NEXT_STEPS.md](docs/NEXT_STEPS.md).
