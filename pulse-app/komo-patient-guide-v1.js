/* Komo — patient guide V1 */
(() => {
  'use strict';
  const VERSION='1.0.0';
  let observer=null;
  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
  const role=()=>window.KomoRuntime?.role||window.KomoRuntime?.getContext?.()?.role||'member';
  const isPatient=()=>!['clinical','admin'].includes(route())&&(!document.querySelector('#modeSwitch [data-mode="clinical"]')?.classList.contains('active'));

  const contexts={
    home:{kicker:'AUJOURD’HUI',title:'Je vous aide à aller à l’essentiel.',copy:'Retrouvez votre état, ce qui a changé et la prochaine action utile sans parcourir toute l’application.',actions:[['Voir mon bilan','results'],['Voir ma trajectoire','path'],['Préparer la suite','documents']]},
    results:{kicker:'VOTRE BILAN',title:'Comprendre ce que votre bilan a montré.',copy:'Je peux vous ramener au résultat publié, aux éléments à retenir et à la suite du parcours.',actions:[['Lire mes résultats','results'],['Voir mon évolution','path'],['Préparer la prochaine étape','documents']]},
    path:{kicker:'VOTRE TRAJECTOIRE',title:'Voir si votre mobilité évolue.',copy:'Comparez uniquement vos références réellement publiées et retrouvez ce qui a changé dans le temps.',actions:[['Voir ma trajectoire','path'],['Revoir mon bilan','results'],['Voir mon suivi','plan']]},
    plan:{kicker:'VOTRE SUIVI',title:'Savoir quoi faire maintenant.',copy:'Retrouvez vos priorités validées et ce qui compte jusqu’à votre prochaine réévaluation.',actions:[['Voir mon suivi','plan'],['Voir mon agenda','documents'],['Revoir mes résultats','results']]},
    documents:{kicker:'VOTRE PROCHAINE ÉTAPE',title:'Préparer votre rendez-vous simplement.',copy:'Retrouvez votre préparation, vos documents et les informations utiles avant la prochaine consultation.',actions:[['Voir mon dossier','documents'],['Voir mes résultats','results'],['Retour à l’accueil','home']]}
  };

  function go(target){
    if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go(target);
    else location.hash=target;
    closePanel();
  }
  function closePanel(){const p=document.querySelector('#komoPatientGuidePanel');if(p)p.hidden=true;document.querySelector('#komoPatientGuideLauncher')?.setAttribute('aria-expanded','false')}
  function fallbackPanel(){
    let panel=document.querySelector('#komoPatientGuidePanel');
    if(panel)return panel;
    panel=document.createElement('aside');panel.id='komoPatientGuidePanel';panel.hidden=true;panel.setAttribute('aria-label','Komo, votre guide Pulse');document.body.appendChild(panel);
    panel.addEventListener('click',event=>{const b=event.target.closest('[data-kpg-route]');if(b)go(b.dataset.kpgRoute);if(event.target.closest('[data-kpg-close]'))closePanel()});
    return panel;
  }
  function renderFallback(){
    const panel=fallbackPanel(),ctx=contexts[route()]||contexts.home;
    panel.innerHTML=`<div class="kpg-panel-head"><div class="kpg-panel-brand"><span class="kpg-eyes" aria-hidden="true">ōø</span><div><small>Komo · votre guide</small><strong>Pulse en clair</strong></div></div><button class="kpg-close" type="button" data-kpg-close aria-label="Fermer">×</button></div><div class="kpg-panel-body"><span>${ctx.kicker}</span><h3>${ctx.title}</h3><p>${ctx.copy}</p><div class="kpg-actions">${ctx.actions.map(([label,target])=>`<button type="button" data-kpg-route="${target}"><span>${label}</span><b>→</b></button>`).join('')}</div><p class="kpg-note">Komo vous guide dans Pulse. Les résultats médicaux restent ceux qui ont été validés pour restitution.</p></div>`;
    panel.hidden=false;document.querySelector('#komoPatientGuideLauncher')?.setAttribute('aria-expanded','true');
  }
  function operatorVisible(){
    const selectors=['#komoOperatorPanel','[data-komo-operator-panel]','.komo-operator-panel','.komo-operator-drawer'];
    return selectors.some(s=>{const el=document.querySelector(s);return el&&!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'});
  }
  function openGuide(){
    closePanel();
    window.dispatchEvent(new CustomEvent('komo:operator-open',{detail:{source:'patient-guide',route:route()}}));
    const legacy=document.querySelector('#komoOperatorLauncher');
    if(legacy){try{legacy.click()}catch{}}
    setTimeout(()=>{if(!operatorVisible())renderFallback()},140);
  }
  function ensureLauncher(){
    if(!isPatient()){
      document.body.classList.remove('komo-patient-guide-active');
      document.querySelector('#komoPatientGuideLauncher')?.remove();
      closePanel();return;
    }
    const app=document.querySelector('#appShell');if(!app||app.hidden)return;
    document.body.classList.add('komo-patient-guide-active');
    let button=document.querySelector('#komoPatientGuideLauncher');
    if(!button){
      button=document.createElement('button');button.id='komoPatientGuideLauncher';button.type='button';button.setAttribute('aria-label','Ouvrir Komo, votre guide Pulse');button.setAttribute('aria-expanded','false');button.innerHTML='<span class="kpg-eyes" aria-hidden="true">ōø</span><span class="kpg-copy"><strong>Komo</strong><small>Vous guide</small></span><i class="kpg-dot" aria-hidden="true"></i>';button.addEventListener('click',openGuide);app.appendChild(button);
    }
  }
  function refresh(){ensureLauncher();if(!isPatient())return;const p=document.querySelector('#komoPatientGuidePanel');if(p&&!p.hidden)renderFallback()}
  function mount(){if(observer)return;observer=new MutationObserver(()=>requestAnimationFrame(ensureLauncher));observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});ensureLauncher()}
  ['hashchange','pageshow','komo:route-ready','komo:session-ready','komo:session-cleared'].forEach(name=>window.addEventListener(name,refresh));
  document.addEventListener('click',event=>{const p=document.querySelector('#komoPatientGuidePanel'),l=document.querySelector('#komoPatientGuideLauncher');if(p&&!p.hidden&&!p.contains(event.target)&&!l?.contains(event.target))closePanel()},true);
  document.addEventListener('DOMContentLoaded',mount);if(document.readyState!=='loading')mount();
  window.KomoPatientGuide={version:VERSION,open:openGuide,refresh};
})();
