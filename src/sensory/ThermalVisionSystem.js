// @ts-check
import * as THREE from 'three';
export class ThermalVisionSystem {
  /** @param {THREE.Scene} scene @param {import('../effects/CaveFog.js').CaveFog} fog @param {import('../core/EventBus.js').EventBus} events */
  constructor(scene,fog,events){this.scene=scene;this.fog=fog;this.events=events;this.active=false;this.wakes=[];this.coolMaterial=new THREE.MeshStandardMaterial({color:0x070807,roughness:1});}
  toggle(){this.setActive(!this.active);}
  setActive(active){this.active=active;this.fog.setThermal(active);document.body.classList.toggle('thermal',active);this.scene.traverse((object)=>{if(object.userData.heat)object.visible=active;});this.events.emit('thermal-changed',{active});}
  /** @param {THREE.Vector3} position */ addWake(position){if(!this.active)return;const wake=new THREE.Sprite(new THREE.SpriteMaterial({color:0xd76a32,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}));wake.position.copy(position);wake.scale.set(.65,.65,1);this.scene.add(wake);this.wakes.push({object:wake,life:.55});}
  update(dt){for(let i=this.wakes.length-1;i>=0;i--){const wake=this.wakes[i];wake.life-=dt;wake.object.material.opacity=Math.max(0,wake.life*.3);wake.object.scale.multiplyScalar(1+dt*.5);if(wake.life<=0){this.scene.remove(wake.object);wake.object.material.dispose();this.wakes.splice(i,1);}}}
  dispose(){this.setActive(false);for(const wake of this.wakes){this.scene.remove(wake.object);wake.object.material.dispose();}this.wakes=[];}
}
