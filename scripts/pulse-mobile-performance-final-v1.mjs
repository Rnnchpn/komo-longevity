import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd();
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-mobile-perf-final-1';

await copyFile(join(root,'pulse-app','mobile-performance-final-v1.css'),join(pulse,'mobile-performance-final-v1.css'));

async function patchFile(file,patches){
  const path=join(pulse,file);
  let src=await readFile(path,'utf8');
  for(const [from,to,label] of patches){
    if(src.includes(to))continue;
    if(!src.includes(from))throw new Error(`[pulse-mobile-performance] ${file}: missing ${label}`);
    src=src.replace(from,to);
  }
  await writeFile(path,src,'utf8');
}

// The desktop patient dock must not even mount on phones: the vertical shell is the sole phone navigator.
await patchFile('pulse-bottom-nav-v6.js',[
  ["const V='6.1.0';","const V='6.2.0';",'dock version'],
  ["const nav=()=>window.KomoPatientNavigation;","const phone=()=>window.matchMedia('(max-width: 767px)').matches;\nconst nav=()=>window.KomoPatientNavigation;",'phone guard'],
  ["const visible=()=>{const a=document.querySelector('#appShell'),x=document.querySelector('#authScreen');return !!a&&!a.hidden&&(!x||x.hidden)&&!['clinical','admin'].includes(route())};","const visible=()=>{if(phone())return false;const a=document.querySelector('#appShell'),x=document.querySelector('#authScreen');return !!a&&!a.hidden&&(!x||x.hidden)&&!['clinical','admin'].includes(route())};",'phone visibility'],
  ["function ensureDock(){const app=document.querySelector('#appShell');if(!app)return null;","function ensureDock(){if(phone())return null;const app=document.querySelector('#appShell');if(!app)return null;",'dock mount guard'],
  ["function refresh(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{css();const d=ensureDock();if(!d)return;","function refresh(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{if(phone()){document.querySelector('#kpDockV6')?.remove();document.querySelector('#kpPickerV6')?.remove();document.querySelector('#kpPickerV6Bg')?.remove();return}css();const d=ensureDock();if(!d)return;",'dock refresh guard']
]);

// Adaptive shell previously observed every class mutation in the whole application, a major Safari repaint trigger.
await patchFile('adaptive-shell-v4.js',[
  ["  const observer=new MutationObserver(()=>refresh());\n  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});","  const observer=new MutationObserver(()=>refresh());\n  const observedShell=document.querySelector('#appShell');\n  if(observedShell)observer.observe(observedShell,{attributes:true,attributeFilter:['hidden']});\n  document.addEventListener('click',()=>setTimeout(refresh,0),{passive:true});",'global mutation observer']
]);

// On phones, retain tactile feedback but skip replay-heavy entrance/count-up animation loops and body-wide observers.
await patchFile('pulse-home-hero-polish-v2.js',[
  ["const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;","const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||window.matchMedia?.('(max-width: 767px)')?.matches;",'hero mobile reduced mode'],
  ["  new MutationObserver(()=>schedule(false)).observe(document.body,{childList:true,subtree:true});","  if(!window.matchMedia('(max-width: 767px)').matches)new MutationObserver(()=>schedule(false)).observe(document.body,{childList:true,subtree:true});",'hero body observer']
]);

await patchFile('patient-home-micro-motion-v1.js',[
  ["const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;","const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||window.matchMedia?.('(max-width: 767px)')?.matches;",'home motion mobile reduced mode'],
  ["  new MutationObserver(()=>{if((location.hash.replace(/^#/,'')||'home')==='home')schedule()}).observe(document.body,{childList:true,subtree:true});","  if(!window.matchMedia('(max-width: 767px)').matches)new MutationObserver(()=>{if((location.hash.replace(/^#/,'')||'home')==='home')schedule()}).observe(document.body,{childList:true,subtree:true});",'home motion body observer']
]);

await patchFile('my-komo-score-motion-v1.js',[
  ["const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;","const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||window.matchMedia?.('(max-width: 767px)').matches;",'score ring mobile reduced mode'],
  ["  new MutationObserver(()=>{if(document.querySelector('.mykomo-home .mykomo-ring:not([data-komo-animated=\"1\"] )'))schedule()}).observe(document.body,{childList:true,subtree:true});","  if(!window.matchMedia('(max-width: 767px)').matches)new MutationObserver(()=>{if(document.querySelector('.mykomo-home .mykomo-ring:not([data-komo-animated=\"1\"] )'))schedule()}).observe(document.body,{childList:true,subtree:true});",'score body observer optional']
]);

// The lobby should share the canonical Supabase client and avoid several full hydrations during the same startup burst.
await patchFile('my-komo-lobby-v3.js',[
  ["let client=null,hydrating=false,retry=0;","let client=null,hydrating=false,retry=0,lastHydrate=0;",'lobby hydration timestamp'],
  ["const sb=()=>client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));","const sb=()=>window.KomoRuntime?.client||client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));",'shared runtime client'],
  ["async function hydrate(force=false){if(route()!=='mykomo'||hydrating)return;hydrating=true;","async function hydrate(force=false){if(route()!=='mykomo'||hydrating||Date.now()-lastHydrate<1400)return;hydrating=true;lastHydrate=Date.now();",'lobby hydration debounce'],
  ["document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>mount(true),50));","document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>mount(true),140));",'lobby startup timing'],
  ["setTimeout(()=>mount(true),300);","setTimeout(()=>mount(false),1200);",'lobby duplicate startup load']
]);

// Some generated versions already contain the phone-aware score runtime. If the exact legacy observer signature differs,
// disable its remaining interval separately without making the build fragile.
{
  const p=join(pulse,'my-komo-score-motion-v1.js');
  let src=await readFile(p,'utf8');
  src=src.replace("setInterval(()=>{if((location.hash.replace(/^#/,'')||'home')==='home')guardVisible()},3500);","if(!window.matchMedia('(max-width: 767px)').matches)setInterval(()=>{if((location.hash.replace(/^#/,'')||'home')==='home')guardVisible()},3500);");
  src=src.replace("new MutationObserver(()=>{if(document.querySelector('.mykomo-home .mykomo-ring:not([data-komo-animated=\"1\"] )'))schedule()}).observe(document.body,{childList:true,subtree:true});","if(!window.matchMedia('(max-width: 767px)').matches)new MutationObserver(()=>{if(document.querySelector('.mykomo-home .mykomo-ring:not([data-komo-animated=\"1\"] )'))schedule()}).observe(document.body,{childList:true,subtree:true});");
  src=src.replace("new MutationObserver(()=>{if(document.querySelector('.mykomo-home .mykomo-ring:not([data-komo-animated=\"1\"] )'))schedule()}).observe(document.body,{childList:true,subtree:true});","if(!window.matchMedia('(max-width: 767px)').matches)new MutationObserver(()=>{if(document.querySelector('.mykomo-home .mykomo-ring:not([data-komo-animated=\"1\"] )'))schedule()}).observe(document.body,{childList:true,subtree:true});");
  // Current canonical source has no space before the closing selector parenthesis.
  src=src.replace("new MutationObserver(()=>{if(document.querySelector('.mykomo-home .mykomo-ring:not([data-komo-animated=\"1\"])'))schedule()}).observe(document.body,{childList:true,subtree:true});","if(!window.matchMedia('(max-width: 767px)').matches)new MutationObserver(()=>{if(document.querySelector('.mykomo-home .mykomo-ring:not([data-komo-animated=\"1\"])'))schedule()}).observe(document.body,{childList:true,subtree:true});");
  await writeFile(p,src,'utf8');
}

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/mobile-performance-final-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./mobile-performance-final-v1.css?v=${release}" />\n</head>`);
// Cache-bust the phone-critical runtimes as one coherent release.
for(const file of ['adaptive-shell-v4.js','mobile-vertical-app-v1.js','pulse-bottom-nav-v6.js','my-komo-lobby-v3.js','my-komo-score-motion-v1.js','patient-home-micro-motion-v1.js','pulse-home-hero-polish-v2.js']){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\./${escaped}(?:\\?v=[^\"']+)?`,'g'),`./${file}?v=${release}`);
}
await writeFile(htmlPath,html,'utf8');

console.log('[pulse-mobile-performance-final-v1] vertical-only phone shell, simplified My KOMO and Safari runtime throttles shipped');
