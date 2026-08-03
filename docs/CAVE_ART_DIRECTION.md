# Milestone 6 cave art direction

## Recognition thesis

The cave becomes recognizable through an authored sequence of silhouettes: the low ribbed Roost Vault opens under the Guano Shelf, compresses through Fang Ceiling, divides around Split Column, expands into Bell Chamber beside Curtain Wall, drops over Broken Pillar, then cools and opens through Moon Gate. The mouth is a framed view into humid Cuban night, not a luminous disk.

The existing back-to-front topology, five flight routes, three hunting posts, and escape direction remain. Milestone 6 composes geology around those systems rather than replacing them.

## Spatial map

Top-down schematic, north / open air toward `+Z`:

```text
                              N  +Z / OPEN AIR
                 distant mogotes, palms, moon, haze
                         ┌──── MOUTH ────┐
                         │   MOON GATE   │ z +43…+55
                  arc ───┘      ↑        └── shelf route
                       MOON GALLERY          z +24…+42
                  [Moon Perch boa]   fractured wall
                         ╲    central    ╱
                 BROKEN PILLAR / LOWER SLOT z +12…+24
                    lower weave ↗   ↖ high route
              CURTAIN WALL ── BELL CHAMBER ── SENTINEL
                    east        z -8…+14        COLUMN
                          SPLIT COLUMN z -18…-10
                 arc ──────╲ gap ╱────── central
                    FANG CEILING / NARROWS z -31…-20
                      [Fang Perch boa]
                  GUANO SHELF       shelf route
                        ROOST VAULT z -54…-36
                    bat start pocket (-1.2, 3.4, -49.5)
                              S  -Z / DEEP CAVE
```

Longitudinal section, looking west:

```text
 y
16       resting colony       fangs       Bell vault        Moon Gate
         vvvvvvvvvvvvv       V V V V      __________       /\      moon
12  ____/ Roost Vault \__Guano Shelf____/          \_____/  \________
 8       start →→→        upper route          boa ledges       exterior
 4  _____central________Split Column_____Broken Pillar____mouth________ z
 0       guano beds       narrow gap       Lower Slot        low terrain
-8  ____damp floor________rubble_________wet runnel____________________
       -54   -40   -25   -12    0   +18   +32   +50   +75
```

## Authored regions and landmarks

| Region / landmark | Approximate span | Recognition silhouette | Geological logic | Gameplay and sensory role |
|---|---:|---|---|---|
| **Roost Vault** | `z -54…-36` | Ribbed ceiling pockets over a broad black colony mass | Dissolved bedding pockets and dry fractured ribs | Starting orientation, colony source, deep resonance, scale reference |
| **Guano Shelf** | `(5, 8, -32)` | Broad undercut ledge with pale rim and dark deposits below | Durable limestone bed projecting beneath the primary roost | Divides high/shelf routes, shades the start, strong planar echo |
| **Fang Ceiling** | `z -31…-20` | One clustered canopy of long wet stalactites | Concentrated drip line below a ceiling fracture | Claustrophobic upper hazard, first boa support, repeated narrow echo gaps |
| **Split Column** | `z -16` | Two fused column lobes separated by a tall flyable cleft | A mature column fractured along a vertical joint | Central landmark and route divider; layered column/cavity return |
| **Bell Chamber** | `z -8…+14` | Sudden lateral and vertical expansion | Large solution chamber along a joint intersection | Scale contrast, route crossings, readable traffic composition |
| **Curtain Wall** | east wall, `z -3…+13` | Folded calcite draperies descending diagonally | Mineral deposition along a persistent wall seep | Second boa support, planar/folded echoes, wet highlights and concealment |
| **Broken Pillar / Lower Slot** | `z +12…+24` | Fallen column sections forming a low triangular opening | Collapse and breakdown rubble below an old column | Lower-route weave, collision landmark, obstruction-readable strike backdrop |
| **Moon Gallery** | `z +24…+42` | Fractured shelves stepping toward cool air | Entrance-zone breakdown and algae-darkened joints | Third boa support, increasing airflow, moonlit depth layers |
| **Moon Gate / Mouth** | `z +43…+55` | Asymmetric stone arch framing vegetation, terrain, and sky | Eroded entrance with breakdown apron | Strong exit bearing, final echo opening, exterior reveal without a portal |

## Route vocabulary

- **Central Run**: the fastest line, framed successively by Split Column, Bell Chamber, and Moon Gate.
- **High Route**: begins above the Guano Shelf, threads the edge of Fang Ceiling, then crosses Bell Chamber.
- **Lower Slot**: stays close to rubble and the Broken Pillar; darker, slower, and rich in near-field scale cues.
- **Shelf Route**: follows the Guano Shelf and Curtain Wall before joining the entrance approach.
- **Outside Arc**: hugs the western wall and uses large chamber silhouettes rather than small obstacles.

Routes remain invisible. These names are development vocabulary only.

## Boa integration

1. **Fang Perch** (`-4.8, 11.8, -25`): coils sit in a fractured ceiling cradle behind the stalactite drip line; the head reaches the central/high crossing.
2. **Curtain Ledge** (`5.4, 12.5, 1`): the body wraps a projecting calcite rib and disappears behind Curtain Wall folds; the head observes Bell Chamber.
3. **Moon Perch** (`-4.2, 13, 25`): coils bridge a broken entrance shelf under an overhang; the strike line crosses Moon Gallery while the body remains concealed from the deep cave.

The anchors and strike mechanics remain unchanged. Support stone, concealment, and sight lines are fitted to them.

## Surface and water logic

- Deep roost stone is dry-matte above, guano-dark below, with pale fractured ribs.
- Fang Ceiling and Curtain Wall are the primary active seep zones: darker stone, calcite runs, droplets, and localized specular response.
- Bell Chamber is mostly old, high-roughness limestone; scale comes from broad surfaces, not uniform noise.
- Broken Pillar rubble is dry and chalkier on fresh fracture faces, damp only where it meets the floor runnel.
- Moon Gallery gains algae and soil only within reach of exterior humidity and plant matter.
- Wetness follows authored vertical paths and floor collection zones. It is never randomized evenly over the shell.

## Atmosphere and lighting hierarchy

1. Cool moon and sky enter through Moon Gate.
2. Very weak sky bounce separates the major silhouettes; it does not illuminate the whole tunnel.
3. Wet surfaces catch narrow highlights along seep paths.
4. Echolocation and thermal perception remain the strongest momentary information sources.
5. Minimal localized bounce may identify a physically plausible wet shelf or pale calcite face.

Fog is thinner inside Bell Chamber, denser at the humid mouth and in the deep roost pocket. Dust dominates dry regions; droplets dominate seep regions; exterior insects remain near Moon Gate.

## Sensory test

- Echolocation must distinguish the Split Column cleft, Fang Ceiling gaps, Guano Shelf plane, Curtain Wall folds, Broken Pillar slot, and open Moon Gate.
- Thermal mode keeps all geology cool and low-contrast but preserves those large silhouettes through depth, fog, and restrained reflected value. Resting/peeling bats and the flight stream remain the only warm field at colony scale.
- New collision proxies are compound spheres around authored solid masses. Visible gaps remain open in both collision and spatial queries.

## Performance and asset contract

Hero landmarks use shared generated materials and a bounded collection of static meshes. Repeated ribs, rubble, roost bats, leaves, and distant vegetation use instancing. No runtime asset request is added. Low/medium/high may change shadowing, particle draw ranges, and distant presentation density only; routes, colliders, flock simulation, anchors, and sensory ranges remain identical.

All Milestone 6 environment pixels, geometry, shaders, and procedural audio are project-created in source and covered by the repository MIT license. No external asset or attribution is introduced.
