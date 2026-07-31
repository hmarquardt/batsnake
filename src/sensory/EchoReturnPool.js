// @ts-check
import * as THREE from 'three';

const OFFSETS = [
  [-.16,.04,.08],[.12,.1,-.06],[-.05,-.13,.12],[.08,-.04,-.14],
];

export class EchoReturnPool {
  /** @param {THREE.Scene} scene @param {number} capacity */
  constructor(scene, capacity = 18) {
    this.scene = scene; this.capacity = capacity; this.pointsPerReturn = 4;
    this.positionData = new Float32Array(capacity * this.pointsPerReturn * 3);
    this.colorData = new Float32Array(capacity * this.pointsPerReturn * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(this.positionData,3));
    geometry.setAttribute('color',new THREE.BufferAttribute(this.colorData,3));
    const material = new THREE.PointsMaterial({size:.13,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,sizeAttenuation:true});
    this.points = new THREE.Points(geometry,material); this.points.renderOrder=4; scene.add(this.points);
    this.slots = Array.from({length:capacity},()=>({active:false,position:new THREE.Vector3(),age:0,delay:0,life:1,strength:0,organic:false}));
    this.cursor=0;
  }

  /** @param {import('../world/SpatialQuerySystem.js').ReflectionHit[]} hits @param {number} intensity @param {boolean} reducedFlashing */
  schedule(hits,intensity,reducedFlashing){for(const hit of hits){const slot=this.slots[this.cursor++%this.capacity];slot.active=true;slot.position.copy(hit.position);slot.age=-hit.distance/21.5-.055;slot.delay=-slot.age;slot.life=hit.kind==='snake'?1.5:.8+hit.strength*.65;slot.strength=hit.strength*intensity*(reducedFlashing ? .58 : 1);slot.organic=hit.kind==='snake';}}

  update(dt){let changed=false;for(let index=0;index<this.slots.length;index++){const slot=this.slots[index];const base=index*this.pointsPerReturn*3;if(!slot.active){for(let p=0;p<this.pointsPerReturn*3;p++)this.positionData[base+p]=this.colorData[base+p]=0;continue;}slot.age+=dt;if(slot.age>slot.life){slot.active=false;continue;}const visible=slot.age>=0;if(!visible){for(let p=0;p<this.pointsPerReturn*3;p++)this.colorData[base+p]=0;continue;}const life=1-slot.age/slot.life;const pulse=.55+.45*Math.sin(slot.age*(slot.organic ? 16 : 28));for(let p=0;p<this.pointsPerReturn;p++){const offset=OFFSETS[p],spread=(1-life)*(slot.organic ? .48 : .3)+.15;const at=base+p*3;this.positionData[at]=slot.position.x+offset[0]*spread;this.positionData[at+1]=slot.position.y+offset[1]*spread;this.positionData[at+2]=slot.position.z+offset[2]*spread;const level=life*pulse*slot.strength*(1-p*.09);this.colorData[at]=level*(slot.organic ? .95 : .48);this.colorData[at+1]=level*(slot.organic ? .58 : 1);this.colorData[at+2]=level*(slot.organic ? .32 : .88);}changed=true;}if(changed){this.points.geometry.attributes.position.needsUpdate=true;this.points.geometry.attributes.color.needsUpdate=true;}}
  dispose(){this.scene.remove(this.points);this.points.geometry.dispose();this.points.material.dispose();}
}
