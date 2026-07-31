// @ts-check
import * as THREE from 'three';
import { EcholocationPulse } from './EcholocationPulse.js';
import { EchoReturnPool } from './EchoReturnPool.js';

export class EcholocationSystem {
  /** @param {THREE.Scene} scene @param {import('../world/CaveWorld.js').CaveWorld} world @param {import('../core/EventBus.js').EventBus} events @param {import('../core/Settings.js').Settings} settings */
  constructor(scene,world,events,settings){
    this.scene=scene;this.world=world;this.events=events;this.settings=settings;
    /** @type {EcholocationPulse|null} */this.pulse=null;
    this.cooldown=0;this.maxCooldown=1.35;this.historyCursor=0;this.historyActive=[false,false,false];
    this.returnPool=new EchoReturnPool(scene,24);this.lastUpdateMs=0;
    this.world.materials.setEchoProfile(settings.profile());
  }

  /** @param {THREE.Vector3} origin @param {'quick'|'full'} [kind] */
  emit(origin,kind='full'){
    if(this.cooldown>0||this.pulse)return false;
    const profile=this.settings.profile(),quick=kind==='quick',range=quick?19:38,duration=quick ? .92 : 1.9,memory=quick ? .58 : 1;const slot=this.historyCursor++%profile.echoHistories;
    this.historyActive[slot]=true;this.world.materials.echoUniforms.pulseOrigins.value[slot].copy(origin);this.world.materials.echoUniforms.pulseAges.value[slot]=0;
    this.world.materials.echoUniforms.pulseRange.value=range;this.world.materials.echoUniforms.memoryDecay.value=profile.echoMemory*memory;
    this.pulse=new EcholocationPulse(this.scene,origin,range,duration);this.maxCooldown=(quick ? .68 : 1.65)*(this.settings.get('difficulty')==='flightline'?1.12:this.settings.get('difficulty')==='field' ? .9 : 1);this.cooldown=this.maxCooldown;
    const reflections=this.world.spatial.reflections(origin,range,quick?Math.max(3,Math.floor(profile.echoReturns*.45)):profile.echoReturns);
    this.returnPool.schedule(reflections,this.intensity()*(quick ? .72 : 1),this.settings.get('reducedFlashing'));
    const audioReturns=reflections.map((hit)=>({kind:hit.kind,position:hit.position.clone(),distance:hit.distance,strength:hit.strength}));
    this.events.emit('echolocation-pulse',{origin:origin.clone(),range,reflections:audioReturns,kind});
    return true;
  }

  update(dt){
    const started=performance.now();this.cooldown=Math.max(0,this.cooldown-dt);const profile=this.settings.profile();let anyMemory=false;
    for(let i=0;i<3;i++){if(!this.historyActive[i])continue;this.world.materials.echoUniforms.pulseAges.value[i]+=dt;const age=this.world.materials.echoUniforms.pulseAges.value[i];if(age>34/21.5+profile.echoMemory*3){this.historyActive[i]=false;this.world.materials.echoUniforms.pulseAges.value[i]=-100;}else anyMemory=true;}
    this.world.materials.echoUniforms.pulseIntensity.value=anyMemory?this.intensity():0;
    if(this.pulse){const finished=this.pulse.update(dt,this.intensity());if(finished){this.pulse.dispose();this.pulse=null;}}
    this.returnPool.update(dt);this.lastUpdateMs=performance.now()-started;
  }

  intensity(){return this.settings.get('sensoryIntensity')*(this.settings.get('reducedFlashing') ? .58 : 1);}
  readiness(){return 1-this.cooldown/this.maxCooldown;}
  dispose(){if(this.pulse)this.pulse.dispose();this.returnPool.dispose();this.world.materials.echoUniforms.pulseIntensity.value=0;for(let i=0;i<3;i++){this.historyActive[i]=false;this.world.materials.echoUniforms.pulseAges.value[i]=-100;}}
}
