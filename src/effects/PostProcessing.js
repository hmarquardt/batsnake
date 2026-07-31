// @ts-check
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class PostProcessing {
  /** @param {THREE.WebGLRenderer} renderer @param {THREE.Scene} scene @param {THREE.Camera} camera @param {{bloom:boolean}} profile */
  constructor(renderer,scene,camera,profile){this.renderer=renderer;this.scene=scene;this.camera=camera;this.lastRenderMs=0;this.targetCount=2;this.renderer.info.autoReset=false;this.composer=new EffectComposer(renderer);this.composer.addPass(new RenderPass(scene,camera));this.bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.22,.48,.9);this.bloom.enabled=profile.bloom;this.composer.addPass(this.bloom);this.composer.addPass(new OutputPass());}
  resize(width,height){this.composer.setSize(width,height);}
  setQuality(profile){this.bloom.enabled=profile.bloom;}
  render(){const started=performance.now();this.renderer.info.reset();this.composer.render();this.lastRenderMs=performance.now()-started;}
}
