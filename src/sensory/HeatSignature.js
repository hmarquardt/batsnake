// @ts-check
import * as THREE from 'three';
export const warmMaterial=new THREE.MeshBasicMaterial({color:0xffb15b,transparent:true,opacity:.94,depthWrite:true,blending:THREE.AdditiveBlending});
export const membraneMaterial=new THREE.MeshBasicMaterial({color:0x9a3e27,transparent:true,opacity:.52,side:THREE.DoubleSide,depthWrite:true});
/** @param {THREE.Object3D} object @param {'core'|'membrane'|'torso'|'head'|'wingRoot'|'snakeHead'|'snakeBody'} [kind] @param {number} [temperature] */
export function markHeat(object,kind='core',temperature=.8){object.userData.heat=true;object.userData.heatKind=kind;object.userData.temperature=temperature;object.userData.baseOpacity=object.material?.opacity??1;object.visible=false;}
