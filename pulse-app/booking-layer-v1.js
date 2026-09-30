import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const ORG_KEY='komo_clinical_org';
const PATIENT_KEY='komo_clinical_patient';
const S={client:null,session:null,role:'member',centers:[],patientAppointments:[],patientOrg:'',patientService:'motion',patientStart:todayKey(),patientSlots:[],patientLoading:false,patientError:'',proActive:false,proCenters:[],proOrg:localStorage.getItem(ORG_KEY)||'',proWeek:mondayKey(new Date()),proAppointments:[],proHours:[],proLoading:false,proError:''};
function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){if(!S.client)S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return S.client}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function addDays(key,n){const d=new Date(`${key}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function mondayKey(d){const x=new Date(d);const day=x.getDay()||7;x.setDate(x.getDate()-day+1);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`}
function dateKey(value,tz='Europe/Paris'){const d=new Date(value),p=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d),o={};p.forEach(x=>o[x.type]=x.value);return `${o.year}-${o.month}-${o.day}`}
function timeKey(value,tz='Europe/Paris'){return new Intl.DateTimeFormat('fr-FR',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value))}
function dayLabel(key,tz='Europe/Paris'){const d=new Date(`${key}T12:00:00Z`);return new Intl.DateTimeFormat('fr-FR',{timeZone:tz,weekday:'short',day:'2-digit',month:'short'}).format(d).replace('.','')}
function fullDate(value,tz='Europe/Paris'){return new Intl.DateTimeFormat('fr-FR',{timeZone:tz,weekday:'long',day:'2-digit',month:'long',hour:'2-digit',minute:'2-digit'}).format(new Date(value))}
function serviceLabel(v){return v==='clinical'?'KŌMØ Clinical':'KŌMØ Motion'}
function apptStatus(v){return({scheduled:'Planifié',confirmed:'Confirmé',arrived:'Arrivé',in_progress:'En cours',completed:'Terminé',cancelled:'Annulé',no_show:'Absent'})[v]||v||'—'}
function notify(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.hidden=false;setTimeout(()=>t.hidden=true,2800)}
async function base(){const {data:{session}}=await sb().auth.getSession();S.session=session;if(!session?.user)return false;const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';return true}

async function loadCenters(){const q=await sb().rpc('komo_booking_centers');if(q.error)throw q.error;S.centers=q.data||[];if(!S.patientOrg||!S.centers.some(x=>x.id===S.patientOrg))S.patientOrg=S.centers[0]?.id||'';const c=S.centers.find(x=>x.id===S.patientOrg);if(c&&!c[`${S.patientService}_enabled`])S.patientService=c.motion_enabled?'motion':'clinical'}
async function loadPatientAppointments(){const ps=await sb().from('patients').select('id').eq('patient_user_id',S.session.user.id);const ids=(ps.data||[]).map(x=>x.id);if(!ids.length){S.patientAppointments=[];return}const q=await sb().from('organization_appointments').select('id,organization_id,patient_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,booking_source').in('patient_id',ids).order('scheduled_start',{ascending:true});if(q.error)throw q.error;S.patientAppointments=q.data||[]}
async function loadPatientSlots(){if(!S.patientOrg)return;S.patientLoading=true;S.patientError='';renderPatient();try{const q=await sb().rpc('komo_booking_slots',{p_organization_id:S.patientOrg,p_service:S.patientService,p_start_date:S.patientStart,p_days:7});if(q.error)throw q.error;S.patientSlots=q.data||[]}catch(e){S.patientError=e.message||'Disponibilités indisponibles.'}finally{S.patientLoading=false;renderPatient()}}
async function loadPatient(){S.patientLoading=true;S.patientError='';renderPatient();try{await Promise.all([loadCenters(),loadPatientAppointments()]);await loadPatientSlots()}catch(e){S.patientError=e.message||'Planning indisponible.';S.patientLoading=false;renderPatient()}}
function patientUpcoming(){return S.patientAppointments.filter(x=>new Date(x.scheduled_start)>new Date()&&!['cancelled','completed','no_show'].includes(x.status))}
function patientBookingDays(){const c=S.centers.find(x=>x.id===S.patientOrg),tz=c?.timezone||'Europe/Paris';return Array.from({length:7},(_,i)=>addDays(S.patientStart,i)).map(key=>({key,label:dayLabel(key,tz),slots:S.patientSlots.filter(s=>dateKey(s.slot_start,tz)===key)}))}
function patientBookingPremiumStyle(){
  if(document.querySelector('#kbookPatientPremiumStyle'))return;
  const s=document.createElement('style');
  s.id='kbookPatientPremiumStyle';
  s.textContent=`
body.kbooking-patient #viewRoot{background:#f4f7f5!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:none!important}
body.kbooking-patient #viewRoot::-webkit-scrollbar{display:none!important}
.kbook.patient{width:min(1280px,100%);margin:0 auto;padding:10px clamp(18px,3vw,42px) 96px;gap:10px!important;color:#17251d}
.kbook.patient .kbook-hero{min-height:190px;align-items:center!important;padding:22px!important;border:1px solid #dce6df!important;border-radius:22px!important;background:radial-gradient(520px 260px at 100% 0%,rgba(100,124,241,.08),transparent 70%),radial-gradient(520px 260px at 0% 100%,rgba(69,169,119,.12),transparent 70%),#fff!important;box-shadow:0 13px 34px rgba(38,67,50,.06)!important}
.kbook.patient .kbook-hero h2{margin:6px 0 8px!important;color:#18382a!important;font:600 clamp(28px,3vw,42px)/1 Manrope,"DM Sans",sans-serif!important;letter-spacing:-.048em!important}
.kbook.patient .kbook-hero p{max-width:680px!important;margin:0!important;color:#6e7d74!important;font:400 10px/1.45 "DM Sans",sans-serif!important}
.kbook.patient .kbook-next{min-width:190px!important;padding:18px!important;border:1px solid #d7e5dc!important;border-radius:17px!important;background:#eef7f2!important;color:#234b36!important;box-shadow:none!important}
.kbook.patient .kbook-next span{color:#64806f!important;font:600 7px/1 "DM Sans",sans-serif!important;letter-spacing:.1em!important}
.kbook.patient .kbook-next strong{margin-top:8px!important;color:#1f5c40!important;font:600 24px/1 Manrope,"DM Sans",sans-serif!important}
.kbook.patient .kbook-next small{margin-top:7px!important;color:#6f8176!important;font:400 8px/1.3 "DM Sans",sans-serif!important;text-transform:none!important;letter-spacing:0!important}
.kbook.patient .kbook-upcoming{padding:18px!important;border:1px solid #dce6df!important;border-radius:20px!important;background:#fff!important;box-shadow:0 10px 28px rgba(38,67,50,.045)!important}
.kbook.patient .kbook-upcoming-list article{padding:14px 15px!important;border-color:#e0e9e4!important;border-radius:14px!important;background:#f8faf9!important}
.kbook.patient .kbook-upcoming-list span{color:#63806f!important;font-size:7px!important}
.kbook.patient .kbook-upcoming-list strong{color:#294938!important;font:600 15px/1.1 Manrope,"DM Sans",sans-serif!important}
.kbook.patient .kbook-upcoming-list small{color:#77877e!important;font-size:9px!important}
.kbook.patient .kbook-upcoming-list b{display:inline-flex;min-height:24px;align-items:center;padding:0 8px;border-radius:999px;background:#e7f5ed;color:#397454!important;font-size:7px!important}
.kbook.patient .kbook-controls{padding:15px 16px!important;border:1px solid #dce6df!important;border-radius:18px!important;background:#fff!important}
.kbook.patient .kbook-controls label>span,.kbook.patient .kbook-service>span{font:600 7px/1 "DM Sans",sans-serif!important;color:#6d8074!important}
.kbook.patient select{border-color:#d8e4dc!important;background:#fafcfb!important;color:#17251d!important}
.kbook.patient .kbook-service>div{border-color:#d8e4dc!important;background:#f1f5f2!important}
.kbook.patient .kbook-service button.active{background:#2f8059!important;color:#fff!important}
.kbook.patient .kbook-week-head{padding-top:6px!important}
.kbook.patient .kbook-week-head h3{color:#294938!important;font:600 19px/1 Manrope,"DM Sans",sans-serif!important}
.kbook.patient .kbook-day{border-color:#dce6df!important;background:#fff!important}
.kbook.patient .kbook-day header{background:#f4f7f5!important;border-color:#e0e9e4!important;color:#5f7568!important}
.kbook.patient .kbook-day button{border-color:#e0e9e4!important;color:#294938!important}
.kbook.patient .kbook-day button:hover{background:#2f8059!important;color:#fff!important}
html[data-adaptive-shell][data-adaptive-mode="patient"] body.kbooking-patient #kamRoleRow{display:none!important}
@media(max-width:700px){
 body.kbooking-patient .topbar{min-height:52px!important;height:52px!important;padding:7px 12px!important;display:flex!important;align-items:center!important}
 body.kbooking-patient #pageEyebrow{display:none!important}
 body.kbooking-patient #pageTitle{margin:0!important;font:600 18px/1 Manrope,"DM Sans",sans-serif!important;letter-spacing:-.035em!important}
 body.kbooking-patient #komoWorldTopEntry{min-height:30px!important;padding:0 9px!important;font-size:6px!important}
 body.kbooking-patient #refreshButton{width:30px!important;min-width:30px!important;height:30px!important}
 body.kbooking-patient #viewRoot{padding-top:0!important}
 .kbook.patient{padding:6px 8px calc(76px + env(safe-area-inset-bottom));gap:7px!important}
 .kbook.patient .kbook-hero{min-height:0;padding:15px!important;border-radius:16px!important;display:grid!important;grid-template-columns:1fr!important;gap:10px!important}
 .kbook.patient .kbook-hero h2{font-size:23px!important}
 .kbook.patient .kbook-hero p{font-size:8px!important}
 .kbook.patient .kbook-next{min-width:0!important;width:100%!important;padding:11px!important;display:grid!important;grid-template-columns:auto 1fr!important;align-items:center!important;gap:6px 12px!important}
 .kbook.patient .kbook-next span{grid-column:1/-1!important}.kbook.patient .kbook-next strong{font-size:18px!important;margin:0!important}.kbook.patient .kbook-next small{font-size:7px!important;margin:0!important}
 .kbook.patient .kbook-upcoming{padding:11px!important;border-radius:15px!important}
 .kbook.patient .kbook-upcoming-list article{padding:10px!important;gap:8px!important}
 .kbook.patient .kbook-controls{padding:10px!important;border-radius:15px!important;gap:9px!important}
 .kbook.patient .kbook-week-head{display:flex!important;flex-direction:row!important;align-items:flex-end!important;gap:8px!important}
 .kbook.patient .kbook-week-head h3{font-size:14px!important}
 .kbook.patient .kbook-week-actions span{min-width:0!important;font-size:7px!important}
 .kbook.patient .kbook-week-actions button{width:30px!important;height:30px!important}
 .kbook.patient .kbook-days{grid-template-columns:repeat(7,116px)!important;gap:5px!important}
 .kbook.patient .kbook-day{min-width:116px!important;border-radius:13px!important}
 .kbook.patient .kbook-day header{padding:8px!important;font-size:8px!important}
 .kbook.patient .kbook-day>div{padding:5px!important;gap:4px!important;max-height:190px!important}
 .kbook.patient .kbook-day button{padding:7px!important;border-radius:9px!important}
 .kbook.patient .kbook-day button strong{font-size:10px!important}.kbook.patient .kbook-day button small{font-size:6.5px!important}
}
`;
  document.head.appendChild(s);
}
function renderPatient(){
  if(location.hash.replace(/^#/,'')!=='documents'||['professional','admin'].includes(S.role))return;
  const root=document.querySelector('#viewRoot');if(!root)return;
  patientBookingPremiumStyle();document.body.classList.add('kbooking-patient');
  const c=S.centers.find(x=>x.id===S.patientOrg),tz=c?.timezone||'Europe/Paris',up=patientUpcoming(),next=up[0]||null;
  document.querySelector('#pageEyebrow').textContent='KŌMØ PULSE · RENDEZ-VOUS';
  document.querySelector('#pageTitle').textContent='Rendez-vous.';
  const nextCard=next?(()=>{const center=S.centers.find(x=>x.id===next.organization_id),z=center?.timezone||'Europe/Paris';return`<div class="kbook-next"><span>PROCHAIN RENDEZ-VOUS</span><strong>${esc(fullDate(next.scheduled_start,z).replace(/ à /,' · '))}</strong><small>${esc(serviceLabel(next.appointment_type))} · ${esc(center?.name||'KŌMØ')}</small></div>`})():`<div class="kbook-next"><span>PROCHAIN RENDEZ-VOUS</span><strong>À planifier</strong><small>Choisissez un créneau ci-dessous.</small></div>`;
  const upcoming=`<section class="kbook-upcoming"><div class="kbook-section-title"><div><p class="eyebrow">MES RENDEZ-VOUS</p><h3>À venir.</h3></div></div>${up.length?`<div class="kbook-upcoming-list">${up.map(a=>{const center=S.centers.find(x=>x.id===a.organization_id),z=center?.timezone||'Europe/Paris';return`<article><div><span>${esc(serviceLabel(a.appointment_type))}</span><strong>${esc(center?.name||'Centre KŌMØ')}</strong><small>${esc(fullDate(a.scheduled_start,z))}</small></div><div><b>${esc(apptStatus(a.status))}</b><button type="button" data-kbook-cancel="${a.id}">Annuler</button></div></article>`}).join('')}</div>`:'<div class="kbook-empty">Aucun rendez-vous à venir.</div>'}</section>`;
  root.innerHTML=`<div class="kbook patient" data-kbook-patient>
    <section class="kbook-hero"><div><p class="eyebrow">KŌMØ PULSE · RENDEZ-VOUS</p><h2>Votre suivi KŌMØ.</h2><p>Retrouvez votre prochain rendez-vous puis planifiez une nouvelle mesure Motion ou une consultation Clinical selon votre parcours.</p></div>${nextCard}</section>
    ${upcoming}
    <section class="kbook-controls"><label><span>Centre</span><select id="kbookPatientOrg">${S.centers.map(x=>`<option value="${x.id}" ${x.id===S.patientOrg?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><div class="kbook-service"><span>Type de rendez-vous</span><div><button type="button" data-kbook-service="motion" class="${S.patientService==='motion'?'active':''}" ${c&&!c.motion_enabled?'disabled':''}>Motion</button><button type="button" data-kbook-service="clinical" class="${S.patientService==='clinical'?'active':''}" ${c&&!c.clinical_enabled?'disabled':''}>Clinical</button></div></div></section>
    ${S.patientError?`<div class="kbook-alert">${esc(S.patientError)}${S.patientError.includes('profile')?'<button data-route="profile">Compléter mon profil →</button>':''}</div>`:''}
    <section class="kbook-week-head"><div><p class="eyebrow">NOUVEAU RENDEZ-VOUS · 30 MIN</p><h3>${esc(c?.name||'Choisissez un centre')}</h3></div><div class="kbook-week-actions"><button type="button" id="kbookPatientPrev" ${S.patientStart<=todayKey()?'disabled':''}>←</button><span>${dayLabel(S.patientStart,tz)} — ${dayLabel(addDays(S.patientStart,6),tz)}</span><button type="button" id="kbookPatientNext">→</button></div></section>
    <section class="kbook-days">${S.patientLoading?'<div class="kbook-loading">Chargement des créneaux…</div>':patientBookingDays().map(d=>`<article class="kbook-day"><header>${esc(d.label)}</header><div>${d.slots.length?d.slots.map(s=>`<button type="button" data-kbook-slot="${s.slot_start}"><strong>${timeKey(s.slot_start,tz)}</strong><small>${s.available_capacity>1?`${s.available_capacity} disponibilités`:'Disponible'}</small></button>`).join(''):'<span class="kbook-none">Aucun créneau</span>'}</div></article>`).join('')}</section>
  </div>`;
  bindPatient();
}
function bindPatient(){document.querySelector('#kbookPatientOrg')?.addEventListener('change',async e=>{S.patientOrg=e.target.value;const c=S.centers.find(x=>x.id===S.patientOrg);if(c&&!c[`${S.patientService}_enabled`])S.patientService=c.motion_enabled?'motion':'clinical';await loadPatientSlots()});document.querySelectorAll('[data-kbook-service]').forEach(b=>b.addEventListener('click',async()=>{S.patientService=b.dataset.kbookService;await loadPatientSlots()}));document.querySelector('#kbookPatientPrev')?.addEventListener('click',async()=>{S.patientStart=addDays(S.patientStart,-7);if(S.patientStart<todayKey())S.patientStart=todayKey();await loadPatientSlots()});document.querySelector('#kbookPatientNext')?.addEventListener('click',async()=>{S.patientStart=addDays(S.patientStart,7);await loadPatientSlots()});document.querySelectorAll('[data-kbook-slot]').forEach(b=>b.addEventListener('click',()=>bookPatient(b.dataset.kbookSlot)));document.querySelectorAll('[data-kbook-cancel]').forEach(b=>b.addEventListener('click',()=>cancelPatient(b.dataset.kbookCancel)))}
async function bookPatient(slot){const c=S.centers.find(x=>x.id===S.patientOrg),tz=c?.timezone||'Europe/Paris';if(!confirm(`${serviceLabel(S.patientService)} · ${c?.name||'Centre KŌMØ'}\n${fullDate(slot,tz)}\n\nConfirmer ce créneau ?`))return;S.patientLoading=true;renderPatient();const q=await sb().rpc('book_komo_appointment',{p_organization_id:S.patientOrg,p_service:S.patientService,p_slot_start:slot});if(q.error){const msg=q.error.message||'';S.patientError=msg.includes('profile_incomplete')?'Votre profil doit être complété avant de réserver.':msg.includes('slot_unavailable')?'Ce créneau vient d’être réservé. Choisissez-en un autre.':'La réservation n’a pas pu être confirmée.';S.patientLoading=false;renderPatient();return}notify('Rendez-vous confirmé.');await loadPatient()}
async function cancelPatient(id){if(!confirm('Annuler ce rendez-vous ?'))return;const q=await sb().rpc('cancel_my_komo_appointment',{p_appointment_id:id});if(q.error){notify('Impossible d’annuler ce rendez-vous.');return}notify('Rendez-vous annulé.');await loadPatient()}

async function loadProCenters(){const q=await sb().from('organizations').select('id,name,timezone,clinical_data_status').eq('status','active').order('name');if(q.error)throw q.error;S.proCenters=q.data||[];if(!S.proOrg||!S.proCenters.some(x=>x.id===S.proOrg)){S.proOrg=S.proCenters[0]?.id||'';if(S.proOrg)localStorage.setItem(ORG_KEY,S.proOrg)}}
async function loadProWeek(){if(!S.proOrg)return;S.proLoading=true;S.proError='';renderPro();try{const broadStart=addDays(S.proWeek,-1),broadEnd=addDays(S.proWeek,8);const [a,h]=await Promise.all([sb().from('organization_appointments').select('id,organization_id,patient_id,assigned_user_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,booking_source,patients(id,first_name,last_name,preferred_name,email,external_reference)').eq('organization_id',S.proOrg).gte('scheduled_start',`${broadStart}T00:00:00Z`).lt('scheduled_start',`${broadEnd}T00:00:00Z`).order('scheduled_start'),sb().from('organization_booking_hours').select('weekday,start_time,end_time,enabled').eq('organization_id',S.proOrg).eq('enabled',true).order('weekday')]);if(a.error)throw a.error;S.proAppointments=a.data||[];S.proHours=h.data||[]}catch(e){S.proError=e.message||'Planning indisponible.'}finally{S.proLoading=false;renderPro()}}
async function openPro(){S.proActive=true;S.proLoading=true;S.proError='';hideClinicalHosts();try{await loadProCenters();await loadProWeek()}catch(e){S.proError=e.message||'Planning indisponible.';S.proLoading=false;renderPro()}}
function hideClinicalHosts(){const bar=document.querySelector('#kcpPatientBar'),host=document.querySelector('#kcpMotionHost'),view=document.querySelector('#kcpView');if(bar)bar.hidden=true;if(host)host.hidden=true;if(view)view.hidden=false}
function patientName(p){return `${p?.preferred_name||p?.first_name||''} ${p?.last_name||''}`.trim()||p?.email||'Patient KŌMØ'}
function proDays(){return Array.from({length:5},(_,i)=>addDays(S.proWeek,i))}
function timeRows(){let min=9*60,max=18*60;if(S.proHours.length){const mins=S.proHours.map(h=>Number(h.start_time.slice(0,2))*60+Number(h.start_time.slice(3,5))),maxs=S.proHours.map(h=>Number(h.end_time.slice(0,2))*60+Number(h.end_time.slice(3,5)));min=Math.min(...mins);max=Math.max(...maxs)}const rows=[];for(let m=min;m<max;m+=30)rows.push(`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`);return rows}
function isOpen(dayIndex,time){const wd=dayIndex+1,mins=Number(time.slice(0,2))*60+Number(time.slice(3)),ranges=S.proHours.filter(h=>h.weekday===wd);if(!ranges.length)return false;return ranges.some(h=>{const a=Number(h.start_time.slice(0,2))*60+Number(h.start_time.slice(3,5)),b=Number(h.end_time.slice(0,2))*60+Number(h.end_time.slice(3,5));return mins>=a&&mins<b})}
function apptsAt(day,time,tz){return S.proAppointments.filter(a=>dateKey(a.scheduled_start,tz)===day&&timeKey(a.scheduled_start,tz)===time&&!['cancelled'].includes(a.status))}
function renderPro(){if(!S.proActive)return;hideClinicalHosts();const view=document.querySelector('#kcpView');if(!view)return;document.querySelectorAll('.kcp-tab').forEach(x=>x.classList.remove('active'));const c=S.proCenters.find(x=>x.id===S.proOrg),tz=c?.timezone||'Europe/Paris',days=proDays(),times=timeRows();view.innerHTML=`<div class="kbook pro" data-kbook-pro><section class="kbook-pro-head"><div><p class="eyebrow">CLINICAL ACCÈS PRO · PLANNING</p><h2>Planning hebdomadaire.</h2><p>Les réservations Motion et Clinical apparaissent ici par créneaux de 30 minutes.</p></div><div class="kbook-pro-controls"><label><span>Centre</span><select id="kbookProOrg">${S.proCenters.map(x=>`<option value="${x.id}" ${x.id===S.proOrg?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><div class="kbook-week-actions"><button id="kbookProPrev">←</button><span>${dayLabel(days[0],tz)} — ${dayLabel(days[4],tz)}</span><button id="kbookProNext">→</button></div></div></section>${S.proError?`<div class="kbook-alert">${esc(S.proError)}</div>`:''}${S.proLoading?'<div class="kbook-loading">Chargement du planning…</div>':`<section class="kbook-calendar"><div class="kbook-cal-head"><div></div>${days.map(d=>`<div><strong>${esc(dayLabel(d,tz))}</strong></div>`).join('')}</div><div class="kbook-cal-body">${times.map(t=>`<div class="kbook-cal-row"><div class="kbook-time">${t}</div>${days.map((d,i)=>{const aps=apptsAt(d,t,tz),open=isOpen(i,t);return`<div class="kbook-slot ${open?'open':'closed'}">${aps.map(a=>`<button type="button" data-kbook-open-patient="${a.patient_id}" class="${a.appointment_type}"><strong>${esc(patientName(a.patients))}</strong><span>${a.appointment_type==='clinical'?'Clinical':'Motion'}</span><small>${esc(apptStatus(a.status))}</small></button>`).join('')}</div>`}).join('')}</div>`).join('')}</div></section>`}</div>`;bindPro()}
function bindPro(){document.querySelector('#kbookProOrg')?.addEventListener('change',async e=>{S.proOrg=e.target.value;localStorage.setItem(ORG_KEY,S.proOrg);localStorage.removeItem(PATIENT_KEY);window.dispatchEvent(new CustomEvent('komo:center-changed',{detail:{organizationId:S.proOrg}}));await loadProWeek()});document.querySelector('#kbookProPrev')?.addEventListener('click',async()=>{S.proWeek=addDays(S.proWeek,-7);await loadProWeek()});document.querySelector('#kbookProNext')?.addEventListener('click',async()=>{S.proWeek=addDays(S.proWeek,7);await loadProWeek()});document.querySelectorAll('[data-kbook-open-patient]').forEach(b=>b.addEventListener('click',()=>{localStorage.setItem(PATIENT_KEY,b.dataset.kbookOpenPatient);S.proActive=false;window.KomoPatientManagement?.open?.()}))}
function deactivatePro(){S.proActive=false}

async function refresh(){try{if(!await base())return;const r=location.hash.replace(/^#/,'');if(r==='documents'&&!['professional','admin'].includes(S.role))await loadPatient();else document.body.classList.remove('kbooking-patient')}catch(e){console.error(e)}}
window.KomoBooking={openProPlanning:openPro,deactivatePro,refreshPatient:loadPatient};
window.addEventListener('hashchange',()=>setTimeout(refresh,120));document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,900));const obs=new MutationObserver(()=>{const r=location.hash.replace(/^#/,'');if(r==='documents'&&!['professional','admin'].includes(S.role)&&!document.querySelector('[data-kbook-patient]'))setTimeout(refresh,80)});obs.observe(document.body,{subtree:true,childList:true});setTimeout(refresh,1400);
