import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const ORG_KEY='komo_clinical_org';
const PATIENT_KEY='komo_clinical_patient';

const S={client:null,session:null,role:'member',active:false,centers:[],centerId:localStorage.getItem(ORG_KEY)||'',patients:[],selected:null,threadId:null,messages:[],loading:false,error:'',overview:null};

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){if(!S.client)S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return S.client}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmt(v){if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(d)}
function pname(p){return`${p?.preferred_name||p?.first_name||''} ${p?.last_name||''}`.trim()||p?.email||'Patient KŌMØ'}
function isCenterAccount(){return['professional','admin'].includes(S.role)}
function currentCenter(){return S.centers.find(x=>x.id===S.centerId)||null}
function centerName(){return currentCenter()?.name||S.selected?.organizations?.name||'Centre KŌMØ'}
function preview(text=''){const t=String(text||'').replace(/\s+/g,' ').trim();return t.length>54?t.slice(0,53)+'…':t}
function unreadCount(){return S.patients.filter(p=>p._unread).length}

async function invoke(name,body){const{data,error}=await sb().functions.invoke(name,{body});if(error)throw new Error(error.message||'Erreur serveur');if(data?.error)throw new Error(data.detail||data.error);return data}
async function base(){const{data:{session}}=await sb().auth.getSession();S.session=session;if(!session?.user)return false;const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';return true}

async function loadCenters(){
  S.overview=await invoke('center-operations',{action:'overview'});
  S.centers=S.overview?.centers||[];
  if(!S.centerId||!S.centers.some(x=>x.id===S.centerId))S.centerId=S.centers[0]?.id||'';
  if(S.centerId)localStorage.setItem(ORG_KEY,S.centerId);
}

async function loadPatients(){
  S.patients=[];
  if(!S.centerId)return;
  const q=await sb().from('patients').select('id,organization_id,patient_user_id,first_name,last_name,preferred_name,email,external_reference,status,updated_at,organizations(id,name,city)').eq('organization_id',S.centerId).order('updated_at',{ascending:false});
  if(q.error)throw q.error;
  S.patients=q.data||[];
  await loadInboxIndex();
  const saved=localStorage.getItem(PATIENT_KEY);
  S.selected=S.patients.find(x=>x.id===saved)||S.patients[0]||null;
  if(S.selected)localStorage.setItem(PATIENT_KEY,S.selected.id);
}

async function loadInboxIndex(){
  const ids=S.patients.map(p=>p.id);
  if(!ids.length)return;
  const tq=await sb().from('message_threads').select('id,organization_id,patient_id,status,subject,last_message_at,updated_at').eq('organization_id',S.centerId).in('patient_id',ids);
  if(tq.error)throw tq.error;
  const threads=tq.data||[];
  const threadIds=threads.map(t=>t.id);
  let messages=[],reads=[];
  if(threadIds.length){
    const [mq,rq]=await Promise.all([
      sb().from('messages').select('id,thread_id,sender_user_id,body,created_at').in('thread_id',threadIds).order('created_at',{ascending:false}).limit(500),
      sb().from('message_thread_reads').select('thread_id,last_read_at,user_id').eq('user_id',S.session.user.id).in('thread_id',threadIds)
    ]);
    if(mq.error)throw mq.error;if(rq.error)throw rq.error;
    messages=mq.data||[];reads=rq.data||[];
  }
  const threadByPatient=Object.fromEntries(threads.map(t=>[t.patient_id,t]));
  const latestByThread={};for(const m of messages)if(!latestByThread[m.thread_id])latestByThread[m.thread_id]=m;
  const readByThread=Object.fromEntries(reads.map(r=>[r.thread_id,r.last_read_at]));
  S.patients.forEach(p=>{
    const t=threadByPatient[p.id]||null,l=t?latestByThread[t.id]||null:null,read=t?readByThread[t.id]||null:null;
    p._thread=t;p._latest=l;p._unread=!!(l&&l.sender_user_id!==S.session.user.id&&(!read||new Date(l.created_at)>new Date(read)));
  });
  S.patients.sort((a,b)=>new Date(b._thread?.last_message_at||b.updated_at||0)-new Date(a._thread?.last_message_at||a.updated_at||0));
}

async function ensureThread(patientId){const r=await sb().rpc('ensure_patient_message_thread',{p_patient_id:patientId});if(r.error)throw r.error;S.threadId=r.data;return r.data}
async function loadConversation(patientId){
  S.error='';S.messages=[];
  await ensureThread(patientId);
  const q=await sb().from('messages').select('id,thread_id,sender_user_id,body,created_at').eq('thread_id',S.threadId).order('created_at',{ascending:true}).limit(300);
  if(q.error)throw q.error;
  S.messages=q.data||[];
  await sb().from('message_thread_reads').upsert({thread_id:S.threadId,user_id:S.session.user.id,last_read_at:new Date().toISOString()},{onConflict:'thread_id,user_id'});
  const p=S.patients.find(x=>x.id===patientId);if(p)p._unread=false;
}

function bubble(m){
  const patientSender=m.sender_user_id===S.selected?.patient_user_id;
  const mine=m.sender_user_id===S.session?.user?.id;
  const centerSide=!patientSender;
  const label=mine?`Vous · ${centerName()}`:patientSender?pname(S.selected):`Équipe · ${centerName()}`;
  return`<div class="kmsg-bubble ${centerSide?'mine':'other'}"><div>${esc(m.body)}</div><small>${esc(label)} · ${fmt(m.created_at)}</small></div>`;
}
function conversation(){
  if(!S.selected)return'<div class="kmsg-empty">Sélectionnez un patient.</div>';
  if(S.loading)return'<div class="kmsg-empty">Chargement de la conversation…</div>';
  if(S.error)return`<div class="kmsg-empty"><strong>Messagerie indisponible.</strong><br>${esc(S.error)}</div>`;
  return`<div class="kmsg-thread" data-kmsg-center-thread>${S.messages.length?S.messages.map(bubble).join(''):'<div class="kmsg-empty">Aucun message pour le moment. Le patient peut écrire directement à votre centre depuis son espace Pulse.</div>'}</div><form class="kmsg-compose" id="kmsgCenterCompose"><textarea name="body" rows="2" maxlength="4000" placeholder="Répondre au nom du centre…" required></textarea><button class="primary-button" type="submit">Envoyer →</button></form><div class="kmsg-trace">Message visible par le patient comme provenant de <strong>${esc(centerName())}</strong>. Votre identité reste enregistrée dans l’historique interne.</div>`;
}

function ensureTab(){
  if(!isCenterAccount()||location.hash.replace(/^#/,'')!=='clinical')return;
  const tabs=document.querySelector('.kcp-tabs');if(!tabs)return;
  let b=tabs.querySelector('[data-kmsg-tab]');
  if(!b){
    b=document.createElement('button');b.type='button';b.className='kcp-tab';b.dataset.kmsgTab='1';b.textContent='Messages';tabs.appendChild(b);b.addEventListener('click',activate);
    tabs.querySelectorAll('.kcp-tab:not([data-kmsg-tab])').forEach(x=>{if(x.dataset.kmsgCenterBound)return;x.dataset.kmsgCenterBound='1';x.addEventListener('click',()=>{S.active=false},{capture:true})});
  }
}

async function activate(){
  S.active=true;
  document.querySelectorAll('.kcp-tab').forEach(x=>x.classList.toggle('active',x.hasAttribute('data-kmsg-tab')));
  const bar=document.querySelector('#kcpPatientBar'),host=document.querySelector('#kcpMotionHost'),view=document.querySelector('#kcpView');
  if(bar)bar.hidden=true;if(host)host.hidden=true;if(view){view.hidden=false;view.innerHTML='<div class="kmsg-loading">Ouverture de la messagerie du centre…</div>'}
  await loadAll();
}

async function loadAll(){
  S.loading=true;S.error='';render();
  try{
    await loadCenters();
    await loadPatients();
    if(S.selected)await loadConversation(S.selected.id);
  }catch(e){S.error=e.message||'Impossible de charger la messagerie du centre.'}
  finally{S.loading=false;render();setTimeout(scrollBottom,40)}
}

function patientRow(p){
  const last=p._latest,unread=p._unread;
  return`<button data-kmsg-center-patient="${p.id}" class="${S.selected?.id===p.id?'active':''} ${unread?'unread':''}"><div class="kmsg-person-line"><strong>${esc(pname(p))}</strong>${unread?'<i class="kmsg-unread-dot" aria-label="Nouveau message"></i>':''}</div><span>${last?esc(preview(last.body)):'Conversation disponible'}</span><small>${last?fmt(last.created_at):esc(p.external_reference||'Aucun message')}</small></button>`;
}

function render(){
  if(!S.active)return;
  const view=document.querySelector('#kcpView');if(!view)return;
  view.hidden=false;
  const c=currentCenter(),count=unreadCount();
  view.innerHTML=`<div class="kmsg-pro kmsg-center-inbox" data-kmsg-center><section class="kmsg-head"><div><p class="eyebrow">MESSAGERIE DU CENTRE</p><h2>${esc(c?.name||'Votre centre KŌMØ')}</h2><p>Une boîte de réception partagée avec votre équipe. Le patient écrit au centre ; les membres autorisés peuvent reprendre la conversation sans rupture de suivi.</p></div><div class="kmsg-head-actions">${S.centers.length>1?`<label class="kmsg-center-select"><span>Centre actif</span><select id="kmsgCenterSelect">${S.centers.map(x=>`<option value="${x.id}" ${x.id===S.centerId?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>`:''}<div class="kmsg-count"><span>Non lus</span><strong>${count}</strong></div></div></section>${S.error?`<div class="kmsg-alert">${esc(S.error)}</div>`:''}${S.centerId?`<section class="kmsg-layout"><aside class="kmsg-people"><div class="kmsg-people-title">Patients · ${S.patients.length}</div>${S.patients.length?S.patients.map(patientRow).join(''):'<div class="kmsg-empty">Aucun patient dans ce centre.</div>'}</aside><article class="kmsg-conversation"><div class="kmsg-conv-head"><div><span>Conversation patient ↔ centre</span><strong>${esc(S.selected?pname(S.selected):'Aucun patient sélectionné')}</strong><small>${esc(c?.name||'Centre KŌMØ')}${c?.city?` · ${esc(c.city)}`:''}</small></div><span class="kmsg-channel-pill">Canal centre</span></div>${conversation()}</article></section>`:'<article class="card"><div class="empty-state"><strong>Aucun centre actif.</strong><br>Créez ou rejoignez un centre KŌMØ pour activer la messagerie.</div></article>'}</div>`;
  bind();setTimeout(scrollBottom,30);
}

function bind(){
  document.querySelector('#kmsgCenterSelect')?.addEventListener('change',async e=>{S.centerId=e.target.value;localStorage.setItem(ORG_KEY,S.centerId);S.selected=null;await loadAll()});
  document.querySelectorAll('[data-kmsg-center-patient]').forEach(b=>b.addEventListener('click',async()=>{
    S.selected=S.patients.find(x=>x.id===b.dataset.kmsgCenterPatient)||null;if(!S.selected)return;
    localStorage.setItem(PATIENT_KEY,S.selected.id);S.loading=true;render();
    try{await loadConversation(S.selected.id);await loadInboxIndex()}catch(e){S.error=e.message||'Impossible de charger cette conversation.'}
    finally{S.loading=false;render();setTimeout(scrollBottom,30)}
  }));
  document.querySelector('#kmsgCenterCompose')?.addEventListener('submit',send);
}

async function send(e){
  e.preventDefault();const f=e.currentTarget,body=String(new FormData(f).get('body')||'').trim();if(!body||!S.threadId)return;
  const b=f.querySelector('button');b.disabled=true;
  try{
    const q=await sb().from('messages').insert({thread_id:S.threadId,sender_user_id:S.session.user.id,body});if(q.error)throw q.error;
    f.reset();await loadConversation(S.selected.id);await loadInboxIndex();
  }catch(err){S.error=err.message||'Message non envoyé.'}
  finally{b.disabled=false;render();setTimeout(scrollBottom,30)}
}
function scrollBottom(){const x=document.querySelector('[data-kmsg-center-thread]');if(x)x.scrollTop=x.scrollHeight}

async function boot(){if(!await base())return;ensureTab()}
window.addEventListener('hashchange',()=>{S.active=false;setTimeout(()=>{ensureTab()},100)});
window.addEventListener('komo:route-ready',()=>setTimeout(ensureTab,70));
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>boot().catch(console.error),700));
let scheduled=false;const obs=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;ensureTab()})});obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
setTimeout(()=>boot().catch(console.error),1200);

window.KomoCenterMessaging={open:()=>{location.hash='clinical';setTimeout(()=>document.querySelector('[data-kmsg-tab]')?.click(),180)}};