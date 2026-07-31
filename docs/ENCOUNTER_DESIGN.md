# Encounter design

## Session identity and rhythm

Each run has a normalized, copyable seed. `SessionSeed` hashes human-readable seed text into a single `Random` root; named forks isolate profile selection, director timing, flock agents, roles, routes, and individual snake decisions. Gameplay code does not call `Math.random()`. Replaying the same seed at the same difficulty reproduces the broad traffic plan and fixed-step AI sequence.

`EncounterDirector` influences but never directly moves animals. Its normalized session clock passes through stillness, initial movement, building departure, peak traffic, disruption, final stream, and resolution. Each phase produces density, panic, and ambush-pressure signals. The environment communicates the curve through bat occupancy, posture, calls, wing density, quiet, and entrance airflow; phase labels appear only in the performance overlay.

Eight weighted parameter sets reshape the same authored cave:

| Profile | Traffic character | Pressure character |
|---|---|---|
| Broad Stream | Balanced, dense central flow | Readable baseline ambush |
| Split Route | High, shelf, lower, and arc preference | Divided observation |
| Low Ceiling | Lower weave and shelf | Exposed constrictions |
| Panic Cascade | Sensitive roles and dense reactions | Disruptions spread rapidly |
| Sparse Traffic | Separated individuals | Patience and target selection |
| Late Surge | Restrained opening, strong final stream | Late commitment |
| Aggressive Ambush | Exposed central/lower lanes | Alert, frequent posture |
| Quiet Mouth | Outer/shelf bias and a subdued exit | Direction inferred from airflow |

Difficulty modifies profile weights and phase outputs. Field Study offers longer recovery and readable reactions; Night Flight is the intended baseline; Flight Line increases density, panic transfer, adaptive reaction, route pressure, targets, and score multiplier while shortening the observation window.

## Route ecology

`FlightRouteNetwork` describes five invisible probabilistic corridors with meter-scale waypoints, width, speed bias, risk, snake exposure, exit approach, and alternate branches. The central route is fast/exposed; high crosses ceiling silhouettes; lower weaves columns; shelf uses lateral cover; arc spends distance to reduce exposure. These are steering influences, not rails.

Every bat receives a lightweight role parameter record:

- Confident leaders favor speed, lower congestion aversion, and route commitment.
- Dense followers align and remain with occupied traffic.
- Nervous edge flyers keep separation and switch after disturbance.
- Slow juveniles trade speed for stronger flock dependence.
- Escape flyers take fast, wider lines and react sharply to immediate threat.

Choice combines role bias, profile weight, congestion, current panic, recent strikes/calls, snake proximity, and route loyalty. The player perturbs nearby bats, adds traffic pressure, and can draw a strike into a corridor, but does not become a universal leader. Occupancy and panic totals are bounded debug facts.

## Predator memory

Each companion `SnakeAI` owns one bounded `SnakeMemory`: decaying per-route observations, local traffic, call count, recent misses, successful lane, player sightings, panic direction, and confidence. Confidence changes intercept tolerance. Boas extend during traffic peaks, withdraw after poor outcomes, move slowly around the anchor toward useful lanes, and suppress duplicate lunges. The behavior remains constrained by controller arcs and deliberately noisy decisions.

The player reads group state only through head direction, coil tension, extension, tongue/body sound, thermal motion, and actual strikes. Focus narrows thermal context and steadies aim. Switching transfers awareness with an adaptation veil, clears focus, inherits the new animal’s current posture, and briefly locks charging.

## Cause, learning, and scoring

A quick bat call has 19 m range, short memory, short cooldown, and reduced boa awareness. A deep call reaches 38 m, produces richer memory/returns, and creates greater alertness. Collision disrupts flap rhythm; near misses create panic; dense traffic offers cover but congestion; airflow provides a non-HUD exit cue.

Bat score combines progress/escape, clean flight, useful rather than absent calling, controlled speed, near-miss survival, nearby flock context, and difficulty. Snake score combines captures, accuracy, intercept quality, use of multiple posts, patient idle observation, miss cost, and difficulty. Field reports expose only the few facts useful for the next run.

Contextual prompts are action-gated, non-pausing, peripheral, persisted in `localStorage`, and optional. Field Notes distinguish modest biological observations from the game’s compressed and stylized simulation.

## Determinism limits

Same seed, difficulty, quality allocation, and fixed-step inputs reproduce profile, phase curve, starting roles/routes, and sufficiently stable AI decisions. Exact images, particles, Web Audio scheduling, pointer timing, render interpolation, and floating-point trajectories may differ by browser/GPU. This is authored replay variation, not a lockstep replay or networking guarantee.

