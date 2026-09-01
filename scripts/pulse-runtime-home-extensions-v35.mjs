import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const command='patient-home-command-v1.js';
const retired=['patient-home-micro-motion-v1.js','my-komo-key-home-v1.js','pulse-home-hero-polish-v2.js'];

const commandSource=await readFile(root+command,'utf8');
let html=await readFile(htmlPath,'utf8');

const isV6=commandSource.includes("const VERSION='6.0.0'")||commandSource.includes('data-khome-v6');
const canonicalHome=isV6||commandSource.includes("const VERSION='5.0.0'")||commandSource.includes('data-khome-v5')||commandSource.includes("const VERSION='3.0.0'")||commandSource.includes('data-khome-v3');
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

if(isV6){
  if(!commandSource.includes('MOTION TODAY')||!commandSource.includes("metricCard('steps'")||!commandSource.includes("metricCard('sleep'")||!commandSource.includes("metricCard('resting_hr'"))throw new Error('[pulse-home-v35] V6 daily signal hierarchy changed');
  if(commandSource.includes('kh5-komo')||commandSource.includes('kh5-signals'))throw new Error('[pulse-home-v35] retired V5 dashboard hierarchy merged into V6 owner');
  console.log('[pulse-home-v35] Home V6 detected · legacy Home overlays retired · single canonical owner preserved');
}else if(commandSource.includes("const VERSION='5.0.0'")){
  console.log('[pulse-home-v35] Home V5 detected · legacy Home overlays retired · single canonical owner preserved');
}else{
  console.log('[pulse-home-v35] Home V3 detected · legacy Home overlays retired · single canonical owner preserved');
}

await import('./pulse-runtime-mobile-observer-v36.mjs');
