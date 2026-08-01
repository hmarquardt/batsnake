// @ts-check
import * as THREE from 'three';
import { SNAKE_ANCHORS } from './NavigationVolumes.js';

const seeded = (index) => { const value = Math.sin(index * 91.733 + 3.17) * 43758.5453; return value - Math.floor(value); };

const _v = new THREE.Vector3();
const _n = new THREE.Vector3();

/** Deterministic per-vertex silhouette displacement along normals (visual only; never used by collision). */
function displace(geometry, amount, frequency, seed = 0) {
  const pos = geometry.attributes.position, nor = geometry.attributes.normal;
  for (let i = 0; i < pos.count; i += 1) {
    _v.fromBufferAttribute(pos, i); _n.fromBufferAttribute(nor, i);
    const broad = Math.sin(_v.x * frequency + seed * 1.7) * Math.cos(_v.y * frequency * .83 + seed * 2.3) * Math.sin(_v.z * frequency * 1.13 + seed * 3.1);
    const fine = Math.sin(_v.x * frequency * 2.7 + seed) * Math.sin(_v.z * frequency * 2.3 + seed * 1.3) * .5;
    _v.addScaledVector(_n, (broad + fine) * amount);
    pos.setXYZ(i, _v.x, _v.y, _v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Per-draw acoustic fill: formations favor contours, broad walls retain surface memory. */
function echoCharacter(mesh,materials,fill,surfaceOffset=.015){mesh.onBeforeRender=()=>{materials.echoUniforms.geometryFill.value=fill;materials.echoUniforms.surfaceOffset.value=surfaceOffset;};return mesh;}

export class CaveGenerator {
  /** @param {THREE.Scene} scene @param {import('./CaveMaterials.js').CaveMaterials} materials */
  constructor(scene, materials) { this.scene = scene; this.materials = materials; this.group = new THREE.Group(); this.group.name = 'Art-directed cave chamber'; scene.add(this.group); /** @type {{center:THREE.Vector3,radius:number,label:string}[]} */ this.obstacles = []; /** @type {import('./SpatialQuerySystem.js').SpatialFeature[]} */ this.spatialFeatures = []; /** @type {THREE.Vector3[]} */ this.echoLandmarks = []; /** @type {THREE.ShaderMaterial[]} */ this.thermalFadeMaterials = []; }

  build() {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3, 2, -54), new THREE.Vector3(1, 3, -35), new THREE.Vector3(-4, 5, -15),
      new THREE.Vector3(3, 4, 8), new THREE.Vector3(-2, 6, 27), new THREE.Vector3(0, 7, 52),
    ]);
    const tunnel = new THREE.TubeGeometry(path, 128, 13.5, 24, false);
    const positions = tunnel.attributes.position;
    const colors = [];
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index), y = positions.getY(index), z = positions.getZ(index);
      const noise = Math.sin(x * .47 + z * .18) * .34 + Math.sin(y * .83 - z * .29) * .2 + Math.sin(x * 1.9 + y * 1.3 + z * .7) * .1;
      const radial = new THREE.Vector2(x - path.getPoint(Math.max(0, Math.min(1, (z + 54) / 106))).x, y - 4).normalize();
      positions.setXYZ(index, x + radial.x * noise, y + radial.y * noise, z);
      // Wet/dry zoning: lower surfaces and drip-slope noise run darker and wetter, upper vault stays dry pale.
      const hash = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; const slope = (hash - Math.floor(hash)) * .5 + (Math.sin(x * .53 + z * .21) * .5 + .5) * .5;
      const wet = THREE.MathUtils.clamp((3.5 - y) * .045, 0, .16) + slope * .035;
      const stain = THREE.MathUtils.clamp(.44 + (y < -2 ? .04 : 0) + noise * .08 - wet * .16, .24, .62);
      colors.push(stain * .72, stain, stain * .86);
    }
    tunnel.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));tunnel.computeVertexNormals();
    const shell = new THREE.Mesh(tunnel, this.materials.rock); shell.receiveShadow = true; shell.name = 'Limestone chamber shell'; this.group.add(shell);
    const echoShell = echoCharacter(new THREE.Mesh(tunnel, this.materials.echo),this.materials,.55,-.045); echoShell.renderOrder = 3; echoShell.name = 'Echolocation surface response'; this.group.add(echoShell);

    this.addRockClusters(); this.addFormations(); this.addEntrance(); this.addRoost(); this.addAmbushIdentity();
    return { path, obstacles: this.obstacles, spatialFeatures: this.spatialFeatures, echoLandmarks: this.echoLandmarks };
  }

  addRockClusters() {
    const geometry = displace(new THREE.IcosahedronGeometry(1, 2), .2, 2.1, 1.3); const count = 72;
    const rocks = new THREE.InstancedMesh(geometry, this.materials.formation, count); const echoRocks = echoCharacter(new THREE.InstancedMesh(geometry, this.materials.echo, count),this.materials,.3); rocks.castShadow = true; rocks.receiveShadow = true; echoRocks.renderOrder = 3;
    const matrix = new THREE.Matrix4(), quaternion = new THREE.Quaternion(), scale = new THREE.Vector3(), position = new THREE.Vector3();
    for (let i = 0; i < count; i += 1) {
      const z = -49 + seeded(i) * 96; const side = seeded(i + 90) > .5 ? 1 : -1;
      position.set(side * (10.7 + seeded(i + 4) * 2.1), -1 + seeded(i + 7) * 11, z);
      scale.set(2.1 + seeded(i + 11) * 3.8, 1.6 + seeded(i + 18) * 4.2, 2.2 + seeded(i + 27) * 5.2);
      quaternion.setFromEuler(new THREE.Euler(seeded(i+2)*3,seeded(i+3)*3,seeded(i+5)*3)); matrix.compose(position, quaternion, scale); rocks.setMatrixAt(i, matrix); echoRocks.setMatrixAt(i, matrix);
      if (i % 4 === 0) this.echoLandmarks.push(position.clone());
    }
    this.group.add(rocks,echoRocks);
  }

  addFormations() {
    const count = 46,batchCounts=[16,15,15],cones=[
      displace(new THREE.ConeGeometry(1,1,9,4),.13,2.2,4.1),
      displace(new THREE.ConeGeometry(1,1,11,5),.1,2.9,8.3),
      displace(new THREE.ConeGeometry(1,1,13,6),.08,3.6,12.7),
    ];cones.forEach(cone=>cone.translate(0,-.5,0));
    const spikes=cones.map((cone,index)=>{const mesh=new THREE.InstancedMesh(cone,this.materials.wet,batchCounts[index]);mesh.castShadow=true;mesh.name=`Wet formation profile ${index+1}`;return mesh;}),echoSpikes=cones.map((cone,index)=>{const mesh=echoCharacter(new THREE.InstancedMesh(cone,this.materials.echo,batchCounts[index]),this.materials,[.06,.1,.075][index]);mesh.renderOrder=3;mesh.name=`Echo formation profile ${index+1}`;return mesh;}),batchCursor=[0,0,0];
    const matrix = new THREE.Matrix4(), quaternion = new THREE.Quaternion(), scale = new THREE.Vector3(), visualScale=new THREE.Vector3(), position = new THREE.Vector3();
    for (let i = 0; i < count; i += 1) {
      const ceiling = i < 31; const z = -47 + seeded(i + 33) * 92; const x = (seeded(i + 46) - .5) * 17;
      position.set(x, ceiling ? 15 - seeded(i+5)*2 : -8.3, z); scale.set(.35+seeded(i+4)*1.25, 2.2+seeded(i+9)*6.2, .35+seeded(i+12)*1.25);
      quaternion.setFromEuler(new THREE.Euler(ceiling?(seeded(i+67)-.5)*.08:Math.PI+(seeded(i+67)-.5)*.08,seeded(i+73)*Math.PI*2,(seeded(i+2)-.5)*.24));visualScale.copy(scale);if(i%7!==0){const landmark=i%5===0;visualScale.x*=landmark?.48:.16;visualScale.z*=landmark?.48:.16;visualScale.y*=landmark?.62:.26;}matrix.compose(position,quaternion,visualScale);const batch=i%3,slot=batchCursor[batch]++;spikes[batch].setMatrixAt(slot,matrix);echoSpikes[batch].setMatrixAt(slot,matrix);
      if (i % 5 === 0) this.echoLandmarks.push(position.clone());
      if (ceiling && i % 7 === 0 && z > -42 && z < 42) {
        const center=position.clone();center.y-=scale.y*.52;
        const radius=.42+Math.max(scale.x,scale.z)*.62;
        this.obstacles.push({center:center.clone(),radius,label:'major stalactite'});
        this.spatialFeatures.push({id:`stalactite-${i}`,kind:'stalactite',center,radius,reflectivity:.86});
      }
    }
    [...spikes,...echoSpikes].forEach(mesh=>{mesh.instanceMatrix.needsUpdate=true;this.group.add(mesh);});

    const columns = [new THREE.Vector3(-6,-2,-18),new THREE.Vector3(7,-1,7),new THREE.Vector3(-7,0,29)];
    columns.forEach((center, i) => {
      const geometry = displace(new THREE.CylinderGeometry(2.1+i*.25,2.8+i*.25,19,14,6), .34, .55, i * 2.7 + 1); const column = new THREE.Mesh(geometry,this.materials.formation); const echoColumn=echoCharacter(new THREE.Mesh(geometry,this.materials.echo),this.materials,.38); column.position.copy(center); echoColumn.position.copy(center); column.rotation.z=(i-1)*.08; echoColumn.rotation.copy(column.rotation); column.castShadow=true; column.receiveShadow=true; echoColumn.renderOrder=3; this.group.add(column,echoColumn);
      this.obstacles.push({center:center.clone(),radius:3.4,label:'rock column'}); this.spatialFeatures.push({id:`column-${i}`,kind:'column',center:center.clone(),radius:3.4,reflectivity:.94}); this.echoLandmarks.push(center.clone().setY(3));
    });
    const shelfGeometry=displace(new THREE.IcosahedronGeometry(4.8,3),.55,1.4,7.7);const shelf = new THREE.Mesh(shelfGeometry,this.materials.formation);const echoShelf=echoCharacter(new THREE.Mesh(shelfGeometry,this.materials.echo),this.materials,.4); shelf.scale.set(1.6,.65,2.3);echoShelf.scale.copy(shelf.scale); shelf.position.set(5,8,-32);echoShelf.position.copy(shelf.position); shelf.rotation.set(.2,.3,-.15);echoShelf.rotation.copy(shelf.rotation); shelf.castShadow=true;echoShelf.renderOrder=3; this.group.add(shelf,echoShelf); this.obstacles.push({center:shelf.position.clone(),radius:4.6,label:'hanging shelf'});this.spatialFeatures.push({id:'hanging-shelf',kind:'shelf',center:shelf.position.clone(),radius:4.6,reflectivity:.78});
    this.addMineralStreaks();
  }

  addEntrance() {
    // Humid exterior depth: a cool sky gradient sits behind the feathered moon glow.
    const skyMaterial=new THREE.ShaderMaterial({uniforms:{strength:{value:.5},cool:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float strength;uniform float cool;varying vec2 vUv;void main(){float d=length((vUv-.5)*2.);vec3 top=mix(vec3(.16,.3,.3),vec3(.05,.1,.1),cool);vec3 low=mix(vec3(.03,.07,.06),vec3(.01,.02,.02),cool);vec3 col=mix(low,top,smoothstep(.1,.95,vUv.y));col+=vec3(.1,.16,.15)*(1.-cool*.7)*pow(max(0.,1.-d),2.);gl_FragColor=vec4(col,strength*(1.-smoothstep(.75,1.,d)));}'});
    const sky=new THREE.Mesh(new THREE.CircleGeometry(9.2,48),skyMaterial);sky.position.set(0,7.5,53.2);sky.rotation.y=Math.PI;this.group.add(sky);this.thermalFadeMaterials.push(skyMaterial);
    const glowMaterial=new THREE.ShaderMaterial({uniforms:{strength:{value:.13}},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float strength;varying vec2 vUv;void main(){float d=length((vUv-.5)*2.);float halo=1.-smoothstep(.12,1.,d);float core=1.-smoothstep(0.,.38,d);gl_FragColor=vec4(vec3(.5,.72,.7)+core*.16,halo*strength+core*strength*.4);}'});
    glowMaterial.userData.baseStrength=.13;
    const glow = new THREE.Mesh(new THREE.CircleGeometry(6.7,48),glowMaterial); glow.position.set(0,7,52); glow.rotation.y=Math.PI; this.group.add(glow); this.thermalFadeMaterials.push(glowMaterial);
    for(let i=0;i<3;i++){const hazeMaterial=glowMaterial.clone();hazeMaterial.uniforms.strength.value=.02+i*.007;hazeMaterial.userData.baseStrength=.02+i*.007;const haze=new THREE.Mesh(new THREE.CircleGeometry(1,32),hazeMaterial);haze.position.set((seeded(i+204)-.5)*2.4,5.8+i*.65,44+i*2.1);haze.scale.set(7-i*.6,5.4-i*.45,1);this.group.add(haze);this.thermalFadeMaterials.push(hazeMaterial);}
    // Vegetation: clustered dark leaf silhouettes framing the mouth, clear of the flight lane.
    const leafGeometry=new THREE.PlaneGeometry(1,1),leafTransforms=[];
    for(let c=0;c<9;c++){const cx=-7.5+seeded(c+260)*15,cy=2.8+seeded(c+270)*9.5;if(Math.abs(cx)<2.2&&cy<7)continue;for(let p=0;p<3;p++){const size=1.6+seeded(c*7+p+280)*2.1;leafTransforms.push({position:new THREE.Vector3(cx+(seeded(c+p+290)-.5)*1.4,cy+(seeded(c+p+300)-.5)*1.2,51.2+seeded(c+p+310)*.5),rotation:new THREE.Euler((seeded(c+p+330)-.5)*.7,seeded(c+p+340)*Math.PI,(seeded(c+p+350)-.5)*.9),scale:new THREE.Vector3(size,size*(1.3+seeded(c+p+320)*.8),1)});}}
    const vegetation=new THREE.InstancedMesh(leafGeometry,this.materials.vegetation,leafTransforms.length),leafMatrix=new THREE.Matrix4(),leafQuaternion=new THREE.Quaternion();leafTransforms.forEach((transform,index)=>{leafQuaternion.setFromEuler(transform.rotation);leafMatrix.compose(transform.position,leafQuaternion,transform.scale);vegetation.setMatrixAt(index,leafMatrix);});vegetation.instanceMatrix.needsUpdate=true;vegetation.name='Entrance vegetation silhouettes';this.group.add(vegetation);
    this.echoLandmarks.push(new THREE.Vector3(0,7,49));
    this.spatialFeatures.push({id:'mouth',kind:'mouth',center:new THREE.Vector3(0,7,49),radius:5.8,reflectivity:.82});
  }

  addRoost() {
    // Soft guano beds accumulated under the roost and hunting posts instead of hard-edged circles.
    const beds=[],bed=(x,z,scale)=>beds.push({x,z,scale,rotation:seeded(x+z)*Math.PI});
    for (let i=0;i<16;i+=1) bed((seeded(i+11)-.5)*13,-43+seeded(i+7)*31,2.4+seeded(i)*3.4);
    for (const anchor of SNAKE_ANCHORS) for (let i=0;i<3;i+=1) bed(anchor.position.x+(seeded(anchor.position.z+i)-.5)*4,anchor.position.z+(seeded(anchor.position.z+i+3)-.5)*4,1.6+seeded(i+anchor.position.z)*1.8);
    const patches=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),this.materials.guano,beds.length),matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),scale=new THREE.Vector3();beds.forEach((item,index)=>{quaternion.setFromEuler(new THREE.Euler(-Math.PI/2,0,item.rotation));scale.setScalar(item.scale);matrix.compose(new THREE.Vector3(item.x,-8.02,item.z),quaternion,scale);patches.setMatrixAt(index,matrix);});patches.instanceMatrix.needsUpdate=true;patches.renderOrder=1;patches.name='Guano and roost residue beds';this.group.add(patches);
  }

  addMineralStreaks(){const makeBatch=(count,material,offset,lengthBase,lengthRange,widthBase,widthRange,yBase,yRange,zBase,zRange)=>{const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,count),matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),scale=new THREE.Vector3();for(let i=0;i<count;i++){const side=seeded(i+offset+20)>.5?1:-1,length=lengthBase+seeded(i+offset)*lengthRange,width=widthBase+seeded(i+offset+10)*widthRange;quaternion.setFromEuler(new THREE.Euler(0,side>0?-Math.PI/2:Math.PI/2,(seeded(i+offset+60)-.5)*.16));scale.set(width,length,1);matrix.compose(new THREE.Vector3(side*(10.3+seeded(i+offset+30)),yBase+seeded(i+offset+40)*yRange,zBase+seeded(i+offset+50)*zRange),quaternion,scale);mesh.setMatrixAt(i,matrix);}mesh.instanceMatrix.needsUpdate=true;return mesh;};const calcite=makeBatch(18,this.materials.mineral,310,1.2,4.5,.025,.08,2,9,-42,82),iron=makeBatch(12,this.materials.iron,410,.8,2.6,.05,.16,-3,6,-44,86);calcite.name='Calcite runoff';iron.name='Iron and manganese staining';this.group.add(calcite,iron);}

  addAmbushIdentity() {
    // Anchor ledges: every boa visibly hangs from displaced ceiling rock.
    for (const anchor of SNAKE_ANCHORS) {
      const ledge = new THREE.Mesh(displace(new THREE.IcosahedronGeometry(1.5, 2), .3, 1.9, anchor.position.z * .7), this.materials.formation);
      ledge.position.copy(anchor.position).add(new THREE.Vector3(0, 1.15, 0)); ledge.scale.set(1.6, .75, 1.5); ledge.castShadow = true; this.group.add(ledge);
    }
    // The Narrows: a curtain of thin close stalactites tightens the lane.
    const curtain = displace(new THREE.ConeGeometry(1, 1, 9, 4), .08, 3.1, 9.4); curtain.translate(0, -.5, 0);const curtainMesh=new THREE.InstancedMesh(curtain,this.materials.wet,7),curtainMatrix=new THREE.Matrix4(),curtainScale=new THREE.Vector3();
    for (let i = 0; i < 7; i += 1) {curtainScale.set(.22 + seeded(i + 519) * .3, 3.4 + seeded(i + 525) * 3.4, .22 + seeded(i + 531) * .3);curtainMatrix.compose(new THREE.Vector3(-8.2 + seeded(i + 501) * 7.2,14.6 - seeded(i + 507) * 1.2,-29 + seeded(i + 513) * 8),new THREE.Quaternion(),curtainScale);curtainMesh.setMatrixAt(i,curtainMatrix);}curtainMesh.instanceMatrix.needsUpdate=true;curtainMesh.castShadow=true;curtainMesh.name='Narrows stalactite curtain';this.group.add(curtainMesh);
    // The Column: pale calcite deposits ring the hunting column.
    for (let i = 0; i < 9; i += 1) { const angle = i / 9 * Math.PI * 2; const deposit = new THREE.Mesh(new THREE.PlaneGeometry(.12 + seeded(i + 540) * .2, .9 + seeded(i + 546) * 1.8), this.materials.mineral); deposit.position.set(7 + Math.cos(angle) * 2.55, 1 + seeded(i + 552) * 8 - 4, 7 + Math.sin(angle) * 2.55); deposit.lookAt(7, deposit.position.y, 7); deposit.rotateY(Math.PI); this.group.add(deposit); }
    // Moon Run: warmer spill and residue announce the final hunting ground.
    const spillMaterial = new THREE.ShaderMaterial({uniforms:{strength:{value:.045}},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float strength;varying vec2 vUv;void main(){float d=length((vUv-.5)*2.);gl_FragColor=vec4(vec3(.42,.62,.58),(1.-smoothstep(.05,1.,d))*strength);}'});
    spillMaterial.userData.baseStrength=.045;
    const spill = new THREE.Mesh(new THREE.CircleGeometry(7, 32), spillMaterial); spill.position.set(-1, 8, 36); spill.rotation.y = Math.PI; this.group.add(spill); this.thermalFadeMaterials.push(spillMaterial);
  }

  /** @param {number} blend 0 normal vision, 1 thermal perception */
  setThermalBlend(blend){for(const material of this.thermalFadeMaterials){if(material.uniforms.strength)material.uniforms.strength.value=(material.userData.baseStrength??.1)*(1-blend*.68);if(material.uniforms.cool)material.uniforms.cool.value=blend;}}
}
