// @ts-check
export const BAT_ROLES=Object.freeze([
 {id:'leader',weight:.14,speed:1.14,separation:1.1,panic:.55,loyalty:.76,congestion:.18,routeBias:{central:1.25,arc:1.2}},
 {id:'follower',weight:.34,speed:1,separation:.72,panic:.9,loyalty:.84,congestion:.08,routeBias:{central:1.2,shelf:1.1}},
 {id:'edge',weight:.18,speed:1.04,separation:1.3,panic:1.25,loyalty:.4,congestion:.42,routeBias:{arc:1.55,high:1.2}},
 {id:'juvenile',weight:.15,speed:.82,separation:.9,panic:1.45,loyalty:.7,congestion:.25,routeBias:{lower:1.35,shelf:1.2}},
 {id:'escape',weight:.19,speed:1.27,separation:1.15,panic:1.05,loyalty:.34,congestion:.5,routeBias:{central:1.35,high:1.25}},
]);
export const chooseBatRole=random=>random.weighted(BAT_ROLES,role=>role.weight);
