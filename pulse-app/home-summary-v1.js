import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const S={client:null,user:null,profile:null,free:null,patient:null,motionAssessment:null,motionScore:null,clinicalAssessment:null,loading:false,lastLoad:0};

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(S.client||(S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function route(){return location.hash.replace(/^#/,'')||'home'}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function initials(name=''){const p=String(name).trim().split(/\s+/).filter(Boolean);return(p.length>1?`${p[0][0]}${p[p.length-1][0]}`:p[0]?.slice(0,2)||'K').toUpperCase()}
function qLevel(score){if(score===null)return null;const d=100-score;if(d<7)return 0;if(d<16)return 1;if(d<24)return 2;return 3}
function tLevel(ratio){if(ratio===null)return null;if(ratio>=1.3)return 0;if(ratio>=1.1)return 1;if(ratio>=0.9)return 2;return 3}
function freeResult(a){if(!a)return null;const r=a.responses||{},qObj=r?.baseline?.questionnaire||{};let q=n(qObj.mobility_score_0_100);if(q===null){const d=n(qObj.difficulty_total);if(d!==null)q=Math.max(0,100-d)}const chair=n(r?.chair_stand?.repetitions),two=n(r?.two_step?.ratio);if(!r?.baseline?.completed_at||!r?.chair_stand?.completed_at||!r?.two_step?.completed_at)return null;const levels=[qLevel(q),tLevel(two)].filter(Number.isFinite),level=levels.length?Math.max(...levels):0;const titles=['Mobilité préservée','Mobilité à surveiller','Diminution fonctionnelle probable','Diminution fonctionnelle marquée'];return{q,chair,two,level,title:titles[level]||'Résultat disponible'}}
function statusLabel(s){return({scheduled:'Planifié',collecting:'En cours',review:'En revue',validated:'Validé',released:'Disponible',completed:'Terminé'})[s]||'En attente'}
function displayName(){const p=S.profile||{},full=`${p.first_name||''} ${p.last_name||''}`.trim();return full||p.display_name?.trim()||S.user?.email?.split('@')[0]||'Votre profil'}

async function load(force=false){if(S.loading||(!force&&S.user&&Date.now()-S.lastLoad<10000))return;S.loading=true;try{const c=sb(),{data:{session}}=await c.auth.getSession();if(!session?.user)return;S.user=session.user;const [pr,fr,pa]=await Promise.all([
 c.from('profiles').select('display_name,first_name,last_name,city').eq('id',session.user.id).maybeSingle(),
 c.from('pulse_assessments').select('id,responses,status,completed_at,updated_at').eq('user_id',session.user.id).eq('protocol_version','mobility-check-v1').order('updated_at',{ascending:false}).limit(1).maybeSingle(),
 c.from('patients').select('id,organization_id').eq('patient_user_id',session.user.id).order('created_at',{ascending:false}).limit(1).maybeSingle()
]);S.profile=pr.data||null;S.free=freeResult(fr.data||null);S.patient=pa.data||null;S.motionAssessment=null;S.motionScore=null;S.clinicalAssessment=null;
 if(S.patient){const ar=await c.from('assessments').select('id,product_mode,status,created_at').eq('patient_id',S.patient.id).order('created_at',{ascending:false}).limit(20);const assessments=ar.data||[];S.motionAssessment=assessments.find(x=>x.product_mode==='motion')||null;S.clinicalAssessment=assessments.find(x=>x.product_mode==='clinical')||null;if(S.motionAssessment){const sr=await c.from('scores').select('motion_score,overall_score,release_status,status,calculated_at').eq('assessment_id',S.motionAssessment.id).order('calculated_at',{ascending:false}).limit(1).maybeSingle();S.motionScore=sr.data||null}}
 S.lastLoad=Date.now();}catch(e){console.error('[home-summary-v1]',e)}finally{S.loading=false}}

function freeRow(){const r=S.free;if(!r)return`<div class="khs-row"><div class="khs-index">01</div><div class="khs-copy"><span>Pulse Free</span><strong>À réaliser</strong><small>Votre première référence fonctionnelle.</small></div><span class="khs-pill pending">En attente</span></div>`;return`<button class="khs-row is-done" type="button" data-route="results"><div class="khs-index">01</div><div class="khs-copy"><span>Pulse Free</span><strong>Niveau ${r.level} · ${esc(r.title)}</strong><small>${r.q===null?'—':Math.round(r.q)+'/100'} · ${r.chair===null?'—':Math.round(r.chair)+' rép.'} · Two-Step ${r.two===null?'—':r.two.toFixed(2)}</small></div><span class="khs-pill good">${r.level===0?'Favorable':'Disponible'}</span></button>`}
function motionRow(){const s=n(S.motionScore?.motion_score??S.motionScore?.overall_score);if(s!==null)return`<button class="khs-row is-done" type="button" data-route="path"><div class="khs-index">02</div><div class="khs-copy"><span>KŌMØ Motion</span><strong>${Math.round(s)}/100</strong><small>Analyse instrumentée du mouvement.</small></div><span class="khs-pill good">Disponible</span></button>`;const st=S.motionAssessment?statusLabel(S.motionAssessment.status):'En attente';return`<button class="khs-row" type="button" data-route="documents"><div class="khs-index">02</div><div class="khs-copy"><span>KŌMØ Motion</span><strong>${esc(st)}</strong><small>Mesure Myodev / MyoCare et analyse fonctionnelle.</small></div><span class="khs-pill pending">${esc(st)}</span></button>`}
function clinicalRow(){const a=S.clinicalAssessment;if(a&&['validated','released','completed'].includes(a.status))return`<div class="khs-row is-done"><div class="khs-index">03</div><div class="khs-copy"><span>KŌMØ Clinical</span><strong>${esc(statusLabel(a.status))}</strong><small>Interprétation clinique supervisée.</small></div><span class="khs-pill good">Disponible</span></div>`;return`<div class="khs-row"><div class="khs-index">03</div><div class="khs-copy"><span>KŌMØ Clinical</span><strong>En attente</strong><small>Contexte médical et validation professionnelle.</small></div><span class="khs-pill pending">En attente</span></div>`}

function render(){if(route()!=='home')return;const card=document.querySelector('.hero-grid .side-summary');if(!card)return;const name=displayName();card.classList.add('khs-card');card.innerHTML=`<div class="khs-head"><div class="khs-person"><div class="khs-avatar">${esc(initials(name))}</div><div><p class="eyebrow">VOTRE SYNTHÈSE</p><h3>${esc(name)}</h3><span>${esc(S.profile?.city||'Dossier KŌMØ')}</span></div></div><div class="khs-mark"><i></i><span>3 niveaux<br>de lecture</span></div></div><div class="khs-stack">${freeRow()}${motionRow()}${clinicalRow()}</div><div class="khs-foot"><div><span>Votre trajectoire</span><strong>${S.free?'Première référence enregistrée':'À commencer'}</strong></div><button type="button" data-route="${S.motionScore?'path':'documents'}">${S.motionScore?'Voir My KŌMØ':'Continuer avec Motion'} →</button></div>`}

async function refresh(force=false){if(route()!=='home')return;await load(force);render()}
window.addEventListener('hashchange',()=>{if(route()==='home')[80,260,700].forEach(ms=>setTimeout(()=>refresh(false),ms))});
window.addEventListener('komo:route-ready',()=>{if(route()==='home')setTimeout(()=>refresh(false),80)});
window.addEventListener('komo:session-ready',()=>setTimeout(()=>refresh(true),120));
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>refresh(true),900));
setTimeout(()=>refresh(false),1500);
