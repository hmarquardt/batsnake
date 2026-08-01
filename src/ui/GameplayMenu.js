// @ts-check

const CONTROLS = {
  bat: {
    keyboard: [
      ['Mouse', 'Steer and pitch; turning banks the bat'], ['Space', 'Flap for thrust'], ['No input', 'Glide; keep momentum and recover rhythm'],
      ['Shift', 'Dive to build speed'], ['S', 'Spread wings to brake'], ['Tap E or Left Click', 'Quick echolocation call'],
      ['Hold E or Left Click, release', 'Deep echolocation call'], ['R', 'Restart the same encounter'], ['Esc', 'Pause'],
    ],
    gamepad: [
      ['Right Stick', 'Steer and pitch'], ['Left Stick', 'Bank into turns'], ['A or RB', 'Flap for thrust'],
      ['No input', 'Glide and recover rhythm'], ['LT', 'Dive to build speed'], ['LB', 'Spread wings to brake'],
      ['Tap B', 'Quick echolocation call'], ['Hold B, release', 'Deep echolocation call'], ['Y', 'Restart'], ['Menu', 'Pause'],
    ],
  },
  snake: {
    keyboard: [
      ['Mouse', 'Aim the head'], ['A / D', 'Shift across the ceiling anchor'], ['W / S', 'Extend / retract from the anchor'],
      ['T', 'Toggle thermal perception'], ['F or Right Click', 'Focus thermal attention'], ['Hold Left Click', 'Build strike tension'],
      ['Release Left Click', 'Commit to the lunge'], ['Q / E', 'Switch between snakes'], ['R', 'Restart the same encounter'], ['Esc', 'Pause'],
    ],
    gamepad: [
      ['Right Stick', 'Aim the head'], ['Left Stick L / R', 'Shift across the anchor'], ['Left Stick Up / Down', 'Extend / retract'],
      ['X', 'Toggle thermal perception'], ['LT', 'Focus thermal attention'], ['Hold RT', 'Build strike tension'],
      ['Release RT', 'Commit to the lunge'], ['LB / RB', 'Switch between snakes'], ['Y', 'Restart'], ['Menu', 'Pause'],
    ],
  },
};

const rows = (items) => items.map(([control, action]) => `<tr><th scope="row">${control}</th><td>${action}</td></tr>`).join('');

/** Persistent, compact field-station reference for controls and movement intent. */
export class GameplayMenu {
  /** @param {HTMLElement} root @param {import('../core/EventBus.js').EventBus} events @param {()=>string} getDevice */
  constructor(root, events, getDevice) {
    /** @type {HTMLElement|null} */ this.returnFocus = null;
    this.getDevice = getDevice;
    this.activeMode = 'bat';
    this.element = document.createElement('section');
    this.element.className = 'panel-modal hidden';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'gameplay-title');
    this.element.innerHTML = `<div class="panel-sheet gameplay-sheet">
      <div class="gameplay-header"><div><p class="eyebrow">Field station reference</p><h2 id="gameplay-title">Gameplay</h2></div><button class="text-button gameplay-close" data-action="close">Close</button></div>
      <p class="gameplay-intro">Two animals share one flight line. Learn the movement first; the cave supplies the pressure.</p>
      <div class="gameplay-nav"><div class="gameplay-tabs" role="tablist" aria-label="Animal"><button role="tab" data-mode="bat" aria-controls="gameplay-panel-bat">Bat</button><button role="tab" data-mode="snake" aria-controls="gameplay-panel-snake">Snake</button></div><span class="input-device" data-device>Keyboard &amp; mouse active</span></div>
      <section class="gameplay-animal" id="gameplay-panel-bat" role="tabpanel" data-panel="bat" aria-labelledby="gameplay-tab-bat">
        <p>You are always flying forward with momentum and cannot hover. Follow moving air and moonlight toward the exit while avoiding boas and rock formations.</p>
        <p class="movement-note">The bat carries momentum. If you stop flapping, you keep moving and begin to glide. Use braking before tight cave turns. Gliding restores wing reserve and flight rhythm.</p>
        <div class="control-layout"><section class="control-group" data-input="keyboard"><h3>Keyboard &amp; mouse</h3><table><tbody>${rows(CONTROLS.bat.keyboard)}</tbody></table></section><section class="control-group" data-input="gamepad"><h3>Gamepad</h3><table><tbody>${rows(CONTROLS.bat.gamepad)}</tbody></table></section></div>
        <p class="sensory-note"><strong>Quick calls</strong> reveal nearby surfaces with less warning. <strong>Deep calls</strong> reach farther and leave stronger memory, but alert snakes more.</p>
      </section>
      <section class="gameplay-animal" id="gameplay-panel-snake" role="tabpanel" data-panel="snake" aria-labelledby="gameplay-tab-snake" hidden>
        <p>You are anchored above the bat flight line. Read warm movement, predict where a bat will cross your strike path, build tension, and release before it reaches you. Capture the required number before the bat stream ends.</p>
        <p class="movement-note">The boa cannot roam: reposition only within the ceiling anchor. Focus clarifies one warm flight path. Lead the moving bat because the lunge takes time to reach it.</p>
        <div class="control-layout"><section class="control-group" data-input="keyboard"><h3>Keyboard &amp; mouse</h3><table><tbody>${rows(CONTROLS.snake.keyboard)}</tbody></table></section><section class="control-group" data-input="gamepad"><h3>Gamepad</h3><table><tbody>${rows(CONTROLS.snake.gamepad)}</tbody></table></section></div>
        <p class="sensory-note">Switch posts to cover a different flight lane while the previous snake recovers.</p>
      </section>
      <p class="gamepad-note">Gamepad labels use the common Xbox layout; equivalent button positions work on other standard pads.</p>
    </div>`;
    root.append(this.element);
    this.closeButton = /** @type {HTMLButtonElement} */ (this.element.querySelector('[data-action=close]'));
    this.tabs = [...this.element.querySelectorAll('[role=tab]')];
    this.closeButton.addEventListener('click', () => this.hide());
    this.tabs.forEach(tab => { tab.id = `gameplay-tab-${tab.getAttribute('data-mode')}`; tab.addEventListener('click', () => this.activate(tab.getAttribute('data-mode') || 'bat', true)); });
    this.element.addEventListener('click', (event) => { if (event.target === this.element) this.hide(); });
    events.on('input-device-changed', ({device}) => this.updateDevice(device));
    window.addEventListener('keydown', (event) => this.onKey(event), true);
    this.activate('bat'); this.updateDevice('keyboard');
  }
  onKey(event) {
    if (this.element.classList.contains('hidden')) return;
    if (event.code === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); this.hide(); return; }
    if ((event.code === 'ArrowLeft' || event.code === 'ArrowRight') && document.activeElement?.getAttribute('role') === 'tab') { event.preventDefault(); this.activate(event.code === 'ArrowLeft' ? 'bat' : 'snake', true); return; }
    if (event.code !== 'Tab') return;
    const focusable = [this.tabs.find(tab => tab.getAttribute('data-mode') === this.activeMode), this.closeButton].filter(Boolean);
    const index = focusable.indexOf(document.activeElement), next = event.shiftKey ? (index <= 0 ? focusable.length - 1 : index - 1) : (index >= focusable.length - 1 ? 0 : index + 1);
    event.preventDefault(); focusable[next]?.focus({preventScroll:true});
  }
  activate(mode, focus = false) { this.activeMode = mode === 'snake' ? 'snake' : 'bat'; this.tabs.forEach(tab => { const active=tab.getAttribute('data-mode')===this.activeMode;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus({preventScroll:true}); });this.element.querySelectorAll('[data-panel]').forEach(panel=>{panel.hidden=panel.getAttribute('data-panel')!==this.activeMode;}); }
  updateDevice(device) { const gamepad=device==='gamepad',label=this.element.querySelector('[data-device]');if(label)label.textContent=gamepad?'Gamepad active':'Keyboard & mouse active';this.element.querySelectorAll('[data-input]').forEach(group=>group.classList.toggle('active',group.getAttribute('data-input')===(gamepad?'gamepad':'keyboard'))); }
  /** @param {HTMLElement|null} [trigger] @param {string|null} [mode] */
  show(trigger = null, mode = null) { this.returnFocus = trigger || (document.activeElement instanceof HTMLElement ? document.activeElement : null); this.activate(mode || this.activeMode);this.updateDevice(this.getDevice());this.element.classList.remove('hidden');const active=this.tabs.find(tab=>tab.getAttribute('data-mode')===this.activeMode);active?.focus({preventScroll:true}); }
  hide() { this.element.classList.add('hidden'); this.returnFocus?.focus({preventScroll:true}); this.returnFocus = null; }
}
