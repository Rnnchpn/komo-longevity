import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
let client=null,busy=false,timer=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function memberMode(){const b=document.querySelector('#modeSwitch button[data-mode="member"]');return !b||b.classList.contains('active')}
function fmt(v){if(!v)return'';return new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Paris'}).format(new Date(v))}
function activeAppointment(rows,type){const list=(rows||[]).filter(x=>x.appointment_type===type&&!['cancelled','no_show'].includes(x.status));const future=list.filter(x=>new Date(x.scheduled_start).getTime()>=Date.now()-7200000);return future[0]||list.at(-1)||null}

async function readData(){
  const c=sb(),ctx=window.KomoRuntime?.getContext?.(),session=ctx?.session||(await c.auth.getSession()).data?.session;if(!session?.user)return null;
  const [free,patients]=await Promise.all([
    c.from('pulse_assessments').select('id,status,responses,completed_at,updated_at').eq('user_id',session.user.id).eq('protocol_version','mobility-check-v1').order('updated_at',{ascending:false}).limit(1).maybeSingle(),
    c.from('patients').select('id').eq('patient_user_id',session.user.id)
  ]);
  const pids=(patients.data||[]).map(x=>x.id),appointments=pids.length?await c.from('organization_appointments').select('id,organization_id,appointment_type,scheduled_start,status').in('patient_id',pids).in('appointment_type',['motion','clinical']).order('scheduled_start',{ascending:true}):{data:[]};
  const centers=await c.rpc('komo_booking_centers_v2');const names={};(centers.data||[]).forEach(x=>names[x.id]=x.name);
  return{free:free.data||null,appointments:appointments.data||[],names};
}

function freeProgress(a){const r=a?.responses||{},keys=['baseline','chair_stand','two_step'],done=keys.filter(k=>r?.[k]?.completed_at).length;return{done,pct:Math.round(done/keys.length*100)}}
function serviceState(a){
  if(!a)return{kind:'idle',pill:'À planifier',title:'Demande de rendez-vous dans un centre et à une heure.',detail:'Choisissez un centre KŌMØ puis un créneau disponible. Le professionnel validera ensuite votre consultation.',cta:'Débuter'};
  if(a.status==='scheduled')return{kind:'pending',pill:'Validation en attente',title:'Votre demande a été envoyée au centre.',detail:'Le créneau est réservé provisoirement. Le professionnel doit encore valider la consultation avant l’ouverture du pré-bilan.',cta:'Voir ma demande'};
  if(['confirmed','arrived','in_progress','completed'].includes(a.status))return{kind:'ready',pill:'Consultation validée',title:'Votre consultation est validée, vous pouvez commencer les questionnaires pré-consultation.',detail:'Vos réponses seront enregistrées dans Pulse et partagées avec l’équipe du centre avant votre venue.',cta:'Débuter'};
  return{kind:'idle',pill:'À planifier',title:'Demande de rendez-vous dans un centre et à une heure.',detail:'Choisissez un centre puis un créneau disponible.',cta:'Débuter'};
}
function card(type,index,title,kicker,state,appt,center,extra=''){
  const learn=`https://komolongevity.com/fr/pulse/?assessment=${type==='free'?'start':type}`;
  return `<article class="kpa-card ${type} ${state.kind}"><div class="kpa-card-top"><span>${String(index).padStart(2,'0')} · ${esc(kicker)}</span><b>${esc(state.pill)}</b></div><div class="kpa-card-copy"><h2>${esc(title)}</h2><h3>${esc(state.title)}</h3><p>${esc(state.detail)}</p>${appt?`<div class="kpa-appointment"><strong>${esc(center||'Centre KŌMØ')}</strong><span>${esc(fmt(appt.scheduled_start))}</span></div>`:''}${extra}</div><div class="kpa-card-foot"><a href="${learn}" target="_blank" rel="noopener noreferrer">Comprendre ce bilan ↗</a><button type="button" data-kpa-action="${type}" data-kpa-state="${state.kind}">${esc(state.cta)} <span>→</span></button></div></article>`;
}
function render(d){
  const root=document.querySelector('.tests-v1-root');if(!root)return;
  root.querySelector('[data-kpa-trio]')?.remove();
  const fp=freeProgress(d.free),motion=activeAppointment(d.appointments,'motion'),clinical=activeAppointment(d.appointments,'clinical');
  const fstate=fp.done===3?{kind:'ready',pill:'Disponible',title:'Votre première référence est complète.',detail:'Vous pouvez revoir vos trois mesures ou poursuivre vers KŌMØ Motion.',cta:'Revoir'}:{kind:'ready',pill:fp.done?`${fp.done}/3 complétés`:'Gratuit',title:'Votre bilan de départ, à réaliser chez vous.',detail:'Questionnaire, Chair Stand 30 s et Two-Step pour obtenir un premier repère fonctionnel.',cta:fp.done?'Continuer':'Débuter'};
  const ms=serviceState(motion),cs=serviceState(clinical);
  const node=document.createElement('section');node.dataset.kpaTrio='1';node.className='kpa-trio';node.innerHTML=`<div class="kpa-heading"><div><p class="eyebrow">VOS 3 ÉVALUATIONS</p><h2>Commencez au bon niveau.</h2></div><p>Start est accessible immédiatement. Motion et Clinical commencent par une demande de rendez-vous puis s’ouvrent après validation du centre.</p></div><div class="kpa-grid">${card('free',1,'KŌMØ Start','GRATUIT',fstate,null,'',`<div class="kpa-mini-progress"><i style="width:${fp.pct}%"></i><span>${fp.pct}%</span></div>`)}${card('motion',2,'KŌMØ Motion','INSTRUMENTÉ',ms,motion,d.names[motion?.organization_id])}${card('clinical',3,'KŌMØ Clinical','MÉDICAL',cs,clinical,d.names[clinical?.organization_id])}</div>`;
  root.prepend(node);bind(node,motion,clinical);
}
function goBooking(type){sessionStorage.setItem('komo_booking_service',type);location.hash='documents'}
function goPrep(type){sessionStorage.setItem('komo_open_preparation',type);location.hash='documents'}
function startFree(){const b=document.querySelector('.tests-v1-hero [data-open-test]')||document.querySelector('.tests-v1-grid [data-open-test]:not([disabled])');b?.click()}
function bind(node,motion,clinical){node.querySelectorAll('[data-kpa-action]').forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.kpaAction,state=b.dataset.kpaState;if(type==='free')return startFree();const appt=type==='motion'?motion:clinical;if(state==='ready'&&appt)return goPrep(type);goBooking(type)}))}
async function mount(){if(location.hash!=='#results'||!memberMode()||busy)return;const root=document.querySelector('.tests-v1-root');if(!root)return;busy=true;try{const d=await readData();if(d)render(d)}catch(e){console.error('[patient-assessment-trio]',e)}finally{busy=false}}
function schedule(){clearTimeout(timer);timer=setTimeout(mount,140)}
window.addEventListener('hashchange',schedule);window.addEventListener('komo:route-ready',schedule);window.addEventListener('komo:data-ready',schedule);window.addEventListener('komo:appointment-updated',schedule);const vr=document.querySelector('#viewRoot');if(vr)new MutationObserver(()=>{if(location.hash==='#results'&&!document.querySelector('[data-kpa-trio]'))schedule()}).observe(vr,{childList:true,subtree:true});setTimeout(schedule,1300);
