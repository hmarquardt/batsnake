// @ts-check
import * as THREE from 'three';

const vertexShader=`varying vec3 vNormal;varying vec3 vWorld;void main(){vNormal=normalize(normalMatrix*normal);vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;
const fragmentShader=`uniform float opacity;varying vec3 vNormal;varying vec3 vWorld;float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=hash(i),b=hash(i+vec3(1,0,0)),c=hash(i+vec3(0,1,0)),d=hash(i+vec3(1,1,0)),e=hash(i+vec3(0,0,1)),g=hash(i+vec3(1,0,1)),h=hash(i+vec3(0,1,1)),k=hash(i+vec3(1,1,1));return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,g,f.x),mix(h,k,f.x),f.y),f.z);}void main(){float facing=pow(1.-abs(dot(normalize(vNormal),normalize(cameraPosition-vWorld))),1.8);float grain=.72+.28*noise(vWorld*.34);float alpha=(.035+facing*.25)*grain*opacity;if(alpha<.012)discard;gl_FragColor=vec4(.35,.94,.82,alpha);}`;

/** One bounded application-lifetime resource: calls never allocate or compile a new pulse variant. */
export function createEcholocationPulseResources(){return{geometry:new THREE.SphereGeometry(1,32,20),material:new THREE.ShaderMaterial({uniforms:{opacity:{value:.16}},transparent:true,depthWrite:false,depthTest:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,vertexShader,fragmentShader})};}
export class EcholocationPulse {
  /** @param {THREE.Scene} scene @param {THREE.Vector3} origin @param {number} range @param {number} duration */
  constructor(scene,origin,range,duration,resources){this.scene=scene;this.origin=origin.clone();this.range=range;this.duration=duration;this.age=0;this.radius=0;this.mesh=new THREE.Mesh(resources.geometry,resources.material);this.mesh.position.copy(origin);this.mesh.renderOrder=2;scene.add(this.mesh);}
  update(dt,intensity){this.age+=dt;const t=Math.min(1,this.age/this.duration);this.radius=this.range*(1-Math.pow(1-t,1.35));this.mesh.scale.setScalar(this.radius);this.mesh.material.uniforms.opacity.value=(1-t)*intensity;return t>=1;}
  dispose(){this.scene.remove(this.mesh);}
}
