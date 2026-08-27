import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const S={client:null,user:null,profile:null,free:null,patients:[],motion:null,clinical:null,next:null,centers:[],avatarUrl:'',engagement:null,loading:false,busy:false,lastLoad:0};

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(S.client||(S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function route(){return location.hash.replace(/^#/,'')||'home'}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function initials(name=''){const p=String(name).trim().split(/\s+/).filter(Boolean);return(p.length>1?`${p[0][0]}${p[p.length-1][0]}`:p[0]?.slice(0,2)||'K').toUpperCase()}
function name(){const p=S.profile||{},full=`${p.first_name||''} ${p.last_name||''}`.trim();return full||p.display_name?.trim()||S.user?.email?.split('@')[0]||'My KŌMØ'}
function fmtDateTime(v){if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return'';return new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(d).replace('.','')}
function freeResult(a){if(!a)return null;const r=a.responses||{},qObj=r?.baseline?.questionnaire||{};let q=n(qObj.mobility_score_0_100);if(q===null){const d=n(qObj.difficulty_total);if(d!==null)q=Math.max(0,100-d)}const completed=!!(r?.baseline?.completed_at&&r?.chair_stand?.completed_at&&r?.two_step?.completed_at);return completed?{q,completed:true}:null}
function profilePct(){const p=S.profile||{},req=['first_name','last_name','birth_date','sex_at_birth'],done=req.filter(k=>p[k]).length;return Math.round(done/req.length*100)}
function centerName(id){return S.centers.find(x=>x.id===id)?.name||'Centre KŌMØ'}
function service(v){return v==='clinical'?'KŌMØ Clinical':'KŌMØ Motion'}
function notify(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.hidden=true,2800)}

async function signedAvatar(path){if(!path)return'';try{const r=await sb().storage.from('profile-avatars').createSignedUrl(path,3600);return r.data?.signedUrl||''}catch{return''}}

async function load(force=false){
  if(S.loading||(!force&&S.user&&Date.now()-S.lastLoad<10000))return;
  S.loading=true;
  try{
    const c=sb(),runtime=window.KomoRuntime?.getContext?.(),session=runtime?.session||(await c.auth.getSession()).data?.session;if(!session?.user)return;S.user=session.user;
    const [pr,fr,ps,eg]=await Promise.all([
      c.from('profiles').select('display_name,first_name,last_name,city,country,birth_date,sex_at_birth,avatar_path').eq('id',session.user.id).maybeSingle(),
      c.from('pulse_assessments').select('id,responses,status,completed_at,updated_at').eq('user_id',session.user.id).eq('protocol_version','mobility-check-v1').order('updated_at',{ascending:false}).limit(1).maybeSingle(),
      c.from('patients').select('id,organization_id').eq('patient_user_id',session.user.id).order('created_at',{ascending:false}),
      c.rpc('komo_engagement_summary')
    ]);
    S.profile=pr.data||null;S.free=freeResult(fr.data||null);S.patients=ps.data||[];S.engagement=eg.error?S.engagement:(eg.data||null);S.motion=null;S.clinical=null;S.next=null;S.centers=[];
    S.avatarUrl=await signedAvatar(S.profile?.avatar_path);
    const ids=S.patients.map(x=>x.id);
    if(ids.length){
      const [ar,ap,cr]=await Promise.all([
        c.from('assessments').select('id,patient_id,product_mode,status,created_at').in('patient_id',ids).order('created_at',{ascending:false}).limit(60),
        c.from('organization_appointments').select('id,organization_id,patient_id,appointment_type,scheduled_start,status').in('patient_id',ids).order('scheduled_start',{ascending:true}),
        c.rpc('komo_booking_centers')
      ]);
      S.centers=cr.data||[];
      const assessments=ar.data||[],motionA=assessments.find(x=>x.product_mode==='motion'),clinicalA=assessments.find(x=>x.product_mode==='clinical'),scoreIds=[motionA?.id,clinicalA?.id].filter(Boolean);
      if(scoreIds.length){const sr=await c.from('scores').select('assessment_id,motion_score,domain_scores,release_status,status,calculated_at').in('assessment_id',scoreIds).order('calculated_at',{ascending:false});const scores=sr.data||[];S.motion={assessment:motionA,score:scores.find(x=>x.assessment_id===motionA?.id)||null};S.clinical={assessment:clinicalA,score:scores.find(x=>x.assessment_id===clinicalA?.id)||null}}
      else{S.motion=motionA?{assessment:motionA,score:null}:null;S.clinical=clinicalA?{assessment:clinicalA,score:null}:null}
      S.next=(ap.data||[]).find(x=>new Date(x.scheduled_start)>new Date()&&!['cancelled','completed','no_show'].includes(x.status))||null;
    }
    S.lastLoad=Date.now();
  }catch(e){console.error('[my-komo-home-v1]',e)}finally{S.loading=false}
}

function ring(label,value,sub){const v=n(value),pct=v===null?0:Math.max(0,Math.min(100,v));return`<div class="mykomo-ring-item"><div class="mykomo-ring" style="--value:${pct}"><div><strong>${v===null?'—':Math.round(v)}${v===null?'':'<small>/100</small>'}</strong><span>${esc(label)}</span></div></div><strong>${esc(label)}</strong><small>${esc(sub)}</small></div>`}
function milestoneItems(){const p=profilePct();return[['Profil',p===100],['Photo',!!S.profile?.avatar_path],['KŌMØ Start',!!S.free],['Rendez-vous',!!S.next],['Motion',n(S.motion?.score?.motion_score)!==null],['Clinical',!!S.clinical&&['validated','released','completed'].includes(S.clinical.assessment?.status)]]}
function engagement(){return S.engagement||{steps:0,step_xp:0,xp_total:0,xp_today:0,level:1,level_pct:0,xp_to_next_level:500,streak_days:0,points:0,challenges:[]}}
function nextAppointment(){if(!S.next)return`<div class="mykomo-next"><span>PROCHAIN RENDEZ-VOUS</span><strong>Aucun rendez-vous planifié</strong><small>Réservez votre prochaine étape Motion ou Clinical depuis Pulse.</small><button type="button" data-route="documents">Planifier un rendez-vous →</button></div>`;return`<div class="mykomo-next"><span>PROCHAIN RENDEZ-VOUS</span><strong>${esc(service(S.next.appointment_type))}</strong><small>${esc(fmtDateTime(S.next.scheduled_start))} · ${esc(centerName(S.next.organization_id))}</small><button type="button" data-route="documents">Voir mon rendez-vous →</button></div>`}
function nextStepMilestone(steps){const levels=[[3000,20],[5000,40],[7500,70],[10000,100],[12500,120]],next=levels.find(x=>steps<x[0]);return next?`${next[0].toLocaleString('fr-FR')} pas · ${next[1]} XP`:'Palier maximal du jour atteint'}
function challengeCard(c){const target=c.target_value?`${c.target_value} ${c.unit||''}`:'';return`<article class="mykomo-challenge ${c.completed?'done':''}"><div class="mykomo-challenge-top"><span>${esc(c.category||'défi')}</span><b>+${Number(c.xp_reward)||0} XP</b></div><h4>${esc(c.title)}</h4><p>${esc(c.description)}</p><div class="mykomo-challenge-foot"><small>${esc(target)}</small><button type="button" data-keng-challenge="${esc(c.slug)}" ${c.completed||S.busy?'disabled':''}>${c.completed?'Accompli ✓':'Valider'}</button></div>${c.safety_copy?`<details><summary>Adapter le défi</summary><small>${esc(c.safety_copy)}</small></details>`:''}</article>`}
function engagementPanel(){const e=engagement(),steps=Math.max(0,Number(e.steps)||0),goalPct=Math.min(100,Math.round(steps/10000*100)),pointPct=Math.min(100,(Number(e.xp_total)||0)%1000/10),ch=Array.isArray(e.challenges)?e.challenges:[];return`<article class="mykomo-engagement" id="komoEngagement"><div class="mykomo-engagement-head"><div><small>AUJOURD’HUI</small><h3>Construisez votre progression.</h3><p>L’XP récompense surtout la régularité. Les pas sont plafonnés à 120 XP/jour et les défis sont limités à la sélection quotidienne.</p></div><div class="mykomo-today-xp"><strong>+${Number(e.xp_today)||0}</strong><span>XP aujourd’hui</span></div></div><div class="mykomo-engagement-grid"><section class="mykomo-steps"><div class="mykomo-mini-head"><span>MES PAS</span><b>+${Number(e.step_xp)||0} XP</b></div><div class="mykomo-step-number"><strong>${steps.toLocaleString('fr-FR')}</strong><span>/ 10 000</span></div><div class="mykomo-step-track" style="--steps:${goalPct}%"><i></i></div><small>Prochain palier : ${esc(nextStepMilestone(steps))}</small><div class="mykomo-step-input"><input id="myKomoSteps" inputmode="numeric" type="number" min="0" max="100000" step="100" value="${steps}" aria-label="Nombre de pas aujourd'hui"><button type="button" data-keng-save ${S.busy?'disabled':''}>Enregistrer</button></div><p>Saisie manuelle pour le POC. Apple Health, Health Connect et wearables pourront remplacer cette saisie ensuite.</p></section><section class="mykomo-daily"><div class="mykomo-mini-head"><span>DÉFIS DU JOUR</span><b>${ch.filter(x=>x.completed).length}/${ch.length}</b></div><div class="mykomo-challenges">${ch.length?ch.map(challengeCard).join(''):'<div class="mykomo-challenge-empty">Les défis du jour se chargent…</div>'}</div></section><aside class="mykomo-points"><div class="mykomo-mini-head"><span>KŌMØ POINTS</span><b>Bêta</b></div><strong>${Number(e.points)||0}<small> KP</small></strong><p>Chaque tranche de 1 000 XP débloque actuellement 50 KŌMØ Points.</p><div class="mykomo-point-track" style="--points:${pointPct}%"><i></i></div><small>${(Number(e.xp_total)||0)%1000} / 1 000 XP vers la prochaine conversion</small><div class="mykomo-streak"><span>🔥 ${Number(e.streak_days)||0} jour${Number(e.streak_days)===1?'':'s'} de série</span><span>Boutique bientôt</span></div><p class="mykomo-points-note">Les KŌMØ Points sont pour l’instant un solde de fidélité non échangeable. Les règles de dépense seront activées avec la boutique.</p></aside></div></article>`}

function render(){
  if(route()!=='home')return;
  const root=document.querySelector('#viewRoot');if(!root)return;
  let host=root.querySelector('[data-my-komo-home]');if(!host){host=document.createElement('section');host.className='mykomo-home';host.dataset.myKomoHome='1';root.prepend(host)}
  const q=S.free?.q??null,motion=n(S.motion?.score?.motion_score),clinical=null,e=engagement(),items=milestoneItems(),nm=name(),loc=[S.profile?.city,S.profile?.country].filter(Boolean).join(' · ')||'Profil KŌMØ';
  const html=`<article class="mykomo-card"><div class="mykomo-top"><div class="mykomo-identity"><div class="mykomo-avatar">${S.avatarUrl?`<img src="${esc(S.avatarUrl)}" alt="Photo de profil">`:esc(initials(nm))}</div><div><small>MY KŌMØ</small><h2>${esc(nm)}</h2><p>${esc(loc)} · Profil ${profilePct()}% complété</p></div></div><button type="button" class="mykomo-profile-btn" data-route="profile">Personnaliser mon profil →</button></div><div class="mykomo-grid"><section class="mykomo-score-card"><div class="mykomo-section-label"><span>MES REPÈRES</span><button type="button" data-route="results">Voir le détail →</button></div><div class="mykomo-rings">${ring('Start',q,q===null?'Questionnaire à compléter':'Questionnaire mobilité')}${ring('Motion',motion,motion===null?'En attente de mesure':'Motion Score')}${ring('Clinical',clinical,'En attente de validation')}</div></section><aside class="mykomo-side">${nextAppointment()}<div class="mykomo-xp"><div class="mykomo-xp-head"><span>PROGRESSION KŌMØ</span><strong>Niveau ${Number(e.level)||1}</strong></div><div class="mykomo-xp-track" style="--xp:${Number(e.level_pct)||0}%"><i></i></div><div class="mykomo-xp-foot"><span>${Number(e.xp_total)||0} XP</span><span>${Number(e.xp_to_next_level)||500} XP avant le niveau suivant</span></div><div class="mykomo-achievements">${items.map(([label,done])=>`<span class="${done?'done':''}">${esc(label)}</span>`).join('')}</div><button type="button" class="mykomo-xp-open" data-keng-jump>Défis & XP →</button></div></aside></div></article>${engagementPanel()}`;
  if(host.dataset.signature===html)return;host.dataset.signature=html;host.innerHTML=html;bindEngagement(host);
}

function bindEngagement(host){
  host.querySelector('[data-keng-jump]')?.addEventListener('click',()=>document.querySelector('#komoEngagement')?.scrollIntoView({behavior:'smooth',block:'start'}));
  host.querySelector('[data-keng-save]')?.addEventListener('click',saveSteps);
  host.querySelectorAll('[data-keng-challenge]').forEach(b=>b.addEventListener('click',()=>completeChallenge(b.dataset.kengChallenge)));
}
async function saveSteps(){if(S.busy)return;const input=document.querySelector('#myKomoSteps'),steps=Math.round(Number(input?.value));if(!Number.isFinite(steps)||steps<0||steps>100000){notify('Entrez un nombre de pas valide.');return}S.busy=true;render();try{const r=await sb().rpc('komo_log_steps',{p_steps:steps});if(r.error)throw r.error;S.engagement=r.data||S.engagement;notify(`Pas enregistrés · +${Number(S.engagement?.step_xp)||0} XP`)}catch(e){console.error('[my-komo steps]',e);notify('Impossible d’enregistrer les pas pour le moment.')}finally{S.busy=false;render()}}
async function completeChallenge(slug){if(S.busy||!slug)return;S.busy=true;render();try{const r=await sb().rpc('komo_complete_daily_challenge',{p_slug:slug});if(r.error)throw r.error;S.engagement=r.data||S.engagement;notify('Défi accompli · XP ajoutée')}catch(e){console.error('[my-komo challenge]',e);notify('Impossible de valider ce défi pour le moment.')}finally{S.busy=false;render()}}

async function refresh(force=false){if(route()!=='home')return;await load(force);render()}
function schedule(force=false){setTimeout(()=>refresh(force),90);setTimeout(render,360)}
window.addEventListener('hashchange',()=>schedule(false));window.addEventListener('komo:route-ready',()=>schedule(false));window.addEventListener('komo:session-ready',()=>schedule(true));window.addEventListener('komo:data-ready',()=>schedule(true));document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>refresh(true),900));
const root=document.querySelector('#viewRoot');if(root)new MutationObserver(()=>{if(route()==='home'&&!root.querySelector('[data-my-komo-home]'))setTimeout(render,40)}).observe(root,{childList:true});
window.KomoMyKomo={refresh:()=>refresh(true)};
setTimeout(()=>refresh(false),1500);
