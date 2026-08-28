import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const release='20260828-canonical-4p4';
const [html,css,app,adaptive,mobile,guided,design,patientMotion,booking,performanceRuntime,middleware]=await Promise.all([
  readFile(join(pulse,'index.html'),'utf8'),
  readFile(join(pulse,'pulse-ui-v1.css'),'utf8'),
  readFile(join(pulse,'app.js'),'utf8'),
  readFile(join(pulse,'adaptive-shell-v4.js'),'utf8'),
  readFile(join(pulse,'mobile-v1.js'),'utf8'),
  readFile(join(pulse,'mobile-guided-v2.js'),'utf8'),
  readFile(join(pulse,'pulse-final-design-v1.js'),'utf8'),
  readFile(join(pulse,'patient-motion-booking-v2.js'),'utf8'),
  readFile(join(pulse,'booking-layer-v1.js'),'utf8'),
  readFile(join(pulse,'performance-runtime-v1.js'),'utf8'),
  readFile(join(process.cwd(),'middleware.js'),'utf8')
]);

const localAssets=[...html.matchAll(/(?:src|href)="\.\/([^"?#]+\.(?:js|css))(\?v=([^"#]+))?"/g)];
const assetVersions=localAssets.map(x=>x[3]||'');
const adaptiveCount=(html.match(/adaptive-shell-v4\.js/g)||[]).length;
const corePreloads=(html.match(/data-komo-core-preload/g)||[]).length;

const checks=[
  ['canonical release marker',html.includes(`<meta name="komo-pulse-release" content="${release}"`)],
  ['all local JS/CSS share one release',localAssets.length>20&&assetVersions.every(v=>v===release)],
  ['adaptive shell is the only phone/iPad shell runtime',adaptiveCount===1&&!html.includes('mobile-menu-v3.js')&&!html.includes('tablet-patient-v1.js')],
  ['retired shell CSS removed from bundle',!css.includes('/* FILE: mobile-menu-v3.css */')&&!css.includes('/* FILE: tablet-patient-v1.css */')],
  ['desktop shell remains available',css.includes('/* FILE: bottom-dock-v1.css */')],
  ['adaptive shell CSS remains available',css.includes('/* FILE: adaptive-shell-v4.css */')],
  ['adaptive shell keeps frozen patient labels',adaptive.includes("'Accueil'")&&adaptive.includes("'Tests'")&&adaptive.includes("'Résultats'")&&adaptive.includes("'Suivi'")],
  ['legacy mobile navigation is hidden before JS ownership',css.includes('#mobileNav,#proMobileNav,.sidebar{display:none!important}')&&css.includes('.topbar .mode-switch{display:none!important}')],
  ['mobile utility no longer mutates account navigation',!mobile.includes('ensureExplorerInAccount')&&!mobile.includes('observe(document.body')],
  ['guided mobile layer is content-only',!guided.includes('ensureAccountTrigger')&&!guided.includes('ensureAccountHub')&&!guided.includes('mg-mobile-menu')&&!guided.includes('observe(document.body')],
  ['guided mobile layer no longer owns home',!guided.includes('enhanceHome')&&guided.includes('enhanceTests')],
  ['final design avoids body-wide observer',!design.includes('observe(document.body')&&design.includes("observe(root,{childList:true,subtree:true})")],
  ['session sync is event driven in final design',design.includes('if(sync)await window.KomoRuntime?.syncSession?.()')],
  ['home is quiet-mounted by core router',app.includes("['home','path','documents','plan','messages','clinical'].includes(route)")&&app.includes("home:'[data-my-komo-home]'" )],
  ['My KŌMØ is sole shipped home owner',!html.includes('home-clarity-v1.js')&&!html.includes('home-summary-v1.js')&&html.includes('my-komo-home-v1.js')],
  ['legacy home summary CSS retired',!css.includes('/* FILE: home-summary-v1.css */')],
  ['legacy Motion booking no longer renders RDV',!patientMotion.includes('root.innerHTML')&&!patientMotion.includes('data-kmb2')&&!patientMotion.includes('loadSlots')&&!patientMotion.includes('createClient')],
  ['legacy Motion booking only routes to canonical RDV',patientMotion.includes("location.hash='documents'")&&!patientMotion.includes('refreshPatient')&&!patientMotion.includes('loadPatient')],
  ['legacy Motion booking has no body-wide observer',!patientMotion.includes('observe(document.body')],
  ['booking-layer remains canonical RDV owner',booking.includes('data-kbook-patient')&&booking.includes("location.hash.replace(/^#/,'')!=='documents'")],
  ['external RDV refresh is session-aware',booking.includes('refreshPatient:refresh')&&!booking.includes('refreshPatient:loadPatient')],
  ['core startup assets are preloaded once',corePreloads===3&&html.includes(`rel="preload" href="./runtime.js?v=${release}"`)&&html.includes(`rel="modulepreload" href="./app.js?v=${release}"`)&&html.includes(`rel="modulepreload" href="./performance-runtime-v1.js?v=${release}"`)],
  ['route navigation does not reread auth session',performanceRuntime.includes("window.addEventListener('hashchange',()=>requestAnimationFrame(routeReady))")&&!performanceRuntime.includes("window.addEventListener('hashchange',()=>{refreshSession()")],
  ['session refresh burst is throttled',performanceRuntime.includes('SESSION_SYNC_TTL=2000')&&performanceRuntime.includes('now-lastSyncAt<SESSION_SYNC_TTL')],
  ['versioned assets are immutable',middleware.includes("max-age=31536000, immutable")&&middleware.includes("incomingUrl.searchParams.has('v')")],
  ['HTML remains private no-store',middleware.includes("Cache-Control', 'private, no-store, max-age=0")],
  ['My KŌMØ remains canonical home presentation',design.includes('kamo-home-result-removed')],
  ['score pathway polish shipped',css.includes('/* Score pathway polish · canonical-4p3 */')],
  ['canonical ownership note emitted',css.includes('/* Canonical Pulse shell ownership */')&&css.includes('Home: My KŌMØ')&&css.includes('RDV: booking-layer-v1')]
];

let failed=0;
for(const [label,ok] of checks){console.log(`[pulse-production-consolidation-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)process.exit(1);
console.log(`[pulse-production-consolidation-qa] ${checks.length} checks passed · ${localAssets.length} local asset references locked to ${release}.`);

// Final public-site pass: the product homepage is rebuilt only after Pulse production ownership is validated.
await import('./homepage-whoop-product-v2.mjs');
