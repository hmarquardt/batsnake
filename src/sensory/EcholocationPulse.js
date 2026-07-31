// @ts-check
import * as THREE from 'three';
export class EcholocationPulse {
  /** @param {THREE.Scene} scene @param {THREE.Vector3} origin @param {number} range @param {number} duration */
  constructor(scene,origin,range,duration){this.scene=scene;this.origin=origin.clone();this.range=range;this.duration=duration;this.age=0;this.radius=0;const geometry=new THREE.SphereGeometry(1,32,20);const material=new THREE.ShaderMaterial({uniforms:{opacity:{value:.16}},transparent:true,depthWrite:false,depthTest:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,vertexShader:`varying vec3 vNormal;varying vec3 vWorld;void main(){vNormal=normalize(normalMatrix*normal);vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,fragmentShader:`uniform float opacity;varying vec3 vNormal;varying vec3 vWorld;void main(){float facing=pow(1.-abs(dot(normalize(vNormal),normalize(cameraPosition-vWorld))),1.8);float grain=.72+.28*sin(vWorld.x*7.+vWorld.y*5.3+vWorld.z*6.1);float alpha=(.035+facing*.25)*grain*opacity;if(alpha<.012)discard;gl_FragColor=vec4(.35,.94,.82,alpha);}`});this.mesh=new THREE.Mesh(geometry,material);this.mesh.position.copy(origin);this.mesh.renderOrder=2;scene.add(this.mesh);}
  update(dt,intensity){this.age+=dt;const t=Math.min(1,this.age/this.duration);this.radius=this.range*(1-Math.pow(1-t,1.35));this.mesh.scale.setScalar(this.radius);this.mesh.material.uniforms.opacity.value=(1-t)*intensity;return t>=1;}
  dispose(){this.scene.remove(this.mesh);this.mesh.geometry.dispose();this.mesh.material.dispose();}
}
