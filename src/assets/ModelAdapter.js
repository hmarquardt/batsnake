// @ts-check
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { markHeat } from '../sensory/HeatSignature.js';
import { validateMetadata } from './ModelMetadata.js';

const HEAT_COLORS = { torso: 0xffa14e, head: 0xffc275, wingRoot: 0xf58a3c, membrane: 0xc65a2e, snakeHead: 0xff8b45, snakeBody: 0xb43c22 };
const CLIP_PRIORITY = ['captured', 'panic', 'brake', 'dive', 'flap', 'glide'];

export class ModelAdapter {
  constructor(assetManager,events,metadata){this.assets=assetManager;this.events=events;this.metadata=metadata;this.root=null;this.mixer=null;this.actions={};this.heatProxies=[];this.echoResponders=[];this.ready=false;this.fallbackReason='disabled';this.activeClip='';this.activeAction=null;this.clipHold=0;this.loadGeneration=0;}
  async load(parent,enabled=true){
    const generation=++this.loadGeneration;
    if(!enabled||!validateMetadata(this.metadata)){this.fallbackReason=enabled?'invalid metadata':'disabled';return false;}
    const gltf=await this.assets.glb(this.metadata.path,false);
    if(generation!==this.loadGeneration)return false;
    if(!gltf){this.fallbackReason='missing asset';return false;}
    this.root=cloneSkinned(gltf.scene);this.root.name=this.metadata.assetId;
    let triangles=0,bones=0;const materialSet=new Set(),textureSet=new Set();
    // Documented presentation tuning only: a faint warm self-read so the animal stays legible in darkness.
    const emissiveByMaterial={'Body fur':[0x24140b,.32],'Wing membrane':[0x170b07,.16],'Dark detail':[0x090504,.12]};
    this.root.traverse(object=>{if(object.isBone){bones++;return;}if(!object.isMesh)return;object.geometry=object.geometry.clone();object.material=Array.isArray(object.material)?object.material.map(material=>material.clone()):object.material.clone();const materials=Array.isArray(object.material)?object.material:[object.material];for(const material of materials){materialSet.add(material);for(const value of Object.values(material))if(value?.isTexture)textureSet.add(value);const emissive=emissiveByMaterial[material.name];if(emissive&&'emissive'in material){material.emissive.setHex(emissive[0]);material.emissiveIntensity=emissive[1];}if(material.name==='Wing membrane'){material.color.multiplyScalar(.48);material.opacity=.78;material.transparent=true;material.depthWrite=true;}}const count=object.geometry.index?.count||object.geometry.attributes.position?.count||0;triangles+=count/3;});
    const missingNodes=Object.values(this.metadata.nodes).filter(name=>!this.root.getObjectByName(name));
    if(missingNodes.length){this.fallbackReason=`missing nodes: ${missingNodes.join(', ')}`;this.events.emit('notice',{message:'Hero bat nodes incomplete; procedural wings remain active.'});this.disposeRoot();return false;}
    if(triangles>(this.metadata.maxTriangles||Infinity)){this.fallbackReason='model exceeds triangle budget';this.events.emit('notice',{message:'Hero bat exceeds its field rig budget; procedural wings remain active.'});this.disposeRoot();return false;}
    if(bones>(this.metadata.maxBones??Infinity)||materialSet.size>(this.metadata.maxMaterials??Infinity)||textureSet.size>(this.metadata.maxTextures??Infinity)){this.fallbackReason='model exceeds resource budget';this.events.emit('notice',{message:'Hero bat exceeds its animation or material budget; procedural wings remain active.'});this.disposeRoot();return false;}
    this.root.scale.setScalar(this.metadata.expectedScale);parent.add(this.root);this.mixer=new THREE.AnimationMixer(this.root);
    for(const [state,clipName] of Object.entries(this.metadata.animations)){const clip=THREE.AnimationClip.findByName(gltf.animations,clipName);if(clip){const action=this.mixer.clipAction(clip);if(state==='captured'){action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;}this.actions[state]=action;}}
    if(Object.keys(this.actions).length!==Object.keys(this.metadata.animations).length){this.fallbackReason='missing animations';this.disposeRoot();return false;}
    const regions=Array.isArray(this.metadata.heatRegions)?this.metadata.heatRegions:[];
    for(const region of regions){const descriptor=typeof region==='string'?{node:region,kind:region==='Head'?'head':region.includes('Wing')?'membrane':'torso',temperature:.8,size:.12}:region;const node=this.root.getObjectByName(descriptor.node);if(!node)continue;const proxy=new THREE.Mesh(new THREE.SphereGeometry(descriptor.size||.1,6,4),new THREE.MeshBasicMaterial({color:HEAT_COLORS[descriptor.kind]||0xe86e32,transparent:true,opacity:.45,depthWrite:false,blending:THREE.AdditiveBlending}));markHeat(proxy,descriptor.kind||'torso',descriptor.temperature??.8);node.add(proxy);this.heatProxies.push(proxy);}
    for(const name of this.metadata.echoRegions){const node=this.root.getObjectByName(name);if(node){node.userData.echoResponder=true;this.echoResponders.push(node);}}
    this.root.userData.modelBudget={triangles:Math.round(triangles),bones,materials:materialSet.size,textures:textureSet.size};this.transitionTo('glide',0);this.ready=true;this.fallbackReason='';return true;
  }
  /** @param {number} dt @param {{flap?:boolean,brake?:boolean,dive?:boolean,panic?:number,collision?:number,captured?:boolean,bank?:number,speed?:number}} state */
  update(dt,state){if(!this.ready)return;this.clipHold=Math.max(0,this.clipHold-dt);let desired='glide';for(const candidate of CLIP_PRIORITY){if(candidate==='captured'&&state.captured){desired='captured';break;}if(candidate==='panic'&&(state.panic||0)>.3){desired='panic';break;}if(candidate==='brake'&&state.brake){desired='brake';break;}if(candidate==='dive'&&state.dive){desired='dive';break;}if(candidate==='flap'&&state.flap){desired='flap';break;}}
    // Brake and dive hold briefly so fast input taps still read as deliberate poses.
    if((desired==='brake'||desired==='dive')&&this.activeClip!==desired)this.clipHold=.34;if(this.clipHold>0&&(this.activeClip==='brake'||this.activeClip==='dive')&&(desired==='glide'||desired==='flap'))desired=this.activeClip;
    if(desired!==this.activeClip)this.transitionTo(desired,desired==='captured'?.08:.16);
    if(this.activeAction)this.activeAction.timeScale=desired==='flap'?THREE.MathUtils.clamp(.8+(state.speed||7)*.035,.9,1.3):desired==='panic'?1.15:1;
    this.mixer?.update(dt);
    if(this.root){const pitch=desired==='brake'?.05:desired==='dive'?-.16:-.06,collision=state.collision||0,peripheralY=desired==='panic'?-.21:desired==='flap'?-.23:desired==='brake'?-.27:-.32;this.root.position.set(0,peripheralY-collision*.025,-.29);this.root.rotation.set(pitch+collision*.08*Math.sin(this.mixer?.time*28||0),Math.PI,-(state.bank||0)*.2);this.root.visible=true;}}
  transitionTo(name,duration,force=false){const next=this.actions[name];if(!next)return;const previous=this.activeAction;if(previous===next&&!force)return;next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();if(previous&&previous!==next&&duration>0)previous.crossFadeTo(next,duration,false);else for(const action of Object.values(this.actions))if(action!==next)action.stop();this.activeAction=next;this.activeClip=name;}
  restartState(name){this.transitionTo(name,0,true);}
  attachment(name){if(!this.root)return null;return this.root.getObjectByName(this.metadata.attachments[name]||'')||this.root;}
  disposeRoot(){if(!this.root)return;this.root.removeFromParent();const skeletons=new Set();this.root.traverse(object=>{if(!object.isMesh)return;object.geometry?.dispose();if(object.isSkinnedMesh&&object.skeleton)skeletons.add(object.skeleton);const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material?.dispose());});skeletons.forEach(skeleton=>skeleton.dispose());this.root=null;this.mixer?.stopAllAction();this.mixer=null;this.actions={};this.activeAction=null;this.activeClip='';this.heatProxies.length=0;this.echoResponders.length=0;this.ready=false;}
  dispose(){this.loadGeneration++;this.disposeRoot();}
}
