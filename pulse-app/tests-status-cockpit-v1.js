const BASE_CODES=['KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'];
let busy=false,timer=null,lastKey='';

function sb(){return window.KomoRuntime?.client||null}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function memberMode(){const b=document.querySelector('#modeSwitch button[data-mode="member"]');return !b||b.classList.contains('active')}
function fmt(v){if(!v)return'—';return new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Paris'}).format(new Date(v)).replace('.','')}
function startDone(a){const r=a?.responses||{};return ['baseline','chair_stand','two_step'].every(k=>Boolean(r?.[k]?.completed_at))}
function startCount(a){const r=a?.responses||{};return ['baseline','chair_stand','two_step'].filter(k=>Boolean(r?.[k]?.completed_at)).length}
function activeAppointment(rows,type){const list=(rows||[]).filter(x=>x.appointment_type===type&&!['cancelled','no_show'].includes(x.status));const future=list.filter(x=>new Date(x.scheduled_start).getTime()>=Date.now()-7200000);return future[0]||list.at(-1)||null}
function statusFor(appt,hasReleased=false){if(hasReleased||appt?.status==='completed')return{label:'Réalisé',kind:'done'};if(appt?.status==='scheduled')return{label:'En attente',kind:'pending'};if(['confirmed','arrived','in_progress'].includes(appt?.status))return{label:'Validé',kind:'ready'};return{label:'À planifier',kind:'idle'}}

async function readData(){
  const c=sb();if(!c)return null;
  const ctx=window.KomoRuntime?.getContext?.();const session=ctx?.session||(await c.auth.getSession()).data?.session;if(!session?.user)return null;
  const [free,patients]=await Promise.all([
    c.from('pulse_assessments').select('id,status,responses,completed_at,updated_at').eq('user_id',session.user.id).eq('protocol_version','mobility-check-v1').order('updated_at',{ascending:false}).limit(1).maybeSingle(),
    c.from('patients').select('id').eq('patient_user_id',session.user.id)
  ]);
  const pids=(patients.data||[]).map(x=>x.id);let appointments=[],assessments=[],scores=[];
  if(pids.length){
    const [ap,ar]=await Promise.all([
      c.from('organization_appointments').select('id,organization_id,appointment_type,scheduled_start,status').in('patient_id',pids).in('appointment_type',['motion','clinical']).order('scheduled_start',{ascending:true}),
      c.from('assessments').select('id,product_mode,status,created_at').in('patient_id',pids).order('created_at',{ascending:false})
    ]);
    appointments=ap.data||[];assessments=ar.data||[];
    const aids=assessments.map(x=>x.id);if(aids.length){const sr=await c.from('scores').select('assessment_id,motion_score,release_status,calculated_at').in('assessment_id',aids).eq('release_status','released').order('calculated_at',{ascending:false});scores=sr.data||[]}
  }
  const motionAppt=activeAppointment(appointments,'motion'),clinicalAppt=activeAppointment(appointments,'clinical');
  const latestMotion=assessments.find(x=>x.product_mode==='motion')||null;let prep={done:0,total:6};
  if(latestMotion?.id){const qs=await c.from('questionnaire_sessions').select('instrument_code,status,completeness').eq('assessment_id',latestMotion.id).in('instrument_code',BASE_CODES);const rows=qs.data||[];prep.done=BASE_CODES.filter(code=>rows.some(x=>x.instrument_code===code&&x.status==='completed'&&Number(x.completeness||0)>=100)).length}
  let centers={};try{const cr=await c.rpc('komo_booking_centers_v2');(cr.data||[]).forEach(x=>centers[x.id]=x.name)}catch{}
  return{free:free.data||null,motionAppt,clinicalAppt,prep,centers,releasedMotion:scores.some(x=>x.motion_score!=null)};
}

function nextAction(d){
  const done=startDone(d.free),count=startCount(d.free),m=d.motionAppt,c=d.clinicalAppt;
  if(!done)return{eyebrow:'À FAIRE MAINTENANT',title:count?'Terminez votre KŌMØ Start.':'Commencez votre KŌMØ Start.',body:`${count}/3 étapes complétées. Votre première référence se construit directement dans Pulse.`,cta:count?'Continuer mes tests':'Commencer',action:'start'};
  if(d.releasedMotion)return{eyebrow:'VOS RÉSULTATS SONT DISPONIBLES',title:'Votre Motion Score est publié.',body:'Consultez vos résultats puis retrouvez les priorités de prise en charge dans KŌMØ Therapy.',cta:'Voir My KŌMØ Score',action:'score'};
  if(m?.status==='scheduled')return{eyebrow:'DEMANDE ENVOYÉE',title:'Votre centre doit encore valider Motion.',body:`${d.centers[m.organization_id]||'Centre KŌMØ'} · ${fmt(m.scheduled_start)}. Les questionnaires s’ouvriront après validation.`,cta:'Voir ma demande',action:'agenda'};
  if(['confirmed','arrived','in_progress'].includes(m?.status)&&d.prep.done<d.prep.total)return{eyebrow:'CONSULTATION VALIDÉE',title:'Préparez maintenant votre KŌMØ Motion.',body:`${d.prep.done}/${d.prep.total} sections pré-consultation complétées · ${d.centers[m.organization_id]||'Centre KŌMØ'} · ${fmt(m.scheduled_start)}.`,cta:d.prep.done?'Continuer la préparation':'Commencer les questionnaires',action:'prep-motion'};
  if(!m)return{eyebrow:'PROCHAINE ÉTAPE',title:'Réservez votre KŌMØ Motion.',body:'Votre point de départ est établi. Choisissez maintenant un centre et un créneau pour votre évaluation instrumentée.',cta:'Prendre rendez-vous',action:'book-motion'};
  if(c?.status==='scheduled')return{eyebrow:'DEMANDE CLINICAL',title:'Votre consultation Clinical attend validation.',body:`${d.centers[c.organization_id]||'Centre KŌMØ'} · ${fmt(c.scheduled_start)}.`,cta:'Voir mon agenda',action:'agenda'};
  return{eyebrow:'PARCOURS EN COURS',title:'Votre prochaine étape est prête.',body:'Retrouvez vos consultations et les prochaines actions dans votre Agenda et réseau.',cta:'Ouvrir mon agenda',action:'agenda'};
}

function step(label,state){return`<div class="kts-step ${state.kind}"><span>${esc(label)}</span><strong>${esc(state.label)}</strong></div>`}
function render(d){
  const old=document.querySelector('.tests-v1-progress-card');if(!old)return;
  const action=nextAction(d),sCount=startCount(d.free),sDone=startDone(d.free),mState=statusFor(d.motionAppt,d.releasedMotion),cState=statusFor(d.clinicalAppt,false);
  const next=[d.motionAppt,d.clinicalAppt].filter(Boolean).filter(x=>!['cancelled','completed','no_show'].includes(x.status)).sort((a,b)=>new Date(a.scheduled_start)-new Date(b.scheduled_start))[0];
  const prepText=['confirmed','arrived','in_progress'].includes(d.motionAppt?.status)?`${d.prep.done}/${d.prep.total} sections`:d.motionAppt?.status==='scheduled'?'Après validation':'Non ouverte';
  const node=document.createElement('aside');node.className='tests-v1-status-card';node.dataset.kts='1';node.innerHTML=`<div class="kts-head"><span>VOTRE STATUT KŌMØ</span><i></i></div><div class="kts-action"><small>${esc(action.eyebrow)}</small><h3>${esc(action.title)}</h3><p>${esc(action.body)}</p><button type="button" data-kts-action="${esc(action.action)}">${esc(action.cta)} <span>→</span></button></div><div class="kts-steps">${step('KŌMØ Start',{label:sDone?'Terminé':`${sCount}/3`,kind:sDone?'done':sCount?'pending':'idle'})}${step('KŌMØ Motion',mState)}${step('KŌMØ Clinical',cState)}</div><div class="kts-meta"><div><span>Prochaine consultation</span><strong>${next?fmt(next.scheduled_start):'À programmer'}</strong></div><div><span>Pré-consultation</span><strong>${prepText}</strong></div></div>`;
  old.replaceWith(node);bind(node);
}
function bind(node){node.querySelector('[data-kts-action]')?.addEventListener('click',()=>{const a=node.querySelector('[data-kts-action]').dataset.ktsAction;if(a==='start'){const b=document.querySelector('.tests-v1-hero [data-open-test]')||document.querySelector('.tests-v1-grid [data-open-test]:not([disabled])');b?.click();return}if(a==='score'){location.hash='path';return}if(a==='book-motion'){sessionStorage.setItem('komo_booking_service','motion');location.hash='documents';return}if(a==='prep-motion'){sessionStorage.setItem('komo_open_preparation','motion');location.hash='documents';return}location.hash='documents'})}
async function mount(){if(location.hash!=='#results'||!memberMode()||busy)return;if(!document.querySelector('.tests-v1-progress-card'))return;busy=true;try{const d=await readData();if(!d)return;const key=JSON.stringify([d.free?.updated_at,d.motionAppt?.id,d.motionAppt?.status,d.clinicalAppt?.id,d.clinicalAppt?.status,d.prep.done,d.releasedMotion]);if(key===lastKey&&document.querySelector('[data-kts]'))return;lastKey=key;render(d)}catch(e){console.error('[tests-status-cockpit]',e)}finally{busy=false}}
function schedule(){clearTimeout(timer);timer=setTimeout(mount,120)}
window.addEventListener('hashchange',schedule);window.addEventListener('komo:data-ready',schedule);window.addEventListener('komo:route-ready',schedule);window.addEventListener('komo:appointment-updated',schedule);window.addEventListener('komo:questionnaire-saved',schedule);const vr=document.querySelector('#viewRoot');if(vr)new MutationObserver(()=>{if(location.hash==='#results'&&document.querySelector('.tests-v1-progress-card'))schedule()}).observe(vr,{childList:true,subtree:true});setTimeout(schedule,900);
