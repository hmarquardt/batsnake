// @ts-check
export class Scoring {
  constructor(difficulty={score:1}){this.difficulty=difficulty;this.score=0;this.started=performance.now();this.quickCalls=0;this.fullCalls=0;this.collisions=0;this.nearMisses=0;this.closestStrike=99;this.captures=0;this.strikes=0;this.misses=0;this.bestIntercept=0;this.snakesUsed=new Set([0]);this.route='central';this.flockContext=0;this.patience=0;}
  elapsed(){return(performance.now()-this.started)/1000;}
  batScore(progress,speed=0){const calls=this.quickCalls+this.fullCalls,discipline=Math.max(0,220-Math.abs(calls-4)*28),clean=Math.max(0,420-this.collisions*110),controlled=Math.min(240,speed*18);return Math.max(0,Math.round((progress*12+clean+discipline+this.nearMisses*140+controlled+this.flockContext*5)*this.difficulty.score));}
  snakeScore(){const accuracy=this.strikes?this.captures/this.strikes:0;return Math.round((this.captures*1150+accuracy*700+this.bestIntercept*220+this.snakesUsed.size*180+Math.min(260,this.patience*4)-this.misses*90)*this.difficulty.score);}
  accuracy(){return this.strikes?this.captures/this.strikes:0;}
}
