import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const pulse=join(process.cwd(),'site','pulse-v12');
const [html,booking,map,cockpit,hub,context,pro]=await Promise.all([
  readFile(join(pulse,'index.html'),'utf8'),
  readFile(join(pulse,'booking-layer-v1.js'),'utf8'),
  readFile(join(pulse,'booking-directory-map-v1.js'),'utf8'),
  readFile(join(pulse,'clinical-cockpit-v1.js'),'utf8'),
  readFile(join(pulse,'center-hub-v1.js'),'utf8'),
  readFile(join(pulse,'center-context-v1.js'),'utf8'),
  readFile(join(pulse,'pro-architecture-v2.js'),'utf8')
]);
const checks=[
 ['booking preserves mounted map across rerenders',booking.includes('const mapKeep=root.querySelector')&&booking.includes('komo:booking-map-restored')],
 ['directory geocoding is nonblocking',map.includes('Promise.allSettled(tasks)')&&map.includes("return S.directory")],
 ['map has stable public runtime API',map.includes('window.KomoBookingDirectoryMap')&&map.includes('komo:booking-map-restored')],
 ['clinical cockpit respects shared active center',cockpit.includes("wanted=localStorage.getItem('komo_clinical_org')")],
 ['clinical cockpit uses shared runtime client',cockpit.includes('window.KomoRuntime?.client')],
 ['center hub uses shared runtime client',hub.includes('window.KomoRuntime?.client')],
 ['center switching is event driven',hub.includes('komo:center-changed')&&!context.includes('location.reload()')],
 ['patient opening avoids page reload',hub.includes('komo:patient-changed')&&!hub.includes("localStorage.setItem('komo_clinical_patient',b.dataset.openPatient);localStorage.setItem(ORG_KEY,S.centerId);location.reload()")],
 ['professional delayed actions cancel stale retries',pro.includes('let actionToken=0;')&&pro.includes('token!==actionToken')],
 ['professional nav no longer watches all body class mutations',!pro.includes("obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']})")],
 ['stabilized modules cache busted',html.includes('clinical-cockpit-v1.js?v=20260827-pro-stable-1')&&html.includes('booking-directory-map-v1.js?v=20260827-pro-stable-1')&&html.includes('pro-architecture-v2.js?v=20260827-pro-stable-1')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);
if(failed.length){console.error('[pulse-professional-stability-qa] failed: '+failed.join(', '));process.exit(1)}
for(const [n] of checks)console.log('[pulse-professional-stability-qa] OK · '+n);
console.log(`[pulse-professional-stability-qa] ${checks.length} checks passed.`);
