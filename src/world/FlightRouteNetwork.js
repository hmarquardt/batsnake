// @ts-check
import * as THREE from 'three';
const route=(id,name,width,speed,risk,exposure,points,branches=[])=>({id,name,width,speed,risk,exposure,points:points.map(p=>new THREE.Vector3(...p)),branches});
export class FlightRouteNetwork {
  constructor(){this.routes=[
    route('central','Central fast corridor',2.5,1.16,.82,1,[[-1,4,-54],[1,4,-33],[-2,4,-12],[2,4,11],[-1,6,32],[0,7,52]],['high','lower']),
    route('high','High ceiling route',2,1.02,.65,.72,[[3,7,-54],[5,9,-34],[-1,10,-14],[-5,10,8],[3,9,30],[0,8,52]],['arc']),
    route('lower','Lower column weave',1.8,.92,.72,1.15,[[-3,2,-54],[-7,2,-28],[2,1,-9],[-6,3,12],[5,4,31],[0,6,52]],['shelf','central']),
    route('shelf','Shelf-side route',1.7,.96,.55,.86,[[5,5,-54],[8,6,-38],[9,5,-21],[7,6,1],[6,6,25],[2,7,52]],['central']),
    route('arc','Wide outside arc',2.8,1.08,.48,.62,[[-6,5,-54],[-9,6,-31],[-9,7,-5],[-8,7,19],[-5,7,38],[0,7,52]],['high','central']),
  ];this.byId=new Map(this.routes.map(r=>[r.id,r]));this.tempA=new THREE.Vector3();this.tempB=new THREE.Vector3();}
  get(id){return this.byId.get(id)||this.routes[0];}
  sample(id,z,out){const route=this.get(id),points=route.points;let index=0;while(index<points.length-2&&z>points[index+1].z)index++;const a=points[index],b=points[index+1],t=THREE.MathUtils.clamp((z-a.z)/(b.z-a.z),0,1);return out.lerpVectors(a,b,t);}
  choose(random,director,role,current=null){const candidates=this.routes.map(route=>({route,weight:director.routeWeight(route.id)*(role.routeBias[route.id]||1)/(1+director.routeOccupancy[route.id]*role.congestion)}));if(current&&random.chance(role.loyalty))return this.get(current);return random.weighted(candidates,item=>item.weight).route;}
  occupancy(agents,target){for(const key of Object.keys(target))target[key]=0;for(const bat of agents)if(bat.active)target[bat.routeId]=(target[bat.routeId]||0)+1;return target;}
}
