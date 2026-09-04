import './komo-assistant-shell-v2.js';
import './patient-mobile-v1.js';

const VERSION='8.0.0-cockpit';
let timer=0;
const state={user:null,profile:null,role:null,engagement:null,wallet:null,memberships:[],patient:null,scores:[],wearable:null,appointment:null,organization:null,avatarUrl:'',loadedFor:null,lastLoad:0,loading:false};

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

function avatarMarkup(){
 if(state.avatarUrl)return `<img src="${esc(state.avatarUrl)}" alt="Photo de profil KŌMØ">`;
 const cfg=state.profile?.avatar_config||{};
 return window.KomoAvatar?.render?.(cfg,{label:'Avatar KŌMØ'})||esc(initials());
}
function roleMarkup(){return `${isFounder()?'<span class="kh8-crown" aria-hidden="true">♛</span>':''}<span>${esc(roleTitle())}</span>`}
function scoreChangeMarkup(){const d=scoreDelta();if(d===null)return'Votre dernier bilan apparaîtra ici';const sign=d>0?'+':'';return `${sign}${d.toFixed(1).replace('.',',')} depuis le bilan précédent`}
function clubLabel(){const n=state.memberships.length;return n?`${n} Club${n>1?'s':''} actif${n>1?'s':''}`:'Accès Club'}
function orgLabel(){const o=state.organization||{};return [o.name,o.city].filter(Boolean).join(' · ')||'KŌMØ'}

function homeMarkup(){
 const s=currentScore(),w=state.wearable||{},appt=nextAppointment(),e=state.engagement||{},wallet=state.wallet||{};
 const score=num(s?.motion_score),scoreDate=s?.released_at||s?.calculated_at;
 const level=fmt(e.level||1),points=fmt(wallet.available_kp??e.points??0);
 const appointmentDate=appt?.scheduled_start;
 return `<section class="kh8" data-khome-v8 data-khome-v7 aria-label="KŌMØ Pulse Home">
   <div class="kh8-brand"><span>KŌMØ</span><small>PULSE</small></div>

   <div class="kh8-top">
    <div class="kh8-hero">
      <p class="kh8-kicker">LONGEVITY IN MOTION</p>
      <h2>Votre KŌMØ.<br><em>Simplement.</em></h2>
      <p class="kh8-lead">Vos résultats, votre quotidien connecté, vos consultations et votre espace personnel dans une seule interface.</p>
      <button class="kh8-continue" type="button" data-kh8-route="results"><span>Continuer votre parcours</span><b aria-hidden="true">→</b></button>
    </div>

    <div class="kh8-side">
      <article class="kh8-profile" data-kh8-route="mykomo" role="button" tabindex="0" aria-label="Ouvrir My KŌMØ">
        <div class="kh8-avatar">${avatarMarkup()}</div>
        <div class="kh8-profile-copy"><small>MY KŌMØ</small><strong>${esc(profileName())}</strong><div class="kh8-role">${roleMarkup()}</div></div>
        <div class="kh8-profile-arrow" aria-hidden="true">→</div>
        <div class="kh8-profile-stats"><span><b>${level}</b><small>Niveau</small></span><span><b>${points}</b><small>K Points</small></span><span><b>${esc(clubLabel())}</b><small>Club</small></span></div>
      </article>
      <article class="kh8-next" data-kh8-route="documents" role="button" tabindex="0" aria-label="Ouvrir mes consultations">
        <div><small>PROCHAIN RENDEZ-VOUS</small><strong>${appt?esc(appointmentLabel(appt.appointment_type)):'Aucun rendez-vous planifié'}</strong><p>${appt?`${esc(orgLabel())}${appointmentDate?` · ${esc(fmtTime(appointmentDate))}`:''}`:'Planifiez votre prochaine étape depuis Consultations.'}</p></div>
        <div class="kh8-next-date"><b>${appt?esc(fmtShortDate(appointmentDate)):'—'}</b><span aria-hidden="true">→</span></div>
      </article>
    </div>
   </div>

   <nav class="kh8-grid" aria-label="Accès rapides KŌMØ Pulse">
    <a href="#results" data-kh8-route="results" class="kh8-card">
      <div class="kh8-card-head"><span>01</span><b aria-hidden="true">→</b></div><h3>Résultats</h3><p>Vos scores et leur évolution</p>
      <div class="kh8-result-mini"><strong>${score===null?'—':Math.round(score)}</strong><span>Motion Score</span><i>${esc(scoreChangeMarkup())}</i></div>
      <small>${scoreDate?`Dernier bilan · ${esc(fmtDate(scoreDate))}`:'Aucun bilan publié'}</small>
    </a>
    <a href="#key" data-kh8-route="key" class="kh8-card">
      <div class="kh8-card-head"><span>02</span><b aria-hidden="true">→</b></div><h3>Connected</h3><p>Votre quotidien, votre récupération</p>
      <div class="kh8-connected-mini"><span><b>${fmt(w.steps)}</b><small>pas</small></span><span><b>${fmtSleep(w.sleep_minutes)}</b><small>sommeil</small></span><span><b>${num(w.resting_hr)===null?'—':`${Math.round(num(w.resting_hr))} bpm`}</b><small>repos</small></span></div>
      <small>${w.metric_date?`Synchronisé · ${esc(fmtDate(w.metric_date))}`:'Aucune donnée Connected aujourd’hui'}</small>
    </a>
    <a href="#documents" data-kh8-route="documents" class="kh8-card">
      <div class="kh8-card-head"><span>03</span><b aria-hidden="true">→</b></div><h3>Consultations</h3><p>Votre suivi et vos rendez-vous</p>
      <div class="kh8-appointment-mini"><b>${appt?esc(fmtShortDate(appointmentDate)):'—'}</b><span>${appt?esc(appointmentLabel(appt.appointment_type)):'Aucun rendez-vous à venir'}</span><small>${appt?esc(orgLabel()):'Votre agenda KŌMØ'}</small></div>
      <small>Voir tous mes rendez-vous</small>
    </a>
    <a href="#mykomo" data-kh8-route="mykomo" class="kh8-card">
      <div class="kh8-card-head"><span>04</span><b aria-hidden="true">→</b></div><h3>My KŌMØ</h3><p>Votre profil, Club et communauté</p>
      <div class="kh8-community-mini"><span class="kh8-mini-avatar">${avatarMarkup()}</span><div><b>${esc(roleTitle())}</b><small>${esc(clubLabel())}</small></div></div>
      <small>Profil social · réglages · Club</small>
    </a>
   </nav>

   <button class="kh8-club" type="button" data-kh8-route="club"><span><small>KŌMØ CLUB</small><strong>Une communauté qui avance ensemble.</strong><em>Défis · événements · contenus · récompenses</em></span><b>Accéder au Club →</b></button>
   <p class="kh8-foot">Measure → Understand → Act → Live</p>
  </section>`;
}

function tuneChrome(){
 const home=route()==='home';
 document.body.classList.toggle('khome-final-v1',home);
 document.body.classList.toggle('khome-direction-v8',home);
 document.body.classList.remove('khome-direction-v7');
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
   const [profile,role,engagement,wallet,memberships,wearable,patient]=await Promise.all([
     safe(c.from('profiles').select('display_name,first_name,last_name,avatar_path,avatar_config').eq('id',session.user.id).maybeSingle()),
     safe(c.rpc('komo_my_community_identity_v1')),
     safe(c.rpc('komo_engagement_summary')),
     safe(c.rpc('komo_wallet_summary')),
     safe(c.from('komo_club_members').select('club_id,role').eq('user_id',session.user.id)),
     safe(c.from('wearable_daily_metrics').select('metric_date,steps,sleep_minutes,resting_hr,source,source_quality').eq('user_id',session.user.id).order('metric_date',{ascending:false}).limit(1).maybeSingle()),
     safe(c.from('patients').select('id').eq('patient_user_id',session.user.id).order('updated_at',{ascending:false}).limit(1).maybeSingle())
   ]);
   state.profile=profile||{};state.role=role||{};state.engagement=engagement||{};state.wallet=wallet||{};state.memberships=Array.isArray(memberships)?memberships:[];state.wearable=wearable||null;state.patient=patient||null;
   state.avatarUrl=await signedAvatar(c,state.profile);
   if(patient?.id){
     const [assessments,appointments]=await Promise.all([
       safe(c.from('assessments').select('id').eq('patient_id',patient.id).order('created_at',{ascending:false}).limit(12)),
       safe(c.from('organization_appointments').select('id,organization_id,appointment_type,scheduled_start,status,service_code').eq('patient_id',patient.id).gte('scheduled_start',new Date().toISOString()).order('scheduled_start',{ascending:true}).limit(8))
     ]);
     const ids=(Array.isArray(assessments)?assessments:[]).map(x=>x.id).filter(Boolean);
     if(ids.length){
       const scores=await safe(c.from('scores').select('assessment_id,motion_score,calculated_at,released_at,release_status,status').in('assessment_id',ids).eq('release_status','released').order('calculated_at',{ascending:false}).limit(2));
       state.scores=Array.isArray(scores)?scores:[];
     }else state.scores=[];
     const allowed=(Array.isArray(appointments)?appointments:[]).filter(x=>!['cancelled','completed','no_show'].includes(String(x.status||'').toLowerCase()));
     state.appointment=allowed[0]||null;
     if(state.appointment?.organization_id){
       state.organization=await safe(c.from('organizations').select('name,city').eq('id',state.appointment.organization_id).maybeSingle());
     }else state.organization=null;
   }else{state.scores=[];state.appointment=null;state.organization=null}
   state.loadedFor=session.user.id;state.lastLoad=Date.now();render();
 }catch(error){console.warn('[patient-home-command-v8]',error)}finally{state.loading=false}
}

function render(){
 if(route()!=='home')return;
 const host=document.querySelector('[data-my-komo-home]');
 if(!host)return;
 tuneChrome();
 host.innerHTML=homeMarkup();
 host.dataset.khomeOwner='patient-home-command-v1@8';
 requestAnimationFrame(()=>window.KomoAssistantV2?.refresh?.());
 window.dispatchEvent(new CustomEvent('komo:home-command-rendered',{detail:{version:VERSION,cockpit:true}}));
}

function schedule(ms=0,force=false){clearTimeout(timer);timer=setTimeout(()=>{render();load(force)},ms)}

function go(target){if(!target)return;if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go(target);else location.hash=target}
document.addEventListener('click',event=>{
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
