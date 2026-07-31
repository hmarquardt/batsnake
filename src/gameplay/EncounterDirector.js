// @ts-check
const PHASES=[['stillness',.07],['initial',.14],['building',.2],['peak',.22],['disruption',.14],['final',.18],['resolution',.05]];
const SHAPE={stillness:[.08,.15,.1],initial:[.38,.38,.3],building:[.74,.7,.55],peak:[1,1,.82],disruption:[.66,1.4,1],final:[.82,1.1,.88],resolution:[.18,.45,.25]};
export class EncounterDirector {
  constructor(random,profile,difficulty,duration){this.random=random;this.profile=profile;this.difficulty=difficulty;this.duration=duration;this.elapsed=0;this.phase='stillness';this.phaseProgress=0;this.density=.1;this.panic=.1;this.pressure=.1;this.lastUpdateMs=0;this.disruptions=0;this.routeOccupancy={central:0,high:0,lower:0,shelf:0,arc:0};this.boundaries=[];let sum=0;for(const [name,share] of PHASES){sum+=share;this.boundaries.push([name,sum]);}}
  update(dt){const started=performance.now();this.elapsed+=dt;const normalized=Math.min(.999,this.elapsed/this.duration);let previous=0;for(const [name,end] of this.boundaries){if(normalized<=end){this.phase=name;this.phaseProgress=(normalized-previous)/(end-previous);break;}previous=end;}const shape=SHAPE[this.phase];const pulse=.9+.1*Math.sin(this.elapsed*.72+this.random.seed%13);this.density=shape[0]*this.profile.density*this.difficulty.density*pulse;this.panic=shape[1]*this.profile.panic*this.difficulty.panic;this.pressure=shape[2]*this.profile.ambush*this.difficulty.routePressure;this.lastUpdateMs=performance.now()-started;}
  routeWeight(id){return(this.profile.routes[id]||1)*(1+this.pressure*(id==='central' ? .18 : id==='lower' ? .1 : 0));}
  recordOccupancy(occupancy){Object.assign(this.routeOccupancy,occupancy);}
  disturb(amount=1){this.disruptions+=amount;this.panic=Math.min(2,this.panic+amount*.25);}
  snapshot(){return{phase:this.phase,density:this.density,panic:this.panic,pressure:this.pressure,profile:this.profile.id};}
}
