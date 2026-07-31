// @ts-check
import * as THREE from 'three';

const seeded = (index) => { const value = Math.sin(index * 91.733 + 3.17) * 43758.5453; return value - Math.floor(value); };

export class CaveGenerator {
  /** @param {THREE.Scene} scene @param {import('./CaveMaterials.js').CaveMaterials} materials */
  constructor(scene, materials) { this.scene = scene; this.materials = materials; this.group = new THREE.Group(); this.group.name = 'Art-directed cave chamber'; scene.add(this.group); /** @type {{center:THREE.Vector3,radius:number,label:string}[]} */ this.obstacles = []; /** @type {import('./SpatialQuerySystem.js').SpatialFeature[]} */ this.spatialFeatures = []; /** @type {THREE.Vector3[]} */ this.echoLandmarks = []; }

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
      const noise = Math.sin(x * .47 + z * .18) * .34 + Math.sin(y * .83 - z * .29) * .2;
      const radial = new THREE.Vector2(x - path.getPoint(Math.max(0, Math.min(1, (z + 54) / 106))).x, y - 4).normalize();
      positions.setXYZ(index, x + radial.x * noise, y + radial.y * noise, z);
      const stain = THREE.MathUtils.clamp(.22 + (y < -2 ? .05 : 0) + noise * .06, .08, .34);
      colors.push(stain * .72, stain, stain * .86);
    }
    tunnel.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); tunnel.computeVertexNormals();
    const shell = new THREE.Mesh(tunnel, this.materials.rock); shell.receiveShadow = true; shell.name = 'Limestone chamber shell'; this.group.add(shell);
    const echoShell = new THREE.Mesh(tunnel, this.materials.echo); echoShell.renderOrder = 3; echoShell.name = 'Echolocation surface response'; this.group.add(echoShell);

    this.addRockClusters(); this.addFormations(); this.addEntrance(); this.addRoost();
    return { path, obstacles: this.obstacles, spatialFeatures: this.spatialFeatures, echoLandmarks: this.echoLandmarks };
  }

  addRockClusters() {
    const geometry = new THREE.IcosahedronGeometry(1, 2); const count = 72;
    const rocks = new THREE.InstancedMesh(geometry, this.materials.formation, count); const echoRocks = new THREE.InstancedMesh(geometry, this.materials.echo, count); rocks.castShadow = true; rocks.receiveShadow = true; echoRocks.renderOrder = 3;
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
    const cone = new THREE.ConeGeometry(1, 1, 9, 4); cone.translate(0, -.5, 0);
    const count = 46; const spikes = new THREE.InstancedMesh(cone, this.materials.wet, count); const echoSpikes = new THREE.InstancedMesh(cone,this.materials.echo,count); spikes.castShadow = true; echoSpikes.renderOrder=3;
    const matrix = new THREE.Matrix4(), quaternion = new THREE.Quaternion(), scale = new THREE.Vector3(), position = new THREE.Vector3();
    for (let i = 0; i < count; i += 1) {
      const ceiling = i < 31; const z = -47 + seeded(i + 33) * 92; const x = (seeded(i + 46) - .5) * 17;
      position.set(x, ceiling ? 15 - seeded(i+5)*2 : -8.3, z); scale.set(.35+seeded(i+4)*1.25, 2.2+seeded(i+9)*6.2, .35+seeded(i+12)*1.25);
      quaternion.setFromEuler(new THREE.Euler(ceiling ? 0 : Math.PI, 0, (seeded(i+2)-.5)*.24)); matrix.compose(position,quaternion,scale); spikes.setMatrixAt(i,matrix); echoSpikes.setMatrixAt(i,matrix);
      if (i % 5 === 0) this.echoLandmarks.push(position.clone());
      if (ceiling && i % 7 === 0 && z > -42 && z < 42) {
        const center=position.clone();center.y-=scale.y*.52;
        const radius=.42+Math.max(scale.x,scale.z)*.62;
        this.obstacles.push({center:center.clone(),radius,label:'major stalactite'});
        this.spatialFeatures.push({id:`stalactite-${i}`,kind:'stalactite',center,radius,reflectivity:.86});
      }
    }
    this.group.add(spikes,echoSpikes);

    const columns = [new THREE.Vector3(-6,-2,-18),new THREE.Vector3(7,-1,7),new THREE.Vector3(-7,0,29)];
    columns.forEach((center, i) => {
      const geometry = new THREE.CylinderGeometry(2.1+i*.25,2.8+i*.25,19,10,5); const column = new THREE.Mesh(geometry,this.materials.formation); const echoColumn=new THREE.Mesh(geometry,this.materials.echo); column.position.copy(center); echoColumn.position.copy(center); column.rotation.z=(i-1)*.08; echoColumn.rotation.copy(column.rotation); column.castShadow=true; column.receiveShadow=true; echoColumn.renderOrder=3; this.group.add(column,echoColumn);
      this.obstacles.push({center:center.clone(),radius:3.4,label:'rock column'}); this.spatialFeatures.push({id:`column-${i}`,kind:'column',center:center.clone(),radius:3.4,reflectivity:.94}); this.echoLandmarks.push(center.clone().setY(3));
    });
    const shelfGeometry=new THREE.IcosahedronGeometry(4.8,2);const shelf = new THREE.Mesh(shelfGeometry,this.materials.formation);const echoShelf=new THREE.Mesh(shelfGeometry,this.materials.echo); shelf.scale.set(1.6,.65,2.3);echoShelf.scale.copy(shelf.scale); shelf.position.set(5,8,-32);echoShelf.position.copy(shelf.position); shelf.rotation.set(.2,.3,-.15);echoShelf.rotation.copy(shelf.rotation); shelf.castShadow=true;echoShelf.renderOrder=3; this.group.add(shelf,echoShelf); this.obstacles.push({center:shelf.position.clone(),radius:4.6,label:'hanging shelf'});this.spatialFeatures.push({id:'hanging-shelf',kind:'shelf',center:shelf.position.clone(),radius:4.6,reflectivity:.78});
    this.addMineralStreaks();
  }

  addEntrance() {
    const glowMaterial=new THREE.ShaderMaterial({uniforms:{strength:{value:.16}},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float strength;varying vec2 vUv;void main(){float d=length((vUv-.5)*2.);float halo=1.-smoothstep(.12,1.,d);float core=1.-smoothstep(0.,.38,d);gl_FragColor=vec4(vec3(.55,.76,.74)+core*.18,halo*strength+core*strength*.44);}'});
    const glow = new THREE.Mesh(new THREE.CircleGeometry(6.7,48),glowMaterial); glow.position.set(0,7,52); glow.rotation.y=Math.PI; this.group.add(glow);
    for(let i=0;i<3;i++){const hazeMaterial=glowMaterial.clone();hazeMaterial.uniforms.strength.value=.022+i*.008;const haze=new THREE.Mesh(new THREE.CircleGeometry(1,32),hazeMaterial);haze.position.set((seeded(i+204)-.5)*2.4,5.8+i*.65,44+i*2.1);haze.scale.set(7-i*.6,5.4-i*.45,1);this.group.add(haze);}
    const vegetation=new THREE.Group();const leafMaterial=new THREE.MeshBasicMaterial({color:0x030706,side:THREE.DoubleSide});for(let i=0;i<13;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.35+seeded(i+240)*.45,2+seeded(i+250)*2.4,5),leafMaterial);leaf.position.set((seeded(i+260)-.5)*12,-1+seeded(i+270)*10,51.3);leaf.rotation.z=(seeded(i+280)-.5)*1.2;leaf.rotation.x=Math.PI*.5;vegetation.add(leaf);}this.group.add(vegetation);
    this.echoLandmarks.push(new THREE.Vector3(0,7,49));
    this.spatialFeatures.push({id:'mouth',kind:'mouth',center:new THREE.Vector3(0,7,49),radius:5.8,reflectivity:.82});
  }

  addRoost() {
    const patches = new THREE.Group();
    for (let i=0;i<12;i+=1){const patch=new THREE.Mesh(new THREE.CircleGeometry(1.2+seeded(i)*2,12),this.materials.guano);patch.rotation.x=-Math.PI/2;patch.position.set((seeded(i+11)-.5)*13,-8.05,-43+seeded(i+7)*31);patches.add(patch);} this.group.add(patches);
  }

  addMineralStreaks(){const material=this.materials.mineral;for(let i=0;i<18;i++){const length=1.2+seeded(i+310)*4.5;const streak=new THREE.Mesh(new THREE.PlaneGeometry(.025+seeded(i+320)*.08,length),material);const side=seeded(i+330)>.5?1:-1;streak.position.set(side*(10.4+seeded(i+340)),2+seeded(i+350)*9,-42+seeded(i+360)*82);streak.rotation.y=side>0?-Math.PI/2:Math.PI/2;streak.rotation.z=(seeded(i+370)-.5)*.12;this.group.add(streak);}}
}
