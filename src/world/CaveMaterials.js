// @ts-check
import * as THREE from 'three';

export class CaveMaterials {
  constructor() {
    this.rock = new THREE.MeshStandardMaterial({ color: 0x17201c, roughness: 0.82, metalness: 0.03, side: THREE.BackSide, vertexColors: true });
    this.formation = new THREE.MeshStandardMaterial({ color: 0x1d2823, roughness: 0.72, metalness: 0.04 });
    this.wet = new THREE.MeshPhysicalMaterial({ color: 0x17221e, roughness: 0.24, metalness: 0.03, clearcoat: 0.34, clearcoatRoughness: 0.3 });
    this.guano = new THREE.MeshStandardMaterial({ color: 0x241c14, roughness: 1 });
    this.echoUniforms = { pulseOrigin: { value: new THREE.Vector3(0, -999, 0) }, pulseRadius: { value: -10 }, pulseWidth: { value: 2.2 }, pulseIntensity: { value: 0 } };
    this.echo = new THREE.ShaderMaterial({
      uniforms: this.echoUniforms, transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec3 vWorld; varying vec3 vNormalW; void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;vNormalW=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`,
      fragmentShader: `uniform vec3 pulseOrigin;uniform float pulseRadius;uniform float pulseWidth;uniform float pulseIntensity;varying vec3 vWorld;varying vec3 vNormalW;void main(){float d=distance(vWorld,pulseOrigin);float ring=1.-smoothstep(0.,pulseWidth,abs(d-pulseRadius));float trace=exp(-max(0.,pulseRadius-d)*.18)*step(d,pulseRadius);float grain=.72+.28*sin(vWorld.x*3.1+vWorld.y*2.7+vWorld.z*2.3);float edge=pow(1.-abs(dot(normalize(cameraPosition-vWorld),vNormalW)),2.);vec3 c=mix(vec3(.08,.35,.34),vec3(.45,.95,.82),ring);float a=(ring*.7+trace*.12+edge*ring*.5)*grain*pulseIntensity;if(a<.015)discard;gl_FragColor=vec4(c,a);}`,
    });
  }
}
