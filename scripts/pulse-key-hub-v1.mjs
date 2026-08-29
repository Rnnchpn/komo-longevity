import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-key-perf-v2';

// Final canonical patient assets. Copy them again at the end so later build
// layers can never leave Pulse with stale navigation/performance runtimes.
for(const file of [
  'key-hub-v1.css',
  'key-hub-v1.js',
  'patient-navigation-core-v1.js',
  'account-tab-restore-v1.js',
  'my-komo-score-motion-v1.js'
]) await copyFile(join(root,'pulse-app',file),join(pulse,file));

// KEY is a canonical patient route, owned by the dedicated hub.
const appPath=join(pulse,'app-router-v2.js');
let app=await readFile(appPath,'utf8');
if(!app.includes("'key'")){
  app=app.replace("'motion','mykomo','club','trajectory'","'motion','mykomo','club','key','trajectory'");
  app=app.replace("['motion','mykomo','club','trajectory'].includes(route)","['motion','mykomo','club','key','trajectory'].includes(route)");
}
if(!app.includes("'key'")) throw new Error('[pulse-key-hub] app route KEY patch failed');
await writeFile(appPath,app,'utf8');

const navPath=join(pulse,'patient-navigation-core-v1.js');
const nav=await readFile(navPath,'utf8');
if(!nav.includes("followup:'key'")||!nav.includes("'key'")) throw new Error('[pulse-key-hub] canonical navigation / followup alias missing');

// The home KEY card opens the dedicated KEY route. Keep a generated-output
// fallback in case an upstream build copied an older home-card asset.
const homeKeyPath=join(pulse,'my-komo-key-home-v1.js');
let homeKey=await readFile(homeKeyPath,'utf8');
homeKey=homeKey.replaceAll("window.KomoPatientNavigation.go('followup')","window.KomoPatientNavigation.go('key')").replaceAll("location.hash='followup'","location.hash='key'");
await writeFile(homeKeyPath,homeKey,'utf8');

let html=await readFile(htmlPath,'utf8');

// Retire all obsolete wearable presentation owners. The data tables remain;
// only the competing UI runtimes are removed.
const legacy=['wearable-followup-v2.js','wearable-cycle-v1.js','wearable-poc-mode-v1.js','key-results-grid-v1.js'];
for(const name of legacy){
  const escaped=name.replaceAll('.','\\.');
  html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${escaped}(?:\\?[^\\"]*)?"><\\/script>`,'g'),'');
}

// Ship KEY once, last.
html=html.replace(/\s*<link rel="stylesheet" href="\.\/key-hub-v1\.css(?:\?[^\"]*)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/key-hub-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');

const escRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function bumpScript(name){
  const e=escRe(name);
  html=html.replace(new RegExp(`src="\\./${e}(?:\\?[^\"]*)?"`,'g'),`src="./${name}?v=${release}"`);
}
function bumpHref(name){
  const e=escRe(name);
  html=html.replace(new RegExp(`href="\\./${e}(?:\\?[^\"]*)?"`,'g'),`href="./${name}?v=${release}"`);
}
for(const name of ['patient-navigation-core-v1.js','app-router-v2.js','my-komo-key-home-v1.js','account-tab-restore-v1.js','my-komo-score-motion-v1.js']) bumpScript(name);
bumpHref('app-router-v2.js');

html=html.replace('</head>',`  <link rel="stylesheet" href="./key-hub-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./key-hub-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const finalHtml=await readFile(htmlPath,'utf8');
const finalApp=await readFile(appPath,'utf8');
const finalNav=await readFile(navPath,'utf8');
const finalHome=await readFile(homeKeyPath,'utf8');
const finalAccount=await readFile(join(pulse,'account-tab-restore-v1.js'),'utf8');
const finalMotion=await readFile(join(pulse,'my-komo-score-motion-v1.js'),'utf8');
const finalCss=await readFile(join(pulse,'key-hub-v1.css'),'utf8');
const finalJs=await readFile(join(pulse,'key-hub-v1.js'),'utf8');
const scriptCount=(finalHtml.match(/<script\b/g)||[]).length;
const checks=[
 ['KEY CSS shipped last',finalHtml.includes(`key-hub-v1.css?v=${release}`)],
 ['KEY runtime shipped last',finalHtml.includes(`key-hub-v1.js?v=${release}`)],
 ['navigation core cache-busted',finalHtml.includes(`patient-navigation-core-v1.js?v=${release}`)],
 ['app router cache-busted',finalHtml.includes(`app-router-v2.js?v=${release}`)],
 ['home KEY card cache-busted',finalHtml.includes(`my-komo-key-home-v1.js?v=${release}`)],
 ['account runtime cache-busted',finalHtml.includes(`account-tab-restore-v1.js?v=${release}`)],
 ['Motion score runtime cache-busted',finalHtml.includes(`my-komo-score-motion-v1.js?v=${release}`)],
 ['app recognizes KEY',finalApp.includes("'key'")],
 ['app delegates KEY',finalApp.includes("'club','key','trajectory'")],
 ['legacy followup aliases synchronously to KEY',finalNav.includes("followup:'key'")&&finalNav.includes('canonicalizeBoot()')],
 ['canonical patient navigation accepts KEY',finalNav.includes("'key'"))],
 ['home KEY card opens dedicated route',finalHome.includes("go('key')")&&!finalHome.includes("go('followup')"))],
 ['legacy wearable followup removed',!finalHtml.includes('wearable-followup-v2.js')],
 ['legacy wearable cycle removed',!finalHtml.includes('wearable-cycle-v1.js')],
 ['legacy wear-mode POC removed',!finalHtml.includes('wearable-poc-mode-v1.js')],
 ['legacy results grid removed',!finalHtml.includes('key-results-grid-v1.js')],
 ['account observer no longer watches body classes',!finalAccount.includes('observe(document.body')&&!finalAccount.includes("attributeFilter:['class','hidden']")],
 ['Motion runtime has no permanent polling interval',!finalMotion.includes('setInterval(')&&finalMotion.includes("document.querySelector('#viewRoot')")],
 ['KEY uses real wearable table',finalJs.includes("from('wearable_daily_metrics')")],
 ['KEY keeps Motion Score separate',finalJs.includes('ne modifient pas le Motion Score')||finalJs.includes('ne modifie pas le Motion Score')],
 ['animated premium rings shipped',finalCss.includes('.kh-ring')&&finalJs.includes('requestAnimationFrame')]
];
for(const [label,ok] of checks) console.log(`[pulse-key-hub] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log(`[pulse-key-hub] PASS · #followup → #key before render · 4 legacy runtimes retired · ${scriptCount} scripts in final Pulse HTML · ${release}`);
