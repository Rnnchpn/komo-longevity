import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260901-home-motion-today-v6-3-komo-links';
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
const navCoreFile='patient-navigation-core-v1.js';
const clubFile='club-hub-v1.js';

for(const file of [cssFile,mobileCssFile,jsFile,mobileJsFile,aiClientFile,assistantJsFile,assistantCssFile,resultsOwnerFile,agendaMapFile,navFile]){
  await copyFile(join(root,'pulse-app',file),join(pulse,file));
}

const jsPath=join(pulse,jsFile);
let homeJs=await readFile(jsPath,'utf8');
// Preserve current route-runtime reachability while Home itself performs a single data request.
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

const [css,mobileCss,js,mobileJs,aiClient,assistantJs,assistantCss,resultsOwner,agendaMap,nav,navCore,club,final]=await Promise.all([
  readFile(join(pulse,cssFile),'utf8'),readFile(join(pulse,mobileCssFile),'utf8'),readFile(join(pulse,jsFile),'utf8'),readFile(join(pulse,mobileJsFile),'utf8'),readFile(join(pulse,aiClientFile),'utf8'),readFile(join(pulse,assistantJsFile),'utf8'),readFile(join(pulse,assistantCssFile),'utf8'),readFile(join(pulse,resultsOwnerFile),'utf8'),readFile(join(pulse,agendaMapFile),'utf8'),readFile(join(pulse,navFile),'utf8'),readFile(join(root,'pulse-app',navCoreFile),'utf8'),readFile(join(root,'pulse-app',clubFile),'utf8'),readFile(htmlPath,'utf8')
]);
const directScript=file=>new RegExp(`<script[^>]+src=["']\\./${file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\?[^"']*)?["']`).test(final);
const dockRoutes=['home','key','results','trajectory','documents','mykomo'];
const checks=[
  ['historical Home renderer removed',!final.includes('patient-home-datawall-v3.js')],
  ['legacy Home bootstrap removed',!directScript(legacyBootstrapFile)],
  ['legacy My KŌMØ Home owner removed',!directScript(legacyMyKomoHomeFile)],
  ['legacy Home visual layers removed',!final.includes(heroCssFile)&&!final.includes(dailyCssFile)&&!directScript(dailyJsFile)],
  ['Home V6.3 CSS cache-busted',final.includes(`${cssFile}?v=${release}`)],
  ['Home V6.3 owner loaded once',directScript(jsFile)&&((final.match(new RegExp(jsFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length===1)],
  ['Home V6.3 owns its DOM',js.includes('host.replaceChildren(node)')&&js.includes("host.dataset.khomeOwner='patient-home-command-v1@6'")],
  ['Home V6.3 is Motion Today only',js.includes('MOTION TODAY')&&js.includes("metricCard('steps'")&&js.includes("metricCard('sleep'")&&js.includes("metricCard('resting_hr'")],
  ['Home V6.3 excludes clinical score and trajectory widgets',!js.includes('MOTION SCORE')&&!js.includes('MOTION AGE')&&!js.includes('kh5-komo')&&!js.includes('kh5-signals')],
  ['Home V6.3 performs one canonical wearable RPC',js.includes("rpc('komo_motion_today_v1')")&&!js.includes("rpc('komo_walk_summary')")&&!js.includes('pulseOverview()')&&!js.includes('pulse_score_runs')],
  ['Home V6.3 never queries wearable tables directly',!js.includes("from('wearable_daily_metrics')")],
  ['Home V6.3 has explicit incomplete states',js.includes('Sync your wearable')&&js.includes('Building your baseline')===false],
  ['Home renderer has no persistent observer or polling',!js.includes('MutationObserver')&&!js.includes('setInterval(')],
  ['Home paints an immediate loading shell',js.includes('homeMarkup(null,{},true)')&&js.includes('aria-busy')],
  ['Home neutral black canvas uses green as accent',css.includes('--kh6-bg:#050706')&&css.includes('--kh6-green:#7fa58a')&&css.includes('--kh6-green-core:#315b41')&&css.includes('.kh6-score')],
  ['Home shell is black full bleed',css.includes('body.khome-final-v1 .main-shell')&&css.includes('body.khome-final-v1 .view-root')&&css.includes('max-width:none!important')&&css.includes('padding-left:0!important')&&css.includes('padding-right:0!important')],
  ['KŌMØ Pulse is integrated in the Home chrome',css.includes('.kh6-hud::before')&&css.includes('content:"KŌMØ · PULSE"')],
  ['Home exposes consultation preparation and Komo Club through canonical routes',js.includes('Préparez votre consultation')&&js.includes('data-kh6-route="documents"')&&js.includes('Komo Club')&&js.includes('data-kh6-route="club"')&&js.includes('KomoPatientNavigation.go(target)')],
  ['Komo Club canonical owner remains reachable',navCore.includes("'club'")&&club.includes("route()!=='club'")],
  ['all six dock destinations are canonical patient routes',dockRoutes.every(r=>nav.includes(`'${r}'`)&&navCore.includes(`'${r}'`))],
  ['desktop iPad mobile share one metric contract',css.includes('grid-template-columns:repeat(3,minmax(0,1fr))')&&css.includes('@media(max-width:900px)')&&css.includes('@media(max-width:640px)')],
  ['one-screen Home prevents lateral and vertical canvas drift',css.includes('overflow:hidden')],
  ['reduced motion supported',css.includes('@media(prefers-reduced-motion:reduce)')],
  ['mobile runtime remains event-driven',!mobileJs.includes('MutationObserver')],
  ['assistant bridge remains available',assistantJs.includes('window.KomoAssistantV2')&&aiClient.includes('window.KomoAI')&&assistantCss.includes('#komoAssistantDrawer')],
  ['assistant survives transient route visibility and reappears',assistantJs.includes('rail.hidden=true')&&assistantJs.includes('currentRail.hidden=false')&&!assistantJs.includes("querySelector('#komoAssistantRail')?.remove()")&&assistantJs.includes('komo:canonical-route')&&assistantJs.includes('komo:home-command-rendered')],
  ['Home Komo launcher stays above the patient dock',js.includes('z-index:11000!important')&&js.includes('#komoAssistantRail')],
  ['Results owner remains reachable',resultsOwner.includes('KomoPatientResultsV1')],
  ['Agenda fallback remains reachable',agendaMap.includes('google.com/maps/search')&&!agendaMap.includes('MutationObserver')],
  ['required route runtimes are imports not duplicate direct scripts',requiredImports.every(file=>js.includes(`${file}?v=${release}`)&&!directScript(file))],
  ['patient navigation stays canonical',nav.includes('KomoPatientNavigation?.go?.')&&!nav.includes("location.hash=`")],
  ['Home refreshes on wearable data update',js.includes('komo:wearable-data-updated')],
  ['Profile and experience reuse canonical sources',js.includes("from('profiles')")&&js.includes("rpc('komo_engagement_summary')")&&js.includes('xp_total')&&js.includes('level')]
];
for(const [label,ok] of checks)console.log(`[pulse-home-web-v6] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-home-web-v6] PASS · ${checks.length}/${checks.length} Motion Today web assertions`);
