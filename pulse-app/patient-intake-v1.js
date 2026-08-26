import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const ORG_KEY='komo_clinical_org';
const PATIENT_KEY='komo_clinical_patient';
const ASSESSMENT_KEY='komo_clinical_assessment';
const TAB_KEY='komo_clinical_tab';

const S={client:null,session:null,role:'member',requests:[],proRequests:[],organizations:[],professionals:[],active:false,loading:false};
let timer=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){if(!S.client)S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return S.client}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]))}
function fmt(v){if(!v)return'—';const d=new Date(v);return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)}
function status(v){return({submitted:'Demande reçue',assigned:'Attribuée',accepted:'Bilan préparé',scheduled:'Rendez-vous planifié',completed:'Terminé',declined:'Non poursuivie',cancelled:'Annulée'})[v]||v||'—'}
function statusClass(v){return ['accepted','scheduled','completed'].includes(v)?'good':v==='assigned'?'warn':v==='declined'?'bad':''}

async function invoke(body){
  const {data,error}=await sb().functions.invoke('patient-intake',{body});
  if(error)throw new Error(error.message||'Erreur serveur');
  if(data?.error){
    const messages={
      profile_incomplete:'Complétez votre profil avant d’envoyer une demande Motion.',
      request_already_open:'Une demande Motion est déjà en cours.',
      patient_profile_incomplete:'Le profil patient doit être complété avant de préparer Motion.',
      request_must_be_assigned_to_professional:'Cette demande doit d’abord être affectée à un professionnel.'
    };
    throw new Error(messages[data.error]||data.detail||data.error);
  }
  return data;
}

async function loadCenterTeam(){
  if(S.role==='admin')return [];
  const {data,error}=await sb().functions.invoke('center-team',{body:{action:'list'}});
  if(error||data?.error)return [];
  return data?.professionals||[];
}

async function base(){
  const {data:{session}}=await sb().auth.getSession();
  S.session=session;
  if(!session?.user)return false;
  const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();
  S.role=r.data?.role||'member';
  const x=await invoke({action:'status'});
  S.requests=x.requests||[];
  return true;
}

function latest(){return S.requests.find(x=>['submitted','assigned','accepted','scheduled'].includes(x.status))||S.requests[0]||null}

async function profileComplete(){
  if(!S.session?.user)return false;
  const p=await sb().from('profiles').select('first_name,last_name,birth_date,sex_at_birth,city').eq('id',S.session.user.id).maybeSingle();
  const x=p.data;
  return{ok:!!(x?.first_name&&x?.last_name&&x?.birth_date&&x?.sex_at_birth),profile:x||{}};
}

async function injectMember(){
  if(location.hash.replace(/^#/,'')!=='home'||!S.session?.user||['professional','admin'].includes(S.role))return;
  const root=document.querySelector('#viewRoot');
  if(!root||root.querySelector('[data-motion-request-card]'))return;
  const pc=await profileComplete(),r=latest();
  const wrap=document.createElement('section');
  wrap.dataset.motionRequestCard='1';
  wrap.className='pir-member-card';
  wrap.innerHTML=r
    ?`<div><p class="eyebrow">KŌMØ MOTION</p><h3>${status(r.status)}</h3><p>${r.status==='submitted'?'Votre demande a été transmise à KŌMØ.':r.status==='assigned'?'Un établissement ou professionnel a été désigné.':r.status==='accepted'?'Votre dossier Motion est prêt pour la mesure.':'Retrouvez ici l’avancement de votre demande.'}</p><div class="pir-meta"><span>${fmt(r.submitted_at)}</span>${r.preferred_city?`<span>${esc(r.preferred_city)}</span>`:''}</div></div><div class="pir-member-action"><span class="pir-state ${statusClass(r.status)}">${status(r.status)}</span>${r.status==='accepted'?'<button class="primary-button" data-route="results">Voir mes tests →</button>':''}</div>`
    :`<div><p class="eyebrow">KŌMØ MOTION</p><h3>Réaliser votre bilan Motion.</h3><p>Envoyez une demande à KŌMØ. Une fois orientée vers un professionnel, votre dossier est préparé sans ressaisir vos informations.</p></div><div class="pir-member-action">${pc.ok?'<button class="primary-button" id="pirOpenRequest">Demander KŌMØ Motion →</button>':'<button class="primary-button" data-route="profile">Compléter mon profil →</button><small>Prénom, nom, date de naissance et sexe de référence sont requis pour préparer Motion.</small>'}</div>`;
  root.prepend(wrap);
  document.querySelector('#pirOpenRequest')?.addEventListener('click',()=>openRequest(pc.profile));
}

function openRequest(p={}){
  let m=document.querySelector('#pirModal');
  if(!m){m=document.createElement('div');m.id='pirModal';m.className='pir-modal';document.body.appendChild(m)}
  m.hidden=false;
  m.innerHTML=`<div class="pir-backdrop" data-pir-close></div><section class="pir-sheet" role="dialog" aria-modal="true"><button class="pir-close" data-pir-close type="button">×</button><p class="eyebrow">DEMANDE KŌMØ MOTION</p><h2>Préparer votre bilan.</h2><p>Indiquez simplement votre localisation souhaitée. KŌMØ vous orientera ensuite vers un professionnel ou un lieu partenaire.</p><form id="pirRequestForm"><label><span>Ville souhaitée</span><input name="preferred_city" value="${esc(p.city||'')}" placeholder="Paris, Lille, Jávea…"></label><label><span>Message</span><textarea name="message" rows="4" placeholder="Disponibilités ou précision utile (optionnel)"></textarea></label><button class="primary-button" type="submit">Envoyer ma demande →</button><p id="pirRequestFeedback"></p></form></section>`;
  m.querySelectorAll('[data-pir-close]').forEach(b=>b.addEventListener('click',()=>m.hidden=true));
  m.querySelector('#pirRequestForm')?.addEventListener('submit',submitRequest);
}

async function submitRequest(e){
  e.preventDefault();
  const f=e.currentTarget,fd=new FormData(f),out=document.querySelector('#pirRequestFeedback');
  out.textContent='Envoi…';
  try{
    await invoke({action:'submit',service:'motion',preferred_city:String(fd.get('preferred_city')||''),message:String(fd.get('message')||'')});
    document.querySelector('#pirModal').hidden=true;
    await base();
    document.querySelector('[data-motion-request-card]')?.remove();
    injectMember();
  }catch(err){out.textContent=err.message}
}

function ensureProTab(){
  const cockpit=document.querySelector('[data-clinical-cockpit-v1]'),tabs=cockpit?.querySelector('.kcp-tabs');
  if(!cockpit||!tabs||!['professional','admin'].includes(S.role))return;
  let b=tabs.querySelector('[data-pir-tab]');
  if(!b){
    b=document.createElement('button');
    b.type='button';b.className='kcp-tab';b.dataset.pirTab='1';b.textContent='Demandes';
    const patients=tabs.querySelector('[data-kcp-tab="patients"]');
    patients?patients.insertAdjacentElement('beforebegin',b):tabs.appendChild(b);
    b.addEventListener('click',activatePro);
    tabs.querySelectorAll('.kcp-tab:not([data-pir-tab])').forEach(x=>{if(x.dataset.pirBound)return;x.dataset.pirBound='1';x.addEventListener('click',()=>{S.active=false},{capture:true})});
  }
  updateProBadge();
}

async function loadPro(){
  S.loading=true;renderPro();
  try{
    const d=await invoke({action:S.role==='admin'?'list_admin':'list_pro'});
    S.proRequests=d.requests||[];
    S.organizations=d.organizations||[];
    S.professionals=S.role==='admin'?(d.professionals||[]):await loadCenterTeam();
  }catch(e){toast(e.message)}
  finally{S.loading=false;renderPro();updateProBadge()}
}

function updateProBadge(){
  const b=document.querySelector('[data-pir-tab]');if(!b)return;
  const n=S.proRequests.filter(x=>['submitted','assigned'].includes(x.status)).length;
  const html=`Demandes${n?` <span class="pir-badge">${n}</span>`:''}`;
  if(b.innerHTML!==html)b.innerHTML=html;
}

function activatePro(){
  S.active=true;
  document.querySelectorAll('.kcp-tab').forEach(x=>x.classList.toggle('active',x.hasAttribute('data-pir-tab')));
  const bar=document.querySelector('#kcpPatientBar'),host=document.querySelector('#kcpMotionHost'),view=document.querySelector('#kcpView');
  if(bar)bar.hidden=true;if(host)host.hidden=true;if(view){view.hidden=false;renderPro()}
  loadPro();
}

function isCenterManagerFor(r){
  const m=S.organizations.find(x=>x.organization_id===r.assigned_organization_id);
  return !!m&&['owner','clinical_admin'].includes(m.role);
}

function renderPro(){
  if(!S.active)return;
  const view=document.querySelector('#kcpView');if(!view)return;
  const open=S.proRequests.filter(x=>!['completed','declined','cancelled'].includes(x.status));
  const manager=S.organizations.some(x=>['owner','clinical_admin'].includes(x.role));
  view.innerHTML=`<div class="pir-pro"><section class="pir-pro-head"><div><p class="eyebrow">KŌMØ INTAKE</p><h2>Demandes patients.</h2><p>${S.role==='admin'?'Orienter chaque demande vers le bon établissement et, si besoin, le bon professionnel.':manager?'Répartissez les demandes du centre au sein de votre équipe.':'Retrouvez uniquement les demandes qui vous sont personnellement affectées.'}</p></div><div class="pir-pro-count"><span>À traiter</span><strong>${open.filter(x=>['submitted','assigned'].includes(x.status)).length}</strong></div></section><section class="kcp-card full"><div class="kcp-card-head"><div><h3>File active</h3><p>${S.role==='admin'?'Demandes reçues sur Pulse.':manager?'Demandes de vos centres.':'Vos demandes assignées.'}</p></div><button class="kcp-btn" id="pirRefresh">Actualiser</button></div>${S.loading?'<div class="kcp-empty">Chargement…</div>':open.length?`<div class="pir-list">${open.map(row).join('')}</div>`:'<div class="kcp-empty">Aucune demande à traiter.</div>'}</section></div>`;
  bindPro();
}

function row(r){
  const p=r.profile||{},name=`${p.first_name||''} ${p.last_name||''}`.trim()||p.display_name||r.email||'Patient Pulse';
  return`<article class="pir-row" data-request="${r.id}"><div class="pir-person"><strong>${esc(name)}</strong><span>${esc(r.email||'—')} · ${esc(r.preferred_city||'Ville non précisée')}</span><small>Demandé ${fmt(r.submitted_at)}</small></div><span class="pir-state ${statusClass(r.status)}">${status(r.status)}</span>${S.role==='admin'?adminActions(r):proActions(r)}</article>`;
}

function adminActions(r){
  if(r.status==='accepted'||r.status==='scheduled')return`<div class="pir-actions"><span>Dossier préparé</span></div>`;
  const orgOptions=['<option value="">Choisir un établissement</option>',...S.organizations.map(o=>`<option value="${o.id}" ${r.assigned_organization_id===o.id?'selected':''}>${esc(o.name)} · ${esc(o.clinical_data_status)}</option>`)].join('');
  const proOptions=['<option value="">Professionnel optionnel</option>',...S.professionals.filter(p=>!r.assigned_organization_id||p.organization_id===r.assigned_organization_id).map(p=>`<option value="${p.user_id}" ${r.assigned_professional_user_id===p.user_id?'selected':''}>${esc(p.email||p.user_id)} · ${esc(p.access_scope)}</option>`)].join('');
  return`<div class="pir-assign"><select data-org>${orgOptions}</select><select data-pro>${proOptions}</select><button class="kcp-btn primary" data-assign>Assigner</button></div>`;
}

function proActions(r){
  if(r.status==='accepted')return`<div class="pir-actions"><button class="kcp-btn primary" data-open-motion>Ouvrir Motion</button></div>`;
  if(r.status!=='assigned')return'<div class="pir-actions"></div>';
  if(isCenterManagerFor(r)){
    const team=S.professionals.filter(p=>p.organization_id===r.assigned_organization_id);
    const opts=['<option value="">Choisir un professionnel</option>',...team.map(p=>`<option value="${p.user_id}" ${r.assigned_professional_user_id===p.user_id?'selected':''}>${esc(p.name||p.email||'Professionnel')} · ${esc(p.access_scope)}</option>`)].join('');
    const canTake=!r.assigned_professional_user_id||r.assigned_professional_user_id===S.session?.user?.id;
    return`<div class="pir-center-actions"><div class="pir-assign"><select data-center-pro>${opts}</select><button class="kcp-btn" data-center-assign>Affecter</button></div>${canTake?'<button class="kcp-btn primary" data-accept>Prendre en charge & ouvrir Motion</button>':''}</div>`;
  }
  return`<div class="pir-actions">${r.assigned_professional_user_id===S.session?.user?.id?'<button class="kcp-btn primary" data-accept>Accepter & ouvrir Motion</button>':''}</div>`;
}

function setMotionContext(r,patientId,assessmentId){
  if(r?.assigned_organization_id)localStorage.setItem(ORG_KEY,r.assigned_organization_id);
  if(patientId)localStorage.setItem(PATIENT_KEY,patientId);
  if(assessmentId)localStorage.setItem(ASSESSMENT_KEY,assessmentId);
  localStorage.setItem(TAB_KEY,'motion');
}

function bindPro(){
  document.querySelector('#pirRefresh')?.addEventListener('click',loadPro);
  document.querySelectorAll('.pir-row').forEach(el=>{
    const id=el.dataset.request,r=S.proRequests.find(x=>x.id===id);
    el.querySelector('[data-org]')?.addEventListener('change',e=>{
      const oid=e.target.value,pro=el.querySelector('[data-pro]');if(!pro)return;
      pro.innerHTML=['<option value="">Professionnel optionnel</option>',...S.professionals.filter(p=>p.organization_id===oid).map(p=>`<option value="${p.user_id}">${esc(p.email||p.user_id)} · ${esc(p.access_scope)}</option>`)].join('');
    });
    el.querySelector('[data-assign]')?.addEventListener('click',async()=>{
      const oid=el.querySelector('[data-org]')?.value,pid=el.querySelector('[data-pro]')?.value;
      if(!oid){toast('Choisissez un établissement.');return}
      try{await invoke({action:'assign',request_id:id,organization_id:oid,professional_user_id:pid||null});toast('Demande assignée.');await loadPro()}catch(e){toast(e.message)}
    });
    el.querySelector('[data-center-assign]')?.addEventListener('click',async()=>{
      const pid=el.querySelector('[data-center-pro]')?.value;
      if(!pid){toast('Choisissez un professionnel.');return}
      try{await invoke({action:'assign',request_id:id,organization_id:r.assigned_organization_id,professional_user_id:pid});toast('Patient affecté à l’équipe.');await loadPro()}catch(e){toast(e.message)}
    });
    el.querySelector('[data-accept]')?.addEventListener('click',async()=>{
      try{const x=await invoke({action:'accept',request_id:id});setMotionContext(r,x.patient_id,x.assessment_id);toast('Dossier Motion préparé.');setTimeout(()=>location.reload(),500)}catch(e){toast(e.message)}
    });
    el.querySelector('[data-open-motion]')?.addEventListener('click',()=>{
      setMotionContext(r,r?.patient_id,r?.assessment_id);
      location.reload();
    });
  });
}

function toast(msg){
  let e=document.querySelector('#pirToast');
  if(!e){e=document.createElement('div');e.id='pirToast';e.className='kcp-toast';document.body.appendChild(e)}
  e.textContent=msg;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,3500);
}

async function refresh(){try{await base();await injectMember();ensureProTab()}catch(e){console.error('[patient-intake-ui]',e)}}
function schedule(){clearTimeout(timer);timer=setTimeout(refresh,160)}
window.addEventListener('hashchange',schedule);
const obs=new MutationObserver(()=>ensureProTab());obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,900));
setTimeout(refresh,1600);
