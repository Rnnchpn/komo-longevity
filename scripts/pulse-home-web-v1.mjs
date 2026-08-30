import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260830-home-web-v2';
const navRelease='20260830-patient-nav-v7';
const cssFile='patient-home-command-v1.css';
const heroCssFile='patient-home-hero-v2.css';
const jsFile='patient-home-command-v1.js';
const navFile='pulse-bottom-nav-v6.js';

for(const file of [cssFile,heroCssFile,jsFile,navFile])await copyFile(join(root,'pulse-app',file),join(pulse,file));

let html=await readFile(htmlPath,'utf8');
// Retire the historical home data-wall renderer: one Home route, one final renderer.
html=html.replace(/\s*<script type="module" src="\.\/patient-home-datawall-v3\.js(?:\?v=[^"]+)?"><\/script>/g,'');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/patient-home-command-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/patient-home-hero-v2\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/patient-home-command-v1\.js(?:\?v=[^"]+)?"><\/script>/g,'');
html=html.replace(/(<script src="\.\/pulse-bottom-nav-v6\.js)(?:\?v=[^"]+)?("><\/script>)/g,`$1?v=${navRelease}$2`);
html=html.replace('</head>',`  <link rel="stylesheet" href="./${cssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${heroCssFile}?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./${jsFile}?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const [css,heroCss,js,nav,final]=await Promise.all([
  readFile(join(pulse,cssFile),'utf8'),
  readFile(join(pulse,heroCssFile),'utf8'),
  readFile(join(pulse,jsFile),'utf8'),
  readFile(join(pulse,navFile),'utf8'),
  readFile(htmlPath,'utf8')
]);
const itemsBlock=(nav.match(/const items=\[([\s\S]*?)\];/)||[])[1]||'';
const checks=[
  ['historical home renderer removed',!final.includes('patient-home-datawall-v3.js')],
  ['final home CSS loaded',final.includes(`${cssFile}?v=${release}`)],
  ['hero v2 visual layer loaded after home CSS',final.includes(`${heroCssFile}?v=${release}`)&&final.indexOf(heroCssFile)>final.indexOf(cssFile)],
  ['hero v2 is desktop-only and visual-only',heroCss.includes('@media (min-width:768px)')&&heroCss.includes('.khc-overview-head')&&!heroCss.includes('display:none')&&!heroCss.includes('pointer-events:auto')],
  ['final home renderer loaded',final.includes(`${jsFile}?v=${release}`)],
  ['desktop cockpit is desktop-scoped',css.includes('@media (min-width:768px)')&&css.includes('.khc-key')&&css.includes('.khc-week')],
  ['mobile compatibility keeps Motion and Age',js.includes('function mobileHtml')&&js.includes('kdw-card kdw-score')&&js.includes('kdw-card kdw-age')],
  ['canonical Motion result remains read-only',js.includes('loadCanonicalResult')&&!js.includes("from('scores').update")&&!js.includes("from('scores').insert")],
  ['KEY uses consent-gated wearable data',js.includes("from('wearable_consents')")&&js.includes("purpose','connected_followup")&&js.includes("from('wearable_daily_metrics')")],
  ['KEY averages use observed days only',js.includes('currentDays')&&js.includes('Aucun jour manquant n’est extrapolé')],
  ['stable event-driven renderer has no body observer or polling loop',!js.includes('MutationObserver')&&!js.includes('setInterval(')],
  ['status vocabulary distinguishes LIVE CALCULATED VALIDATED',js.includes("label:'CALCULÉ'")&&js.includes("label:'VALIDÉ'")&&js.includes("'LIVE'")],
  ['home exposes essential routes',js.includes("go('key')")&&js.includes("go('results')")&&js.includes("go('trajectory')")&&js.includes("go('documents')")&&js.includes("go('tests')")],
  ['final patient dock is cache-busted',final.includes(`${navFile}?v=${navRelease}`)],
  ['dock uses final six destinations',itemsBlock.includes("['home','Accueil'")&&itemsBlock.includes("['key','KEY'")&&itemsBlock.includes("['results','Résultats'")&&itemsBlock.includes("['trajectory','Trajectoire'")&&itemsBlock.includes("['agenda','Rendez-vous'")&&itemsBlock.includes("['mykomo','My KŌMØ'")],
  ['Club and product picker are secondary, not rendered in primary dock',!itemsBlock.includes("['club','Club'")&&!itemsBlock.includes("['assessment','KŌMØ'")&&!nav.includes('kpPickerV6')]
];
for(const [label,ok] of checks)console.log(`[pulse-home-web-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-home-web-v1] PASS · final Home cockpit + luxury hero v2 + simplified patient navigation');