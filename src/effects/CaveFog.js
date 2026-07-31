// @ts-check
import * as THREE from 'three';
export class CaveFog { /** @param {THREE.Scene} scene */ constructor(scene){this.scene=scene;scene.fog=new THREE.FogExp2(0x050a08,.026);scene.background=new THREE.Color(0x020504);} setThermal(active){if(this.scene.fog){this.scene.fog.color.set(active?0x020202:0x050a08);this.scene.fog.density=active?.032:.026;}this.scene.background.set(active?0x010101:0x020504);} }
