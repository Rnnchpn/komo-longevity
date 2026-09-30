import './komo-assistant-shell-v2.js';
import './patient-mobile-v1.js';

const VERSION='9.2.0-premium-cockpit';
let timer=0;
const state={user:null,profile:null,role:null,engagement:null,wallet:null,memberships:[],patient:null,assessment:null,priorities:[],scores:[],wearables:[],wearable:null,report:null,appointments:[],appointment:null,organization:null,avatarUrl:'',loadedFor:null,lastLoad:0,loading:false};

const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const client=()=>window.KomoRuntime?.client||null;
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const safe=async query=>{try{const r=await query;return r?.error?null:r?.data??null}catch{return null}};
const num=v=>Number.isFinite(Number(v))?Number(v):null;
const fmt=v=>num(v)===null?'—':Math.round(Number(v)).toLocaleString('fr-FR');
const pad=n=>String(n).padStart(2,'0');

function profileName(){
 const p=state.profile||{},u=state.user||{};
 return p.display_name||`${p.first_name||''} ${p.last_name||''}`.trim()||u.user_metadata?.full_name||u.email?.split('@')[0]||'Membre KŌMØ';
}
function initials(){const parts=profileName().split(/\s+/).filter(Boolean);return(parts.length>1?`${parts[0][0]}${parts.at(-1)[0]}`:parts[0]?.slice(0,2)||'KØ').toUpperCase()}
function roleTitle(){return state.role?.display_title||'Membre KŌMØ'}
function isFounder(){return ['founder','ceo','owner'].includes(String(state.role?.role_key||'').toLowerCase())||/founder|ceo/i.test(roleTitle())}
function fmtDate(value){if(!value)return'—';const d=new Date(value);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d)}
function fmtShortDate(value){if(!value)return'—';const d=new Date(value);if(Number.isNaN(d.getTime()))return'—';return `${pad(d.getDate())} ${new Intl.DateTimeFormat('fr-FR',{month:'short'}).format(d).replace('.','').toUpperCase()}`}
function fmtTime(value){if(!value)return'';const d=new Date(value);if(Number.isNaN(d.getTime()))return'';return new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(d)}
function fmtSleep(minutes){const n=num(minutes);if(n===null)return'—';const h=Math.floor(n/60),m=Math.round(n%60);return `${h}h ${pad(m)}`}
function appointmentLabel(type=''){return({motion:'Bilan KŌMØ Motion',clinical:'Bilan KŌMØ Clinical',follow_up:'Suivi KŌMØ',discovery:'Découverte KŌMØ'})[type]||'Consultation KŌMØ'}
function currentScore(){return state.scores[0]||null}
function previousScore(){return state.scores[1]||null}
function scoreDelta(){const a=num(currentScore()?.motion_score),b=num(previousScore()?.motion_score);if(a===null||b===null)return null;return a-b}
function nextAppointment(){return state.appointment||null}
function currentPriority(){return state.priorities?.[0]||null}
function assessmentDone(){return Boolean(state.assessment)}
function resultReady(){return num(currentScore()?.motion_score)!==null}
function trajectoryModel(){
 const assessment=state.assessment,score=currentScore(),priority=currentPriority(),appt=nextAppointment();
 const ready=resultReady(),hasAssessment=assessmentDone();
 const priorityText=priority?.patient_wording||priority?.category||'Consolider votre mobilité entre deux bilans';
 const nextDate=appt?.scheduled_start;
 let phase='POINT DE DÉPART',headline='Construisons votre trajectoire KŌMØ.',now='Préparer votre première référence',week='Compléter les éléments nécessaires au bilan',cta='Préparer ma trajectoire';
 if(hasAssessment&&!ready){phase='ANALYSE EN COURS';headline='Votre bilan est en cours de lecture.';now='Votre référence est en cours de consolidation';week='Gardez vos habitudes stables pour faciliter l’interprétation';cta='Voir ma trajectoire'}
 if(ready){phase='TRAJECTOIRE ACTIVE';headline='Votre consultation continue ici.';now=priorityText;week=priority?.category?'Mettre en pratique votre priorité : '+priority.category:'Suivre votre plan et observer ce qui change';cta='Continuer ma trajectoire'}
 const checkpoint=nextDate?appointmentLabel(appt.appointment_type)+' · '+fmtShortDate(nextDate)+(fmtTime(nextDate)?' · '+fmtTime(nextDate):''):'Prochain point à planifier';
 const scoreText=ready?'Motion Score '+Math.round(num(score.motion_score))+'/100':'Référence à construire';
 return {phase,headline,now,week,checkpoint,cta,scoreText,hasAssessment,ready,hasPlan:Boolean(priority),hasAppointment:Boolean(appt)};
}
function trajectorySteps(m){
 const steps=[
   {label:'Bilan',state:m.hasAssessment?'done':'current'},
   {label:'Lecture',state:m.ready?'done':m.hasAssessment?'current':'upcoming'},
   {label:'Plan',state:m.hasPlan?'done':m.ready?'current':'upcoming'},
   {label:'Suivi',state:m.hasAppointment?'current':'upcoming'}
 ];
 return steps.map((s,i)=>'<span class="kh8-traj-step '+s.state+'"><i>'+(s.state==='done'?'✓':i+1)+'</i><b>'+s.label+'</b></span>').join('');
}

function avatarMarkup(){
 if(state.avatarUrl)return `<img src="${esc(state.avatarUrl)}" alt="Photo de profil KŌMØ">`;
 const cfg=state.profile?.avatar_config||{};
 return window.KomoAvatar?.render?.(cfg,{label:'Avatar KŌMØ'})||esc(initials());
}
function heroPhotoMarkup(){
 const src=state.avatarUrl||'./pulse-home-photo.webp';
 return `<img src="${esc(src)}" alt="Votre espace KŌMØ" loading="eager" decoding="async">`;
}
function roleMarkup(){return `${isFounder()?'<span class="kh8-crown" aria-hidden="true">♛</span>':''}<span>${esc(roleTitle())}</span>`}
function scoreChangeMarkup(){const d=scoreDelta();if(d===null)return'Votre dernier bilan apparaîtra ici';const sign=d>0?'+':'';return `${sign}${d.toFixed(1).replace('.',',')} depuis le bilan précédent`}
function clubLabel(){const n=state.memberships.length;return n?`${n} Club${n>1?'s':''} actif${n>1?'s':''}`:'Accès Club'}
function orgLabel(){const o=state.organization||{};return [o.name,o.city].filter(Boolean).join(' · ')||'KŌMØ'}

function homeMarkup(){
 const s=currentScore(),w=state.wearable||{},appt=nextAppointment(),e=state.engagement||{},wallet=state.wallet||{};
 const score=num(s?.motion_score),scoreDate=s?.released_at||s?.calculated_at;
 const level=fmt(e.level||1),points=fmt(wallet.available_kp??e.points??0),xp=fmt(e.xp_total??e.xp??e.experience??e.total_xp??0);
 const appointmentDate=appt?.scheduled_start;
 const traj=trajectoryModel();
 return `<section class="kh9" data-khome-v9 aria-label="KŌMØ Pulse Home">
   <header class="kh9-intro">
     <div class="kh9-brand"><span>KŌMØ</span><small>PULSE</small></div>
     <div class="kh9-welcome">
       <p class="kh9-kicker">BIENVENUE SUR KŌMØ PULSE</p>
       <h1>Votre santé. Vos résultats.<br><em>Votre trajectoire.</em></h1>
       <p>Retrouvez ici vos résultats KŌMØ, votre trajectoire personnalisée et votre accès à KŌMØ World.</p>
       <div class="kh9-intro-actions">
         <button type="button" data-kh8-route="results">Voir mes résultats</button>
         <button type="button" data-kh8-route="path">Voir ma trajectoire</button>
         <button type="button" data-kh8-world>Entrer dans World ↗</button>
       </div>
     </div>
   </header>

   <section class="kh9-primary">
     <article class="kh9-photo-card">
       <div class="kh9-photo">${heroPhotoMarkup()}</div>
       <div class="kh9-photo-overlay">
         <small>VOTRE ESPACE KŌMØ</small>
         <strong>${esc(profileName())}</strong>
         <span>${esc(roleTitle())}</span>
       </div>
     </article>

     <article class="kh9-appointment" data-kh8-route="documents" role="button" tabindex="0">
       <div class="kh9-card-label">PROCHAIN RENDEZ-VOUS</div>
       <div class="kh9-appt-date">${appt?esc(fmtShortDate(appointmentDate)):'À PLANIFIER'}</div>
       <h2>${appt?esc(appointmentLabel(appt.appointment_type)):'Votre prochain point KŌMØ'}</h2>
       <p>${appt?esc(orgLabel()):'Planifiez votre prochain bilan ou votre consultation depuis Pulse.'}</p>
       <div class="kh9-appt-meta">
         <span>${appt&&appointmentDate?esc(fmtTime(appointmentDate)):'Agenda KŌMØ'}</span>
         <b>Ouvrir les rendez-vous →</b>
       </div>
     </article>
   </section>

   <section class="kh9-results">
     <article class="kh9-result-main" data-kh8-route="results" role="button" tabindex="0">
       <div><small>MOTION SCORE</small><strong>${score===null?'—':Math.round(score)}<em>/100</em></strong></div>
       <p>${scoreDate?'Dernier bilan · '+esc(fmtDate(scoreDate)):'Votre prochain résultat apparaîtra ici.'}</p>
     </article>
     <article class="kh9-result-card" data-kh8-route="path" role="button" tabindex="0">
       <small>TRAJECTOIRE</small>
       <strong>${esc(traj.phase)}</strong>
       <p>${esc(traj.now)}</p>
     </article>
     <article class="kh9-result-card" data-kh8-route="key" role="button" tabindex="0">
       <small>CONNECTED</small>
       <strong>${fmt(w.steps)} pas</strong>
       <p>${fmtSleep(w.sleep_minutes)} sommeil · ${num(w.resting_hr)===null?'—':Math.round(num(w.resting_hr))+' bpm'} repos</p>
     </article>
     <article class="kh9-result-card" data-kh8-route="mykomo" role="button" tabindex="0">
       <small>MY KŌMØ</small>
       <strong>${level} · Niveau</strong>
       <p>${points} K Points · ${esc(clubLabel())}</p>
     </article>
   </section>

   <section class="kh9-bottom">
     <button class="kh9-world" type="button" data-kh8-world>
       <span><small>KŌMØ WORLD</small><strong>Votre univers de santé, de mouvement et de progression.</strong></span>
       <b>Entrer dans World ↗</b>
     </button>
     <article class="kh9-xp" data-kh8-route="mykomo" role="button" tabindex="0">
       <div>
         <small>EXPÉRIENCE</small>
         <strong>${xp}</strong>
         <span>XP · Niveau ${level}</span>
       </div>
       <div class="kh9-xp-track"><i style="width:${Math.min(100,Math.max(12,(Number(e.level_pct??e.level_progress??e.progress??42)||42)))}%"></i></div>
       <p>Votre activité KŌMØ, vos défis et votre progression dans World alimentent votre expérience.</p>
     </article>
   </section>
 </section>`;
}

function tuneChrome(){
 const home=route()==='home';
 document.body.classList.toggle('khome-final-v1',home);
 document.body.classList.toggle('khome-direction-v9',home);
 document.body.classList.remove('khome-direction-v8','khome-direction-v7');
 if(!home)return;
 const eyebrow=document.querySelector('#pageEyebrow');
 const title=document.querySelector('#pageTitle');
 if(eyebrow)eyebrow.textContent='';
 if(title)title.textContent='';
}

async function signedAvatar(c,profile){
 const path=String(profile?.avatar_path||'').replace(/^profile-avatars\//,'').replace(/^\/+/, '');
 if(!path)return'';
 if(/^https?:\/\//i.test(path))return path;
 try{const r=await c.storage.from('profile-avatars').createSignedUrl(path,3600);return r.data?.signedUrl||''}catch{return''}
}

async function load(force=false){
 if(route()!=='home'||state.loading)return;
 const c=client();if(!c)return;
 const {data:{session}}=await c.auth.getSession();if(!session?.user)return;
 if(!force&&state.loadedFor===session.user.id&&Date.now()-state.lastLoad<180000){render();return}
 state.loading=true;state.user=session.user;
 try{
   const [profile,role,engagement,wallet,memberships,wearables,patient]=await Promise.all([
     safe(c.from('profiles').select('display_name,first_name,last_name,avatar_path,avatar_config').eq('id',session.user.id).maybeSingle()),
     safe(c.rpc('komo_my_community_identity_v1')),
     safe(c.rpc('komo_engagement_summary')),
     safe(c.rpc('komo_wallet_summary')),
     safe(c.from('komo_club_members').select('club_id,role').eq('user_id',session.user.id)),
     safe(c.from('wearable_daily_metrics').select('metric_date,steps,sleep_minutes,resting_hr,source,source_quality').eq('user_id',session.user.id).order('metric_date',{ascending:false}).limit(14)),
     safe(c.from('patients').select('id').eq('patient_user_id',session.user.id).order('updated_at',{ascending:false}).limit(1).maybeSingle())
   ]);
   state.profile=profile||{};state.role=role||{};state.engagement=engagement||{};state.wallet=wallet||{};state.memberships=Array.isArray(memberships)?memberships:[];state.wearables=Array.isArray(wearables)?wearables:[];state.wearable=state.wearables[0]||null;state.patient=patient||null;state.assessment=null;state.priorities=[];state.report=null;
   state.avatarUrl=await signedAvatar(c,state.profile);
   if(patient?.id){
     const [assessments,appointments]=await Promise.all([
       safe(c.from('assessments').select('id,status,completed_at,created_at,product_mode,assessment_type').eq('patient_id',patient.id).order('created_at',{ascending:false}).limit(12)),
       safe(c.from('organization_appointments').select('id,organization_id,appointment_type,scheduled_start,status,service_code').eq('patient_id',patient.id).gte('scheduled_start',new Date().toISOString()).order('scheduled_start',{ascending:true}).limit(8))
     ]);
     const assessmentRows=Array.isArray(assessments)?assessments:[];
     state.assessment=assessmentRows.find(x=>x.product_mode==='motion')||assessmentRows[0]||null;
     const ids=assessmentRows.map(x=>x.id).filter(Boolean);
     if(ids.length){
       const [scores,priorities,report]=await Promise.all([
         safe(c.from('scores').select('assessment_id,motion_score,calculated_at,released_at,release_status,status').in('assessment_id',ids).eq('release_status','released').order('calculated_at',{ascending:false}).limit(2)),
         state.assessment?.id?safe(c.from('priorities').select('rank,category,patient_wording').eq('assessment_id',state.assessment.id).order('rank',{ascending:true}).limit(3)):Promise.resolve([]),
         state.assessment?.id?safe(c.from('komo_reports').select('payload,released_at,status').eq('assessment_id',state.assessment.id).eq('status','released').order('version',{ascending:false}).limit(1).maybeSingle()):Promise.resolve(null)
       ]);
       state.scores=Array.isArray(scores)?scores:[];
       state.priorities=Array.isArray(priorities)?priorities:[];state.report=report||null;
     }else{state.scores=[];state.priorities=[];state.report=null};
     const allowed=(Array.isArray(appointments)?appointments:[]).filter(x=>!['cancelled','completed','no_show'].includes(String(x.status||'').toLowerCase()));
     state.appointments=allowed;state.appointment=allowed[0]||null;
     if(state.appointment?.organization_id){
       state.organization=await safe(c.from('organizations').select('name,city').eq('id',state.appointment.organization_id).maybeSingle());
     }else state.organization=null;
   }else{state.assessment=null;state.priorities=[];state.scores=[];state.report=null;state.appointments=[];state.appointment=null;state.organization=null}
   state.loadedFor=session.user.id;state.lastLoad=Date.now();render();
 }catch(error){console.warn('[patient-home-command-v9]',error)}finally{state.loading=false}
}

function render(){
 if(route()!=='home')return;
 const host=document.querySelector('[data-my-komo-home]');
 if(!host)return;
 tuneChrome();
 host.innerHTML=homeMarkup();
 host.dataset.khomeOwner='patient-home-command-v1@9.2';
 requestAnimationFrame(()=>window.KomoAssistantV2?.refresh?.());
 window.dispatchEvent(new CustomEvent('komo:home-command-rendered',{detail:{version:VERSION,cockpit:true}}));
}

function schedule(ms=0,force=false){clearTimeout(timer);timer=setTimeout(()=>{render();load(force)},ms)}

function go(target){if(!target)return;if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go(target);else location.hash=target}
document.addEventListener('click',event=>{
 const world=event.target.closest?.('[data-kh8-world]');
 if(world){event.preventDefault();window.location.href='https://komolongevity.com/world/';return}
 const link=event.target.closest?.('[data-kh8-route]');if(!link)return;
 const target=link.getAttribute('data-kh8-route');if(!target)return;
 event.preventDefault();go(target);
},true);
document.addEventListener('keydown',event=>{if(!['Enter',' '].includes(event.key))return;const el=event.target.closest?.('[data-kh8-route][role="button"]');if(!el)return;event.preventDefault();go(el.getAttribute('data-kh8-route'))});

['hashchange','pageshow','komo:route-ready','komo:canonical-route'].forEach(name=>window.addEventListener(name,()=>{tuneChrome();schedule(20,false)}));
window.addEventListener('komo:session-ready',()=>schedule(20,true));
window.addEventListener('komo:profile-identity-updated',()=>schedule(20,true));
window.addEventListener('komo:appointment-updated',()=>schedule(20,true));

function boot(){tuneChrome();schedule(0,false)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.KomoPatientHomeCommand={version:VERSION,refresh:()=>schedule(0,true)};
