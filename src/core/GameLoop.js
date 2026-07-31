// @ts-check

export class GameLoop {
  /** @param {{fixedUpdate:(dt:number)=>void, update:(dt:number,alpha:number)=>void, render:()=>void}} delegate */
  constructor(delegate) { this.delegate = delegate; this.fixedStep = 1 / 60; this.accumulator = 0; this.last = 0; this.running = false; this.frame = this.frame.bind(this); }
  start() { if (this.running) return; this.running = true; this.last = performance.now(); requestAnimationFrame(this.frame); }
  stop() { this.running = false; }
  /** @param {number} now */
  frame(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.last) / 1000, 0.1); this.last = now; this.accumulator += dt;
    let iterations = 0;
    while (this.accumulator >= this.fixedStep && iterations < 5) { this.delegate.fixedUpdate(this.fixedStep); this.accumulator -= this.fixedStep; iterations += 1; }
    this.delegate.update(dt, this.accumulator / this.fixedStep); this.delegate.render();
    requestAnimationFrame(this.frame);
  }
}
