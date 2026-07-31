// @ts-check
import * as THREE from 'three';

const seeded = (index) => { const value = Math.sin(index * 91.733 + 3.17) * 43758.5453; return value - Math.floor(value); };

export class CaveGenerator {
  /** @param {THREE.Scene} scene @param {import('./CaveMaterials.js').CaveMaterials} materials */
  constructor(scene, materials) { this.scene = scene; this.materials = materials; this.group = new THREE.Group(); this.group.name = 'Art-directed cave chamber'; scene.add(this.group); /** @type {{center:THREE.Vector3,radius:number,label:string}[]} */ this.obstacles = []; /** @type {THREE.Vector3[]} */ this.echoLandmarks = []; }

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
    return { path, obstacles: this.obstacles, echoLandmarks: this.echoLandmarks };
  }

  addRockClusters() {
    const geometry = new THREE.IcosahedronGeometry(1, 2); const count = 72;
    const rocks = new THREE.InstancedMesh(geometry, this.materials.formation, count); rocks.castShadow = true; rocks.receiveShadow = true;
    const matrix = new THREE.Matrix4(), quaternion = new THREE.Quaternion(), scale = new THREE.Vector3(), position = new THREE.Vector3();
    for (let i = 0; i < count; i += 1) {
      const z = -49 + seeded(i) * 96; const side = seeded(i + 90) > .5 ? 1 : -1;
      position.set(side * (10.7 + seeded(i + 4) * 2.1), -1 + seeded(i + 7) * 11, z);
      scale.set(2.1 + seeded(i + 11) * 3.8, 1.6 + seeded(i + 18) * 4.2, 2.2 + seeded(i + 27) * 5.2);
      quaternion.setFromEuler(new THREE.Euler(seeded(i+2)*3,seeded(i+3)*3,seeded(i+5)*3)); matrix.compose(position, quaternion, scale); rocks.setMatrixAt(i, matrix);
      if (i % 4 === 0) this.echoLandmarks.push(position.clone());
    }
    this.group.add(rocks);
  }

  addFormations() {
    const cone = new THREE.ConeGeometry(1, 1, 9, 4); cone.translate(0, -.5, 0);
    const count = 46; const spikes = new THREE.InstancedMesh(cone, this.materials.wet, count); spikes.castShadow = true;
    const matrix = new THREE.Matrix4(), quaternion = new THREE.Quaternion(), scale = new THREE.Vector3(), position = new THREE.Vector3();
    for (let i = 0; i < count; i += 1) {
      const ceiling = i < 31; const z = -47 + seeded(i + 33) * 92; const x = (seeded(i + 46) - .5) * 17;
      position.set(x, ceiling ? 15 - seeded(i+5)*2 : -8.3, z); scale.set(.35+seeded(i+4)*1.25, 2.2+seeded(i+9)*6.2, .35+seeded(i+12)*1.25);
      quaternion.setFromEuler(new THREE.Euler(ceiling ? 0 : Math.PI, 0, (seeded(i+2)-.5)*.24)); matrix.compose(position,quaternion,scale); spikes.setMatrixAt(i,matrix);
      if (i % 5 === 0) this.echoLandmarks.push(position.clone());
    }
    this.group.add(spikes);

    const columns = [new THREE.Vector3(-6,-2,-18),new THREE.Vector3(7,-1,7),new THREE.Vector3(-7,0,29)];
    columns.forEach((center, i) => {
      const geometry = new THREE.CylinderGeometry(2.1+i*.25,2.8+i*.25,19,10,5); const column = new THREE.Mesh(geometry,this.materials.formation); column.position.copy(center); column.rotation.z=(i-1)*.08; column.castShadow=true; column.receiveShadow=true; this.group.add(column);
      this.obstacles.push({center:center.clone(),radius:3.4,label:'rock column'}); this.echoLandmarks.push(center.clone().setY(3));
    });
    const shelf = new THREE.Mesh(new THREE.IcosahedronGeometry(4.8,1),this.materials.formation); shelf.scale.set(1.6,.65,2.3); shelf.position.set(5,8,-32); shelf.rotation.set(.2,.3,-.15); shelf.castShadow=true; this.group.add(shelf); this.obstacles.push({center:shelf.position.clone(),radius:4.6,label:'hanging shelf'});
  }

  addEntrance() {
    const glow = new THREE.Mesh(new THREE.CircleGeometry(6.7,32),new THREE.MeshBasicMaterial({color:0x9fc8c7,transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false})); glow.position.set(0,7,52); glow.rotation.y=Math.PI; this.group.add(glow);
    const haze = new THREE.Sprite(new THREE.SpriteMaterial({color:0xb7dad7,transparent:true,opacity:.18,depthWrite:false})); haze.position.set(0,7,48); haze.scale.set(18,18,1); this.group.add(haze);
    this.echoLandmarks.push(new THREE.Vector3(0,7,49));
  }

  addRoost() {
    const patches = new THREE.Group();
    for (let i=0;i<12;i+=1){const patch=new THREE.Mesh(new THREE.CircleGeometry(1.2+seeded(i)*2,12),this.materials.guano);patch.rotation.x=-Math.PI/2;patch.position.set((seeded(i+11)-.5)*13,-8.05,-43+seeded(i+7)*31);patches.add(patch);} this.group.add(patches);
  }
}
