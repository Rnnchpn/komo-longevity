import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const cssPath=join(pulse,'pulse-ui-v1.css');
const appPath=join(pulse,'app.js');
const release='20260827-canonical-2';

let html=await readFile(htmlPath,'utf8');
let css=await readFile(cssPath,'utf8');
let app=await readFile(appPath,'utf8');

// Canonical runtime ownership:
// - desktop shell: core sidebar/topbar + bottom-dock/frozen-navigation CSS
// - phone/iPad shell: adaptive-shell-v4 only
// - home: My KŌMØ only
// - mobile-guided-v2: test-content guidance only, never navigation/home
// These superseded shell/home runtimes are intentionally not shipped in production.
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

// Do not paint the legacy Home before My KŌMØ mounts. The final router reserves
// the route just like RDV/Progression/Clinical and leaves one visible owner.
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

// Pre-JS paint guard. Core mobile/tablet navigation never becomes visible for a
// frame before adaptive-shell-v4 attaches. Desktop remains untouched.
const ownership=`
/* Canonical Pulse shell ownership */
/* Desktop: core + bottom dock. Phone/iPad: adaptive-shell-v4. Home: My KŌMØ. */
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

// Force one coherent release across every local JS/CSS asset so mobile and desktop
// cannot keep a mixed cached generation after a deployment.
html=html.replace(/(src|href)="\.\/([^"?#]+\.(?:js|css))(?:\?v=[^"#]+)?"/g,(_,attr,file)=>`${attr}="./${file}?v=${release}"`);
html=html.replace(/\s*<meta name="komo-pulse-release"[^>]*>/g,'');
html=html.replace('</head>',`  <meta name="komo-pulse-release" content="${release}" />\n</head>`);
await writeFile(htmlPath,html);

console.log(`[pulse-production-consolidation] canonical shell + home locked · release ${release}`);
