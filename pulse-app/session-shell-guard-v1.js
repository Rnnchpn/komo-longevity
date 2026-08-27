/* KŌMØ Pulse — authenticated shell guard v2 */
(() => {
  let raf=0;

  function reconcile(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const app=document.querySelector('#appShell');
      const auth=document.querySelector('#authScreen');
      if(!app||!auth)return;

      // Once the authenticated application is visible, route changes must never
      // resurrect the login screen. app.js remains the sole owner that may switch
      // from app -> auth on an explicit logout or a genuinely missing startup session.
      if(!app.hidden&&!auth.hidden)auth.hidden=true;

      if(!auth.hidden){
        document.querySelector('#accountPopover')?.setAttribute('hidden','');
        document.querySelector('#kamSheet')?.classList.remove('open');
        document.querySelector('#kamBackdrop')?.classList.remove('open');
      }
    });
  }

  const observer=new MutationObserver(reconcile);
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  ['komo:session-ready','komo:session-cleared','hashchange','pageshow'].forEach(name=>window.addEventListener(name,reconcile));
  document.addEventListener('DOMContentLoaded',reconcile);
  setTimeout(reconcile,250);
  setTimeout(reconcile,900);
})();
