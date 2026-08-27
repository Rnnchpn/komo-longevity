/* KŌMØ Pulse — authenticated shell guard v1 */
(() => {
  let raf=0;

  function reconcile(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const app=document.querySelector('#appShell');
      const auth=document.querySelector('#authScreen');
      if(!app||!auth)return;

      const runtime=window.KomoRuntime;
      const session=runtime?.session||runtime?.getContext?.()?.session||null;

      if(!auth.hidden&&!app.hidden){
        if(session?.user){
          auth.hidden=true;
        }else{
          app.hidden=true;
          document.documentElement.removeAttribute('data-mobile-surface');
          document.documentElement.removeAttribute('data-tablet-surface');
        }
      }

      if(!auth.hidden){
        document.querySelector('#accountPopover')?.setAttribute('hidden','');
      }
    });
  }

  const observer=new MutationObserver(reconcile);
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  window.addEventListener('komo:session-ready',reconcile);
  window.addEventListener('komo:session-cleared',reconcile);
  window.addEventListener('hashchange',reconcile);
  window.addEventListener('pageshow',reconcile);
  document.addEventListener('DOMContentLoaded',reconcile);
  setTimeout(reconcile,300);
  setTimeout(reconcile,1000);
})();