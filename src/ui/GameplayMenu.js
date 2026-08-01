// @ts-check

const ROWS = {
  bat: [
    ['Mouse', 'Steer and pitch; turning naturally banks the bat'],
    ['Space', 'Flap for thrust'],
    ['Shift', 'Dive to build speed'],
    ['S', 'Spread wings to brake'],
    ['Tap E or Click', 'Quick echolocation call'],
    ['Hold E or Click, release', 'Deep echolocation call'],
    ['R', 'Restart the same encounter'],
    ['Esc', 'Pause'],
  ],
  snake: [
    ['Mouse', 'Aim the head'],
    ['A / D', 'Shift the body across the anchor'],
    ['W / S', 'Extend or draw back from the anchor'],
    ['T', 'Toggle thermal perception'],
    ['F or Right Click', 'Focus thermal attention'],
    ['Hold Click, release', 'Tension the body, then lunge'],
    ['Q / E', 'Switch between snakes'],
    ['R', 'Restart the same encounter'],
    ['Esc', 'Pause'],
  ],
};

function rows(items) {
  return items.map(([control, action]) => `<tr><th scope="row">${control}</th><td>${action}</td></tr>`).join('');
}

/** Persistent, compact field-station reference for controls and movement intent. */
export class GameplayMenu {
  /** @param {HTMLElement} root */
  constructor(root) {
    /** @type {HTMLElement|null} */ this.returnFocus = null;
    this.element = document.createElement('section');
    this.element.className = 'panel-modal hidden';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'gameplay-title');
    this.element.innerHTML = `<div class="panel-sheet gameplay-sheet">
      <p class="eyebrow">Field station reference</p>
      <h2 id="gameplay-title">Gameplay</h2>
      <p class="gameplay-intro">Two animals share one flight line. Learn the movement first; the cave supplies the pressure.</p>
      <div class="gameplay-columns">
        <section aria-labelledby="gameplay-bat"><h3 id="gameplay-bat">Bat</h3>
          <p>You are always flying with momentum—not walking through the cave. Follow moving air and moonlight toward the exit while avoiding boas and rock formations.</p>
          <p class="movement-note">The bat carries momentum. If you stop flapping, you keep moving and begin to glide. Use braking before tight cave turns. Gliding restores wing reserve and flight rhythm.</p>
          <table><tbody>${rows(ROWS.bat)}</tbody></table>
          <p class="sensory-note"><strong>Quick calls</strong> reveal nearby surfaces with less warning. <strong>Deep calls</strong> reach farther and leave stronger memory, but alert snakes more.</p>
        </section>
        <section aria-labelledby="gameplay-snake"><h3 id="gameplay-snake">Snake</h3>
          <p>You are anchored to the cave ceiling. Reposition within that anchor, read warm bats, and lead their movement instead of aiming at where they are now.</p>
          <p class="movement-note">Focus narrows thermal attention for intercept timing. Hold the strike to build tension; release to commit.</p>
          <table><tbody>${rows(ROWS.snake)}</tbody></table>
          <p class="sensory-note">Switch between the three boas to cover different flight lanes.</p>
        </section>
      </div>
      <p class="gamepad-note">Gamepad: HUD hints update automatically for the active animal.</p>
      <div class="panel-footer"><button class="text-button" data-action="close">Close gameplay</button></div>
    </div>`;
    root.append(this.element);
    this.closeButton = /** @type {HTMLButtonElement} */ (this.element.querySelector('[data-action=close]'));
    this.closeButton.addEventListener('click', () => this.hide());
    this.element.addEventListener('click', (event) => { if (event.target === this.element) this.hide(); });
    window.addEventListener('keydown', (event) => {
      if (this.element.classList.contains('hidden')) return;
      if (event.code === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); this.hide(); }
      if (event.code === 'Tab') { event.preventDefault(); this.closeButton.focus(); }
    }, true);
  }
  /** @param {HTMLElement|null} [trigger] */
  show(trigger = null) { this.returnFocus = trigger || (document.activeElement instanceof HTMLElement ? document.activeElement : null); this.element.classList.remove('hidden'); this.closeButton.focus(); }
  hide() { this.element.classList.add('hidden'); this.returnFocus?.focus(); this.returnFocus = null; }
}
