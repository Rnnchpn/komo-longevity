import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const PATIENT_KEY='komo_clinical_patient';
const TAB_KEY='komo_clinical_tab';
const S={client:null,session:null,role:'member',mode:'member',data:null,open:false,loading:false,error:null,detail:null};
let refreshTimer=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){if(!S.client)S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return S.client}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmtDate(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(d)}
function isPro(){return ['professional','admin'].includes(S.role)}
function route(){return location.hash.replace(/^#/,'').split('?')[0]||'home'}

function shell(){
  if(document.querySelector('#komoOperatorLauncher'))return;
  const launcher=document.createElement('button');
  launcher.id='komoOperatorLauncher';launcher.className='kop-launcher';launcher.type='button';launcher.hidden=true;
  launcher.innerHTML='<span class="kop-launcher-face" aria-hidden="true">ōø</span><span><strong>KŌMØ</strong><small>Supervise</small></span>';
  launcher.setAttribute('aria-label','Ouvrir KŌMØ Supervise');
  const backdrop=document.createElement('div');backdrop.id='komoOperatorBackdrop';backdrop.className='kop-backdrop';
  const panel=document.createElement('aside');panel.id='komoOperatorPanel';panel.className='kop-panel';panel.setAttribute('aria-label','KŌMØ Supervise');panel.innerHTML='<div class="kop-loading"><div><div class="kop-spinner"></div>KŌMØ prépare votre suivi…</div></div>';
  document.body.append(backdrop,launcher,panel);
  launcher.addEventListener('click',()=>open());backdrop.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.open)close()});
}
function setVisible(ok){const b=document.querySelector('#komoOperatorLauncher');if(b)b.hidden=!ok;if(!ok)close()}
function open(){S.open=true;document.querySelector('#komoOperatorPanel')?.classList.add('is-open');document.querySelector('#komoOperatorBackdrop')?.classList.add('is-open');document.body.classList.add('kop-open');if(!S.data&&!S.loading)load()}
function close(){S.open=false;S.detail=null;document.querySelector('#komoOperatorPanel')?.classList.remove('is-open');document.querySelector('#komoOperatorBackdrop')?.classList.remove('is-open');document.body.classList.remove('kop-open')}

async function base(){
  const {data:{session}}=await sb().auth.getSession();S.session=session;
  const app=document.querySelector('#appShell');
  if(!session?.user||!app||app.hidden){setVisible(false);return false}
  const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';S.mode=isPro()?'professional':'member';setVisible(true);return true;
}
async function invoke(action='overview',extra={}){
  const r=await sb().functions.invoke('komo-operator-v1',{body:{action,...extra}});
  if(r.error)throw r.error;if(r.data?.error)throw new Error(r.data.detail||r.data.error);return r.data;
}
async function load(force=false){
  if(S.loading&&!force)return;S.loading=true;S.error=null;render();
  try{if(!await base())return;S.data=await invoke('overview');S.role=S.data?.role||S.role;S.mode=S.data?.mode||S.mode}
  catch(e){S.error=e?.message||'KŌMØ Supervise est momentanément indisponible.'}
  finally{S.loading=false;render()}
}

function context(){
  const r=route();
  if(isPro()&&['clinical','admin'].includes(r))return{title:'Quels dossiers nécessitent mon attention ?',text:'KŌMØ réunit les préparations incomplètes, les rendez-vous proches et les bilans à relire.',action:'priorities'};
  if(r==='results')return{title:'Comprendre ce bilan',text:'KŌMØ résume uniquement les éléments déjà enregistrés dans votre dossier.',action:'status'};
  if(r==='trajectory'||r==='progression')return{title:'Expliquer l’évolution',text:'Retrouvez votre état actuel et les prochaines étapes déjà documentées.',action:'status'};
  if(r==='therapy')return{title:'Que faire maintenant ?',text:'KŌMØ vous ramène vers le plan et les actions déjà validées dans Pulse.',action:'therapy'};
  if(r==='agenda')return{title:'Préparer le rendez-vous',text:'Vérifiez ce qui doit être complété avant votre prochaine consultation.',action:'status'};
  return{title:isPro()?'Voir les priorités du jour':'Continuer mon parcours',text:isPro()?'Les éléments qui demandent une action sont regroupés ici.':'KŌMØ vous indique ce qu’il reste à faire dans votre parcours Motion.',action:'priorities'};
}
function kpi(label,value){return`<div class="kop-kpi"><span>${esc(label)}</span><strong>${value??'—'}</strong></div>`}
function priorityCard(x){return`<button class="kop-priority" data-kop-priority="${esc(x.id)}" data-priority="${esc(x.priority)}"><span class="kop-dot"></span><span class="kop-copy"><strong>${esc(x.title)}</strong><small>${esc(x.patient_name||'Votre parcours')}</small><p>${esc(x.detail)}</p></span><span class="kop-arrow">→</span></button>`}
function capabilities(){const c=S.data?.capabilities||{};const cells=[['Statut dossier',c.summarize_patient_status],['Éléments manquants',c.list_missing_items],['Relance patient',c.send_patient_reminder],['Préparer le RDV',c.prepare_next_visit],['Résumé Motion',c.summarize_motion_results],['Wearables / KEY',c.summarize_wearable_data]];return`<div class="kop-capabilities">${cells.map(([n,on])=>`<div class="kop-cap ${!on?'off':''}"><strong>${esc(n)}</strong><span>${on?on==='confirm_in_client'?'Avec validation':'Actif':'Source à connecter'}</span></div>`).join('')}</div>`}

function render(){
  const panel=document.querySelector('#komoOperatorPanel');if(!panel)return;
  if(S.loading){panel.innerHTML='<div class="kop-loading"><div><div class="kop-spinner"></div>KŌMØ analyse le parcours…</div></div>';return}
  if(S.error){panel.innerHTML=`<header class="kop-head"><div class="kop-brand"><div class="kop-face">ōø</div><div><p>KŌMØ PULSE</p><h2>Supervise</h2></div></div><button class="kop-close" data-kop-close>×</button></header><div class="kop-body"><div class="kop-empty">${esc(S.error)}<br><br><button class="kop-action" data-kop-refresh>Réessayer</button></div></div>`;bind();return}
  const d=S.data||{},counts=d.counts||{},priorities=d.priorities||[],ctx=context();
  const pro=isPro();
  panel.innerHTML=`<header class="kop-head"><div class="kop-brand"><div class="kop-face" aria-hidden="true">ōø</div><div><p>KŌMØ PULSE · ${pro?'OPÉRATEUR MOTION':'COPILOTE MOTION'}</p><h2>${pro?'Supervise':'Votre suivi'}</h2></div></div><button class="kop-close" data-kop-close aria-label="Fermer">×</button></header><div class="kop-body"><div class="kop-intro"><p>${pro?'KŌMØ surface ce qui demande votre attention. Toute décision clinique reste sous votre contrôle.':'KŌMØ vous aide à compléter et suivre votre parcours, sans établir de diagnostic.'}</p><button class="kop-refresh" data-kop-refresh>Actualiser ↻</button></div>${pro?`<div class="kop-kpis">${kpi('Dossiers incomplets',counts.incomplete??0)}${kpi('Motion à relire',counts.motion_review??0)}${kpi('RDV < 72 h',counts.appointments_72h??0)}</div>`:''}<section class="kop-context"><strong>${esc(ctx.title)}</strong><p>${esc(ctx.text)}</p><div class="kop-actions"><button class="kop-action primary" data-kop-context="${esc(ctx.action)}">${pro?'Voir maintenant':'Continuer'} →</button>${pro&&priorities.length?'<button class="kop-action" data-kop-filter="high">Priorité haute</button>':''}</div></section><section class="kop-section"><div class="kop-section-head"><p>${pro?'Priorités du jour':'À faire maintenant'}</p><span>${priorities.length} élément${priorities.length>1?'s':''}</span></div><div class="kop-priority-list">${priorities.length?priorities.slice(0,10).map(priorityCard).join(''):'<div class="kop-empty">Aucune action prioritaire détectée avec les sources actuellement connectées.</div>'}</div></section><section class="kop-section"><div class="kop-section-head"><p>Capacités V1</p><span>Actions encadrées</span></div>${capabilities()}</section><div class="kop-detail" id="kopDetail"></div></div>`;
  bind();
}
function bind(){
  document.querySelector('[data-kop-close]')?.addEventListener('click',close);
  document.querySelectorAll('[data-kop-refresh]').forEach(b=>b.addEventListener('click',()=>load(true)));
  document.querySelectorAll('[data-kop-priority]').forEach(b=>b.addEventListener('click',()=>openPriority(b.dataset.kopPriority)));
  document.querySelector('[data-kop-context]')?.addEventListener('click',e=>runContext(e.currentTarget.dataset.kopContext));
  document.querySelector('[data-kop-filter]')?.addEventListener('click',()=>{const p=(S.data?.priorities||[]).find(x=>x.priority==='high')||(S.data?.priorities||[])[0];if(p)openPriority(p.id)});
}
function detailShell(kicker,title,body){const d=document.querySelector('#kopDetail');if(!d)return;d.innerHTML=`<div class="kop-detail-head"><button class="kop-back" data-kop-back aria-label="Retour">←</button><div><p>${esc(kicker)}</p><strong>${esc(title)}</strong></div></div><div class="kop-detail-body">${body}</div>`;d.classList.add('is-open');d.querySelector('[data-kop-back]')?.addEventListener('click',()=>{d.classList.remove('is-open');S.detail=null})}
function findPriority(id){return(S.data?.priorities||[]).find(x=>x.id===id)||null}
async function openPriority(id){
  const p=findPriority(id);if(!p)return;S.detail=p;
  if(p.kind==='missing_items'&&isPro()){return reminderDetail(p)}
  detailShell(p.kind==='motion_review'?'VALIDATION MOTION':'PROCHAINE ÉTAPE',p.patient_name||p.title,'<div class="kop-loading"><div><div class="kop-spinner"></div>Préparation du dossier…</div></div>');
  try{const data=await invoke('patient_status',{patient_id:p.patient_id});statusDetail(p,data)}catch(e){detailShell('KŌMØ',p.patient_name||'Dossier',`<div class="kop-empty">${esc(e.message||'Lecture impossible')}</div>`)}
}
function statusDetail(p,data){const s=data?.summary||{};const miss=s.missing_items||[];const score=s.motion_score==null?'—':`${Math.round(Number(s.motion_score))}/100`;const body=`<div class="kop-summary-grid"><div class="kop-summary-cell"><span>Préparation</span><strong>${Number(s.preparation_percent||0)}%</strong></div><div class="kop-summary-cell"><span>Motion Score</span><strong>${score}</strong></div><div class="kop-summary-cell"><span>Statut Motion</span><strong>${esc(s.motion_status||'—')}</strong></div><div class="kop-summary-cell"><span>Prochain RDV</span><strong>${esc(fmtDate(s.next_appointment?.scheduled_start))}</strong></div></div>${miss.length?`<div class="kop-note"><strong>Éléments manquants</strong><br>${miss.map(esc).join(' · ')}</div>`:'<div class="kop-note">La préparation actuellement connectée est complète.</div>'}<div class="kop-actions" style="margin-top:14px">${isPro()?`<button class="kop-action primary" data-kop-open-patient="${esc(p.patient_id)}">Ouvrir le dossier →</button>`:''}${p.kind==='upcoming_appointment'?'<button class="kop-action" data-kop-open-route="agenda">Voir l’agenda</button>':''}</div>`;detailShell('SYNTHÈSE DOSSIER',s.patient_name||p.patient_name||'Patient',body);document.querySelector('[data-kop-open-patient]')?.addEventListener('click',e=>openPatient(e.currentTarget.dataset.kopOpenPatient));document.querySelector('[data-kop-open-route]')?.addEventListener('click',e=>navigate(e.currentTarget.dataset.kopOpenRoute))}
function reminderDetail(p){const body=`<div class="kop-composer"><div class="kop-note">KŌMØ a préparé un brouillon à partir des éléments manquants. Relisez ou modifiez le message avant envoi.</div><textarea id="kopReminderText" maxlength="4000">${esc(p.draft||'')}</textarea><div class="kop-status" id="kopReminderStatus"></div><div class="kop-composer-foot"><button class="kop-action" data-kop-open-patient="${esc(p.patient_id)}">Ouvrir dossier</button><button class="kop-action primary" data-kop-send-reminder="${esc(p.patient_id)}">Envoyer au patient →</button></div></div>`;detailShell('RELANCE ENCADRÉE',p.patient_name||'Patient',body);document.querySelector('[data-kop-open-patient]')?.addEventListener('click',e=>openPatient(e.currentTarget.dataset.kopOpenPatient));document.querySelector('[data-kop-send-reminder]')?.addEventListener('click',sendReminder)}
async function sendReminder(e){const b=e.currentTarget,patientId=b.dataset.kopSendReminder,ta=document.querySelector('#kopReminderText'),st=document.querySelector('#kopReminderStatus'),body=String(ta?.value||'').trim();if(!body||!patientId||!S.session?.user)return;if(st){st.className='kop-status';st.textContent='Envoi…'}b.disabled=true;try{const t=await sb().rpc('ensure_patient_message_thread',{p_patient_id:patientId});if(t.error)throw t.error;const q=await sb().from('messages').insert({thread_id:t.data,sender_user_id:S.session.user.id,body});if(q.error)throw q.error;if(st){st.textContent='Message envoyé. La relance est enregistrée dans la conversation patient.'}setTimeout(()=>load(true),600)}catch(err){if(st){st.className='kop-status error';st.textContent=err.message||'Envoi impossible.'}}finally{b.disabled=false}}
function openPatient(id){if(!id)return;localStorage.setItem(PATIENT_KEY,id);localStorage.setItem(TAB_KEY,'patients');navigate('clinical');setTimeout(()=>{window.dispatchEvent(new CustomEvent('komo:clinical-patient-changed',{detail:{patientId:id}}));document.querySelector('[data-kcp-tab="patients"]')?.click()},350);close()}
function navigate(r){if(!r)return;location.hash=`#${r}`;close()}
async function runContext(action){
  if(action==='priorities'){const p=(S.data?.priorities||[])[0];if(p)return openPriority(p.id);return}
  if(action==='therapy')return navigate('therapy');
  const rec=(S.data?.records||[])[0];if(!rec?.patient?.id){const p=(S.data?.priorities||[])[0];if(p)return openPriority(p.id);return}
  const fake={patient_id:rec.patient.id,patient_name:rec.patient.preferred_name||rec.patient.first_name||'Votre dossier',kind:'status'};detailShell('KŌMØ','Votre dossier','<div class="kop-loading"><div><div class="kop-spinner"></div>Lecture du parcours…</div></div>');try{const data=await invoke('patient_status',{patient_id:rec.patient.id});statusDetail(fake,data)}catch(e){detailShell('KŌMØ','Votre dossier',`<div class="kop-empty">${esc(e.message||'Lecture impossible')}</div>`)}
}
function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>load(true),350)}
async function boot(){shell();try{await base();if(S.session?.user)await load()}catch(e){console.error('[KŌMØ Supervise]',e)}}

document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900));window.addEventListener('hashchange',()=>{if(S.data&&S.open)render()});window.addEventListener('komo:clinical-patient-changed',scheduleRefresh);window.addEventListener('komo:center-changed',scheduleRefresh);
const obs=new MutationObserver(()=>{const app=document.querySelector('#appShell');if(app&&!app.hidden&&S.session?.user)setVisible(true)});obs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});setTimeout(boot,1600);
window.KomoOperatorV1={open,close,refresh:()=>load(true),getState:()=>({role:S.role,mode:S.mode,data:S.data})};
