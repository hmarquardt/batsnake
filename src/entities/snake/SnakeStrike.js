// @ts-check
import * as THREE from 'three';
export class SnakeStrike {
  constructor(){this.state='idle';this.time=0;this.charge=0;this.cooldown=0;this.start=new THREE.Vector3();this.end=new THREE.Vector3();this.position=new THREE.Vector3();this.previous=new THREE.Vector3();this.hit=false;this.justResolved=false;this.releaseCharge=0;}
  prepare(dt){if(this.state==='idle'||this.state==='prepare'){this.state='prepare';this.charge=Math.min(1,this.charge+dt*.9);}}
  cancel(){if(this.state==='prepare'){this.state='idle';this.charge=0;}}
  /** @param {THREE.Vector3} start @param {THREE.Vector3} direction */ release(start,direction){if(this.state!=='prepare'||this.charge<.14)return false;this.state='lunge';this.time=0;this.hit=false;this.justResolved=false;this.releaseCharge=this.charge;this.start.copy(start);this.position.copy(start);this.previous.copy(start);this.end.copy(start).addScaledVector(direction,7.2+this.charge*3.8);return true;}
  update(dt){this.previous.copy(this.position);if(this.state==='lunge'){this.time+=dt;const t=Math.min(1,this.time/.18);const eased=t<.3 ? .34*Math.pow(t/.3,2) : .34+(t-.3)/.7*.66;this.position.lerpVectors(this.start,this.end,eased);if(t>=1){this.state='recover';this.time=0;this.cooldown=1.25+this.charge*.65;this.justResolved=true;}}else if(this.state==='capture'){this.time+=dt;if(this.time>.7){this.state='recover';this.time=0;this.cooldown=.9;}}else if(this.state==='recover'){this.time+=dt;const t=Math.min(1,this.time/this.cooldown);const recoil=t*t*(3-2*t);this.position.lerpVectors(this.end,this.start,recoil);if(t>=1){this.state='idle';this.time=0;this.charge=0;this.position.copy(this.start);}}return this.state;}
  capture(){this.state='capture';this.time=0;this.hit=true;this.end.copy(this.position);}
  readiness(){if(this.state==='idle'||this.state==='prepare')return 1;return Math.min(1,this.time/Math.max(.01,this.cooldown));}
}
