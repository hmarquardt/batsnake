// @ts-check
export class SnakePlayer { constructor(network){this.network=network;}get controller(){return this.network.controllers[this.network.selected];} }
