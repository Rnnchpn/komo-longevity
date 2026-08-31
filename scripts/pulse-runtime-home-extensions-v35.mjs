import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const command='patient-home-command-v1.js';
const retired=['patient-home-micro-motion-v1.js','my-komo-key-home-v1.js','pulse-home-hero-polish-v2.js'];

const commandSource=await readFile(root+command,'utf8');
let html=await readFile(htmlPath,'utf8');

const canonicalHome=commandSource.includes("const VERSION='5.0.0'")||commandSource.includes('data-khome-v5')||commandSource.includes("const VERSION='3.0.0'")||commandSource.includes('data-khome-v3');
if(!canonicalHome)throw new Error('[pulse-home-v35] canonical Home contract not recognized');

// The canonical Home owns presentation, KEY placement, micro-motion and hero hierarchy.
// Historical extension runtimes are retired instead of being merged into or run after it.
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

if(commandSource.includes("const VERSION='5.0.0'")){
  if(!commandSource.includes("signalCard('KEY · QUOTIDIEN'"))throw new Error('[pulse-home-v35] V5 native KEY signal missing');
  if(!commandSource.includes('kh5-motion')||!commandSource.includes('kh5-komo')||!commandSource.includes('kh5-signals'))throw new Error('[pulse-home-v35] V5 decision hierarchy changed');
  for(const legacySignature of ['KomoHomeMicroMotion','KomoKeyHome','KomoPulseHeroPolish']){
    if(commandSource.includes(legacySignature))throw new Error(`[pulse-home-v35] retired extension merged into V5 owner: ${legacySignature}`);
  }
  console.log('[pulse-home-v35] Home V5 detected · legacy KEY/micro-motion/hero overlays retired · single canonical owner preserved');
}else{
  console.log('[pulse-home-v35] Home V3 detected · legacy KEY/micro-motion/hero overlays retired · single canonical owner preserved');
}

await import('./pulse-runtime-mobile-observer-v36.mjs');