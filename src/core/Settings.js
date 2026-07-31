// @ts-check

/**
 * @typedef {Object} GameSettings
 * @property {'low'|'medium'|'high'} quality
 * @property {number} resolutionScale
 * @property {number} mouseSensitivity
 * @property {number} masterVolume
 * @property {number} effectsVolume
 * @property {number} ambienceVolume
 * @property {boolean} reducedCameraMotion
 * @property {boolean} reducedFlashing
 * @property {number} sensoryIntensity
 * @property {boolean} showPerformanceOverlay
 */

/** @type {GameSettings} */
const DEFAULTS = { quality: 'medium', resolutionScale: 1, mouseSensitivity: 0.75, masterVolume: 0.8, effectsVolume: 0.85, ambienceVolume: 0.65, reducedCameraMotion: false, reducedFlashing: false, sensoryIntensity: 0.85, showPerformanceOverlay: false };

export class Settings {
  constructor() {
    let stored = {};
    try { stored = JSON.parse(localStorage.getItem('batsnake.settings.v1') || '{}'); } catch { /* use defaults */ }
    /** @type {GameSettings} */
    this.values = { ...DEFAULTS, ...stored };
  }
  /** @template {keyof GameSettings} K @param {K} key @returns {GameSettings[K]} */
  get(key) { return this.values[key]; }
  /** @template {keyof GameSettings} K @param {K} key @param {GameSettings[K]} value */
  set(key, value) { this.values[key] = value; this.save(); }
  save() { try { localStorage.setItem('batsnake.settings.v1', JSON.stringify(this.values)); } catch { /* privacy mode */ } }
  /** @returns {{pixelRatio:number, particles:number, bats:number, shadows:boolean, bloom:boolean,echoHistories:number,echoMemory:number,echoReturns:number,echoSurfaceDetail:number,thermalTrails:number,thermalTrailLife:number}} */
  profile() {
    const profiles = {
      low: { pixelRatio: 0.7, particles: 90, bats: 22, shadows: false, bloom: false, echoHistories:1, echoMemory:.8, echoReturns:4, echoSurfaceDetail:.18, thermalTrails:12, thermalTrailLife:.26 },
      medium: { pixelRatio: 1, particles: 180, bats: 34, shadows: true, bloom: true, echoHistories:2, echoMemory:1.55, echoReturns:10, echoSurfaceDetail:.68, thermalTrails:48, thermalTrailLife:.42 },
      high: { pixelRatio: 1.25, particles: 300, bats: 48, shadows: true, bloom: true, echoHistories:3, echoMemory:2.35, echoReturns:18, echoSurfaceDetail:1, thermalTrails:112, thermalTrailLife:.62 },
    };
    return profiles[this.values.quality];
  }
}
