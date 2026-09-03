import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const dirs=[join(root,'pulse-app'),join(root,'site','pulse-v12')];

async function patch(dir,file,fn){
  const path=join(dir,file);
  let src=await readFile(path,'utf8');
  const next=fn(src);
  if(next!==src)await writeFile(path,next,'utf8');
  return next;
}

for(const dir of dirs){
  await patch(dir,'pulse-bottom-nav-v6.js',src=>{
    let js=src
      .replace("['home','Accueil','⌂','home']","['home','Home','⌂','home']")
      .replace("['key','KEY','◌','key']","['key','Connected','◌','key']")
      .replace("['key','KŌMØ Connected','◌','key']","['key','Connected','◌','key']")
      .replace("  ['trajectory','Trajectoire','⌁','trajectory'],\n",'')
      .replace("  ['trajectory','Mes consultations','⌁','trajectory'],\n",'')
      .replace("['agenda','Rendez-vous','□','documents']","['agenda','Consultations & rendez-vous','□','documents']")
      .replace('grid-template-columns:repeat(6,minmax(0,1fr))','grid-template-columns:repeat(5,minmax(0,1fr))')
      .replace("if(['trajectory','path','plan'].includes(r))return'trajectory';","if(['trajectory','path','plan'].includes(r))return'agenda';")
      .replace("if(['trajectory','path','plan'].includes(r))return'mykomo';","if(['trajectory','path','plan'].includes(r))return'agenda';");
    js=js.replace(/const items=\[[\s\S]*?\n\];/,`const items=[
  ['home','Home','⌂','home'],
  ['results','Résultats','◎','results'],
  ['key','Connected','◌','key'],
  ['agenda','Consultations & rendez-vous','□','documents'],
  ['mykomo','My KŌMØ','◉','mykomo']
];`);
    js=js.replace(/body\.kpulse-app-mode\.kpulse-home-mode \.main-shell\{background:[^}]+\}/,"body.kpulse-app-mode.kpulse-home-mode .main-shell{background:#050706!important}");
    return js;
  });

  await patch(dir,'adaptive-shell-v4.js',src=>{
    let js=src;
    if(!js.includes("mykomo:'<svg")){
      js=js.replace("    center:'<svg", "    mykomo:'<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><circle cx=\"12\" cy=\"8\" r=\"3.2\"/><path d=\"M5.5 20c.6-4 2.7-6 6.5-6s5.9 2 6.5 6\"/></svg>',\n    center:'<svg");
    }
    js=js.replace(
      /const r=route\(\);\s*return navItem\('patient:home'[\s\S]*?navItem\('more','Plus',I\.more,false\);/,
      "const r=route();\n    return navItem('patient:home','Home',I.home,r==='home')+navItem('patient:results','Résultats',I.results,r==='results')+navItem('patient:key','Connected',I.follow,r==='key')+navItem('patient:documents','Consultations & rendez-vous',I.agenda,r==='documents')+navItem('patient:mykomo','My KŌMØ',I.mykomo,r==='mykomo');"
    );
    js=js.replace(
      "primary=actionButton('Rendez-vous','patient:documents')+actionButton('My KŌMØ','patient:mykomo')+actionButton('Messages','patient:messages');",
      "primary=actionButton('Consultations & rendez-vous','patient:documents')+actionButton('My KŌMØ','patient:mykomo');"
    );
    js=js.replace(
      "primary=actionButton('Agenda et réseau','patient:documents')+actionButton('My KŌMØ','patient:mykomo')+actionButton('Messages','patient:messages');",
      "primary=actionButton('Consultations & rendez-vous','patient:documents')+actionButton('My KŌMØ','patient:mykomo');"
    );
    const patientBottomGuard="if(mode()==='patient'){document.querySelector('#kamBottomBar')?.remove();return;}";
    if(!js.includes(patientBottomGuard)){
      js=js.replace(
        "  function ensureBottom(){\n    const app=document.querySelector('#appShell');if(!app)return;",
        `  function ensureBottom(){\n    ${patientBottomGuard}\n    const app=document.querySelector('#appShell');if(!app)return;`
      );
    }
    return js;
  });

  await patch(dir,'my-komo-stable-v5.js',src=>{
    let js=src
      .replace("if(pe)pe.textContent='MY KŌMØ · LOBBY';if(pt)pt.textContent='Votre progression, en mouvement.';","if(pe)pe.textContent='MY KŌMØ';if(pt)pt.textContent='Votre KŌMØ, au même endroit.';")
      .replace(/data-mkv5-route="(?:path|trajectory)">Voir ma trajectoire →/,'data-mkv5-route="results">Voir tous mes résultats →')
      .replace(/data-mkv5-route="(?:path|trajectory)">Ouvrir ma trajectoire/,'data-mkv5-route="documents">Consultations & rendez-vous')
      .replaceAll('data-mkv5-route="trajectory">Voir ma trajectoire →','data-mkv5-route="documents">Consultations & rendez-vous →')
      .replaceAll('data-mkv5-route="path">Voir ma trajectoire →','data-mkv5-route="documents">Consultations & rendez-vous →')
      .replaceAll('data-mkv5-route="trajectory">Mes consultations →','data-mkv5-route="documents">Consultations & rendez-vous →')
      .replaceAll('data-mkv5-route="trajectory">Mes consultations','data-mkv5-route="documents">Consultations & rendez-vous')
      .replace('<div class="mkv4-kicker" style="color:rgba(255,255,255,.55)">TRAJECTOIRE</div><h3>Votre histoire continue.</h3><p>Comparez vos résultats dans le temps et voyez ce qui progresse réellement.</p>','<div class="mkv4-kicker" style="color:rgba(255,255,255,.55)">CONSULTATIONS</div><h3>Votre suivi continue.</h3><p>Retrouvez vos consultations, vos rendez-vous et les prochaines actions décidées avec KŌMØ.</p>');
    if(!js.includes('data-myk-control')){
      const marker='<article class="mkv4-card mkv4-section"><div class="mkv4-head"><div><div class="mkv4-kicker">COLLECTION</div>';
      const cockpit='<article class="mkv4-card mkv4-section" data-myk-control><div class="mkv4-head"><div><div class="mkv4-kicker">CONTROL CENTER</div><h3>Tout contrôler depuis My KŌMØ.</h3><p>Club, résultats, consultations et rendez-vous restent accessibles depuis votre espace personnel.</p></div><span class="mkv4-count">MY KŌMØ</span></div><div class="mkv4-actions"><button class="mkv4-btn primary" data-mkv5-route="club">KŌMØ Club</button><button class="mkv4-btn" data-mkv5-route="results">Résultats</button><button class="mkv4-btn" data-mkv5-route="documents">Consultations & rendez-vous</button></div></article>\n ';
      js=js.replace(marker,cockpit+marker);
    }
    return js;
  });

  await patch(dir,'my-komo-stable-v4.css',src=>src
    .replace(/body\.mykomo-v5 \.main-shell\{background:[^}]+\}/,"body.mykomo-v5 .main-shell{background:#f6f7f5!important}")
    .replace(/\.mkv4-daily\{background:[^}]+\}/,".mkv4-daily{background:#fff}"));

  await patch(dir,'questionnaire-engine-v1.js',src=>{
    let js=src;
    if(!js.includes('async function openAssessment(assessmentId)')){
      const bridge=`async function openAssessment(assessmentId){
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
  return{assessment_id:S.assessment.id,progress:overallProgress(),completed:S.activeCodes.filter(sectionComplete).length,total:S.activeCodes.length};
}
`;
      js=js.replace('function schedule(){',bridge+'\nfunction schedule(){');
    }
    if(!js.includes('window.KomoQuestionnaireEngine=')){
      js=js.replace('setTimeout(schedule,1700);',"setTimeout(schedule,1700);\nwindow.KomoQuestionnaireEngine={openAssessment,refresh:load,progress:()=>({progress:overallProgress(),completed:S.activeCodes.filter(sectionComplete).length,total:S.activeCodes.length,assessment_id:S.assessment?.id||null})};");
    }
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
    js=js.replace(
      "S.rows=d.data?.rows||[];selectedRows()",
      "S.rows=d.data?.rows||[];selectedRows();await loadSelfMotionProgress()"
    );

    if(!js.includes('const SELF_CODES=')){
      const helpers=`const SELF_CODES=['KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'];
const SELF_LABELS={KOMO_BASELINE_CORE:'Profil & sécurité',KOMO_MOBILITY_25:'Mobilité · GLFS‑25',KOMO_SLEEP_RECOVERY:'Sommeil & récupération',KOMO_WELLBEING:'Bien-être',KOMO_LIFESTYLE:'Mode de vie',KOMO_HEALTH_HISTORY:'Antécédents'};
function ownRow(){return S.rows.find(x=>x.patient?.patient_user_id===S.userId&&(!S.orgId||x.patient?.organization_id===S.orgId))||null}
async function loadSelfMotionProgress(){
  const x=ownRow();S.selfProgress={assessmentId:x?.motion?.id||null,completed:0,total:SELF_CODES.length,sessions:[]};
  if(!x?.motion?.id)return S.selfProgress;
  try{const q=await sb().from('questionnaire_sessions').select('instrument_code,status,completeness').eq('assessment_id',x.motion.id).in('instrument_code',SELF_CODES);if(q.error)throw q.error;const sessions=q.data||[];S.selfProgress={assessmentId:x.motion.id,completed:sessions.filter(v=>v.status==='completed'||Number(v.completeness||0)>=100).length,total:SELF_CODES.length,sessions};}catch(e){console.warn('[center-two-tab:self-motion]',e)}return S.selfProgress;
}
function selfDone(code){return !!S.selfProgress?.sessions?.find(x=>x.instrument_code===code&&(x.status==='completed'||Number(x.completeness||0)>=100))}
function selfMotionCard(){const p=S.selfProgress||{completed:0,total:SELF_CODES.length},pct=Math.round((p.completed||0)/Math.max(1,p.total||SELF_CODES.length)*100);return`<aside class="k2tw-self-card"><div class="k2tw-self-head"><span class="k2tw-self-icon">✓</span><div><strong>Préparez votre bilan Motion</strong><small>Répondez maintenant aux questionnaires liés à votre propre compte.</small></div></div><div class="k2tw-self-progress"><div><span>Questionnaires Motion</span><strong>${p.completed||0}/${p.total||SELF_CODES.length} complétés</strong></div><div class="k2tw-progress"><i style="width:${pct}%"></i></div></div><div class="k2tw-self-list">${SELF_CODES.map(c=>`<span class="${selfDone(c)?'done':''}"><i>${selfDone(c)?'✓':'○'}</i>${SELF_LABELS[c]}</span>`).join('')}</div><button type="button" class="k2tw-self-button" data-k2tw-self-motion>${p.completed? 'Continuer mes questionnaires':'Commencer mon bilan Motion'} →</button></aside>`}
function renderSelfHero(){const head=document.querySelector('.kcp-head');if(!head)return;head.querySelector('[data-k2tw-self-hero]')?.remove();const p=S.selfProgress||{completed:0,total:SELF_CODES.length};const box=document.createElement('aside');box.className='k2tw-self-hero';box.dataset.k2twSelfHero='1';box.innerHTML=`<div><small>VOTRE BILAN MOTION</small><strong>${p.completed||0}/${p.total||SELF_CODES.length} questionnaires complétés</strong><span>Complétez votre pré-bilan avant la consultation.</span></div><button type="button" data-k2tw-self-motion>${p.completed?'Continuer':'Commencer mon bilan Motion'} →</button>`;head.appendChild(box)}
async function startSelfMotion(){if(S.selfBusy)return;S.selfBusy=true;document.querySelectorAll('[data-k2tw-self-motion]').forEach(b=>b.disabled=true);try{if(!S.orgId)throw new Error('Sélectionnez un centre.');const q=await sb().rpc('komo_start_self_motion_assessment',{p_organization_id:S.orgId});if(q.error)throw q.error;const assessmentId=q.data?.assessment_id||S.selfProgress?.assessmentId;if(!assessmentId)throw new Error('Bilan Motion introuvable.');await loadRows();if(window.KomoQuestionnaireEngine?.openAssessment){await window.KomoQuestionnaireEngine.openAssessment(assessmentId)}else{notify('Ouverture du pré-bilan Motion…');window.KomoPatientNavigation?.go?.('documents')||(location.hash='documents')}}catch(e){console.error('[center-two-tab:self-start]',e);const msg=e?.message==='profile_incomplete'?'Complétez d’abord votre profil (nom, prénom et date de naissance).':e?.message==='organization_access_required'?'Votre compte n’a pas accès à ce centre.':'Impossible d’ouvrir votre pré-bilan Motion.';notify(msg)}finally{S.selfBusy=false;document.querySelectorAll('[data-k2tw-self-motion]').forEach(b=>b.disabled=false)}}
`;
      js=js.replace('function patientProgress(x){',helpers+'\nfunction patientProgress(x){');
    }

    const premiumCss=`
  /* Centre patient workspace — high contrast premium clinical surface */
  html body.komo-pro-mode .kcp-head{display:grid!important;grid-template-columns:minmax(0,1fr) 190px minmax(270px,340px)!important;align-items:center!important;gap:22px!important;background:linear-gradient(135deg,#07100b,#0b1810 68%,#0c2014)!important;border:1px solid rgba(143,179,154,.16)!important;box-shadow:none!important}
  html body.komo-pro-mode .kcp-head h2{color:#f7f8f5!important;letter-spacing:-.055em!important}
  html body.komo-pro-mode .kcp-head>div:first-child>p:not(.eyebrow){color:#a9b4ac!important;max-width:720px!important}
  html body.komo-pro-mode .kcp-org{border-left:1px solid rgba(255,255,255,.10)!important;color:#f4f6f3!important}.kcp-org span,.kcp-org small{color:#8fa297!important}
  .k2tw-self-hero{display:grid;gap:12px;padding:16px;border:1px solid rgba(143,179,154,.18);border-radius:18px;background:rgba(127,165,138,.08);color:#fff}.k2tw-self-hero div{display:grid;gap:4px}.k2tw-self-hero small{font-size:7px;letter-spacing:.14em;color:#91b49b;font-weight:800}.k2tw-self-hero strong{font-size:12px;color:#fff}.k2tw-self-hero span{font-size:8px;line-height:1.4;color:#aab6ae}.k2tw-self-hero button,.k2tw-self-button{border:0;border-radius:12px;background:#315b41;color:#fff;padding:11px 13px;font:inherit;font-size:9px;font-weight:800;cursor:pointer}.k2tw-self-hero button:disabled,.k2tw-self-button:disabled{opacity:.48;cursor:wait}
  html body.komo-pro-mode #viewRoot .k2tw-patients{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(250px,310px)!important;gap:16px!important;padding:24px!important;border:1px solid #dcd8cf!important;border-radius:28px!important;background:#f3f0e8!important;color:#17231b!important;box-shadow:0 24px 70px rgba(0,0,0,.16)!important}
  html body.komo-pro-mode #viewRoot .k2tw-head{grid-column:1!important;display:flex!important;align-items:flex-end!important;justify-content:space-between!important;gap:20px!important;padding:4px 2px 8px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
  html body.komo-pro-mode #viewRoot .k2tw-head .eyebrow{color:#607268!important}.k2tw-head h2{color:#17231b!important;font-size:34px!important}.k2tw-head p{color:#66736b!important;font-size:10px!important;max-width:560px}
  html body.komo-pro-mode #viewRoot .k2tw-tools label span{color:#647069!important}.k2tw-tools{justify-content:flex-end}.k2tw-tools select,.k2tw-tools input{min-height:40px!important}
  html body.komo-pro-mode #viewRoot .k2tw-tools select,html body.komo-pro-mode #viewRoot .k2tw-tools input{background:#fffdf9!important;border:1px solid #d8d4cb!important;color:#17231b!important;box-shadow:none!important}.k2tw-tools input::placeholder{color:#91978f!important}
  html body.komo-pro-mode #viewRoot .k2tw-kpis{grid-column:1!important}.k2tw-kpi{background:#fffdf9!important;border-color:#ddd9d0!important;box-shadow:none!important}.k2tw-kpi span{color:#68746d!important}.k2tw-kpi strong{color:#17231b!important;font-size:25px!important}
  html body.komo-pro-mode #viewRoot .k2tw-list{grid-column:1!important}.k2tw-row{background:#fffdf9!important;border-color:#ddd9d0!important;box-shadow:none!important}.k2tw-row:hover{border-color:#9fb1a3!important;background:#fff!important}.k2tw-person strong{color:#18241c!important;font-size:11px!important}.k2tw-person span,.k2tw-cell span,.k2tw-cell small{color:#727c75!important}.k2tw-cell strong{color:#26362b!important}.k2tw-progress{background:#e5e1d9!important}.k2tw-progress i{background:#55745e!important}.k2tw-open{background:#263e30!important;color:#fff!important;box-shadow:none!important}.k2tw-pill{background:#f4e7cf!important;color:#7b5a26!important}.k2tw-pill.ok{background:#e3eee5!important;color:#35543e!important}
  .k2tw-self-card{grid-column:2!important;grid-row:1/span 3!important;align-self:stretch;padding:20px;border:1px solid #d9d5cc;border-radius:22px;background:#fffdf9;color:#17231b}.k2tw-self-head{display:flex;gap:11px;align-items:flex-start}.k2tw-self-icon{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:12px;background:#e2eee4;color:#315b41;font-weight:900}.k2tw-self-head div{display:grid;gap:4px}.k2tw-self-head strong{font-size:13px;color:#17231b}.k2tw-self-head small{font-size:9px;line-height:1.45;color:#737d76}.k2tw-self-progress{display:grid;gap:8px;margin-top:22px}.k2tw-self-progress>div:first-child{display:flex;justify-content:space-between;gap:12px}.k2tw-self-progress span,.k2tw-self-progress strong{font-size:9px;color:#4c5b51}.k2tw-self-list{display:grid;gap:10px;margin:18px 0}.k2tw-self-list span{display:flex;align-items:center;gap:9px;font-size:9px;color:#626e66}.k2tw-self-list span i{font-style:normal;color:#9da49e}.k2tw-self-list span.done{color:#315b41;font-weight:700}.k2tw-self-list span.done i{color:#315b41}.k2tw-self-button{width:100%;min-height:42px}
  html body.komo-pro-mode #viewRoot .k2tw-btn{background:#fffdf9!important;color:#24342a!important;border-color:#d6d2ca!important;box-shadow:none!important}.k2tw-btn.primary{background:#263e30!important;color:#fff!important;border-color:#263e30!important}.k2tw-btn.approve{background:#e7efe8!important;color:#31523b!important;border-color:#cbd8cd!important}
  @media(max-width:1180px){html body.komo-pro-mode .kcp-head{grid-template-columns:minmax(0,1fr) 170px!important}.k2tw-self-hero{grid-column:1/-1!important}.k2tw-self-hero{grid-template-columns:1fr auto;align-items:center}.k2tw-self-hero button{min-width:210px}html body.komo-pro-mode #viewRoot .k2tw-patients{grid-template-columns:1fr!important}.k2tw-self-card{grid-column:1!important;grid-row:auto!important}.k2tw-self-list{grid-template-columns:repeat(3,minmax(0,1fr))}}
  `;
    if(!js.includes('Centre patient workspace — high contrast premium clinical surface')){
      js=js.replace('  @media(max-width:900px){',premiumCss+'\n  @media(max-width:900px){');
    }

    const renderPatients=`function renderPatients(){
  if(!isPro()||S.active!=='patients')return;
  const view=document.querySelector('#kcpView'),bar=document.querySelector('#kcpPatientBar'),motion=document.querySelector('#kcpMotionHost');if(!view)return;if(bar)bar.hidden=true;if(motion)motion.hidden=true;view.hidden=false;
  document.querySelector('#pageEyebrow').textContent='KŌMØ CENTRE · PATIENTS';document.querySelector('#pageTitle').textContent='Tous les patients, un dossier unique.';
  const rows=selectedRows(),pending=rows.filter(x=>['submitted','assigned','scheduled'].includes(x.request?.status)).length,incomplete=rows.filter(x=>Number(x.preparation?.percent||0)<100).length,scored=rows.filter(x=>x.score?.motion_score!=null).length;
  view.innerHTML=\`<section class="k2tw-patients"><header class="k2tw-head"><div><p class="eyebrow">ESPACE CENTRE · DOSSIERS PATIENTS</p><h2>Mes patients.</h2><p>Ouvrez un dossier pour suivre les scores, valider une demande, importer MyoCare et échanger avec le patient.</p></div><div class="k2tw-tools"><label><span>Centre</span><select id="k2twOrg">\${orgs().map(o=>\`<option value="\${o.id}" \${o.id===S.orgId?'selected':''}>\${esc(o.name)}</option>\`).join('')}</select></label><label><span>Recherche</span><input id="k2twSearch" type="search" placeholder="Nom, e-mail, référence…" value="\${esc(S.search)}"></label><button type="button" class="k2tw-btn" id="k2twRefresh">Actualiser</button></div></header><div class="k2tw-kpis"><div class="k2tw-kpi"><span>Patients</span><strong>\${rows.length}</strong></div><div class="k2tw-kpi"><span>Demandes / validation</span><strong>\${pending}</strong></div><div class="k2tw-kpi"><span>Préparation incomplète</span><strong>\${incomplete}</strong></div><div class="k2tw-kpi"><span>Motion scoré</span><strong>\${scored}</strong></div></div>\${S.error?\`<div class="k2tw-empty">\${esc(S.error)}</div>\`:\`<div class="k2tw-list">\${S.loading?'<div class="k2tw-empty">Chargement des patients…</div>':rows.length?rows.map(rowHtml).join(''):'<div class="k2tw-empty">Aucun patient dans ce centre.</div>'}</div>\`}\${selfMotionCard()}</section>\`;
  renderSelfHero();bindPatients();
}`;
    js=js.replace(/function renderPatients\(\)\{[\s\S]*?\nfunction bindPatients\(\)/,renderPatients+'\nfunction bindPatients()');
    js=js.replace(/function bindPatients\(\)\{[\s\S]*?\n\nasync function openDossier/,`function bindPatients(){
  document.querySelector('#k2twRefresh')?.addEventListener('click',loadRows);
  document.querySelector('#k2twSearch')?.addEventListener('input',e=>{S.search=e.target.value;renderPatients()});
  document.querySelector('#k2twOrg')?.addEventListener('change',async e=>{S.orgId=e.target.value;localStorage.setItem(ORG_KEY,S.orgId);localStorage.removeItem(PATIENT_KEY);localStorage.removeItem(ASSESSMENT_KEY);await loadSelfMotionProgress();renderPatients()});
  document.querySelectorAll('[data-k2tw-open]').forEach(b=>b.addEventListener('click',()=>openDossier(b.dataset.k2twOpen)));
  document.querySelectorAll('[data-k2tw-self-motion]').forEach(b=>b.addEventListener('click',startSelfMotion));
}

async function openDossier`);
    return js;
  });
}

const built=dirs[1];
const [dock,adaptive,myk,mycss,results,connected,consultations,questionnaire,center]=await Promise.all([
  readFile(join(built,'pulse-bottom-nav-v6.js'),'utf8'),
  readFile(join(built,'adaptive-shell-v4.js'),'utf8'),
  readFile(join(built,'my-komo-stable-v5.js'),'utf8'),
  readFile(join(built,'my-komo-stable-v4.css'),'utf8'),
  readFile(join(built,'patient-canonical-results.js'),'utf8'),
  readFile(join(built,'key-hub-v1.js'),'utf8'),
  readFile(join(built,'trajectory-v3.js'),'utf8'),
  readFile(join(built,'questionnaire-engine-v1.js'),'utf8'),
  readFile(join(built,'center-two-tab-workspace-v1.js'),'utf8')
]);
const exactDock=`const items=[
  ['home','Home','⌂','home'],
  ['results','Résultats','◎','results'],
  ['key','Connected','◌','key'],
  ['agenda','Consultations & rendez-vous','□','documents'],
  ['mykomo','My KŌMØ','◉','mykomo']
];`;
const exactAdaptive="navItem('patient:home','Home',I.home,r==='home')+navItem('patient:results','Résultats',I.results,r==='results')+navItem('patient:key','Connected',I.follow,r==='key')+navItem('patient:documents','Consultations & rendez-vous',I.agenda,r==='documents')+navItem('patient:mykomo','My KŌMØ',I.mykomo,r==='mykomo')";
const patientBottomGuard="if(mode()==='patient'){document.querySelector('#kamBottomBar')?.remove();return;}";
const checks=[
  ['desktop dock has exactly five patient destinations',(dock.match(/^\s*\['(?:home|key|results|agenda|mykomo)'/gm)||[]).length===5],
  ['desktop dock exact approved order',dock.includes(exactDock)],
  ['desktop dock routes trajectory aliases into Consultations',dock.includes("if(['trajectory','path','plan'].includes(r))return'agenda';")],
  ['adaptive navigation exact approved order',adaptive.includes(exactAdaptive)&&!adaptive.includes("navItem('patient:trajectory'")],
  ['adaptive shell does not create a patient bottom bar',adaptive.includes(patientBottomGuard)],
  ['patient Messages removed from adaptive primary menu',!adaptive.includes("actionButton('Messages','patient:messages')")],
  ['My KŌMØ exposes Club',myk.includes('data-myk-control')&&myk.includes('data-mkv5-route="club"')],
  ['My KŌMØ routes core score to Results',myk.includes('data-mkv5-route="results">Voir tous mes résultats')],
  ['My KŌMØ has one consultations destination',myk.includes('data-mkv5-route="documents">Consultations & rendez-vous')&&!myk.includes('data-mkv5-route="trajectory">Mes consultations')],
  ['My KŌMØ outer beige removed',mycss.includes('body.mykomo-v5 .main-shell{background:#f6f7f5!important}')],
  ['Results contains Motion KEY Clinical',results.includes('KŌMØ MOTION')&&results.includes('KEY · QUOTIDIEN')&&results.includes('CLINICAL')],
  ['Results states questionnaires do not modify Motion Score',results.includes('GLFS‑25')&&results.includes('sans modifier le score')],
  ['Results uses green red neutral semantics',results.includes("'good'")&&results.includes("'bad'")&&results.includes("'neutral'")],
  ['Connected is single key owner',connected.includes('KŌMØ Connected.')&&connected.includes("route()!=='key'")],
  ['Consultations owns care plan',consultations.includes('PLAN DE SOIN')&&consultations.includes('Mes prochaines consultations.')],
  ['Consultations no longer owns score charts',!consultations.includes('Motion Score au fil des bilans')],
  ['questionnaire engine exposes authenticated assessment opener',questionnaire.includes('async function openAssessment(assessmentId)')&&questionnaire.includes('window.KomoQuestionnaireEngine=')],
  ['questionnaire opener verifies assessment belongs to connected account',questionnaire.includes(".eq('patient_user_id',S.session.user.id)")],
  ['Centre owns personal Motion CTA',center.includes('data-k2tw-self-motion')&&center.includes('komo_start_self_motion_assessment')],
  ['Centre personal preparation uses six real questionnaire sections',center.includes("'KOMO_BASELINE_CORE','KOMO_MOBILITY_25','KOMO_SLEEP_RECOVERY','KOMO_WELLBEING','KOMO_LIFESTYLE','KOMO_HEALTH_HISTORY'")],
  ['Centre high contrast visual contract loaded',center.includes('Centre patient workspace — high contrast premium clinical surface')&&center.includes('background:#f3f0e8!important'))
];
for(const [label,ok] of checks){console.log(`[pulse-ia-v11] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Pulse information architecture v11 guard failed');
console.log('[pulse-ia-v11] PASS · five-item patient navigation + readable Centre + self Motion questionnaire flow frozen');
