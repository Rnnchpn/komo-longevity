import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260831-home-mobile-v3';
const navRelease='20260830-patient-nav-v7';
const cssFile='patient-home-command-v1.css';
const heroCssFile='patient-home-hero-v2.css';
const dailyCssFile='patient-home-daily-v2.css';
const mobileCssFile='patient-mobile-v1.css';
const jsFile='patient-home-command-v1.js';
const dailyJsFile='patient-home-daily-v2.js';
const mobileJsFile='patient-mobile-v1.js';
const clarityJsFile='patient-v1-clarity.js';
const entryFile='patient-home-entry-v1.js';
const navFile='pulse-bottom-nav-v6.js';

for(const file of [cssFile,heroCssFile,dailyCssFile,mobileCssFile,jsFile,dailyJsFile,mobileJsFile,navFile]){
  await copyFile(join(root,'pulse-app',file),join(pulse,file));
}

// The canonical Home owner stays direct for interaction ownership. Daily and
// mobile presentation are side-effect imports, so they add no extra script tags.
const jsPath=join(pulse,jsFile);
let homeJs=await readFile(jsPath,'utf8');
const sideEffects=`import './${dailyJsFile}';\nimport './${mobileJsFile}';\n`;
if(!homeJs.includes(`import './${dailyJsFile}'`))homeJs=sideEffects+homeJs;
await writeFile(jsPath,homeJs,'utf8');

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<script type="module" src="\.\/patient-home-datawall-v3\.js(?:\?v=[^"]+)?"><\/script>/g,'');
for(const file of [cssFile,heroCssFile,dailyCssFile,mobileCssFile]){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\./${escaped}(?:\\?v=[^\"]+)?"\\s*\\/?>`,'g'),'');
}
for(const file of [entryFile,jsFile,dailyJsFile,mobileJsFile,clarityJsFile]){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${escaped}(?:\\?v=[^\"]+)?"><\\/script>`,'g'),'');
}
html=html.replace(/(<script src="\.\/pulse-bottom-nav-v6\.js)(?:\?v=[^"]+)?("><\/script>)/g,`$1?v=${navRelease}$2`);
html=html.replace('</head>',`  <link rel="stylesheet" href="./${cssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${heroCssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${dailyCssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${mobileCssFile}?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./${jsFile}?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const [css,heroCss,dailyCss,mobileCss,js,dailyJs,mobileJs,nav,final]=await Promise.all([
  readFile(join(pulse,cssFile),'utf8'),
  readFile(join(pulse,heroCssFile),'utf8'),
  readFile(join(pulse,dailyCssFile),'utf8'),
  readFile(join(pulse,mobileCssFile),'utf8'),
  readFile(join(pulse,jsFile),'utf8'),
  readFile(join(pulse,dailyJsFile),'utf8'),
  readFile(join(pulse,mobileJsFile),'utf8'),
  readFile(join(pulse,navFile),'utf8'),
  readFile(htmlPath,'utf8')
]);
const itemsBlock=(nav.match(/const items=\[([\s\S]*?)\];/)||[])[1]||'';
const directScript=file=>new RegExp(`<script[^>]+src=["']\\./${file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\?[^"']*)?["']`).test(final);
const checks=[
  ['historical home renderer removed',!final.includes('patient-home-datawall-v3.js')],
  ['final home CSS loaded',final.includes(`${cssFile}?v=${release}`)],
  ['hero v2 visual layer loaded after home CSS',final.includes(`${heroCssFile}?v=${release}`)&&final.indexOf(heroCssFile)>final.indexOf(cssFile)],
  ['daily movement CSS loaded',final.includes(`${dailyCssFile}?v=${release}`)&&dailyCss.includes('.kday-steps')],
  ['mobile V1 CSS loaded last',final.includes(`${mobileCssFile}?v=${release}`)&&final.indexOf(mobileCssFile)>final.indexOf(dailyCssFile)],
  ['canonical Home owner is loaded directly',directScript(jsFile)],
  ['Home owner imports daily and mobile runtimes',js.includes(`import './${dailyJsFile}'`)&&js.includes(`import './${mobileJsFile}'`)],
  ['daily and mobile runtimes are not direct scripts',!directScript(dailyJsFile)&&!directScript(mobileJsFile)],
  ['legacy clarity runtime is no longer direct',!directScript(clarityJsFile)],
  ['daily movement runtime is event-driven',dailyJs.includes("rpc('komo_walk_summary')")&&!dailyJs.includes('MutationObserver')],
  ['mobile runtime is event-driven',mobileJs.includes("title.textContent='Bienvenue.'")&&!mobileJs.includes('MutationObserver')],
  ['current Home cockpit uses khv surfaces',css.includes('.khv-grid')&&css.includes('.khv-motion')&&css.includes('@media (max-width:767px)')],
  ['mobile is edge-to-edge and removes nested chrome',mobileCss.includes('.mobile-nav')&&mobileCss.includes('width:100%!important')&&mobileCss.includes('body.khome-final-v1 .topbar{display:none!important}')],
  ['mobile removes avatar and enlarges movement',mobileCss.includes('.avatar-button{display:none!important}')&&mobileCss.includes('.kday-steps strong')&&mobileCss.includes('font-size:78px!important')],
  ['canonical Motion result remains read-only',js.includes('loadCanonicalResult')&&!js.includes("from('scores').update")&&!js.includes("from('scores').insert")],
  ['KEY uses consent-gated wearable data',js.includes("from('wearable_consents')")&&js.includes("purpose','connected_followup")&&js.includes("from('wearable_daily_metrics')")],
  ['KEY averages use observed days only',js.includes('currentDays=new Set(current.map(r=>r.metric_date)).size')&&js.includes("avg(current,'steps')")],
  ['stable base renderer has no body observer or polling loop',!js.includes('MutationObserver')&&!js.includes('setInterval(')],
  ['patient-safe status vocabulary is current',js.includes("label:'PUBLIÉ'")&&js.includes("label:'VALIDÉ'")&&js.includes("label:'EN REVUE'")],
  ['home exposes essential patient routes',js.includes('data-khv-route="results"')&&js.includes('data-khv-route="trajectory"')&&js.includes('data-khv-route="key"')&&js.includes('data-khv-route="agenda"')],
  ['daily layer exposes steps K Points and Komo',dailyJs.includes('steps_today')&&dailyJs.includes('k_points_today')&&dailyJs.includes('KOMO · INSIGHT')],
  ['final patient dock is cache-busted',final.includes(`${navFile}?v=${navRelease}`)],
  ['dock uses final six destinations',itemsBlock.includes("['home','Accueil'")&&itemsBlock.includes("['key','KEY'")&&itemsBlock.includes("['results','Résultats'")&&itemsBlock.includes("['trajectory','Trajectoire'")&&itemsBlock.includes("['agenda','Rendez-vous'")&&itemsBlock.includes("['mykomo','My KŌMØ'")],
  ['Club and product picker are secondary, not rendered in primary dock',!itemsBlock.includes("['club','Club'")&&!itemsBlock.includes("['assessment','KŌMØ'")&&!nav.includes('kpPickerV6')]
];
for(const [label,ok] of checks)console.log(`[pulse-home-web-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-home-web-v1] PASS · canonical Home owner + imported daily/mobile layers');