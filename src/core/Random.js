// @ts-check
/** Deterministic Mulberry32 stream with cheap named forks. */
export class Random {
  /** @param {number|string} seed */ constructor(seed){this.seed=Random.hash(String(seed));this.state=this.seed||0x6d2b79f5;}
  static hash(value){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  next(){let t=this.state+=0x6d2b79f5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}
  range(min,max){return min+(max-min)*this.next();}
  int(max){return Math.floor(this.next()*max);}
  chance(probability){return this.next()<probability;}
  pick(items){return items[Math.min(items.length-1,this.int(items.length))];}
  weighted(items,weight=(item)=>item.weight??1){let total=0;for(const item of items)total+=Math.max(0,weight(item));let roll=this.next()*total;for(const item of items){roll-=Math.max(0,weight(item));if(roll<=0)return item;}return items[items.length-1];}
  fork(label){return new Random(`${this.seed}:${label}`);}
}
