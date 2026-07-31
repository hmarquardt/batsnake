// @ts-check
import * as THREE from 'three';
import { markHeat } from '../sensory/HeatSignature.js';
import { validateMetadata } from './ModelMetadata.js';

export class ModelAdapter {
  constructor(assetManager,events,metadata){this.assets=assetManager;this.events=events;this.metadata=metadata;this.root=null;this.mixer=null;this.actions={};this.heatProxies=[];this.echoResponders=[];this.ready=false;this.fallbackReason='disabled';}
  async load(parent,enabled=true){
    if(!enabled||!validateMetadata(this.metadata)){this.fallbackReason=enabled?'invalid metadata':'disabled';return false;}
    const gltf=await this.assets.glb(this.metadata.path,false);
    if(!gltf){this.fallbackReason='missing asset';return false;}
    this.root=gltf.scene.clone(true);this.root.name=this.metadata.assetId;
    let triangles=0;
    this.root.traverse(object=>{if(!object.isMesh)return;object.geometry=object.geometry.clone();object.material=Array.isArray(object.material)?object.material.map(material=>material.clone()):object.material.clone();const count=object.geometry.index?.count||object.geometry.attributes.position?.count||0;triangles+=count/3;});
    const missingNodes=Object.values(this.metadata.nodes).filter(name=>!this.root.getObjectByName(name));
    if(missingNodes.length){this.fallbackReason=`missing nodes: ${missingNodes.join(', ')}`;this.events.emit('notice',{message:'Hero bat nodes incomplete; procedural wings remain active.'});this.disposeRoot();return false;}
    if(triangles>(this.metadata.maxTriangles||Infinity)){this.fallbackReason='model exceeds triangle budget';this.events.emit('notice',{message:'Hero bat exceeds its field rig budget; procedural wings remain active.'});this.disposeRoot();return false;}
    this.root.scale.setScalar(this.metadata.expectedScale);parent.add(this.root);this.mixer=new THREE.AnimationMixer(this.root);
    for(const [state,clipName] of Object.entries(this.metadata.animations)){const clip=THREE.AnimationClip.findByName(gltf.animations,clipName);if(clip)this.actions[state]=this.mixer.clipAction(clip);}
    if(Object.keys(this.actions).length!==Object.keys(this.metadata.animations).length){this.fallbackReason='missing animations';this.disposeRoot();return false;}
    for(const name of this.metadata.heatRegions){const node=this.root.getObjectByName(name);if(!node)continue;const proxy=new THREE.Mesh(new THREE.SphereGeometry(name.includes('Wing')?.16:.12,6,4),new THREE.MeshBasicMaterial({color:name==='Head'?0xffc275:0xe86e32,transparent:true,opacity:.45,depthWrite:false,blending:THREE.AdditiveBlending}));markHeat(proxy,name.includes('Wing')?'membrane':name==='Head'?'head':'torso',name==='Head'?1:.8);node.add(proxy);this.heatProxies.push(proxy);}
    for(const name of this.metadata.echoRegions){const node=this.root.getObjectByName(name);if(node){node.userData.echoResponder=true;this.echoResponders.push(node);}}
    this.ready=true;this.fallbackReason='';return true;
  }
  update(dt,state){if(!this.ready)return;this.mixer?.update(dt);const desired=state.brake?'brake':state.flap?'flap':'glide';for(const [name,action] of Object.entries(this.actions)){if(name===desired&&!action.isRunning())action.reset().fadeIn(.12).play();else if(name!==desired&&action.isRunning())action.fadeOut(.12);}if(this.root){this.root.position.set(0,-.18,-.52);this.root.rotation.set(0,Math.PI,-state.bank*.18);this.root.visible=true;}}
  attachment(name){if(!this.root)return null;return this.root.getObjectByName(this.metadata.attachments[name]||'')||this.root;}
  disposeRoot(){if(!this.root)return;this.root.removeFromParent();this.root.traverse(object=>{if(!object.isMesh)return;object.geometry?.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material?.dispose());});this.root=null;this.mixer?.stopAllAction();this.mixer=null;this.actions={};this.heatProxies.length=0;this.echoResponders.length=0;this.ready=false;}
  dispose(){this.disposeRoot();}
}
