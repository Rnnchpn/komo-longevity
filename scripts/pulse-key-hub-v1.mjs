import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260831-key-single-owner-v1';

for(const file of ['key-hub-v1.css','key-hub-v1.js']) await copyFile(join(root,'pulse-app',file),join(pulse,file));

// KEY V2 owns the visible route after bootstrap. The original hub may fetch/render once,
// but it must never wipe the enhanced V2 surface after later runtime events.
const keyHubPath=join(pulse,'key-hub-v1.js');
let keyHub=await readFile(keyHubPath,'utf8');
const ownerNeedle="async function render(force=false){if(route()==='home'){homeTabs();return}if(route()!=='key')return;const root=document.querySelector('#viewRoot');if(!root)return;setChrome();";
const ownerReplacement="async function render(force=false){if(route()==='home'){homeTabs();return}if(route()!=='key')return;const root=document.querySelector('#viewRoot');if(!root)return;const mounted=root.querySelector('[data-keyhub]');if(mounted?.classList.contains('kh2-enhanced')&&window.KomoKeyResultsV2){window.KomoKeyResultsV2.refresh?.();return}setChrome();";
if(keyHub.includes(ownerNeedle))keyHub=keyHub.replace(ownerNeedle,ownerReplacement);
else if(!keyHub.includes(ownerReplacement))throw new Error('[pulse-key-hub] KEY owner contract changed');
await writeFile(keyHubPath,keyHub,'utf8');

// KEY is a canonical patient route, owned by the dedicated hub.
const appPath=join(pulse,'app-router-v2.js');
let app=await readFile(appPath,'utf8');
app=app.replace("'motion','mykomo','club','trajectory'","'motion','mykomo','club','key','trajectory'");
app=app.replace("['motion','mykomo','club','trajectory'].includes(route)","['motion','mykomo','club','key','trajectory'].includes(route)");
if(!app.includes("'key'")) throw new Error('[pulse-key-hub] app route KEY patch failed');
await writeFile(appPath,app,'utf8');

const navPath=join(pulse,'patient-navigation-core-v1.js');
let nav=await readFile(navPath,'utf8');
nav=nav.replace("'home','motion','mykomo','club','trajectory'","'home','motion','mykomo','club','key','trajectory'");
if(!nav.includes("'key'")) throw new Error('[pulse-key-hub] canonical navigation KEY patch failed');
await writeFile(navPath,nav,'utf8');

// The home KEY card now opens the dedicated KEY route instead of the legacy follow-up surface.
const homeKeyPath=join(pulse,'my-komo-key-home-v1.js');
let homeKey=await readFile(homeKeyPath,'utf8');
homeKey=homeKey.replace("window.KomoPatientNavigation.go('followup')","window.KomoPatientNavigation.go('key')").replace("location.hash='followup'","location.hash='key'");
await writeFile(homeKeyPath,homeKey,'utf8');

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/key-hub-v1\.css(?:\?[^\"]*)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/key-hub-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\.\/my-komo-score-motion-v1\.js\?v=[^\"]+/g,`./my-komo-score-motion-v1.js?v=${release}`);
html=html.replace('</head>',`  <link rel="stylesheet" href="./key-hub-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./key-hub-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const finalHtml=await readFile(htmlPath,'utf8');
const finalApp=await readFile(appPath,'utf8');
const finalNav=await readFile(navPath,'utf8');
const finalHome=await readFile(homeKeyPath,'utf8');
const finalCss=await readFile(join(pulse,'key-hub-v1.css'),'utf8');
const finalJs=await readFile(keyHubPath,'utf8');
const checks=[
 ['KEY CSS shipped last',finalHtml.includes(`key-hub-v1.css?v=${release}`)],
 ['KEY runtime shipped last',finalHtml.includes(`key-hub-v1.js?v=${release}`)],
 ['Motion score runtime cache-busted',finalHtml.includes(`my-komo-score-motion-v1.js?v=${release}`)],
 ['app recognizes KEY',finalApp.includes("'key'")],
 ['app delegates KEY',finalApp.includes("'club','key','trajectory'")],
 ['canonical patient navigation accepts KEY',finalNav.includes("'club','key','trajectory'")],
 ['home KEY card opens dedicated route',finalHome.includes("go('key')")&&!finalHome.includes("go('followup')")],
 ['KEY uses real wearable table',finalJs.includes("from('wearable_daily_metrics')")],
 ['KEY base hub yields to V2 after enhancement',finalJs.includes("classList.contains('kh2-enhanced')")&&finalJs.includes('KomoKeyResultsV2.refresh')],
 ['KEY keeps Motion Score separate',finalJs.includes('ne modifient pas le Motion Score')||finalJs.includes('ne modifie pas le Motion Score')],
 ['animated premium rings shipped',finalCss.includes('.kh-ring')&&finalJs.includes('requestAnimationFrame')],
 ['home Motion number visibility guard shipped',finalCss.includes('Final home Motion score visibility guard')]
];
for(const [label,ok] of checks) console.log(`[pulse-key-hub] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-key-hub] PASS · dedicated KEY route + single visible V2 owner + longitudinal rings');
