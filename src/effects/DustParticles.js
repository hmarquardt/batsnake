// @ts-check
import * as THREE from 'three';
export class DustParticles {
  /** @param {THREE.Scene} scene @param {number} count */ constructor(scene,count){this.count=count;const geometry=new THREE.BufferGeometry();const data=new Float32Array(count*3);for(let i=0;i<count;i++){data[i*3]=(Math.random()-.5)*22;data[i*3+1]=-7+Math.random()*21;data[i*3+2]=-50+Math.random()*101;}geometry.setAttribute('position',new THREE.BufferAttribute(data,3));const material=new THREE.PointsMaterial({color:0xaab9ae,size:.035,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending});this.points=new THREE.Points(geometry,material);scene.add(this.points);}
  update(dt){this.points.rotation.y+=dt*.004;this.points.position.y=Math.sin(performance.now()*.00008)*.2;}
  setCount(count){this.points.geometry.setDrawRange(0,Math.min(count,this.count));}
}
