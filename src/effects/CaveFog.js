// @ts-check
import * as THREE from 'three';

export class CaveFog {
  /** @param {THREE.Scene} scene */
  constructor(scene){this.scene=scene;this.normalColor=new THREE.Color(0x050a08);this.thermalColor=new THREE.Color(0x080302);this.backgroundNormal=new THREE.Color(0x020504);this.backgroundThermal=new THREE.Color(0x010101);this.thermalBlend=0;scene.fog=new THREE.FogExp2(this.normalColor,.026);scene.background=this.backgroundNormal.clone();}
  setThermal(active){this.setThermalBlend(active?1:0);}
  setThermalBlend(blend){this.thermalBlend=blend;if(this.scene.fog)this.scene.fog.color.copy(this.normalColor).lerp(this.thermalColor,blend);this.scene.background.copy(this.backgroundNormal).lerp(this.backgroundThermal,blend);}
  update(dt,camera){if(!this.scene.fog)return;const z=camera.position.z,roost=Math.exp(-Math.pow((z+43)/13,2)),bell=Math.exp(-Math.pow((z-4)/18,2)),mouth=Math.max(0,Math.min(1,(z-28)/22)),target=.024+roost*.006-bell*.004+mouth*.005+this.thermalBlend*.012;this.scene.fog.density+=(target-this.scene.fog.density)*Math.min(1,dt*1.4);}
}
