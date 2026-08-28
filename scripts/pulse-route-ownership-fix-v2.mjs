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

// Agenda is already consolidated later in the production pipeline. Do not rewrite it here.
const booking=await readFile(join(pulse,'booking-layer-v1.js'),'utf8');

const checks=[
 ['app recognizes Motion',app.includes("'motion'")],
 ['app recognizes My KŌMØ',app.includes("'mykomo'")],
 ['app recognizes Club',app.includes("'club'")],
 ['app recognizes Trajectoire',app.includes("'trajectory'")],
 ['app delegates modern patient routes',app.includes("source:'app-external-owner'")],
 ['Agenda owns documents route',booking.includes("function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents')return;"))],
 ['Agenda refresh is documents based',booking.includes("location.hash.replace(/^#/,'')!=='documents'"))],
 ['Agenda has no patient role block',!booking.includes("function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents'||['professional','admin'].includes(S.role))return;")]
];
for(const [label,ok] of checks) console.log(`[pulse-route-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-route-v2] canonical ownership fixed for Motion · My KŌMØ · Club · Trajectoire; Agenda preserved');
