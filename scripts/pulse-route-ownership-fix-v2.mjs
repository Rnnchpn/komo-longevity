import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');

const appPath=join(pulse,'app.js');
let app=await readFile(appPath,'utf8');

const currentStart=app.indexOf('function currentRoute(){');
const currentEnd=app.indexOf('function renderNavigation(){',currentStart);
if(currentStart<0||currentEnd<0) throw new Error('Pulse app route boundaries not found');
const currentFn=`function currentRoute(){const route=location.hash.replace(/^#/,'')||'home';if(route==='clinical'&&!['professional','admin'].includes(state.role))return'home';return['home','results','path','documents','explore','clinical','profile','motion','mykomo','trajectory','club'].includes(route)?route:'home'}\n`;
app=app.slice(0,currentStart)+currentFn+app.slice(currentEnd);

const renderStart='function renderRoute(route){renderNavigation();';
if(!app.includes(renderStart)) throw new Error('Pulse app renderRoute boundary not found');
const delegated="function renderRoute(route){renderNavigation();if(['motion','mykomo','trajectory','club'].includes(route)){window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route,source:'app-external-owner'}}));return}";
const idx=app.indexOf(renderStart);
const after=idx+renderStart.length;
const marker='const pages=';
const pagesIdx=app.indexOf(marker,after);
if(pagesIdx<0) throw new Error('Pulse app pages boundary not found');
app=app.slice(0,idx)+delegated+app.slice(pagesIdx);
await writeFile(appPath,app,'utf8');

const bookingPath=join(pulse,'booking-layer-v1.js');
let booking=await readFile(bookingPath,'utf8');
const memberActive=`document.querySelector('#modeSwitch [data-mode="member"]')?.classList.contains('active')`;

const oldRender=`function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents'||['professional','admin'].includes(S.role))return;`;
const newRender=`function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents'||!${memberActive})return;`;
if(booking.includes(oldRender)) booking=booking.replace(oldRender,newRender);
else if(!booking.includes(newRender)) throw new Error('Agenda renderPatient contract not found');

const oldRefresh=`if(location.hash.replace(/^#/,'')==='documents'&&!['professional','admin'].includes(S.role))await loadPatient()`;
const newRefresh=`if(location.hash.replace(/^#/,'')==='documents'&&${memberActive})await loadPatient()`;
if(booking.includes(oldRefresh)) booking=booking.replace(oldRefresh,newRefresh);
else if(!booking.includes(newRefresh)) throw new Error('Agenda refresh contract not found');

const oldObserver=`if(r==='documents'&&!['professional','admin'].includes(S.role)&&!document.querySelector('[data-kbook-patient]'))setTimeout(refresh,80)`;
const newObserver=`if(r==='documents'&&${memberActive}&&!document.querySelector('[data-kbook-patient]'))setTimeout(refresh,80)`;
if(booking.includes(oldObserver)) booking=booking.replace(oldObserver,newObserver);
else if(!booking.includes(newObserver)) throw new Error('Agenda observer contract not found');

await writeFile(bookingPath,booking,'utf8');

const checks=[
 ['app recognizes Motion',app.includes("'motion'"))],
 ['app recognizes My KŌMØ',app.includes("'mykomo'"))],
 ['app recognizes Trajectoire',app.includes("'trajectory'"))],
 ['app recognizes Club',app.includes("'club'"))],
 ['app delegates modern patient routes',app.includes("source:'app-external-owner'"))],
 ['Agenda follows patient mode',booking.includes(memberActive)],
 ['Agenda no longer blocks admin role in patient mode',!booking.includes("r==='documents'&&!['professional','admin'].includes(S.role)"))]
];
for(const [label,ok] of checks) console.log(`[pulse-route-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-route-v2] canonical ownership fixed for Motion · My KŌMØ · Club · Trajectoire · Agenda');
