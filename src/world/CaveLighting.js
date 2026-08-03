// @ts-check
import * as THREE from 'three';

export class CaveLighting {
  /** @param {THREE.Scene} scene */ constructor(scene) { this.scene = scene; this.moon = null; this.ambient=null; this.bounce=null; this.postFill=[]; }
  build(shadows = true) {
    // Cool ambient floor: keeps near/mid/far silhouettes separated without filling the tunnel.
    const ambient = new THREE.HemisphereLight(0x6f8a84,0x0a0d0b,.62); this.scene.add(ambient); this.ambient=ambient;
    const moon = new THREE.DirectionalLight(0xb7d9d8,2.7); moon.position.set(-3,16,50); moon.target.position.set(0,1,-15); moon.castShadow=shadows; moon.shadow.mapSize.set(1024,1024); moon.shadow.camera.left=-18;moon.shadow.camera.right=18;moon.shadow.camera.top=22;moon.shadow.camera.bottom=-12;moon.shadow.camera.near=1;moon.shadow.camera.far=100;this.scene.add(moon,moon.target);this.moon=moon;
    // Humid entrance bounce: restrained, close-ranged, and never a stage spotlight.
    const bounce = new THREE.PointLight(0x517d76,14,19,2); bounce.position.set(0,2.5,43); this.scene.add(bounce); this.bounce=bounce;
    // Neutral mineral bounce identifies the three authored ambush shelves without outlining animals.
    for(const [position,color,intensity,range] of [[[-2,11,-43],0x625b4f,22,13],[[-5,11,-25],0x657a73,24,12],[[-5,6,-14],0x6a7972,20,12],[[7,7,5],0x60766e,24,14],[[-4,9,28],0x637f77,18,12]]){const fill=new THREE.PointLight(color,intensity,range,2);fill.position.set(...position);fill.userData.normalIntensity=intensity;this.scene.add(fill);this.postFill.push(fill);}
  }
  setShadows(enabled) { if (this.moon) this.moon.castShadow = enabled; }
  setThermalBlend(blend){if(this.moon)this.moon.intensity=THREE.MathUtils.lerp(2.7,.2,blend);if(this.bounce)this.bounce.intensity=THREE.MathUtils.lerp(14,.28,blend);if(this.ambient)this.ambient.intensity=THREE.MathUtils.lerp(.62,.06,blend);for(const fill of this.postFill)fill.intensity=THREE.MathUtils.lerp(fill.userData.normalIntensity,.04,blend);}
}
