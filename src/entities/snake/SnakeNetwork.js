// @ts-check
import * as THREE from 'three';
import { SNAKE_ANCHORS } from '../../world/NavigationVolumes.js';
import { SnakeController } from './SnakeController.js';
import { SnakeRig } from './SnakeRig.js';
import { SnakeAI } from './SnakeAI.js';
export class SnakeNetwork {
  /** @param {THREE.Scene} scene @param {import('../../core/EventBus.js').EventBus} events */ constructor(scene,events){this.scene=scene;this.events=events;this.selected=0;this.playerControlled=false;this.controllers=SNAKE_ANCHORS.map((anchor)=>new SnakeController(anchor.position,events));this.rigs=SNAKE_ANCHORS.map((anchor,i)=>new SnakeRig(scene,anchor.position,i));this.ai=this.controllers.map(()=>new SnakeAI());this.unsubscribe=events.on('echolocation-pulse',({origin,range})=>{this.controllers.forEach((controller,i)=>{const distance=controller.anchor.distanceTo(origin);if(distance<range){controller.awareness=Math.max(controller.awareness,1-distance/range);this.rigs[i].alert(controller.awareness);}});});}
  /** @param {number} dt @param {import('../../core/InputManager.js').InputManager} input @param {import('../../core/Settings.js').Settings} settings @param {import('../bat/BatAgent.js').BatAgent[]} bats */
  update(dt,input,settings,bats){if(this.playerControlled){if(input.consume('KeyQ'))this.switch(-1);if(input.consume('KeyE'))this.switch(1);}for(let i=0;i<this.controllers.length;i++){const controller=this.controllers[i];if(this.playerControlled&&i===this.selected)controller.playerUpdate(dt,input,settings);else{let target=null,best=Infinity;for(const bat of bats){if(!bat.active)continue;const distance=bat.position.distanceTo(controller.anchor);if(distance<best){best=distance;target=bat;}}this.ai[i].update(dt,controller,target);}this.rigs[i].update(dt,controller.headPosition,controller.direction,controller.strike.state,controller.strike.charge);}}
  switch(delta){this.selected=(this.selected+delta+this.controllers.length)%this.controllers.length;this.events.emit('snake-switched',{index:this.selected,controller:this.controllers[this.selected]});}
  /** @returns {{from:THREE.Vector3,to:THREE.Vector3,controller:SnakeController,index:number}[]} */ activeStrikes(){return this.controllers.map((controller,index)=>({from:controller.strike.previous,to:controller.strike.position,controller,index})).filter(({controller})=>controller.strike.state==='lunge'&&!controller.strike.hit);}
  tacticalData(){return this.controllers.map((controller)=>({position:controller.headPosition,state:controller.strike.state}));}
  dispose(){this.unsubscribe();this.rigs.forEach((rig)=>rig.dispose());}
}
