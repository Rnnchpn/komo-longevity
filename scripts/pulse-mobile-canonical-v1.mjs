import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd();
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-mobile-canonical-4';

await copyFile(join(root,'pulse-app','mobile-canonical-v1.css'),join(pulse,'mobile-canonical-v1.css'));
await copyFile(join(root,'pulse-app','mobile-canonical-v1.js'),join(pulse,'mobile-canonical-v1.js'));

async function patch(path,from,to,label,{optional=false}={}){
  let src=await readFile(path,'utf8');
  if(src.includes(to))return;
  if(!src.includes(from)){
    if(optional){console.warn(`[pulse-mobile-canonical] optional ${label} not found`);return}
    throw new Error(`[pulse-mobile-canonical] missing ${label}`);
  }
  src=src.replace(from,to);
  await writeFile(path,src,'utf8');
}

await patch(join(pulse,'adaptive-shell-v4.js'),
  "function adaptive(){return window.matchMedia(PHONE).matches||window.matchMedia(TABLET).matches||(isIPad()&&innerWidth>=768&&innerWidth<=1366)}",
  "function adaptive(){return window.matchMedia(TABLET).matches||(isIPad()&&innerWidth>=768&&innerWidth<=1366)}",
  'adaptive tablet-only guard');
await patch(join(pulse,'adaptive-shell-v4.js'),
  "html.dataset.adaptiveShell=window.matchMedia(PHONE).matches?'phone':'tablet';",
  "html.dataset.adaptiveShell='tablet';",
  'adaptive tablet dataset');

const phoneRoute="window.matchMedia('(max-width: 767px)').matches?'__kcm__':";
const routePatches=[
  ['my-komo-home-v1.js',"function route(){return location.hash.replace(/^#/,'')||'home'}",`function route(){return ${phoneRoute}(location.hash.replace(/^#/,'')||'home')}`],
  ['patient-home-visual-v2.js',"function route(){return location.hash.replace(/^#/,'')||'home'}",`function route(){return ${phoneRoute}(location.hash.replace(/^#/,'')||'home')}`],
  ['patient-home-datawall-v3.js',"const route=()=>location.hash.replace(/^#/,'')||'home';",`const route=()=>${phoneRoute}(location.hash.replace(/^#/,'')||'home');`],
  ['my-komo-dashboard-v2.js',"const route=()=>location.hash.replace(/^#/,'')||'home';",`const route=()=>${phoneRoute}(location.hash.replace(/^#/,'')||'home')}`],
  ['my-komo-key-home-v1.js',"const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';",`const route=()=>window.matchMedia('(max-width: 767px)').matches?'__kcm__':(window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home');`]
];
for(const [file,from,to] of routePatches){await patch(join(pulse,file),from,to,`${file} phone home guard`,{optional:true})}

await patch(join(pulse,'my-komo-score-motion-v1.js'),
  '  function mount(){\n    bindObserver();',
  "  function mount(){\n    if(window.matchMedia('(max-width: 767px)').matches)return;\n    bindObserver();",
  'score observer phone guard',{optional:true});

// The legacy app router used to paint the historical desktop Home before the
// canonical phone runtime could replace it. On phones it now yields Home
// immediately to mobile-canonical-v1, eliminating the old-screen flash/stale UI.
const routerPath=join(pulse,'app-router-v2.js');
let router=await readFile(routerPath,'utf8');
const routerAnchor='function renderRoute(route){renderNavigation();';
const phoneHomeGuard="function renderRoute(route){renderNavigation();if(window.matchMedia('(max-width: 767px)').matches&&route==='home'){window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:'home',source:'mobile-canonical-owner'}}));return;}";
if(!router.includes("source:'mobile-canonical-owner'")){
  if(!router.includes(routerAnchor)) throw new Error('[pulse-mobile-canonical] app router renderRoute anchor missing');
  router=router.replace(routerAnchor,phoneHomeGuard);
  await writeFile(routerPath,router,'utf8');
}

let html=await readFile(htmlPath,'utf8');
const stripPatterns=[
  /\s*<link rel="stylesheet" href="\.\/mobile-vertical-app-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,
  /\s*<link rel="stylesheet" href="\.\/mobile-performance-final-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,
  /\s*<script src="\.\/mobile-guided-v2\.js(?:\?v=[^"]+)?"><\/script>/g,
  /\s*<script src="\.\/mobile-vertical-app-v1\.js(?:\?v=[^"]+)?"><\/script>/g,
  /\s*<link rel="stylesheet" href="\.\/mobile-canonical-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,
  /\s*<script type="module" src="\.\/mobile-canonical-v1\.js(?:\?v=[^"]+)?"><\/script>/g
];
for(const re of stripPatterns)html=html.replace(re,'');
html=html.replace(/<meta name="komo-pulse-release" content="[^"]*"\s*\/?>/,`<meta name="komo-pulse-release" content="${release}" />`);
html=html.replace('</head>',`  <link rel="stylesheet" href="./mobile-canonical-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./mobile-canonical-v1.js?v=${release}"></script>\n</body>`);
html=html.replace(/\.\/adaptive-shell-v4\.js(?:\?v=[^"']+)?/g,`./adaptive-shell-v4.js?v=${release}`);
html=html.replace(/\.\/patient-navigation-core-v1\.js(?:\?v=[^"']+)?/g,`./patient-navigation-core-v1.js?v=${release}`);
html=html.replace(/\.\/app-router-v2\.js(?:\?v=[^"']+)?/g,`./app-router-v2.js?v=${release}`);
await writeFile(htmlPath,html,'utf8');

console.log('[pulse-mobile-canonical-v1] canonical phone owner shipped without legacy Home renderer: account + KŌMØ KEY + experience + KŌMØ Link');