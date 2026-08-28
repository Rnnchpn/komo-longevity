(function(){
  const SELECTOR='.k2tw-row';
  function patientHref(row){
    const native=row.querySelector('a[href*="dossier.html?patient="]');
    if(native)return native.getAttribute('href');
    const button=row.querySelector('[data-k2tw-open]');
    const id=button?.getAttribute('data-k2tw-open');
    return id?`./dossier.html?patient=${encodeURIComponent(id)}`:'';
  }
  function upgradeRow(row){
    if(!row||row.dataset.k2absolute==='1')return;
    const href=patientHref(row);if(!href)return;
    row.dataset.k2absolute='1';
    row.style.setProperty('position','relative','important');
    row.style.setProperty('z-index','2147483001','important');
    row.style.setProperty('pointer-events','auto','important');
    const old=row.querySelector('a[href*="dossier.html?patient="]');
    if(old){old.style.setProperty('pointer-events','none','important');old.tabIndex=-1;}
    const btn=row.querySelector('[data-k2tw-open]');if(btn)btn.style.setProperty('pointer-events','none','important');
    const a=document.createElement('a');
    a.href=href;a.className='k2absolute-link';a.setAttribute('aria-label','Ouvrir le dossier patient');
    a.innerHTML='<span class="sr-only">Ouvrir le dossier patient</span>';
    row.appendChild(a);
  }
  function upgrade(root=document){root.querySelectorAll?.(SELECTOR).forEach(upgradeRow);if(root.matches?.(SELECTOR))upgradeRow(root)}
  const st=document.createElement('style');st.id='k2absolute-style-v7';st.textContent=`
  body.komo-pro-mode #viewRoot,body.komo-pro-mode #kcpView,body.komo-pro-mode .k2tw-patients,body.komo-pro-mode .k2tw-list{position:relative!important;z-index:2147483000!important;pointer-events:auto!important}
  body.komo-pro-mode .k2tw-row{position:relative!important;z-index:2147483001!important;pointer-events:auto!important}
  .k2absolute-link{position:absolute!important;inset:0!important;z-index:2147483002!important;display:block!important;pointer-events:auto!important;cursor:pointer!important;border-radius:inherit!important;background:transparent!important;text-decoration:none!important}
  .k2tw-row>.k2tw-person,.k2tw-row>.k2tw-cell,.k2tw-row>.k2tw-open,.k2tw-row>.k2native-dossier-link{position:relative!important;z-index:2147483003!important;pointer-events:none!important}
  .k2absolute-link:focus-visible{outline:3px solid rgba(41,58,48,.28)!important;outline-offset:2px!important}
  `;document.head.appendChild(st);
  const mo=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)upgrade(n)});mo.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded',()=>upgrade());setInterval(()=>upgrade(),700);
  window.KomoCenterAbsolutePatientLinksV7={upgrade};
})();