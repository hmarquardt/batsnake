// @ts-check
import * as THREE from 'three';
import { ENTRANCE } from './NavigationVolumes.js';
export class AirflowSystem {
  constructor(events){this.events=events;this.direction=new THREE.Vector3(0,.06,1).normalize();this.strength=0;this.temp=new THREE.Vector3();}
  update(dt,position,director){const approach=1-THREE.MathUtils.clamp(position.distanceTo(ENTRANCE)/100,0,1);this.strength=THREE.MathUtils.lerp(this.strength,.18+approach*.82+director.density*.12,Math.min(1,dt*2));this.events.emit('airflow-changed',{strength:this.strength,direction:this.direction,phase:director.phase});}
  cue(position){return this.temp.copy(this.direction).multiplyScalar(this.strength*(.45+Math.max(0,(position.z+45)/100)));}
}
