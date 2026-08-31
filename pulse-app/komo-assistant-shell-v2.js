/* KŌMØ Pulse — Komo Assistant Shell V2.1 */
(() => {
  'use strict';
  const VERSION='2.1.0';
  let history=[];
  let loading=false;

  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
  const ctx=()=>window.KomoRuntime?.getContext?.()||{};
  const role=()=>ctx().role||window.KomoRuntime?.role||'member';
  const isAdmin=()=>role()==='admin'||route()==='admin';
  const isPro=()=>['admin','professional'].includes(role())||['admin','clinical'].includes(route());
  const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function ensureStyle(){
    if(document.querySelector('#komoAssistantV2Style'))return;
    const link=document.createElement('link');
    link.id='komoAssistantV2Style';
    link.rel='stylesheet';
    link.href='./komo-assistant-shell-v2.css';
    document.head.appendChild(link);
  }
  function appVisible(){const app=document.querySelector('#appShell');return !!app&&!app.hidden}
  function hideLegacy(){
    document.querySelector('#komoOperatorLauncher')?.setAttribute('hidden','');
    document.querySelector('#komoPatientGuideLauncher')?.setAttribute('hidden','');
  }
  function patientId(){
    return document.querySelector('[data-patient-id]')?.getAttribute('data-patient-id')||
      document.querySelector('[data-admin-patient-id]')?.getAttribute('data-admin-patient-id')||null;
  }
  function intro(){
    if(isAdmin())return{eyebrow:'KŌMØ PRO',title:'Je suis Komo.',copy:'Je vous aide à prioriser le centre, préparer les dossiers et retrouver immédiatement ce qui demande votre attention.'};
    if(isPro())return{eyebrow:'KŌMØ PRO',title:'Je suis Komo.',copy:'Je vous aide à préparer vos consultations, comprendre les dossiers et organiser les prochaines actions.'};
    return{eyebrow:'VOTRE ASSISTANT KŌMØ',title:'Je suis Komo.',copy:'Je m’appuie sur votre contexte Pulse pour vous expliquer ce qui compte, suivre votre progression et vous proposer la prochaine action utile.'};
  }
  function quickActions(){
    if(isAdmin())return[['Que dois-je traiter en priorité ?','Quelles sont les priorités du centre aujourd’hui ?'],['Dossiers incomplets','Quels dossiers patients sont incomplets ?'],['Bilans à revoir','Quels bilans Motion attendent une revue ?']];
    if(isPro())return[['Préparer ma journée','Résume les priorités de ma journée.'],['Patients à revoir','Quels patients nécessitent mon attention ?'],['Préparer une consultation','Aide-moi à préparer la prochaine consultation.']];
    const r=route();
    if(r==='results')return[['Comprendre mon bilan','Explique-moi simplement mon dernier bilan publié.'],['Ce qui compte','Quels sont les deux éléments à retenir ?'],['Et maintenant ?','Quelle est ma prochaine étape ?']];
    if(r==='trajectory')return[['Mon évolution','Qu’est-ce qui a changé depuis ma dernière référence ?'],['Ce qui progresse','Qu’est-ce qui s’améliore ?'],['Prochaine étape','Que dois-je faire maintenant ?']];
    if(r==='key')return[['Ma journée','Que racontent mes données du jour ?'],['Ma régularité','Comment évolue mon activité cette semaine ?'],['Objectif du jour','Que me reste-t-il à faire aujourd’hui ?']];
    return[['Ma journée','Résume-moi ce qui compte aujourd’hui.'],['Mon bilan','Explique-moi mon dernier résultat disponible.'],['Que faire maintenant ?','Quelle est ma prochaine action utile ?']];
  }
  function ensureShell(){
    ensureStyle();
    hideLegacy();
    if(!appVisible()){
      document.querySelector('#komoAssistantRail')?.remove();
      document.querySelector('#komoAssistantDrawer')?.remove();
      return;
    }
    let rail=document.querySelector('#komoAssistantRail');
    if(!rail){
      rail=document.createElement('button');
      rail.id='komoAssistantRail';
      rail.type='button';
      rail.setAttribute('aria-controls','komoAssistantDrawer');
      rail.setAttribute('aria-expanded','false');
      rail.innerHTML='<span class="ka2-peek" aria-hidden="true"><b>ō</b><b>ø</b></span><span class="ka2-rail-copy"><strong>Je suis Komo</strong><small>Écrivez-moi</small></span>';
      rail.addEventListener('click',open);
      document.body.appendChild(rail);
    }
    rail.querySelector('strong').textContent=isPro()?'Komo Pro':'Je suis Komo';
    rail.querySelector('small').textContent=isPro()?'Assistant du centre':'Écrivez-moi';
    if(!document.querySelector('#komoAssistantDrawer'))createDrawer();
  }
  function createDrawer(){
    const drawer=document.createElement('aside');
    drawer.id='komoAssistantDrawer';
    drawer.hidden=true;
    drawer.setAttribute('aria-label','Komo, assistant KŌMØ Pulse');
    drawer.innerHTML='<div class="ka2-shell"><header class="ka2-head"><div class="ka2-brand"><span class="ka2-eyes" aria-hidden="true"><b>ō</b><b>ø</b></span><div><small>KŌMØ PULSE</small><strong>Komo</strong></div></div><button type="button" data-ka2-close aria-label="Fermer">×</button></header><div class="ka2-scroll"><section class="ka2-intro" data-ka2-intro></section><section class="ka2-tasks"><span>POUR COMMENCER</span><div data-ka2-quick></div></section><section class="ka2-chat" data-ka2-chat></section></div><form class="ka2-form" data-ka2-form><textarea rows="1" maxlength="2500" placeholder="Écrivez à Komo…" aria-label="Écrire à Komo"></textarea><button type="submit" aria-label="Envoyer">↑</button></form></div>';
    drawer.addEventListener('click',event=>{
      if(event.target.closest('[data-ka2-close]'))close();
      const q=event.target.closest('[data-ka2-question]');if(q)send(q.getAttribute('data-ka2-question')||'');
      const a=event.target.closest('[data-ka2-action]');if(a)runAction(a);
    });
    drawer.querySelector('[data-ka2-form]').addEventListener('submit',event=>{event.preventDefault();const t=drawer.querySelector('textarea');const value=t.value.trim();if(value){t.value='';send(value)}});
    document.body.appendChild(drawer);
    renderIntro();
  }
  function renderIntro(){
    const d=document.querySelector('#komoAssistantDrawer');if(!d)return;
    const i=intro();
    d.querySelector('[data-ka2-intro]').innerHTML=`<span>${esc(i.eyebrow)}</span><h2>${esc(i.title)}</h2><p>${esc(i.copy)}</p>`;
    d.querySelector('[data-ka2-quick]').innerHTML=quickActions().map(([label,q])=>`<button type="button" data-ka2-question="${esc(q)}"><span>${esc(label)}</span><b>→</b></button>`).join('');
  }
  function open(){
    ensureShell();renderIntro();
    const d=document.querySelector('#komoAssistantDrawer');if(!d)return;
    d.hidden=false;document.body.classList.add('ka2-open');
    document.querySelector('#komoAssistantRail')?.setAttribute('aria-expanded','true');
    setTimeout(()=>d.querySelector('textarea')?.focus(),80);
  }
  function close(){const d=document.querySelector('#komoAssistantDrawer');if(d)d.hidden=true;document.body.classList.remove('ka2-open');document.querySelector('#komoAssistantRail')?.setAttribute('aria-expanded','false')}
  function addMessage(kind,html){const chat=document.querySelector('[data-ka2-chat]');if(!chat)return;const item=document.createElement('article');item.className=`ka2-message ${kind}`;item.innerHTML=html;chat.appendChild(item);chat.scrollTop=chat.scrollHeight;return item}
  function setBusy(on){loading=on;const form=document.querySelector('[data-ka2-form]');if(form){form.querySelector('textarea').disabled=on;form.querySelector('button').disabled=on}}
  function actionHtml(actions){if(!Array.isArray(actions)||!actions.length)return'';return`<div class="ka2-actions">${actions.slice(0,3).map((a,i)=>`<button type="button" data-ka2-action="${i}" data-action="${esc(a.action||'none')}" data-route="${esc(a.route||'none')}" data-patient="${esc(a.patient_id||'')}">${esc(a.label||'Ouvrir')} <b>→</b></button>`).join('')}</div>`}
  async function send(message){
    if(loading||!message)return;
    open();
    addMessage('user',`<p>${esc(message)}</p>`);
    const pending=addMessage('assistant pending','<span class="ka2-thinking">Komo analyse votre contexte Pulse…</span>');
    setBusy(true);
    try{
      if(!window.KomoAI?.ask)throw new Error('Komo AI indisponible');
      const data=await window.KomoAI.ask(message,{patientId:patientId(),history});
      const r=data?.reply||data||{};
      pending.className='ka2-message assistant';
      pending.innerHTML=`${r.headline?`<strong>${esc(r.headline)}</strong>`:''}<p>${esc(r.answer||'Je n’ai pas assez de données pour répondre précisément.')}</p>${actionHtml(r.suggested_actions)}`;
      history=[...history,{role:'user',content:message},{role:'assistant',content:r.answer||''}].slice(-8);
    }catch(e){pending.className='ka2-message assistant error';pending.innerHTML='<strong>Je reste disponible.</strong><p>Je n’ai pas pu charger votre contexte à cet instant. Vos données restent dans Pulse ; réessayez dans quelques secondes.</p>';console.error('[komo-assistant-v2]',e)}finally{setBusy(false)}
  }
  function runAction(el){
    const action=el.dataset.action,routeName=el.dataset.route,patient=el.dataset.patient;
    if(action==='open_route'&&routeName&&routeName!=='none')window.KomoPatientNavigation?.go?.(routeName);
    else if(action==='open_patient_chart'&&patient){window.dispatchEvent(new CustomEvent('komo:open-patient-chart',{detail:{patient_id:patient}}));}
    else if(action==='draft_patient_reminder'&&patient){window.KomoAI?.draftReminder?.(patient).then(x=>addMessage('assistant',`<strong>Brouillon préparé</strong><p>${esc(x?.draft||x?.text||'Le brouillon est prêt à être vérifié.')}</p>`)).catch(()=>{});}
    close();
  }
  function refresh(){ensureShell();renderIntro()}
  ['hashchange','pageshow','komo:route-ready','komo:session-ready','komo:session-cleared','komo:admin-open'].forEach(name=>window.addEventListener(name,()=>setTimeout(refresh,30)));
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(refresh,250);setTimeout(refresh,900)});
  if(document.readyState!=='loading'){setTimeout(refresh,80);setTimeout(refresh,700)}
  window.addEventListener('komo:operator-open',open);
  window.KomoAssistantV2={version:VERSION,open,close,refresh,ask:send};
})();
