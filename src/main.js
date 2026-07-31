// @ts-check

function showFatal(error){document.getElementById('loading')?.classList.add('hidden');document.getElementById('fatal-error')?.classList.remove('hidden');const message=document.getElementById('fatal-message');if(message)message.textContent=error instanceof Error?error.message:String(error);console.error(error);}

if(location.protocol!=='file:'){
  import('./core/App.js').then(async({App})=>{const app=new App();await app.init();window.__BATSNAKE__=app;}).catch(showFatal);
}

window.addEventListener('unhandledrejection',(event)=>{if(!window.__BATSNAKE__)showFatal(event.reason);});
