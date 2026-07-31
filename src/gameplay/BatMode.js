// @ts-check
import * as THREE from 'three';
import { BatPlayer } from '../entities/bat/BatPlayer.js';
import { BatFlock } from '../entities/bat/BatFlock.js';
import { SnakeNetwork } from '../entities/snake/SnakeNetwork.js';
import { EcholocationSystem } from '../sensory/EcholocationSystem.js';
import { ThreatAwareness } from '../sensory/ThreatAwareness.js';
import { BatObjective } from './Objectives.js';
import { Scoring } from './Scoring.js';
import { BAT_START, ENTRANCE } from '../world/NavigationVolumes.js';
export class BatMode {
  constructor(context){Object.assign(this,context);this.player=new BatPlayer(this.camera,this.input,this.settings,this.world,this.events);this.player.reset(BAT_START);this.flock=new BatFlock(this.scene,this.settings.profile().bats,this.events);this.snakes=new SnakeNetwork(this.scene,this.events,this.world.spatial);this.snakes.playerControlled=false;this.echo=new EcholocationSystem(this.scene,this.world,this.events,this.settings);this.threat=new ThreatAwareness();this.objective=new BatObjective();this.scoring=new Scoring();this.ended=false;this.hud.show();this.unsubscribe=[this.events.on('echolocation-pulse',()=>this.scoring.pulses++),this.events.on('player-collision',()=>this.scoring.collisions++),this.events.on('snake-strike-started',({controller})=>{const distance=controller.headPosition.distanceTo(this.player.position);if(distance<12)this.threat.trigger(1);})];}
  fixedUpdate(dt){if(this.ended)return;this.player.fixedUpdate(dt);this.snakes.update(dt,this.input,this.settings,this.flock.agents);this.flock.update(dt,this.player.position,this.snakes.tacticalData());for(const strike of this.snakes.activeStrikes()){const distance=this.world.spatial.pointSegmentDistance(this.player.position,strike.from,strike.to);if(distance<.8){strike.controller.strike.capture();this.snakes.rigs[strike.index].captureBat();this.events.emit('bat-captured',{position:this.player.position.clone(),player:true});this.finish(false,'Taken in darkness','The boa read your flight line before you did.');return;}if(distance<2.1){strike.controller.strike.hit=true;this.scoring.nearMisses++;this.threat.trigger(.8);this.events.emit('near-miss',{position:this.player.position.clone()});}else{this.flock.captureAlong(strike.from,strike.to,.62);}}if(this.objective.escaped(this.player.position)){this.scoring.snakesAvoided=3;this.finish(true,'Into moonlight','Cool night air catches beneath your wings. The cave falls behind.');}}
  update(dt){if(this.ended)return;if(this.input.consume('KeyE')||this.input.mouse.pressed)this.echo.emit(this.player.position);this.echo.update(dt);this.threat.update(dt);this.player.update(dt);const distance=this.objective.distance(this.player.position),toExit=ENTRANCE.clone().sub(this.player.position),forward=new THREE.Vector3(Math.sin(this.player.controller.yaw),0,Math.cos(this.player.controller.yaw));const bearing=Math.atan2(toExit.x,toExit.z)-Math.atan2(forward.x,forward.z);this.scoring.score=this.scoring.batScore(100-distance);this.hud.update({distance,score:this.scoring.score,energy:this.player.controller.energy,echo:this.echo.readiness(),threat:this.threat.level,bearing});}
  finish(success,title,description){if(this.ended)return;this.ended=true;this.onEnd({success,outcome:success?'ESCAPE RECORDED':'PREDATION RECORDED',title,description,stats:[{value:`${this.scoring.elapsed().toFixed(1)}s`,label:'Flight time'},{value:this.scoring.pulses,label:'Pulses'},{value:this.scoring.score.toLocaleString(),label:'Score'}]});}
  speed(){return this.player.velocity.length();}activeBats(){return this.flock.activeCount();}
  sensoryTime(){return this.echo.lastUpdateMs;}
  dispose(){this.hud.hide();this.unsubscribe.forEach((fn)=>fn());this.player.dispose();this.echo.dispose();this.flock.dispose();this.snakes.dispose();}
}
