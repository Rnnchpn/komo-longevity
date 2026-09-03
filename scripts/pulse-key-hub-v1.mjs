import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260903-connected-v3';

// Connected v3 is a single runtime owner. Its route-scoped visual contract lives
// with the owner so the historical key-hub stylesheet is no longer loaded.
await copyFile(join(root,'pulse-app','key-hub-v1.js'),join(pulse,'key-hub-v1.js'));

// The internal route key remains `key` to preserve the stabilized route contract
// while the patient-facing product name remains KŌMØ Connected.
const appPath=join(pulse,'app-router-v2.js');
let app=await readFile(appPath,'utf8');
app=app.replace("'motion','mykomo','club','trajectory'","'motion','mykomo','club','key','trajectory'");
app=app.replace("['motion','mykomo','club','trajectory'].includes(route)","['motion','mykomo','club','key','trajectory'].includes(route)");
if(!app.includes("'key'")) throw new Error('[pulse-connected] app route key patch failed');
await writeFile(appPath,app,'utf8');

const navPath=join(pulse,'patient-navigation-core-v1.js');
let nav=await readFile(navPath,'utf8');
nav=nav.replace("'home','motion','mykomo','club','trajectory'","'home','motion','mykomo','club','key','trajectory'");
if(!nav.includes("'key'")) throw new Error('[pulse-connected] canonical navigation key patch failed');
await writeFile(navPath,nav,'utf8');

const homeKeyPath=join(pulse,'my-komo-key-home-v1.js');
let homeKey=await readFile(homeKeyPath,'utf8');
homeKey=homeKey.replace("window.KomoPatientNavigation.go('followup')","window.KomoPatientNavigation.go('key')").replace("location.hash='followup'","location.hash='key'");
await writeFile(homeKeyPath,homeKey,'utf8');

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/key-hub-v1\.css(?:\?[^\"]*)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/key-hub-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\.\/my-komo-score-motion-v1\.js\?v=[^\"]+/g,`./my-komo-score-motion-v1.js?v=${release}`);
html=html.replace('</body>',`  <script src="./key-hub-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const finalHtml=await readFile(htmlPath,'utf8');
const finalApp=await readFile(appPath,'utf8');
const finalNav=await readFile(navPath,'utf8');
const finalHome=await readFile(homeKeyPath,'utf8');
const finalJs=await readFile(join(pulse,'key-hub-v1.js'),'utf8');
const checks=[
 ['Connected runtime shipped once',finalHtml.includes(`key-hub-v1.js?v=${release}`)&&(finalHtml.match(/key-hub-v1\.js/g)||[]).length===1],
 ['legacy Connected stylesheet retired',!finalHtml.includes('key-hub-v1.css')],
 ['app recognizes internal key route',finalApp.includes("'key'")],
 ['app delegates internal key route',finalApp.includes("'club','key','trajectory'")],
 ['canonical patient navigation accepts key route',finalNav.includes("'club','key','trajectory'")],
 ['home Connected card opens dedicated route',finalHome.includes("go('key')")&&!finalHome.includes("go('followup')")],
 ['Connected uses real wearable table',finalJs.includes("from('wearable_daily_metrics')")],
 ['Connected daily score is explicitly non-clinical',finalJs.includes('Signal quotidien non clinique')&&finalJs.includes('Motion Myodev reste votre mesure de référence')],
 ['Connected score requires movement sleep and resting HR',finalJs.includes('parts.length===3')&&finalJs.includes("build(sleepRow,'sleep_minutes'")&&finalJs.includes("build(heartRow,'resting_hr'"))],
 ['Connected exposes 7 and 30 day trajectory',finalJs.includes('data-kcn-period="7"')&&finalJs.includes('data-kcn-period="30"')],
 ['Connected compares steps sleep and resting HR',finalJs.includes("periodComparison('Pas / jour'")&&finalJs.includes("periodComparison('Sommeil / nuit'")&&finalJs.includes("periodComparison('FC repos'"))],
 ['Connected patient-facing name shipped',finalJs.includes("eyebrow.textContent='KŌMØ CONNECTED'")&&finalJs.includes('MOTION TODAY · CONNECTED')]
];
for(const [label,ok] of checks) console.log(`[pulse-connected] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-connected] PASS · one Connected owner · daily non-clinical Motion signal · 7/30 day trajectory · real wearable data');
