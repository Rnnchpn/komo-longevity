import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd(),pulse=join(root,'site','pulse-v12'),htmlPath=join(pulse,'index.html');
const release='20260829-patient-clean-room-v2';
for(const f of ['patient-home-clean-v1.css','patient-home-clean-v1.js','key-view-tabs-v1.css','key-view-tabs-v1.js'])await copyFile(join(root,'pulse-app',f),join(pulse,f));

// The canonical mobile runtime keeps the phone shell, menu and KŌMØ Link, but it must never render a second Home.
const mobilePath=join(pulse,'mobile-canonical-v1.js');
let mobile=await readFile(mobilePath,'utf8');
const syncOld="if(r==='home')home(false);else if(r==='link')link(false);";
const syncNew="if(r==='home')window.KomoPatientHomeClean?.refresh?.();else if(r==='link')link(false);";
if(mobile.includes(syncOld))mobile=mobile.replace(syncOld,syncNew);
else if(!mobile.includes(syncNew))throw new Error('[pulse-patient-clean-room] mobile Home sync owner pattern missing');
const refreshOld="window.KomoMobileCanonical={version:VERSION,refresh:()=>{homeCache=null;linkCache=null;return route()==='link'?link(true):home(true)},openMenu:()=>setMenu(true)};";
const refreshNew="window.KomoMobileCanonical={version:VERSION,refresh:()=>{homeCache=null;linkCache=null;return route()==='link'?link(true):window.KomoPatientHomeClean?.refresh?.()},openMenu:()=>setMenu(true)};";
if(mobile.includes(refreshOld))mobile=mobile.replace(refreshOld,refreshNew);
else if(!mobile.includes(refreshNew))throw new Error('[pulse-patient-clean-room] mobile Home refresh owner pattern missing');
await writeFile(mobilePath,mobile,'utf8');

let html=await readFile(htmlPath,'utf8');
const legacy=['my-komo-home-v1.js','patient-home-visual-v2.js','patient-home-datawall-v3.js','my-komo-dashboard-v2.js','my-komo-key-home-v1.js','patient-home-micro-motion-v1.js','pulse-home-hero-polish-v2.js','my-komo-score-motion-v1.js'];
for(const name of legacy){const e=name.replaceAll('.','\\.');html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${e}(?:\\?[^\"]*)?"><\\/script>`,'g'),'')}
for(const name of ['my-komo-dashboard-v2.css','my-komo-key-home-v1.css']){const e=name.replaceAll('.','\\.');html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\./${e}(?:\\?[^\"]*)?"\\s*\\/?>`,'g'),'')}
for(const name of ['patient-home-clean-v1.css','key-view-tabs-v1.css']){const e=name.replaceAll('.','\\.');html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\./${e}(?:\\?[^\"]*)?"\\s*\\/?>`,'g'),'')}
for(const name of ['patient-home-clean-v1.js','key-view-tabs-v1.js']){const e=name.replaceAll('.','\\.');html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${e}(?:\\?[^\"]*)?"><\\/script>`,'g'),'')}
html=html.replace('</head>',`  <link rel="stylesheet" href="./patient-home-clean-v1.css?v=${release}" />\n  <link rel="stylesheet" href="./key-view-tabs-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./patient-home-clean-v1.js?v=${release}"></script>\n  <script src="./key-view-tabs-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');
console.log('[pulse-patient-clean-room] one Home owner on desktop + tablet + phone · My Key Overview/Data/Sources · legacy Home renderers removed');
