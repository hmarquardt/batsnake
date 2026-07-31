// @ts-check
export class SettingsMenu {
  /** @param {HTMLElement} root @param {import('../core/Settings.js').Settings} settings @param {import('../core/EventBus.js').EventBus} events */
  constructor(root,settings,events){this.settings=settings;this.events=events;this.element=document.createElement('section');this.element.className='panel-modal hidden';this.element.setAttribute('role','dialog');this.element.setAttribute('aria-modal','true');this.element.innerHTML=`<div class="panel-sheet"><p class="eyebrow">Field equipment</p><h2>Settings</h2><p>Changes apply immediately and are stored only in this browser.</p><div class="settings-grid">
  <label class="setting">Graphics<select data-key="quality"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
  <label class="setting">Resolution scale<input type="range" data-key="resolutionScale" min="0.6" max="1" step="0.05"></label>
  <label class="setting">Mouse sensitivity<input type="range" data-key="mouseSensitivity" min="0.2" max="1.5" step="0.05"></label>
  <label class="setting">Master volume<input type="range" data-key="masterVolume" min="0" max="1" step="0.05"></label>
  <label class="setting">Effects volume<input type="range" data-key="effectsVolume" min="0" max="1" step="0.05"></label>
  <label class="setting">Ambience volume<input type="range" data-key="ambienceVolume" min="0" max="1" step="0.05"></label>
  <label class="setting">Sensory intensity<input type="range" data-key="sensoryIntensity" min="0.35" max="1" step="0.05"></label>
  <label class="setting checkbox"><input type="checkbox" data-key="reducedCameraMotion"> Reduced camera motion</label>
  <label class="setting checkbox"><input type="checkbox" data-key="reducedFlashing"> Reduced flashing</label>
  <label class="setting checkbox"><input type="checkbox" data-key="showPerformanceOverlay"> Performance overlay</label></div><div class="panel-footer"><button class="text-button" data-action="fullscreen">Fullscreen</button><button class="text-button" data-action="close">Done</button></div></div>`;root.append(this.element);this.sync();this.element.querySelectorAll('[data-key]').forEach((input)=>input.addEventListener('input',()=>{const key=input.getAttribute('data-key');let value;if(input instanceof HTMLInputElement&&input.type==='checkbox')value=input.checked;else if(input instanceof HTMLInputElement&&input.type==='range')value=Number(input.value);else value=input.value;this.settings.set(/** @type {any} */(key),value);events.emit('settings-changed',{key,value});}));this.element.querySelector('[data-action=close]')?.addEventListener('click',()=>this.hide());this.element.querySelector('[data-action=fullscreen]')?.addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>events.emit('notice',{message:'Fullscreen was denied by the browser.'}));});}
  sync(){this.element.querySelectorAll('[data-key]').forEach((input)=>{const key=input.getAttribute('data-key');const value=this.settings.get(/** @type {any} */(key));if(input instanceof HTMLInputElement&&input.type==='checkbox')input.checked=Boolean(value);else input.value=String(value);});}
  show(){this.sync();this.element.classList.remove('hidden');}
  hide(){this.element.classList.add('hidden');}
}
