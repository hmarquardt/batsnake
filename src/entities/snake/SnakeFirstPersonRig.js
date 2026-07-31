// @ts-check
import * as THREE from 'three';

/** Camera-local facial context; the world rig remains the authoritative body. */
export class SnakeFirstPersonRig {
  /** @param {THREE.PerspectiveCamera} camera */
  constructor(camera){this.camera=camera;this.root=new THREE.Group();this.root.name='First-person boa facial adapter';this.root.position.set(0,-.27,-.55);camera.add(this.root);const scales=new THREE.MeshStandardMaterial({color:0x302820,roughness:.72});const pitMaterial=new THREE.MeshBasicMaterial({color:0x030202});for(const side of [-1,1]){const cheek=new THREE.Mesh(new THREE.SphereGeometry(.27,12,8),scales);cheek.scale.set(.86,.42,1.25);cheek.position.set(side*.26,-.18,0);this.root.add(cheek);for(let index=0;index<4;index++){const pit=new THREE.Mesh(new THREE.SphereGeometry(.018,6,4),pitMaterial);pit.position.set(side*(.13+index*.047),-.11,-.24+index*.018);this.root.add(pit);}}this.baseY=this.root.position.y;}
  /** @param {number} dt @param {import('./SnakeController.js').SnakeController} controller @param {boolean} reducedMotion */
  update(dt,controller,reducedMotion){const charge=controller.strike.state==='prepare'?controller.strike.charge:0;const lunge=controller.strike.state==='lunge'?1:0;const motion=reducedMotion ? .28 : 1;this.root.position.y=THREE.MathUtils.lerp(this.root.position.y,this.baseY-charge*.035+lunge*.025,Math.min(1,dt*12));this.root.rotation.z=THREE.MathUtils.lerp(this.root.rotation.z,-controller.yaw*.025*motion,Math.min(1,dt*8));this.root.scale.setScalar(1+charge*.035);}
  dispose(){this.camera.remove(this.root);this.root.traverse((object)=>{if(object.isMesh){object.geometry.dispose();object.material.dispose();}});}
}
