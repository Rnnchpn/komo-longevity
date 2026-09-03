import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const dirs=[join(root,'pulse-app'),join(root,'site','pulse-v12')];
const baseCodes=['KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'];

async function patch(dir,file,fn){
  const path=join(dir,file);
  let src=await readFile(path,'utf8');
  const next=fn(src);
  if(next!==src)await writeFile(path,next,'utf8');
  return next;
}

const centerCss=`
/* Centre patient workspace — readable premium clinical surface */
html body.komo-pro-mode .kcp-head{display:grid!important;grid-template-columns:minmax(0,1fr) 190px minmax(270px,340px)!important;align-items:center!important;gap:22px!important;background:linear-gradient(135deg,#07100b,#0b1810 68%,#0c2014)!important;border:1px solid rgba(143,179,154,.16)!important;box-shadow:none!important}
html body.komo-pro-mode .kcp-head h2{color:#f7f8f5!important;letter-spacing:-.055em!important}
html body.komo-pro-mode .kcp-head>div:first-child>p:not(.eyebrow){color:#a9b4ac!important;max-width:720px!important}
html body.komo-pro-mode .kcp-org{border-left:1px solid rgba(255,255,255,.10)!important;color:#f4f6f3!important}
html body.komo-pro-mode .kcp-org span,html body.komo-pro-mode .kcp-org small{color:#8fa297!important}
.k2tw-self-hero{display:grid;gap:12px;padding:16px;border:1px solid rgba(143,179,154,.18);border-radius:18px;background:rgba(127,165,138,.08);color:#fff}
.k2tw-self-hero div{display:grid;gap:4px}.k2tw-self-hero small{font-size:7px;letter-spacing:.14em;color:#91b49b;font-weight:800}.k2tw-self-hero strong{font-size:12px;color:#fff}.k2tw-self-hero span{font-size:8px;line-height:1.4;color:#aab6ae}
.k2tw-self-hero button,.k2tw-self-button{border:0;border-radius:12px;background:#315b41;color:#fff;padding:11px 13px;font:inherit;font-size:9px;font-weight:800;cursor:pointer;box-shadow:none}.k2tw-self-hero button:disabled,.k2tw-self-button:disabled{opacity:.48;cursor:wait}
html body.komo-pro-mode #viewRoot .k2tw-patients{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(250px,310px)!important;gap:16px!important;padding:24px!important;border:1px solid #dcd8cf!important;border-radius:28px!important;background:#f3f0e8!important;color:#17231b!important;box-shadow:0 24px 70px rgba(0,0,0,.16)!important}
html body.komo-pro-mode #viewRoot .k2tw-head{grid-column:1!important;display:flex!important;align-items:flex-end!important;justify-content:space-between!important;gap:20px!important;padding:4px 2px 8px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
html body.komo-pro-mode #viewRoot .k2tw-head .eyebrow{color:#607268!important}html body.komo-pro-mode #viewRoot .k2tw-head h2{color:#17231b!important;font-size:34px!important}html body.komo-pro-mode #viewRoot .k2tw-head p{color:#66736b!important;font-size:10px!important;max-width:560px}
html body.komo-pro-mode #viewRoot .k2tw-tools label span{color:#647069!important}.k2tw-tools{justify-content:flex-end}.k2tw-tools select,.k2tw-tools input{min-height:40px!important}
html body.komo-pro-mode #viewRoot .k2tw-tools select,html body.komo-pro-mode #viewRoot .k2tw-tools input{background:#fffdf9!important;border:1px solid #d8d4cb!important;color:#17231b!important;box-shadow:none!important}html body.komo-pro-mode #viewRoot .k2tw-tools input::placeholder{color:#91978f!important}
html body.komo-pro-mode #viewRoot .k2tw-kpis{grid-column:1!important}.k2tw-kpi{background:#fffdf9!important;border-color:#ddd9d0!important;box-shadow:none!important}.k2tw-kpi span{color:#68746d!important}.k2tw-kpi strong{color:#17231b!important;font-size:25px!important}
html body.komo-pro-mode #viewRoot .k2tw-list{grid-column:1!important}.k2tw-row{background:#fffdf9!important;border-color:#ddd9d0!important;box-shadow:none!important}.k2tw-row:hover{border-color:#9fb1a3!important;background:#fff!important}.k2tw-person strong{color:#18241c!important;font-size:11px!important}.k2tw-person span,.k2tw-cell span,.k2tw-cell small{color:#727c75!important}.k2tw-cell strong{color:#26362b!important}.k2tw-progress{background:#e5e1d9!important}.k2tw-progress i{background:#55745e!important}.k2tw-open{background:#263e30!important;color:#fff!important;box-shadow:none!important}.k2tw-pill{background:#f4e7cf!important;color:#7b5a26!important}.k2tw-pill.ok{background:#e3eee5!important;color:#35543e!important}
.k2tw-self-card{grid-column:2!important;grid-row:1/span 3!important;align-self:stretch;padding:20px;border:1px solid #d9d5cc;border-radius:22px;background:#fffdf9;color:#17231b}.k2tw-self-head{display:flex;gap:11px;align-items:flex-start}.k2tw-self-icon{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:12px;background:#e2eee4;color:#315b41;font-weight:900}.k2tw-self-head div{display:grid;gap:4px}.k2tw-self-head strong{font-size:13px;color:#17231b}.k2tw-self-head small{font-size:9px;line-height:1.45;color:#737d76}.k2tw-self-progress{display:grid;gap:8px;margin-top:22px}.k2tw-self-progress>div:first-child{display:flex;justify-content:space-between;gap:12px}.k2tw-self-progress span,.k2tw-self-progress strong{font-size:9px;color:#4c5b51}.k2tw-self-list{display:grid;gap:10px;margin:18px 0}.k2tw-self-list span{display:flex;align-items:center;gap:9px;font-size:9px;color:#626e66}.k2tw-self-list span i{font-style:normal;color:#9da49e}.k2tw-self-list span.done{color:#315b41;font-weight:700}.k2tw-self-list span.done i{color:#315b41}.k2tw-self-button{width:100%;min-height:42px}
html body.komo-pro-mode #viewRoot .k2tw-btn{background:#fffdf9!important;color:#24342a!important;border-color:#d6d2ca!important;box-shadow:none!important}html body.komo-pro-mode #viewRoot .k2tw-btn.primary{background:#263e30!important;color:#fff!important;border-color:#263e30!important}html body.komo-pro-mode #viewRoot .k2tw-btn.approve{background:#e7efe8!important;color:#31523b!important;border-color:#cbd8cd!important}
@media(max-width:1180px){html body.komo-pro-mode .kcp-head{grid-template-columns:minmax(0,1fr) 170px!important}.k2tw-self-hero{grid-column:1/-1!important;grid-template-columns:1fr auto;align-items:center}.k2tw-self-hero button{min-width:210px}html body.komo-pro-mode #viewRoot .k2tw-patients{grid-template-columns:1fr!important}.k2tw-self-card{grid-column:1!important;grid-row:auto!important}.k2tw-self-list{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:760px){html body.komo-pro-mode .kcp-head{grid-template-columns:1fr!important}.k2tw-self-hero{grid-template-columns:1fr}.k2tw-self-hero button{min-width:0;width:100%}html body.komo-pro-mode #viewRoot .k2tw-patients{padding:14px!important;border-radius:20px!important}.k2tw-self-list{grid-template-columns:1fr 1fr}.k2tw-head{align-items:stretch!important;flex-direction:column!important}.k2tw-tools{display:grid!important;grid-template-columns:1fr!important}}
`;

const questionnaireBridge=String.raw`async function openAssessment(assessmentId){
  if(!assessmentId)throw new Error('Bilan Motion introuvable.');
  if(!await identity())throw new Error('Session Pulse requise.');
  await loadRegistry();
  const a=await sb().from('assessments').select('id,patient_id,status,protocol_version,created_at,started_at').eq('id',assessmentId).eq('product_mode','motion').maybeSingle();
  if(a.error||!a.data)throw new Error('Bilan Motion inaccessible.');
  const p=await sb().from('patients').select('id,birth_date,organization_id,first_name,last_name,created_at').eq('id',a.data.patient_id).eq('patient_user_id',S.session.user.id).maybeSingle();
  if(p.error||!p.data)throw new Error('Ce bilan Motion n’est pas lié à votre compte.');
  S.assessment=a.data;S.patient=p.data;S.bridged=false;
  await loadQuestionnaires();await bridgeStart();await loadQuestionnaires();computeActive();
  S.open=true;const first=S.activeCodes.findIndex(c=>!sectionComplete(c));S.index=first>=0?first:0;S.message='';S.messageKind='';renderModal();
  return {assessment_id:S.assessment.id,progress:overallProgress(),completed:S.activeCodes.filter(sectionComplete).length,total:S.activeCodes.length};
}`;

const centerHelpers=String.raw`const SELF_CODES=['KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'];
const SELF_LABELS={KOMO_BASELINE_CORE:'Profil & sécurité',KOMO_MOBILITY_25:'Mobilité · GLFS‑25',KOMO_SLEEP_RECOVERY:'Sommeil & récupération',KOMO_WELLBEING:'Bien-être',KOMO_LIFESTYLE:'Mode de vie',KOMO_HEALTH_HISTORY:'Antécédents'};
function ownRow(){return S.rows.find(x=>x.patient?.patient_user_id===S.userId&&(!S.orgId||x.patient?.organization_id===S.orgId))||null}
async function loadSelfMotionProgress(){
  const x=ownRow();S.selfProgress={assessmentId:x?.motion?.id||null,completed:0,total:SELF_CODES.length,sessions:[]};
  if(!x?.motion?.id)return S.selfProgress;
  try{
    const q=await sb().from('questionnaire_sessions').select('instrument_code,status,completeness').eq('assessment_id',x.motion.id).in('instrument_code',SELF_CODES);
    if(q.error)throw q.error;
    const sessions=q.data||[];
    S.selfProgress={assessmentId:x.motion.id,completed:sessions.filter(v=>v.status==='completed'||Number(v.completeness||0)>=100).length,total:SELF_CODES.length,sessions};
  }catch(e){console.warn('[center-two-tab:self-motion]',e)}
  return S.selfProgress;
}
function selfDone(code){return !!S.selfProgress?.sessions?.find(x=>x.instrument_code===code&&(x.status==='completed'||Number(x.completeness||0)>=100))}
function selfMotionCard(){
  const p=S.selfProgress||{completed:0,total:SELF_CODES.length};
  const pct=Math.round((p.completed||0)/Math.max(1,p.total||SELF_CODES.length)*100);
  const list=SELF_CODES.map(function(c){return '<span class="'+(selfDone(c)?'done':'')+'"><i>'+(selfDone(c)?'✓':'○')+'</i>'+SELF_LABELS[c]+'</span>'}).join('');
  const label=p.completed?'Continuer mes questionnaires':'Commencer mon bilan Motion';
  return '<aside class="k2tw-self-card" data-k2tw-self-card><div class="k2tw-self-head"><span class="k2tw-self-icon">✓</span><div><strong>Préparez votre bilan Motion</strong><small>Répondez maintenant aux questionnaires liés à votre propre compte.</small></div></div><div class="k2tw-self-progress"><div><span>Questionnaires Motion</span><strong>'+(p.completed||0)+'/'+(p.total||SELF_CODES.length)+' complétés</strong></div><div class="k2tw-progress"><i style="width:'+pct+'%"></i></div></div><div class="k2tw-self-list">'+list+'</div><button type="button" class="k2tw-self-button" data-k2tw-self-motion>'+label+' →</button></aside>';
}
function renderSelfHero(){
  const head=document.querySelector('.kcp-head');if(!head)return;
  head.querySelector('[data-k2tw-self-hero]')?.remove();
  const p=S.selfProgress||{completed:0,total:SELF_CODES.length};
  const box=document.createElement('aside');box.className='k2tw-self-hero';box.dataset.k2twSelfHero='1';
  const label=p.completed?'Continuer':'Commencer mon bilan Motion';
  box.innerHTML='<div><small>VOTRE BILAN MOTION</small><strong>'+(p.completed||0)+'/'+(p.total||SELF_CODES.length)+' questionnaires complétés</strong><span>Complétez votre pré-bilan avant la consultation.</span></div><button type="button" data-k2tw-self-motion>'+label+' →</button>';
  head.appendChild(box);
}
async function startSelfMotion(){
  if(S.selfBusy)return;S.selfBusy=true;document.querySelectorAll('[data-k2tw-self-motion]').forEach(b=>b.disabled=true);
  try{
    if(!S.orgId)throw new Error('Sélectionnez un centre.');
    const q=await sb().rpc('komo_start_self_motion_assessment',{p_organization_id:S.orgId});if(q.error)throw q.error;
    const assessmentId=q.data?.assessment_id||S.selfProgress?.assessmentId;if(!assessmentId)throw new Error('Bilan Motion introuvable.');
    await loadRows();
    if(window.KomoQuestionnaireEngine?.openAssessment)await window.KomoQuestionnaireEngine.openAssessment(assessmentId);
    else{notify('Ouverture du pré-bilan Motion…');window.KomoPatientNavigation?.go?.('documents')||(location.hash='documents')}
  }catch(e){
    console.error('[center-two-tab:self-start]',e);
    const msg=e?.message==='profile_incomplete'?'Complétez d’abord votre profil (nom, prénom et date de naissance).':e?.message==='organization_access_required'?'Votre compte n’a pas accès à ce centre.':'Impossible d’ouvrir votre pré-bilan Motion.';notify(msg);
  }finally{S.selfBusy=false;document.querySelectorAll('[data-k2tw-self-motion]').forEach(b=>b.disabled=false)}
}
function decoratePatients(){
  const root=document.querySelector('.k2tw-patients');if(!root||S.active!=='patients')return;
  root.querySelector('[data-k2tw-self-card]')?.remove();root.insertAdjacentHTML('beforeend',selfMotionCard());renderSelfHero();
  document.querySelectorAll('[data-k2tw-self-motion]').forEach(function(b){if(b.dataset.k2twSelfBound==='1')return;b.dataset.k2twSelfBound='1';b.addEventListener('click',startSelfMotion)});
  const org=document.querySelector('#k2twOrg');if(org&&org.dataset.k2twSelfBound!=='1'){org.dataset.k2twSelfBound='1';org.addEventListener('change',function(){setTimeout(async function(){await loadSelfMotionProgress();decoratePatients()},0)})}
}`;

for(const dir of dirs){
  await patch(dir,'questionnaire-engine-v1.js',src=>{
    let js=src;
    if(!js.includes('async function openAssessment(assessmentId)'))js=js.replace('function schedule(){',questionnaireBridge+'\n\nfunction schedule(){');
    if(!js.includes('window.KomoQuestionnaireEngine='))js=js.replace('setTimeout(schedule,1700);',"setTimeout(schedule,1700);\nwindow.KomoQuestionnaireEngine={openAssessment,refresh:load,progress:()=>({progress:overallProgress(),completed:S.activeCodes.filter(sectionComplete).length,total:S.activeCodes.length,assessment_id:S.assessment?.id||null})};");
    return js;
  });

  await patch(dir,'center-two-tab-workspace-v1.js',src=>{
    let js=src;
    js=js.replace(
      "const S={client:null,role:'member',rows:[],loading:false,error:'',active:localStorage.getItem(TAB_KEY)||'patients',selected:null,dossier:null,dossierLoading:false,search:'',orgId:localStorage.getItem(ORG_KEY)||'',movingImport:false};",
      "const S={client:null,role:'member',userId:null,rows:[],loading:false,error:'',active:localStorage.getItem(TAB_KEY)||'patients',selected:null,dossier:null,dossierLoading:false,search:'',orgId:localStorage.getItem(ORG_KEY)||'',movingImport:false,selfProgress:null,selfBusy:false};"
    );
    js=js.replace(
      "async function role(){const {data:{session}}=await sb().auth.getSession();if(!session?.user)return false;const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';return['professional','admin'].includes(S.role)}",
      "async function role(){const {data:{session}}=await sb().auth.getSession();if(!session?.user)return false;S.userId=session.user.id;const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';return['professional','admin'].includes(S.role)}"
    );
    js=js.replace("S.rows=d.data?.rows||[];selectedRows()","S.rows=d.data?.rows||[];selectedRows();await loadSelfMotionProgress()");
    if(!js.includes('const SELF_CODES='))js=js.replace('function patientProgress(x){',centerHelpers+'\n\nfunction patientProgress(x){');
    if(!js.includes('Centre patient workspace — readable premium clinical surface')){
      js=js.replace("  `;document.head.appendChild(s)","  `;s.textContent+="+JSON.stringify(centerCss)+";document.head.appendChild(s)");
    }
    js=js.replace(';bindPatients()}\nfunction bindPatients()', ';bindPatients();decoratePatients()}\nfunction bindPatients()');
    return js;
  });
}

const built=dirs[1];
const [questionnaire,center]=await Promise.all([
  readFile(join(built,'questionnaire-engine-v1.js'),'utf8'),
  readFile(join(built,'center-two-tab-workspace-v1.js'),'utf8')
]);
const checks=[
  ['questionnaire opener exported',questionnaire.includes('window.KomoQuestionnaireEngine=')&&questionnaire.includes('async function openAssessment(assessmentId)')],
  ['questionnaire opener only opens own linked patient',questionnaire.includes(".eq('patient_user_id',S.session.user.id)")],
  ['Centre reads connected user id',center.includes('S.userId=session.user.id')],
  ['Centre uses six canonical pre-bilan sections',baseCodes.every(code=>center.includes(code))],
  ['Centre loads questionnaire progress',center.includes("from('questionnaire_sessions')")&&center.includes('loadSelfMotionProgress')],
  ['Centre uses authenticated self-start RPC',center.includes("rpc('komo_start_self_motion_assessment'")],
  ['Centre decorates existing owner only',center.includes('decoratePatients()')&&center.includes('data-k2tw-self-card')],
  ['Centre readability contract applied',center.includes('Centre patient workspace — readable premium clinical surface')&&center.includes('#f3f0e8')]
];
for(const [label,ok] of checks){console.log(`[pulse-center-self-motion-v1] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Centre self Motion consolidation failed');
console.log('[pulse-center-self-motion-v1] PASS · readable Centre + authenticated self Motion questionnaires');
