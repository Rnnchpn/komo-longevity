import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const canonical='patient-home-command-v1.js';
const legacy=['patient-home-visual-v2.js','my-komo-visual-runtime-v3.js','my-komo-home-v1.js','patient-home-datawall-v3.js','patient-home-daily-v2.js','patient-home-micro-motion-v1.js','pulse-home-hero-polish-v2.js'];
const esc=file=>file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
let home=await readFile(root+canonical,'utf8');
let html=await readFile(htmlPath,'utf8');

// V8 remains the single Home owner. Historical visual/data overlays are retired
// rather than merged back into the route. The canonical owner may read the small
// authenticated summary required by the approved cockpit, but it stays event-driven
// and does not import or reparent Results, KEY, Agenda or My KŌMØ owners.
for(const file of legacy){
  const re=new RegExp(`\\s*<script(?: type="module")?[^>]*src=[\"']\\./${esc(file)}(?:\\?[^\"']*)?[\"'][^>]*><\\/script>`,'g');
  html=html.replace(re,'');
}
await writeFile(htmlPath,html,'utf8');
for(const file of legacy)await rm(root+file,{force:true});

const finalHtml=await readFile(htmlPath,'utf8');
const ownerTags=[...finalHtml.matchAll(new RegExp(`<script[^>]+src=[\"']\\./${esc(canonical)}(?:\\?[^\"']*)?[\"']`,'g'))];
const checks=[
  ['one canonical Home V8 runtime retained',ownerTags.length===1],
  ['Home V8 owns canonical host',home.includes('data-khome-v8')&&home.includes("host.dataset.khomeOwner='patient-home-command-v1@8'")],
  ['Home summary is authenticated and bounded',home.includes('auth.getSession()')&&home.includes("from('scores')")&&home.includes("eq('release_status','released')")&&home.includes("from('wearable_daily_metrics')")&&home.includes("from('organization_appointments')")],
  ['Home has explicit empty states rather than fake data',home.includes('Aucun bilan publié')&&home.includes('Aucune donnée Connected aujourd’hui')&&home.includes('Aucun rendez-vous planifié')],
  ['Home remains event driven',!home.includes('MutationObserver')&&!home.includes('setInterval(')],
  ['Home keeps canonical route controller',home.includes('KomoPatientNavigation.go(target)')],
  ['Home does not import competing surface owners',!home.includes('patient-canonical-results.js')&&!home.includes('key-hub-v1.js')&&!home.includes('agenda-v4.js')&&!home.includes('my-komo-stable-v5.js')],
  ['legacy Home runtimes are not loaded',legacy.every(file=>!finalHtml.includes(file))]
];
for(const [label,ok] of checks)console.log(`[pulse-home-v33] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))throw new Error('[pulse-home-v33] canonical Home V8 consolidation failed');
console.log('[pulse-home-v33] Home V8 consolidated · one bounded event-driven route owner · legacy overlays retired');
await import('./pulse-runtime-auth-consolidation-v34.mjs');
