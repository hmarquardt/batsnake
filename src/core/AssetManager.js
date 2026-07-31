// @ts-check
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export class AssetManager {
  /** @param {import('./EventBus.js').EventBus} events */
  constructor(events) { this.events = events; this.cache = new Map(); this.gltf = new GLTFLoader(); this.rgbe = new RGBELoader(); this.textures = new THREE.TextureLoader(); }
  /** @param {string} url @param {boolean} [required] */
  async glb(url, required = false) { return this.load(url, () => this.gltf.loadAsync(url), required); }
  /** @param {string} url @param {boolean} [required] */
  async texture(url, required = false) { return this.load(url, () => this.textures.loadAsync(url), required); }
  /** @param {string} url @param {boolean} [required] */
  async hdr(url, required = false) { return this.load(url, () => this.rgbe.loadAsync(url), required); }
  /** @param {string} url @param {()=>Promise<any>} loader @param {boolean} required */
  async load(url, loader, required) {
    if (this.cache.has(url)) return this.cache.get(url);
    try { const asset = await loader(); this.cache.set(url, asset); return asset; }
    catch (error) { this.events.emit('asset-error', { url, required, error }); if (required) throw new Error(`Required asset missing: ${url}`); return null; }
  }
}
