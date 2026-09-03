import { readFile, writeFile } from 'node:fs/promises';

const cockpitPath='pulse-app/clinical-cockpit-v1.js';
let src=await readFile(cockpitPath,'utf8');

function replaceOnce(from,to,label,marker=''){
  if(src.includes(from)){
    src=src.replace(from,to);
    return;
  }
  if(marker&&src.includes(marker)) return;
  throw new Error(`[global-patient-selector-v1] missing ${label}`);
}

replaceOnce(
  "const K={patient:'komo_clinical_patient',assessment:'komo_clinical_assessment',tab:'komo_clinical_tab',org:'komo_clinical_org'};",
  "const K={patient:'komo_clinical_patient',assessment:'komo_clinical_assessment',tab:'komo_clinical_tab',org:'komo_clinical_org',pulseUser:'komo_clinical_pulse_user'};",
  'pulse selection storage key',
  "pulseUser:'komo_clinical_pulse_user'"
);

replaceOnce(
  "const s={client:null,session:null,role:'member',org:null,membership:null,memberships:[],patients:[],pulseAccounts:[],assessments:[],scores:[],imports:[],priorities:[],contexts:[],appointments:[],patient:null,assessment:null,tab:localStorage.getItem(K.tab)||'dashboard',loaded:false};",
  "const s={client:null,session:null,role:'member',org:null,membership:null,memberships:[],patients:[],pulseAccounts:[],pulseAccount:null,assessments:[],scores:[],imports:[],priorities:[],contexts:[],appointments:[],patient:null,assessment:null,tab:localStorage.getItem(K.tab)||'dashboard',loaded:false};",
  'pulse account state',
  'pulseAccount:null'
);

replaceOnce(
  "const saved=localStorage.getItem(K.patient);s.patient=s.patients.find(x=>x.id===saved)||s.patients[0]||null;if(s.patient)localStorage.setItem(K.patient,s.patient.id);const sa=localStorage.getItem(K.assessment);s.assessment=s.assessments.find(x=>x.id===sa&&x.patient_id===s.patient?.id)||latestAssessment(s.patient?.id);if(s.assessment)localStorage.setItem(K.assessment,s.assessment.id);s.loaded=true;return true}",
  "const savedPulse=s.role==='admin'?localStorage.getItem(K.pulseUser):null;if(s.role!=='admin')localStorage.removeItem(K.pulseUser);s.pulseAccount=s.role==='admin'?s.pulseAccounts.find(x=>x.user_id===savedPulse)||null:null;const saved=localStorage.getItem(K.patient);s.patient=s.pulseAccount?null:(s.patients.find(x=>x.id===saved)||s.patients[0]||null);if(!s.patient&&!s.pulseAccount&&s.role==='admin'&&s.pulseAccounts.length)s.pulseAccount=s.pulseAccounts[0];if(s.patient)localStorage.setItem(K.patient,s.patient.id);const sa=localStorage.getItem(K.assessment);s.assessment=s.patient?(s.assessments.find(x=>x.id===sa&&x.patient_id===s.patient?.id)||latestAssessment(s.patient?.id)):null;if(s.assessment)localStorage.setItem(K.assessment,s.assessment.id);s.loaded=true;return true}",
  'persisted global patient selection',
  "const savedPulse=s.role==='admin'?localStorage.getItem(K.pulseUser):null"
);

const helpers=`function pulseName(x){const p=x?.profile||{};return (String(p.first_name||'')+' '+String(p.last_name||'')).trim()||p.display_name||x?.email||'Patient Pulse'}
function freePrep(x){const f=x?.free_preparation||{};const completed=Number(f.completed||0),level=Number(f.free_level),q=Number(f.first_score),chair=Number(f.chair_repetitions),two=Number(f.two_step_ratio);return{ready:completed>=3&&Number.isFinite(level),level:Number.isFinite(level)?Math.round(level):null,label:f.free_label||'Résultat disponible',q:Number.isFinite(q)?Math.round(q):null,chair:Number.isFinite(chair)?Math.round(chair):null,two:Number.isFinite(two)?two:null}}
function freeLine(x){const f=freePrep(x);return f.ready?'KŌMØ Start · Niveau '+f.level+' · Q '+(f.q??'—')+'/100 · Chair '+(f.chair??'—')+' · Two-Step '+(f.two===null?'—':f.two.toFixed(2)):'KŌMØ Start · à compléter'}
function patientSelectOptions(){const patientOptions=s.patients.map(p=>'<option value="'+p.id+'"'+(p.id===s.patient?.id?' selected':'')+'>'+esc(name(p))+(s.role==='admin'&&p.organizations?.name?' · '+esc(p.organizations.name):'')+'</option>').join('');const pulseOptions=s.role==='admin'?s.pulseAccounts.map(x=>'<option value="pulse:'+x.user_id+'"'+(x.user_id===s.pulseAccount?.user_id?' selected':'')+'>'+esc(pulseName(x))+' · Pulse · à orienter</option>').join(''):'';return (patientOptions?'<optgroup label="Dossiers Motion">'+patientOptions+'</optgroup>':'')+(pulseOptions?'<optgroup label="Comptes Pulse à orienter">'+pulseOptions+'</optgroup>':'')}
function bindPatientSelect(){document.querySelector('#kcpPatientSelect')?.addEventListener('change',x=>selectAnyPatient(x.target.value))}
function renderPulseAccountBar(e){if(!s.pulseAccount)return false;const x=s.pulseAccount,p=x.profile||{},loc=[p.city,p.country].filter(Boolean).join(', ')||'Centre à définir',f=freePrep(x);e.innerHTML='<div class="kcp-patientbar"><div class="kcp-patient-select"><label>Patient actif</label><select id="kcpPatientSelect">'+patientSelectOptions()+'</select></div><div class="kcp-patient-meta"><span>Compte Pulse</span><span>'+esc(x.email||'—')+'</span><span>'+esc(loc)+'</span><span>'+esc(freeLine(x))+'</span><span>À orienter vers un centre</span></div><div class="kcp-patient-score"><span>KŌMØ Start</span><strong>'+(f.ready?'N'+f.level:'—')+'</strong></div></div>';bindPatientSelect();return true}
`;
replaceOnce('function patientBar(){',helpers+'function patientBar(){','patient selector helpers','function patientSelectOptions(){');

replaceOnce(
  "function patientBar(){const e=document.querySelector('#kcpPatientBar');if(!e)return;if(!s.patient){",
  "function patientBar(){const e=document.querySelector('#kcpPatientBar');if(!e)return;if(renderPulseAccountBar(e))return;if(!s.patient){",
  'pulse patient bar branch',
  'if(renderPulseAccountBar(e))return'
);

replaceOnce(
  "${s.patients.map(p=>`<option value=\"${p.id}\" ${p.id===s.patient.id?'selected':''}>${esc(name(p))}</option>`).join('')}",
  "${patientSelectOptions()}",
  'combined patient dropdown options',
  '<select id="kcpPatientSelect">${patientSelectOptions()}</select>'
);

replaceOnce(
  ";document.querySelector('#kcpPatientSelect')?.addEventListener('change',x=>selectPatient(x.target.value))}",
  ";bindPatientSelect()}",
  'combined patient dropdown binding',
  ';bindPatientSelect()}'
);

replaceOnce(
  "function snapshot(){if(!s.patient)return empty('Aucun patient.');",
  "function snapshot(){if(s.pulseAccount){const x=s.pulseAccount,p=x.profile||{},loc=[p.city,p.country].filter(Boolean).join(', ')||'Centre à définir',f=freePrep(x);return '<div class=\"kcp-scorebox\"><div class=\"kcp-scorebig\">'+(f.ready?'N'+f.level:'—')+'<small> Start</small></div><div><strong>'+esc(pulseName(x))+'</strong><p>'+esc(f.ready?(f.label+' · Q '+(f.q??'—')+'/100 · Chair '+(f.chair??'—')+' · Two-Step '+(f.two===null?'—':f.two.toFixed(2))):'KŌMØ Start à compléter')+'</p><p>'+esc(x.email||'—')+' · '+esc(loc)+'</p><p>Aucun dossier Motion · orientation vers un centre requise</p></div></div>'}if(!s.patient)return empty('Aucun patient.');",
  'pulse account dashboard snapshot',
  'function snapshot(){if(s.pulseAccount)'
);

replaceOnce(
  "function switchTab(tab){if(!TABS.some(x=>x[0]===tab))tab='dashboard';s.tab=tab;localStorage.setItem(K.tab,tab);render();if(tab==='motion')setTimeout(()=>document.querySelector('#kcpMotionHost')?.scrollIntoView({behavior:'smooth',block:'start'}),50)}",
  "function switchTab(tab){if(!TABS.some(x=>x[0]===tab))tab='dashboard';if(s.pulseAccount&&tab==='motion'){toast('Orientez d’abord ce compte Pulse vers un centre avant de lancer Motion.');return}s.tab=tab;localStorage.setItem(K.tab,tab);render();if(tab==='motion')setTimeout(()=>document.querySelector('#kcpMotionHost')?.scrollIntoView({behavior:'smooth',block:'start'}),50)}",
  'block Motion before center assignment',
  "if(s.pulseAccount&&tab==='motion')"
);

replaceOnce(
  "async function selectPatient(id){if(!id)return;localStorage.setItem(K.patient,id);localStorage.removeItem(K.assessment);s.patient=patientFor(id);s.assessment=latestAssessment(id);if(s.assessment)localStorage.setItem(K.assessment,s.assessment.id);render();window.dispatchEvent(new CustomEvent('komo:clinical-patient-changed',{detail:{patientId:id}}));setTimeout(schedule,180)}",
  "async function selectAnyPatient(value){if(!value)return;if(value.startsWith('pulse:')){const uid=value.slice(6);s.pulseAccount=s.pulseAccounts.find(x=>x.user_id===uid)||null;s.patient=null;s.assessment=null;localStorage.setItem(K.pulseUser,uid);localStorage.removeItem(K.patient);localStorage.removeItem(K.assessment);if(s.tab==='motion'){s.tab='dashboard';localStorage.setItem(K.tab,'dashboard')}render();return}await selectPatient(value)}\nasync function selectPatient(id){if(!id)return;s.pulseAccount=null;localStorage.removeItem(K.pulseUser);localStorage.setItem(K.patient,id);localStorage.removeItem(K.assessment);s.patient=patientFor(id);s.assessment=latestAssessment(id);if(s.assessment)localStorage.setItem(K.assessment,s.assessment.id);render();window.dispatchEvent(new CustomEvent('komo:clinical-patient-changed',{detail:{patientId:id}}));setTimeout(schedule,180)}",
  'global patient selection handler',
  'async function selectAnyPatient(value)'
);

await writeFile(cockpitPath,src);
console.log('[global-patient-selector-v1] Admin selector includes Motion dossiers and Pulse-only KŌMØ Start results.');
