import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260901-connected-v2';

for(const file of ['key-hub-v1.css','key-hub-v1.js']) await copyFile(join(root,'pulse-app',file),join(pulse,file));

// The internal route key remains `key` to preserve one stable runtime owner while
// the patient-facing product name becomes KŌMØ Connected.
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
html=html.replace('</head>',`  <link rel="stylesheet" href="./key-hub-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./key-hub-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const finalHtml=await readFile(htmlPath,'utf8');
const finalApp=await readFile(appPath,'utf8');
const finalNav=await readFile(navPath,'utf8');
const finalHome=await readFile(homeKeyPath,'utf8');
const finalCss=await readFile(join(pulse,'key-hub-v1.css'),'utf8');
const finalJs=await readFile(join(pulse,'key-hub-v1.js'),'utf8');
const checks=[
 ['Connected CSS asset shipped',finalHtml.includes(`key-hub-v1.css?v=${release}`)],
 ['Connected runtime shipped',finalHtml.includes(`key-hub-v1.js?v=${release}`)],
 ['Motion score runtime cache-busted',finalHtml.includes(`my-komo-score-motion-v1.js?v=${release}`)],
 ['app recognizes internal key route',finalApp.includes("'key'")],
 ['app delegates internal key route',finalApp.includes("'club','key','trajectory'")],
 ['canonical patient navigation accepts key route',finalNav.includes("'club','key','trajectory'")],
 ['home connected card opens dedicated route',finalHome.includes("go('key')")&&!finalHome.includes("go('followup')")],
 ['Connected uses real wearable table',finalJs.includes("from('wearable_daily_metrics')")],
 ['Connected stays separate from Motion scoring',finalJs.includes('ne crée pas un score médical parallèle')],
 ['Connected patient-facing name shipped',finalJs.includes('KŌMØ Connected.')&&finalJs.includes("eyebrow.textContent='KŌMØ CONNECTED'")],
 ['home Motion number visibility guard shipped',finalCss.includes('Final home Motion score visibility guard')]
];
for(const [label,ok] of checks) console.log(`[pulse-connected] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-connected] PASS · KŌMØ Connected uses one stable key route, real wearable data and no parallel health score');
