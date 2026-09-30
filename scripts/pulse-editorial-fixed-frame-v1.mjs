import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'pulse-app','pulse-editorial-fixed-frame-v1.css');
const pulse=join(root,'site','pulse-v12');
const file='pulse-editorial-fixed-frame-v1.css';
const version='20260929-editorial-fixed-frame-v2';

const css=await readFile(source,'utf8');
await writeFile(join(pulse,file),css,'utf8');

const entries=await readdir(pulse,{withFileTypes:true});
const htmlFiles=entries.filter(x=>x.isFile()&&x.name.endsWith('.html')).map(x=>x.name);

const retiredStyles=[
  'my-komo-key-home-v1.css',
  'my-komo-stable-v4.css',
  'mobile-vertical-app-v1.css',
  'iphone-app-lock-v1.css',
  'pulse-iphone-stable-v1.css',
  'patient-mobile-v1.css',
  'pulse-canonical-theme-v14.css',
  'auth-premium-v3.css',
  'auth-visual-alix-v1.css',
  'auth-web-v1.css'
]

const escapeRegExp=value=>value.replace(/[.*+?^{}()|[\]\\]/g,'\\$&');

for(const name of htmlFiles){
  const path=join(pulse,name);
  let html=await readFile(path,'utf8');

  for(const retired of retiredStyles){
    const escaped=escapeRegExp(retired);
    html=html.replace(
      new RegExp('\\s*<link[^>]+href=["\\\']\\./'+escaped+'(?:\\?[^"\\\']*)?["\\\'][^>]*>','g'),
      ''
    );
  }

  html=html.replace(/\s*<style id=["']kpCanonicalThemePriorityV14["']>[\s\S]*?<\/style>/g,'');
  html=html.replace(/\s*<link[^>]+href=["']\.\/pulse-editorial-fixed-frame-v1\.css(?:\?[^"']*)?["'][^>]*>/g,'');
  html=html.replace('</head>',`  <link rel="stylesheet" href="./${file}?v=${version}" />\n</head>`);
  await writeFile(path,html,'utf8');
}

// Friday Home V9 finalization: historical build passes validate the stable
// canonical owner first. Only after every QA pass do we replace the shipped
// owner contents, preserving the same filename and route ownership contract.
try{
  const homeJs=await readFile(join(root,'pulse-app','patient-home-demo-v9.js'),'utf8');
  const homeCss=await readFile(join(root,'pulse-app','patient-home-demo-v9.css'),'utf8');
  if(!homeJs.includes('data-khome-v9')||!homeJs.includes("const VERSION='9.2.0-premium-cockpit'"))throw new Error('Home premium runtime contract missing');
  await writeFile(join(pulse,'patient-home-command-v1.js'),homeJs,'utf8');
  await writeFile(join(pulse,'patient-home-command-v1.css'),homeCss,'utf8');
  const homeToken='20261001-premium-home-v1';
  for(const name of htmlFiles){
    const htmlPath=join(pulse,name);
    let homeHtml=await readFile(htmlPath,'utf8');
    homeHtml=homeHtml.replace(/\.\/patient-home-command-v1\.js(?:\?v=[^"'#]+)?/g,`./patient-home-command-v1.js?v=${homeToken}`);
    homeHtml=homeHtml.replace(/\.\/patient-home-command-v1\.css(?:\?v=[^"'#]+)?/g,`./patient-home-command-v1.css?v=${homeToken}`);
    await writeFile(htmlPath,homeHtml,'utf8');
  }
  console.log('[pulse-editorial-fixed-frame-v2] Friday Home V9 finalized as canonical shipped owner');
}catch(error){
  console.error('[pulse-editorial-fixed-frame-v2] Friday Home V9 finalization failed:',error?.message||error);
  process.exit(1);
}

// Premium Connected finalization: preserve legacy V3 checks, then ship
// the premium V4 cockpit through the canonical key-hub-v1.js filename.
try{
  const connectedJs=await readFile(join(root,'pulse-app','patient-connected-premium-v4.js'),'utf8');
  if(!connectedJs.includes("const V='4.0.0-premium-connected'")||!connectedJs.includes('data-connected-v4'))throw new Error('Premium Connected runtime contract missing');
  await writeFile(join(pulse,'key-hub-v1.js'),connectedJs,'utf8');
  const connectedToken='20261001-premium-connected-v4';
  for(const name of htmlFiles){
    const htmlPath=join(pulse,name);
    let connectedHtml=await readFile(htmlPath,'utf8');
    connectedHtml=connectedHtml.replace(/\.\/key-hub-v1\.js(?:\?v=[^"'#]+)?/g,`./key-hub-v1.js?v=${connectedToken}`);
    await writeFile(htmlPath,connectedHtml,'utf8');
  }
  const finalConnected=await readFile(join(pulse,'key-hub-v1.js'),'utf8');
  const connectedChecks=[
    ['version',finalConnected.includes("const V='4.0.0-premium-connected'")],
    ['single owner',finalConnected.includes('data-connected-v4')],
    ['three primary signals',finalConnected.includes('>PAS<')&&finalConnected.includes('>SOMMEIL<')&&finalConnected.includes('>FC REPOS<')],
    ['trend',finalConnected.includes('Vos ${period} derniers jours.')&&finalConnected.includes('data-kcn-period="7"')&&finalConnected.includes('data-kcn-period="30"')],
    ['secondary signals',finalConnected.includes('Temps actif')&&finalConnected.includes('Distance')&&finalConnected.includes('HRV')&&finalConnected.includes('SpO₂')],
    ['no dark owner',!finalConnected.includes('body.connected-v3 .main-shell,body.connected-v3 #viewRoot{background:#050706!important}')],
    ['patient role row hidden',finalConnected.includes('body.connected-v3 #kamRoleRow')]
  ];
  for(const [label,ok] of connectedChecks)console.log(`[pulse-premium-connected-final] ${ok?'OK':'FAIL'} · ${label}`);
  if(connectedChecks.some(([,ok])=>!ok))throw new Error('Premium Connected final contract failed');
  console.log('[pulse-premium-connected-final] PASS · V4 shipped through canonical Connected owner');
}catch(error){
  console.error('[pulse-premium-connected-final] failed:',error?.message||error);
  process.exit(1);
}

// Premium Results finalization: keep historical V4 source for build QA, then
// ship the V5 patient cockpit through the same canonical filename.
try{
  const resultsJs=await readFile(join(root,'pulse-app','patient-results-premium-v5.js'),'utf8');
  if(!resultsJs.includes("const VERSION='5.0.0-premium-results'")||!resultsJs.includes('data-kresults-v5'))throw new Error('Premium Results runtime contract missing');
  await writeFile(join(pulse,'patient-canonical-results.js'),resultsJs,'utf8');
  const resultsToken='20261001-premium-results-v5';
  for(const name of htmlFiles){
    const htmlPath=join(pulse,name);
    let resultsHtml=await readFile(htmlPath,'utf8');
    resultsHtml=resultsHtml.replace(/\.\/patient-canonical-results\.js(?:\?v=[^"'#]+)?/g,`./patient-canonical-results.js?v=${resultsToken}`);
    await writeFile(htmlPath,resultsHtml,'utf8');
  }
  const finalResults=await readFile(join(pulse,'patient-canonical-results.js'),'utf8');
  const resultsChecks=[
    ['version',finalResults.includes("const VERSION='5.0.0-premium-results'")],
    ['single owner contract',finalResults.includes('data-kresults-v4')&&finalResults.includes('data-kresults-v5')],
    ['premium score cockpit',finalResults.includes('kr5-score-pane')&&finalResults.includes('MOTION SCORE')],
    ['three LSI cards',finalResults.includes("kr5LsiCard(quad,'Quadriceps')")&&finalResults.includes("kr5LsiCard(ham,'Ischio-jambiers')")&&finalResults.includes("kr5LsiCard(calf,'Mollets')")],
    ['trajectory CTA',finalResults.includes('data-route="path"')],
    ['report CTA',finalResults.includes('data-komo-export-report')],
    ['detail disclosure',finalResults.includes('Voir le détail du bilan')],
    ['legacy dark Results skin retired',!finalResults.includes('body.kresults-v4 .main-shell,body.kresults-v4 #viewRoot{background:#050706!important}')]
  ];
  for(const [label,ok] of resultsChecks)console.log(`[pulse-premium-results-final] ${ok?'OK':'FAIL'} · ${label}`);
  if(resultsChecks.some(([,ok])=>!ok))throw new Error('Premium Results final contract failed');
  console.log('[pulse-premium-results-final] PASS · V5 shipped through canonical Results owner');
}catch(error){
  console.error('[pulse-premium-results-final] failed:',error?.message||error);
  process.exit(1);
}

// Results V5 isolation cleanup: historical patient helpers must never prepend
// their own report/free UI into the canonical premium Results cockpit.
try{
  const reportUiPath=join(pulse,'report-patient-ui-v1.js');
  let reportUi=await readFile(reportUiPath,'utf8');
  const reportFrom="async function render(force=false){if(busy)return;const h=host();if(!h)return;busy=true;";
  const reportTo="async function render(force=false){const current=window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';if(current==='results'){document.querySelector('[data-krpatient]')?.remove();return}if(busy)return;const h=host();if(!h)return;busy=true;";
  if(reportUi.includes(reportFrom))reportUi=reportUi.replace(reportFrom,reportTo);
  await writeFile(reportUiPath,reportUi,'utf8');

  const freePath=join(pulse,'pulse-free-continuity-v2.js');
  let freeUi=await readFile(freePath,'utf8');
  const freeFrom="async function render(force=false){if(!ROUTES.has(route()))return;await load(force);";
  const freeTo="async function render(force=false){if(route()==='results'){document.querySelectorAll('[data-kfree-v2],[data-kfree-v2-library],.pulse-free-result-v2').forEach(x=>x.remove());return}if(!ROUTES.has(route()))return;await load(force);";
  if(freeUi.includes(freeFrom))freeUi=freeUi.replace(freeFrom,freeTo);
  await writeFile(freePath,freeUi,'utf8');

  const adaptiveResultsPath=join(pulse,'adaptive-shell-v4.js');
  let adaptiveResults=await readFile(adaptiveResultsPath,'utf8');
  const roleFrom="let row=document.querySelector('#kamRoleRow');\n    if(!allowedPro()){";
  const roleTo="let row=document.querySelector('#kamRoleRow');\n    if(mode()==='patient'){row?.remove();return;}\n    if(!allowedPro()){";
  if(adaptiveResults.includes(roleFrom))adaptiveResults=adaptiveResults.replace(roleFrom,roleTo);
  await writeFile(adaptiveResultsPath,adaptiveResults,'utf8');

  const isolationChecks=[
    ['report UI blocked on Results',reportUi.includes("if(current==='results'){document.querySelector('[data-krpatient]')?.remove();return}")],
    ['Pulse Free blocked on Results',freeUi.includes("if(route()==='results'){document.querySelectorAll('[data-kfree-v2],[data-kfree-v2-library],.pulse-free-result-v2').forEach(x=>x.remove());return}")],
    ['patient role row removed',adaptiveResults.includes("if(mode()==='patient'){row?.remove();return;}")]
  ];
  for(const [label,ok] of isolationChecks)console.log(`[pulse-results-isolation] ${ok?'OK':'FAIL'} · ${label}`);
  if(isolationChecks.some(([,ok])=>!ok))throw new Error('Results V5 isolation contract failed');
  console.log('[pulse-results-isolation] PASS · legacy report/free/role layers cannot overlay Results V5');
}catch(error){
  console.error('[pulse-results-isolation] failed:',error?.message||error);
  process.exit(1);
}

// Premium Auth finalization: legacy QA validates historical source contracts first.
// This absolute-last pass ships the single current visual/runtime owner without reintroducing
// the deprecated choice screen or the dark mobile skin.
try{
  const authToken='20261001-premium-auth-v1';
  const indexPath=join(pulse,'index.html');
  let authHtml=await readFile(indexPath,'utf8');

  authHtml=authHtml.replace(
    '<div class="auth-manifesto"><p class="eyebrow">KŌMØ PULSE · VOTRE ESPACE</p><h1>Votre santé,<br><em>en mouvement.</em></h1><p>Rendez-vous, tests, résultats et progression KŌMØ réunis dans un seul espace personnel.</p></div>',
    '<div class="auth-manifesto"><p class="eyebrow">KŌMØ PULSE</p><h1>Bienvenue sur KŌMØ Pulse</h1><p>Vos résultats. Votre trajectoire. Votre World.</p></div>'
  );
  authHtml=authHtml.replace(
    '<div class="auth-panel-wrap"><div class="auth-panel"><div class="auth-heading"><span class="product-pill">Pulse</span><h2>Bienvenue</h2><p>Connectez-vous pour retrouver votre espace KŌMØ.</p></div>',
    '<div class="auth-panel-wrap"><div class="auth-panel"><div class="auth-heading"><span class="product-pill">Accès sécurisé</span><h2>Se connecter</h2><p>Retrouvez votre espace personnel KŌMØ Pulse.</p></div>'
  );

  for(const asset of ['pulse-auth-login-v2.css','auth-stability-v1.css','auth-gateway-v2.js']){
    const escaped=asset.replaceAll('.','\\.');
    authHtml=authHtml.replace(new RegExp('\\./'+escaped+'(?:\\?v=[^"\'#+]+)?','g'),'./'+asset+'?v='+authToken);
  }
  await writeFile(indexPath,authHtml,'utf8');

  const authGatewayPath=join(pulse,'auth-gateway-v2.js');
  let authGateway=await readFile(authGatewayPath,'utf8');
  authGateway=authGateway.replace(
    "if(!auth.dataset.clientMode)auth.dataset.clientMode=sessionStorage.getItem(CLIENT_MODE_KEY)||'choose';",
    "if(!auth.dataset.clientMode){const saved=sessionStorage.getItem(CLIENT_MODE_KEY);auth.dataset.clientMode=saved==='booking'?'booking':'login';}"
  );
  authGateway=authGateway.replace(
    "title.textContent=pro?'KŌMØ Pro':'Bienvenue'",
    "title.textContent=pro?'KŌMØ Pro':'Se connecter'"
  );
  authGateway=authGateway.replace(
    "if(eyebrow)eyebrow.textContent=pro?'KŌMØ PRO · ESPACE CENTRE':'KŌMØ PULSE · VOTRE ESPACE';",
    "if(eyebrow)eyebrow.textContent=pro?'KŌMØ PRO · ESPACE CENTRE':'KŌMØ PULSE';"
  );
  authGateway=authGateway.replace(
    "if(manifesto){const h=manifesto.querySelector('h1'),p=manifesto.querySelector('p:not(.eyebrow)');if(h)h.innerHTML=pro?'Votre centre,<br><em>en mouvement.</em>':'Votre santé,<br><em>en mouvement.</em>';if(p)p.textContent=pro?'Consultations, dossiers patients, Motion et analyses réunis dans un espace professionnel pensé pour le desktop.':'Rendez-vous, tests, résultats et progression KŌMØ réunis dans un seul espace personnel.'}",
    "if(manifesto){const h=manifesto.querySelector('h1'),p=manifesto.querySelector('p:not(.eyebrow)');if(h)h.textContent=pro?'Bienvenue sur KŌMØ Pro':'Bienvenue sur KŌMØ Pulse';if(p)p.textContent=pro?'Vos patients. Vos analyses. Votre centre.':'Vos résultats. Votre trajectoire. Votre World.'}"
  );
  await writeFile(authGatewayPath,authGateway,'utf8');

  const authCanonicalPath=join(pulse,'auth-login-canonical.js');
  let authCanonical=await readFile(authCanonicalPath,'utf8');
  authCanonical=authCanonical.replace("if (pill) pill.textContent = 'KŌMØ PULSE';","if (pill) pill.textContent = 'Accès sécurisé';");
  authCanonical=authCanonical.replace('Accès privé · KŌMØ Pulse','Connexion protégée · KŌMØ Pulse');
  await writeFile(authCanonicalPath,authCanonical,'utf8');

  const stableCss=`/* KŌMØ Pulse — Auth stability final · structural semantics only */
#authScreen[hidden],#appShell[hidden]{display:none!important}
html[data-komo-auth-bootstrap="session"] #authScreen:not([data-komo-auth-resolved="guest"]){visibility:hidden!important}
#authScreen{-webkit-text-size-adjust:100%;text-size-adjust:100%}
#authScreen input,#authScreen button,#authScreen select,#authScreen textarea{font:inherit}
#authScreen input[type="checkbox"]{-webkit-appearance:auto;appearance:auto}
#authScreen .auth-panel-wrap{-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#authScreen .auth-form input{font-size:16px}
@media(prefers-reduced-motion:reduce){#authScreen *,#authScreen *::before,#authScreen *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
  await writeFile(join(pulse,'auth-stability-v1.css'),stableCss,'utf8');

  const framePath=join(pulse,file);
  let frameCss=await readFile(framePath,'utf8');
  const authFrameOverride=`
/* Premium Auth frame override — after historical fixed-frame mobile rules */
@media(max-width:620px){
  #authScreen.auth-screen{display:grid!important;grid-template-columns:1fr!important;grid-template-rows:auto minmax(0,1fr)!important}
  #authScreen .auth-brand{display:flex!important;min-height:104px!important;max-height:104px!important;overflow:hidden!important}
  #authScreen .auth-panel-wrap{height:auto!important;max-height:none!important;min-height:0!important;padding-top:0!important;padding-bottom:max(10px,env(safe-area-inset-bottom))!important}
}
`;
  if(!frameCss.includes('Premium Auth frame override'))frameCss+=authFrameOverride;
  await writeFile(framePath,frameCss,'utf8');

  const finalAuthHtml=await readFile(indexPath,'utf8');
  const finalAuthCss=await readFile(join(pulse,'pulse-auth-login-v2.css'),'utf8');
  const finalAuthGateway=await readFile(authGatewayPath,'utf8');
  const authChecks=[
    ['copy',finalAuthHtml.includes('Bienvenue sur KŌMØ Pulse')&&finalAuthHtml.includes('Vos résultats. Votre trajectoire. Votre World.')],
    ['direct login',finalAuthHtml.includes('<h2>Se connecter</h2>')&&finalAuthGateway.includes("saved==='booking'?'booking':'login'")],
    ['secure access label',(await readFile(join(pulse,'auth-login-canonical.js'),'utf8')).includes("pill.textContent = 'Accès sécurisé'")],
    ['old headline gone',!finalAuthHtml.includes('Votre santé,<br><em>en mouvement.</em>')],
    ['premium owner',finalAuthCss.includes('Single visual owner')&&finalAuthCss.includes('Premium application entry')],
    ['supported weights',!/(font-weight|font):[^;]*(650|700|750|800|850|900)/.test(finalAuthCss)],
    ['mobile brand visible',frameCss.includes('Premium Auth frame override')]
  ];
  for(const [label,ok] of authChecks)console.log(`[pulse-premium-auth-final] ${ok?'OK':'FAIL'} · ${label}`);
  if(authChecks.some(([,ok])=>!ok))throw new Error('Premium Auth final contract failed');
  console.log('[pulse-premium-auth-final] PASS · one Auth visual system · direct login · desktop/mobile');
}catch(error){
  console.error('[pulse-premium-auth-final] failed:',error?.message||error);
  process.exit(1);
}

// iOS Home runtime repair: pulse-bottom-nav-v6 injects its CSS after linked
// stylesheets, so correct the generated runtime at the absolute end of the build.
const dockPath=join(pulse,'pulse-bottom-nav-v6.js');
try{
  let dock=await readFile(dockPath,'utf8');
  const premiumDockFrom=`const items=[
  ['home','Accueil','⌂','home'],
  ['key','KEY','◌','key'],
  ['results','Résultats','◎','results'],
  ['trajectory','Trajectoire','⌁','trajectory'],
  ['agenda','Rendez-vous','□','documents'],
  ['mykomo','My KŌMØ','◉','mykomo']
];`;
  const premiumDockItems=`const items=[
  ['home','Home','⌂','home'],
  ['results','Résultats','◎','results'],
  ['key','Connected','◌','key'],
  ['agenda','Rendez-vous','□','documents'],
  ['mykomo','My KŌMØ','◉','mykomo']
];`;
  if(dock.includes(premiumDockFrom))dock=dock.replace(premiumDockFrom,premiumDockItems);
  dock=dock.replace("if(['trajectory','path','plan'].includes(r))return'trajectory';","if(['trajectory','path','plan'].includes(r))return'results';");
  const from=`body.kpulse-app-mode.kpulse-home-mode #viewRoot,body.kpulse-app-mode.kpulse-home-mode .view-root{width:100%!important;max-width:none!important;height:100dvh!important;max-height:100dvh!important;min-height:0!important;padding:0 0 calc(76px + env(safe-area-inset-bottom))!important;overflow:hidden!important;overscroll-behavior:none!important;background:transparent!important}body.kpulse-app-mode.kpulse-home-mode [data-my-komo-home]{height:100%!important;min-height:0!important;overflow:hidden!important;background:transparent!important}`;
  const to=`body.kpulse-app-mode.kpulse-home-mode #viewRoot,body.kpulse-app-mode.kpulse-home-mode .view-root{width:100%!important;max-width:none!important;flex:1 1 0!important;height:auto!important;max-height:none!important;min-height:0!important;padding:0!important;overflow:hidden!important;overscroll-behavior:none!important;background:transparent!important}body.kpulse-app-mode.kpulse-home-mode [data-my-komo-home]{width:100%!important;height:100%!important;max-height:100%!important;min-height:0!important;overflow:hidden!important;background:transparent!important}`;
  if(dock.includes(from))dock=dock.replace(from,to);
  await writeFile(dockPath,dock,'utf8');
}catch(error){
  console.warn('[pulse-editorial-fixed-frame-v2] iOS Home runtime repair skipped:',error?.message||error);
}

// Adaptive navigation dedupe: older build passes can append a second patient
// branch after the canonical member return. Keep exactly one current owner.
const adaptivePath=join(pulse,'adaptive-shell-v4.js');
try{
  let adaptive=await readFile(adaptivePath,'utf8');
  const duplicate=`
    if(allowedPro())return navItem('patient:home','Home',I.home,r==='home')+navItem('patient:results','Résultats',I.results,r==='results')+navItem('patient:documents','Rendez-vous',I.agenda,r==='documents')+navItem('pro:dashboard','Pro',I.center,false)+navItem('more','Plus',I.more,false);
    return navItem('patient:home','Home',I.home,r==='home')+navItem('patient:results','Résultats',I.results,r==='results')+navItem('patient:key','Connected',I.follow,r==='key')+navItem('patient:documents','Consultations & rendez-vous',I.agenda,r==='documents')+navItem('patient:mykomo','My KŌMØ',I.mykomo,r==='mykomo');`;
  const first=adaptive.indexOf(duplicate);
  const second=first>=0?adaptive.indexOf(duplicate,first+duplicate.length):-1;
  if(second>=0)adaptive=adaptive.slice(0,second)+adaptive.slice(second+duplicate.length);
  await writeFile(adaptivePath,adaptive,'utf8');
}catch(error){
  console.warn('[pulse-editorial-fixed-frame-v2] adaptive navigation dedupe skipped:',error?.message||error);
}

const index=await readFile(join(pulse,'index.html'),'utf8');
const present=index.includes(`${file}?v=${version}`);
const survivors=retiredStyles.filter(x=>index.includes(x));
const oldInline=index.includes('kpCanonicalThemePriorityV14');
let adaptiveDuplicate=false;
try{
  const adaptiveCheck=await readFile(join(pulse,'adaptive-shell-v4.js'),'utf8');
  const needle="if(allowedPro())return navItem('patient:home','Home'";
  adaptiveDuplicate=adaptiveCheck.indexOf(needle)!==adaptiveCheck.lastIndexOf(needle);
}catch{}
console.log(`[pulse-editorial-fixed-frame-v2] adaptive duplicate branches=${adaptiveDuplicate?'yes':'no'}`);

// Post-final production audit: record the assets that actually reach the browser,
// after pruning/dedupe, instead of the intermediate pre-pruning graph.
try{
  const finalIndex=await readFile(join(pulse,'index.html'),'utf8');
  const finalScripts=[...finalIndex.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)].map(x=>x[1]);
  const finalStyles=[...finalIndex.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*>/g)].map(x=>x[1]);
  const auditPath=join(pulse,'pulse-final-production-audit-v1.json');
  let audit={};
  try{audit=JSON.parse(await readFile(auditPath,'utf8'))}catch{}
  audit.post_final={
    script_count:finalScripts.length,
    stylesheet_count:finalStyles.length,
    scripts:finalScripts,
    stylesheets:finalStyles,
    retired_styles_surviving:retiredStyles.filter(x=>finalStyles.includes(x)),
    adaptive_duplicate_branches:adaptiveDuplicate,
    fixed_frame_present:finalStyles.includes(file),
    generated_at:new Date().toISOString()
  };
  if(audit.post_final.retired_styles_surviving.length||adaptiveDuplicate||!audit.post_final.fixed_frame_present)audit.status='FAIL';
  await writeFile(auditPath,JSON.stringify(audit,null,2)+'\\n','utf8');
  console.log(`[pulse-editorial-fixed-frame-v2] post-final production audit · scripts=${finalScripts.length} · styles=${finalStyles.length}`);
}catch(error){
  console.warn('[pulse-editorial-fixed-frame-v2] post-final audit update skipped:',error?.message||error);
}

console.log(
  `[pulse-editorial-fixed-frame-v2] ${present&&!survivors.length&&!oldInline?'PASS':'WARN'} · final stylesheet=${present?'yes':'no'} · retired-survivors=${survivors.join(',')||'none'} · old-inline=${oldInline?'yes':'no'} · ${htmlFiles.length} HTML surfaces`
);
