// @ts-check
import * as THREE from 'three';
import { caveSectionAt, ENTRANCE } from './NavigationVolumes.js';

/**
 * @typedef {Object} SpatialFeature
 * @property {string} id
 * @property {'column'|'shelf'|'stalactite'|'mouth'|'wall'|'floor'|'snake'|'drapery'|'rubble'|'roost'|'arch'|'cavity'} kind
 * @property {THREE.Vector3} center
 * @property {number} radius
 * @property {number} reflectivity
 * @property {boolean} [dynamic]
 * @property {any} [owner]
 */

/**
 * @typedef {Object} ReflectionHit
 * @property {string} id
 * @property {SpatialFeature['kind']} kind
 * @property {THREE.Vector3} position
 * @property {THREE.Vector3} normal
 * @property {number} distance
 * @property {number} strength
 * @property {any} [owner]
 */

const _segment = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _closest = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _candidate = new THREE.Vector3();

export class SpatialQuerySystem {
  /** @param {SpatialFeature[]} features */
  constructor(features = []) {
    /** @type {SpatialFeature[]} */ this.staticFeatures = features;
    /** @type {SpatialFeature[]} */ this.dynamicFeatures = [];
    /** @type {ReflectionHit[]} */ this.reflectionPool = Array.from({ length: 24 }, (_, index) => ({ id: `pooled-${index}`, kind: 'wall', position: new THREE.Vector3(), normal: new THREE.Vector3(), distance: 0, strength: 0 }));
  }

  /** @param {SpatialFeature[]} features */
  setDynamicFeatures(features) { this.dynamicFeatures = features; }

  /** @returns {SpatialFeature[]} */
  allFeatures() { return this.dynamicFeatures.length ? this.staticFeatures.concat(this.dynamicFeatures) : this.staticFeatures; }

  /** @param {THREE.Vector3} from @param {THREE.Vector3} to @param {any} [ignoredOwner] @param {string|null} [ignoredId] */
  hasLineOfSight(from, to, ignoredOwner = null, ignoredId = null) {
    _segment.subVectors(to, from);
    const lengthSquared = _segment.lengthSq();
    if (lengthSquared < .0001) return true;
    for (const feature of this.staticFeatures) {
      if (feature.kind === 'mouth' || feature.kind === 'cavity' || feature.kind === 'roost' || feature.id === ignoredId) continue;
      _offset.subVectors(feature.center, from);
      const t = THREE.MathUtils.clamp(_offset.dot(_segment) / lengthSquared, 0, 1);
      _closest.copy(from).addScaledVector(_segment, t);
      if (_closest.distanceToSquared(feature.center) < feature.radius * feature.radius && t > .03 && t < .97) return false;
    }
    for (const feature of this.dynamicFeatures) {
      if (feature.owner === ignoredOwner) continue;
      _offset.subVectors(feature.center, from);
      const t = THREE.MathUtils.clamp(_offset.dot(_segment) / lengthSquared, 0, 1);
      _closest.copy(from).addScaledVector(_segment, t);
      if (_closest.distanceToSquared(feature.center) < feature.radius * feature.radius && t > .03 && t < .97) return false;
    }
    return true;
  }

  /** @param {THREE.Vector3} point @param {THREE.Vector3} from @param {THREE.Vector3} to */
  pointSegmentDistance(point, from, to) {
    _segment.subVectors(to, from);
    const t = THREE.MathUtils.clamp(_offset.subVectors(point, from).dot(_segment) / Math.max(.0001, _segment.lengthSq()), 0, 1);
    _closest.copy(from).addScaledVector(_segment, t);
    return _closest.distanceTo(point);
  }

  /**
   * Select a bounded, stable set of meaningful cave and biological returns.
   * @param {THREE.Vector3} origin
   * @param {number} range
   * @param {number} limit
   * @returns {ReflectionHit[]}
   */
  reflections(origin, range, limit) {
    /** @type {ReflectionHit[]} */ const selected = [];
    let poolIndex = 0;
    const add = (id, kind, position, normal, reflectivity, owner) => {
      const distance = origin.distanceTo(position);
      if (distance > range || poolIndex >= this.reflectionPool.length || !this.hasLineOfSight(origin, position, owner, id)) return;
      const hit = this.reflectionPool[poolIndex++];
      hit.id = id; hit.kind = kind; hit.position.copy(position); hit.normal.copy(normal); hit.distance = distance;
      hit.strength = reflectivity * (1 - distance / (range * 1.25)); hit.owner = owner;
      selected.push(hit);
    };

    const section = caveSectionAt(origin);
    for (const side of [-1, 1]) {
      _candidate.set(section.centerX + side * (section.xRadius - .4), origin.y, origin.z + 2.5);
      _normal.set(-side, 0, 0);
      add(`wall-${side}`, 'wall', _candidate, _normal, .72, null);
    }
    _candidate.set(origin.x, section.centerY-section.yRadius+.35, origin.z + 1.5); _normal.set(0, 1, 0);
    add('floor-near', 'floor', _candidate, _normal, .58, null);

    for (const feature of this.allFeatures()) {
      _normal.subVectors(origin, feature.center).normalize();
      add(feature.id, feature.kind, feature.center, _normal, feature.reflectivity, feature.owner);
    }
    _normal.set(0, 0, -1);
    add('cave-mouth', 'mouth', ENTRANCE, _normal, .82, null);
    selected.sort((a, b) => b.strength - a.strength || a.distance - b.distance);
    return selected.slice(0, Math.min(limit, selected.length));
  }

  /** @param {THREE.Vector3} position @param {number} radius */
  resolveSphere(position, radius) {
    let collided = false;
    const section=caveSectionAt(position),rx=Math.max(1,section.xRadius-radius),ry=Math.max(1,section.yRadius-radius),x=position.x-section.centerX,y=position.y-section.centerY;
    const normalized=Math.hypot(x/rx,y/ry);
    if(normalized>1){position.x=section.centerX+x/normalized;position.y=section.centerY+y/normalized;collided=true;
    }
    for (const feature of this.staticFeatures) {
      if (feature.kind === 'mouth' || feature.kind === 'cavity' || feature.kind === 'roost') continue;
      _offset.subVectors(position, feature.center);
      const minimum = radius + feature.radius;
      if (_offset.lengthSq() < minimum * minimum) {
        if (_offset.lengthSq() < .0001) _offset.set(1, 0, 0);
        position.copy(feature.center).add(_offset.normalize().multiplyScalar(minimum)); collided = true;
      }
    }
    return collided;
  }

  /** @param {THREE.Vector3} position @param {THREE.Vector3} velocity @param {number} lookAhead */
  obstacleAhead(position, velocity, lookAhead = 1.2) {
    _candidate.copy(position).addScaledVector(velocity, lookAhead);
    let nearest = null; let distance = Infinity;
    for (const feature of this.staticFeatures) {
      if(feature.kind==='mouth'||feature.kind==='cavity'||feature.kind==='roost')continue;
      const d = _candidate.distanceTo(feature.center) - feature.radius;
      if (d < distance) { distance = d; nearest = feature; }
    }
    return distance < 2.2 ? nearest : null;
  }
}
