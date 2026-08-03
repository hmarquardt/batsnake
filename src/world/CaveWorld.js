// @ts-check
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';
import { CaveMaterials } from './CaveMaterials.js';
import { CaveGenerator } from './CaveGenerator.js';
import { CaveLighting } from './CaveLighting.js';
import { SpatialQuerySystem } from './SpatialQuerySystem.js';

export class CaveWorld {
  /** @param {THREE.Scene} scene @param {{shadows:boolean}} profile */
  constructor(scene, profile) {
    this.scene=scene; this.materials=new CaveMaterials(); this.generator=new CaveGenerator(scene,this.materials); this.lighting=new CaveLighting(scene);
    const generated=this.generator.build(); this.path=generated.path; this.obstacles=generated.obstacles; this.echoLandmarks=generated.echoLandmarks; this.spatial=new SpatialQuerySystem(generated.spatialFeatures);
    this.materials.setEchoProfile(profile);
    this.lighting.build(profile.shadows); this.physics = new RAPIER.World({x:0,y:0,z:0}); this.buildColliders();
  }
  buildColliders() {
    const body=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    const walls=[{p:[-12,3,0],h:[1,11,55]},{p:[12,3,0],h:[1,11,55]},{p:[0,-9,0],h:[12,1,55]},{p:[0,16,0],h:[12,1,55]}];
    walls.forEach(({p,h})=>{const desc=RAPIER.ColliderDesc.cuboid(h[0],h[1],h[2]).setTranslation(p[0],p[1],p[2]);this.physics.createCollider(desc,body);});
    this.obstacles.forEach((obstacle)=>{const c=obstacle.center;this.physics.createCollider(RAPIER.ColliderDesc.ball(obstacle.radius).setTranslation(c.x,c.y,c.z),body);});
  }
  fixedUpdate() { this.physics.step(); }
  update(dt,director=null,airflow=0){this.generator.update(dt,director,airflow);}
  setMenuMode(active){this.generator.setMenuMode(active);}
  prepareRender(){this.generator.setEchoVisible(this.materials.echoUniforms.pulseIntensity.value>.001);}
  /** Soft gameplay collision compatible with the deliberately simplified Rapier volumes. @param {THREE.Vector3} position @param {number} radius */
  resolveSphere(position,radius) {
    return this.spatial.resolveSphere(position,radius);
  }
  setQuality(profile){this.lighting.setShadows(profile.shadows);this.materials.setEchoProfile(profile);this.generator.setQuality(profile);}
}
