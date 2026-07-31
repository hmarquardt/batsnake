// @ts-check
export class CaveAmbience { constructor(audio){this.audio=audio;this.dripTimer=2;}update(dt,camera){this.dripTimer-=dt;if(this.dripTimer<=0){this.dripTimer=3+Math.random()*7;this.audio.tone({x:(Math.random()-.5)*18,y:9,z:camera.position.z+(Math.random()-.5)*35},360,.32,'sine',.025,'effects');}} }
