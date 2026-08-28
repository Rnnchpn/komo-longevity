import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');

const appPath=join(pulse,'app.js');
let app=await readFile(appPath,'utf8');
const oldCurrent=`function currentRoute(){const route=location.hash.replace(/^#/,'')||'home';if(route==='clinical'&&!['professional','admin'].includes(state.role))return'home';return['home','results','path','documents','explore','clinical','profile'].includes(route)?route:'home'}`;
const newCurrent=`function currentRoute(){const route=location.hash.replace(/^#/,'')||'home';if(route==='clinical'&&!['professional','admin'].includes(state.role))return'home';return['home','results','path','documents','explore','clinical','profile','motion','mykomo','trajectory'].includes(route)?route:'home'}`;
if(!app.includes(oldCurrent)) throw new Error('Pulse app currentRoute contract not found');
app=app.replace(oldCurrent,newCurrent);
const renderNeedle='function renderRoute(route){renderNavigation();const pages=';
const renderReplacement="function renderRoute(route){renderNavigation();if(['motion','mykomo','trajectory'].includes(route)){window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route,source:'app-external-owner'}}));return}const pages=";
if(!app.includes(renderNeedle)) throw new Error('Pulse app renderRoute contract not found');
app=app.replace(renderNeedle,renderReplacement);
await writeFile(appPath,app,'utf8');

const bookingPath=join(pulse,'booking-layer-v1.js');
let booking=await readFile(bookingPath,'utf8');
const memberActive=`document.querySelector('#modeSwitch [data-mode="member"]')?.classList.contains('active')`;
const oldRender=`function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents'||['professional','admin'].includes(S.role))return;`;
const newRender=`function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents'||!${memberActive})return;`;
if(!booking.includes(oldRender)) throw new Error('Agenda renderPatient contract not found');
booking=booking.replace(oldRender,newRender);
const oldRefresh=`if(location.hash.replace(/^#/,'')==='documents'&&!['professional','admin'].includes(S.role))await loadPatient()`;
const newRefresh=`if(location.hash.replace(/^#/,'')==='documents'&&${memberActive})await loadPatient()`;
if(!booking.includes(oldRefresh)) throw new Error('Agenda refresh contract not found');
booking=booking.replace(oldRefresh,newRefresh);
const oldObserver=`if(r==='documents'&&!['professional','admin'].includes(S.role)&&!document.querySelector('[data-kbook-patient]'))setTimeout(refresh,80)`;
const newObserver=`if(r==='documents'&&${memberActive}&&!document.querySelector('[data-kbook-patient]'))setTimeout(refresh,80)`;
if(!booking.includes(oldObserver)) throw new Error('Agenda observer contract not found');
booking=booking.replace(oldObserver,newObserver);
await writeFile(bookingPath,booking,'utf8');

const checks=[
 ['app recognizes Motion',app.includes("'motion','mykomo','trajectory'")],
 ['app delegates modern patient routes',app.includes("source:'app-external-owner'")],
 ['Agenda follows patient mode',booking.includes(memberActive)],
 ['Agenda no longer blocks admin role in patient mode',!booking.includes("r==='documents'&&!['professional','admin'].includes(S.role)")]
];
for(const [label,ok] of checks) console.log(`[pulse-route-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-route-v2] canonical ownership fixed for Motion · Trajectoire · Agenda');
