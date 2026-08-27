import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pulse=path.join(root,'site','pulse-v12');
const appPath=path.join(pulse,'app.js');
const patientPath=path.join(pulse,'patient-v4.js');
const bookingPath=path.join(pulse,'booking-layer-v1.js');
const cssPath=path.join(pulse,'pulse-ui-v1.css');

for(const file of [appPath,patientPath,bookingPath,cssPath]){
  if(!fs.existsSync(file)) throw new Error(`[pulse-navigation-freeze] missing ${file}`);
}

function replaceRequired(src,from,to,label){
  if(src.includes(to)) return src;
  if(!src.includes(from)) throw new Error(`[pulse-navigation-freeze] missing ${label}`);
  return src.replace(from,to);
}

let app=fs.readFileSync(appPath,'utf8');
app=replaceRequired(
  app,
  "documents:'[data-patient-v4=\"documents\"]'",
  "documents:'[data-kbook-patient]'",
  'booking route owner'
);
fs.writeFileSync(appPath,app);

let patient=fs.readFileSync(patientPath,'utf8');
patient=replaceRequired(
  patient,
  "const TARGETS=new Set(['plan','documents']);",
  "const TARGETS=new Set(['plan']);",
  'patient-v4 booking ownership removal'
);
fs.writeFileSync(patientPath,patient);

let booking=fs.readFileSync(bookingPath,'utf8');
booking=replaceRequired(
  booking,
  "async function loadPatientSlots(){if(!S.patientOrg)return;S.patientLoading=true;S.patientError='';renderPatient();try{const q=await sb().rpc('komo_booking_slots',{p_organization_id:S.patientOrg,p_service:S.patientService,p_start_date:S.patientStart,p_days:7});if(q.error)throw q.error;S.patientSlots=q.data||[]}catch(e){S.patientError=e.message||'Disponibilités indisponibles.'}finally{S.patientLoading=false;renderPatient()}}",
  "function setPatientBusy(flag){const node=document.querySelector('[data-kbook-patient]');if(node)node.classList.toggle('is-loading',flag)}async function loadPatientSlots(){if(!S.patientOrg){S.patientSlots=[];S.patientLoading=false;renderPatient();return}S.patientLoading=true;S.patientError='';setPatientBusy(true);try{const q=await sb().rpc('komo_booking_slots',{p_organization_id:S.patientOrg,p_service:S.patientService,p_start_date:S.patientStart,p_days:7});if(q.error)throw q.error;S.patientSlots=q.data||[]}catch(e){S.patientError=e.message||'Disponibilités indisponibles.'}finally{S.patientLoading=false;renderPatient()}}",
  'booking slot stable refresh'
);
booking=replaceRequired(
  booking,
  "async function loadPatient(){S.patientLoading=true;S.patientError='';renderPatient();try{await Promise.all([loadCenters(),loadPatientAppointments()]);await loadPatientSlots()}catch(e){S.patientError=e.message||'Planning indisponible.';S.patientLoading=false;renderPatient()}}",
  "async function loadPatient(){S.patientLoading=true;S.patientError='';setPatientBusy(true);try{await Promise.all([loadCenters(),loadPatientAppointments()]);await loadPatientSlots()}catch(e){S.patientError=e.message||'Planning indisponible.';S.patientLoading=false;renderPatient()}}",
  'booking initial single paint'
);
booking=replaceRequired(
  booking,
  "async function refresh(){try{if(!await base())return;if(location.hash.replace(/^#/,'')==='documents'&&!['professional','admin'].includes(S.role))await loadPatient()}catch(e){console.error(e)}}",
  "async function refresh(){try{if(location.hash.replace(/^#/,'')!=='documents'||document.querySelector('[data-kbook-patient]')||S.patientLoading)return;if(!await base())return;if(!['professional','admin'].includes(S.role))await loadPatient()}catch(e){console.error(e)}}",
  'booking mount dedupe'
);
booking=booking.replace(
  "async function bookPatient(slot){const c=S.centers.find(x=>x.id===S.patientOrg),tz=c?.timezone||'Europe/Paris';if(!confirm(`${serviceLabel(S.patientService)} · ${c?.name||'Centre KŌMØ'}\\n${fullDate(slot,tz)}\\n\\nConfirmer ce créneau ?`))return;S.patientLoading=true;renderPatient();",
  "async function bookPatient(slot){const c=S.centers.find(x=>x.id===S.patientOrg),tz=c?.timezone||'Europe/Paris';if(!confirm(`${serviceLabel(S.patientService)} · ${c?.name||'Centre KŌMØ'}\\n${fullDate(slot,tz)}\\n\\nConfirmer ce créneau ?`))return;S.patientLoading=true;setPatientBusy(true);"
);
fs.writeFileSync(bookingPath,booking);

let css=fs.readFileSync(cssPath,'utf8');
if(!css.includes('/* Frozen navigation polish */')) css+=`\n\n/* Frozen navigation polish */\n.sidebar,.topbar,.nav-stack,.kam-bottom,.kam-role-row,.kam-role-switch{isolation:isolate}\n.nav-item,.kam-nav-item,.kam-role-switch button,.kam-top-menu{transform:none!important;will-change:auto!important}\n.nav-item,.kam-nav-item{transition:background-color .14s ease,color .14s ease,border-color .14s ease,box-shadow .14s ease!important}\n.kbook.patient.is-loading .kbook-days{opacity:.58;pointer-events:none}\n.kbook.patient.is-loading .kbook-controls,.kbook.patient.is-loading .kbook-week-actions{pointer-events:none}\n.kbook.patient .kbook-days{transition:opacity .14s ease}\n@media(min-width:821px){\n  .sidebar{background:rgba(248,246,241,.975);border-right:1px solid rgba(31,42,34,.075);box-shadow:10px 0 36px rgba(31,42,34,.035)}\n  .nav-stack{gap:8px}\n  .nav-item{width:68px;min-height:58px;border:1px solid transparent;border-radius:17px;color:#747a74}\n  .nav-item:hover{background:rgba(255,255,255,.7);border-color:rgba(31,42,34,.07);color:#29362e}\n  .nav-item.active{background:#263229;color:#fff;border-color:#263229;box-shadow:0 10px 24px rgba(31,42,34,.13)}\n  .nav-item.active svg{stroke-width:1.7}\n  .topbar{padding-top:27px;padding-bottom:18px;background:linear-gradient(to bottom,rgba(244,241,235,.98) 82%,rgba(244,241,235,.88));border-bottom:1px solid rgba(31,42,34,.055);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}\n  .mode-switch{background:rgba(255,255,255,.7);box-shadow:0 8px 24px rgba(31,42,34,.035)}\n  .icon-button{background:rgba(255,255,255,.72);box-shadow:0 8px 24px rgba(31,42,34,.035)}\n}\nhtml[data-adaptive-shell] .topbar{background:rgba(246,242,234,.965)!important;border-bottom:1px solid rgba(31,42,34,.07)!important;box-shadow:0 8px 30px rgba(31,42,34,.035)!important}\nhtml[data-adaptive-shell] .kam-top-menu{border-color:rgba(255,255,255,.09);background:linear-gradient(145deg,#2b3930,#202b24);box-shadow:0 10px 26px rgba(31,42,34,.16)}\nhtml[data-adaptive-shell] .kam-role-row{background:linear-gradient(to bottom,rgba(246,242,234,.985) 84%,rgba(246,242,234,.9))}\nhtml[data-adaptive-shell] .kam-role-switch{border-color:rgba(31,42,34,.085);background:rgba(255,255,255,.68);box-shadow:0 8px 28px rgba(31,42,34,.045)}\nhtml[data-adaptive-shell] .kam-role-switch button.active{background:#263229;color:#fff;box-shadow:0 7px 18px rgba(31,42,34,.13)}\nhtml[data-adaptive-shell] .kam-bottom{border-color:rgba(31,42,34,.085);background:rgba(252,250,246,.975);box-shadow:0 18px 52px rgba(27,34,29,.14),0 1px 0 rgba(255,255,255,.86) inset}\nhtml[data-adaptive-shell] .kam-nav-item{border:1px solid transparent;color:#747c75}\nhtml[data-adaptive-shell] .kam-nav-item.active{background:linear-gradient(145deg,#2a382f,#222e27);border-color:rgba(31,42,34,.9);color:#fff;box-shadow:0 8px 18px rgba(31,42,34,.12)}\nhtml[data-adaptive-shell] .kam-nav-item.active svg{stroke-width:1.75}\n@media(prefers-reduced-motion:reduce){.nav-item,.kam-nav-item,.kam-role-switch button,.kbook.patient .kbook-days{transition:none!important}}\n`;
fs.writeFileSync(cssPath,css);

console.log('[pulse-navigation-freeze] RDV single owner + frozen menu polish applied');
