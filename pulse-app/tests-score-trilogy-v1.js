import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const S={client:null,user:null,free:null,patient:null,motionAssessment:null,motionScore:null,clinicalAssessment:null,clinicalScore:null,loading:false,lastLoad:0};

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(S.client||(S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function route(){return location.hash.replace(/^#/,'')||'home'}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmt(v){if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(d)}
function qLevel(score){if(score===null)return null;const d=100-score;if(d<7)return 0;if(d<16)return 1;if(d<24)return 2;return 3}
function tLevel(ratio){if(ratio===null)return null;if(ratio>=1.3)return 0;if(ratio>=1.1)return 1;if(ratio>=0.9)return 2;return 3}
function freeResult(a){if(!a)return null;const r=a.responses||{},qObj=r?.baseline?.questionnaire||{};let q=n(qObj.mobility_score_0_100);if(q===null){const d=n(qObj.difficulty_total);if(d!==null)q=Math.max(0,100-d)}const chair=n(r?.chair_stand?.repetitions),two=n(r?.two_step?.ratio);if(!r?.baseline?.completed_at||!r?.chair_stand?.completed_at||!r?.two_step?.completed_at)return null;const levels=[qLevel(q),tLevel(two)].filter(Number.isFinite),level=levels.length?Math.max(...levels):0;return{q,chair,two,level,date:a.completed_at||a.updated_at}}
function statusLabel(s){return({scheduled:'Planifié',collecting:'En cours',review:'En revue',validated:'Validé',released:'Disponible',completed:'Terminé'})[s]||'En attente'}

async function load(force=false){
  if(S.loading||(!force&&S.user&&Date.now()-S.lastLoad<10000))return;
  S.loading=true;
  try{
    const c=sb(),{data:{session}}=await c.auth.getSession();if(!session?.user)return;S.user=session.user;
    const [fr,pa]=await Promise.all([
      c.from('pulse_assessments').select('id,responses,status,completed_at,updated_at').eq('user_id',session.user.id).eq('protocol_version','mobility-check-v1').order('updated_at',{ascending:false}).limit(1).maybeSingle(),
      c.from('patients').select('id,organization_id,organizations(name,city)').eq('patient_user_id',session.user.id).order('created_at',{ascending:false}).limit(1).maybeSingle()
    ]);
    S.free=freeResult(fr.data||null);S.patient=pa.data||null;S.motionAssessment=null;S.motionScore=null;S.clinicalAssessment=null;S.clinicalScore=null;
    if(S.patient){
      const ar=await c.from('assessments').select('id,product_mode,status,created_at').eq('patient_id',S.patient.id).order('created_at',{ascending:false}).limit(30);
      const assessments=ar.data||[];S.motionAssessment=assessments.find(x=>x.product_mode==='motion')||null;S.clinicalAssessment=assessments.find(x=>x.product_mode==='clinical')||null;
      const ids=[S.motionAssessment?.id,S.clinicalAssessment?.id].filter(Boolean);
      if(ids.length){const sr=await c.from('scores').select('assessment_id,motion_score,overall_score,release_status,status,calculated_at').in('assessment_id',ids).order('calculated_at',{ascending:false});const scores=sr.data||[];S.motionScore=scores.find(x=>x.assessment_id===S.motionAssessment?.id)||null;S.clinicalScore=scores.find(x=>x.assessment_id===S.clinicalAssessment?.id)||null}
    }
    S.lastLoad=Date.now();
  }catch(e){console.error('[tests-score-trilogy-v1]',e)}finally{S.loading=false}
}

function startCard(){
  const r=S.free;
  if(!r)return`<article class="kst-card"><div class="kst-top"><span>01 · START</span><span class="kst-pill pending">À réaliser</span></div><h3>Score KŌMØ Start</h3><strong class="kst-main pending">En attente</strong><p>Votre première référence fonctionnelle apparaîtra ici après les trois tests Pulse.</p><div class="kst-foot"><span>Questionnaire · Chair Stand · Two-Step</span></div></article>`;
  const good=r.level===0;
  return`<article class="kst-card is-ready"><div class="kst-top"><span>01 · START</span><span class="kst-pill good">Disponible</span></div><h3>Score KŌMØ Start</h3><strong class="kst-main">${good?'Favorable':'À approfondir'}</strong><p>Votre première référence fonctionnelle est enregistrée${r.date?` · ${fmt(r.date)}`:''}.</p><div class="kst-metrics"><div><span>Questionnaire</span><b>${r.q===null?'—':Math.round(r.q)+'/100'}</b></div><div><span>Chair Stand</span><b>${r.chair===null?'—':Math.round(r.chair)+' rép.'}</b></div><div><span>Two-Step</span><b>${r.two===null?'—':r.two.toFixed(2)}</b></div></div></article>`;
}
function scoreCard(kind,index,title,assessment,score){
  const value=n(kind==='motion'?(score?.motion_score??score?.overall_score):score?.overall_score);
  const available=value!==null;
  const status=available?'Disponible':assessment?statusLabel(assessment.status):'En attente';
  const center=S.patient?.organizations?.name||'';
  const copy=kind==='motion'?'Analyse instrumentée du mouvement et de la fonction musculaire.':'Interprétation clinique, posture et données complémentaires validées.';
  const action=kind==='motion'&&!available?'<button type="button" data-kst-motion>Planifier Motion →</button>':'';
  return`<article class="kst-card ${available?'is-ready':''}"><div class="kst-top"><span>${String(index).padStart(2,'0')} · ${kind.toUpperCase()}</span><span class="kst-pill ${available?'good':'pending'}">${esc(status)}</span></div><h3>${esc(title)}</h3><strong class="kst-main ${available?'':'pending'}">${available?Math.round(value)+'/100':'En attente'}</strong><p>${esc(copy)}</p><div class="kst-foot"><span>${center?esc(center):kind==='motion'?'Centre à sélectionner':'Après validation professionnelle'}</span>${action}</div></article>`;
}

function cleanupLegacy(root){
  const head=[...root.querySelectorAll('.tests-v1-section-head')].find(x=>(x.querySelector('.eyebrow')?.textContent||'').includes('AVEC VOTRE PROFESSIONNEL'));
  head?.remove();root.querySelector('.tests-v1-consult-grid')?.remove();
}
function render(){
  if(route()!=='results')return;
  const root=document.querySelector('.tests-v1-root');if(!root)return;
  cleanupLegacy(root);
  let section=root.querySelector('[data-k-score-trilogy]');
  if(!section){section=document.createElement('section');section.dataset.kScoreTrilogy='1';section.className='kst-wrap';const hero=root.querySelector('.tests-v1-hero');hero?.insertAdjacentElement('afterend',section)}
  if(!section)return;
  const html=`<div class="kst-head"><div><p class="eyebrow">VOS SCORES KŌMØ</p><h3>Votre parcours en trois scores.</h3></div><p>Start établit votre point de départ. Motion approfondit le mouvement. Clinical ajoute la lecture clinique lorsque celle-ci est indiquée.</p></div><div class="kst-grid">${startCard()}${scoreCard('motion',2,'Score KŌMØ Motion',S.motionAssessment,S.motionScore)}${scoreCard('clinical',3,'Score KŌMØ Clinical',S.clinicalAssessment,S.clinicalScore)}</div>`;
  if(section.dataset.signature===html)return;
  section.dataset.signature=html;section.innerHTML=html;
  section.querySelector('[data-kst-motion]')?.addEventListener('click',()=>{location.hash='documents'});
}
async function refresh(force=false){if(route()!=='results')return;await load(force);render()}
function schedule(){setTimeout(()=>refresh(false),80);setTimeout(render,320)}
window.addEventListener('hashchange',schedule);window.addEventListener('komo:route-ready',schedule);window.addEventListener('komo:session-ready',()=>setTimeout(()=>refresh(true),140));document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>refresh(true),900));
const root=document.querySelector('#viewRoot');if(root)new MutationObserver(()=>{if(route()==='results')setTimeout(render,30)}).observe(root,{childList:true,subtree:true});
setTimeout(()=>refresh(false),1400);
