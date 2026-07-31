// @ts-check
import * as THREE from 'three';
import { BatAgent } from './BatAgent.js';
import { markHeat } from '../../sensory/HeatSignature.js';

export class BatFlock {
  /** @param {THREE.Scene} scene @param {number} count @param {import('../../core/EventBus.js').EventBus} events */
  constructor(scene,count,events){this.scene=scene;this.count=count;this.events=events;/** @type {BatAgent[]} */this.agents=Array.from({length:count},(_,i)=>new BatAgent(i));this.elapsed=0;this.forwardAxis=new THREE.Vector3(0,0,1);this.desired=new THREE.Vector3();this.offset=new THREE.Vector3();this.directionTemp=new THREE.Vector3();this.positionTemp=new THREE.Vector3();this.quaternion=new THREE.Quaternion();this.bodyMatrix=new THREE.Matrix4();this.wingMatrix=new THREE.Matrix4();this.featureMatrix=new THREE.Matrix4();this.scale=new THREE.Vector3();this.unitScale=new THREE.Vector3(1,1,1);this.captureSegment=new THREE.Vector3();this.capturePoint=new THREE.Vector3();this.color=new THREE.Color();this.buildMeshes();this.unsubscribe=events.on('echolocation-pulse',({origin,range})=>this.startle(origin,range));}

  buildMeshes(){
    const bodyGeo=new THREE.CapsuleGeometry(.14,.38,3,7);bodyGeo.rotateX(Math.PI/2);
    const headGeo=new THREE.SphereGeometry(.13,7,5);headGeo.scale(1,.78,1.15);
    const rootGeo=new THREE.SphereGeometry(.11,6,4);
    const wingGeo=new THREE.BufferGeometry();wingGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.72,.08,-.05,-.48,-.02,.22,-.18,-.06,.32,0,0,0,.72,.08,-.05,.48,-.02,.22,.18,-.06,.32],3));wingGeo.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);wingGeo.computeVertexNormals();
    const bodyMat=new THREE.MeshStandardMaterial({color:0x211915,roughness:.9});const wingMat=new THREE.MeshPhysicalMaterial({color:0x2e201b,roughness:.82,transparent:true,opacity:.68,side:THREE.DoubleSide,transmission:.06});
    this.bodies=new THREE.InstancedMesh(bodyGeo,bodyMat,this.count);this.heads=new THREE.InstancedMesh(headGeo,bodyMat,this.count);this.wings=new THREE.InstancedMesh(wingGeo,wingMat,this.count);this.bodies.castShadow=true;this.heads.castShadow=true;this.wings.castShadow=true;this.scene.add(this.bodies,this.heads,this.wings);

    const coreMat=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true,transparent:true,opacity:.92,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,fog:true});
    const membraneMat=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true,transparent:true,opacity:.44,side:THREE.DoubleSide,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,fog:true});
    this.heatBodies=new THREE.InstancedMesh(bodyGeo,coreMat,this.count);this.heatHeads=new THREE.InstancedMesh(headGeo,coreMat,this.count);this.heatRoots=new THREE.InstancedMesh(rootGeo,coreMat,this.count*2);this.heatWings=new THREE.InstancedMesh(wingGeo,membraneMat,this.count);
    markHeat(this.heatBodies,'torso',.92);markHeat(this.heatHeads,'head',1);markHeat(this.heatRoots,'wingRoot',.84);markHeat(this.heatWings,'membrane',.46);
    this.scene.add(this.heatBodies,this.heatHeads,this.heatRoots,this.heatWings);
  }

  startle(origin,range){for(const agent of this.agents){const distance=agent.position.distanceTo(origin);if(distance<range)agent.panic=Math.max(agent.panic,1-distance/range*.4);}}

  /** @param {number} dt @param {THREE.Vector3|null} playerPosition @param {{position:THREE.Vector3,state:string}[]} snakes */
  update(dt,playerPosition,snakes=[]){
    this.elapsed+=dt;
    for(const bat of this.agents){
      if(!bat.active){this.bodyMatrix.makeScale(0,0,0);this.setMatrices(bat.index,this.bodyMatrix);continue;}
      bat.panic=Math.max(0,bat.panic-dt*.35);this.desired.set(Math.sin(bat.position.z*.08+bat.phase)*.55,Math.sin(this.elapsed*.7+bat.phase)*.35,8.2+bat.panic*4.5);
      for(const other of this.agents){if(other===bat||!other.active)continue;const distanceSquared=bat.position.distanceToSquared(other.position);if(distanceSquared<1.4&&distanceSquared>.001)this.desired.addScaledVector(this.offset.subVectors(bat.position,other.position).normalize(),(1.4-distanceSquared)*.8);}
      for(const snake of snakes){const distance=bat.position.distanceTo(snake.position);if(distance<8&&snake.state!=='recover')this.desired.addScaledVector(this.offset.subVectors(bat.position,snake.position).normalize(),(8-distance)*1.3);}
      if(playerPosition){const distance=bat.position.distanceTo(playerPosition);if(distance<2.2)this.desired.addScaledVector(this.offset.subVectors(bat.position,playerPosition).normalize(),2.2-distance);}
      const corridorX=Math.sin((bat.position.z+15)*.045)*2.2;this.desired.x+=(corridorX-bat.position.x)*.18;this.desired.y+=(3.8+Math.sin(bat.position.z*.1+bat.phase)*2-bat.position.y)*.14;bat.velocity.lerp(this.desired,Math.min(1,dt*(1.1+bat.panic*2)));bat.position.addScaledVector(bat.velocity,dt);
      if(bat.position.z>55){bat.position.z=-54-Math.random()*20;bat.position.x=(Math.random()-.5)*10;bat.active=true;bat.captured=false;}
      const flap=Math.sin(this.elapsed*(11+bat.panic*8)+bat.phase);this.quaternion.setFromUnitVectors(this.forwardAxis,this.directionTemp.copy(bat.velocity).normalize());
      this.bodyMatrix.compose(bat.position,this.quaternion,this.unitScale);this.bodies.setMatrixAt(bat.index,this.bodyMatrix);this.heatBodies.setMatrixAt(bat.index,this.bodyMatrix);
      this.positionTemp.copy(bat.position).add(this.offset.set(0,.02,.3).applyQuaternion(this.quaternion));this.featureMatrix.compose(this.positionTemp,this.quaternion,this.unitScale);this.heads.setMatrixAt(bat.index,this.featureMatrix);this.heatHeads.setMatrixAt(bat.index,this.featureMatrix);
      this.scale.set(1,Math.max(.18,.72+.52*flap),1);this.wingMatrix.compose(bat.position,this.quaternion,this.scale);this.wings.setMatrixAt(bat.index,this.wingMatrix);this.heatWings.setMatrixAt(bat.index,this.wingMatrix);
      for(let side=0;side<2;side++){this.positionTemp.copy(bat.position).add(this.offset.set(side?-.22:.22,0,.02).applyQuaternion(this.quaternion));this.featureMatrix.compose(this.positionTemp,this.quaternion,this.unitScale);this.heatRoots.setMatrixAt(bat.index*2+side,this.featureMatrix);}
      const activity=THREE.MathUtils.clamp(.64+bat.velocity.length()*.022+bat.panic*.22+Math.max(0,flap)*.08,0,1);this.heatBodies.setColorAt(bat.index,this.color.setRGB(1,.33+.38*activity,.08));this.heatHeads.setColorAt(bat.index,this.color.setRGB(1,.58+.28*activity,.18));this.heatWings.setColorAt(bat.index,this.color.setRGB(.56+.24*activity,.12+.16*activity,.045));this.heatRoots.setColorAt(bat.index*2,this.color.setRGB(1,.42+.34*activity,.09));this.heatRoots.setColorAt(bat.index*2+1,this.color);
    }
    for(const mesh of [this.bodies,this.heads,this.wings,this.heatBodies,this.heatHeads,this.heatRoots,this.heatWings])mesh.instanceMatrix.needsUpdate=true;
    for(const mesh of [this.heatBodies,this.heatHeads,this.heatRoots,this.heatWings])if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  }

  setMatrices(index,matrix){this.bodies.setMatrixAt(index,matrix);this.heads.setMatrixAt(index,matrix);this.wings.setMatrixAt(index,matrix);this.heatBodies.setMatrixAt(index,matrix);this.heatHeads.setMatrixAt(index,matrix);this.heatWings.setMatrixAt(index,matrix);this.heatRoots.setMatrixAt(index*2,matrix);this.heatRoots.setMatrixAt(index*2+1,matrix);}

  /** @param {THREE.Vector3} from @param {THREE.Vector3} to @param {number} radius */
  captureAlong(from,to,radius){this.captureSegment.subVectors(to,from);const lengthSquared=this.captureSegment.lengthSq();let best=null,bestDistance=Infinity;for(const bat of this.agents){if(!bat.active)continue;const t=THREE.MathUtils.clamp(this.offset.subVectors(bat.position,from).dot(this.captureSegment)/Math.max(.001,lengthSquared),0,1);this.capturePoint.copy(from).addScaledVector(this.captureSegment,t);const distance=this.capturePoint.distanceTo(bat.position);if(distance<radius&&distance<bestDistance){best=bat;bestDistance=distance;}}if(best){best.active=false;best.captured=true;this.events.emit('bat-captured',{bat:best,position:best.position.clone()});}return best;}
  activeCount(){let count=0;for(const bat of this.agents)if(bat.active)count+=1;return count;}
  /** Thermal history reads these agents without allocating a parallel list. */
  heatSources(){return this.agents;}
  dispose(){this.unsubscribe();for(const mesh of [this.bodies,this.heads,this.wings,this.heatBodies,this.heatHeads,this.heatRoots,this.heatWings]){this.scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();}}
}
