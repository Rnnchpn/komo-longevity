import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const OPEN_KEY='komo_open_motion_from_free';
const ROUTES=new Set(['home','results','path']);
const S={client:null,user:null,role:'member',assessment:null,requests:[],loading:false,lastLoad:0};

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){if(!S.client)S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return S.client}
function route(){return location.hash.replace(/^#/,'')||'home'}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmtDate(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(d)}
function qLevel(score){if(score===null)return null;const d=100-score;if(d<7)return 0;if(d<16)return 1;if(d<24)return 2;return 3}
function tLevel(ratio){if(ratio===null)return null;if(ratio>=1.3)return 0;if(ratio>=1.1)return 1;if(ratio>=0.9)return 2;return 3}
function complete(a){const r=a?.responses||{};return ['baseline','chair_stand','two_step'].every(k=>r?.[k]?.completed_at)}
function result(){
  if(!S.assessment||!complete(S.assessment))return null;
  const r=S.assessment.responses||{},qObj=r?.baseline?.questionnaire||{};
  let q=n(qObj.mobility_score_0_100);if(q===null){const raw=n(qObj.difficulty_total);if(raw!==null)q=Math.max(0,100-raw)}
  const chair=n(r?.chair_stand?.repetitions),two=n(r?.two_step?.ratio),ql=qLevel(q),tl=tLevel(two),levels=[ql,tl].filter(Number.isFinite),level=levels.length?Math.max(...levels):0;
  const titles=['Mobilité préservée','Mobilité à surveiller','Diminution fonctionnelle probable','Diminution fonctionnelle marquée'];
  return{q,chair,two,ql,tl,level,title:titles[level]||'Résultat disponible',date:S.assessment.completed_at||S.assessment.updated_at};
}
function latestRequest(){return S.requests.find(x=>['submitted','assigned','accepted','scheduled'].includes(x.status))||S.requests[0]||null}
function requestCopy(req){
  if(!req)return{label:'Passer à KŌMØ Motion',title:'Approfondir votre première référence.',body:'Une évaluation Motion ajoute l’acquisition Myodev, le contexte professionnel et une lecture instrumentée de votre mouvement.',action:'Demander KŌMØ Motion →',kind:'request'};
  if(req.status==='submitted')return{label:'Demande Motion envoyée',title:'Votre demande a été transmise.',body:'KŌMØ doit maintenant orienter votre demande vers le bon établissement et le bon professionnel.',action:'Suivre ma demande →',kind:'follow'};
  if(req.status==='assigned')return{label:'Professionnel en cours d’attribution',title:'Votre parcours Motion est orienté.',body:'Un établissement ou un professionnel a été désigné pour préparer la prochaine étape.',action:'Suivre ma demande →',kind:'follow'};
  if(req.status==='accepted')return{label:'Dossier Motion prêt',title:'Votre professionnel peut maintenant réaliser Motion.',body:'Choisissez votre créneau. Votre résultat Pulse Free restera attaché à votre dossier professionnel.',action:'Choisir mon rendez-vous →',kind:'book'};
  if(req.status==='scheduled')return{label:'Motion planifié',title:'Votre rendez-vous Motion est programmé.',body:'Pulse conserve votre première référence et la reliera au résultat instrumenté après la mesure.',action:'Voir mon agenda →',kind:'book'};
  if(req.status==='completed')return{label:'Motion réalisé',title:'Votre trajectoire continue.',body:'Retrouvez vos résultats et leur évolution dans My KŌMØ.',action:'Voir My KŌMØ →',kind:'mykomo'};
  return{label:'Passer à KŌMØ Motion',title:'Approfondir votre première référence.',body:'Votre bilan professionnel complète Pulse Free sans le remplacer.',action:'Demander KŌMØ Motion →',kind:'request'};
}

async function load(force=false){
  if(S.loading)return;const now=Date.now();if(!force&&S.user&&now-S.lastLoad<12000)return;
  S.loading=true;try{
    const {data:{session}}=await sb().auth.getSession();if(!session?.user)return;S.user=session.user;
    const rr=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=rr.data?.role||'member';if(['professional','admin'].includes(S.role))return;
    const [a,r]=await Promise.all([
      sb().from('pulse_assessments').select('id,status,responses,completed_at,updated_at').eq('user_id',session.user.id).eq('protocol_version','mobility-check-v1').order('updated_at',{ascending:false}).limit(1).maybeSingle(),
      sb().from('patient_service_requests').select('id,service,status,preferred_city,submitted_at,assigned_at,accepted_at,scheduled_at,completed_at').eq('user_id',session.user.id).eq('service','motion').order('submitted_at',{ascending:false}).limit(12)
    ]);
    S.assessment=a.data||null;S.requests=r.data||[];S.lastLoad=Date.now();
  }catch(e){console.error('[pulse-free-continuity]',e)}finally{S.loading=false}
}

function addStyles(){if(document.querySelector('#kfree-continuity-style'))return;const s=document.createElement('style');s.id='kfree-continuity-style';s.textContent=`
.kfree-cross{margin:24px 0;border:1px solid rgba(43,52,44,.11);border-radius:28px;background:#f4f0e7;overflow:hidden;box-shadow:0 18px 60px rgba(41,49,40,.06)}
.kfree-cross-main{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center;padding:28px 30px}.kfree-cross h2,.kfree-cross h3{margin:5px 0 8px;letter-spacing:-.035em}.kfree-cross h2{font-size:30px}.kfree-cross h3{font-size:21px}.kfree-cross p{margin:0;color:#6e766f;line-height:1.58}.kfree-eyebrow{font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#7b827b}.kfree-level{width:112px;height:112px;border-radius:50%;display:grid;place-items:center;align-content:center;background:#2d392f;color:#fff}.kfree-level small{font-size:8px;letter-spacing:.12em;color:rgba(255,255,255,.62)}.kfree-level strong{font-size:42px;line-height:1}.kfree-level span{font-size:9px;color:rgba(255,255,255,.66)}
.kfree-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:0 30px 24px}.kfree-metric{background:#fff;border:1px solid rgba(45,55,47,.08);border-radius:17px;padding:15px}.kfree-metric span{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#868b86}.kfree-metric strong{display:block;margin-top:6px;font-size:20px;color:#354137}.kfree-metric small{display:block;margin-top:4px;color:#7b817b;line-height:1.4}
.kfree-motion{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:center;padding:22px 30px;border-top:1px solid rgba(45,55,47,.09);background:#fff}.kfree-motion-copy span{display:inline-flex;padding:5px 8px;border-radius:999px;background:#edf0e9;color:#4c5e4d;font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.kfree-motion-copy h3{margin:8px 0 5px}.kfree-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.kfree-btn{border:0;border-radius:999px;padding:11px 15px;font:inherit;font-size:11px;font-weight:700;cursor:pointer}.kfree-btn.primary{background:#29352b;color:#fff}.kfree-btn.secondary{background:#eeeae1;color:#384439}.kfree-btn.link{background:transparent;color:#4d5d50;padding-inline:4px}
.kfree-mykomo{margin:0 0 24px}.kfree-library{margin-top:14px;padding:24px 28px;border-radius:24px;background:#fff;border:1px solid rgba(43,52,44,.09)}.kfree-library-head{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:14px}.kfree-library-head h3{margin:4px 0 0}.kfree-library-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.kfree-library-card{display:block;padding:17px;border-radius:17px;background:#f6f3ed;border:1px solid rgba(43,52,44,.07);text-decoration:none;color:inherit}.kfree-library-card span{font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7b827b}.kfree-library-card strong{display:block;margin:7px 0 5px;font-size:14px}.kfree-library-card p{font-size:11px;color:#747b74;line-height:1.45}.kfree-library-card b{display:block;margin-top:10px;font-size:10px;color:#3f5141}
.kfree-result-strip{margin-top:16px;padding:18px 20px;border-radius:18px;background:#fff;border:1px solid rgba(43,52,44,.09);display:grid;grid-template-columns:1fr auto;align-items:center;gap:18px}.kfree-result-strip strong{display:block;margin-bottom:3px}.kfree-result-strip span{font-size:11px;color:#747b74}
@media(max-width:820px){.kfree-cross-main,.kfree-motion{grid-template-columns:1fr}.kfree-level{width:92px;height:92px}.kfree-metrics,.kfree-library-grid{grid-template-columns:1fr}.kfree-actions{justify-content:flex-start}.kfree-cross-main,.kfree-motion{padding:22px}.kfree-metrics{padding:0 22px 20px}.kfree-library{padding:20px}.kfree-result-strip{grid-template-columns:1fr}}
`;document.head.appendChild(s)}

function metricsHtml(r){return`<div class="kfree-metrics"><div class="kfree-metric"><span>Questionnaire KŌMØ</span><strong>${r.q===null?'—':Math.round(r.q)+'/100'}</strong><small>${r.q===null?'Réponse enregistrée':Math.round(100-r.q)+' point'+(Math.round(100-r.q)>1?'s':'')+' de difficulté'}</small></div><div class="kfree-metric"><span>Chair Stand · 30 s</span><strong>${r.chair===null?'—':Math.round(r.chair)+' rép.'}</strong><small>Force-endurance fonctionnelle</small></div><div class="kfree-metric"><span>Two-Step</span><strong>${r.two===null?'—':r.two.toFixed(2)}</strong><small>${r.two!==null&&r.two>=1.3?'Au-dessus du seuil de repérage 1,30':'Repère fonctionnel enregistré'}</small></div></div>`}
function motionHtml(req){const m=requestCopy(req);return`<div class="kfree-motion"><div class="kfree-motion-copy"><span>${esc(m.label)}</span><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p></div><div class="kfree-actions"><button class="kfree-btn secondary" type="button" data-kfree-results>Voir mon résultat</button><button class="kfree-btn primary" type="button" data-kfree-motion="${esc(m.kind)}">${esc(m.action)}</button></div></div>`}
function resultCard(r,req,mode='home'){return`<section class="kfree-cross ${mode==='path'?'kfree-mykomo':''}" data-kfree-cross="${mode}"><div class="kfree-cross-main"><div><div class="kfree-eyebrow">PULSE FREE · PREMIÈRE RÉFÉRENCE</div><h2>${esc(r.title)}.</h2><p>Votre bilan autonome est terminé et reste maintenant visible dans votre trajectoire KŌMØ. Il servira de point de comparaison avant et après KŌMØ Motion.</p><p style="margin-top:8px;font-size:10px">Réalisé le ${fmtDate(r.date)} · repère de dépistage, non diagnostic.</p></div><div class="kfree-level"><small>NIVEAU FREE</small><strong>${r.level}</strong><span>sur 3</span></div></div>${metricsHtml(r)}${motionHtml(req)}</section>`}
function libraryHtml(r){const items=r.level===0?[
  ['Fondations','Comprendre le syndrome locomoteur','Pourquoi mobilité, appareil locomoteur et autonomie sont liés.','https://komolongevity.com/locomotor/'],
  ['Capacités','Pourquoi la force change avec l’âge','Sit-to-stand, force fonctionnelle et autonomie au quotidien.','https://komolongevity.com/library/'],
  ['Méthode','Ce que KŌMØ mesure réellement','Comprendre la différence entre dépistage, mesure instrumentée et interprétation.','https://komolongevity.com/science/']
]:[
  ['Méthode','Ce que mesure le Mobility Check','Lire vos trois composantes sans transformer un repère en diagnostic.','https://komolongevity.com/library/'],
  ['Fondations','Comprendre le syndrome locomoteur','Situer votre résultat dans le cadre de prévention locomotrice.','https://komolongevity.com/locomotor/'],
  ['Clinical','Pourquoi approfondir après le Check','Ce que l’évaluation professionnelle ajoute au dépistage autonome.','https://komolongevity.com/science/']
];return`<section class="kfree-library" data-kfree-library><div class="kfree-library-head"><div><div class="kfree-eyebrow">MY KŌMØ · À LIRE POUR VOUS</div><h3>Comprendre avant d’agir.</h3></div><a href="https://komolongevity.com/library/" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#445447">Toute la Library ↗</a></div><div class="kfree-library-grid">${items.map(x=>`<a class="kfree-library-card" href="${x[3]}" target="_blank" rel="noopener noreferrer"><span>${x[0]}</span><strong>${x[1]}</strong><p>${x[2]}</p><b>Lire ↗</b></a>`).join('')}</div></section>`}

function bind(container){container.querySelectorAll('[data-kfree-results]').forEach(b=>b.addEventListener('click',()=>{location.hash='results'}));container.querySelectorAll('[data-kfree-motion]').forEach(b=>b.addEventListener('click',()=>motionAction(b.dataset.kfreeMotion)));}
function motionAction(kind){if(kind==='book'){location.hash='documents';return}if(kind==='mykomo'){location.hash='path';return}if(kind==='follow'){location.hash='home';setTimeout(()=>document.querySelector('[data-motion-request-card]')?.scrollIntoView({behavior:'smooth',block:'center'}),500);return}sessionStorage.setItem(OPEN_KEY,'1');location.hash='home';attemptOpenMotion()}
function attemptOpenMotion(){if(sessionStorage.getItem(OPEN_KEY)!=='1')return;let tries=0;const t=setInterval(()=>{tries++;const b=document.querySelector('#pirOpenRequest');if(b){sessionStorage.removeItem(OPEN_KEY);clearInterval(t);b.click();return}if(tries>20){clearInterval(t);document.querySelector('[data-motion-request-card]')?.scrollIntoView({behavior:'smooth',block:'center'})}},120)}

function injectHome(r,req){const root=document.querySelector('#viewRoot');if(!root||root.querySelector('[data-kfree-cross="home"]'))return;const hero=root.querySelector('.hero-grid');if(!hero)return;hero.insertAdjacentHTML('afterend',resultCard(r,req,'home'));const el=root.querySelector('[data-kfree-cross="home"]');if(el)bind(el);attemptOpenMotion()}
function injectPath(r,req){const root=document.querySelector('#viewRoot');if(!root||!root.querySelector('[data-patient-v4="path"]')||root.querySelector('[data-kfree-cross="path"]'))return;const intro=root.querySelector('.pv4-intro');if(!intro)return;intro.insertAdjacentHTML('afterend',resultCard(r,req,'path')+libraryHtml(r));const el=root.querySelector('[data-kfree-cross="path"]');if(el)bind(el)}
function injectResults(r,req){const root=document.querySelector('#viewRoot');if(!root||root.querySelector('[data-kfree-result-strip]'))return;const full=root.querySelector('.pulse-free-result-v2');if(!full)return;const m=requestCopy(req);full.insertAdjacentHTML('afterend',`<section class="kfree-result-strip" data-kfree-result-strip><div><strong>${esc(m.label)}</strong><span>${esc(m.body)}</span></div><div class="kfree-actions"><button class="kfree-btn primary" type="button" data-kfree-motion="${esc(m.kind)}">${esc(m.action)}</button></div></section>`);const el=root.querySelector('[data-kfree-result-strip]');if(el)bind(el)}

async function render(force=false){if(!ROUTES.has(route()))return;await load(force);if(['professional','admin'].includes(S.role))return;const r=result();if(!r)return;addStyles();const req=latestRequest();if(route()==='home')injectHome(r,req);else if(route()==='path')injectPath(r,req);else if(route()==='results')injectResults(r,req)}
function schedule(force=false){setTimeout(()=>render(force),45);setTimeout(()=>render(false),260);setTimeout(()=>render(false),850)}
window.addEventListener('hashchange',()=>schedule(false));window.addEventListener('komo:route-ready',()=>schedule(false));document.addEventListener('click',e=>{if(e.target.closest('#refreshButton'))setTimeout(()=>render(true),350)});document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>render(true),900));
const obs=new MutationObserver(()=>{if(ROUTES.has(route()))schedule(false)});obs.observe(document.body,{childList:true,subtree:true});setTimeout(()=>render(true),1300);
