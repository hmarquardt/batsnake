// @ts-check
import * as THREE from 'three';

/** Camera-local facial context; the world rig remains the authoritative body. Restrained jawline + pit rows below the hunting line. */
export class SnakeFirstPersonRig {
  /** @param {THREE.PerspectiveCamera} camera */
  constructor(camera){this.camera=camera;this.root=new THREE.Group();this.root.name='First-person boa facial adapter';this.root.position.set(0,-.42,-.62);camera.add(this.root);const scales=new THREE.MeshStandardMaterial({color:0x1d1712,roughness:.88});const pitMaterial=new THREE.MeshBasicMaterial({color:0x050302});for(const side of [-1,1]){const cheek=new THREE.Mesh(new THREE.SphereGeometry(.3,14,10),scales);cheek.scale.set(.95,.32,1.35);cheek.position.set(side*.34,-.06,.1);cheek.rotation.y=side*.3;this.root.add(cheek);const labial=new THREE.Mesh(new THREE.SphereGeometry(.18,10,7),scales);labial.scale.set(.8,.3,1.2);labial.position.set(side*.2,-.02,-.18);this.root.add(labial);for(let index=0;index<5;index++){const pit=new THREE.Mesh(new THREE.SphereGeometry(.016,6,4),pitMaterial);pit.position.set(side*(.11+index*.04),-.005,-.3+index*.03);this.root.add(pit);}}
    // Tongue hint: appears only in idle flicks at the bottom edge.
    this.tongue=new THREE.Group();const tongueMaterial=new THREE.MeshBasicMaterial({color:0x2e0f0d});for(const side of [-1,1]){const fork=new THREE.Mesh(new THREE.CylinderGeometry(.005,.008,.22,4),tongueMaterial);fork.rotation.x=Math.PI/2;fork.rotation.z=side*.15;fork.position.set(side*.025,0,-.08);this.tongue.add(fork);}this.tongue.position.set(0,.02,-.38);this.root.add(this.tongue);this.time=0;this.baseY=this.root.position.y;}
  /** @param {number} dt @param {import('./SnakeController.js').SnakeController} controller @param {boolean} reducedMotion */
  update(dt,controller,reducedMotion){this.time+=dt;const charge=controller.strike.state==='prepare'?controller.strike.charge:0;const lunge=controller.strike.state==='lunge'?1:0;const motion=reducedMotion ? .28 : 1;
    // Muscular commitment: the jawline sinks and widens with charge, lifts at the lunge.
    this.root.position.y=THREE.MathUtils.lerp(this.root.position.y,this.baseY-charge*.05+lunge*.03,Math.min(1,dt*12));this.root.rotation.z=THREE.MathUtils.lerp(this.root.rotation.z,-controller.yaw*.03*motion,Math.min(1,dt*8));const spread=1+charge*.08;this.root.scale.set(spread,1+charge*.02,spread);
    const flick=controller.strike.state==='idle'&&Math.sin(this.time*1.7)>.93;this.tongue.visible=flick;if(flick)this.tongue.scale.z=.5+.5*Math.sin(this.time*22);}
  dispose(){this.camera.remove(this.root);this.root.traverse((object)=>{if(object.isMesh){object.geometry.dispose();object.material.dispose();}});}
}
