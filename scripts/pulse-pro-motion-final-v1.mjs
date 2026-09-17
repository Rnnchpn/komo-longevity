import { readFile, writeFile } from 'node:fs/promises';

const root='site/pulse-v12/';
const reportPath=root+'canonical-report-export-v3.js';
const clinicalPath=root+'clinical-motion-v1.js';
const clinicalCssPath=root+'clinical-motion-v1.css';
const motionWorkflowPath=root+'motion-workflow.js';
const importPath=root+'myocare-import.js';
const authWebCssPath=root+'auth-web-v1.css';
const adaptiveCssPath=root+'adaptive-shell-v4.css';

/* 1. Patient-scoped PDF export for the professional workspace */
let report=await readFile(reportPath,'utf8');
const reportOld=`function fallbackPractitioner(result){return String(result?.dossier?.clinical?.practitioner_name||result?.dossier?.practitioner?.display_name||'Professionnel KŌMØ')}
async function officialSnapshot(){try{const s=await loadReportSnapshot({force:true});return s?.status==='released'&&s?.payload?.schemaVersion===SCHEMA_VERSION?s:null}catch{return null}}
async function currentPayload(){const result=await loadCanonicalResult({force:true});const payload=buildReportPayload(result,{practitionerName:fallbackPractitioner(result),centerName:result?.dossier?.patient?.organization_name||'KŌMØ'});const check=validateReportPayload(payload);if(!check.ok)throw new Error(\`Rapport Motion incomplet : \${check.errors.join(', ')}\`);return payload}
export async function exportCanonicalMobilityReport({button=null}={}){if(busy)return;busy=true;const old=button?.textContent;try{if(button){button.disabled=true;button.textContent='Préparation du Motion Report…'}const snapshot=await officialSnapshot();if(snapshot){await downloadMobilityReport(snapshot.payload,{draft:false});toast(\`Motion Report officiel v\${snapshot.version} téléchargé.\`);return}const payload=await currentPayload();await downloadMobilityReport(payload,{draft:true});toast('Motion Report actualisé téléchargé en aperçu.')}catch(e){console.error('[canonical-report-export-v3]',e);toast(\`Export impossible : \${e?.message||e}\`);throw e}finally{busy=false;if(button){button.disabled=false;button.textContent=old||'Télécharger le Motion Report'}}}`;

const reportNew=`function fallbackPractitioner(result){return String(result?.dossier?.clinical?.practitioner_name||result?.dossier?.practitioner?.display_name||'Professionnel KŌMØ')}
function professionalPatientId(button){
  if(!button?.closest?.('[data-clinical-motion-v1]'))return null;
  const id=String(localStorage.getItem('komo_clinical_patient')||'').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)?id:null;
}
async function officialSnapshot(patientId=null){try{const s=await loadReportSnapshot({patientId,force:true});return s?.status==='released'&&s?.payload?.schemaVersion===SCHEMA_VERSION?s:null}catch{return null}}
async function currentPayload(patientId=null){const result=await loadCanonicalResult({patientId,force:true});const payload=buildReportPayload(result,{practitionerName:fallbackPractitioner(result),centerName:result?.dossier?.patient?.organization_name||'KŌMØ'});const check=validateReportPayload(payload);if(!check.ok)throw new Error(\`Rapport Motion incomplet : \${check.errors.join(', ')}\`);return payload}
export async function exportCanonicalMobilityReport({button=null,patientId=null}={}){if(busy)return;busy=true;const old=button?.textContent,targetPatientId=patientId||professionalPatientId(button);try{if(button){button.disabled=true;button.textContent='Préparation du Motion Report…'}const snapshot=await officialSnapshot(targetPatientId);if(snapshot){await downloadMobilityReport(snapshot.payload,{draft:false});toast(\`Motion Report officiel v\${snapshot.version} téléchargé.\`);return}const payload=await currentPayload(targetPatientId);await downloadMobilityReport(payload,{draft:true});toast(targetPatientId?'Motion Report du patient sélectionné téléchargé.':'Motion Report actualisé téléchargé en aperçu.')}catch(e){console.error('[canonical-report-export-v3]',e);toast(\`Export impossible : \${e?.message||e}\`);throw e}finally{busy=false;if(button){button.disabled=false;button.textContent=old||'Télécharger le Motion Report'}}}`;

if(!report.includes(reportOld))throw new Error('[pulse-pro-motion-final] report exporter anchor missing');
report=report.replace(reportOld,reportNew);
await writeFile(reportPath,report,'utf8');

/* 2. Clinical Motion becomes a linear operator workflow */
let clinical=await readFile(clinicalPath,'utf8');

const flowOld=`function flow(p,a,imp,s){
  const q=completedQuestionnaires();
  return\`<div class="clm-flow">\${[
    ['01','Patient',p?'sélectionné':'à sélectionner'],
    ['02','Pré-bilan',a?\`\${q}/6 complété\${q>1?'s':''}\`:'en attente'],
    ['03','Myodev',imp?imp.status:'à importer'],
    ['04','Motion Score',s?.motion_score!=null?\`\${Math.round(Number(s.motion_score))}/100\`:'en attente'],
    ['05','Publication',s?.release_status==='released'?'publié':'à valider']
  ].map(x=>\`<div class="clm-flow-step"><i>\${x[0]}</i><div><strong>\${x[1]}</strong><span>\${esc(x[2])}</span></div></div>\`).join('')}</div>\`;
}`;

const flowNew=`function flow(p,a,imp,s){
  const accepted=st.imports.some(x=>x.status==='accepted');
  const scored=s?.motion_score!=null;
  const reviewed=['clinician_reviewed','released'].includes(s?.release_status);
  const released=s?.release_status==='released';
  const steps=[
    ['01','Patient',p?'sélectionné':'à sélectionner',!!p],
    ['02','Acquisition',accepted?'données acceptées':'à importer',accepted],
    ['03','Motion Score',scored?\`\${Math.round(Number(s.motion_score))}/100\`:'à calculer',scored],
    ['04','Validation',released?'publié':reviewed?'revu':'à revoir',released],
    ['05','Rapport',released?'PDF disponible':'après validation',false]
  ];
  const firstPending=steps.findIndex(x=>!x[3]);
  return\`<div class="clm-flow">\${steps.map((x,i)=>\`<div class="clm-flow-step \${x[3]?'done':i===firstPending?'current':''}"><i>\${x[0]}</i><div><strong>\${x[1]}</strong><span>\${esc(x[2])}</span></div></div>\`).join('')}</div>\`;
}`;

if(!clinical.includes(flowOld))throw new Error('[pulse-pro-motion-final] flow anchor missing');
clinical=clinical.replace(flowOld,flowNew);

const guide=`
function workflowGuide(p,a,imp,s){
  const accepted=st.imports.some(x=>x.status==='accepted');
  const validMuscles=[...new Set(st.metrics.filter(x=>x.metric_code==='LSI_pct'&&String(x.qc_status).toLowerCase()==='valid'&&Number(x.value)>=0&&Number(x.value)<=100).map(x=>x.muscle_code).filter(Boolean))];
  let step='Patient',title='Sélectionner le patient',text='Choisissez le dossier avant de commencer le bilan Motion.',action='patient',cta='Choisir le patient';
  if(p&&!a){step='Bilan Motion';title='Choisir une consultation Motion';text='Sélectionnez le bilan à utiliser pour cette acquisition.',action='assessment',cta='Choisir le bilan'}
  else if(p&&a&&['scheduled','created'].includes(a.status)){step='Consultation';title='Démarrer la consultation';text='Le patient et le bilan sont prêts. Démarrez la session avant l’acquisition.',action='start',cta='Démarrer la consultation'}
  else if(p&&a&&!accepted){step='Acquisition';title='Importer les données Motion';text='Déposez l’export MyoCare / Myodev. Pulse contrôlera les données puis calculera automatiquement le score.',action='import',cta='Importer le fichier'}
  else if(p&&a&&accepted&&validMuscles.length<3){step='Acquisition';title='Compléter l’acquisition capteur';text=\`\${validMuscles.length}/3 groupes musculaires avec LSI valide. Il faut quadriceps, ischio-jambiers et mollets avant le score.\`;action='import';cta='Ajouter un nouvel export'}
  else if(p&&a&&accepted&&(!s||s.motion_score==null)){step='Score';title='Calculer le Motion Score';text='Les prérequis capteurs sont complets. Lancez le calcul sensor-only v0.6.',action='score',cta='Calculer le Motion Score'}
  else if(s?.release_status==='draft'){step='Validation';title='Revoir le score';text='Le score est calculé. Vérifiez le résultat et sa qualité avant publication.',action='review',cta='Revoir et valider le score'}
  else if(s?.release_status==='clinician_reviewed'){step='Validation';title='Publier le résultat';text='La revue professionnelle est terminée. Publiez maintenant le résultat au patient.',action='release',cta='Publier au patient'}
  else if(s?.release_status==='released'){step='Rapport';title='Bilan terminé';text='Le résultat est publié. Vous pouvez télécharger le Motion Report PDF du patient sélectionné.',action='pdf',cta='Télécharger le Motion Report PDF'}
  return\`<section class="clm-next" data-pro-motion-next><div><div class="clm-next-kicker">PROCHAINE ACTION · \${esc(step)}</div><h3>\${esc(title)}</h3><p>\${esc(text)}</p></div><button class="clm-btn primary clm-next-cta" type="button" data-pro-motion-next-action="\${action}">\${esc(cta)} →</button></section>\`;
}
function runWorkflowAction(e){
  const action=e.currentTarget.dataset.proMotionNextAction;
  const click=s=>document.querySelector(s)?.click();
  const reveal=s=>{const el=document.querySelector(s);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});return el};
  if(action==='patient'){const el=reveal('#clmPatient');el?.focus();return}
  if(action==='assessment'){const el=reveal('#clmAssessment');el?.focus();return}
  if(action==='start'){click('[data-action="start-consultation"]');return}
  if(action==='import'){const el=reveal('#clmImporter');setTimeout(()=>document.querySelector('#clmFile')?.click(),220);return}
  if(action==='score'){const el=reveal('[data-motion-workflow]');setTimeout(()=>el?.querySelector('[data-kmw-calc]')?.click(),220);return}
  if(action==='review'){const el=reveal('[data-motion-workflow]');setTimeout(()=>el?.querySelector('[data-kmw-review]')?.click(),220);return}
  if(action==='release'){const el=reveal('[data-motion-workflow]');setTimeout(()=>el?.querySelector('[data-kmw-release]')?.click(),220);return}
  if(action==='pdf'){const el=reveal('.clm-score-shell');setTimeout(()=>document.querySelector('[data-clinical-motion-v1] [data-komo-export-report]')?.click(),220)}
}
`;

const renderAnchor='\nfunction render(){';
if(!clinical.includes(renderAnchor))throw new Error('[pulse-pro-motion-final] render anchor missing');
clinical=clinical.replace(renderAnchor,guide+renderAnchor);

const renderOld='${flow(p,a,imp,s)}${patientBlock(p,a)}';
const renderNew='${flow(p,a,imp,s)}${workflowGuide(p,a,imp,s)}${patientBlock(p,a)}';
if(!clinical.includes(renderOld))throw new Error('[pulse-pro-motion-final] render composition anchor missing');
clinical=clinical.replace(renderOld,renderNew);

const bindOld=`  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',action));
}`;
const bindNew=`  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',action));
  document.querySelector('[data-pro-motion-next-action]')?.addEventListener('click',runWorkflowAction);
}`;
if(!clinical.includes(bindOld))throw new Error('[pulse-pro-motion-final] bind anchor missing');
clinical=clinical.replace(bindOld,bindNew);

const clinicalOld=`<p>Le score synthétise uniquement la symétrie neuromusculaire issue des données Myodev validées.</p></div></article>`;
const clinicalNew=`<p>Le score synthétise uniquement la symétrie neuromusculaire issue des données Myodev validées.</p>\${s.motion_score!=null?'<div class="clm-actions"><button class="clm-btn primary" type="button" data-komo-export-report>Exporter le Motion Report PDF</button></div>':''}</div></article>`;
if(!clinical.includes(clinicalOld))throw new Error('[pulse-pro-motion-final] clinical score anchor missing');
clinical=clinical.replace(clinicalOld,clinicalNew);

await writeFile(clinicalPath,clinical,'utf8');

/* 3. Operator styling — compact, readable on iPad */
let css=await readFile(clinicalCssPath,'utf8');
const cssAddon=`
.clm-flow-step.done{background:var(--sage-soft);border-color:rgba(89,103,93,.18)}
.clm-flow-step.done i{background:#202820;color:#fff}
.clm-flow-step.current{border-color:#59675d;box-shadow:0 0 0 2px rgba(89,103,93,.08)}
.clm-next{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;padding:20px 22px;border:1px solid rgba(89,103,93,.18);border-radius:22px;background:linear-gradient(145deg,#f8f6f0,#eef2ec)}
.clm-next-kicker{font-size:8px;font-weight:800;letter-spacing:.13em;color:var(--sage-deep);text-transform:uppercase}
.clm-next h3{margin:6px 0 5px;font-size:19px;font-weight:500;letter-spacing:-.025em}
.clm-next p{margin:0;color:var(--muted);font-size:10px;line-height:1.55;max-width:760px}
.clm-next-cta{min-width:220px;margin:0}
@media(max-width:767px){.clm-next{grid-template-columns:1fr;padding:17px}.clm-next-cta{width:100%;min-width:0}.clm-flow-step.current{grid-column:1/-1}}
`;
if(!css.includes('.clm-next{'))css+=cssAddon;
await writeFile(clinicalCssPath,css,'utf8');

/* 4. Review / release language and automatic hand-off to next step */
let motion=await readFile(motionWorkflowPath,'utf8');
motion=motion
  .replace('<button class="kmw-btn" data-kmw-review>Revoir le score</button>','<button class="kmw-btn primary" data-kmw-review>Revoir et valider le score</button>')
  .replace('<button class="kmw-btn primary" data-kmw-release>Publier au patient</button>','<button class="kmw-btn primary" data-kmw-release>Publier au patient</button>');
const reviewOld=`async function review(id,action){const r=await sb().rpc('review_pulse_motion_score',{target_score_id:id,review_action:action});if(r.error)return toast(r.error.message);toast(action==='review'?'Score revu.':'Score publié au patient.');await mount();window.dispatchEvent(new CustomEvent('komo:canonical-result-invalidated'))}`;
const reviewNew=`async function review(id,action){const r=await sb().rpc('review_pulse_motion_score',{target_score_id:id,review_action:action});if(r.error)return toast(r.error.message);toast(action==='review'?'Score revu. Vous pouvez maintenant le publier.':'Score publié au patient. Le Motion Report est prêt.');await mount();window.dispatchEvent(new CustomEvent('komo:canonical-result-invalidated'));setTimeout(()=>document.querySelector('[data-pro-motion-next]')?.scrollIntoView({behavior:'smooth',block:'center'}),260)}`;
if(!motion.includes(reviewOld))throw new Error('[pulse-pro-motion-final] review anchor missing');
motion=motion.replace(reviewOld,reviewNew);
const calcOld=`async function calculate(id){if(busy)return;busy=true;await mount();const r=await sb().rpc('calculate_motion_v06',{p_assessment_id:id});busy=false;if(r.error){toast(\`Calcul bloqué : \${r.error.message}\`);return mount()}toast(r.data?.motion_score==null?'Import enregistré mais score capteur encore incomplet.':\`Motion Score : \${Number(r.data.motion_score).toFixed(1)}/100\`);await mount();window.dispatchEvent(new CustomEvent('komo:motion-v06-calculated',{detail:r.data||{}}));window.dispatchEvent(new CustomEvent('komo:motion-v05-calculated',{detail:r.data||{}}))}`;
const calcNew=`async function calculate(id){if(busy)return;busy=true;await mount();const r=await sb().rpc('calculate_motion_v06',{p_assessment_id:id});busy=false;if(r.error){toast(\`Calcul bloqué : \${r.error.message}\`);return mount()}toast(r.data?.motion_score==null?'Import enregistré mais score capteur encore incomplet.':\`Motion Score : \${Number(r.data.motion_score).toFixed(1)}/100\`);await mount();window.dispatchEvent(new CustomEvent('komo:motion-v06-calculated',{detail:r.data||{}}));window.dispatchEvent(new CustomEvent('komo:motion-v05-calculated',{detail:r.data||{}}));setTimeout(()=>document.querySelector('.clm-score-shell,[data-pro-motion-next]')?.scrollIntoView({behavior:'smooth',block:'center'}),320)}`;
if(!motion.includes(calcOld))throw new Error('[pulse-pro-motion-final] calculate anchor missing');
motion=motion.replace(calcOld,calcNew);
await writeFile(motionWorkflowPath,motion,'utf8');

/* 5. After file import + automatic calculation, move the operator to the result */
let importer=await readFile(importPath,'utf8');
const importOld=`window.dispatchEvent(new CustomEvent('komo:motion-v06-calculated',{detail:sc.data||{}}))`;
const importNew=`window.dispatchEvent(new CustomEvent('komo:motion-v06-calculated',{detail:sc.data||{}}));setTimeout(()=>document.querySelector('.clm-score-shell,[data-pro-motion-next]')?.scrollIntoView({behavior:'smooth',block:'center'}),420)`;
if(!importer.includes(importOld))throw new Error('[pulse-pro-motion-final] import completion anchor missing');
importer=importer.replace(importOld,importNew);
await writeFile(importPath,importer,'utf8');

/* 6. iPad touch-target hardening — tablet only */
let authCss=await readFile(authWebCssPath,'utf8');
const authTabletTouch=`
@media (min-width:768px) and (max-width:1366px) and (pointer:coarse){
  #authScreen[data-auth-web="1"] .auth-audience-switch button{min-height:46px!important}
  #authScreen[data-auth-web="1"] .password-toggle{min-height:44px!important}
  #authScreen[data-auth-web="1"] .remember-row,
  #authScreen[data-auth-web="1"] .text-button{min-height:44px!important;display:inline-flex!important;align-items:center!important}
  #authScreen[data-auth-web="1"] .auth-footer-links a{min-height:44px!important;display:inline-flex!important;align-items:center!important}
}
`;
if(!authCss.includes('iPad touch-target hardening'))authCss+='\n/* iPad touch-target hardening */\n'+authTabletTouch;
await writeFile(authWebCssPath,authCss,'utf8');

let adaptiveCss=await readFile(adaptiveCssPath,'utf8');
const adaptiveTabletTouch=`
@media (min-width:768px) and (max-width:1366px) and (pointer:coarse){
  .kam-role-switch button{min-height:44px!important}
  html[data-adaptive-shell][data-adaptive-mode="pro"] .kcp-btn{min-height:44px!important}
  html[data-adaptive-shell][data-adaptive-mode="admin"] .kav2-tabs button{min-height:44px!important}
}
`;
if(!adaptiveCss.includes('iPad professional touch-target hardening'))adaptiveCss+='\n/* iPad professional touch-target hardening */\n'+adaptiveTabletTouch;
await writeFile(adaptiveCssPath,adaptiveCss,'utf8');

/* 7. Final assertions */
const finalReport=await readFile(reportPath,'utf8');
const finalClinical=await readFile(clinicalPath,'utf8');
const finalMotion=await readFile(motionWorkflowPath,'utf8');
const finalImport=await readFile(importPath,'utf8');
const finalCss=await readFile(clinicalCssPath,'utf8');
const finalAuthCss=await readFile(authWebCssPath,'utf8');
const finalAdaptiveCss=await readFile(adaptiveCssPath,'utf8');
const checks=[
  ['professional patient routing',finalReport.includes('professionalPatientId(button)')&&finalReport.includes('loadCanonicalResult({patientId,force:true})')],
  ['professional snapshot routing',finalReport.includes('loadReportSnapshot({patientId,force:true})')],
  ['professional PDF CTA',finalClinical.includes('Exporter le Motion Report PDF')&&finalClinical.includes('data-komo-export-report')],
  ['single next-action guide',finalClinical.includes('data-pro-motion-next-action')&&finalClinical.includes('workflowGuide(p,a,imp,s)')],
  ['sensor-only operator stages',finalClinical.includes("['02','Acquisition'")&&finalClinical.includes("['03','Motion Score'")],
  ['review hand-off',finalMotion.includes('Revoir et valider le score')&&finalMotion.includes('Le Motion Report est prêt.')],
  ['import hand-off',finalImport.includes(".clm-score-shell,[data-pro-motion-next]")],
  ['iPad operator styling',finalCss.includes('.clm-next{')&&finalCss.includes('.clm-flow-step.current')],
  ['iPad auth touch targets',finalAuthCss.includes('min-height:46px!important')&&finalAuthCss.includes('.password-toggle{min-height:44px!important}')],
  ['iPad pro touch targets',finalAdaptiveCss.includes('.kam-role-switch button{min-height:44px!important}')&&finalAdaptiveCss.includes('.kcp-btn{min-height:44px!important}')]
];
for(const [label,ok] of checks)console.log(`[pulse-pro-motion-final] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-pro-motion-final] PASS · patient → acquisition → score → validation → Motion Report');
