// @ts-check
import * as THREE from 'three';

export const BAT_START = new THREE.Vector3(1, 3, -45);
export const ENTRANCE = new THREE.Vector3(0, 7, 50);
export const SNAKE_ANCHORS = Object.freeze([
  { position: new THREE.Vector3(-4.8,11.8,-25), label:'The Narrows', range:11 },
  { position: new THREE.Vector3(5.4,12.5,1), label:'The Column', range:12 },
  { position: new THREE.Vector3(-4.2,13,25), label:'Moon Run', range:13 },
]);

/** @param {THREE.Vector3} point */
export function caveRadiusAt(point) { return 11.8 - Math.max(0,Math.abs(point.z+5)-38)*.045; }
