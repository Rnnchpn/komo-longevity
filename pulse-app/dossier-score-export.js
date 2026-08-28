import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const REQUIRED=['KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'];
const ALG='motion-functional-index-v0.5.1-poc';
let client=null,busy=false,lastDossier=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}))}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function toast(m){const t=document.querySelector('#toast');if(!t)return;t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,4200)}
function patientId(){return new URLSearchParams(location.search).get('patient')||''}
function safe(v){return String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,70)||'patient'}
function pname(p){return `${p?.preferred_name||p?.first_name||''} ${p?.last_name||''}`.trim()||p?.external_reference||'patient'}
function csvCell(v){const s=String(v??'');return /[;"\n\r]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}

async function load(){const id=patientId();if(!id)throw new Error('Patient non sélectionné.');const q=await sb().rpc('komo_professional_patient_dossier',{p_patient_id:id});if(q.error)throw q.error;lastDossier=q.data;return q.data}

function readiness(d){
 const qs=d?.questionnaires||[];
 const completed=REQUIRED.filter(code=>qs.some(q=>q.instrument_code===code&&q.status==='completed'&&Number(q.completeness||0)>=100));
 const mobility=qs.find(q=>q.instrument_code==='KOMO_MOBILITY_25'&&q.status==='completed'&&Number(q.completeness||0)>=100&&n(q.score)!=null);
 const sva=(d?.measurements||[]).find(m=>m.indicator_code==='M-POS-02'&&m.qc_status==='valid'&&n(m.numeric_value)!=null);
 const accepted=(d?.myocare_imports||[]).filter(i=>i.status==='accepted');
 const acceptedIds=new Set(accepted.map(i=>i.id));
 const mm=(d?.myodev_metrics||[]).filter(m=>m.qc_status==='valid'&&(!m.myodev_import_id||acceptedIds.size===0||acceptedIds.has(m.myodev_import_id)));
 const activation=mm.filter(m=>m.metric_code==='activation_pctMVC');
 const symmetry=mm.filter(m=>['LSI_pct','asymmetry_pct'].includes(m.metric_code));
 const calibrated=activation.filter(m=>m.calibration_id);
 const context=(d?.motion?.context_class||d?.score?.context_class||'');
 const missing=[];
 if(completed.length<REQUIRED.length)missing.push(`Pré-bilan KŌMØ : ${completed.length}/6 sections complétées`);
 if(!mobility)missing.push('Questionnaire Mobilité KŌMØ terminé avec score');
 if(!sva)missing.push('SVA enregistrée et validée');
 if(!accepted.length)missing.push('Import MyoCare accepté');
 if(!activation.length)missing.push('Activation musculaire %MVC valide');
 if(!symmetry.length)missing.push('Symétrie LSI / asymétrie valide');
 if(!calibrated.length)missing.push('Calibration MVC associée à l’activation');
 if(context==='D')missing.push('Contexte de mesure non calculable (D)');
 return{ready:missing.length===0,missing,completed:completed.length,mobility,sva,accepted:accepted.length,metricCount:(d?.myodev_metrics||[]).length,activation:activation.length,symmetry:symmetry.length,calibrated:calibrated.length};
}

function injectStyle(){if(document.querySelector('#scoreExportStyle'))return;const s=document.createElement('style');s.id='scoreExportStyle';s.textContent=`
.kse{margin-top:16px;background:#fff;border:1px solid var(--line);border-radius:24px;padding:22px}.kse-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.kse h2{margin:6px 0 5px;font:600 22px/1.15 Manrope,sans-serif;letter-spacing:-.03em}.kse p{margin:0;color:var(--muted);font-size:10px;line-height:1.55}.kse-badge{padding:7px 10px;border-radius:999px;background:#edf3eb;color:#35503d;font-size:9px;font-weight:800;white-space:nowrap}.kse-badge.warn{background:#fff2df;color:#805d29}.kse-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:16px}.kse-kpi{padding:13px;border-radius:15px;background:#f5f2eb}.kse-kpi span,.kse-kpi strong{display:block}.kse-kpi span{font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}.kse-kpi strong{margin-top:5px;font-size:15px}.kse-missing{margin-top:13px;padding:12px 13px;border-radius:14px;background:#fff5e8;color:#755735;font-size:10px;line-height:1.55}.kse-missing b{display:block;margin-bottom:4px}.kse-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.kse-btn{border:1px solid #d8d4cc;background:#fff;color:var(--ink);border-radius:12px;padding:10px 13px;font:700 10px DM Sans,sans-serif;cursor:pointer}.kse-btn.primary{background:var(--green);border-color:var(--green);color:#fff}.kse-btn:disabled{opacity:.42;cursor:not-allowed}.kse-formula{margin-top:12px;padding-top:11px;border-top:1px solid #eeeae3;color:var(--muted);font-size:9px;line-height:1.55}.kse-formula b{color:var(--ink)}
@media(max-width:780px){.kse-head{display:block}.kse-badge{display:inline-flex;margin-top:10px}.kse-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.kse-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}

function html(d){const r=readiness(d),s=d?.score||{},score=s.algorithm_version===ALG?n(s.motion_score):null;return `<section class="kse" id="komoScoreWorkflow"><div class="kse-head"><div><p class="eyebrow">KŌMØ MOTION SCORE · v0.5.1</p><h2>Calculer puis exporter le bilan.</h2><p>Pulse vérifie d’abord le pré-bilan, la posture et l’acquisition MyoCare avant de produire un score. Aucun élément manquant n’est remplacé automatiquement.</p></div><span class="kse-badge ${r.ready?'':'warn'}">${r.ready?'Prêt à calculer':`${r.missing.length} prérequis à compléter`}</span></div><div class="kse-grid"><div class="kse-kpi"><span>Pré-bilan</span><strong>${r.completed}/6</strong></div><div class="kse-kpi"><span>MyoCare</span><strong>${r.accepted} import · ${r.metricCount} métriques</strong></div><div class="kse-kpi"><span>Posture SVA</span><strong>${r.sva?`${Math.round(Number(r.sva.numeric_value))} mm`:'—'}</strong></div><div class="kse-kpi"><span>Score actuel</span><strong>${score==null?'Non calculé':`${score.toFixed(1)}/100`}</strong></div></div>${r.missing.length?`<div class="kse-missing"><b>Avant le score final :</b>${r.missing.map(x=>`• ${esc(x)}`).join('<br>')}</div>`:''}<div class="kse-actions"><button class="kse-btn primary" id="kseCalc" ${r.ready&&!busy?'':'disabled'}>${busy?'Calcul en cours…':'Calculer le KŌMØ Motion Score'}</button><button class="kse-btn" id="ksePdf">Exporter le rapport PDF patient</button><button class="kse-btn" id="kseCsv">Exporter toutes les données CSV</button></div><div class="kse-formula"><b>Formule POC actuelle :</b> 60 % Mobilité KŌMØ + 40 % Symétrie MyoCare. L’activation et la calibration sécurisent l’acquisition ; la SVA est obligatoire mais descriptive. Le CCI n’est pas inventé lorsqu’il n’est pas fourni par MyoCare.</div></section>`}

function exportCsv(d){const rows=[['Catégorie','Sous-type','Code','Libellé / tâche','Muscle','Côté','Valeur','Unité','QC / statut','Complétude','Calibration / version']];
 for(const q of d?.questionnaires||[])rows.push(['Questionnaire','Section',q.instrument_code,q.instrument_code,'','',q.score??'','/100',q.status||'',q.completeness??'',q.version||'']);
 for(const m of d?.measurements||[])rows.push(['Clinique','Mesure',m.indicator_code,m.source||'','','',m.numeric_value??m.text_value??'',m.unit||'',m.qc_status||'','','']);
 for(const m of d?.myodev_metrics||[])rows.push(['MyoCare','Métrique',m.metric_code,m.task_code||'',m.muscle_code||'',m.side||'',m.value??'',m.unit||'',m.qc_status||'','',m.calibration_id||m.protocol_version||'']);
 const s=d?.score||{};rows.push(['Score','KŌMØ Motion',s.algorithm_version||ALG,'Motion Score','','',s.motion_score??'','/100',s.status||'',s.completeness??'',s.release_status||'']);
 const csv='\uFEFF'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`KOMO_Resultats_${safe(pname(d?.patient))}_${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);toast('Données complètes exportées en CSV.');}

async function calculate(){if(busy)return;busy=true;await render();try{const d=lastDossier||await load(),r=readiness(d);if(!r.ready)throw new Error('Le bilan n’est pas encore complet.');const out=await sb().rpc('calculate_motion_v05',{p_assessment_id:d.motion.id});if(out.error)throw out.error;toast(out.data?.motion_score==null?'Calcul effectué : le bilan reste incomplet.':`KŌMØ Motion Score : ${Number(out.data.motion_score).toFixed(1)}/100`);setTimeout(()=>location.reload(),650)}catch(e){console.error('[dossier score]',e);toast(`Calcul impossible : ${e.message||e}`)}finally{busy=false}}

function bind(){document.querySelector('#kseCalc')?.addEventListener('click',calculate);document.querySelector('#ksePdf')?.addEventListener('click',()=>{const b=document.querySelector('#pdfBtn');if(b)b.click();else toast('Export PDF indisponible sur cette vue.');});document.querySelector('#kseCsv')?.addEventListener('click',()=>lastDossier&&exportCsv(lastDossier))}

async function render(){injectStyle();try{const d=await load();let box=document.querySelector('#komoScoreWorkflow');const wrapper=document.createElement('div');wrapper.innerHTML=html(d);const next=wrapper.firstElementChild;if(box)box.replaceWith(next);else{const hero=document.querySelector('.hero');if(hero)hero.insertAdjacentElement('afterend',next);else return}bind()}catch(e){console.error('[dossier score render]',e)}}

window.addEventListener('komo:myocare-imported',()=>setTimeout(render,200));window.addEventListener('pageshow',()=>setTimeout(render,350));document.addEventListener('DOMContentLoaded',()=>setTimeout(render,650));setTimeout(render,1300);
window.KomoDossierScoreExport={version:'canonical-1',algorithm:ALG,refresh:render};
