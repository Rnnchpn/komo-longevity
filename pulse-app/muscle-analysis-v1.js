import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const K={patient:'komo_clinical_patient',assessment:'komo_clinical_assessment'};
const LABELS={VL:'Quadriceps · vaste latéral',BF:'Ischio-jambiers · biceps fémoral',GM:'Mollet · gastrocnémien'};
let client=null,timer=null,busy=false,lastAssessment='';

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmt(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)}
function mean(rows){const a=rows.map(x=>Number(x.value)).filter(Number.isFinite);return a.length?a.reduce((sum,x)=>sum+x,0)/a.length:null}
function active(){return location.hash==='#clinical'&&document.querySelector('[data-kcp-tab="myocare"]')?.classList.contains('active')}
function validRows(rows){const valid=rows.filter(x=>x.qc_status==='valid');return valid.length?valid:rows.filter(x=>!['invalid','missing'].includes(x.qc_status))}
function metric(rows,code,muscle='',side=''){return validRows(rows.filter(x=>x.metric_code===code&&(!muscle||x.muscle_code===muscle)&&(!side||x.side===side)))}
function pct(v,digits=0){return v==null?'—':`${Number(v).toFixed(digits)} %`}

function ensureLabels(){
  const cockpit=document.querySelector('[data-kcp-tab="myocare"]');
  if(cockpit&&cockpit.textContent.trim()!=='Analyse musculaire')cockpit.textContent='Analyse musculaire';
  document.querySelectorAll('[data-pro-nav="myocare"]').forEach(b=>{const span=b.querySelector('span');if(span&&span.textContent!=='Analyse musculaire')span.textContent='Analyse musculaire';b.setAttribute('aria-label','Analyse musculaire')});
  document.querySelectorAll('.kcp-todo-item strong').forEach(x=>{if(x.textContent.trim()==='MyoCare')x.textContent='Analyse musculaire'});
}

function styles(){if(document.querySelector('#kmaStyle'))return;const node=document.createElement('style');node.id='kmaStyle';node.textContent=`
.kma{display:grid;gap:14px}.kma-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.3fr) auto;gap:24px;align-items:end;padding:25px 26px;border-radius:25px;background:linear-gradient(132deg,#26362d,#35483c);color:#fff}.kma-hero:after{content:"";position:absolute;right:-70px;top:-130px;width:280px;height:280px;border:1px solid rgba(255,255,255,.09);border-radius:50%}.kma-hero .eyebrow{color:rgba(255,255,255,.54)}.kma-hero h3{margin:6px 0 7px;font-size:28px;line-height:1.05;letter-spacing:-.04em;color:#fff}.kma-hero p{margin:0;max-width:720px;font-size:10px;line-height:1.55;color:rgba(255,255,255,.68)}.kma-source{position:relative;z-index:1;display:grid;gap:6px;min-width:220px;padding:14px 16px;border:1px solid rgba(255,255,255,.13);border-radius:17px;background:rgba(255,255,255,.05)}.kma-source span{font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5);font-weight:800}.kma-source strong{font-size:13px}.kma-source small{font-size:8px;color:rgba(255,255,255,.56)}.kma-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.kma-kpi{padding:16px 17px;border:1px solid #e5e1d9;border-radius:19px;background:#fff}.kma-kpi span{display:block;font-size:8px;letter-spacing:.09em;text-transform:uppercase;color:#7a837c;font-weight:800}.kma-kpi strong{display:block;margin:8px 0 3px;font-size:24px;letter-spacing:-.035em;color:#27342c}.kma-kpi small{display:block;font-size:8px;line-height:1.35;color:#8a918c}.kma-kpi.good{background:#eef4ee}.kma-kpi.warn{background:#f6f0e3}.kma-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.8fr);gap:12px}.kma-card{padding:20px 21px;border:1px solid #e3dfd7;border-radius:23px;background:#fff}.kma-card h4{margin:4px 0 5px;font-size:18px;letter-spacing:-.025em;color:#2d3931}.kma-card>p{margin:0 0 15px;color:#7b827d;font-size:9px;line-height:1.5}.kma-muscles{display:grid;gap:9px}.kma-muscle{display:grid;grid-template-columns:minmax(150px,1fr) 1fr 1fr;gap:10px;align-items:center;padding:13px 14px;border-radius:16px;background:#f7f4ee}.kma-muscle>strong{font-size:10px;color:#334139}.kma-side span{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;font-size:8px;color:#7d857f}.kma-side span b{font-size:10px;color:#344139}.kma-bar{height:6px;border-radius:999px;background:#e4e1da;overflow:hidden}.kma-bar i{display:block;height:100%;border-radius:inherit;background:#66796b}.kma-note{margin-top:12px;padding:11px 12px;border-radius:14px;background:#f1eee7;color:#707973;font-size:8px;line-height:1.45}.kma-list{display:grid;gap:8px}.kma-row{padding:11px 12px;border:1px solid #ebe7df;border-radius:14px}.kma-row strong{display:block;font-size:9px;color:#354139}.kma-row span{display:block;margin-top:4px;font-size:8px;color:#7c847e}.kma-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.kma-btn{border:1px solid #d8d5ce;border-radius:12px;background:#fff;color:#334038;padding:10px 12px;font:inherit;font-size:9px;font-weight:800;cursor:pointer}.kma-btn.primary{border-color:#293a30;background:#293a30;color:#fff}.kma-empty{padding:28px;border:1px dashed #d9d5cd;border-radius:20px;background:#faf8f4;text-align:center}.kma-empty strong{display:block;font-size:15px;color:#334038}.kma-empty p{margin:6px auto 14px;max-width:520px;font-size:9px;line-height:1.5;color:#7a827c}@media(max-width:950px){.kma-kpis{grid-template-columns:1fr 1fr}.kma-grid{grid-template-columns:1fr}.kma-hero{grid-template-columns:1fr}.kma-source{min-width:0}}@media(max-width:620px){.kma-kpis{grid-template-columns:1fr 1fr}.kma-muscle{grid-template-columns:1fr}.kma-hero{padding:21px}.kma-hero h3{font-size:24px}}`;
  document.head.appendChild(node);
}

async function resolveAssessment(){
  const stored=localStorage.getItem(K.assessment)||'';
  if(stored)return stored;
  const patientId=localStorage.getItem(K.patient)||'';
  if(!patientId)return'';
  const r=await sb().from('assessments').select('id').eq('patient_id',patientId).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(r.error)throw r.error;
  if(r.data?.id)localStorage.setItem(K.assessment,r.data.id);
  return r.data?.id||'';
}

async function read(assessmentId){
  const c=sb();
  const [metrics,imports]=await Promise.all([
    c.from('myodev_metrics').select('metric_code,value,unit,muscle_code,side,qc_status,qc_reason,task_code,created_at,calibration_id').eq('assessment_id',assessmentId).order('created_at',{ascending:false}).limit(1500),
    c.from('myodev_imports').select('id,source_file_name,external_session_id,source_product,source_version,status,approved_at,recorded_at,contract_version,created_at').eq('assessment_id',assessmentId).order('created_at',{ascending:false}).limit(20)
  ]);
  if(metrics.error)throw metrics.error;
  if(imports.error)throw imports.error;
  return{metrics:metrics.data||[],imports:imports.data||[]};
}

function muscleRows(rows){
  const activation=validRows(rows.filter(x=>x.metric_code==='activation_pctMVC'&&['VL','BF','GM'].includes(x.muscle_code)));
  const max=Math.max(1,...activation.map(x=>Number(x.value)||0));
  return ['VL','BF','GM'].map(m=>{const left=mean(metric(rows,'activation_pctMVC',m,'left')),right=mean(metric(rows,'activation_pctMVC',m,'right'));const lw=left==null?0:Math.min(100,left/max*100),rw=right==null?0:Math.min(100,right/max*100);return`<div class="kma-muscle"><strong>${esc(LABELS[m])}</strong><div class="kma-side"><span><em>Gauche</em><b>${left==null?'—':`${left.toFixed(1)} %MVC`}</b></span><div class="kma-bar"><i style="width:${lw.toFixed(1)}%"></i></div></div><div class="kma-side"><span><em>Droite</em><b>${right==null?'—':`${right.toFixed(1)} %MVC`}</b></span><div class="kma-bar"><i style="width:${rw.toFixed(1)}%"></i></div></div></div>`}).join('');
}

function view(data,assessmentId){
  const rows=data.metrics,imports=data.imports,latest=imports[0]||null;
  const lsi=mean(metric(rows,'LSI_pct')),cci=mean(metric(rows,'CCI_pct')),activation=mean(metric(rows,'activation_pctMVC'));
  const valid=rows.filter(x=>x.qc_status==='valid').length,suspect=rows.filter(x=>x.qc_status==='suspect').length,invalid=rows.filter(x=>['invalid','missing'].includes(x.qc_status)).length;
  const calibrated=rows.some(x=>x.calibration_id)||rows.some(x=>x.metric_code==='MVC_value');
  if(!rows.length&&!imports.length)return`<section class="kma" data-kma="${esc(assessmentId)}"><div class="kma-hero"><div><p class="eyebrow">KŌMØ MOTION · ANALYSE MUSCULAIRE</p><h3>Analyse musculaire</h3><p>Lecture des acquisitions des six capteurs Myodev : activation, symétrie gauche/droite et contrôle qualité.</p></div><div class="kma-source"><span>ÉTAT</span><strong>Aucune acquisition importée</strong><small>MyoCare est la source technique ; Pulse porte l’interprétation du bilan.</small></div></div><div class="kma-empty"><strong>Données musculaires non disponibles.</strong><p>Réalisez l’acquisition Myodev puis importez l’export dans le bilan Motion actif.</p><button class="kma-btn primary" data-kma-import>Importer les données musculaires →</button></div></section>`;
  return`<section class="kma" data-kma="${esc(assessmentId)}"><div class="kma-hero"><div><p class="eyebrow">KŌMØ MOTION · ANALYSE MUSCULAIRE</p><h3>Activation, symétrie et qualité du signal.</h3><p>Vue clinique des données musculaires acquises avec les capteurs Myodev. Les mesures restent descriptives lorsqu’aucun référentiel validé n’est associé.</p></div><div class="kma-source"><span>SOURCE TECHNIQUE</span><strong>Myodev</strong><small>${latest?`${esc(latest.source_product||'MyoCare')} ${esc(latest.source_version||'')} · ${fmt(latest.recorded_at||latest.created_at)}`:'Provenance non renseignée'}</small></div></div><div class="kma-kpis"><article class="kma-kpi"><span>Symétrie musculaire</span><strong>${pct(lsi,0)}</strong><small>LSI moyen disponible pour la session.</small></article><article class="kma-kpi"><span>Activation moyenne</span><strong>${activation==null?'—':`${activation.toFixed(1)} %MVC`}</strong><small>Dépend de la tâche et de la calibration.</small></article><article class="kma-kpi ${cci==null?'warn':''}"><span>Coactivation CCI</span><strong>${cci==null?'Non disponible':pct(cci,1)}</strong><small>${cci==null?'Absente de cet export.':'Mesure descriptive, sans seuil automatique.'}</small></article><article class="kma-kpi ${invalid?'warn':'good'}"><span>Qualité des données</span><strong>${valid}/${rows.length}</strong><small>${suspect} suspecte${suspect>1?'s':''} · ${invalid} invalide${invalid>1?'s':''} · ${calibrated?'calibration détectée':'calibration à vérifier'}</small></article></div><div class="kma-grid"><article class="kma-card"><p class="eyebrow">PROFIL GAUCHE / DROITE</p><h4>Activation musculaire par groupe</h4><p>Comparaison intra-session des principaux groupes musculaires instrumentés.</p><div class="kma-muscles">${muscleRows(rows)}</div><div class="kma-note">Les barres facilitent la lecture de l’asymétrie intra-session ; elles ne représentent pas à elles seules une norme populationnelle.</div></article><article class="kma-card"><p class="eyebrow">PROVENANCE & QC</p><h4>Acquisitions enregistrées</h4><p>Traçabilité des imports et du contrat de normalisation.</p><div class="kma-list">${imports.length?imports.slice(0,5).map(i=>`<div class="kma-row"><strong>${esc(i.source_file_name||i.external_session_id||'Acquisition')}</strong><span>${fmt(i.recorded_at||i.created_at)} · ${esc(i.contract_version||'contrat non renseigné')} · ${esc(i.status||'—')}</span></div>`).join(''):'<div class="kma-row"><strong>Métriques sans fichier source associé</strong><span>La provenance d’import n’est pas disponible.</span></div>'}</div><div class="kma-actions"><button class="kma-btn primary" data-kma-import>Importer / mettre à jour</button><button class="kma-btn" data-kma-motion>Retour au bilan Motion</button></div></article></div></section>`;
}

function bind(host){
  host.querySelector('[data-kma-import]')?.addEventListener('click',()=>{document.querySelector('[data-kcp-tab="motion"]')?.click();setTimeout(()=>document.querySelector('#clmImporter')?.scrollIntoView({behavior:'smooth',block:'center'}),420)});
  host.querySelector('[data-kma-motion]')?.addEventListener('click',()=>document.querySelector('[data-kcp-tab="motion"]')?.click());
}

async function mount(){
  ensureLabels();
  if(!active()||busy)return;
  const host=document.querySelector('#kcpView');if(!host)return;
  busy=true;
  try{
    styles();
    const assessmentId=await resolveAssessment();
    if(!assessmentId){host.innerHTML='<div class="kma-empty"><strong>Sélectionnez un patient avec un bilan Motion.</strong><p>L’analyse musculaire est rattachée à un épisode Motion précis.</p></div>';return}
    if(host.querySelector(`[data-kma="${CSS.escape(assessmentId)}"]`)&&lastAssessment===assessmentId)return;
    host.innerHTML='<div class="kma-empty"><strong>Chargement de l’analyse musculaire…</strong></div>';
    const data=await read(assessmentId);
    if(!active())return;
    host.innerHTML=view(data,assessmentId);lastAssessment=assessmentId;bind(host);
  }catch(e){console.error('[muscle-analysis]',e);host.innerHTML=`<div class="kma-empty"><strong>Analyse musculaire indisponible.</strong><p>${esc(e.message||'Impossible de charger les données.')}</p></div>`}finally{busy=false}
}
function schedule(){clearTimeout(timer);timer=setTimeout(mount,100)}

window.addEventListener('hashchange',schedule);
window.addEventListener('komo:clinical-patient-changed',()=>{lastAssessment='';schedule()});
window.addEventListener('komo:clinical-assessment-changed',()=>{lastAssessment='';schedule()});
window.addEventListener('komo:myocare-imported',()=>{lastAssessment='';schedule()});
document.addEventListener('click',e=>{if(e.target.closest('[data-kcp-tab="myocare"],[data-pro-nav="myocare"]'))setTimeout(schedule,40)});
const obs=new MutationObserver(()=>{ensureLabels();if(active()&&!document.querySelector('[data-kma]'))schedule()});
obs.observe(document.body,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,900));
setTimeout(schedule,1400);
