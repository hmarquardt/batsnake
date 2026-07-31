// @ts-check

export class InputManager {
  /** @param {HTMLCanvasElement} canvas @param {import('./EventBus.js').EventBus} events */
  constructor(canvas, events) {
    this.canvas = canvas; this.events = events;
    /** @type {Set<string>} */ this.keys = new Set();
    /** @type {Set<string>} */ this.pressed = new Set();
    this.mouse = { x: 0, y: 0, down: false, pressed: false, released: false };
    this.locked = false;
    window.addEventListener('keydown', (event) => { if (!event.repeat) this.pressed.add(event.code); this.keys.add(event.code); if (['Space','ArrowUp','ArrowDown'].includes(event.code)) event.preventDefault(); });
    window.addEventListener('keyup', (event) => this.keys.delete(event.code));
    window.addEventListener('mousedown', (event) => { if (event.button === 0) { this.mouse.down = true; this.mouse.pressed = true; } });
    window.addEventListener('mouseup', (event) => { if (event.button === 0) { this.mouse.down = false; this.mouse.released = true; } });
    window.addEventListener('mousemove', (event) => { if (this.locked) { this.mouse.x += event.movementX; this.mouse.y += event.movementY; } });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === canvas; events.emit('pointer-lock', { locked: this.locked }); });
    document.addEventListener('pointerlockerror', () => events.emit('notice', { message: 'Pointer lock was denied. Click the cave to try again.' }));
    canvas.addEventListener('click', () => { if (!this.locked) this.requestLock(); });
  }
  requestLock() { try { const promise = this.canvas.requestPointerLock(); promise?.catch?.(() => this.events.emit('notice', { message: 'Pointer lock was denied. Click the cave to try again.' })); } catch { this.events.emit('notice', { message: 'Pointer lock is unavailable in this browser.' }); } }
  releaseLock() { if (document.pointerLockElement) document.exitPointerLock(); }
  /** @param {string} code */ down(code) { return this.keys.has(code); }
  /** @param {string} code */ consume(code) { const value = this.pressed.has(code); this.pressed.delete(code); return value; }
  /** @returns {{x:number,y:number}} */ consumeMouse() { const result = { x: this.mouse.x, y: this.mouse.y }; this.mouse.x = 0; this.mouse.y = 0; return result; }
  endFrame() { this.pressed.clear(); this.mouse.pressed = false; this.mouse.released = false; }
}
