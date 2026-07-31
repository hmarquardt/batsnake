// @ts-check
export class SnakeMemory {
  constructor(){this.routes={central:0,high:0,lower:0,shelf:0,arc:0};this.misses=0;this.successes=0;this.echoes=0;this.panicDirection=0;this.traffic=0;this.playerSightings=0;this.confidence=.5;this.lastStrikeRoute='central';}
  observe(bats,anchor){this.traffic=0;for(const key of Object.keys(this.routes))this.routes[key]*=.985;for(const bat of bats){if(!bat.active||bat.position.distanceToSquared(anchor)>225)continue;this.routes[bat.routeId]=(this.routes[bat.routeId]||0)+.08;this.traffic++;if(bat.isPlayer)this.playerSightings++;}this.confidence=Math.max(.15,Math.min(1,.5+this.successes*.12-this.misses*.08));}
  bestRoute(){let best='central',value=-1;for(const [route,count] of Object.entries(this.routes))if(count>value){best=route;value=count;}return best;}
  miss(){this.misses=Math.min(8,this.misses+1);this.confidence=Math.max(.15,this.confidence-.12);}
  success(route){this.successes=Math.min(8,this.successes+1);this.lastStrikeRoute=route;this.confidence=Math.min(1,this.confidence+.18);}
  hear(){this.echoes=Math.min(12,this.echoes+1);this.confidence=Math.min(1,this.confidence+.04);}
  summary(){return{traffic:this.traffic,confidence:this.confidence,misses:this.misses,bestRoute:this.bestRoute()};}
}
