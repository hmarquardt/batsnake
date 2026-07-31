// @ts-check

/**
 * @typedef {Object} BatVisualState
 * @property {number} speed
 * @property {number} bank
 * @property {number} pitch
 * @property {number} energy
 * @property {boolean} flap
 * @property {boolean} brake
 * @property {boolean} dive
 * @property {boolean} stalled
 * @property {number} panic
 * @property {number} collision
 */

/**
 * @typedef {Object} SnakeVisualState
 * @property {'idle'|'prepare'|'lunge'|'capture'|'recover'} state
 * @property {number} charge
 * @property {number} awareness
 * @property {import('three').Vector3} headPosition
 * @property {import('three').Vector3} direction
 */

/**
 * @typedef {Object} HeatEmitter
 * @property {import('three').Object3D} object
 * @property {'torso'|'head'|'wingRoot'|'membrane'|'muscle'|'snakeHead'|'snakeBody'} region
 * @property {number} temperature
 * @property {number} activity
 * @property {any} owner
 */

export const CREATURE_VISUAL_CONTRACT_VERSION = 1;
