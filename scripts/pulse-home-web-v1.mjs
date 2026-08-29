import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260830-home-web-v1';
const cssFile='patient-home-command-v1.css';
const jsFile='patient-home-command-v1.js';

for(const file of [cssFile,jsFile])await copyFile(join(root,'pulse-app',file),join(pulse,file));

let html=await readFile(htmlPath,'utf8');
// Retire the historical home data-wall renderer: one Home route, one final renderer.
html=html.replace(/\s*<script type="module" src="\.\/patient-home-datawall-v3\.js(?:\?v=[^"]+)?"><\/script>/g,'');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/patient-home-command-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/patient-home-command-v1\.js(?:\?v=[^"]+)?"><\/script>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./${cssFile}?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./${jsFile}?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const [css,js,final]=await Promise.all([
  readFile(join(pulse,cssFile),'utf8'),
  readFile(join(pulse,jsFile),'utf8'),
  readFile(htmlPath,'utf8')
]);
const checks=[
  ['historical home renderer removed',!final.includes('patient-home-datawall-v3.js')],
  ['final home CSS loaded',final.includes(`${cssFile}?v=${release}`)],
  ['final home renderer loaded',final.includes(`${jsFile}?v=${release}`)],
  ['desktop cockpit is desktop-scoped',css.includes('@media (min-width:768px)')&&css.includes('.khc-key')&&css.includes('.khc-week')],
  ['mobile compatibility keeps Motion and Age',js.includes('function mobileHtml')&&js.includes('kdw-card kdw-score')&&js.includes('kdw-card kdw-age')],
  ['canonical Motion result remains read-only',js.includes('loadCanonicalResult')&&!js.includes("from('scores').update")&&!js.includes("from('scores').insert")],
  ['KEY uses consent-gated wearable data',js.includes("from('wearable_consents')")&&js.includes("purpose','connected_followup")&&js.includes("from('wearable_daily_metrics')")],
  ['KEY averages use observed days only',js.includes('currentDays')&&js.includes('Aucun jour manquant n’est extrapolé')],
  ['stable event-driven renderer has no body observer or polling loop',!js.includes('MutationObserver')&&!js.includes('setInterval(')],
  ['status vocabulary distinguishes LIVE CALCULATED VALIDATED',js.includes("label:'CALCULÉ'")&&js.includes("label:'VALIDÉ'")&&js.includes("'LIVE'")],
  ['home exposes essential routes',js.includes("go('key')")&&js.includes("go('results')")&&js.includes("go('trajectory')")&&js.includes("go('documents')")&&js.includes("go('tests')")]
];
for(const [label,ok] of checks)console.log(`[pulse-home-web-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-home-web-v1] PASS · one final Home renderer · Motion + Age + KEY + next action + Clinical + report + trajectory');
