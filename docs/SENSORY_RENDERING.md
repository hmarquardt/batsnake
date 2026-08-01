# Sensory rendering

## Milestone 2 architecture

Both sensory modes use the same physical cave and depth buffer, but they reveal different metadata. The implementation keeps creature controllers unaware of render technique. `SpatialQuerySystem` is the shared geometric authority for major formations, analytic tunnel bounds, reflection selection, line of sight, obstacle anticipation, and swept proximity. Render systems consume its results; they do not maintain duplicate cave ray logic.

### Spatial query data

The authored cave registers a small list of high-value response volumes: the side walls and floor are analytic tunnel surfaces; columns and the hanging shelf are bounded formations; selected stalactites are major hazards; the mouth is a directional plane; snake rigs register dynamic organic responders. Each record has a stable id, kind, center/bounds, acoustic reflectivity, thermal character, and gameplay role.

Three.js geometry remains the visual source, Rapier remains the fixed physics source, and analytic/tagged volumes handle frequent perception queries. This division is intentional:

- Rapier: fixed collision bodies and future physical casts.
- Analytic cave volumes: player collision correction, wall/floor reflection points, entrance boundaries.
- Tagged bounds: columns, shelf, major stalactites, echo clusters, bat anticipation, and inexpensive line-of-sight rejection.
- Dynamic responder bounds: snakes and other moving biological targets.

## Echolocation pipeline

The implemented layered pipeline preserves `emit(origin)`, cooldown, range, threat propagation, sensory intensity, and reduced-flashing behavior.

1. **Direct wavefront** — a pooled translucent world-space shell travels from the bat. It communicates propagation but contributes little persistent brightness.
2. **Surface response** — the tunnel and tagged formation echo meshes share a bounded pulse-history uniform array. World distance gates the moving band; view-normal and procedural ridge terms emphasize silhouettes, concavity, and broken surface scale rather than raising the cave’s total exposure.
3. **Acoustic memory** — each pulse slot records origin and age. After arrival (`age - distance / waveSpeed`), an uneven exponential response remains for a profile-specific one-to-three-second window. New calls rotate through slots so recent geometry can overlap without becoming permanent.
4. **Reflected returns** — `SpatialQuerySystem` selects the strongest visible side wall, floor/shelf, column, mouth, and nearby biological reflectors. Pooled marker clusters activate after distance-derived delays and decay individually.
5. **Biological response** — snake visual adapters expose organic echo-response geometry for head, neck, and coils. Their denser, warmer stipple and motion-biased decay differ from the cave’s thin mineral edge response.
6. **Audio** — the same reflection records schedule comfortable positional oscillator returns. Delay, frequency, decay, and gain derive from distance, reflector kind, and reflectivity.

Low uses the direct shell, one pulse-memory slot, simplified tunnel response, and very few clusters. Medium adds important formations, two memory slots, and moderate clusters. High uses three histories, richer ridge/normal response, biological overlays, and the full bounded return set.

## Thermal pipeline

Heat is explicit entity metadata, not a full-screen false-color filter. Visual adapters register render objects by region: torso, head, wing root, membrane, active muscle, snake head, and snake body. Each emitter record provides nominal temperature, current activity, bounds, and its owner.

Activation drives a smooth adaptation value. Warm regions resolve first; cool cave fog and wet surfaces settle afterward. Deactivation leaves a short warm persistence while normal exposure returns. Materials remain in the ordinary scene depth graph, so cave geometry occludes both live heat and persistence.

High quality uses a bounded instanced history pool sampled from actual moving emitters. Samples keep position, velocity-biased scale, temperature, age, and owner visibility; they depth-test against the cave and decay rapidly. Medium uses fewer, shorter samples. Low uses only live emitter geometry and minimal persistence. No profile allocates sprites or materials per frame.

Strike preparation does not lock a target. Instead, the selected snake’s visual state increases local adaptation and gives moving nearby heat a slightly longer history, making intercept timing legible through motion.

## Accessibility

`sensoryIntensity` scales response luminance and persistence opacity without changing query range or gameplay information. `reducedFlashing` lowers wavefront peaks, reflected-cluster onset, and adaptation speed while retaining spatial timing. `reducedCameraMotion` affects embodiment and switching motion, not sensory geometry. No default option reveals creatures through rock.

## Measurement and limits

Sensory systems expose rolling CPU update timing to the performance overlay. Profile limits bound pulse histories, reflected markers, biological overlays, and thermal trail samples. The implementation avoids per-frame geometry/material creation and reuses vectors, matrices, colors, and query result objects.

This is not an acoustic solver or calibrated thermography. Cave reflections are selected from authored/analytic response volumes, material ridges are procedural rather than texture-derived, and thermal persistence is bounded instanced geometry rather than a full motion-vector reprojection buffer. These choices preserve offline static deployment, stable occlusion, and predictable medium-profile cost. A future high-end path may reconstruct view-space position from composer depth and accumulate quarter-resolution history, but it must continue to use the same query and emitter interfaces.

## Milestone 3 sensory gameplay

`emit(origin, kind)` retains the Milestone 2 pipeline while selecting a call envelope. Quick calls travel 19 m for 0.92 s, use weaker memory/return gain, cool down rapidly, and add about half the organic awareness of a deep call. Deep calls travel 38 m for 1.9 s, populate full profile histories/clusters, and generate the stronger directional audio/boa response. Reduced flashing changes onset and intensity, not the tactical range distinction.

Snake focus is an input to thermal presentation, not target selection. It raises local warm-body contrast and steadies head motion while dimming peripheral persistence; line-of-sight and depth testing remain unchanged. Activation, focus, switching afterimage, and deactivation share the existing adaptation state, so no transition reveals bodies through rock.

Encounter rhythm now informs sensory audio mixing. Airflow and flock density rise independently of explicit calls, while quiet phases leave headroom for direct and reflected returns. Seed/profile/phase never alter rock truth: the same cave volumes, heat emitters, and echo responders remain spatially authoritative.

## Milestone 4 refinement

Echo surface response uses antialiased arrival width, broad deterministic world-space noise, a per-geometry fill factor, and approximate transformed instance normals. The cave shell is offset inward per draw while formations offset outward, avoiding coplanar response geometry without another mesh allocation. The pulse sphere’s former high-frequency periodic grain was the source of the severe diagonal band artifact; smooth low-frequency value noise removes that construction pattern. Organic boa meshes retain a softer additive response and longer motion character. Quick/deep ranges, awareness cost, history limits, and reflector selection are unchanged. No echo render target was added.

Thermal focus now changes motion evidence: samples near the aim cone persist longer and become clearer while peripheral trails recede. Bat head, torso, paired flight-muscle roots, and membranes remain separate emitters; boa head and body remain distinct. Cave materials, entrance vegetation, lights, and fog blend toward cool depth without disabling occlusion. Pools remain fixed at 12/48/112 samples and low retains all live heat information.

At the 1920×1080 Apple M2 profile, thermal update p95 was 0.1 ms in each quality. Echo uses existing geometry/history pools and added no render target. See `PERFORMANCE.md` for the full matrix and remaining measurement limitations.
