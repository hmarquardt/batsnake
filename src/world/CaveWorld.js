// @ts-check
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';
import { CaveMaterials } from './CaveMaterials.js';
import { CaveGenerator } from './CaveGenerator.js';
import { CaveLighting } from './CaveLighting.js';
import { caveRadiusAt } from './NavigationVolumes.js';

export class CaveWorld {
  /** @param {THREE.Scene} scene @param {{shadows:boolean}} profile */
  constructor(scene, profile) {
    this.scene=scene; this.materials=new CaveMaterials(); this.generator=new CaveGenerator(scene,this.materials); this.lighting=new CaveLighting(scene);
    const generated=this.generator.build(); this.path=generated.path; this.obstacles=generated.obstacles; this.echoLandmarks=generated.echoLandmarks;
    this.lighting.build(profile.shadows); this.physics = new RAPIER.World({x:0,y:0,z:0}); this.buildColliders();
  }
  buildColliders() {
    const body=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    const walls=[{p:[-12,3,0],h:[1,11,55]},{p:[12,3,0],h:[1,11,55]},{p:[0,-9,0],h:[12,1,55]},{p:[0,16,0],h:[12,1,55]}];
    walls.forEach(({p,h})=>{const desc=RAPIER.ColliderDesc.cuboid(h[0],h[1],h[2]).setTranslation(p[0],p[1],p[2]);this.physics.createCollider(desc,body);});
    this.obstacles.forEach((obstacle)=>{const c=obstacle.center;this.physics.createCollider(RAPIER.ColliderDesc.ball(obstacle.radius).setTranslation(c.x,c.y,c.z),body);});
  }
  fixedUpdate() { this.physics.step(); }
  /** Soft gameplay collision compatible with the deliberately simplified Rapier volumes. @param {THREE.Vector3} position @param {number} radius */
  resolveSphere(position,radius) {
    let collided=false; const tunnel=caveRadiusAt(position); const radial=new THREE.Vector2(position.x,position.y-3.5); const length=radial.length();
    if(length>tunnel-radius){radial.multiplyScalar((tunnel-radius)/Math.max(length,.001));position.x=radial.x;position.y=radial.y+3.5;collided=true;}
    for(const obstacle of this.obstacles){const delta=position.clone().sub(obstacle.center);const min=radius+obstacle.radius;if(delta.lengthSq()<min*min){delta.normalize().multiplyScalar(min);position.copy(obstacle.center).add(delta);collided=true;}}
    return collided;
  }
  setQuality(profile){this.lighting.setShadows(profile.shadows);}
}
