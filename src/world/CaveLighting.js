// @ts-check
import * as THREE from 'three';

export class CaveLighting {
  /** @param {THREE.Scene} scene */ constructor(scene) { this.scene = scene; this.moon = null; }
  build(shadows = true) {
    const ambient = new THREE.HemisphereLight(0x78918c,0x090b09,.19); this.scene.add(ambient);
    const moon = new THREE.DirectionalLight(0xb7d9d8,3.2); moon.position.set(-3,16,50); moon.target.position.set(0,1,-15); moon.castShadow=shadows; moon.shadow.mapSize.set(1024,1024); moon.shadow.camera.left=-18;moon.shadow.camera.right=18;moon.shadow.camera.top=22;moon.shadow.camera.bottom=-12;moon.shadow.camera.near=1;moon.shadow.camera.far=100;this.scene.add(moon,moon.target);this.moon=moon;
    const bounce = new THREE.PointLight(0x5f918a,5.5,28,2); bounce.position.set(0,3,41); this.scene.add(bounce);
  }
  setShadows(enabled) { if (this.moon) this.moon.castShadow = enabled; }
}
