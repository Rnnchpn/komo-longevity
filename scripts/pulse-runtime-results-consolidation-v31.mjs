import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const canonicalFile='patient-canonical-results.js';
const polishFile='results-polish-v1.js';
let canonical=await readFile(root+canonicalFile,'utf8');
let polish=await readFile(root+polishFile,'utf8');
let html=await readFile(htmlPath,'utf8');
const isResultsV4=canonical.includes("const VERSION='4.0.0-motion-report'")&&canonical.includes('data-kresults-v4')&&canonical.includes('RÉSULTAT MOTION')&&canonical.includes('RÉSULTAT CLINICAL')&&canonical.includes('RÉSULTATS FONCTIONNELS');
const isSensorResultsV3=canonical.includes("const VERSION='3.0.0-sensor'")&&canonical.includes('data-kresults-v2')&&canonical.includes('Symétrie neuromusculaire')&&canonical.includes('Motion Score');

if(isResultsV4){
  // Results V4 is the complete Motion Report restitution surface. It deliberately
  // excludes Connected and all historical Pulse Free / results-polish renderers.
  for(const forbidden of ['krp-overview','data-krp-action','KEY · QUOTIDIEN','tests-v1-root']){
    if(canonical.includes(forbidden))throw new Error(`[pulse-results-v31] legacy layer leaked into Results V4: ${forbidden}`);
  }
}else if(isSensorResultsV3){
  // Historical sensor Results v3 already owns its surface; do not merge polish.
  if(canonical.includes('krp-overview')||canonical.includes('data-krp-action'))throw new Error('[pulse-results-v31] legacy Results polish leaked into sensor Results');
}else{
  const renderMarker="if(hash==='#path'||hash==='#results')renderPath(result)";
  if(!canonical.includes(renderMarker))throw new Error('[pulse-results-v31] canonical render contract changed');
  if(!canonical.includes("komo:results-rendered"))canonical=canonical.replace(renderMarker,`${renderMarker};window.dispatchEvent(new CustomEvent('komo:results-rendered',{detail:{hash}}))`);

  const observer="const root=document.querySelector('#viewRoot');if(root)new MutationObserver(()=>schedule()).observe(root,{childList:true,subtree:true});";
  if(!polish.includes(observer))throw new Error('[pulse-results-v31] results polish observer contract changed');
  polish=polish.replace(observer,"window.addEventListener('komo:results-rendered',schedule);");
  if(polish.includes('new MutationObserver('))throw new Error('[pulse-results-v31] results polish observer remains');
  canonical=`${canonical.trim()}\n${polish.trim()}`;
  await writeFile(root+canonicalFile,canonical,'utf8');
}

const polishTag=new RegExp(`\\s*<script([^>]*)src=[\"']\\./${polishFile.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?[^\"']*)?[\"']([^>]*)><\\/script>`,'g');
const matches=[...html.matchAll(polishTag)];
if(matches.length!==1)throw new Error(`[pulse-results-v31] expected one direct ${polishFile} tag, found ${matches.length}`);
html=html.replace(polishTag,'');
await writeFile(htmlPath,html,'utf8');
await rm(root+polishFile,{force:true});

const finalHtml=await readFile(htmlPath,'utf8');
if(finalHtml.includes(polishFile))throw new Error('[pulse-results-v31] retired polish layer remains direct');
if(!finalHtml.includes(canonicalFile))throw new Error('[pulse-results-v31] canonical results runtime missing');
const finalCanonical=await readFile(root+canonicalFile,'utf8');
if(isResultsV4){
  for(const signature of ['4.0.0-motion-report','data-kresults-v4','RÉSULTAT MOTION','RÉSULTATS FONCTIONNELS','QUESTIONNAIRES','Données Myodev','RÉSULTAT CLINICAL'])if(!finalCanonical.includes(signature))throw new Error(`[pulse-results-v31] Results V4 behavior missing: ${signature}`);
  console.log('[pulse-results-v31] Results Motion Report v4 retained as sole Motion → Clinical restitution owner · historical polish retired');
}else if(isSensorResultsV3){
  for(const signature of ["3.0.0-sensor",'data-kresults-v2','Symétrie neuromusculaire','KŌMØ MOTION','KEY · QUOTIDIEN'])if(!finalCanonical.includes(signature))throw new Error(`[pulse-results-v31] sensor Results behavior missing: ${signature}`);
  console.log('[pulse-results-v31] Results sensor v3 retained as sole Motion + KEY + Clinical owner · legacy polish retired');
}else{
  for(const signature of ['komo:results-rendered','krp-overview','data-kcanon-detail'])if(!finalCanonical.includes(signature))throw new Error(`[pulse-results-v31] consolidated results behavior missing: ${signature}`);
  console.log('[pulse-results-v31] canonical results + polish consolidated · view observer retired · one results runtime retained');
}

if(isResultsV4)await import('./pulse-results-library-links-v1.mjs');
