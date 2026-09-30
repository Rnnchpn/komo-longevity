import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const command='patient-home-command-v1.js';
const retired=['patient-home-micro-motion-v1.js','my-komo-key-home-v1.js','pulse-home-hero-polish-v2.js'];

const commandSource=await readFile(root+command,'utf8');
let html=await readFile(htmlPath,'utf8');

const isV8=commandSource.includes("const VERSION='8.0.0-cockpit'")||commandSource.includes('data-khome-v8');
const isV7=!isV8&&(commandSource.includes("const VERSION='7.0.0'")||commandSource.includes('data-khome-v7'));
const canonicalHome=isV8||isV7||commandSource.includes("const VERSION='6.0.0'")||commandSource.includes('data-khome-v6')||commandSource.includes("const VERSION='5.0.0'")||commandSource.includes('data-khome-v5')||commandSource.includes("const VERSION='3.0.0'")||commandSource.includes('data-khome-v3');
if(!canonicalHome)throw new Error('[pulse-home-v35] canonical Home contract not recognized');

// The canonical Home owns presentation. Historical Home overlays stay retired.
for(const file of retired){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(`\\s*<script([^>]*)src=[\"']\\./${escaped}(?:\\?[^\"']*)?[\"']([^>]*)><\\/script>`,'g');
  html=html.replace(re,'');
}
await writeFile(htmlPath,html,'utf8');
for(const file of retired)await rm(root+file,{force:true});

const finalHtml=await readFile(htmlPath,'utf8');
for(const file of retired){
  if(finalHtml.includes(file))throw new Error(`[pulse-home-v35] retired Home extension remains direct: ${file}`);
}
if(!commandSource.includes('komo:home-command-rendered'))throw new Error('[pulse-home-v35] canonical Home render event missing');
if(!commandSource.includes('KomoAssistantV2'))throw new Error('[pulse-home-v35] canonical Komo assistant bridge missing');
if(commandSource.includes('MutationObserver')||commandSource.includes('setInterval('))throw new Error('[pulse-home-v35] canonical Home regained persistent observation');

if(isV8){
  const v8Checks=[
    ['canonical V8 owner',commandSource.includes('data-khome-v8')&&commandSource.includes("host.dataset.khomeOwner='patient-home-command-v1@8'")],
    ['authenticated bounded data',commandSource.includes('auth.getSession()')&&commandSource.includes("from('scores')")&&commandSource.includes("eq('release_status','released')")&&commandSource.includes("from('wearable_daily_metrics')")&&commandSource.includes("from('organization_appointments')")],
    ['explicit empty states',commandSource.includes('Aucun bilan publié')&&commandSource.includes('Aucune donnée Connected aujourd’hui')&&commandSource.includes('Aucun rendez-vous planifié')]
  ];
  for(const [label,ok] of v8Checks)if(!ok)throw new Error(`[pulse-home-v35] V8 contract changed: ${label}`);
  for(const route of ['results','key','documents','mykomo'])if(!commandSource.includes(`data-kh8-route=\"${route}\"`))throw new Error(`[pulse-home-v35] V8 route missing: ${route}`);
  console.log('[pulse-home-v35] Home V8 detected · authenticated bounded cockpit · legacy overlays retired · single canonical owner preserved');
}else if(isV7){
  if(!commandSource.includes('dataFree:true')||commandSource.includes("rpc('")||commandSource.includes("from('")||commandSource.includes('MOTION TODAY')||commandSource.includes('Motion Score'))throw new Error('[pulse-home-v35] V7 data-free contract changed');
  for(const route of ['results','key','documents','mykomo'])if(!commandSource.includes(`data-kh7-route=\"${route}\"`))throw new Error(`[pulse-home-v35] V7 route missing: ${route}`);
  console.log('[pulse-home-v35] Home V7 detected · data-free orientation surface · legacy overlays retired · single canonical owner preserved');
}else if(commandSource.includes("const VERSION='6.0.0'")){
  console.log('[pulse-home-v35] legacy Home V6 detected · legacy overlays retired · single canonical owner preserved');
}else if(commandSource.includes("const VERSION='5.0.0'")){
  console.log('[pulse-home-v35] legacy Home V5 detected · legacy overlays retired · single canonical owner preserved');
}else{
  console.log('[pulse-home-v35] legacy Home V3 detected · legacy overlays retired · single canonical owner preserved');
}

await import('./pulse-runtime-mobile-observer-v36.mjs');