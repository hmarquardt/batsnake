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
      const value = THREE.MathUtils.clamp((roughness ? .72 : .31) + broad + pores * .22 - streak, .08, .94);
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

/** Soft radial blot texture used by guano beds and roost residue (project-created, deterministic). */
function blotchTexture(size = 64) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const dx = (x / size - .5) * 2, dy = (y / size - .5) * 2;
    const d = Math.hypot(dx, dy);
    const ragged = .68 + seededNoise(x >> 2, y >> 2) * .3 + seededNoise(x, y) * .12;
    const alpha = THREE.MathUtils.clamp((1 - d * ragged * 1.35), 0, 1);
    const index = (y * size + x) * 4;
    data[index] = data[index + 1] = data[index + 2] = 255;
    data[index + 3] = Math.round(Math.pow(alpha, 1.6) * 235);
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

/** Dark torn-leaf alpha silhouette for entrance vegetation clusters (project-created). */
function leafTexture(size = 64) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const u = x / size, v = y / size;
    const blade = Math.abs(u - .5) < (.5 - v) * .3 * (0.55 + seededNoise(y >> 1, 3) * .7);
    const tear = seededNoise(x >> 2, y) > .24;
    const index = (y * size + x) * 4;
    data[index] = data[index + 1] = data[index + 2] = 255;
    data[index + 3] = blade && tear ? Math.round(200 + seededNoise(x, y) * 55) : 0;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

export class CaveMaterials {
  constructor() {
    this.limestoneMap = limestoneTexture();
    this.roughnessMap = limestoneTexture(128, true);
    this.blotchMap = blotchTexture();
    this.leafMap = leafTexture();
    // Formations share the limestone family but tile it at a larger scale so small meshes do not hatch.
    this.formationMap = limestoneTexture(); this.formationMap.repeat.set(2.4, 3.2);
    this.formationRoughness = limestoneTexture(128, true); this.formationRoughness.repeat.set(2.4, 3.2);
    this.rock = new THREE.MeshStandardMaterial({ color: 0x59645d, map: this.limestoneMap, bumpMap: this.roughnessMap, bumpScale: .18, roughness: .9, roughnessMap: this.roughnessMap, metalness: 0.01, side: THREE.BackSide, vertexColors: true });
    this.formation = new THREE.MeshStandardMaterial({ color: 0x58625b, map: this.formationMap, bumpMap: this.formationRoughness, bumpScale: .15, roughness: 0.86, roughnessMap: this.formationRoughness, metalness: 0.02 });
    this.wet = new THREE.MeshPhysicalMaterial({ color: 0x35423c, map: this.formationMap, bumpMap: this.formationRoughness, bumpScale: .11, roughness: 0.6, roughnessMap: this.formationRoughness, metalness: 0.02, clearcoat: 0.16, clearcoatRoughness: 0.5 });
    this.guano = new THREE.MeshStandardMaterial({ color: 0x241c14, roughness: 1, transparent: true, alphaMap: this.blotchMap, depthWrite: false });
    this.mineral = new THREE.MeshBasicMaterial({color:0xa5aa94,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    this.iron = new THREE.MeshBasicMaterial({color:0x7d6b52,transparent:true,opacity:.1,depthWrite:false,side:THREE.DoubleSide});
    this.vegetation = new THREE.MeshBasicMaterial({color:0x04080a,alphaMap:this.leafMap,transparent:true,side:THREE.DoubleSide,depthWrite:false});
    this.normalColors={rock:new THREE.Color(0x59645d),formation:new THREE.Color(0x58625b),wet:new THREE.Color(0x35423c),mineral:new THREE.Color(0xa5aa94)};
    this.thermalColors={rock:new THREE.Color(0x080a09),formation:new THREE.Color(0x090b0a),wet:new THREE.Color(0x111813),mineral:new THREE.Color(0x23322b)};
    this.normalVegetation=new THREE.Color(0x04080a);this.thermalVegetation=new THREE.Color(0x010202);

    this.echoUniforms = {
      pulseOrigins: { value: Array.from({ length: 3 }, () => new THREE.Vector3(0, -999, 0)) },
      pulseAges: { value: new Float32Array([-100, -100, -100]) },
      pulseCount: { value: 1 },
      pulseRange: { value: 34 },
      waveSpeed: { value: 21.5 },
      memoryDecay: { value: 1.7 },
      pulseIntensity: { value: 0 },
      surfaceDetail: { value: .75 },
      geometryFill: { value: .5 },
      surfaceOffset: { value: .015 },
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
        uniform float surfaceOffset;
        void main(){
          vec4 localPosition=vec4(position,1.0);
          vec3 localNormal=normal;
          #ifdef USE_INSTANCING
            localPosition=instanceMatrix*localPosition;
            localNormal=mat3(instanceMatrix)*localNormal;
          #endif
          vec4 worldPosition=modelMatrix*localPosition;
          vNormalW=normalize(mat3(modelMatrix)*localNormal);
          worldPosition.xyz+=vNormalW*surfaceOffset;
          vWorld=worldPosition.xyz;
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
        uniform float geometryFill;
        float vhash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
        float vnoise(vec3 p){
          vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);
          float a=vhash(i);float b=vhash(i+vec3(1.,0.,0.));float c=vhash(i+vec3(0.,1.,0.));float d=vhash(i+vec3(1.,1.,0.));
          float e=vhash(i+vec3(0.,0.,1.));float g=vhash(i+vec3(1.,0.,1.));float h=vhash(i+vec3(0.,1.,1.));float k=vhash(i+vec3(1.,1.,1.));
          return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,g,f.x),mix(h,k,f.x),f.y),f.z);
        }
        void main(){
          float direct=0.0;
          float memory=0.0;
          for(int i=0;i<3;i++){
            if(i>=pulseCount)break;
            float age=pulseAges[i];
            float distanceFromCall=distance(vWorld,pulseOrigins[i]);
            float radius=min(pulseRange,max(0.0,age)*waveSpeed);
            float radialAA=max(.35,fwidth(distanceFromCall)*1.8);
            float frontWidth=1.15+distanceFromCall*.022+radialAA;
            float front=1.0-smoothstep(frontWidth*.18,frontWidth,abs(distanceFromCall-radius));
            float sinceArrival=age-distanceFromCall/waveSpeed;
            float arrived=step(0.0,sinceArrival)*step(distanceFromCall,pulseRange);
            float uneven=.58+.27*vnoise(vWorld*.48+float(i)*7.3)+.15*vnoise(vWorld*.19+float(i)*3.1);
            direct=max(direct,front*step(0.0,age)*uneven);
            memory=max(memory,arrived*exp(-sinceArrival/max(.35,memoryDecay))*uneven);
          }
          vec3 viewDirection=normalize(cameraPosition-vWorld);
          float silhouette=pow(1.0-abs(dot(viewDirection,normalize(vNormalW))),2.1);
          float grain=vnoise(vWorld*2.4);
          float broad=vnoise(vWorld*.22+vec3(2.7,7.1,4.3));
          float fill=mix(.08,.48,clamp(geometryFill,0.,1.));
          float nearFade=smoothstep(.8,4.8,distance(cameraPosition,vWorld));
          float contour=smoothstep(.08,.9,silhouette);
          float directShape=(fill*.55+contour*.15+grain*.075*surfaceDetail)*mix(.68,1.0,broad)*mix(.58,1.0,nearFade);
          float memoryShape=fill*.3+contour*.2+grain*.085*surfaceDetail;
          float response=direct*directShape+memory*memoryShape;
          response*=pulseIntensity;
          if(response<.00035)discard;
          vec3 memoryColor=vec3(.055,.24,.23);
          vec3 frontColor=vec3(.32,.78,.68);
          vec3 color=mix(memoryColor,frontColor,clamp(direct*1.4,0.0,1.0));
          gl_FragColor=vec4(color,response*.68);
        }`,
    });
  }

  setEchoProfile(profile) {
    this.echoUniforms.pulseCount.value = profile.echoHistories;
    this.echoUniforms.memoryDecay.value = profile.echoMemory;
    this.echoUniforms.surfaceDetail.value = profile.echoSurfaceDetail;
  }

  setThermalBlend(blend){this.rock.color.copy(this.normalColors.rock).lerp(this.thermalColors.rock,blend);this.formation.color.copy(this.normalColors.formation).lerp(this.thermalColors.formation,blend);this.wet.color.copy(this.normalColors.wet).lerp(this.thermalColors.wet,blend);this.mineral.color.copy(this.normalColors.mineral).lerp(this.thermalColors.mineral,blend);this.mineral.opacity=THREE.MathUtils.lerp(.12,.035,blend);this.iron.opacity=THREE.MathUtils.lerp(.1,.02,blend);this.vegetation.color.copy(this.normalVegetation).lerp(this.thermalVegetation,blend);}
}
