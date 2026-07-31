// @ts-check
import { ENTRANCE } from '../world/NavigationVolumes.js';
export class BatObjective { /** @param {import('three').Vector3} position */distance(position){return position.distanceTo(ENTRANCE);}escaped(position){return position.z>48&&this.distance(position)<9;} }
export class SnakeObjective { constructor(target=4,duration=68){this.target=target;this.remaining=duration;}update(dt){this.remaining=Math.max(0,this.remaining-dt);}complete(captures){return captures>=this.target;}expired(){return this.remaining<=0;} }
