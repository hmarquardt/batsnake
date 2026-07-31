// @ts-check
export class ThreatAwareness { constructor(){this.level=0;this.direction=0;} trigger(level=1,direction=0){this.level=Math.max(this.level,level);this.direction=direction;}update(dt){this.level=Math.max(0,this.level-dt*.65);} }
