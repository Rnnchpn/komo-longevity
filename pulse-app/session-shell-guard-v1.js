(()=>{
let raf=0;
function reconcile(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const app=document.querySelector('#appShell'),auth=document.querySelector('#authScreen');if(!app||!auth)return;if(!app.hidden&&!auth.hidden)auth.hidden=true;if(!auth.hidden){document.querySelector('#accountPopover')?.setAttribute('hidden','');document.querySelector('#kamSheet')?.classList.remove('open');document.querySelector('#kamBackdrop')?.classList.remove('open')}})}
const observer=new MutationObserver(reconcile),app=document.querySelector('#appShell'),auth=document.querySelector('#authScreen');if(app)observer.observe(app,{attributes:true,attributeFilter:['hidden']});if(auth)observer.observe(auth,{attributes:true,attributeFilter:['hidden']});['komo:session-ready','komo:session-cleared','hashchange','pageshow'].forEach(name=>window.addEventListener(name,reconcile));document.addEventListener('DOMContentLoaded',reconcile);setTimeout(reconcile,250);setTimeout(reconcile,900)
})();
