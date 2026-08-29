/* KŌMØ Pulse — route-aware lazy runtime v1.0.0
   Loads heavy professional/centre/admin modules only when that workspace is requested. */
(()=>{
  'use strict';
  const V='1.0.0';
  const manifestNode=document.querySelector('#komoLazyRouteManifest');
  let manifest={groups:{}};
  try{manifest=JSON.parse(manifestNode?.textContent||'{"groups":{}}')}catch(e){console.error('[pulse-lazy] invalid manifest',e)}
  const jobs=new Map();
  const loaded=new Set();
  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';

  function inject(item){
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      if(item.type==='module')s.type='module';
      s.src=item.src;
      s.dataset.komoLazyLoaded='1';
      s.dataset.komoLazyGroup=item.group||'';
      s.onload=()=>resolve();
      s.onerror=()=>reject(new Error(`Unable to load ${item.src}`));
      document.body.appendChild(s);
    });
  }

  function signal(name,reason){
    const detail={group:name,route:route(),reason,version:V};
    window.dispatchEvent(new CustomEvent('komo:lazy-route-ready',{detail}));
    window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:detail.route,source:'lazy-route-runtime'}}));
    setTimeout(()=>window.dispatchEvent(new CustomEvent('komo:data-ready',{detail:{source:'lazy-route-runtime',group:name}})),0);
  }

  function load(name,reason='route'){
    if(!name)return Promise.resolve(false);
    if(loaded.has(name))return Promise.resolve(true);
    if(jobs.has(name))return jobs.get(name);
    const items=(manifest.groups?.[name]||[]).map(x=>({...x,group:name}));
    if(!items.length){loaded.add(name);return Promise.resolve(false)}
    document.documentElement.dataset.komoLazyLoading=name;
    const job=(async()=>{
      const started=performance.now();
      try{
        for(const item of items)await inject(item);
        loaded.add(name);
        document.documentElement.dataset.komoLazyLast=name;
        signal(name,reason);
        window.dispatchEvent(new CustomEvent('komo:lazy-metrics',{detail:{group:name,count:items.length,duration:Math.round(performance.now()-started)}}));
        return true;
      }catch(error){
        console.error('[pulse-lazy]',name,error);
        window.dispatchEvent(new CustomEvent('komo:lazy-route-error',{detail:{group:name,error:String(error?.message||error)}}));
        throw error;
      }finally{
        delete document.documentElement.dataset.komoLazyLoading;
        jobs.delete(name);
      }
    })();
    jobs.set(name,job);
    return job;
  }

  function groupForRoute(r){return r==='clinical'||r==='admin'?'professional':null}
  function check(reason='route'){const g=groupForRoute(route());if(g)load(g,reason).catch(()=>{})}

  ['hashchange','pageshow','popstate','komo:canonical-route','komo:session-ready'].forEach(evt=>window.addEventListener(evt,()=>check(evt),{passive:true}));
  document.addEventListener('click',event=>{
    const clinical=event.target.closest?.('#modeSwitch [data-mode="clinical"],a[href="#clinical"],[data-route="clinical"],[data-mode="clinical"]');
    const admin=event.target.closest?.('a[href="#admin"],[data-route="admin"]');
    if(clinical||admin)load('professional','intent').catch(()=>{});
  },true);
  queueMicrotask(()=>check('boot'));
  window.KomoLazyRoutes={version:V,load,isLoaded:name=>loaded.has(name),manifest:()=>manifest};
})();
