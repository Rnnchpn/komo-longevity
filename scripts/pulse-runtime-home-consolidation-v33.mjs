import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const canonical='patient-home-command-v1.js';
const legacy=['patient-home-visual-v2.js','my-komo-visual-runtime-v3.js','my-komo-home-v1.js','patient-home-datawall-v3.js','patient-home-daily-v2.js','patient-home-micro-motion-v1.js','pulse-home-hero-polish-v2.js'];
const esc=file=>file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
let home=await readFile(root+canonical,'utf8');
let html=await readFile(htmlPath,'utf8');

// V7 owns data + presentation itself. Older visual/data overlays are retired rather than
// merged back into the route, which preserves a single event-driven Home owner.
for(const file of legacy){
  const re=new RegExp(`\\s*<script(?: type="module")?[^>]*src=[\"']\\./${esc(file)}(?:\\?[^\"']*)?[\"'][^>]*><\\/script>`,'g');
  html=html.replace(re,'');
}
await writeFile(htmlPath,html,'utf8');
for(const file of legacy)await rm(root+file,{force:true});

const finalHtml=await readFile(htmlPath,'utf8');
const ownerTags=[...finalHtml.matchAll(new RegExp(`<script[^>]+src=[\"']\\./${esc(canonical)}(?:\\?[^\"']*)?[\"']`,'g'))];
const checks=[
  ['one canonical Home V7 runtime retained',ownerTags.length===1],
  ['Home V7 owns canonical host',home.includes('data-khome-v7')&&home.includes("host.dataset.khomeOwner='patient-home-command-v1@7'")],
  ['Home stays data free',home.includes('dataFree:true')&&!home.includes("rpc('")&&!home.includes("from('")],
  ['Home has no health metric renderer',!home.includes('MOTION TODAY')&&!home.includes('Motion Score')&&!home.includes('Steps')&&!home.includes('Sleep')&&!home.includes('Resting HR')],
  ['Home remains event driven',!home.includes('MutationObserver')&&!home.includes('setInterval(')],
  ['Home keeps canonical route controller',home.includes('KomoPatientNavigation.go(target)')],
  ['legacy Home runtimes are not loaded',legacy.every(file=>!finalHtml.includes(file))]
];
for(const [label,ok] of checks)console.log(`[pulse-home-v33] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))throw new Error('[pulse-home-v33] canonical Home V7 consolidation failed');
console.log('[pulse-home-v33] Home V7 consolidated · one data-free route owner · legacy overlays retired');
await import('./pulse-runtime-auth-consolidation-v34.mjs');
