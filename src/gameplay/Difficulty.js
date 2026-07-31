// @ts-check
export const DIFFICULTIES=Object.freeze({
  field:{id:'field',name:'Field Study',description:'Longer recovery and readable animal reactions. A measured first observation.',density:.9,snakeReaction:.72,panic:.78,duration:76,target:3,score:1,callCooldown:.9,routePressure:.82},
  night:{id:'night',name:'Night Flight',description:'The natural baseline: shifting corridors, alert boas, and a full departure.',density:1,snakeReaction:1,panic:1,duration:68,target:4,score:1.3,callCooldown:1,routePressure:1},
  flightline:{id:'flightline',name:'Flight Line',description:'Dense route pressure, cautious recovery, and faster predator adaptation.',density:1.18,snakeReaction:1.28,panic:1.25,duration:62,target:5,score:1.7,callCooldown:1.12,routePressure:1.24},
});
export const difficultyFor=(id)=>DIFFICULTIES[id]||DIFFICULTIES.night;
