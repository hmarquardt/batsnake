// @ts-check
import * as THREE from 'three';

const seededNoise = (x, y) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

function limestoneTexture(size = 128, roughness = false) {
  const channels = 4;
  const data = new Uint8Array(size * size * channels);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const broad = Math.sin(x * .09) * .13 + Math.sin((x + y) * .045) * .1;
      const pores = seededNoise(x >> 1, y >> 1) * .42 + seededNoise(x, y) * .18;
      const streak = Math.pow(Math.max(0, Math.sin(x * .055 + seededNoise(y, 4) * 2)), 7) * .24;
      const value = THREE.MathUtils.clamp((roughness ? .67 : .31) + broad + pores * .22 - streak, .08, .94);
      const index = (y * size + x) * channels;
      if (roughness) data[index] = data[index + 1] = data[index + 2] = Math.round(value * 255);
      else {
        data[index] = Math.round(value * 64);
        data[index + 1] = Math.round(value * 78);
        data[index + 2] = Math.round(value * 70);
      }
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 18);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  if (!roughness) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class CaveMaterials {
  constructor() {
    this.limestoneMap = limestoneTexture();
    this.roughnessMap = limestoneTexture(128, true);
    this.rock = new THREE.MeshStandardMaterial({ color: 0x59645d, map: this.limestoneMap, bumpMap: this.roughnessMap, bumpScale: .18, roughness: .86, roughnessMap: this.roughnessMap, metalness: 0.01, side: THREE.BackSide, vertexColors: true });
    this.formation = new THREE.MeshStandardMaterial({ color: 0x58625b, map: this.limestoneMap, bumpMap: this.roughnessMap, bumpScale: .15, roughness: 0.78, roughnessMap: this.roughnessMap, metalness: 0.02 });
    this.wet = new THREE.MeshPhysicalMaterial({ color: 0x45544d, map: this.limestoneMap, bumpMap: this.roughnessMap, bumpScale: .11, roughness: 0.3, roughnessMap: this.roughnessMap, metalness: 0.02, clearcoat: 0.4, clearcoatRoughness: 0.25 });
    this.guano = new THREE.MeshStandardMaterial({ color: 0x241c14, roughness: 1 });
    this.mineral = new THREE.MeshBasicMaterial({color:0xa5aa94,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    this.normalColors={rock:new THREE.Color(0x59645d),formation:new THREE.Color(0x58625b),wet:new THREE.Color(0x45544d),mineral:new THREE.Color(0xa5aa94)};
    this.thermalColors={rock:new THREE.Color(0x080a09),formation:new THREE.Color(0x090b0a),wet:new THREE.Color(0x111813),mineral:new THREE.Color(0x23322b)};

    this.echoUniforms = {
      pulseOrigins: { value: Array.from({ length: 3 }, () => new THREE.Vector3(0, -999, 0)) },
      pulseAges: { value: new Float32Array([-100, -100, -100]) },
      pulseCount: { value: 1 },
      pulseRange: { value: 34 },
      waveSpeed: { value: 21.5 },
      memoryDecay: { value: 1.7 },
      pulseIntensity: { value: 0 },
      surfaceDetail: { value: .75 },
    };
    this.echo = new THREE.ShaderMaterial({
      uniforms: this.echoUniforms,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec3 vWorld;
        varying vec3 vNormalW;
        void main(){
          vec4 localPosition=vec4(position,1.0);
          #ifdef USE_INSTANCING
            localPosition=instanceMatrix*localPosition;
          #endif
          vec4 worldPosition=modelMatrix*localPosition;
          vWorld=worldPosition.xyz;
          vNormalW=normalize(mat3(modelMatrix)*normal);
          gl_Position=projectionMatrix*viewMatrix*worldPosition;
        }`,
      fragmentShader: `
        uniform vec3 pulseOrigins[3];
        uniform float pulseAges[3];
        uniform int pulseCount;
        uniform float pulseRange;
        uniform float waveSpeed;
        uniform float memoryDecay;
        uniform float pulseIntensity;
        uniform float surfaceDetail;
        varying vec3 vWorld;
        varying vec3 vNormalW;
        float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
        void main(){
          float direct=0.0;
          float memory=0.0;
          for(int i=0;i<3;i++){
            if(i>=pulseCount)break;
            float age=pulseAges[i];
            float distanceFromCall=distance(vWorld,pulseOrigins[i]);
            float radius=min(pulseRange,max(0.0,age)*waveSpeed);
            float front=1.0-smoothstep(.15,1.45+distanceFromCall*.018,abs(distanceFromCall-radius));
            float sinceArrival=age-distanceFromCall/waveSpeed;
            float arrived=step(0.0,sinceArrival)*step(distanceFromCall,pulseRange);
            float uneven=.54+.46*hash(floor(vWorld*1.7)+float(i)*13.0);
            direct=max(direct,front*step(0.0,age));
            memory=max(memory,arrived*exp(-sinceArrival/max(.35,memoryDecay))*uneven);
          }
          vec3 viewDirection=normalize(cameraPosition-vWorld);
          float silhouette=pow(1.0-abs(dot(viewDirection,normalize(vNormalW))),2.3);
          float ridgeA=abs(sin(vWorld.y*2.7+vWorld.z*.73));
          float ridgeB=abs(sin(vWorld.x*3.3-vWorld.z*.41));
          float ridges=1.0-smoothstep(.03,.24,min(ridgeA,ridgeB));
          float response=direct*(.58+silhouette*.74+ridges*.45*surfaceDetail)+memory*(.18+silhouette*.42+ridges*.32*surfaceDetail);
          response*=pulseIntensity;
          if(response<.012)discard;
          vec3 memoryColor=vec3(.055,.24,.23);
          vec3 frontColor=vec3(.48,1.0,.88);
          vec3 color=mix(memoryColor,frontColor,clamp(direct*1.4,0.0,1.0));
          gl_FragColor=vec4(color,response);
        }`,
    });
  }

  setEchoProfile(profile) {
    this.echoUniforms.pulseCount.value = profile.echoHistories;
    this.echoUniforms.memoryDecay.value = profile.echoMemory;
    this.echoUniforms.surfaceDetail.value = profile.echoSurfaceDetail;
  }

  setThermalBlend(blend){this.rock.color.copy(this.normalColors.rock).lerp(this.thermalColors.rock,blend);this.formation.color.copy(this.normalColors.formation).lerp(this.thermalColors.formation,blend);this.wet.color.copy(this.normalColors.wet).lerp(this.thermalColors.wet,blend);this.mineral.color.copy(this.normalColors.mineral).lerp(this.thermalColors.mineral,blend);this.mineral.opacity=THREE.MathUtils.lerp(.12,.035,blend);}
}
