import fs from 'node:fs';
import path from 'node:path';

const pulse=path.join(process.cwd(),'site','pulse-v12');
const read=name=>fs.readFileSync(path.join(pulse,name),'utf8');
const app=read('app.js');
const patient=read('patient-v4.js');
const booking=read('booking-layer-v1.js');
const css=read('pulse-ui-v1.css');
const adaptive=read('adaptive-shell-v4.js');

const checks=[
  ['RDV route owned by booking layer',app.includes("documents:'[data-kbook-patient]'")],
  ['legacy patient agenda no longer owns RDV',patient.includes("const TARGETS=new Set(['plan']);")&&!patient.includes("const TARGETS=new Set(['plan','documents']);")],
  ['booking initial mount avoids early full repaint',booking.includes("async function loadPatient(){S.patientLoading=true;S.patientError='';setPatientBusy(true);")&&!booking.includes("async function loadPatient(){S.patientLoading=true;S.patientError='';renderPatient();")],
  ['booking slot refresh uses stable busy state',booking.includes("function setPatientBusy(flag)")&&booking.includes("setPatientBusy(true);try{const q=await sb().rpc('komo_booking_slots'")],
  ['booking route mount is deduplicated',booking.includes("document.querySelector('[data-kbook-patient]')||S.patientLoading")],
  ['booking uses shared runtime client',booking.includes('window.KomoRuntime?.client')],
  ['menu structure remains unchanged',adaptive.includes("navItem('patient:home','Accueil'")&&adaptive.includes("navItem('patient:results','Tests'")&&adaptive.includes("navItem('patient:path','Résultats'")&&adaptive.includes("navItem('patient:plan','Suivi'")],
  ['menu polish is CSS-only',css.includes('/* Frozen navigation polish */')&&css.includes('.kam-nav-item.active')&&css.includes('@media(min-width:821px)')],
  ['menu transitions avoid geometry changes',css.includes('transition:background-color .14s ease,color .14s ease,border-color .14s ease,box-shadow .14s ease!important')&&css.includes('transform:none!important')],
  ['reduced motion supported',css.includes('@media(prefers-reduced-motion:reduce)')]
];
for(const [label,ok] of checks){console.log(`[pulse-navigation-freeze-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exit(1)}
console.log(`[pulse-navigation-freeze-qa] ${checks.length} checks passed.`);
