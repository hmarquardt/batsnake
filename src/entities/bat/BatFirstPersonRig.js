// @ts-check
import * as THREE from 'three';

function boneBetween(from,to,radius,material){const direction=new THREE.Vector3().subVectors(to,from);const length=direction.length();const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius*.72,length,5),material);mesh.position.copy(from).addScaledVector(direction,.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());return mesh;}

/** Procedural first-person bat: anatomical wing fans with arm, fingers, and scalloped membranes. Complete fallback for the hero GLB. */
export class BatFirstPersonRig {
  /** @param {THREE.PerspectiveCamera} camera @param {import('./BatFlightController.js').BatFlightController} controller @param {import('../../core/InputManager.js').InputManager} input @param {import('../../core/EventBus.js').EventBus} events @param {import('../../core/Settings.js').Settings} settings */
  constructor(camera,controller,input,events,settings){this.camera=camera;this.controller=controller;this.input=input;this.events=events;this.settings=settings;this.root=new THREE.Group();this.root.name='First-person bat visual adapter (procedural fallback)';this.root.position.set(0,-.22,-.34);camera.add(this.root);
    const membraneMaterial=new THREE.MeshPhysicalMaterial({color:0x4a2f24,emissive:0x2a150c,emissiveIntensity:.85,roughness:.78,transparent:true,opacity:.9,side:THREE.DoubleSide,transmission:.04,thickness:.03});
    const boneMaterial=new THREE.MeshStandardMaterial({color:0x3d2c22,emissive:0x20120a,emissiveIntensity:.85,roughness:.92});
    this.wings=[];this.fingers=[];
    for(const side of [-1,1]){
      const wing=new THREE.Group();wing.position.set(side*.045,-.02,.02);this.root.add(wing);
      const elbow=new THREE.Vector3(side*.12,-.005,.01),wrist=new THREE.Vector3(side*.22,-.008,.03);
      wing.add(boneBetween(new THREE.Vector3(0,0,0),elbow,.0075,boneMaterial),boneBetween(elbow,wrist,.0055,boneMaterial));
      // Finger structure: three thin digits fanning back from the wrist.
      const tips=[new THREE.Vector3(side*.33,-.012,.14),new THREE.Vector3(side*.37,-.014,-.01),new THREE.Vector3(side*.33,-.014,-.13)];
      const fingerGroups=[];
      for(const tip of tips){const pivot=new THREE.Group();pivot.position.copy(wrist);const digit=boneBetween(new THREE.Vector3(),tip.clone().sub(wrist),.0032,boneMaterial);pivot.add(digit);wing.add(pivot);fingerGroups.push(pivot);}
      this.fingers.push(fingerGroups);
      // Membrane fan from the flank to the full outline with scalloped bays.
      const outline=[elbow,wrist,tips[0],tips[0].clone().lerp(tips[1],.55),tips[1],tips[1].clone().lerp(tips[2],.55),tips[2],new THREE.Vector3(side*.05,-.03,-.16)];
      const positions=[],indices=[];const rows=4,cols=outline.length;
      for(let c=0;c<cols;c++){const anchor=new THREE.Vector3(side*.02,-.04,.06-(.2*c/(cols-1)));for(let r=0;r<=rows;r++){const t=r/rows;positions.push(anchor.x+(outline[c].x-anchor.x)*t,anchor.y+(outline[c].y-anchor.y)*t-Math.sin(t*Math.PI)*.004,anchor.z+(outline[c].z-anchor.z)*t);}}
      for(let c=0;c<cols-1;c++)for(let r=0;r<rows;r++){const a=c*(rows+1)+r,b=a+1,d=a+rows+1,e=d+1;indices.push(a,d,b,b,d,e);}
      const fan=new THREE.BufferGeometry();fan.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));fan.setIndex(indices);fan.computeVertexNormals();
      const membrane=new THREE.Mesh(fan,membraneMaterial);membrane.renderOrder=1;wing.add(membrane);
      this.wings.push(wing);
    }
    // Body hint: a small flank mass below the frame edge plus feet hooks visible in brake.
    const flank=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),boneMaterial);flank.scale.set(1.15,.72,1.5);flank.position.set(0,-.075,.08);this.root.add(flank);
    this.feet=[];for(const side of [-1,1]){const foot=new THREE.Mesh(new THREE.ConeGeometry(.012,.05,5),boneMaterial);foot.position.set(side*.05,-.1,.0);foot.rotation.x=Math.PI*.8;this.root.add(foot);this.feet.push(foot);}
    this.phase=0;this.panic=0;this.collision=0;this.unsubscribe=[events.on('player-collision',()=>{this.collision=1;}),events.on('near-miss',()=>{this.panic=1;})];}
  update(dt){if(!this.root.visible)return;const c=this.controller;const flap=this.input.down('Space')||c.flapTimer>.08,brake=this.input.down('KeyS'),dive=this.input.down('ShiftLeft')||this.input.down('ShiftRight');const speed=c.velocity.length();this.phase+=dt*(flap?15:brake?5:7+speed*.35);this.panic=Math.max(0,this.panic-dt*1.45);this.collision=Math.max(0,this.collision-dt*1.8);
    const stroke=flap?Math.sin(this.phase)*.72:Math.sin(this.phase*.42)*.1;const bank=THREE.MathUtils.clamp(c.bank,-.75,.75);const disrupted=Math.sin(this.phase*2.7)*this.collision*.4+Math.sin(this.phase*2.1)*this.panic*.2;const tuck=this.collision*.55;
    for(let index=0;index<2;index++){const side=index===0?-1:1;const wing=this.wings[index];const asymmetric=bank*side*.3;
      wing.rotation.x=stroke*(flap?1:brake?.45:.2)+disrupted*side+(dive?.3:0)+tuck;
      wing.rotation.y=side*(-.06-(brake?.3:0)+(dive?.34:0))+asymmetric+side*tuck*.5;
      wing.rotation.z=side*(brake?.2:.03)-bank*.15-side*tuck*.4;
      wing.position.y=(brake?-.02:.0)+Math.abs(stroke)*.03-tuck*.05;
      // Finger response: fan wide in brake, sweep together in dive, curl in collision.
      for(let f=0;f<3;f++){const pivot=this.fingers[index][f];pivot.rotation.y=side*((brake?.28:0)-(dive?.18:0))*(f*.5+.5)+side*tuck*.6;pivot.rotation.x=(flap?Math.sin(this.phase-f*.5)*.12:0)+tuck*.5;}
    }
    this.feet.forEach((foot,i)=>{foot.visible=brake||this.collision>.25;foot.rotation.x=Math.PI*(.8+(brake?.35:0));});
    const motion=this.settings.get('reducedCameraMotion') ? .35 : 1;this.root.rotation.z=-bank*.2*motion;this.root.rotation.x=(dive ? .16 : brake ? -.14 : 0)*motion+this.collision*.08*Math.sin(this.phase*3);this.root.position.y=-.22-Math.abs(stroke)*.016*motion;this.root.visible=true;}
  getWingState(){return {left:this.wings[0].rotation,right:this.wings[1].rotation,panic:this.panic,collision:this.collision};}
  dispose(){this.unsubscribe.forEach((unsubscribe)=>unsubscribe());this.camera.remove(this.root);this.root.traverse((object)=>{if(object.isMesh){object.geometry.dispose();object.material.dispose();}});}
}
