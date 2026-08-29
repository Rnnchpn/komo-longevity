/* KŌMØ Pulse — auth stability runtime v1 */
(() => {
  'use strict';

  const AUTH_KEY='sb-uqlolefsiktbznnymriy-auth-token';
  let raf=0;
  let fallbackTimer=0;

  function hasStoredSession(){
    for(const storage of [localStorage,sessionStorage]){
      try{
        const raw=storage.getItem(AUTH_KEY);
        if(!raw)continue;
        const parsed=JSON.parse(raw);
        if(parsed?.access_token)return true;
      }catch{}
    }
    return false;
  }

  function setBootstrap(){
    document.documentElement.dataset.komoAuthBootstrap=hasStoredSession()?'session':'guest';
  }

  function resolved(mode){
    const auth=document.querySelector('#authScreen');
    if(auth)auth.dataset.authResolved=mode;
    document.documentElement.dataset.komoAuthBootstrap=mode==='app'?'session':'guest';
  }

  function reconcile(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const auth=document.querySelector('#authScreen');
      const app=document.querySelector('#appShell');
      if(!auth||!app)return;

      const appVisible=!app.hidden;
      const authVisible=!auth.hidden;

      // Never allow both surfaces to be visible. Once the authenticated shell is visible,
      // it always wins over late auth mutations or route changes.
      if(appVisible){
        if(authVisible)auth.hidden=true;
        auth.setAttribute('aria-hidden','true');
        app.removeAttribute('aria-hidden');
        resolved('app');
        clearTimeout(fallbackTimer);
        return;
      }

      // Explicit guest state: keep the login surface visible and remove any stale app chrome.
      if(authVisible){
        auth.removeAttribute('aria-hidden');
        app.setAttribute('aria-hidden','true');
        resolved('guest');
      }
    });
  }

  function bootFallback(){
    clearTimeout(fallbackTimer);
    fallbackTimer=setTimeout(()=>{
      const auth=document.querySelector('#authScreen');
      const app=document.querySelector('#appShell');
      if(!auth||!app)return;
      if(app.hidden&&!auth.hidden)resolved('guest');
    },1400);
  }

  function bind(){
    const auth=document.querySelector('#authScreen');
    const app=document.querySelector('#appShell');
    if(!auth||!app)return;

    const observer=new MutationObserver(reconcile);
    observer.observe(auth,{attributes:true,attributeFilter:['hidden']});
    observer.observe(app,{attributes:true,attributeFilter:['hidden']});

    document.querySelector('#loginForm')?.addEventListener('submit',()=>{
      document.documentElement.classList.add('komo-auth-submitting');
    },true);

    ['komo:session-ready','komo:session-cleared','pageshow','hashchange'].forEach(name=>window.addEventListener(name,()=>{
      document.documentElement.classList.remove('komo-auth-submitting');
      reconcile();
    }));

    reconcile();
    bootFallback();
  }

  setBootstrap();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
})();
