// @ts-check
import * as THREE from 'three';
export class BatAgent { /** @param {number} index */ constructor(index){this.index=index;this.position=new THREE.Vector3((Math.random()-.5)*11,-1+Math.random()*11,-52+Math.random()*96);this.velocity=new THREE.Vector3((Math.random()-.5)*.6,(Math.random()-.5)*.25,7+Math.random()*3.5);this.phase=Math.random()*Math.PI*2;this.active=true;this.panic=0;this.captured=false;} }
