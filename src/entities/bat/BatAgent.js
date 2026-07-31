// @ts-check
import * as THREE from 'three';
import { chooseBatRole } from './BatBehaviorProfile.js';
export class BatAgent {
  constructor(index,random,routes,director){this.index=index;this.random=random;this.role=chooseBatRole(random);this.routeId=routes.choose(random,director,this.role).id;this.position=new THREE.Vector3(random.range(-6,6),random.range(0,10),-54-random.range(0,18));this.velocity=new THREE.Vector3(random.range(-.3,.3),random.range(-.15,.15),random.range(7,10)*this.role.speed);this.phase=random.range(0,Math.PI*2);this.flowBias=random.next();this.active=true;this.panic=0;this.captured=false;this.routeSwitchCooldown=0;this.departureDelay=random.range(0,8);this.recentDanger=0;}
  recycle(routes,director){this.position.set(this.random.range(-5,5),this.random.range(1,8),-54-this.random.range(0,18));this.routeId=routes.choose(this.random,director,this.role).id;this.flowBias=this.random.next();this.active=true;this.captured=false;this.panic=0;this.departureDelay=this.random.range(0,Math.max(.2,2.6/Math.max(.1,director.density)));}
}
