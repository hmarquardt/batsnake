// @ts-check
export class Onboarding {
  constructor(root,settings){this.settings=settings;this.learned={};try{this.learned=JSON.parse(localStorage.getItem('batsnake.guidance.v1')||'{}');}catch{}this.element=document.createElement('div');this.element.className='onboarding hidden';root.append(this.element);this.current='';this.timer=0;}
  cue(id,message,duration=5){if(!this.settings.get('onboarding')||this.learned[id]||this.current)return;this.current=id;this.timer=duration;this.element.textContent=message;this.element.classList.remove('hidden');}
  succeed(id){this.learned[id]=true;try{localStorage.setItem('batsnake.guidance.v1',JSON.stringify(this.learned));}catch{}if(this.current===id)this.hide();}
  update(dt){if(this.timer>0&&(this.timer-=dt)<=0)this.hide();}hide(){this.current='';this.element.classList.add('hidden');}
  reset(){this.learned={};try{localStorage.removeItem('batsnake.guidance.v1');}catch{}}
}
