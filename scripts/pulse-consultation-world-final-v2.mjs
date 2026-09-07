import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const pulse=path.join(process.cwd(),'site','pulse-v12');
const bookingPath=path.join(pulse,'booking-layer-v1.js');
const centerPath=path.join(pulse,'center-two-tab-workspace-v1.js');
const myKomoPath=path.join(pulse,'my-komo-stable-v5.js');
const indexPath=path.join(pulse,'index.html');
for(const f of [bookingPath,centerPath,myKomoPath,indexPath])if(!fs.existsSync(f))throw new Error('[consultation-world-v2] missing '+f);

const mustReplace=(src,re,to,label)=>{
  if(!re.test(src))throw new Error('[consultation-world-v2] marker missing: '+label);
  return src.replace(re,to);
};

let booking=fs.readFileSync(bookingPath,'utf8');
let center=fs.readFileSync(centerPath,'utf8');
let mykomo=fs.readFileSync(myKomoPath,'utf8');
let html=fs.readFileSync(indexPath,'utf8');

// PATIENT — the consultation card opens one complete consultation surface.
// The questionnaire engine remains the sole editor; this owner only reads the canonical consultation detail RPC.
booking=mustReplace(
  booking,
  /let patientLoadPromise=null;/,
  `let patientLoadPromise=null,patientDetail=null,patientDetailLoading=false;\nconst CONSULTATION_LABELS={KOMO_BASELINE_CORE:'Profil & sécurité',KOMO_MOBILITY_25:'GLFS-25',KOMO_SLEEP_RECOVERY:'Sommeil & récupération',KOMO_WELLBEING:'Bien-être',KOMO_LIFESTYLE:'Mode de vie',KOMO_HEALTH_HISTORY:'Antécédents'};`,
  'patient detail state'
);

booking=mustReplace(
  booking,
  /function assignedLabel\(x\)\{.*?\}\nfunction questionnairePreview/s,
  `function assignedLabel(x){if(!x.assessment_id)return'Consultation en préparation';return'Ouvrir ma consultation'}\nfunction questionnairePreview`,
  'patient card CTA'
);

booking=mustReplace(
  booking,
  /function assignedCard\(x,current\)\{.*?\}\nfunction renderPatient/s,
  String.raw`function assignedCard(x,current){const pct=Math.max(0,Math.min(100,Number(x.pre_bilan_percent||0))),done=Number(x.completed_sections||0)>=Number(x.total_sections||6);return\`<article class="kbook-motion-card"><div><span>\${x.appointment_id===current?'CONSULTATION ATTRIBUÉE':'CONSULTATION MOTION'}</span><strong>\${esc(x.organization_name||'Centre KŌMØ')}</strong><small>\${esc(fullDate(x.scheduled_start,x.timezone||'Europe/Paris'))}</small><small>\${esc(apptStatus(x.appointment_status))}</small>\${questionnairePreview()}</div><div><b>Questionnaires · \${done?'Complets':pct+'%'}</b><small>\${Number(x.completed_sections||0)}/\${Number(x.total_sections||6)} sections complétées</small><button class="kbook-start-motion" type="button" data-kbook-detail="\${esc(x.assessment_id||'')}" \${!x.assessment_id?'disabled':''}>\${esc(assignedLabel(x))}</button></div></article>\`}

function patientDetailProgress(d){const q=Array.isArray(d?.questionnaires)?d.questionnaires:[],done=q.filter(x=>x.status==='completed'||Number(x.completeness||0)>=100).length;return{done,total:6,percent:Math.round(done/6*100)}}
function detailSection(x){const pct=Math.max(0,Math.min(100,Number(x?.completeness||0))),done=x?.status==='completed'||pct>=100,label=CONSULTATION_LABELS[x?.instrument_code]||x?.instrument_code||'Questionnaire',score=x?.score!=null&&x?.instrument_code==='KOMO_MOBILITY_25'?\` · score \${Math.round(Number(x.score))}/100\`:'';return\`<article class="kbook-detail-q \${done?'done':''}"><div><strong>\${esc(label)}</strong><small>\${done?'Terminé':'À compléter'}\${score}</small></div><b>\${Math.round(pct)}%</b></article>\`}
function scoreDomains(score){const d=score?.domain_scores;if(!d||typeof d!=='object')return'';const labels={neuromuscular_symmetry:'Symétrie neuromusculaire',muscle:'Muscle',movement:'Mouvement',balance:'Équilibre',posture:'Posture',coordination:'Coordination',endurance:'Endurance',mobility:'Mobilité'};const rows=Object.entries(d).filter(([,v])=>Number.isFinite(Number(v))).slice(0,8);if(!rows.length)return'';return\`<div class="kbook-detail-domains">\${rows.map(([k,v])=>\`<div><span>\${esc(labels[k]||k.replaceAll('_',' '))}</span><strong>\${Math.round(Number(v))}</strong></div>\`).join('')}</div>\`}
function renderPatientDetail(root){if(patientDetailLoading&&!patientDetail){root.innerHTML='<div class="kbook patient"><div class="kbook-sync kbook-sync-empty"><span class="kbook-sync-dot"></span><span>Ouverture de votre consultation…</span></div></div>';return}if(!patientDetail)return;const d=patientDetail,p=patientDetailProgress(d),a=d.appointment||{},m=d.motion||{},score=d.score||null,imports=Array.isArray(d.myocare_imports)?d.myocare_imports:[],ready=p.done===6;document.querySelector('#pageEyebrow').textContent='CONSULTATION MOTION';document.querySelector('#pageTitle').textContent='Votre consultation complète.';root.innerHTML=\`<section class="kbook patient kbook-detail"><button class="kbook-detail-back" type="button" data-kbook-detail-back>← Mes consultations</button><section class="kbook-hero"><div><p class="eyebrow">KŌMØ PULSE · CONSULTATION</p><h2>\${ready?'Pré-bilan terminé.':'Votre pré-bilan Motion.'}</h2><p>\${ready?'Vos six questionnaires sont enregistrés. L’équipe professionnelle peut maintenant charger l’acquisition Motion et les données Myodev dans ce même épisode.':'Complétez les six sections avant l’acquisition Motion.'}</p></div><div class="kbook-next"><span>Pré-bilan</span><strong>\${p.done}/6</strong><small>\${p.percent}%</small></div></section><section class="kbook-detail-grid"><article class="kbook-detail-card"><p class="eyebrow">01 · CONSULTATION</p><h3>\${a.scheduled_start?esc(fullDate(a.scheduled_start)):'Consultation Motion'}</h3><p>\${esc(apptStatus(a.status||'confirmed'))}</p><small>Épisode Motion · \${esc(m.status||'en préparation')}</small></article><article class="kbook-detail-card"><p class="eyebrow">02 · QUESTIONNAIRES</p><h3>\${ready?'6/6 terminés':'Pré-bilan en cours'}</h3><div class="kbook-detail-qs">\${(d.questionnaires||[]).map(detailSection).join('')}</div><button class="kbook-start-motion" type="button" data-kbook-detail-edit="\${esc(m.id||'')}">\${ready?'Relire mes questionnaires':'Continuer mes questionnaires'}</button></article><article class="kbook-detail-card"><p class="eyebrow">03 · ACQUISITION MOTION</p><h3>\${imports.length?'Analyse Motion chargée':ready?'Prêt pour le professionnel':'En attente du pré-bilan'}</h3><p>\${imports.length?'Les données Myodev sont rattachées à cette consultation.':ready?'Le professionnel peut maintenant charger l’analyse Motion / Myodev.':'L’acquisition reste verrouillée jusqu’à 6/6.'}</p><div class="kbook-detail-imports">\${imports.length?imports.slice(0,4).map(i=>\`<div><strong>\${esc(i.source_file_name||'Acquisition Myodev')}</strong><span>\${esc(i.status||'importé')}</span></div>\`).join(''):'<span>Aucune acquisition importée</span>'}</div></article><article class="kbook-detail-card"><p class="eyebrow">04 · RÉSULTAT</p><h3>\${score?.motion_score!=null?Math.round(Number(score.motion_score))+'/100':'Motion Score à calculer'}</h3><p>\${score?.motion_score!=null?'Le résultat a été calculé à partir de l’acquisition Motion.':'Le score sera calculé après acquisition, contrôle qualité et validation.'}</p>\${scoreDomains(score)}\${score?.motion_score!=null?'<button class="kbook-start-motion" type="button" data-route="results">Voir tous mes résultats →</button>':''}</article></section></section>\`;bindPatient()}
async function openConsultationDetail(id){if(!id)return;patientDetail=null;patientDetailLoading=true;renderPatient();try{const q=await sb().rpc('komo_my_motion_consultation_detail',{p_assessment_id:id});if(q.error)throw q.error;patientDetail=q.data||null}catch(e){console.error('[consultation-detail]',e);notify('Impossible d’ouvrir le détail de cette consultation.')}finally{patientDetailLoading=false;renderPatient()}}
function closeConsultationDetail(){patientDetail=null;patientDetailLoading=false;renderPatient()}

function renderPatient`,
  'patient complete consultation'
);

booking=mustReplace(
  booking,
  /const root=document\.querySelector\('#viewRoot'\);if\(!root\)return;\n  const up=/,
  `const root=document.querySelector('#viewRoot');if(!root)return;\n  if(patientDetail||patientDetailLoading){renderPatientDetail(root);return}\n  const up=`,
  'patient detail routing'
);

booking=mustReplace(
  booking,
  /function bindPatient\(\)\{.*?\}\nasync function startAssignedAssessment/s,
  `function bindPatient(){document.querySelectorAll('[data-kbook-detail]').forEach(b=>b.addEventListener('click',()=>openConsultationDetail(b.dataset.kbookDetail)));document.querySelector('[data-kbook-detail-back]')?.addEventListener('click',closeConsultationDetail);document.querySelector('[data-kbook-detail-edit]')?.addEventListener('click',()=>startAssignedAssessment(document.querySelector('[data-kbook-detail-edit]')?.dataset.kbookDetailEdit));document.querySelectorAll('[data-route="results"]').forEach(b=>b.addEventListener('click',()=>location.hash='results'))}\nasync function startAssignedAssessment`,
  'patient detail bindings'
);

booking += `\nwindow.addEventListener('focus',()=>{if(location.hash.replace(/^#/,'')==='documents'&&patientMode()){patientDetail&&patientDetail.motion?.id?openConsultationDetail(patientDetail.motion.id).catch(console.error):loadPatient().catch(console.error)}});\n`;

// PRO — readiness comes from the same six questionnaire sessions as the patient detail.
center=center.replace(
  "function latestAppointment(d){return(d?.appointments||[]).filter(a=>!['cancelled','no_show'].includes(a.status)).sort((a,b)=>new Date(b.scheduled_start)-new Date(a.scheduled_start))[0]||null}",
  "function latestAppointment(d){return d?.appointment||(d?.appointments||[]).filter(a=>!['cancelled','no_show'].includes(a.status)).sort((a,b)=>new Date(b.scheduled_start)-new Date(a.scheduled_start))[0]||null}"
);

center=mustReplace(
  center,
  /function rowHtml\(x\)\{.*?\}\nfunction renderPatients/s,
  String.raw`function rowHtml(x){const p=x.patient||{},ap=x.next_appointment||null,sc=x.score||null,pb=x.pre_bilan||{},pct=Math.max(0,Math.min(100,Number(pb.percent||0))),ready=pb.complete===true||Number(pb.completed||0)>=6;return\`<article class="k2tw-row"><div class="k2tw-person"><strong>\${esc(name(p))}</strong><span>\${esc(p.email||p.external_reference||'')}</span></div><div class="k2tw-cell"><span>Consultation</span><strong>\${ap?esc(fmt(ap.scheduled_start,true)):'Non attribuée'}</strong><small>\${ap?esc(statusLabel(ap.status)):'À attribuer'}</small></div><div class="k2tw-cell"><span>Questionnaires</span><strong>\${ready?'6/6 · Complet':Number(pb.completed||0)+'/6'}</strong><div class="k2tw-progress"><i style="width:\${pct}%"></i></div></div><div class="k2tw-cell"><span>Motion Score</span><strong>\${sc?.motion_score!=null?Math.round(Number(sc.motion_score))+'/100':'À réaliser'}</strong><small>\${x.motion?.status?esc(statusLabel(x.motion.status)):'En attente'}</small></div><div style="display:grid;gap:6px">\${ap?\`<button class="k2tw-open" data-k2tw-open="\${p.id}">\${ready?'Charger analyse Motion':'Ouvrir la consultation'}</button><button class="k2tw-btn" data-k2tw-assign="\${p.id}">Nouvelle consultation</button>\`:\`<button class="k2tw-open" data-k2tw-assign="\${p.id}">Attribuer consultation</button>\`}</div></article>\`}
function renderPatients`,
  'pro row readiness'
);

center=center.replace(
  "ready=list.filter(x=>x.next_appointment&&Number(x.preparation?.percent||0)>=100).length",
  "ready=list.filter(x=>x.next_appointment&&(x.pre_bilan?.complete===true||Number(x.pre_bilan?.completed||0)>=6)).length"
);

center=center.replace(
  "const q=await sb().rpc('komo_professional_patient_dossier',{p_patient_id:patientId});",
  "const q=await sb().rpc('komo_professional_motion_consultation',{p_patient_id:patientId});"
);

center=mustReplace(
  center,
  /function renderDossier\(\)\{.*?\}\nfunction bindDossier/s,
  String.raw`function qStatusRow(q){const labels={KOMO_BASELINE_CORE:'Profil & sécurité',KOMO_MOBILITY_25:'GLFS-25',KOMO_SLEEP_RECOVERY:'Sommeil & récupération',KOMO_WELLBEING:'Bien-être',KOMO_LIFESTYLE:'Mode de vie',KOMO_HEALTH_HISTORY:'Antécédents'},pct=Math.max(0,Math.min(100,Number(q?.completeness||0))),done=q?.status==='completed'||pct>=100;return\`<div class="k2tw-step"><div><span>\${esc(labels[q?.instrument_code]||q?.instrument_code||'Questionnaire')}</span><small>\${Math.round(pct)}%</small></div><strong>\${done?'Terminé ✓':'À faire'}</strong></div>\`}
function renderDossier(){document.querySelector('#k2twDrawer')?.remove();if(!S.selected)return;styles();const d=document.createElement('div');d.id='k2twDrawer';d.className='k2tw-drawer';if(S.dossierLoading&&!S.dossier){d.innerHTML='<aside class="k2tw-panel"><div class="k2tw-loading">Chargement…</div></aside>';document.body.appendChild(d);return}const x=S.dossier;if(!x)return;const p=x.patient||{},c=completion(x),appt=latestAppointment(x),score=x.score?.motion_score,imports=x.myocare_imports||[],ready=c.qs>=6;d.innerHTML=\`<aside class="k2tw-panel"><header class="k2tw-panel-head"><div><p class="eyebrow">CONSULTATION MOTION</p><h2>\${esc(name(p))}</h2><p>\${esc(p.email||p.external_reference||'')}</p></div><button class="k2tw-close" data-k2tw-close>×</button></header><div class="k2tw-grid"><article class="k2tw-card full"><p class="eyebrow">01 · CONSULTATION</p><h3>\${appt?esc(fmt(appt.scheduled_start,true)):'Non attribuée'}</h3><p>\${appt?esc(statusLabel(appt.status)):'Attribuez la consultation pour ouvrir le parcours patient.'}</p></article><article class="k2tw-card"><p class="eyebrow">02 · QUESTIONNAIRES PATIENT</p><h3>\${ready?'Pré-bilan prêt · 6/6':'Pré-bilan à compléter · '+c.qs+'/6'}</h3><div>\${(x.questionnaires||[]).map(qStatusRow).join('')}</div></article><article class="k2tw-card"><p class="eyebrow">03 · ACQUISITION MOTION</p><h3>\${score!=null?Math.round(Number(score))+'/100':imports.length?'Analyse chargée':'Mesures à réaliser'}</h3><p>\${!ready?'L’acquisition est verrouillée tant que les six questionnaires ne sont pas terminés.':imports.length?imports.length+' import(s) Myodev associé(s).':'Le pré-bilan est complet. Vous pouvez maintenant charger l’analyse Motion / Myodev.'}</p><div class="k2tw-dossier-actions"><button class="k2tw-btn primary" data-k2tw-import \${ready&&x.motion?.id?'':'disabled'}>\${imports.length?'Continuer l’analyse Motion':'Charger l’analyse Motion'}</button>\${score!=null?'<button class="k2tw-btn" data-k2tw-results>Voir les résultats</button>':''}</div><div id="k2twImportHost" class="k2tw-import-host"></div></article></div></aside>\`;document.body.appendChild(d);bindDossier()}
function bindDossier`,
  'pro consultation drawer'
);

center=center.replace(
  "function openImport(){if(!S.selected||!S.dossier?.motion?.id){notify('Créez ou sélectionnez d’abord un bilan Motion pour ce patient.');return}",
  "function openImport(){const c=completion(S.dossier);if(c.qs<6){notify('Le patient doit terminer les 6 questionnaires avant l’acquisition Motion.');return}if(!S.selected||!S.dossier?.motion?.id){notify('Créez ou sélectionnez d’abord un bilan Motion pour ce patient.');return}"
);

// MY KŌMØ — KŌMØ World becomes a first-class visible destination, not another route owner.
// Questionnaire reading belongs to the existing consultation drawer. Queries use
// the authenticated client and existing assessment-level RLS, never admin keys.
center=center.replace('function bindDossier(){', `function bindDossier(){
document.querySelector('[data-consultation-answers]')?.addEventListener('click',loadConsultationAnswers);
document.querySelector('[data-consultation-refresh]')?.addEventListener('click',()=>openDossier(S.selected));`);
center=center.replace('<p class="eyebrow">02 · QUESTIONNAIRES PATIENT</p>', '<p class="eyebrow">02 · QUESTIONNAIRES PATIENT</p><button type="button" class="k2tw-btn" data-consultation-refresh>Actualiser</button>');
center=center.replace('<article class="k2tw-card"><p class="eyebrow">03 · ACQUISITION MOTION</p>', '<article class="k2tw-card full"><h3>Réponses du patient</h3><button type="button" class="k2tw-btn" data-consultation-answers>Consulter les réponses</button><div data-consultation-answers-host aria-live="polite"></div></article><article class="k2tw-card"><p class="eyebrow">03 · ACQUISITION MOTION</p>');
center += `
function consultationAnswerLabel(reg,item,value){
  if(value==null||value==='')return'—';
  if(value===true)return'Oui';if(value===false)return'Non';
  if(Array.isArray(value))return value.map(v=>consultationAnswerLabel(reg,item,v)).join(', ');
  const cfg=reg?.configuration||{},question=cfg.items?.[item]||{};
  for(const choices of [question.options,cfg.response_scale,cfg.frequency_options,cfg.difficulty_options,cfg.impact_options,cfg.default_options]){
    if(!Array.isArray(choices))continue;
    const option=choices.find(x=>String(x.value)===String(value));if(option)return option.label;
  }
  return typeof value==='object'?JSON.stringify(value):String(value);
}
async function loadConsultationAnswers(){
  const host=document.querySelector('[data-consultation-answers-host]'),button=document.querySelector('[data-consultation-answers]'),assessmentId=S.dossier?.motion?.id;
  if(!host||!assessmentId)return;
  host.textContent='Chargement des réponses…';if(button)button.disabled=true;
  const current=()=>host.isConnected&&S.dossier?.motion?.id===assessmentId;
  try{
    const sessions=await sb().from('questionnaire_sessions').select('id,instrument_code,status,completeness,completed_at,score').eq('assessment_id',assessmentId).order('created_at');
    if(sessions.error)throw sessions.error;
    if(!current())return;
    if(!sessions.data?.length){host.textContent='Aucune réponse enregistrée pour cette consultation.';return}
    const [registry,answers]=await Promise.all([
      sb().from('instrument_registry').select('code,label,configuration').in('code',[...new Set(sessions.data.map(x=>x.instrument_code))]),
      sb().from('questionnaire_responses').select('questionnaire_session_id,item_code,raw_value,updated_at').in('questionnaire_session_id',sessions.data.map(x=>x.id))
    ]);
    if(registry.error)throw registry.error;if(answers.error)throw answers.error;
    if(!current())return;
    const regs=Object.fromEntries((registry.data||[]).map(x=>[x.code,x]));
    host.innerHTML=sessions.data.map(session=>{
      const reg=regs[session.instrument_code]||{},cfg=reg.configuration||{},rows=(answers.data||[]).filter(x=>x.questionnaire_session_id===session.id),order=cfg.item_order||rows.map(x=>x.item_code);
      const date=session.completed_at?' · '+fmt(session.completed_at,true):'';
      const safety=session.instrument_code==='KOMO_BASELINE_CORE'&&rows.some(x=>['S01','S02','S03','S04','S05'].includes(x.item_code)&&x.raw_value===true);
      return '<details class="k2tw-answers"><summary>'+esc(cfg.display_label||reg.label||'Questionnaire')+' · '+Math.round(Number(session.completeness||0))+'%'+esc(date)+'</summary>'+(safety?'<p role="status">Une réponse de sécurité nécessite une vérification avant les tests.</p>':'')+'<dl>'+order.map(item=>{
        const row=rows.find(x=>x.item_code===item);if(!row)return'';
        return '<div><dt>'+esc(cfg.items?.[item]?.prompt||item)+'</dt><dd>'+esc(consultationAnswerLabel(reg,item,row.raw_value))+'</dd></div>';
      }).join('')+'</dl>'+(!rows.length?'<p>Aucune réponse enregistrée.</p>':'')+'</details>';
    }).join('');
  }catch(error){if(current())host.textContent='Impossible de charger les réponses. Réessayez ou vérifiez votre accès à ce dossier.'}
  finally{if(button?.isConnected)button.disabled=false}
}
`;
booking += `
window.addEventListener('komo:questionnaire-saved',e=>{
  if(!patientMode())return;
  if(patientDetail?.motion?.id===e.detail?.assessmentId)openConsultationDetail(e.detail.assessmentId).catch(console.error);
  else if(location.hash.replace(/^#/,'')==='documents')loadPatient().catch(console.error);
});
window.addEventListener('komo:session-cleared',()=>{patientDetail=null;patientDetailLoading=false});
`;

mykomo=mykomo.replace(
  '<div class="mks-grid">\n    <article class="mks-card mks-community primary">',
  '<div class="mks-grid">\n    <article class="mks-card mks-community primary mks-world"><div><div class="mks-icon">◎</div><h3>KŌMØ World</h3><p>Entrez dans votre univers locomoteur : Functional Twin, Arena, Rehab et Fitness Floor.</p></div><div class="mks-card-foot"><span>Votre espace World</span><button class="mks-link" type="button" data-mkv5-world>Entrer dans World →</button></div></article>\n    <article class="mks-card mks-community">'
);
mykomo=mykomo.replace(
  "document.querySelector('[data-mkv5-refresh]')?.addEventListener('click',()=>load(true))",
  "document.querySelector('[data-mkv5-world]')?.addEventListener('click',()=>{location.href='https://komolongevity.com/world/'});document.querySelector('[data-mkv5-refresh]')?.addEventListener('click',()=>load(true))"
);

// The raw build templates above intentionally protect browser template literals.
// Normalize them before syntax checking the emitted runtime, exactly once at build time.
booking=booking.replace(/\\`/g,'`').replace(/\\\$\{/g,'${');
center=center.replace(/\\`/g,'`').replace(/\\\$\{/g,'${');

if(!html.includes('id="kpConsultationDetailV2"')){
  html=html.replace('</head>',`<style id="kpConsultationDetailV2">
  #viewRoot .kbook-detail{display:grid;gap:14px;max-width:1180px;margin:0 auto}
  #k2twDrawer .k2tw-answers{margin-top:12px;border-top:1px solid #ccd3ce;padding-top:12px;font-size:14px;line-height:1.5}
  #k2twDrawer .k2tw-answers summary{cursor:pointer;font-weight:600;overflow-wrap:anywhere}
  #k2twDrawer .k2tw-answers dl>div{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;padding:10px 0;border-bottom:1px solid #ccd3ce}
  #k2twDrawer .k2tw-answers dd{margin:0;font-weight:600;overflow-wrap:anywhere}
  @media(max-width:600px){#k2twDrawer .k2tw-answers dl>div{grid-template-columns:1fr;gap:4px}}
  #viewRoot .kbook-detail-back{width:max-content;border:0;background:transparent;color:#aeb8b1;font:inherit;font-size:11px;cursor:pointer;padding:4px 0}
  #viewRoot .kbook-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  #viewRoot .kbook-detail-card{display:flex;flex-direction:column;gap:8px;min-height:190px;padding:22px;border:1px solid rgba(255,255,255,.09);border-radius:20px;background:#0a0e0b;color:#f3f5f2}
  #viewRoot .kbook-detail-card h3{margin:0;color:#f3f5f2;font-size:20px;letter-spacing:-.025em}
  #viewRoot .kbook-detail-card p{margin:0;color:#9ca79f;font-size:12px;line-height:1.55}
  #viewRoot .kbook-detail-card>small{color:#758078;font-size:9px}
  #viewRoot .kbook-detail-qs{display:grid;gap:7px;margin:4px 0 10px}
  #viewRoot .kbook-detail-q{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 11px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:#0d120f}
  #viewRoot .kbook-detail-q div{display:grid;gap:3px}#viewRoot .kbook-detail-q strong{font-size:10px;color:#e7ebe7}#viewRoot .kbook-detail-q small{font-size:8px;color:#7f8c83}#viewRoot .kbook-detail-q b{font-size:10px;color:#88938b}
  #viewRoot .kbook-detail-q.done{border-color:rgba(143,179,154,.25);background:rgba(143,179,154,.07)}#viewRoot .kbook-detail-q.done b{color:#9fc3aa}
  #viewRoot .kbook-detail-imports{display:grid;gap:6px;margin-top:auto}#viewRoot .kbook-detail-imports>div{display:flex;justify-content:space-between;gap:10px;padding:9px 10px;border-radius:11px;background:#0d120f}#viewRoot .kbook-detail-imports strong{font-size:9px}#viewRoot .kbook-detail-imports span{font-size:8px;color:#849087}
  #viewRoot .kbook-detail-domains{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:4px 0 8px}#viewRoot .kbook-detail-domains>div{padding:10px;border-radius:12px;background:#0d120f}#viewRoot .kbook-detail-domains span{display:block;color:#7f8c83;font-size:8px;text-transform:capitalize}#viewRoot .kbook-detail-domains strong{display:block;margin-top:4px;font-size:18px}
  @media(max-width:760px){#viewRoot .kbook-detail-grid{grid-template-columns:1fr}#viewRoot .kbook-detail-card{min-height:0;padding:17px}#viewRoot .kbook-detail-domains{grid-template-columns:1fr 1fr}}
  </style>\n</head>`);
}

fs.writeFileSync(bookingPath,booking);
fs.writeFileSync(centerPath,center);
fs.writeFileSync(myKomoPath,mykomo);
fs.writeFileSync(indexPath,html);

for(const file of [bookingPath,centerPath,myKomoPath]){
  const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(check.status!==0)throw new Error('[consultation-world-v2] syntax '+path.basename(file)+': '+(check.stderr||check.stdout));
}

const retired=['agenda-hub-v4.js','agenda-premium-map-v1.js','pro-agenda-dossier-v1.js','booking-directory-map-v1.js','center-workspace-v1.js','center-command-cockpit-v2.js','center-owner-ui-guard-v1.js'];
for(const file of retired)if(html.includes(file))throw new Error('[consultation-world-v2] duplicate owner still loaded: '+file);
const checks=[
  ['patient complete detail RPC',booking.includes('komo_my_motion_consultation_detail')],
  ['patient card opens detail',booking.includes('data-kbook-detail=')],
  ['patient six questionnaire detail',booking.includes('patientDetailProgress')&&booking.includes('6/6 terminés')],
  ['professional canonical consultation RPC',center.includes('komo_professional_motion_consultation')],
  ['professional readiness from six questionnaires',center.includes('x.pre_bilan')&&center.includes('Charger analyse Motion')],
  ['professional acquisition locked before 6/6',center.includes('Le patient doit terminer les 6 questionnaires')],
  ['World visible in My KŌMØ',mykomo.includes('data-mkv5-world')&&mykomo.includes('KŌMØ World')],
  ['consultation detail style',html.includes('kpConsultationDetailV2')],
  ['single patient consultation owner',!html.includes('pro-agenda-dossier-v1.js')],
  ['single Centre owner',html.includes('center-two-tab-workspace-v1.js')&&!html.includes('center-workspace-v1.js')]
];
for(const [label,ok] of checks)if(!ok)throw new Error('[consultation-world-v2] failed: '+label);
console.log('[consultation-world-v2] PASS · consultation detail + 6/6 Motion handoff + KŌMØ World · single runtime owners');
