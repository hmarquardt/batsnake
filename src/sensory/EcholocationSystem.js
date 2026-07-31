// @ts-check
import * as THREE from 'three';
import { EcholocationPulse } from './EcholocationPulse.js';
export class EcholocationSystem {
  /** @param {THREE.Scene} scene @param {import('../world/CaveWorld.js').CaveWorld} world @param {import('../core/EventBus.js').EventBus} events @param {import('../core/Settings.js').Settings} settings */
  constructor(scene,world,events,settings){this.scene=scene;this.world=world;this.events=events;this.settings=settings;/** @type {EcholocationPulse|null} */this.pulse=null;this.cooldown=0;this.maxCooldown=1.35;this.markerLife=new Float32Array(world.echoLandmarks.length);const geometry=new THREE.BufferGeometry().setFromPoints(world.echoLandmarks);this.markers=new THREE.Points(geometry,new THREE.PointsMaterial({color:0x9df2de,size:.11,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(this.markers);}
  /** @param {THREE.Vector3} origin */ emit(origin){if(this.cooldown>0||this.pulse)return false;this.pulse=new EcholocationPulse(this.scene,origin,34,1.75);this.cooldown=this.maxCooldown;this.world.materials.echoUniforms.pulseOrigin.value.copy(origin);this.world.materials.echoUniforms.pulseIntensity.value=this.intensity();this.events.emit('echolocation-pulse',{origin:origin.clone(),range:34});return true;}
  update(dt){this.cooldown=Math.max(0,this.cooldown-dt);if(this.pulse){const finished=this.pulse.update(dt,this.intensity());this.world.materials.echoUniforms.pulseRadius.value=this.pulse.radius;let visible=0;for(let i=0;i<this.world.echoLandmarks.length;i++){const distance=this.world.echoLandmarks[i].distanceTo(this.pulse.origin);if(Math.abs(distance-this.pulse.radius)<2.5)this.markerLife[i]=1;this.markerLife[i]=Math.max(0,this.markerLife[i]-dt*.8);visible=Math.max(visible,this.markerLife[i]);}this.markers.material.opacity=visible*.66*this.intensity();if(finished){this.pulse.dispose();this.pulse=null;this.world.materials.echoUniforms.pulseIntensity.value=0;}}else this.markers.material.opacity=Math.max(0,this.markers.material.opacity-dt*.8);}
  intensity(){return this.settings.get('sensoryIntensity')*(this.settings.get('reducedFlashing') ? .58 : 1);}
  readiness(){return 1-this.cooldown/this.maxCooldown;}
  dispose(){if(this.pulse)this.pulse.dispose();this.scene.remove(this.markers);this.world.materials.echoUniforms.pulseIntensity.value=0;}
}
