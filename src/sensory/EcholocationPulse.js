// @ts-check
import * as THREE from 'three';
export class EcholocationPulse {
  /** @param {THREE.Scene} scene @param {THREE.Vector3} origin @param {number} range @param {number} duration */
  constructor(scene,origin,range,duration){this.scene=scene;this.origin=origin.clone();this.range=range;this.duration=duration;this.age=0;this.radius=0;const geometry=new THREE.SphereGeometry(1,22,14);const material=new THREE.MeshBasicMaterial({color:0x75e2d1,wireframe:true,transparent:true,opacity:.32,depthWrite:false,blending:THREE.AdditiveBlending});this.mesh=new THREE.Mesh(geometry,material);this.mesh.position.copy(origin);scene.add(this.mesh);}
  update(dt,intensity){this.age+=dt;const t=Math.min(1,this.age/this.duration);this.radius=this.range*(1-Math.pow(1-t,1.45));this.mesh.scale.setScalar(this.radius);this.mesh.material.opacity=(1-t)*.16*intensity;return t>=1;}
  dispose(){this.scene.remove(this.mesh);this.mesh.geometry.dispose();this.mesh.material.dispose();}
}
