// @ts-check
import * as THREE from 'three';
export class BatCamera {
  /** @param {THREE.PerspectiveCamera} camera @param {import('./BatFlightController.js').BatFlightController} controller @param {import('../../core/Settings.js').Settings} settings @param {import('../../core/EventBus.js').EventBus} events */
  constructor(camera,controller,settings,events){this.camera=camera;this.controller=controller;this.settings=settings;this.time=0;this.roll=0;this.collision=0;this.panic=0;this.direction=new THREE.Vector3();this.target=new THREE.Vector3();this.euler=new THREE.Euler(0,0,0,'YXZ');this.unsubscribe=[events.on('player-collision',()=>{this.collision=1;}),events.on('near-miss',()=>{this.panic=1;})];}
  update(dt){this.time+=dt;this.collision=Math.max(0,this.collision-dt*1.5);this.panic=Math.max(0,this.panic-dt*2);const c=this.controller,motion=this.settings.get('reducedCameraMotion') ? .22 : 1;this.camera.position.copy(c.position);const wingbeat=Math.sin(this.time*12)*.018*motion*Math.min(1,c.velocity.length()/8);this.camera.position.y+=wingbeat+Math.sin(this.time*23)*this.collision*.025*motion;this.euler.set(c.pitch,c.yaw,0);this.direction.set(0,0,1).applyEuler(this.euler);this.target.copy(this.camera.position).add(this.direction);this.camera.lookAt(this.target);const targetRoll=c.bank*.42*motion+Math.sin(this.time*17)*this.panic*.045*motion;this.roll+=(targetRoll-this.roll)*Math.min(1,dt*5.5);this.camera.rotateZ(this.roll);}
  dispose(){this.unsubscribe.forEach((unsubscribe)=>unsubscribe());}
}
