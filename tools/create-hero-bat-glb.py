#!/usr/bin/env python3
"""Generate the project-created production hero bat GLB.

A skinned Cuban cave bat (~0.42 m wingspan after adapter normalization) with a
fusiform body, head, ears, muzzle, feet, tail membrane, three-finger wings and
sculpted membranes. Clips: flap, glide, brake, dive, panic, captured.
Pure standard library; deterministic output; MIT project asset.
"""
import argparse
import json
import math
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'assets/models/bats/hero-bat.glb'
METADATA_TARGET = ROOT / 'assets/models/bats/hero-bat.metadata.json'

# ---------------------------------------------------------------- mesh data
positions = []   # vec3
normals = []     # vec3
joints = []      # vec4 int
weights = []     # vec4 float
indices = []     # int, per material: body(0) membrane(1) detail(2)
prim_indices = {0: [], 1: [], 2: []}

# Joint slots: index into the skin's joints array (node index minus one).
JOINT = {'Spine': 0, 'Head': 1, 'Arm_L': 2, 'Forearm_L': 3, 'Finger1_L': 4, 'Finger2_L': 5, 'Finger3_L': 6,
         'Arm_R': 7, 'Forearm_R': 8, 'Finger1_R': 9, 'Finger2_R': 10, 'Finger3_R': 11, 'Tail': 12, 'Foot_L': 13, 'Foot_R': 14}


def add_vertex(p, n, joint, weight=1.0, joint2=0, weight2=0.0):
    index = len(positions)
    positions.append(p)
    normals.append(n)
    total = weight + weight2
    joints.append((joint, joint2, 0, 0))
    weights.append((weight / total, weight2 / total, 0.0, 0.0))
    return index


def lathe(center, radii, rings_z, sides, joint, weight, material, normal_scale=(1, 1, 1)):
    """Fusiform body along +Z. radii: (rx, ry) per ring index fraction."""
    ring_start = []
    for r in range(rings_z):
        t = r / (rings_z - 1)
        z = center[2] + (t - .5) * radii[2]
        bulge = math.sin(math.pi * min(1, max(0, t))) ** .7
        rx = radii[0] * bulge + .001
        ry = radii[1] * bulge + .001
        ring_start.append(len(positions))
        for s in range(sides):
            a = s / sides * math.pi * 2
            x = center[0] + math.cos(a) * rx
            y = center[1] + math.sin(a) * ry * .92
            n = (math.cos(a) * normal_scale[0], math.sin(a) * normal_scale[1], 0)
            ln = math.sqrt(sum(c * c for c in n)) or 1
            add_vertex((x, y, z), (n[0] / ln, n[1] / ln, 0), joint, weight)
    for r in range(rings_z - 1):
        for s in range(sides):
            a = ring_start[r] + s
            b = ring_start[r] + (s + 1) % sides
            c = ring_start[r + 1] + s
            d = ring_start[r + 1] + (s + 1) % sides
            prim_indices[material] += [a, c, b, b, c, d]
    # caps
    tip_a = add_vertex((center[0], center[1], center[2] - radii[2] / 2 - .004), (0, 0, -1), joint, weight)
    tip_b = add_vertex((center[0], center[1], center[2] + radii[2] / 2 + .004), (0, 0, 1), joint, weight)
    for s in range(sides):
        prim_indices[material] += [tip_a, ring_start[0] + (s + 1) % sides, ring_start[0] + s]
        last = ring_start[-1]
        prim_indices[material] += [tip_b, last + s, last + (s + 1) % sides]


def cone_between(base, tip, radius, joint, weight, material, sides=7, radius2=.001):
    """Tapered bone/spike from base to tip."""
    bx, by, bz = base
    tx, ty, tz = tip
    dx, dy, dz = tx - bx, ty - by, tz - bz
    length = math.sqrt(dx * dx + dy * dy + dz * dz) or 1
    dx, dy, dz = dx / length, dy / length, dz / length
    # orthogonal basis
    ux, uy, uz = (0, 1, 0) if abs(dy) < .9 else (1, 0, 0)
    vx = dy * uz - dz * uy
    vy = dz * ux - dx * uz
    vz = dx * uy - dy * ux
    vl = math.sqrt(vx * vx + vy * vy + vz * vz) or 1
    vx, vy, vz = vx / vl, vy / vl, vz / vl
    wx = dy * vz - dz * vy
    wy = dz * vx - dx * vz
    wz = dx * vy - dy * vx
    start = len(positions)
    for ring, (cx, cy, cz, r) in enumerate(((bx, by, bz, radius), (tx, ty, tz, radius2))):
        for s in range(sides):
            a = s / sides * math.pi * 2
            ox = (math.cos(a) * vx + math.sin(a) * wx) * r
            oy = (math.cos(a) * vy + math.sin(a) * wy) * r
            oz = (math.cos(a) * vz + math.sin(a) * wz) * r
            nl = math.sqrt(ox * ox + oy * oy + oz * oz) or 1
            add_vertex((cx + ox, cy + oy, cz + oz), (ox / nl, oy / nl, oz / nl), joint, weight)
    for s in range(sides):
        a = start + s
        b = start + (s + 1) % sides
        c = start + sides + s
        d = start + sides + (s + 1) % sides
        prim_indices[material] += [a, c, b, b, c, d]


def membrane(vertices2d, weights2d, material=1):
    """Triangulated membrane grid. vertices2d: rows x cols of (x,y,z); weights2d: (j1,w1,j2,w2)."""
    rows = len(vertices2d)
    cols = len(vertices2d[0])
    start = []
    for r in range(rows):
        start.append(len(positions))
        for c in range(cols):
            p = vertices2d[r][c]
            j1, w1, j2, w2 = weights2d[r][c]
            add_vertex(p, (0, 1, 0), j1, w1, j2, w2)
    for r in range(rows - 1):
        for c in range(cols - 1):
            a = start[r] + c
            b = start[r] + c + 1
            c2 = start[r + 1] + c
            d = start[r + 1] + c + 1
            prim_indices[material] += [a, c2, b, b, c2, d]


# ---- skeleton rest pose (identity rotations, translations only) ----
WRIST_L = (-.165, .006, .045)
WRIST_R = (.165, .006, .045)
BONES = {
    'Spine': (0, 0, 0),
    'Head': (0, .012, .1),
    'Arm_L': (-.055, .008, .02),
    'Forearm_L': WRIST_L,
    'Finger1_L': WRIST_L,
    'Finger2_L': WRIST_L,
    'Finger3_L': WRIST_L,
    'Arm_R': (.055, .008, .02),
    'Forearm_R': WRIST_R,
    'Finger1_R': WRIST_R,
    'Finger2_R': WRIST_R,
    'Finger3_R': WRIST_R,
    'Tail': (0, .002, -.1),
    'Foot_L': (-.032, -.012, -.085),
    'Foot_R': (.032, -.012, -.085),
}

# Finger geometry directions from the wrist (rest pose fan).
FINGER_DIR = {1: (-.62, 0, .78), 2: (-1, 0, -.08), 3: (-.8, 0, -.6)}


def finger_tip(side, f, ext=1.0):
    wrist = WRIST_L if side == 'L' else WRIST_R
    dx, dy, dz = FINGER_DIR[f]
    length = math.sqrt(dx * dx + dz * dz) or 1
    ux, uz = dx / length, dz / length
    if side == 'R':
        ux = -ux
    span = .21 * ext
    return (wrist[0] + ux * span, wrist[1] + dy, wrist[2] + uz * span)


# ---- body ----
lathe((0, 0, .0), (.05, .042, .21), 9, 10, JOINT['Spine'], 1.0, 0)
# ---- head ----
lathe((0, .014, .128), (.038, .033, .075), 7, 9, JOINT['Head'], 1.0, 0)
# muzzle
cone_between((0, .006, .155), (0, -.006, .192), .015, JOINT['Head'], 1.0, 0, sides=8, radius2=.005)
# ears: broad-based, moderately tall, tilted outward
for side, sgn in (('L', -1), ('R', 1)):
    cone_between((sgn * .02, .03, .115), (sgn * .04, .07, .102), .014, JOINT['Head'], 1.0, 0, sides=6, radius2=.0015)
# eyes (detail material, tiny)
for sgn in (-1, 1):
    lathe((sgn * .026, .018, .152), (.007, .007, .014), 4, 6, JOINT['Head'], 1.0, 2)
# ---- arms, fingers ----
for side, sgn in (('L', -1), ('R', 1)):
    arm = BONES[f'Arm_{side}']
    wrist = WRIST_L if side == 'L' else WRIST_R
    cone_between((sgn * .03, .006, .02), arm, .009, JOINT[f'Arm_{side}'], 1.0, 0)
    cone_between(arm, wrist, .0075, JOINT[f'Forearm_{side}'], 1.0, 0, radius2=.0055)
    for f in (1, 2, 3):
        tip = finger_tip(side, f, .62)
        cone_between(wrist, tip, .0042, JOINT[f'Finger{f}_{side}'], 1.0, 0, sides=5, radius2=.0022)
        cone_between(tip, finger_tip(side, f, 1.0), .0032, JOINT[f'Finger{f}_{side}'], 1.0, 0, sides=5, radius2=.0016)
# ---- wing membranes: continuous fan from the flank to the full finger outline ----
for side, sgn in (('L', -1), ('R', 1)):
    arm = BONES[f'Arm_{side}']
    wrist = WRIST_L if side == 'L' else WRIST_R
    # outline columns: shoulder, wrist, f1 tip, scallop bay, f2 tip, scallop bay, f3 tip, hip
    outline = [
        (arm, JOINT[f'Arm_{side}']),
        (wrist, JOINT[f'Forearm_{side}']),
        (finger_tip(side, 1, 1.0), JOINT[f'Finger1_{side}']),
        (finger_tip(side, 1, .52), JOINT[f'Finger1_{side}']),
        (finger_tip(side, 2, 1.0), JOINT[f'Finger2_{side}']),
        (finger_tip(side, 2, .5), JOINT[f'Finger2_{side}']),
        (finger_tip(side, 3, 1.0), JOINT[f'Finger3_{side}']),
        ((sgn * .05, -.004, -.11), JOINT['Tail']),
    ]
    chest = (sgn * .028, .0, .055)
    hip = (sgn * .032, -.004, -.1)
    cols = len(outline)
    rows = 5
    grid = []
    wgrid = []
    for r in range(rows + 1):
        t = r / rows
        row = []
        wrow = []
        for c in range(cols):
            bx = chest[0] + (hip[0] - chest[0]) * (c / (cols - 1))
            by = chest[1] + (hip[1] - chest[1]) * (c / (cols - 1))
            bz = chest[2] + (hip[2] - chest[2]) * (c / (cols - 1))
            point, joint = outline[c]
            x = bx + (point[0] - bx) * t
            y = by + (point[1] - by) * t - math.sin(t * math.pi) * .005
            z = bz + (point[2] - bz) * t
            row.append((x, y, z))
            body_joint = JOINT['Tail'] if c > cols * .6 else JOINT['Spine']
            wrow.append((body_joint, max(.04, 1 - t), joint, max(.04, t)))
        grid.append(row)
        wgrid.append(wrow)
    membrane(grid, wgrid)
# ---- tail membrane ----
grid = [
    [(-.032, -.01, -.085), (0, -.012, -.115), (.032, -.01, -.085)],
    [(-.02, -.008, -.13), (0, -.01, -.152), (.02, -.008, -.13)],
]
wgrid = [
    [(JOINT['Foot_L'], .8, JOINT['Tail'], .2), (JOINT['Tail'], 1, 0, 0), (JOINT['Foot_R'], .8, JOINT['Tail'], .2)],
    [(JOINT['Foot_L'], .5, JOINT['Tail'], .5), (JOINT['Tail'], 1, 0, 0), (JOINT['Foot_R'], .5, JOINT['Tail'], .5)],
]
membrane(grid, wgrid)
# feet
for side, sgn in (('L', -1), ('R', 1)):
    cone_between((sgn * .02, -.008, -.07), (sgn * .038, -.02, -.1), .005, JOINT[f'Foot_{side}'], 1.0, 2, sides=5, radius2=.002)

# ---------------------------------------------------------------- hierarchy
# node list: 0 HeroBat, then joints, then mesh node, then attachments/extras
NODE_NAMES = ['HeroBat', 'Spine', 'Head', 'Arm_L', 'Forearm_L', 'Finger1_L', 'Finger2_L', 'Finger3_L',
              'Arm_R', 'Forearm_R', 'Finger1_R', 'Finger2_R', 'Finger3_R', 'Tail', 'Foot_L', 'Foot_R',
              'BatMesh', 'Ear_L', 'Ear_R', 'Mouth', 'CapturePoint']
CHILDREN = {
    'HeroBat': ['Spine', 'BatMesh', 'Mouth', 'CapturePoint'],
    'Spine': ['Head', 'Arm_L', 'Arm_R', 'Tail', 'Foot_L', 'Foot_R'],
    'Head': ['Ear_L', 'Ear_R'],
    'Arm_L': ['Forearm_L'], 'Forearm_L': ['Finger1_L', 'Finger2_L', 'Finger3_L'],
    'Arm_R': ['Forearm_R'], 'Forearm_R': ['Finger1_R', 'Finger2_R', 'Finger3_R'],
}
PARENT = {child: parent for parent, children in CHILDREN.items() for child in children}
EXTRA_TRANSFORMS = {
    'Ear_L': (-.028, .052, .112), 'Ear_R': (.028, .052, .112),
    'Mouth': (0, -.004, .185), 'CapturePoint': (0, -.02, .02),
}

node_index = {name: i for i, name in enumerate(NODE_NAMES)}
joint_node_indices = [node_index[name] for name in NODE_NAMES[1:16]]

# ---------------------------------------------------------------- animation
def quat_axis(axis, degrees):
    theta = math.radians(degrees) / 2
    s = math.sin(theta)
    return (axis[0] * s, axis[1] * s, axis[2] * s, math.cos(theta))


def quat_mul(a, b):
    ax, ay, az, aw = a
    bx, by, bz, bw = b
    return (aw * bx + ax * bw + ay * bz - az * by,
            aw * by - ax * bz + ay * bw + az * bx,
            aw * bz + ax * by - ay * bx + az * bw,
            aw * bw - ax * bx - ay * by - az * bz)


Z = (0, 0, 1)
Y = (0, 1, 0)
X = (1, 0, 0)

# clip definitions: {node: [(t, quat), ...]}
def wing_clip(times, arm_deg, fore_deg, fing_deg, head_pitch=0.0, tail_deg=0.0):
    """Mirrored wing keyframes. deg lists per time; Z-axis lifts for L, lowers for R."""
    tracks = {}
    for i, t in enumerate(times):
        a, f, g = arm_deg[i], fore_deg[i], fing_deg[i]
        for side, sgn in (('L', 1), ('R', -1)):
            tracks.setdefault(f'Arm_{side}', []).append((t, quat_axis(Z, sgn * a)))
            tracks.setdefault(f'Forearm_{side}', []).append((t, quat_axis(Z, sgn * f)))
            for n in (1, 2, 3):
                lag = 1 + n * .12
                tracks.setdefault(f'Finger{n}_{side}', []).append((t, quat_axis(Z, sgn * g * lag)))
        tracks.setdefault('Head', []).append((t, quat_axis(X, head_pitch)))
        tracks.setdefault('Tail', []).append((t, quat_axis(X, tail_deg)))
    return tracks


def ease(t):
    return t * t * (3 - 2 * t)


CLIPS = {}
# flap: 0.55 s power stroke, down fast up slow
flap_times = [0, .1, .22, .34, .44, .55]
CLIPS['flap'] = wing_clip(flap_times,
                          [4, -34, 26, 30, 8, 4],      # arm Z (down=-, up=+)
                          [2, -12, 10, 12, 4, 2],       # forearm follow
                          [2, -8, 6, 8, 3, 2],          # fingers feather
                          head_pitch=2.0, tail_deg=-4.0)
# glide: 2.6 s level sway
CLIPS['glide'] = wing_clip([0, .65, 1.3, 1.95, 2.6],
                           [2, 5, 2, -1, 2],
                           [1, 3, 1, 0, 1],
                           [1, 2.5, 1, 0, 1],
                           head_pitch=0.0, tail_deg=-2.0)
# brake: 1.1 s wings forward and spread, body pitches up
brake_tracks = wing_clip([0, .35, .7, 1.1],
                         [-8, -14, -12, -8],
                         [-4, -8, -6, -4],
                         [-3, -6, -5, -3],
                         head_pitch=-14.0, tail_deg=18.0)
for side, sgn in (('L', 1), ('R', -1)):  # cup wings forward-down (X drop) and fan fingers wide
    for i, t in enumerate([0, .35, .7, 1.1]):
        cup = [6, 20, 18, 6][i]
        brake_tracks[f'Arm_{side}'][i] = (t, quat_mul(quat_axis(Y, sgn * -cup), brake_tracks[f'Arm_{side}'][i][1]))
        for n in (1, 2, 3):
            fan = [4, 12 + n * 3, 11 + n * 3, 4][i]
            brake_tracks[f'Finger{n}_{side}'][i] = (t, quat_mul(quat_axis(Y, sgn * -fan), brake_tracks[f'Finger{n}_{side}'][i][1]))
CLIPS['brake'] = brake_tracks
# dive: 1.4 s swept back tuck
dive_tracks = wing_clip([0, .5, .9, 1.4],
                        [-16, -20, -18, -16],
                        [-8, -10, -9, -8],
                        [-6, -8, -7, -6],
                        head_pitch=8.0, tail_deg=-8.0)
for side, sgn in (('L', 1), ('R', -1)):
    for i, t in enumerate([0, .5, .9, 1.4]):
        sweep = [26, 34, 30, 26][i]
        dive_tracks[f'Arm_{side}'][i] = (t, quat_mul(quat_axis(Y, sgn * sweep), dive_tracks[f'Arm_{side}'][i][1]))
CLIPS['dive'] = dive_tracks
# panic: 0.36 s rapid shallow asymmetric strokes
panic_times = [0, .09, .18, .27, .36]
panic = wing_clip(panic_times,
                  [8, -26, 18, -22, 8],
                  [3, -9, 7, -8, 3],
                  [2, -6, 5, -5, 2],
                  head_pitch=5.0, tail_deg=-6.0)
for i, t in enumerate(panic_times):  # right wing lags for nervous asymmetry
    jitter = [0, 6, -4, 5, 0][i]
    q = panic['Arm_R'][i][1]
    panic['Arm_R'][i] = (t, quat_mul(quat_axis(Z, jitter), q))
CLIPS['panic'] = panic
# captured: 1.6 s folded struggle pulses that settle
cap_times = [0, .18, .36, .6, .9, 1.2, 1.6]
cap = wing_clip(cap_times,
                [-62, -70, -60, -68, -62, -66, -64],
                [-30, -38, -30, -36, -31, -34, -33],
                [-20, -26, -20, -24, -21, -23, -22],
                head_pitch=6.0, tail_deg=4.0)
for side in ('L', 'R'):
    for node in (f'Arm_{side}', f'Forearm_{side}'):
        for i, t in enumerate(cap_times):  # struggle bursts decay
            burst = [0, 9, -7, 6, -3, 2, 0][i]
            q = cap[node][i][1]
            cap[node][i] = (t, quat_mul(quat_axis(Z, burst if side == 'L' else -burst), q))
CLIPS['captured'] = cap

# ---------------------------------------------------------------- binary packing
binary = bytearray()
accessors = []
buffer_views = []


def add_buffer_view(data, target=None):
    offset = len(binary)
    binary.extend(data)
    while len(binary) % 4:
        binary.append(0)
    view = {'buffer': 0, 'byteOffset': offset, 'byteLength': len(data)}
    if target:
        view['target'] = target
    buffer_views.append(view)
    return len(buffer_views) - 1


def add_accessor(view, component, count, ctype, minimum=None, maximum=None):
    accessor = {'bufferView': view, 'componentType': component, 'count': count, 'type': ctype}
    if minimum is not None:
        accessor['min'] = minimum
    if maximum is not None:
        accessor['max'] = maximum
    accessors.append(accessor)
    return len(accessors) - 1


# geometry accessors
pos_data = b''.join(struct.pack('<3f', *p) for p in positions)
pos_view = add_buffer_view(pos_data, 34962)
mins = [min(p[i] for p in positions) for i in range(3)]
maxs = [max(p[i] for p in positions) for i in range(3)]
pos_acc = add_accessor(pos_view, 5126, len(positions), 'VEC3', mins, maxs)
nrm_data = b''.join(struct.pack('<3f', *n) for n in normals)
nrm_acc = add_accessor(add_buffer_view(nrm_data, 34962), 5126, len(normals), 'VEC3')
jnt_data = b''.join(struct.pack('<4B', *j) for j in joints)
jnt_acc = add_accessor(add_buffer_view(jnt_data, 34962), 5121, len(joints), 'VEC4')
wgt_data = b''.join(struct.pack('<4f', *w) for w in weights)
wgt_acc = add_accessor(add_buffer_view(wgt_data, 34962), 5126, len(weights), 'VEC4')

primitives = []
materials = [
    {'name': 'Body fur', 'pbrMetallicRoughness': {'baseColorFactor': [.16, .105, .075, 1], 'roughnessFactor': .95, 'metallicFactor': 0}},
    {'name': 'Wing membrane', 'pbrMetallicRoughness': {'baseColorFactor': [.21, .115, .08, .94], 'roughnessFactor': .82, 'metallicFactor': 0}, 'alphaMode': 'BLEND', 'doubleSided': True},
    {'name': 'Dark detail', 'pbrMetallicRoughness': {'baseColorFactor': [.03, .022, .018, 1], 'roughnessFactor': .6, 'metallicFactor': 0}},
]
for mat_index, tris in prim_indices.items():
    idx_data = b''.join(struct.pack('<I', i) for i in tris)
    idx_acc = add_accessor(add_buffer_view(idx_data, 34963), 5125, len(tris), 'SCALAR')
    primitives.append({'attributes': {'POSITION': pos_acc, 'NORMAL': nrm_acc, 'JOINTS_0': jnt_acc, 'WEIGHTS_0': wgt_acc}, 'indices': idx_acc, 'material': mat_index})

# inverse bind matrices (identity rest rotations -> pure translations)
ibm = bytearray()
for name in NODE_NAMES[1:16]:
    wx, wy, wz = BONES[name]
    ibm.extend(struct.pack('<16f', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -wx, -wy, -wz, 1))
ibm_acc = add_accessor(add_buffer_view(bytes(ibm)), 5126, 15, 'MAT4')

# animation accessors
animations = []
for clip_name, tracks in CLIPS.items():
    samplers = []
    channels = []
    for node_name, keys in tracks.items():
        times = [k[0] for k in keys]
        quats = [k[1] for k in keys]
        time_acc = add_accessor(add_buffer_view(b''.join(struct.pack('<f', t) for t in times)), 5126, len(times), 'SCALAR', [min(times)], [max(times)])
        quat_acc = add_accessor(add_buffer_view(b''.join(struct.pack('<4f', *q) for q in quats)), 5126, len(quats), 'VEC4')
        samplers.append({'input': time_acc, 'output': quat_acc, 'interpolation': 'LINEAR'})
        channels.append({'sampler': len(samplers) - 1, 'target': {'node': node_index[node_name], 'path': 'rotation'}})
    animations.append({'name': clip_name, 'samplers': samplers, 'channels': channels})

# nodes
nodes = []
for name in NODE_NAMES:
    node = {'name': name}
    if name in CHILDREN:
        node['children'] = [node_index[c] for c in CHILDREN[name]]
    if name in BONES:
        parent = PARENT.get(name)
        parent_position = BONES.get(parent, (0, 0, 0))
        node['translation'] = [BONES[name][axis] - parent_position[axis] for axis in range(3)]
    if name in EXTRA_TRANSFORMS:
        node['translation'] = list(EXTRA_TRANSFORMS[name])
    if name == 'BatMesh':
        node['mesh'] = 0
        node['skin'] = 0
    nodes.append(node)

gltf = {
    'asset': {'version': '2.0', 'generator': 'Batsnake project-created hero bat', 'copyright': 'Batsnake project (MIT)'},
    'scene': 0,
    'scenes': [{'nodes': [0]}],
    'nodes': nodes,
    'meshes': [{'name': 'Bat body and membranes', 'primitives': primitives}],
    'skins': [{'joints': joint_node_indices, 'inverseBindMatrices': ibm_acc, 'skeleton': node_index['Spine']}],
    'materials': materials,
    'animations': animations,
    'buffers': [{'byteLength': len(binary)}],
    'bufferViews': buffer_views,
    'accessors': accessors,
}

payload = json.dumps(gltf, separators=(',', ':')).encode()
payload += b' ' * ((4 - len(payload) % 4) % 4)
while len(binary) % 4:
    binary.append(0)
glb_bytes = (struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(payload) + 8 + len(binary))
             + struct.pack('<I4s', len(payload), b'JSON') + payload
             + struct.pack('<I4s', len(binary), b'BIN\0') + bytes(binary))
triangles = sum(len(t) for t in prim_indices.values()) // 3
dimensions = tuple(round((maxs[axis] - mins[axis]) * .56, 4) for axis in range(3))
clip_durations = {name: max(key[0] for keys in tracks.values() for key in keys) for name, tracks in CLIPS.items()}
metadata = {
    'assetId': 'hero-bat',
    'path': './assets/models/bats/hero-bat.glb',
    'license': 'Project-created MIT asset (tools/create-hero-bat-glb.py)',
    'expectedScale': .56,
    'maxBytes': 75000,
    'maxTriangles': 900,
    'maxBones': 15,
    'maxMaterials': 3,
    'maxTextures': 0,
    'forwardAxis': '+Z',
    'upAxis': '+Y',
    'nodes': {'root': 'HeroBat', 'body': 'BatMesh', 'spine': 'Spine', 'head': 'Head', 'leftWing': 'Arm_L', 'rightWing': 'Arm_R', 'leftMembrane': 'Finger2_L', 'rightMembrane': 'Finger2_R', 'mouth': 'Mouth', 'capture': 'CapturePoint'},
    'animations': {name: name for name in ('flap', 'glide', 'brake', 'dive', 'panic', 'captured')},
    'heatRegions': [
        {'node': 'Spine', 'kind': 'torso', 'temperature': .95, 'size': .075},
        {'node': 'Head', 'kind': 'head', 'temperature': 1, 'size': .05},
        {'node': 'Arm_L', 'kind': 'wingRoot', 'temperature': .84, 'size': .045},
        {'node': 'Arm_R', 'kind': 'wingRoot', 'temperature': .84, 'size': .045},
        {'node': 'Finger2_L', 'kind': 'membrane', 'temperature': .5, 'size': .09},
        {'node': 'Finger2_R', 'kind': 'membrane', 'temperature': .5, 'size': .09},
    ],
    'echoRegions': ['HeroBat'],
    'attachments': {'camera': 'Head', 'capture': 'CapturePoint', 'mouth': 'Mouth'},
    'lod': [{'role': 'flock', 'representation': 'BatFlock instanced procedural silhouette', 'reason': 'One bounded renderer preserves deterministic ecology without per-bat mixers.'}],
    'fallback': 'BatFirstPersonRig',
    'provenance': {'author': 'Batsnake project', 'creationMethod': 'Deterministic Python standard-library generator', 'redistribution': 'MIT; commercial use, modification, and redistribution permitted', 'externalSources': []},
    'statistics': {'byteSize': len(glb_bytes), 'triangles': triangles, 'vertices': len(positions), 'bones': 15, 'materials': ['Body fur', 'Wing membrane', 'Dark detail'], 'textures': [], 'integratedBoundsMeters': list(dimensions), 'origin': 'Center of mass', 'clipDurationsSeconds': clip_durations},
}
metadata_bytes = (json.dumps(metadata, indent=2) + '\n').encode()
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true', help='fail unless committed GLB and metadata match deterministic output')
args = parser.parse_args()
if args.check:
    if not TARGET.exists() or TARGET.read_bytes() != glb_bytes:
        raise SystemExit(f'{TARGET.relative_to(ROOT)} does not match deterministic generator output')
    if not METADATA_TARGET.exists() or METADATA_TARGET.read_bytes() != metadata_bytes:
        raise SystemExit(f'{METADATA_TARGET.relative_to(ROOT)} does not match deterministic generator output')
else:
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_bytes(glb_bytes)
    METADATA_TARGET.write_bytes(metadata_bytes)
print(TARGET.relative_to(ROOT), len(glb_bytes), 'bytes,', triangles, 'triangles,', len(positions),
      'vertices,', dimensions, 'm integrated bounds')
