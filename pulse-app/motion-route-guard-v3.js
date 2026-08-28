/* KŌMØ Pulse — dedicated Motion route guard v3.0.1
   Owns the transition into #motion and prevents the legacy Motion renderer
   from replacing the canonical Motion Hub v3. */
(() => {
  const route=()=>location.hash.replace(/^#/,'')||'home';
  const style=document.createElement('style');
  style.id='komoMotionRouteGuardV3Style';
  style.textContent=`
    body.kmotion-route-pending #viewRoot{visibility:hidden!important;min-height:620px!important}
    body.kmotion-route-pending #pageEyebrow,body.kmotion-route-pending #pageTitle{visibility:hidden!important}
    [data-komo-motion-legacy-sentinel]{display:none!important}
  `;
  document.head.appendChild(style);

  function markCanonicalOwner(){
    if(route()!=='motion')return;
    const root=document.querySelector('#viewRoot');
    if(!root)return;
    const canonical=root.querySelector('[data-motion-hub-v3]');
    if(canonical){
      canonical.setAttribute('data-komo-motion-hub','canonical-v3');
      root.querySelectorAll('[data-komo-motion-legacy-sentinel]').forEach(x=>x.remove());
      return;
    }
    if(!root.querySelector('[data-komo-motion-hub]')){
      const sentinel=document.createElement('span');
      sentinel.hidden=true;
      sentinel.setAttribute('data-komo-motion-hub','legacy-guard');
      sentinel.setAttribute('data-komo-motion-legacy-sentinel','1');
      root.prepend(sentinel);
    }
  }

  const hold=()=>{
    const active=route()==='motion';
    document.body.classList.toggle('kmotion-route-pending',active);
    if(active)queueMicrotask(markCanonicalOwner);
  };

  hold();
  window.addEventListener('hashchange',hold,true);

  const observer=new MutationObserver(()=>{
    if(route()==='motion')markCanonicalOwner();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true});

  window.KomoMotionRouteGuard={
    version:'3.0.1',
    hold,
    mark:markCanonicalOwner,
    release(){
      markCanonicalOwner();
      document.body.classList.remove('kmotion-route-pending');
    }
  };
})();