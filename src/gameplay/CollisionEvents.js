// @ts-check
import * as THREE from 'three';
/** @param {THREE.Vector3} point @param {THREE.Vector3} from @param {THREE.Vector3} to */
export function pointSegmentDistance(point,from,to){const segment=to.clone().sub(from);const t=THREE.MathUtils.clamp(point.clone().sub(from).dot(segment)/Math.max(.0001,segment.lengthSq()),0,1);return point.distanceTo(from.clone().addScaledVector(segment,t));}
