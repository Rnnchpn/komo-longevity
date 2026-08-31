import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260831-home-v3-komo-v2';
const navRelease='20260830-patient-nav-v7';
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
const clarityJsFile='patient-v1-clarity.js';
const entryFile='patient-home-entry-v1.js';
const navFile='pulse-bottom-nav-v6.js';

for(const file of [cssFile,heroCssFile,dailyCssFile,mobileCssFile,jsFile,dailyJsFile,mobileJsFile,aiClientFile,assistantJsFile,assistantCssFile,navFile]){
  await copyFile(join(root,'pulse-app',file),join(pulse,file));
}

// Home V3 is the single patient Home owner. It imports Komo AI, the unified
// assistant shell and the presentation-only mobile runtime. The historical
// Daily overlay remains available as an asset for compatibility but is no
// longer mounted by Home.
const jsPath=join(pulse,jsFile);
let homeJs=await readFile(jsPath,'utf8');
const requiredImports=[aiClientFile,assistantJsFile,mobileJsFile];
const missingImports=requiredImports.filter(file=>!homeJs.includes(`import './${file}'`));
if(missingImports.length){
  homeJs=missingImports.map(file=>`import './${file}';`).join('\n')+'\n'+homeJs;
  await writeFile(jsPath,homeJs,'utf8');
}

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<script type="module" src="\.\/patient-home-datawall-v3\.js(?:\?v=[^"]+)?"><\/script>/g,'');
for(const file of [cssFile,heroCssFile,dailyCssFile,mobileCssFile,assistantCssFile]){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\./${escaped}(?:\\?v[^\"]+)?"\\s*\\/?>`,'g'),'');
}
for(const file of [entryFile,jsFile,dailyJsFile,mobileJsFile,aiClientFile,assistantJsFile,clarityJsFile]){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${escaped}(?:\\?v=[^\"]+)?"><\\/script>`,'g'),'');
}
html=html.replace(/(<script src="\.\/pulse-bottom-nav-v6\.js)(?:\?v=[^"]+)?("><\/script>)/g,`$1?v=${navRelease}$2`);
html=html.replace('</head>',`  <link rel="stylesheet" href="./${cssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${heroCssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${dailyCssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${mobileCssFile}?v=${release}" />\n  <link rel="stylesheet" href="./${assistantCssFile}?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./${jsFile}?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const [css,heroCss,dailyCss,mobileCss,js,dailyJs,mobileJs,aiClient,assistantJs,assistantCss,nav,final]=await Promise.all([
  readFile(join(pulse,cssFile),'utf8'),
  readFile(join(pulse,heroCssFile),'utf8'),
  readFile(join(pulse,dailyCssFile),'utf8'),
  readFile(join(pulse,mobileCssFile),'utf8'),
  readFile(join(pulse,jsFile),'utf8'),
  readFile(join(pulse,dailyJsFile),'utf8'),
  readFile(join(pulse,mobileJsFile),'utf8'),
  readFile(join(pulse,aiClientFile),'utf8'),
  readFile(join(pulse,assistantJsFile),'utf8'),
  readFile(join(pulse,assistantCssFile),'utf8'),
  readFile(join(pulse,navFile),'utf8'),
  readFile(htmlPath,'utf8')
]);
const itemsBlock=(nav.match(/const items=\[([\s\S]*?)\];/)||[])[1]||'';
const directScript=file=>new RegExp(`<script[^>]+src=["']\\./${file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\?[^"']*)?["']`).test(final);
const checks=[
  ['historical home renderer removed',!final.includes('patient-home-datawall-v3.js')],
  ['final Home V3 CSS loaded',final.includes(`${cssFile}?v=${release}`)],
  ['assistant CSS is shipped with Home',final.includes(`${assistantCssFile}?v=${release}`)&&assistantCss.includes('#komoAssistantRail')&&assistantCss.includes('#komoAssistantDrawer')],
  ['mobile V1 CSS remains final patient presentation layer',final.includes(`${mobileCssFile}?v=${release}`)],
  ['canonical Home owner is loaded directly',directScript(jsFile)],
  ['Home owner imports AI assistant and mobile runtimes',js.includes(`import './${aiClientFile}'`)&&js.includes(`import './${assistantJsFile}'`)&&js.includes(`import './${mobileJsFile}'`)],
  ['AI assistant and mobile runtimes are not direct scripts',!directScript(aiClientFile)&&!directScript(assistantJsFile)&&!directScript(mobileJsFile)&&!directScript(dailyJsFile)],
  ['Komo AI client calls authenticated operator chat',aiClient.includes("functions.invoke('komo-operator-v1'")&&aiClient.includes("action:'chat'")&&aiClient.includes('window.KomoAI')],
  ['Komo assistant is genuinely conversational',assistantJs.includes('window.KomoAI.ask')&&assistantJs.includes('Je suis Komo')&&assistantJs.includes('data-ka2-form')],
  ['Komo assistant supports patient and admin/pro contexts',assistantJs.includes("KŌMØ PRO")&&assistantJs.includes('priorités du centre')&&assistantJs.includes('window.KomoAssistantV2')],
  ['Komo assistant has no global mutation observer',!assistantJs.includes('MutationObserver')],
  ['legacy clarity runtime is no longer direct',!directScript(clarityJsFile)],
  ['historical daily movement runtime is event-driven',dailyJs.includes("rpc('komo_walk_summary')")&&!dailyJs.includes('MutationObserver')],
  ['mobile runtime is event-driven',mobileJs.includes("title.textContent='Bienvenue.'")&&!mobileJs.includes('MutationObserver')],
  ['current Home uses the five-signal V3 surfaces',css.includes('.kh3-movement')&&css.includes('.kh3-strip')&&css.includes('.kh3-next')&&js.includes('VOTRE JOURNÉE EN MOUVEMENT')],
  ['Home is one layer rather than Daily overlay stack',!js.includes(`import './${dailyJsFile}'`)&&js.includes("rpc('komo_walk_summary')")],
  ['mobile is edge-to-edge and removes nested chrome',mobileCss.includes('.mobile-nav')&&mobileCss.includes('width:100%!important')&&mobileCss.includes('body.khome-final-v1 .topbar{display:none!important}')],
  ['mobile removes avatar',mobileCss.includes('.avatar-button{display:none!important}')],
  ['canonical Motion result remains read-only',js.includes('loadCanonicalResult')&&!js.includes("from('scores').update")&&!js.includes("from('scores').insert")],
  ['Home uses canonical consent-aware walk summary',js.includes("rpc('komo_walk_summary')")&&!js.includes("from('wearable_daily_metrics')")],
  ['Motion Score is shown only after release',js.includes("['released','published']")&&js.includes('released(result)')&&js.includes("copy:has?'En validation':'À établir'")],
  ['stable Home renderer has no body observer or polling loop',!js.includes('MutationObserver')&&!js.includes('setInterval(')],
  ['Home exposes essential patient destinations',js.includes("route:'results'")&&js.includes("route:'key'")&&js.includes("route:'documents'")&&js.includes('data-kh3-route="mykomo"')],
  ['Home exposes steps K Points and Walk Club',js.includes('steps_today')&&js.includes('k_points_today')&&js.includes('WALK CLUB')],
  ['final patient dock is cache-busted',final.includes(`${navFile}?v=${navRelease}`)],
  ['dock uses final six destinations',itemsBlock.includes("['home','Accueil'")&&itemsBlock.includes("['key','KEY'")&&itemsBlock.includes("['results','Résultats'")&&itemsBlock.includes("['trajectory','Trajectoire'")&&itemsBlock.includes("['agenda','Rendez-vous'")&&itemsBlock.includes("['mykomo','My KŌMØ'")],
  ['Club and product picker are secondary, not rendered in primary dock',!itemsBlock.includes("['club','Club'")&&!itemsBlock.includes("['assessment','KŌMØ'")&&!nav.includes('kpPickerV6')]
];
for(const [label,ok] of checks)console.log(`[pulse-home-web-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-home-web-v1] PASS · single-layer Home V3 + unified Komo patient/admin assistant');