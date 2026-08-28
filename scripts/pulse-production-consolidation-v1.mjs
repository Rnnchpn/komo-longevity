import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

await import('./pulse-score-flow-polish-v1.mjs');
await import('./pulse-score-flow-finalize-v1.mjs');

const pulse=join(process.cwd(),'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const cssPath=join(pulse,'pulse-ui-v1.css');
const appPath=join(pulse,'app.js');
const bookingPath=join(pulse,'booking-layer-v1.js');
const release='20260828-canonical-4p4';

let html=await readFile(htmlPath,'utf8');
let css=await readFile(cssPath,'utf8');
let app=await readFile(appPath,'utf8');
let booking=await readFile(bookingPath,'utf8');

// Canonical runtime ownership:
// - desktop shell: core sidebar/topbar + bottom-dock/frozen-navigation CSS
// - phone/iPad shell: adaptive-shell-v4 only
// - home: My KŌMØ only
// - RDV patient (#documents): booking-layer-v1 only
// - patient-motion-booking-v2: CTA bridge only, never renderer/data loader
// - mobile-guided-v2: test-content guidance only, never navigation/home
for(const file of ['mobile-menu-v3.js','tablet-patient-v1.js','home-clarity-v1.js','home-summary-v1.js']){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${escaped}(?:\\?v=[^\"']+)?"><\\/script>`,'g'),'');
}

function stripBundledFile(source,file){
  const marker=`/* FILE: ${file} */`;
  const start=source.indexOf(marker);
  if(start<0)return source;
  const next=source.indexOf('/* FILE:',start+marker.length);
  const end=next>=0?next:source.indexOf('/* Navigation responsiveness */',start+marker.length);
  return source.slice(0,start)+source.slice(end>=0?end:source.length);
}
for(const file of ['mobile-menu-v3.css','tablet-patient-v1.css','home-summary-v1.css'])css=stripBundledFile(css,file);

// Quiet-mount canonical Home/RDV/Progression/Clinical owners.
if(!app.includes("['home','path','documents','plan','messages','clinical'].includes(route)")){
  const oldRoutes="['path','documents','plan','messages','clinical'].includes(route)";
  if(!app.includes(oldRoutes))throw new Error('[pulse-production-consolidation] dedicated route list changed');
  app=app.replace(oldRoutes,"['home','path','documents','plan','messages','clinical'].includes(route)");
}
if(!app.includes("const labels={home:['MY KŌMØ','Votre espace personnel.'],path:")){
  const oldLabels='const labels={path:';
  if(!app.includes(oldLabels))throw new Error('[pulse-production-consolidation] route labels contract changed');
  app=app.replace(oldLabels,"const labels={home:['MY KŌMØ','Votre espace personnel.'],path:");
}
if(!app.includes("const selectors={home:'[data-my-komo-home]',path:'[data-kpv2]'")){
  const oldSelectors="const selectors={path:'[data-kpv2]'";
  if(!app.includes(oldSelectors))throw new Error('[pulse-production-consolidation] route selectors contract changed');
  app=app.replace(oldSelectors,"const selectors={home:'[data-my-komo-home]',path:'[data-kpv2]'");
}
await writeFile(appPath,app);

// External callers may request an RDV refresh, but must always go through the
// session-aware/deduplicated refresh() entry point rather than raw loadPatient().
booking=booking.replace('window.KomoBooking={openProPlanning:openPro,deactivatePro,refreshPatient:loadPatient};','window.KomoBooking={openProPlanning:openPro,deactivatePro,refreshPatient:refresh};');
if(!booking.includes('refreshPatient:refresh'))throw new Error('[pulse-production-consolidation] safe RDV refresh contract missing');
await writeFile(bookingPath,booking);

const ownership=`
/* Canonical Pulse shell ownership */
/* Desktop: core + bottom dock. Phone/iPad: adaptive-shell-v4. Home: My KŌMØ. RDV: booking-layer-v1. */
@media(max-width:767px){
  #mobileNav,#proMobileNav,.sidebar{display:none!important}
  .topbar .mode-switch{display:none!important}
}
@media(min-width:768px) and (max-width:1366px) and (hover:none) and (pointer:coarse){
  #mobileNav,#proMobileNav,.sidebar{display:none!important}
  .topbar .mode-switch{display:none!important}
}
`;
css=css.replace(/\n\/\* Canonical Pulse shell ownership \*\/[\s\S]*$/,'');
css+=ownership;
await writeFile(cssPath,css);

// One coherent release token keeps every local asset cache-safe. The three startup
// files are discovered from <head> so authentication and the first route can begin
// while the rest of the document is still being parsed. No feature module is made eager.
html=html.replace(/(src|href)="\.\/([^"?#]+\.(?:js|css))(?:\?v=[^"#]+)?"/g,(_,attr,file)=>`${attr}="./${file}?v=${release}"`);
html=html.replace(/\s*<link[^>]+data-komo-core-preload[^>]*>/g,'');
html=html.replace(/\s*<meta name="komo-pulse-release"[^>]*>/g,'');
const preloads=`  <link rel="preload" href="./runtime.js?v=${release}" as="script" fetchpriority="high" data-komo-core-preload />\n  <link rel="modulepreload" href="./app.js?v=${release}" fetchpriority="high" data-komo-core-preload />\n  <link rel="modulepreload" href="./performance-runtime-v1.js?v=${release}" fetchpriority="high" data-komo-core-preload />\n`;
html=html.replace('</head>',`${preloads}  <meta name="komo-pulse-release" content="${release}" />\n</head>`);
await writeFile(htmlPath,html);

console.log(`[pulse-production-consolidation] canonical shell + home + RDV locked · release ${release} · core startup preloaded`);
