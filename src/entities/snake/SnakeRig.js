// @ts-check
import * as THREE from 'three';
import { markHeat } from '../../sensory/HeatSignature.js';

const RINGS=40;
const SIDES=14;

/** Deterministic boa dorsal blotches + belly plates baked into vertex colors. */
function bodyGeometry(identity){const positions=new Float32Array(RINGS*SIDES*3),normals=new Float32Array(RINGS*SIDES*3),uvs=new Float32Array(RINGS*SIDES*2),colors=new Float32Array(RINGS*SIDES*3),indices=[];const blotches=[.62,.9,.75][identity]??.75;for(let ring=0;ring<RINGS;ring++){for(let side=0;side<SIDES;side++){const vertex=ring*SIDES+side,uv=vertex*2,t=ring/(RINGS-1),angle=side/SIDES*Math.PI*2;uvs[uv]=side/SIDES*3;uvs[uv+1]=t*26;const dorsal=Math.max(0,Math.sin(angle));const saddle=Math.sin(t*47+identity*2.3+Math.sin(t*13)*2)>.35-blotches*.3?1-Math.sin(angle)*.55:1;const belly=Math.max(0,-Math.sin(angle))**1.5;let tone=(.62+.14*Math.sin(t*9+identity))*saddle;tone*=1-dorsal*.18;const r=tone*(1+belly*.35),g=tone*(.86+belly*.42),b=tone*(.68+belly*.5);colors[vertex*3]=r;colors[vertex*3+1]=g;colors[vertex*3+2]=b;if(ring<RINGS-1){const next=vertex+SIDES,nextSide=ring*SIDES+(side+1)%SIDES,nextRingSide=next+(side+1)%SIDES-side;indices.push(vertex,next,nextSide,next,nextRingSide,nextSide);}}}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.BufferAttribute(uvs,2));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.setIndex(indices);return geometry;}

/** Project-created overlapping-scale relief (rows of offset arcs), reused as bump map. */
function scaleTexture(size=128){const data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const row=Math.floor(y/16),offset=row%2?8:0;const u=((x+offset)%16)/16*Math.PI*2,v=(y%16)/16;const arc=Math.sqrt(Math.max(0,Math.sin(u)))*(1-v)+v*.25;const ridge=.35+.65*Math.min(1,arc);const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(ridge*255);data[i+3]=255;}const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.needsUpdate=true;return texture;}
let sharedScaleTexture=null;
function scales(){if(!sharedScaleTexture)sharedScaleTexture=scaleTexture();return sharedScaleTexture;}

function wingGeometry(side){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,side*.45,.02,0,side*.28,-.14,.05],3));geometry.setIndex([0,1,2]);geometry.computeVertexNormals();return geometry;}

const IDENTITY=[{body:0x4a3d2e,belly:0x8a7254,size:1},{body:0x41392c,belly:0x7d684c,size:1.07},{body:0x4f4436,belly:0x91805f,size:.95}];

export class SnakeRig {
  /** @param {THREE.Scene} scene @param {THREE.Vector3} anchor @param {number} index */
  constructor(scene,anchor,index){
    this.scene=scene;this.anchor=anchor.clone();this.index=index;this.identity=IDENTITY[index%3];this.group=new THREE.Group();this.group.name=`Cuban boa visual adapter ${index+1}`;scene.add(this.group);
    this.geometry=bodyGeometry(index);
    this.scaleMaterial=new THREE.MeshStandardMaterial({color:this.identity.body,roughness:.66,bumpMap:scales(),bumpScale:.045,vertexColors:true});
    this.body=new THREE.Mesh(this.geometry,this.scaleMaterial);this.body.castShadow=true;this.body.receiveShadow=true;this.group.add(this.body);
    this.heatBody=new THREE.Mesh(this.geometry,new THREE.MeshBasicMaterial({color:0xb43c22,transparent:true,opacity:.3,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,fog:false,vertexColors:true}));markHeat(this.heatBody,'snakeBody',.62);this.group.add(this.heatBody);
    this.echoUniforms={strength:{value:0},motion:{value:0}};this.echoBody=new THREE.Mesh(this.geometry,new THREE.ShaderMaterial({uniforms:this.echoUniforms,transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:`varying vec2 vUv;varying vec3 vNormalW;varying vec3 vWorld;void main(){vUv=uv;vNormalW=normalize(normalMatrix*normal);vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform float strength;uniform float motion;varying vec2 vUv;varying vec3 vNormalW;varying vec3 vWorld;void main(){float organic=.6+.4*sin(motion*5.-vUv.y*6.);float fresnel=pow(1.-abs(dot(normalize(cameraPosition-vWorld),normalize(vNormalW))),1.5);float alpha=strength*(.1+organic*.12+fresnel*.3);if(alpha<.012)discard;gl_FragColor=vec4(.68,.6,.34,alpha);}`}));this.echoBody.renderOrder=5;this.group.add(this.echoBody);

    // Head: cranium, tapered snout, hinged jaw with mouth interior, eyes, pit rows, forked tongue.
    this.head=new THREE.Group();this.group.add(this.head);
    const cranium=new THREE.Mesh(new THREE.SphereGeometry(.5,16,12),this.scaleMaterial);cranium.scale.set(.72,.5,1.06);cranium.castShadow=true;this.head.add(cranium);
    const snoutMaterial=new THREE.MeshStandardMaterial({color:this.identity.belly,roughness:.72});
    const snout=new THREE.Mesh(new THREE.SphereGeometry(.34,14,10),this.scaleMaterial);snout.scale.set(.78,.5,1.25);snout.position.set(0,-.03,.4);this.head.add(snout);
    this.jawPivot=new THREE.Group();this.jawPivot.position.set(0,-.16,.12);this.head.add(this.jawPivot);
    const jaw=new THREE.Mesh(new THREE.SphereGeometry(.3,12,8),snoutMaterial);jaw.scale.set(.78,.42,1.3);jaw.position.set(0,-.05,.26);this.jawPivot.add(jaw);
    this.mouthInterior=new THREE.Mesh(new THREE.SphereGeometry(.24,10,7),new THREE.MeshStandardMaterial({color:0x4a1410,roughness:.95}));this.mouthInterior.scale.set(.7,.5,1.2);this.mouthInterior.position.set(0,-.08,.24);this.mouthInterior.visible=false;this.jawPivot.add(this.mouthInterior);
    const eyeMaterial=new THREE.MeshStandardMaterial({color:0xa87a3c,roughness:.35,emissive:0x1c1004,emissiveIntensity:.8});const pupilMaterial=new THREE.MeshBasicMaterial({color:0x080503});
    for(const side of [-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),eyeMaterial);eye.position.set(side*.3,.12,.32);eye.scale.set(1,1.15,.7);this.head.add(eye);const pupil=new THREE.Mesh(new THREE.SphereGeometry(.032,8,6),pupilMaterial);pupil.scale.set(.4,1.1,.5);pupil.position.set(side*.335,.12,.34);this.head.add(pupil);
      for(let p=0;p<5;p++){const pit=new THREE.Mesh(new THREE.SphereGeometry(.023,6,5),pupilMaterial);pit.position.set(side*(.14+p*.045),-.09+p*.012,.52-p*.028);this.head.add(pit);}}
    this.tongue=new THREE.Group();this.tongue.position.set(0,-.1,.62);const tongueMaterial=new THREE.MeshBasicMaterial({color:0x6d2020});for(const side of [-1,1]){const fork=new THREE.Mesh(new THREE.CylinderGeometry(.006,.009,.3,4),tongueMaterial);fork.rotation.x=Math.PI/2;fork.rotation.z=side*.14;fork.position.set(side*.03,0,.12);this.tongue.add(fork);}this.head.add(this.tongue);
    this.heatHead=new THREE.Mesh(new THREE.SphereGeometry(.52,14,10),new THREE.MeshBasicMaterial({color:0xff8b45,transparent:true,opacity:.66,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,fog:false}));this.heatHead.scale.set(.72,.5,1.1);markHeat(this.heatHead,'snakeHead',.82);this.group.add(this.heatHead);this.heatHeadGlow=new THREE.Mesh(new THREE.SphereGeometry(.58,12,8),new THREE.MeshBasicMaterial({color:0xff5511,transparent:true,opacity:0,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,fog:false}));this.heatHeadGlow.scale.set(.72,.5,1.1);markHeat(this.heatHeadGlow,'snakeHead',.92);this.group.add(this.heatHeadGlow);
    this.echoHead=new THREE.Mesh(new THREE.SphereGeometry(.54,12,8),this.echoBody.material);this.echoHead.scale.set(.72,.5,1.1);this.echoHead.renderOrder=5;this.group.add(this.echoHead);
    // Anchor coil mass: stacked flattened loops spilling over the ledge.
    this.coils=new THREE.Group();this.coils.position.copy(anchor);this.group.add(this.coils);
    for(let c=0;c<3;c++){const loop=new THREE.Mesh(new THREE.TorusGeometry(.58-c*.09,.15-c*.02,8,20),this.scaleMaterial);loop.rotation.x=Math.PI*.5+(c-1)*.16;loop.rotation.z=c*1.1+this.index;loop.position.y=.05+c*.13;this.coils.add(loop);}

    this.captureVisual=this.createCaptureVisual();this.head.add(this.captureVisual);
    this.capturedFactory=null;this.capturedAdapter=null;this.capturedLoading=false;this.disposed=false;

    this.headPosition=anchor.clone().add(new THREE.Vector3(0,-3,0));this.aimDirection=new THREE.Vector3(0,-.08,1);this.echoAlert=0;this.echoDelay=0;this.pendingEcho=0;this.captureTime=0;this.lungeTime=0;this.controlPoints=Array.from({length:6},()=>new THREE.Vector3());this.curve=new THREE.CatmullRomCurve3(this.controlPoints);this.point=new THREE.Vector3();this.nextPoint=new THREE.Vector3();this.tangent=new THREE.Vector3();this.normal=new THREE.Vector3();this.binormal=new THREE.Vector3();this.reference=new THREE.Vector3();this.offset=new THREE.Vector3();this.headQuaternion=new THREE.Quaternion();this.forward=new THREE.Vector3(0,0,1);this.bodyBounds=new THREE.Sphere(anchor.clone(),4);this.visualState={state:'idle',charge:0,awareness:0,headPosition:this.headPosition,direction:this.aimDirection};this.smoothCharge=0;this.recoverSway=0;this.wasLunging=false;
  }

  createCaptureVisual(){const group=new THREE.Group();group.position.set(0,-.14,.5);const body=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.22,3,6),new THREE.MeshStandardMaterial({color:0x241a14,roughness:.9}));body.rotation.x=Math.PI/2;group.add(body);for(const side of [-1,1]){const wing=new THREE.Mesh(wingGeometry(side),new THREE.MeshStandardMaterial({color:0x3a261c,transparent:true,opacity:.85,side:THREE.DoubleSide}));group.add(wing);}group.visible=false;return group;}
  /** Optional production captured-bat factory (async → ModelAdapter-like). Falls back to the procedural visual. */
  setCapturedFactory(factory){this.capturedFactory=factory;}

  /** @param {number} dt @param {THREE.Vector3} headPosition @param {THREE.Vector3} direction @param {string} state @param {number} charge */
  update(dt,headPosition,direction,state,charge){
    this.headPosition.copy(headPosition);this.aimDirection.copy(direction);this.visualState.state=state;this.visualState.charge=charge;this.visualState.awareness=this.echoAlert;const time=performance.now()*.001,side=this.index%2?1:-1;this.smoothCharge+=( (state==='prepare'?charge:0)-this.smoothCharge)*Math.min(1,dt*7);const tension=state==='lunge'?1:state==='recover'? .5 : this.smoothCharge;
    if(state==='lunge'){this.lungeTime+=dt;}else if(this.wasLunging){this.recoverSway=1;}this.wasLunging=state==='lunge';if(state!=='lunge')this.lungeTime=0;this.recoverSway=Math.max(0,this.recoverSway-dt*.5);
    const breathing=(state==='prepare'?1-charge*.85:1)*(state==='idle'?1:.4);
    const sway=Math.sin(time*2.2+this.index)*this.recoverSway;
    const p=this.controlPoints;p[0].copy(this.anchor);p[1].copy(this.anchor).add(this.offset.set(side*(1.55-tension*.3)+sway*.3,-.38,Math.sin(time*.32+this.index)*.55));p[2].copy(this.anchor).add(this.offset.set(-side*(1.35-tension*.25),-1.08,.72+tension*.22+sway*.2));
    // S-curve: the neck gathers sideways with charge before the head drives forward.
    p[3].copy(this.anchor).lerp(headPosition,.48).add(this.offset.set(side*(.72+tension*1.35)+sway*.4,-.35,Math.sin(time*.7)*.16*breathing-tension*.3));p[4].copy(headPosition).addScaledVector(direction,-(1.35+tension*.55)).add(this.offset.set(-side*tension*.5,.08+tension*.05,0));p[5].copy(headPosition);
    // Distinct miss shapes during recovery: overreach sags, obstruction recoils with a shake, poor lead stays clean.
    if(state==='recover'&&this.missReason){if(this.missReason==='overreach'){p[3].y-=.4;p[4].y-=.3;p[2].y-=.2;}else if(this.missReason==='obstruction'){const shake=Math.sin(time*34+this.index)*.14*Math.max(this.recoverSway,.4);p[2].x+=shake;p[3].x-=shake;p[4].z+=shake*.6;}}
    if(state==='idle')this.missReason=null;
    this.updateBodyGeometry(tension,time,breathing,state);this.head.position.copy(headPosition);this.headQuaternion.setFromUnitVectors(this.forward,direction);this.head.quaternion.copy(this.headQuaternion);const headScale=this.identity.size;this.head.scale.setScalar(headScale);this.heatHead.position.copy(headPosition);this.heatHead.quaternion.copy(this.headQuaternion);this.heatHeadGlow.position.copy(headPosition);this.heatHeadGlow.quaternion.copy(this.headQuaternion);this.heatHeadGlow.material.opacity=tension*.5*Math.sin(time*2.8+1.4)*.4+tension*.25;this.echoHead.position.copy(headPosition);this.echoHead.quaternion.copy(this.headQuaternion);
    // Jaw: slight readiness gape while charging, full open at contact, closed otherwise.
    const jawOpen=state==='lunge'?.62:state==='capture'?.5:this.smoothCharge*.22;this.jawPivot.rotation.x=-jawOpen;this.mouthInterior.visible=jawOpen>.06;this.mouthInterior.position.y=-.08-jawOpen*.1;
    const tongueFlick=Math.sin(time*1.9+this.index*2)>.9&&state==='idle';this.tongue.visible=tongueFlick;if(tongueFlick){const out=.6+.4*Math.sin(time*24);this.tongue.scale.set(1,1,out);}
    if(this.echoDelay>0){this.echoDelay-=dt;if(this.echoDelay<=0){this.alert(this.pendingEcho);this.pendingEcho=0;}}this.echoAlert=Math.max(0,this.echoAlert-dt*(state==='lunge' ? .38 : .62));this.echoUniforms.strength.value=this.echoAlert;this.echoUniforms.motion.value=time+(state==='lunge'?1:0);
    this.captureTime=Math.max(0,this.captureTime-dt);const struggling=this.captureTime>0;this.captureVisual.visible=struggling&&!this.capturedAdapter;if(this.capturedAdapter)this.capturedAdapter.root.visible=struggling;
    if(struggling){const settle=Math.min(1,this.captureTime*2.2);const struggle=Math.sin(time*38)*settle;this.captureVisual.rotation.z=struggle*.22;this.captureVisual.children[1].rotation.z=struggle*.6;this.captureVisual.children[2].rotation.z=-struggle*.6;if(this.capturedAdapter){this.capturedAdapter.update(dt,{captured:true,bank:0});this.capturedAdapter.root.position.set(0,-.2,.38);this.capturedAdapter.root.rotation.set(-.5,Math.PI,0);}}
    this.bodyBounds.center.copy(this.anchor).lerp(headPosition,.5);this.bodyBounds.radius=this.anchor.distanceTo(headPosition)*.5+.8;
  }

  updateBodyGeometry(tension,time,breathing,state){const positions=this.geometry.attributes.position.array,normals=this.geometry.attributes.normal.array;const lungeWave=state==='lunge'?Math.min(1,this.lungeTime*4):-1;for(let ring=0;ring<RINGS;ring++){const t=ring/(RINGS-1);this.curve.getPoint(t,this.point);this.curve.getTangent(t,this.tangent).normalize();this.reference.set(0,1,0);if(Math.abs(this.tangent.dot(this.reference))>.9)this.reference.set(1,0,0);this.normal.crossVectors(this.tangent,this.reference).normalize();this.binormal.crossVectors(this.tangent,this.normal).normalize();
      // Muscular taper: heavy neck, working mid-body, drawn tail; breathing and a traveling power wave during the lunge.
      const taper=THREE.MathUtils.lerp(.5,.24,Math.pow(t,.8));const breath=1+Math.sin(time*1.15+t*7)*.018*breathing;const coilCompression=1+tension*.14*Math.sin(t*Math.PI);const wave=lungeWave>=0?1+Math.max(0,Math.sin((t-lungeWave)*Math.PI*2.4))*.16*(1-Math.abs(t-lungeWave)*2):1;const radius=taper*breath*coilCompression*wave*this.identity.size;
      for(let side=0;side<SIDES;side++){const angle=side/SIDES*Math.PI*2,cos=Math.cos(angle),sin=Math.sin(angle),at=(ring*SIDES+side)*3;this.offset.copy(this.normal).multiplyScalar(cos*radius).addScaledVector(this.binormal,sin*radius*.88);positions[at]=this.point.x+this.offset.x;positions[at+1]=this.point.y+this.offset.y;positions[at+2]=this.point.z+this.offset.z;normals[at]=this.offset.x/radius;normals[at+1]=this.offset.y/(radius*.88);normals[at+2]=this.offset.z/radius;}}this.geometry.attributes.position.needsUpdate=true;this.geometry.attributes.normal.needsUpdate=true;}

  alert(amount=1){this.echoAlert=Math.max(this.echoAlert,amount);}
  scheduleEcho(delay,amount=1){this.echoDelay=Math.max(0,delay);this.pendingEcho=Math.max(this.pendingEcho,amount);}
  captureBat(duration=1.05){this.captureTime=duration;this.captureVisual.visible=true;this.capturedAdapter?.restartState('captured');if(this.capturedFactory&&!this.capturedAdapter&&!this.capturedLoading){this.capturedLoading=true;this.capturedFactory().then(adapter=>{if(this.disposed){adapter?.dispose?.();return;}if(adapter&&adapter.ready){this.capturedAdapter=adapter;adapter.root.removeFromParent();this.head.add(adapter.root);adapter.root.position.set(0,-.22,.4);adapter.root.rotation.set(-.5,Math.PI,0);}else adapter?.dispose?.();}).catch(()=>{this.capturedLoading=false;});}}
  getMouthWorldPosition(target=new THREE.Vector3()){return this.head.localToWorld(target.set(0,-.1,.62));}
  getCaptureAttachment(){return this.captureVisual;}
  getBodyBounds(){return this.bodyBounds;}
  getHeatEmitters(){return [this.heatHead,this.heatBody];}
  getEchoResponders(){return [this.echoHead,this.echoBody];}
  getVisualState(){return this.visualState;}
  dispose(){this.disposed=true;this.scene.remove(this.group);this.capturedAdapter?.dispose();this.group.traverse((object)=>{if(object.isMesh){object.geometry.dispose();object.material.dispose();}});}
}
