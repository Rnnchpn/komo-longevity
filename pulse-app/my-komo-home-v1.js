import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const S={client:null,user:null,profile:null,free:null,patients:[],motion:null,clinical:null,next:null,centers:[],avatarUrl:'',loading:false,lastLoad:0};

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

async function signedAvatar(path){if(!path)return'';try{const r=await sb().storage.from('profile-avatars').createSignedUrl(path,3600);return r.data?.signedUrl||''}catch{return''}}

async function load(force=false){
  if(S.loading||(!force&&S.user&&Date.now()-S.lastLoad<12000))return;
  S.loading=true;
  try{
    const c=sb(),runtime=window.KomoRuntime?.getContext?.(),session=runtime?.session||(await c.auth.getSession()).data?.session;if(!session?.user)return;S.user=session.user;
    const [pr,fr,ps]=await Promise.all([
      c.from('profiles').select('display_name,first_name,last_name,city,country,birth_date,sex_at_birth,avatar_path').eq('id',session.user.id).maybeSingle(),
      c.from('pulse_assessments').select('id,responses,status,completed_at,updated_at').eq('user_id',session.user.id).eq('protocol_version','mobility-check-v1').order('updated_at',{ascending:false}).limit(1).maybeSingle(),
      c.from('patients').select('id,organization_id').eq('patient_user_id',session.user.id).order('created_at',{ascending:false})
    ]);
    S.profile=pr.data||null;S.free=freeResult(fr.data||null);S.patients=ps.data||[];S.motion=null;S.clinical=null;S.next=null;S.centers=[];
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
      if(scoreIds.length){const sr=await c.from('scores').select('assessment_id,motion_score,overall_score,release_status,status,calculated_at').in('assessment_id',scoreIds).order('calculated_at',{ascending:false});const scores=sr.data||[];S.motion={assessment:motionA,score:scores.find(x=>x.assessment_id===motionA?.id)||null};S.clinical={assessment:clinicalA,score:scores.find(x=>x.assessment_id===clinicalA?.id)||null}}
      else{S.motion=motionA?{assessment:motionA,score:null}:null;S.clinical=clinicalA?{assessment:clinicalA,score:null}:null}
      S.next=(ap.data||[]).find(x=>new Date(x.scheduled_start)>new Date()&&!['cancelled','completed','no_show'].includes(x.status))||null;
    }
    S.lastLoad=Date.now();
  }catch(e){console.error('[my-komo-home-v1]',e)}finally{S.loading=false}
}

function ring(label,value,sub){const v=n(value),pct=v===null?0:Math.max(0,Math.min(100,v));return`<div class="mykomo-ring-item"><div class="mykomo-ring" style="--value:${pct}"><div><strong>${v===null?'—':Math.round(v)}${v===null?'':'<small>/100</small>'}</strong><span>${esc(label)}</span></div></div><strong>${esc(label)}</strong><small>${esc(sub)}</small></div>`}
function achievements(){const p=profilePct(),items=[['Profil',p===100],['Photo',!!S.profile?.avatar_path],['KŌMØ Start',!!S.free],['Rendez-vous',!!S.next],['Motion',n(S.motion?.score?.motion_score??S.motion?.score?.overall_score)!==null],['Clinical',n(S.clinical?.score?.overall_score)!==null]],done=items.filter(x=>x[1]).length,xp=done*100,level=Math.floor(xp/300)+1,within=xp%300,pct=xp>=600?100:Math.round(within/300*100);return{items,done,xp,level,pct,next:xp>=600?'Tous les jalons actuels complétés':`${300-within} XP avant le niveau ${level+1}`}}
function nextAppointment(){if(!S.next)return`<div class="mykomo-next"><span>PROCHAIN RENDEZ-VOUS</span><strong>Aucun rendez-vous planifié</strong><small>Réservez votre prochaine étape Motion ou Clinical depuis Pulse.</small><button type="button" data-route="documents">Planifier un rendez-vous →</button></div>`;return`<div class="mykomo-next"><span>PROCHAIN RENDEZ-VOUS</span><strong>${esc(service(S.next.appointment_type))}</strong><small>${esc(fmtDateTime(S.next.scheduled_start))} · ${esc(centerName(S.next.organization_id))}</small><button type="button" data-route="documents">Voir mon rendez-vous →</button></div>`}

function render(){
  if(route()!=='home')return;
  const root=document.querySelector('#viewRoot');if(!root)return;
  let host=root.querySelector('[data-my-komo-home]');if(!host){host=document.createElement('section');host.className='mykomo-home';host.dataset.myKomoHome='1';root.prepend(host)}
  const q=S.free?.q??null,motion=n(S.motion?.score?.motion_score??S.motion?.score?.overall_score),clinical=n(S.clinical?.score?.overall_score),a=achievements(),nm=name(),loc=[S.profile?.city,S.profile?.country].filter(Boolean).join(' · ')||'Profil KŌMØ';
  const html=`<article class="mykomo-card"><div class="mykomo-top"><div class="mykomo-identity"><div class="mykomo-avatar">${S.avatarUrl?`<img src="${esc(S.avatarUrl)}" alt="Photo de profil">`:esc(initials(nm))}</div><div><small>MY KŌMØ</small><h2>${esc(nm)}</h2><p>${esc(loc)} · Profil ${profilePct()}% complété</p></div></div><button type="button" class="mykomo-profile-btn" data-route="profile">Personnaliser mon profil →</button></div><div class="mykomo-grid"><section class="mykomo-score-card"><div class="mykomo-section-label"><span>MES REPÈRES</span><button type="button" data-route="results">Voir le détail →</button></div><div class="mykomo-rings">${ring('Start',q,q===null?'Questionnaire à compléter':'Questionnaire mobilité')}${ring('Motion',motion,motion===null?'En attente de mesure':'Motion Score')}${ring('Clinical',clinical,clinical===null?'En attente de validation':'Clinical Score')}</div></section><aside class="mykomo-side">${nextAppointment()}<div class="mykomo-xp"><div class="mykomo-xp-head"><span>PROGRESSION KŌMØ</span><strong>Niveau ${a.level}</strong></div><div class="mykomo-xp-track" style="--xp:${a.pct}%"><i></i></div><div class="mykomo-xp-foot"><span>${a.xp} XP</span><span>${esc(a.next)}</span></div><div class="mykomo-achievements">${a.items.map(([label,done])=>`<span class="${done?'done':''}">${esc(label)}</span>`).join('')}</div></div></aside></div></article>`;
  if(host.dataset.signature===html)return;host.dataset.signature=html;host.innerHTML=html;
}

async function refresh(force=false){if(route()!=='home')return;await load(force);render()}
function schedule(force=false){setTimeout(()=>refresh(force),90);setTimeout(render,360)}
window.addEventListener('hashchange',()=>schedule(false));window.addEventListener('komo:route-ready',()=>schedule(false));window.addEventListener('komo:session-ready',()=>schedule(true));window.addEventListener('komo:data-ready',()=>schedule(true));document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>refresh(true),900));
const root=document.querySelector('#viewRoot');if(root)new MutationObserver(()=>{if(route()==='home'&&!root.querySelector('[data-my-komo-home]'))setTimeout(render,40)}).observe(root,{childList:true});
window.KomoMyKomo={refresh:()=>refresh(true)};
setTimeout(()=>refresh(false),1500);
