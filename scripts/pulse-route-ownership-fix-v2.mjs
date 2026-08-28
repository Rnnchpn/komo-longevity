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
const currentFn=`function currentRoute(){const route=location.hash.replace(/^#/,'')||'home';if(route==='clinical'&&!['professional','admin'].includes(state.role))return'home';return['home','results','path','documents','explore','clinical','profile','motion','mykomo','club','trajectory'].includes(route)?route:'home'}\n`;
app=app.slice(0,currentStart)+currentFn+app.slice(currentEnd);

const renderStart='function renderRoute(route){renderNavigation();';
const renderIdx=app.indexOf(renderStart);
if(renderIdx<0) throw new Error('Pulse app renderRoute boundary not found');
const pagesIdx=app.indexOf('const pages=',renderIdx+renderStart.length);
if(pagesIdx<0) throw new Error('Pulse app pages boundary not found');
const delegated="function renderRoute(route){renderNavigation();if(['motion','mykomo','club','trajectory'].includes(route)){window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route,source:'app-external-owner'}}));return}";
app=app.slice(0,renderIdx)+delegated+app.slice(pagesIdx);
await writeFile(appPath,app,'utf8');

// Legacy Agenda rewrites are best-effort only. Multiple later build layers can
// already own these contracts; route ownership for Club must never fail because
// an unrelated Agenda string has changed shape.
const bookingPath=join(pulse,'booking-layer-v1.js');
let booking=await readFile(bookingPath,'utf8');
const memberActive=`document.querySelector('#modeSwitch [data-mode="member"]')?.classList.contains('active')`;
const replacements=[
  [
    `function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents'||['professional','admin'].includes(S.role))return;`,
    `function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents'||!${memberActive})return;`
  ],
  [
    `if(location.hash.replace(/^#/,'')==='documents'&&!['professional','admin'].includes(S.role))await loadPatient()`,
    `if(location.hash.replace(/^#/,'')==='documents'&&${memberActive})await loadPatient()`
  ],
  [
    `if(r==='documents'&&!['professional','admin'].includes(S.role)&&!document.querySelector('[data-kbook-patient]'))setTimeout(refresh,80)`,
    `if(r==='documents'&&${memberActive}&&!document.querySelector('[data-kbook-patient]'))setTimeout(refresh,80)`
  ]
];
for(const [oldValue,newValue] of replacements){if(booking.includes(oldValue))booking=booking.replace(oldValue,newValue)}
await writeFile(bookingPath,booking,'utf8');

const checks=[
 ['app recognizes Motion',app.includes("'motion'")],
 ['app recognizes My KŌMØ',app.includes("'mykomo'")],
 ['app recognizes Club',app.includes("'club'")],
 ['app recognizes Trajectoire',app.includes("'trajectory'")],
 ['app delegates modern patient routes',app.includes("source:'app-external-owner'")]
];
for(const [label,ok] of checks) console.log(`[pulse-route-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-route-v2] canonical ownership fixed for Motion · My KŌMØ · Club · Trajectoire; Agenda compatibility applied when applicable');
