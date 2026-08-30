import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const canonical='my-komo-home-v1.js';
const overlays=['patient-home-visual-v2.js','my-komo-visual-runtime-v3.js'];
let home=await readFile(root+canonical,'utf8');
let patientVisual=await readFile(root+overlays[0],'utf8');
let visualBundle=await readFile(root+overlays[1],'utf8');
let html=await readFile(htmlPath,'utf8');

const renderTail="if(host.dataset.signature===html)return;host.dataset.signature=html;host.innerHTML=html;bindEngagement(host);";
if(!home.includes(renderTail))throw new Error('[pulse-home-v33] canonical Home render contract changed');
home=home.replace(renderTail,`${renderTail}window.dispatchEvent(new CustomEvent('komo:home-rendered'));`);

const patientObserver=/new MutationObserver\(patch\)\.observe\((?:document\.body|document\.querySelector\('#viewRoot'\)),\{childList:true,subtree:true\}\);/;
if(!patientObserver.test(patientVisual))throw new Error('[pulse-home-v33] patient Home visual observer contract changed');
patientVisual=patientVisual.replace(patientObserver,"window.addEventListener('komo:home-rendered',patch);");

const ringObserver=/new MutationObserver\(\(\)=>\{if\(document\.querySelector\('\.mykomo-home \.mykomo-ring:not\(\[data-komo-animated=\"1\"\]\)'\)\)schedule\(\)\}\)\.observe\([^;]+;/;
const dashboardObserver=/new MutationObserver\(\(\)=>\{if\(route\(\)==='home'\)schedule\(90\)\}\)\.observe\([^;]+;/;
if(!ringObserver.test(visualBundle)||!dashboardObserver.test(visualBundle))throw new Error('[pulse-home-v33] My KŌMØ visual observer contract changed');
visualBundle=visualBundle.replace(ringObserver,"window.addEventListener('komo:home-rendered',schedule);");
visualBundle=visualBundle.replace(dashboardObserver,"window.addEventListener('komo:home-rendered',()=>schedule(0));");

if(patientVisual.includes('new MutationObserver('))throw new Error('[pulse-home-v33] patient Home visual observer remains');
if(visualBundle.includes('new MutationObserver('))throw new Error('[pulse-home-v33] My KŌMØ visual observers remain');

await writeFile(root+canonical,`${home.trim()}\n${patientVisual.trim()}\n${visualBundle.trim()}`,'utf8');
for(const file of overlays){
  const re=new RegExp(`\\s*<script([^>]*)src=[\"']\\./${file.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?[^\"']*)?[\"']([^>]*)><\\/script>`,'g');
  const matches=[...html.matchAll(re)];
  if(matches.length!==1)throw new Error(`[pulse-home-v33] expected one direct ${file} tag, found ${matches.length}`);
  html=html.replace(re,'');
}
await writeFile(htmlPath,html,'utf8');
for(const file of overlays)await rm(root+file,{force:true});

const finalHome=await readFile(root+canonical,'utf8');
const finalHtml=await readFile(htmlPath,'utf8');
for(const file of overlays)if(finalHtml.includes(file))throw new Error(`[pulse-home-v33] retired Home overlay remains direct: ${file}`);
for(const signature of ['komo:home-rendered','data-khome-actions','mykomo-command-strip','KomoHomeDashboardV2'])if(!finalHome.includes(signature))throw new Error(`[pulse-home-v33] consolidated Home behavior missing: ${signature}`);
console.log('[pulse-home-v33] Home data + presentation consolidated · three presentation observers retired · one canonical Home runtime retained');
await import('./pulse-runtime-auth-consolidation-v34.mjs');
