// @ts-check
export class PerformanceOverlay {
  /** @param {HTMLElement} element @param {import('../core/Settings.js').Settings} settings */
  constructor(element,settings){this.element=element;this.settings=settings;this.elapsed=0;this.frames=0;this.fps=0;this.sensoryAverage=0;this.renderAverage=0;}
  update(dt,renderer,counts){this.element.classList.toggle('hidden',!this.settings.get('showPerformanceOverlay'));this.elapsed+=dt;this.frames++;this.sensoryAverage+=(counts.sensoryMs-this.sensoryAverage)*.08;this.renderAverage+=(counts.renderMs-this.renderAverage)*.08;if(this.elapsed>.5){this.fps=this.frames/this.elapsed;this.elapsed=0;this.frames=0;const info=renderer.info.render;this.element.textContent=`${this.fps.toFixed(0)} FPS · ${(1000/Math.max(1,this.fps)).toFixed(1)} ms frame\n${this.renderAverage.toFixed(2)} ms render · ${this.sensoryAverage.toFixed(3)} ms sensory\n${info.calls} calls · ${(info.triangles/1000).toFixed(1)}k tris\n${renderer.info.memory.textures} textures · ${counts.renderTargets} RTs\n${counts.bats} bats · ${counts.particles} motes · physics 60 Hz`;}}
}
