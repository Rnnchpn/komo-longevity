(function(){
  const HOST='https://pulse.komolongevity.com';
  const portals=new Map();
  let raf=0;
  function patientId(row){
    const el=row.querySelector('[data-k2tw-open]');
    if(el?.dataset?.k2twOpen)return el.dataset.k2twOpen;
    const a=row.querySelector('a[href*="dossier.html?patient="]');
    if(a){try{return new URL(a.href,location.href).searchParams.get('patient')||''}catch{}}
    return '';
  }
  function ensurePortal(row){
    const id=patientId(row); if(!id)return;
    let a=portals.get(id);
    if(!a){
      a=document.createElement('a');
      a.className='k2-portal-patient-link-v8';
      a.href=`${HOST}/dossier.html?patient=${encodeURIComponent(id)}`;
      a.setAttribute('aria-label','Ouvrir le dossier patient');
      a.title='Ouvrir le dossier patient';
      a.dataset.patientId=id;
      document.body.appendChild(a);
      portals.set(id,a);
    }
    a._row=row;
  }
  function sync(){
    raf=0;
    const live=new Set();
    document.querySelectorAll('.k2tw-row').forEach(row=>{
      const id=patientId(row); if(!id)return;
      live.add(id); ensurePortal(row);
      const a=portals.get(id),r=row.getBoundingClientRect();
      const visible=r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight;
      if(!visible){a.style.display='none';return}
      a.style.display='block';
      a.style.left=`${Math.max(0,r.left)}px`;
      a.style.top=`${Math.max(0,r.top)}px`;
      a.style.width=`${Math.max(1,Math.min(innerWidth,r.right)-Math.max(0,r.left))}px`;
      a.style.height=`${Math.max(1,Math.min(innerHeight,r.bottom)-Math.max(0,r.top))}px`;
    });
    for(const [id,a] of portals){if(!live.has(id)){a.remove();portals.delete(id)}}
  }
  function schedule(){if(raf)return;raf=requestAnimationFrame(sync)}
  const st=document.createElement('style');
  st.id='k2-portal-patient-style-v8';
  st.textContent=`.k2-portal-patient-link-v8{position:fixed!important;z-index:2147483647!important;display:block;background:transparent!important;pointer-events:auto!important;cursor:pointer!important;text-decoration:none!important;border-radius:18px!important}.k2-portal-patient-link-v8:focus-visible{outline:3px solid rgba(41,58,48,.32)!important;outline-offset:-3px!important}`;
  document.head.appendChild(st);
  const mo=new MutationObserver(schedule);mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','style']});
  addEventListener('scroll',schedule,true);addEventListener('resize',schedule);addEventListener('hashchange',()=>setTimeout(schedule,50));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,250));
  setInterval(schedule,900);
  window.KomoCenterPatientPortalLinksV8={sync:schedule};
})();