// @ts-check
import { BatFlightController } from './BatFlightController.js';
import { BatCamera } from './BatCamera.js';
export class BatPlayer { constructor(camera,input,settings,world,events){this.controller=new BatFlightController(input,settings,world,events);this.view=new BatCamera(camera,this.controller,settings);}reset(position){this.controller.reset(position);}fixedUpdate(dt){return this.controller.fixedUpdate(dt);}update(dt){this.view.update(dt);}get position(){return this.controller.position;}get velocity(){return this.controller.velocity;} }
