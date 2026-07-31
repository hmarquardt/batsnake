#!/usr/bin/env python3
"""Generate the tiny project-created hero bat pipeline test GLB."""
import json, struct
from pathlib import Path

root=Path(__file__).resolve().parents[1]
target=root/'assets/models/bats/hero-bat-pilot.glb'
positions=[(-.45,0,0),(0,.16,.08),(0,-.18,.04),(0,.16,.08),(.45,0,0),(0,-.18,.04),(-.08,-.08,-.08),(.08,-.08,-.08),(0,.18,.12)]
binary=b''.join(struct.pack('<3f',*p) for p in positions)
times=[0,.5,1]
left=[(0,0,.2474,.9689),(0,0,-.3429,.9394),(0,0,.2474,.9689)]
right=[(0,0,-.2474,.9689),(0,0,.3429,.9394),(0,0,-.2474,.9689)]
binary+=b''.join(struct.pack('<f',value) for value in times)
binary+=b''.join(struct.pack('<4f',*value) for value in left)
binary+=b''.join(struct.pack('<4f',*value) for value in right)
animations=[]
for name in ('flap','glide','brake'):
    animations.append({"name":name,"samplers":[{"input":3,"output":4,"interpolation":"LINEAR"},{"input":3,"output":5,"interpolation":"LINEAR"}],"channels":[{"sampler":0,"target":{"node":3,"path":"rotation"}},{"sampler":1,"target":{"node":4,"path":"rotation"}}]})
gltf={"asset":{"version":"2.0","generator":"Batsnake project-created pilot"},"scene":0,"scenes":[{"nodes":[0]}],"nodes":[{"name":"HeroBat","children":[1,2,3,4,5]},{"name":"Body","mesh":0},{"name":"Head","translation":[0,.08,.18]},{"name":"Wing_L","mesh":1},{"name":"Wing_R","mesh":2},{"name":"Mouth","translation":[0,0,.24]}],"materials":[{"name":"Pilot membrane","pbrMetallicRoughness":{"baseColorFactor":[.12,.07,.05,.76],"roughnessFactor":.82},"doubleSided":True,"alphaMode":"BLEND"}],"meshes":[{"name":"Body","primitives":[{"attributes":{"POSITION":2},"material":0}]},{"name":"Left wing","primitives":[{"attributes":{"POSITION":0},"material":0}]},{"name":"Right wing","primitives":[{"attributes":{"POSITION":1},"material":0}]}],"animations":animations,"buffers":[{"byteLength":len(binary)}],"bufferViews":[{"buffer":0,"byteOffset":0,"byteLength":36},{"buffer":0,"byteOffset":36,"byteLength":36},{"buffer":0,"byteOffset":72,"byteLength":36},{"buffer":0,"byteOffset":108,"byteLength":12},{"buffer":0,"byteOffset":120,"byteLength":48},{"buffer":0,"byteOffset":168,"byteLength":48}],"accessors":[{"bufferView":0,"componentType":5126,"count":3,"type":"VEC3","min":[-.45,-.18,0],"max":[0,.16,.08]},{"bufferView":1,"componentType":5126,"count":3,"type":"VEC3","min":[0,-.18,0],"max":[.45,.16,.08]},{"bufferView":2,"componentType":5126,"count":3,"type":"VEC3","min":[-.08,-.08,-.08],"max":[.08,.18,.12]},{"bufferView":3,"componentType":5126,"count":3,"type":"SCALAR","min":[0],"max":[1]},{"bufferView":4,"componentType":5126,"count":3,"type":"VEC4"},{"bufferView":5,"componentType":5126,"count":3,"type":"VEC4"}]}
payload=json.dumps(gltf,separators=(',',':')).encode();payload+=b' ' * ((4-len(payload)%4)%4);binary+=b'\0'*((4-len(binary)%4)%4)
target.parent.mkdir(parents=True,exist_ok=True)
target.write_bytes(struct.pack('<4sII',b'glTF',2,12+8+len(payload)+8+len(binary))+struct.pack('<I4s',len(payload),b'JSON')+payload+struct.pack('<I4s',len(binary),b'BIN\0')+binary)
print(target.relative_to(root),target.stat().st_size)
