import { readFile, writeFile } from 'node:fs/promises';

const cockpitPath='pulse-app/clinical-cockpit-v1.js';
let src=await readFile(cockpitPath,'utf8');

function replaceOnce(from,to,label){
  if(!src.includes(from)) throw new Error(`[global-patient-selector-v1] missing ${label}`);
  src=src.replace(from,to);
}

replaceOnce(
  "const K={patient:'komo_clinical_patient',assessment:'komo_clinical_assessment',tab:'komo_clinical_tab',org:'komo_clinical_org'};",
  "const K={patient:'komo_clinical_patient',assessment:'komo_clinical_assessment',tab:'komo_clinical_tab',org:'komo_clinical_org',pulseUser:'komo_clinical_pulse_user'};",
  'pulse selection storage key'
);

replaceOnce(
  "const s={client:null,session:null,role:'member',org:null,membership:null,memberships:[],patients:[],pulseAccounts:[],assessments:[],scores:[],imports:[],priorities:[],contexts:[],appointments:[],patient:null,assessment:null,tab:localStorage.getItem(K.tab)||'dashboard',loaded:false};",
  "const s={client:null,session:null,role:'member',org:null,membership:null,memberships:[],patients:[],pulseAccounts:[],pulseAccount:null,assessments:[],scores:[],imports:[],priorities:[],contexts:[],appointments:[],patient:null,assessment:null,tab:localStorage.getItem(K.tab)||'dashboard',loaded:false};",
  'pulse account state'
);

replaceOnce(
  "const saved=localStorage.getItem(K.patient);s.patient=s.patients.find(x=>x.id===saved)||s.patients[0]||null;if(s.patient)localStorage.setItem(K.patient,s.patient.id);const sa=localStorage.getItem(K.assessment);s.assessment=s.assessments.find(x=>x.id===sa&&x.patient_id===s.patient?.id)||latestAssessment(s.patient?.id);if(s.assessment)localStorage.setItem(K.assessment,s.assessment.id);s.loaded=true;return true}",
  "const savedPulse=s.role==='admin'?localStorage.getItem(K.pulseUser):null;if(s.role!=='admin')localStorage.removeItem(K.pulseUser);s.pulseAccount=s.role==='admin'?s.pulseAccounts.find(x=>x.user_id===savedPulse)||null:null;const saved=localStorage.getItem(K.patient);s.patient=s.pulseAccount?null:(s.patients.find(x=>x.id===saved)||s.patients[0]||null);if(!s.patient&&!s.pulseAccount&&s.role==='admin'&&s.pulseAccounts.length)s.pulseAccount=s.pulseAccounts[0];if(s.patient)localStorage.setItem(K.patient,s.patient.id);const sa=localStorage.getItem(K.assessment);s.assessment=s.patient?(s.assessments.find(x=>x.id===sa&&x.patient_id===s.patient?.id)||latestAssessment(s.patient?.id)):null;if(s.assessment)localStorage.setItem(K.assessment,s.assessment.id);s.loaded=true;return true}",
  'persisted global patient selection'
);

const helpers=`function pulseName(x){const p=x?.profile||{};return (String(p.first_name||'')+' '+String(p.last_name||'')).trim()||p.display_name||x?.email||'Patient Pulse'}
function patientSelectOptions(){const patientOptions=s.patients.map(p=>'<option value="'+p.id+'"'+(p.id===s.patient?.id?' selected':'')+'>'+esc(name(p))+(s.role==='admin'&&p.organizations?.name?' · '+esc(p.organizations.name):'')+'</option>').join('');const pulseOptions=s.role==='admin'?s.pulseAccounts.map(x=>'<option value="pulse:'+x.user_id+'"'+(x.user_id===s.pulseAccount?.user_id?' selected':'')+'>'+esc(pulseName(x))+' · Pulse · à orienter</option>').join(''):'';return (patientOptions?'<optgroup label="Dossiers Motion">'+patientOptions+'</optgroup>':'')+(pulseOptions?'<optgroup label="Comptes Pulse à orienter">'+pulseOptions+'</optgroup>':'')}
function bindPatientSelect(){document.querySelector('#kcpPatientSelect')?.addEventListener('change',x=>selectAnyPatient(x.target.value))}
function renderPulseAccountBar(e){if(!s.pulseAccount)return false;const x=s.pulseAccount,p=x.profile||{},loc=[p.city,p.country].filter(Boolean).join(', ')||'Centre à définir';e.innerHTML='<div class="kcp-patientbar"><div class="kcp-patient-select"><label>Patient actif</label><select id="kcpPatientSelect">'+patientSelectOptions()+'</select></div><div class="kcp-patient-meta"><span>Compte Pulse</span><span>'+esc(x.email||'—')+'</span><span>'+esc(loc)+'</span><span>À orienter vers un centre</span><span>Aucun dossier Motion</span></div><div class="kcp-patient-score"><span>Motion</span><strong>—</strong></div></div>';bindPatientSelect();return true}
`;
replaceOnce('function patientBar(){',helpers+'function patientBar(){','patient selector helpers');

replaceOnce(
  "function patientBar(){const e=document.querySelector('#kcpPatientBar');if(!e)return;if(!s.patient){",
  "function patientBar(){const e=document.querySelector('#kcpPatientBar');if(!e)return;if(renderPulseAccountBar(e))return;if(!s.patient){",
  'pulse patient bar branch'
);

replaceOnce(
  "${s.patients.map(p=>`<option value=\"${p.id}\" ${p.id===s.patient.id?'selected':''}>${esc(name(p))}</option>`).join('')}",
  "${patientSelectOptions()}",
  'combined patient dropdown options'
);

replaceOnce(
  ";document.querySelector('#kcpPatientSelect')?.addEventListener('change',x=>selectPatient(x.target.value))}",
  ";bindPatientSelect()}",
  'combined patient dropdown binding'
);

replaceOnce(
  "function snapshot(){if(!s.patient)return empty('Aucun patient.');",
  "function snapshot(){if(s.pulseAccount){const x=s.pulseAccount,p=x.profile||{},loc=[p.city,p.country].filter(Boolean).join(', ')||'Centre à définir';return '<div class=\"kcp-scorebox\"><div class=\"kcp-scorebig\">—<small>/100</small></div><div><strong>'+esc(pulseName(x))+'</strong><p>Compte Pulse · aucun dossier Motion</p><p>'+esc(x.email||'—')+' · '+esc(loc)+'</p></div></div>'}if(!s.patient)return empty('Aucun patient.');",
  'pulse account dashboard snapshot'
);

replaceOnce(
  "function switchTab(tab){if(!TABS.some(x=>x[0]===tab))tab='dashboard';s.tab=tab;localStorage.setItem(K.tab,tab);render();if(tab==='motion')setTimeout(()=>document.querySelector('#kcpMotionHost')?.scrollIntoView({behavior:'smooth',block:'start'}),50)}",
  "function switchTab(tab){if(!TABS.some(x=>x[0]===tab))tab='dashboard';if(s.pulseAccount&&tab==='motion'){toast('Orientez d’abord ce compte Pulse vers un centre avant de lancer Motion.');return}s.tab=tab;localStorage.setItem(K.tab,tab);render();if(tab==='motion')setTimeout(()=>document.querySelector('#kcpMotionHost')?.scrollIntoView({behavior:'smooth',block:'start'}),50)}",
  'block Motion before center assignment'
);

replaceOnce(
  "async function selectPatient(id){if(!id)return;localStorage.setItem(K.patient,id);localStorage.removeItem(K.assessment);s.patient=patientFor(id);s.assessment=latestAssessment(id);if(s.assessment)localStorage.setItem(K.assessment,s.assessment.id);render();window.dispatchEvent(new CustomEvent('komo:clinical-patient-changed',{detail:{patientId:id}}));setTimeout(schedule,180)}",
  "async function selectAnyPatient(value){if(!value)return;if(value.startsWith('pulse:')){const uid=value.slice(6);s.pulseAccount=s.pulseAccounts.find(x=>x.user_id===uid)||null;s.patient=null;s.assessment=null;localStorage.setItem(K.pulseUser,uid);localStorage.removeItem(K.patient);localStorage.removeItem(K.assessment);if(s.tab==='motion'){s.tab='dashboard';localStorage.setItem(K.tab,'dashboard')}render();return}await selectPatient(value)}\nasync function selectPatient(id){if(!id)return;s.pulseAccount=null;localStorage.removeItem(K.pulseUser);localStorage.setItem(K.patient,id);localStorage.removeItem(K.assessment);s.patient=patientFor(id);s.assessment=latestAssessment(id);if(s.assessment)localStorage.setItem(K.assessment,s.assessment.id);render();window.dispatchEvent(new CustomEvent('komo:clinical-patient-changed',{detail:{patientId:id}}));setTimeout(schedule,180)}",
  'global patient selection handler'
);

await writeFile(cockpitPath,src);
console.log('[global-patient-selector-v1] Admin selector now includes Motion dossiers and Pulse-only accounts.');
