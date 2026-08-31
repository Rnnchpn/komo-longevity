const RUN_HASH='#run';
const previewHost=()=>location.hostname.endsWith('.vercel.app')||location.hostname==='localhost'||location.hostname==='127.0.0.1';
const runtimeRole=()=>window.KomoRuntime?.role||window.KomoRuntime?.getContext?.()?.role||'member';
const canRun=()=>runtimeRole()==='founder'||(previewHost()&&runtimeRole()==='admin');
const qs=(s,r=document)=>r.querySelector(s);

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
      <div class="kfr-chat-head"><div><h2>KŌMŌ AI</h2><p data-kfr-context-label>Command Center · Business workspace</p></div><span class="kfr-status"><span class="kfr-status-dot"></span>Foundation active</span></div>
      <div class="kfr-thread" data-kfr-thread><article class="kfr-message agent"><p><strong>RUN est prêt pour sa première couche.</strong><br>Je pourrai ici rechercher les documents, préparer les mails, lire l’agenda et piloter Pulse. Les connecteurs externes ne sont pas encore activés sur cette branche.</p><span class="kfr-meta">KŌMŌ AI · preview</span></article></div>
      <div class="kfr-composer-wrap">
        <div class="kfr-tools">${['Drive','Mail','Calendar','Pulse','Web'].map((x,i)=>`<button class="kfr-tool${i===0?' active':''}" type="button" data-kfr-tool="${x}">${icons[x.toLowerCase()]||''} ${x}</button>`).join('')}</div>
        <form class="kfr-composer" data-kfr-form><textarea class="kfr-input" rows="1" placeholder="Demandez à KŌMŌ AI…" data-kfr-input></textarea><button class="kfr-send" type="submit" aria-label="Envoyer">↑</button></form>
      </div>
    </div>
    <aside class="kfr-workspace"><div class="kfr-workspace-head"><h3>Workspace</h3></div><div class="kfr-tabs">${['Drive','Mail','Calendar','Pulse','Web'].map((x,i)=>`<button class="kfr-tab${i===0?' active':''}" type="button" data-kfr-tab="${x}">${x}</button>`).join('')}</div><div class="kfr-panel" data-kfr-panel></div></aside>
  </section>`;
}
function renderPanel(name='Drive'){const panel=qs('[data-kfr-panel]');if(!panel)return;const copy=workspaceCopy[name]||workspaceCopy.Drive;panel.innerHTML=`<div class="kfr-card"><h4>${copy.title}</h4><p>${copy.body}</p><small>${copy.status}</small></div>${name==='Pulse'?'<div class="kfr-card"><h4>Objects Pulse</h4><p>Cases · Operators · Network · Assessments · Analytics</p><small>Les droits seront contrôlés côté serveur.</small></div>':'<button class="kfr-connect" type="button" disabled>Connexion sécurisée à venir</button>'}<div class="kfr-empty">RUN n’exécutera aucune écriture externe tant que les permissions OAuth et les confirmations d’action ne sont pas en place.</div>`}
function addMessage(text,kind='user'){const thread=qs('[data-kfr-thread]');if(!thread)return;const article=document.createElement('article');article.className=`kfr-message ${kind}`;const p=document.createElement('p');p.textContent=text;article.appendChild(p);thread.appendChild(article);thread.scrollTop=thread.scrollHeight}
function selectContext(btn){qsAll('[data-kfr-context]').forEach(x=>x.classList.toggle('active',x===btn));const label=btn.dataset.kfrContext||'Command Center';const contextLabel=qs('[data-kfr-context-label]');if(contextLabel)contextLabel.textContent=`${label} · Business workspace`;addMessage(`Contexte actif : ${label}.`,'agent')}
function resetConversation(){const thread=qs('[data-kfr-thread]');if(!thread)return;thread.innerHTML='<article class="kfr-message agent"><p><strong>Nouvelle conversation RUN.</strong><br>Choisissez un contexte à gauche ou demandez directement une action.</p><span class="kfr-meta">KŌMŌ AI · preview</span></article>';qs('[data-kfr-input]')?.focus()}
function bindRun(){
  qsAll('[data-kfr-tab],[data-kfr-tool]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.kfrTab||btn.dataset.kfrTool;qsAll('[data-kfr-tab]').forEach(x=>x.classList.toggle('active',x.dataset.kfrTab===name));qsAll('[data-kfr-tool]').forEach(x=>x.classList.toggle('active',x.dataset.kfrTool===name));renderPanel(name)}));
  qsAll('[data-kfr-context]').forEach(btn=>btn.addEventListener('click',()=>selectContext(btn)));
  qs('[data-kfr-new]')?.addEventListener('click',resetConversation);
  const form=qs('[data-kfr-form]'),input=qs('[data-kfr-input]');
  form?.addEventListener('submit',e=>{e.preventDefault();const value=input?.value.trim();if(!value)return;addMessage(value,'user');input.value='';setTimeout(()=>addMessage('Le shell RUN fonctionne. La prochaine étape est de connecter cette commande au registre d’actions sécurisé (Drive, Mail, Calendar, Pulse).','agent'),120)});
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form?.requestSubmit()}});renderPanel('Drive')
}
function qsAll(s,r=document){return [...r.querySelectorAll(s)]}
function mount(){if(location.hash!==RUN_HASH)return;if(!canRun()){if(previewHost())console.warn('[KOMO RUN] access denied for role',runtimeRole());window.KomoPatientNavigation?.go?.('home');return}const root=qs('#viewRoot');if(!root)return;setHeader();root.innerHTML=shell();bindRun();window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:'run'}}))}
function ensureShortcut(){const top=qs('.topbar-actions');if(!top)return;let btn=qs('[data-founder-run]');if(!canRun()){btn?.remove();return}if(!btn){btn=document.createElement('button');btn.type='button';btn.className='admin-shortcut';btn.dataset.founderRun='1';btn.textContent='RUN';btn.setAttribute('aria-label','Ouvrir KŌMŌ RUN');btn.addEventListener('click',()=>window.KomoPatientNavigation?.go?.('run'));top.prepend(btn)}}
function schedule(){setTimeout(()=>{ensureShortcut();if(location.hash===RUN_HASH)mount()},40)}
['hashchange','pageshow','komo:session-ready','komo:data-ready','komo:route-ready'].forEach(evt=>window.addEventListener(evt,schedule));document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,450));setTimeout(schedule,1000);
window.KomoFounderRun={mount,canRun};
