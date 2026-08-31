const RUN_HASH='#run';
const AI_SRC='./komo-ai-client-v1.js?v=20260831-run-founder-v1';
const previewHost=()=>location.hostname.endsWith('.vercel.app')||location.hostname==='localhost'||location.hostname==='127.0.0.1';
const runtimeRole=()=>window.KomoRuntime?.role||window.KomoRuntime?.getContext?.()?.role||'member';
const canRun=()=>runtimeRole()==='founder'||(previewHost()&&runtimeRole()==='admin');
const qs=(s,r=document)=>r.querySelector(s);
const qsAll=(s,r=document)=>[...r.querySelectorAll(s)];
let mounted=false,scheduled=0,busy=false,aiLoader=null,history=[];

const icons={drive:'▦',mail:'✉',calendar:'◷',pulse:'P',web:'↗'};
const workspaceCopy={
  Drive:{title:'Google Drive',body:'Recherche, classement, prévisualisation et export des documents KŌMŌ.',status:'Connecteur à brancher'},
  Mail:{title:'Gmail',body:'Lecture, synthèse, préparation de brouillons et pièces jointes. Envoi toujours confirmé.',status:'Connecteur à brancher'},
  Calendar:{title:'Calendar',body:'Lecture agenda, disponibilité et préparation des réunions depuis RUN.',status:'Connecteur à brancher'},
  Pulse:{title:'Pulse',body:'Accès aux objets KŌMŌ : Cases, Operators, Network, patients et analytics selon droits.',status:'Socle disponible'},
  Web:{title:'Web',body:'Recherche externe et veille, séparées des données cliniques et des données privées.',status:'Agent à brancher'}
};

function setHeader(){const eyebrow=qs('#pageEyebrow'),title=qs('#pageTitle');if(eyebrow)eyebrow.textContent='KŌMŌ RUN';if(title)title.textContent='Founder Command Center'}
function shell(){
  return `<section class="kfr-shell" data-kfr>
    <aside class="kfr-rail">
      <div class="kfr-rail-head"><span class="kfr-wordmark">KŌMŌ RUN</span>${previewHost()?'<span class="kfr-preview">Preview</span>':''}</div>
      <button class="kfr-new" type="button" data-kfr-new>＋ Nouvelle conversation</button>
      <div class="kfr-section-label">Projets</div>
      <div class="kfr-list">
        <button class="kfr-item active" type="button" data-kfr-context="Command Center">Command Center</button>
        <button class="kfr-item" type="button" data-kfr-context="Operator Program">Operator Program</button>
        <button class="kfr-item" type="button" data-kfr-context="Clinical">Clinical</button>
        <button class="kfr-item" type="button" data-kfr-context="Locotech Summit">Locotech Summit</button>
        <button class="kfr-item" type="button" data-kfr-context="KŌMŌ Life">KŌMŌ Life</button>
        <button class="kfr-item" type="button" data-kfr-context="Finance & Legal">Finance & Legal</button>
      </div>
      <div class="kfr-section-label">Conversations</div>
      <div class="kfr-list">
        <button class="kfr-item" type="button" data-kfr-context="Architecture commerciale">Architecture commerciale</button>
        <button class="kfr-item" type="button" data-kfr-context="Pulse — développement">Pulse — développement</button>
        <button class="kfr-item" type="button" data-kfr-context="Cases & Network">Cases & Network</button>
      </div>
      <div class="kfr-rail-foot">Accès privé Founder. Les actions sensibles devront être confirmées et auditées.</div>
    </aside>
    <div class="kfr-chat">
      <div class="kfr-chat-head"><div><h2>KŌMŌ AI</h2><p data-kfr-context-label>Command Center · Business workspace</p></div><span class="kfr-status"><span class="kfr-status-dot"></span><span data-kfr-status-label>AI ready</span></span></div>
      <div class="kfr-thread" data-kfr-thread><article class="kfr-message agent"><p><strong>RUN est prêt.</strong><br>KŌMŌ AI est connecté au moteur Founder dédié. Drive, Mail, Calendar et Web restent désactivés tant que leurs connecteurs sécurisés ne sont pas branchés.</p><span class="kfr-meta">KŌMŌ AI · founder preview</span></article></div>
      <div class="kfr-composer-wrap">
        <div class="kfr-tools">${['Drive','Mail','Calendar','Pulse','Web'].map((x,i)=>`<button class="kfr-tool${i===0?' active':''}" type="button" data-kfr-tool="${x}">${icons[x.toLowerCase()]||''} ${x}</button>`).join('')}</div>
        <form class="kfr-composer" data-kfr-form><textarea class="kfr-input" rows="1" maxlength="2500" placeholder="Demandez à KŌMŌ AI…" data-kfr-input></textarea><button class="kfr-send" type="submit" aria-label="Envoyer">↑</button></form>
      </div>
    </div>
    <aside class="kfr-workspace"><div class="kfr-workspace-head"><h3>Workspace</h3></div><div class="kfr-tabs">${['Drive','Mail','Calendar','Pulse','Web'].map((x,i)=>`<button class="kfr-tab${i===0?' active':''}" type="button" data-kfr-tab="${x}">${x}</button>`).join('')}</div><div class="kfr-panel" data-kfr-panel></div></aside>
  </section>`;
}
function renderPanel(name='Drive'){const panel=qs('[data-kfr-panel]');if(!panel)return;const copy=workspaceCopy[name]||workspaceCopy.Drive;panel.innerHTML=`<div class="kfr-card"><h4>${copy.title}</h4><p>${copy.body}</p><small>${copy.status}</small></div>${name==='Pulse'?'<div class="kfr-card"><h4>Objects Pulse</h4><p>Cases · Operators · Network · Assessments · Analytics</p><small>Les droits sont contrôlés côté serveur.</small></div>':'<button class="kfr-connect" type="button" disabled>Connexion sécurisée à venir</button>'}<div class="kfr-empty">RUN n’exécutera aucune écriture externe tant que les permissions OAuth et les confirmations d’action ne sont pas en place.</div>`}
function addMessage(text,kind='user',meta=''){const thread=qs('[data-kfr-thread]');if(!thread)return null;const article=document.createElement('article');article.className=`kfr-message ${kind}`;const p=document.createElement('p');p.textContent=String(text||'');article.appendChild(p);if(meta){const span=document.createElement('span');span.className='kfr-meta';span.textContent=meta;article.appendChild(span)}thread.appendChild(article);thread.scrollTop=thread.scrollHeight;return article}
function setBusy(on){busy=on;const input=qs('[data-kfr-input]'),send=qs('.kfr-send'),status=qs('[data-kfr-status-label]');if(input)input.disabled=on;if(send)send.disabled=on;if(status)status.textContent=on?'KŌMŌ AI réfléchit…':'AI ready'}
function selectContext(btn){qsAll('[data-kfr-context]').forEach(x=>x.classList.toggle('active',x===btn));const label=btn.dataset.kfrContext||'Command Center';const contextLabel=qs('[data-kfr-context-label]');if(contextLabel)contextLabel.textContent=`${label} · Business workspace`;addMessage(`Contexte actif : ${label}.`,'agent')}
function resetConversation(){history=[];const thread=qs('[data-kfr-thread]');if(!thread)return;thread.innerHTML='<article class="kfr-message agent"><p><strong>Nouvelle conversation RUN.</strong><br>Demandez directement quelque chose à KŌMŌ AI.</p><span class="kfr-meta">KŌMŌ AI · founder preview</span></article>';qs('[data-kfr-input]')?.focus()}
function ensureAI(){
  if(window.KomoAI?.ask)return Promise.resolve(window.KomoAI);
  if(aiLoader)return aiLoader;
  aiLoader=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-kfr-ai]');
    if(existing){existing.addEventListener('load',()=>window.KomoAI?.ask?resolve(window.KomoAI):reject(new Error('komo_ai_unavailable')),{once:true});existing.addEventListener('error',()=>reject(new Error('komo_ai_load_failed')),{once:true});return}
    const s=document.createElement('script');s.src=AI_SRC;s.dataset.kfrAi='1';s.onload=()=>window.KomoAI?.ask?resolve(window.KomoAI):reject(new Error('komo_ai_unavailable'));s.onerror=()=>reject(new Error('komo_ai_load_failed'));document.head.appendChild(s)
  }).catch(e=>{aiLoader=null;throw e});
  return aiLoader
}
function connectorGuard(message){
  const v=String(message||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(/\b(gmail|e-?mail|emails|mails?|boite mail|inbox)\b/.test(v))return'Mail';
  if(/\b(google drive|drive)\b/.test(v))return'Drive';
  if(/\b(google calendar|calendar)\b/.test(v))return'Calendar';
  if(/\b(recherche web|chercher sur (?:le )?web|internet)\b/.test(v))return'Web';
  return null
}
function connectorReply(name){return`${name} n’est pas encore activé sur cette preview. Le bot KŌMŌ AI fonctionne, mais cette action externe restera bloquée jusqu’au branchement sécurisé du connecteur.`}
function answerFrom(data){const r=data?.reply||data||{};const headline=String(r?.headline||'').trim(),answer=String(r?.answer||'').trim();return headline&&answer?`${headline}\n${answer}`:(answer||headline||'Je n’ai pas reçu de réponse exploitable.')}
function errorMessage(error){const code=String(error?.message||error||'');if(code.includes('session_required'))return'Votre session Pulse doit être active pour utiliser KŌMŌ AI.';if(code.includes('founder_forbidden'))return'RUN est réservé au compte Founder / Admin.';if(code.includes('ai_not_configured'))return'KŌMŌ AI n’est pas configuré sur cette preview.';if(code.includes('runtime_client_unavailable'))return'Le client Pulse n’est pas disponible dans cette session.';if(code.includes('ai_upstream_'))return'Le moteur Founder a bien été contacté mais la génération IA a échoué. Aucun fallback clinique n’est affiché.';return'KŌMŌ AI est momentanément indisponible. La conversation reste ouverte : vous pouvez réessayer sans recharger la page.'}
async function submitRunCommand(raw){
  const value=String(raw||'').trim();if(!value||busy)return;
  addMessage(value,'user');
  const input=qs('[data-kfr-input]');if(input)input.value='';
  const connector=connectorGuard(value);if(connector){addMessage(connectorReply(connector),'agent','KŌMŌ AI · connector status');return}
  const pending=addMessage('KŌMŌ AI réfléchit…','agent','KŌMŌ AI');setBusy(true);
  try{
    const ai=await ensureAI();
    const data=await ai.ask(value,{history});
    const text=answerFrom(data);
    if(pending){pending.querySelector('p').textContent=text;const meta=pending.querySelector('.kfr-meta');if(meta)meta.textContent=data?.fallback?'KŌMŌ AI · verified fallback':'KŌMŌ AI · founder'}
    history=[...history,{role:'user',content:value},{role:'assistant',content:text}].slice(-8)
  }catch(error){if(pending){pending.classList.add('error');pending.querySelector('p').textContent=errorMessage(error);const meta=pending.querySelector('.kfr-meta');if(meta)meta.textContent='KŌMŌ AI · error'}console.error('[KOMO RUN AI]',error)}finally{setBusy(false);qs('[data-kfr-input]')?.focus()}
}
function bindRun(){
  qsAll('[data-kfr-tab],[data-kfr-tool]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.kfrTab||btn.dataset.kfrTool;qsAll('[data-kfr-tab]').forEach(x=>x.classList.toggle('active',x.dataset.kfrTab===name));qsAll('[data-kfr-tool]').forEach(x=>x.classList.toggle('active',x.dataset.kfrTool===name));renderPanel(name);qs('[data-kfr-input]')?.focus()}));
  qsAll('[data-kfr-context]').forEach(btn=>btn.addEventListener('click',()=>selectContext(btn)));
  qs('[data-kfr-new]')?.addEventListener('click',resetConversation);
  const form=qs('[data-kfr-form]'),input=qs('[data-kfr-input]');
  form?.addEventListener('submit',e=>{e.preventDefault();submitRunCommand(input?.value)});
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form?.requestSubmit()}});
  renderPanel('Drive');ensureAI().catch(e=>console.warn('[KOMO RUN] AI preload failed',e?.message||e))
}
function mount(){
  if(location.hash!==RUN_HASH){mounted=false;return}
  if(!canRun()){if(previewHost())console.warn('[KOMO RUN] access denied for role',runtimeRole());window.KomoPatientNavigation?.go?.('home');return}
  const root=qs('#viewRoot');if(!root)return;
  setHeader();
  if(mounted&&root.querySelector('[data-kfr]'))return;
  root.innerHTML=shell();bindRun();mounted=true;
  window.dispatchEvent(new CustomEvent('komo:run-ready',{detail:{route:'run'}}));
}
function ensureShortcut(){const top=qs('.topbar-actions');if(!top)return;let btn=qs('[data-founder-run]');if(!canRun()){btn?.remove();return}if(!btn){btn=document.createElement('button');btn.type='button';btn.className='admin-shortcut';btn.dataset.founderRun='1';btn.textContent='RUN';btn.setAttribute('aria-label','Ouvrir KŌMŌ RUN');btn.addEventListener('click',()=>window.KomoPatientNavigation?.go?.('run'));top.prepend(btn)}}
function schedule(delay=40){clearTimeout(scheduled);scheduled=setTimeout(()=>{ensureShortcut();mount()},delay)}
window.addEventListener('hashchange',()=>schedule(20));
window.addEventListener('pageshow',()=>schedule(80));
['komo:session-ready','komo:data-ready'].forEach(evt=>window.addEventListener(evt,()=>schedule(50)));
document.addEventListener('DOMContentLoaded',()=>schedule(450));
setTimeout(()=>schedule(0),1000);
window.KomoFounderRun={mount,canRun,submit:submitRunCommand};
