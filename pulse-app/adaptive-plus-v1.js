/* KŌMØ Pulse — refined Plus menu */
(() => {
  let raf=0;
  function route(){return location.hash.replace(/^#/,'')||'home'}
  function role(){return window.KomoRuntime?.role||window.KomoRuntime?.getContext?.()?.role||'member'}
  function mode(){return route()==='admin'?'admin':route()==='clinical'?'pro':'patient'}
  function button(label,action,extra=''){return`<button type="button" class="kam-sheet-action ${extra}" data-kam-action="${action}"><span>${label}</span><b>→</b></button>`}
  function space(label,action,active=false,extra=''){return`<button type="button" class="${active?'active ':''}${extra}" data-kam-action="${action}">${label}</button>`}
  function content(){
    const m=mode(),r=role(),pro=['professional','admin'].includes(r),admin=r==='admin';
    let spaces=space('Patient','patient:home',m==='patient');
    if(pro)spaces+=space('Pro','pro:dashboard',m==='pro');
    if(admin)spaces+=space('Admin','admin',m==='admin','admin');
    let actions='';
    if(m==='patient')actions=button('Rendez-vous','patient:documents')+button('Messages','patient:messages')+button('Mon profil','patient:profile');
    if(m==='pro')actions=button('Agenda','pro:planning')+button('Analyse musculaire','pro:myocare')+button('Messages','pro:messages');
    if(m==='admin')actions=button('Patients','admin:patients')+button('Accès professionnels','admin:pros')+button('Demandes Motion','admin:motion');
    if(admin&&m!=='admin')actions=button('Administration KŌMØ','admin','admin-entry')+actions;
    const spaceClass=admin?'':'two';
    return `<div class="kam-sheet-handle"></div><div class="kam-sheet-head"><div><small>KŌMØ PULSE</small><strong>Plus</strong></div><button type="button" data-kam-close aria-label="Fermer">×</button></div>${pro?`<div class="kam-plus-title">CHANGER D’ESPACE</div><div class="kam-plus-spaces ${spaceClass}">${spaces}</div>`:''}<div class="kam-plus-title">${m==='admin'?'ADMINISTRATION':m==='pro'?'ESPACE PROFESSIONNEL':'VOTRE ESPACE'}</div><div class="kam-sheet-grid">${actions}</div><div class="kam-sheet-links"><a href="https://komolongevity.com/fr/" target="_blank" rel="noopener noreferrer">Site principal KŌMØ <span>↗</span></a><a href="https://komolongevity.com/media" target="_blank" rel="noopener noreferrer">KŌMØ Library <span>↗</span></a><a href="https://komolongevity.com/fr/contact/" target="_blank" rel="noopener noreferrer">Aide & contact <span>↗</span></a><button type="button" class="kam-logout" data-kam-action="logout">Se déconnecter</button></div>`;
  }
  function patch(){
    const sheet=document.querySelector('#kamSheet');if(!sheet)return;
    const sig=`${mode()}:${role()}`;
    if(sheet.dataset.plusRedesign===sig)return;
    sheet.dataset.plusRedesign=sig;
    sheet.innerHTML=content();
  }
  function refresh(){cancelAnimationFrame(raf);raf=requestAnimationFrame(patch)}
  const obs=new MutationObserver(refresh);obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-signature']});
  ['hashchange','komo:session-ready','komo:data-ready','komo:route-ready','komo:admin-open','pageshow'].forEach(x=>window.addEventListener(x,refresh));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,350));setTimeout(refresh,900);setTimeout(refresh,1600);
})();
