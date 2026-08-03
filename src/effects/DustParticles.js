// @ts-check
import * as THREE from 'three';
export class DustParticles {
  /** @param {THREE.Scene} scene @param {number} count */
  constructor(scene,count){this.count=count;this.elapsed=0;this.airflow=0;const geometry=new THREE.BufferGeometry(),data=new Float32Array(count*3);for(let i=0;i<count;i++){const r=(i*73%997)/997,s=(i*193%991)/991,t=(i*389%983)/983;data[i*3]=(r-.5)*22;data[i*3+1]=-7+s*21;data[i*3+2]=-50+t*101;}geometry.setAttribute('position',new THREE.BufferAttribute(data,3));const material=new THREE.PointsMaterial({color:0xaab9ae,size:.035,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending});this.points=new THREE.Points(geometry,material);this.points.name='Airflow-readable cave motes';scene.add(this.points);}
  update(dt,airflow=0){this.elapsed+=dt;this.airflow+=(airflow-this.airflow)*Math.min(1,dt*2);this.points.rotation.y+=dt*(.003+this.airflow*.006);this.points.position.set(Math.sin(this.elapsed*.09)*(.1+this.airflow*.45),Math.sin(this.elapsed*.08)*.2,Math.sin(this.elapsed*.12)*this.airflow*.75);}
  setCount(count){this.points.geometry.setDrawRange(0,Math.min(count,this.count));}
}
