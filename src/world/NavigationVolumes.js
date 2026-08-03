// @ts-check
import * as THREE from 'three';

// A centered pocket at the chamber's rear provides a clear first sightline before the shelf and Narrows.
export const BAT_START = new THREE.Vector3(-1.2, 3.4, -49.5);
export const ENTRANCE = new THREE.Vector3(0, 7, 50);
export const CAVE_LANDMARKS = Object.freeze({
  roostVault:new THREE.Vector3(-2,8.5,-44),
  guanoShelf:new THREE.Vector3(5,8,-32),
  fangCeiling:new THREE.Vector3(-4,10,-25),
  splitColumn:new THREE.Vector3(-5.4,3,-15),
  bellChamber:new THREE.Vector3(1,5,4),
  curtainWall:new THREE.Vector3(9,6,5),
  brokenPillar:new THREE.Vector3(1,-3,18),
  moonGallery:new THREE.Vector3(-2,7,31),
  moonGate:new THREE.Vector3(0,7,49),
});
export const SNAKE_ANCHORS = Object.freeze([
  { position: new THREE.Vector3(-4.8,11.8,-25), label:'The Narrows', range:11 },
  { position: new THREE.Vector3(5.4,12.5,1), label:'The Column', range:12 },
  { position: new THREE.Vector3(-4.2,13,25), label:'Moon Run', range:13 },
]);

/** Authored elliptical section used by shell composition and player collision. @param {{z:number}} point */
export function caveSectionAt(point) {
  const z=point.z;
  const bell=Math.exp(-Math.pow((z-3)/17,2)),roost=Math.exp(-Math.pow((z+44)/12,2)),narrows=Math.exp(-Math.pow((z+25)/7.5,2)),mouth=Math.max(0,(z-38)/15);
  return {centerX:Math.sin((z+44)*.045)*1.1,centerY:3.8+Math.sin((z+18)*.025)*1.2,xRadius:12.7+bell*3.7+roost*1.2-narrows*1.7-mouth*2.2,yRadius:10.7+bell*2.6+roost*1.1-narrows*1.6-mouth*1.5};
}

/** Conservative radius retained for echo wall sampling. @param {THREE.Vector3} point */
export function caveRadiusAt(point) { const section=caveSectionAt(point);return Math.min(section.xRadius,section.yRadius); }
