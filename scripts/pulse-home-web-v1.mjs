import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260901-home-final-v5';
const navRelease='20260831-patient-nav-v721';
const cssFile='patient-home-command-v1.css';
const heroCssFile='patient-home-hero-v2.css';
const dailyCssFile='patient-home-daily-v2.css';
const mobileCssFile='patient-mobile-v1.css';
const jsFile='patient-home-command-v1.js';
const dailyJsFile='patient-home-daily-v2.js';
const mobileJsFile='patient-mobile-v1.js';
const aiClientFile='komo-ai-client-v1.js';
const assistantJsFile='komo-assistant-shell-v2.js';
const assistantCssFile='komo-assistant-shell-v2.css';
const resultsOwnerFile='patient-results-ownership-v2.js';
const agendaMapFile='agenda-map-resilience-v1.js';
const clarityJsFile='patient-v1-clarity.js';
const legacyBootstrapFile='home-clarity-v1.js';
const legacyMyKomoHomeFile='my-komo-home-v1.js';
const entryFile='patient-home-entry-v1.js';
const navFile='pulse-bottom-nav-v6.js';

for(const file of [cssFile,mobileCssFile,jsFile,mobileJsFile,aiClientFile,assistantJsFile,assistantCssFile,resultsOwnerFile,agendaMapFile,navFile]){
  await copyFile(join(root,'pulse-app',file),join(pulse,file));
}

const jsPath=join(pulse,jsFile);
let homeJs=await readFile(jsPath,'utf8');
const requiredImports=[aiClientFile,assistantJsFile,resultsOwnerFile,agendaMapFile,mobileJsFile];
for(const file of requiredImports){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(`import\\s+['\"]\\./${escaped}(?:\\?v=[^'\"]+)?['\"];?`);
  const statement=`import './${file}?v=${release}';`;
  if(re.test(homeJs))homeJs=homeJs.replace(re,statement);
  else homeJs=statement+'\n'+homeJs;
}
await writeFile(jsPath,homeJs,'utf8');

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<script type="module" src="\.\/patient-home-datawall-v3\.js(?:\?v=[^"]+)?"><\/script>/g,'');
for(const file of [cssFile,heroCssFile,dailyCssFile,mobileCssFile,assistantCssFile]){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\./${escaped}(?:\\?v[^\"]+)?"\\s*\\/?>`,'g'),'');
}
for(const file of [entryFile,jsFile,dailyJsFile,mobileJsFile,aiClientFile,assistantJsFile,resultsOwnerFile,agendaMapFile,clarityJsFile,legacyBootstrapFile,legacyMyKomoHomeFile]){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${escaped}(?:\\?v=[^\"]+)?"><\\/script>`,'g'),'');
}
html=html.replace(/(<script src="\.\/pulse-bottom-nav-v6\.js)(?:\?v=[^"]+)?("><\/script>)/g,`$1?v=${navRelease}$2`);
html=html.replace('</head>',`  <link rel="stylesheet" href="./${cssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${mobileCssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${assistantCssFile}?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./${jsFile}?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const [css,mobileCss,js,mobileJs,aiClient,assistantJs,assistantCss,resultsOwner,agendaMap,nav,final]=await Promise.all([
  readFile(join(pulse,cssFile),'utf8'),
  readFile(join(pulse,mobileCssFile),'utf8'),
  readFile(join(pulse,jsFile),'utf8'),
  readFile(join(pulse,mobileJsFile),'utf8'),
  readFile(join(pulse,aiClientFile),'utf8'),
  readFile(join(pulse,assistantJsFile),'utf8'),
  readFile(join(pulse,assistantCssFile),'utf8'),
  readFile(join(pulse,resultsOwnerFile),'utf8'),
  readFile(join(pulse,agendaMapFile),'utf8'),
  readFile(join(pulse,navFile),'utf8'),
  readFile(htmlPath,'utf8')
]);
const itemsBlock=(nav.match(/const items=\[([\s\S]*?)\];/)||[])[1]||'';
const directScript=file=>new RegExp(`<script[^>]+src=["']\\./${file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\?[^"']*)?["']`).test(final);
const checks=[
  ['historical home renderer removed',!final.includes('patient-home-datawall-v3.js')],
  ['legacy Home bootstrap removed',!directScript(legacyBootstrapFile)],
  ['legacy My KŌMØ Home owner removed',!directScript(legacyMyKomoHomeFile)],
  ['legacy Home visual layers removed',!final.includes(heroCssFile)&&!final.includes(dailyCssFile)&&!directScript(dailyJsFile)],
  ['final Home V5 CSS loaded',final.includes(`${cssFile}?v=${release}`)],
  ['Home uses neutral premium canvas with KŌMØ green as accent',css.includes('--kh5-bg:#f0eee8')&&css.includes('--kh5-green:#315b41')&&css.includes('.kh5-komo')],
  ['Home identifies KŌMØ immediately',js.includes('kh5-wordmark')&&js.includes('KŌMØ')&&js.includes('PULSE')&&css.includes('.kh5-wordmark')],
  ['Home hierarchy is Motion then Komo then monitoring signals',js.indexOf('kh5-motion')<js.indexOf('kh5-komo')&&js.indexOf('kh5-komo')<js.indexOf('kh5-signals')],
  ['Home exclusively owns its DOM',js.includes('host.replaceChildren(node)')&&js.includes("host.dataset.khomeOwner='patient-home-command-v1@5'")],
  ['Home appointment no longer depends on legacy DOM',js.includes('pulseOverview()')&&js.includes('overview?.records')&&!js.includes("document.querySelector('.mykomo-next')")],
  ['assistant CSS is shipped with Home',final.includes(`${assistantCssFile}?v=${release}`)&&assistantCss.includes('#komoAssistantRail')&&assistantCss.includes('#komoAssistantDrawer')],
  ['mobile V1 CSS remains final patient presentation layer',final.includes(`${mobileCssFile}?v=${release}`)],
  ['canonical Home owner is loaded directly',directScript(jsFile)],
  ['Home imports AI assistant mobile and narrow guards',requiredImports.every(file=>js.includes(file)&&js.includes(`${file}?v=${release}`))],
  ['imported runtimes are not direct scripts',requiredImports.every(file=>!directScript(file))],
  ['Komo AI client calls authenticated operator chat',aiClient.includes("functions.invoke('komo-operator-v1'")&&aiClient.includes("action:'chat'")&&aiClient.includes('window.KomoAI')],
  ['Komo degraded mode is explicit',aiClient.includes('Mode Pulse vérifié')&&aiClient.includes('fallback:true')],
  ['Komo assistant answers greetings naturally',assistantJs.includes('conversationalShortcut')&&assistantJs.includes("headline:'Bonjour.'")],
  ['Komo assistant is genuinely conversational',assistantJs.includes('window.KomoAI.ask')&&assistantJs.includes('Je suis Komo')&&assistantJs.includes('data-ka2-form')],
  ['Komo assistant supports patient and admin/pro contexts',assistantJs.includes('KŌMØ PRO')&&assistantJs.includes('priorités du centre')&&assistantJs.includes('window.KomoAssistantV2')],
  ['Komo assistant has no global mutation observer',!assistantJs.includes('MutationObserver')],
  ['Results V2 owns visible patient Results',resultsOwner.includes("classList.toggle('kresults-v1'")&&resultsOwner.includes('[data-kcanon-detail]')&&resultsOwner.includes('KomoPatientResultsV1')],
  ['Agenda map has a functional external fallback',agendaMap.includes('ag4-map-fallback')&&agendaMap.includes('google.com/maps/search')&&!agendaMap.includes('MutationObserver')],
  ['legacy clarity runtime is no longer direct',!directScript(clarityJsFile)],
  ['mobile runtime is event-driven',mobileJs.includes("title.textContent='Bienvenue.'")&&!mobileJs.includes('MutationObserver')],
  ['current Home is the final decision surface',js.includes('VOTRE MOUVEMENT AUJOURD’HUI')&&js.includes('KOMO · PRIORITÉ')&&js.includes('KEY · QUOTIDIEN')&&js.includes('TRAJECTOIRE')&&js.includes('PROCHAINE ÉTAPE')],
  ['mobile remains one content contract and becomes vertical only by CSS',css.includes('@media(max-width:767px)')&&css.includes('.kh5-hero{grid-template-columns:1fr')&&css.includes('.kh5-signals{grid-template-columns:1fr')],
  ['mobile removes avatar',mobileCss.includes('.avatar-button{display:none!important}')],
  ['Home gates Motion Score to released or published results',js.includes("const RELEASED=new Set(['released','published'])")&&js.includes('released(status)?num(canonical?.motion_score):null')],
  ['Home does not query canonical scores directly',!js.includes("from('scores')")],
  ['Home uses canonical consent-aware walk summary',js.includes("rpc('komo_walk_summary')")&&!js.includes("from('wearable_daily_metrics')")],
  ['Home turns KEY into one contextual monitoring signal',js.includes('function keySignal(')&&js.includes('steps_avg_7d')&&js.includes('Votre activité du jour')],
  ['stable Home renderer has no body observer or polling loop',!js.includes('MutationObserver')&&!js.includes('setInterval(')],
  ['Home has no historical delayed retry ladder',!js.includes('[80,260,800,1800]')&&!js.includes('1700')],
  ['Home paints an immediate loading shell before data resolves',js.includes('homeMarkup(null,null,[],true)')&&js.includes('aria-busy')],
  ['Home exposes essential patient destinations',js.includes("route:'key'")&&js.includes("route:'trajectory'")&&js.includes("route:'agenda'")&&js.includes('data-kh5-route="results"')],
  ['Home keeps Club and K Points secondary',js.includes('communityLine(walk)')&&js.includes('k_points_week')&&js.includes('Walk Club')],
  ['Home exposes next consultation context',js.includes('currentAppointment')&&js.includes('appointment_type')&&js.includes('center_name')],
  ['Home animations are finite and accessible',css.includes('kh5Enter .35s')&&js.includes('duration=620')&&css.includes('@media(prefers-reduced-motion:reduce)')&&!css.includes('infinite')],
  ['final patient dock is cache-busted',final.includes(`${navFile}?v=${navRelease}`)],
  ['dock retries after Home and session readiness',nav.includes('komo:home-command-rendered')&&nav.includes('komo:route-ready')&&nav.includes('setTimeout(refresh,ms)')],
  ['dock is persistent outside app mount tree',nav.includes('document.body.appendChild(d)')&&nav.includes('kpulse-app-mode')],
  ['dock uses canonical navigation only',nav.includes('KomoPatientNavigation?.go?.')&&!nav.includes("location.hash=`")],
  ['dock uses final six destinations',itemsBlock.includes("['home','Accueil'")&&itemsBlock.includes("['key','KEY'")&&itemsBlock.includes("['results','Résultats'")&&itemsBlock.includes("['trajectory','Trajectoire'")&&itemsBlock.includes("['agenda','Rendez-vous'")&&itemsBlock.includes("['mykomo','My KŌMØ'")]
];
for(const [label,ok] of checks)console.log(`[pulse-home-web-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-home-web-v1] PASS · final decision Home · Motion · Komo · KEY · trajectory · next step');