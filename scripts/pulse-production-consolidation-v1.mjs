import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

await import('./pulse-score-flow-polish-v1.mjs');
await import('./pulse-score-flow-finalize-v1.mjs');
await import('./pulse-patient-platform-v1.mjs');
await import('./pulse-patient-platform-qa-v1.mjs');

const pulse=join(process.cwd(),'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const cssPath=join(pulse,'pulse-ui-v1.css');
const appPath=join(pulse,'app.js');
const bookingPath=join(pulse,'booking-layer-v1.js');
const release='20260828-canonical-4p6';

let html=await readFile(htmlPath,'utf8');
let css=await readFile(cssPath,'utf8');
let app=await readFile(appPath,'utf8');
let booking=await readFile(bookingPath,'utf8');

// Canonical runtime ownership:
// - desktop shell: core sidebar/topbar + bottom-dock/frozen-navigation CSS
// - phone/iPad shell: adaptive-shell-v4 only
// - home: patient-home-command-v1 through the canonical app host
// - patient Tests: tests-v1 + patient-assessment-trio-v1
// - Trajectory: progression-v2 / data-ktrajectory-v1
// - KŌMØ Therapy: patient-v4 route owner, replaced by therapy page
// - Agenda et réseau (#documents): booking-layer-v1 only
// - patient-motion-booking-v2: CTA bridge only, never renderer/data loader
// - mobile-guided-v2: test-content guidance only, never navigation/home
// - experience-v3: retired legacy multi-route renderer
// - adaptive-plus-v1: retired duplicate menu renderer; adaptive-shell-v4 owns Plus
for(const file of ['mobile-menu-v3.js','tablet-patient-v1.js','home-clarity-v1.js','home-summary-v1.js','experience-v3.js','adaptive-plus-v1.js']){
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

// Quiet-mount only routes whose dedicated renderer mounts asynchronously.
// Home is intentionally excluded: the core router must paint the canonical
// data-my-komo-home host immediately, then patient-home-command-v1 takes over.
const quietWithHome="['home','path','documents','plan','messages','clinical'].includes(route)";
const quietCanonical="['path','documents','plan','messages','clinical'].includes(route)";
if(app.includes(quietWithHome))app=app.replace(quietWithHome,quietCanonical);
if(!app.includes(quietCanonical))throw new Error('[pulse-production-consolidation] dedicated route list changed');
if(app.includes("const labels={home:['MY KŌMØ','Votre espace personnel.'],path:"))app=app.replace("const labels={home:['MY KŌMØ','Votre espace personnel.'],path:",'const labels={path:');
if(app.includes("const selectors={home:'[data-my-komo-home]',path:'[data-ktrajectory-v1]'"))app=app.replace("const selectors={home:'[data-my-komo-home]',path:'[data-ktrajectory-v1]'","const selectors={path:'[data-ktrajectory-v1]'");
if(!app.includes('data-home-owner="patient-home-command-v1"'))throw new Error('[pulse-production-consolidation] canonical Home host missing');
await writeFile(appPath,app);

// External callers may request an Agenda refresh, but must always go through the
// session-aware/deduplicated refresh() entry point rather than raw loadPatient().
booking=booking.replace('window.KomoBooking={openProPlanning:openPro,deactivatePro,refreshPatient:loadPatient};','window.KomoBooking={openProPlanning:openPro,deactivatePro,refreshPatient:refresh};');
if(!booking.includes('refreshPatient:refresh'))throw new Error('[pulse-production-consolidation] safe Agenda refresh contract missing');
await writeFile(bookingPath,booking);

const ownership=`
/* Canonical Pulse shell ownership */
/* Desktop: core + bottom dock. Phone/iPad: adaptive-shell-v4. Home: patient-home-command-v1. Agenda et réseau: booking-layer-v1. */
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

console.log(`[pulse-production-consolidation] canonical patient platform locked · release ${release} · core startup preloaded`);
