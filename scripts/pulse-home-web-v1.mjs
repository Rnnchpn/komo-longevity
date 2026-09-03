import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

// Re-apply the approved patient IA after every historical Pulse layer, immediately
// before the final Home/navigation package is copied into production output.
await import('./pulse-information-architecture-v11.mjs');

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260903-home-direction-v7';
const cssFile='patient-home-command-v1.css';
const mobileCssFile='patient-mobile-v1.css';
const jsFile='patient-home-command-v1.js';
const mobileJsFile='patient-mobile-v1.js';
const assistantCssFile='komo-assistant-shell-v2.css';
const navFile='pulse-bottom-nav-v6.js';
const navCoreFile='patient-navigation-core-v1.js';
const legacyCss=['patient-home-hero-v2.css','patient-home-daily-v2.css'];
const legacyScripts=['patient-home-entry-v1.js','patient-home-daily-v2.js','patient-home-datawall-v3.js','patient-home-visual-v2.js','patient-home-micro-motion-v1.js','pulse-home-hero-polish-v2.js','home-clarity-v1.js','my-komo-home-v1.js'];

// The Home finalizer copies only the canonical Home/navigation assets. Health data runtimes
// remain owned by Results and Connected and are intentionally not imported by Home.
for(const file of [cssFile,mobileCssFile,jsFile,mobileJsFile,assistantCssFile,navFile]){
  await copyFile(join(root,'pulse-app',file),join(pulse,file));
}

let html=await readFile(htmlPath,'utf8');
const esc=file=>file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

for(const file of [cssFile,mobileCssFile,assistantCssFile,...legacyCss]){
  html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\./${esc(file)}(?:\\?[^\"]*)?"\\s*\\/?>`,'g'),'');
}
for(const file of [jsFile,mobileJsFile,...legacyScripts]){
  html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${esc(file)}(?:\\?[^\"]*)?"><\\/script>`,'g'),'');
}
html=html.replace(/(<script src="\.\/pulse-bottom-nav-v6\.js)(?:\?v=[^"]+)?("><\/script>)/g,`$1?v=${release}$2`);
html=html.replace('</head>',`  <link rel="stylesheet" href="./${cssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${mobileCssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${assistantCssFile}?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./${jsFile}?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const [css,js,mobileJs,nav,navCore,final]=await Promise.all([
  readFile(join(pulse,cssFile),'utf8'),
  readFile(join(pulse,jsFile),'utf8'),
  readFile(join(pulse,mobileJsFile),'utf8'),
  readFile(join(pulse,navFile),'utf8'),
  readFile(join(root,'pulse-app',navCoreFile),'utf8'),
  readFile(htmlPath,'utf8')
]);
const finalScript=file=>new RegExp(`<script[^>]+src=["']\\./${esc(file)}(?:\\?[^"']*)?["']`).test(final);
const finalDock=['home','results','key','documents','mykomo'];
const primaryDockRows=nav.match(/^\s*\['(?:home|key|results|trajectory|agenda|mykomo)'/gm)||[];
const checks=[
  ['historical Home data renderer removed',!final.includes('patient-home-datawall-v3.js')],
  ['legacy Home bootstrap removed',!finalScript('home-clarity-v1.js')],
  ['legacy My KŌMØ Home owner removed',!finalScript('my-komo-home-v1.js')],
  ['legacy Home visual layers removed',legacyCss.every(file=>!final.includes(file))&&legacyScripts.every(file=>!finalScript(file))],
  ['Home V7 CSS cache-busted',final.includes(`${cssFile}?v=${release}`)],
  ['Home V7 owner loaded once',finalScript(jsFile)&&((final.match(new RegExp(esc(jsFile),'g'))||[]).length===1)],
  ['Home V7 owns the canonical host',js.includes('data-khome-v7')&&js.includes("host.dataset.khomeOwner='patient-home-command-v1@7'")],
  ['Home V7 is explicitly data free',js.includes('dataFree:true')&&!js.includes("rpc('")&&!js.includes("from('")],
  ['Home exposes no health metric or score UI',!js.includes('MOTION TODAY')&&!js.includes('Steps')&&!js.includes('Sleep')&&!js.includes('Resting HR')&&!js.includes('Motion Score')&&!js.includes('MOTION AGE')],
  ['Home routes to Results',js.includes('data-kh7-route="results"')],
  ['Home routes to Connected',js.includes('data-kh7-route="key"')],
  ['Home routes to Consultations & rendez-vous',js.includes('data-kh7-route="documents"')&&js.includes('Consultations & rendez-vous')],
  ['Home routes to My KŌMØ',js.includes('data-kh7-route="mykomo"')],
  ['Home uses canonical navigation only',js.includes('KomoPatientNavigation.go(target)')&&!js.includes("location.hash='results'")&&!js.includes("location.hash='documents'")],
  ['Home renderer has no persistent observer or polling',!js.includes('MutationObserver')&&!js.includes('setInterval(')],
  ['Home loads no Results or Agenda data runtime',!js.includes('patient-results-ownership-v2.js')&&!js.includes('agenda-map-resilience-v1.js')],
  ['Home keeps assistant and responsive runtime as imports',js.includes("import './komo-assistant-shell-v2.js'")&&js.includes("import './patient-mobile-v1.js'")&&!finalScript(mobileJsFile)],
  ['desktop dock has exactly five primary rows',primaryDockRows.length===5],
  ['desktop dock uses approved labels',nav.includes("['home','Home'")&&nav.includes("['results','Résultats'")&&nav.includes("['key','Connected'")&&nav.includes("['agenda','Consultations & rendez-vous'")&&nav.includes("['mykomo','My KŌMØ'")&&!nav.includes("['trajectory','Trajectoire'")],
  ['five destinations stay canonical routes',finalDock.every(r=>navCore.includes(`'${r}'`))],
  ['desktop dock uses five columns',nav.includes('grid-template-columns:repeat(5,minmax(0,1fr))')],
  ['Home neutral black canvas uses green only as accent',css.includes('--kh7-bg:#050706')&&css.includes('--kh7-green:#7fa58a')&&css.includes('--kh7-green-core:#315b41')],
  ['Home shell is full bleed and one-screen',css.includes('max-width:none!important')&&css.includes('overflow:hidden!important')],
  ['desktop iPad mobile share one information contract',css.includes('@media(max-width:900px)')&&css.includes('@media(max-width:640px)')&&css.includes('@media(max-width:370px)')],
  ['reduced motion supported',css.includes('@media(prefers-reduced-motion:reduce)')],
  ['mobile runtime remains event-driven',!mobileJs.includes('MutationObserver')]
];
for(const [label,ok] of checks)console.log(`[pulse-home-web-v7] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-home-web-v7] PASS · ${checks.length}/${checks.length} data-free Home + five-navigation assertions`);
