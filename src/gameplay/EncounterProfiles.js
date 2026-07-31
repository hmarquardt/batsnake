// @ts-check
export const ENCOUNTER_PROFILES=Object.freeze([
 {id:'broad',name:'Broad Stream',weight:1.4,routes:{central:1.3,high:1,lower:1,shelf:.9,arc:1.1},density:1,panic:.8,ambush:.9,quiet:.8,late:1},
 {id:'split',name:'Split Route',weight:1.25,routes:{central:.45,high:1.5,lower:1.35,shelf:1.3,arc:1.45},density:1.02,panic:1,ambush:1,quiet:.9,late:1},
 {id:'low',name:'Low Ceiling',weight:1,routes:{central:.8,high:.35,lower:1.8,shelf:1.25,arc:.8},density:.96,panic:1.05,ambush:1.2,quiet:.9,late:1},
 {id:'cascade',name:'Panic Cascade',weight:.9,routes:{central:1,high:1,lower:1,shelf:1,arc:1},density:1.08,panic:1.7,ambush:1.05,quiet:.55,late:1.15},
 {id:'sparse',name:'Sparse Traffic',weight:.85,routes:{central:.9,high:1.2,lower:.8,shelf:1.3,arc:1.1},density:.68,panic:.75,ambush:.78,quiet:1.5,late:.85},
 {id:'surge',name:'Late Surge',weight:1,routes:{central:1.1,high:.9,lower:1.1,shelf:.8,arc:1.2},density:.9,panic:1.1,ambush:1,quiet:1.25,late:1.65},
 {id:'ambush',name:'Aggressive Ambush',weight:.75,routes:{central:1.35,high:.8,lower:1.2,shelf:1,arc:.7},density:1.08,panic:1.2,ambush:1.55,quiet:.7,late:1.1},
 {id:'mouth',name:'Quiet Mouth',weight:.8,routes:{central:.7,high:1.1,lower:1.1,shelf:1.2,arc:1.25},density:.9,panic:.85,ambush:.9,quiet:1.35,late:.72},
]);
export function chooseEncounterProfile(random,difficulty){return random.weighted(ENCOUNTER_PROFILES,p=>p.weight*(difficulty.id==='flightline'&&p.id==='ambush'?1.7:1));}
