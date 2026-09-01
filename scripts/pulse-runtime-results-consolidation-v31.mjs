import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const canonicalFile='patient-canonical-results.js';
const polishFile='results-polish-v1.js';
let canonical=await readFile(root+canonicalFile,'utf8');
let polish=await readFile(root+polishFile,'utf8');
let html=await readFile(htmlPath,'utf8');
const isResultsV2=canonical.includes('data-kresults-v2')&&canonical.includes('KŌMØ CONNECTED')&&canonical.includes('KŌMØ CLINICAL');

if(!isResultsV2){
  const renderMarker="if(hash==='#path'||hash==='#results')renderPath(result)";
  if(!canonical.includes(renderMarker))throw new Error('[pulse-results-v31] canonical render contract changed');
  if(!canonical.includes("komo:results-rendered"))canonical=canonical.replace(renderMarker,`${renderMarker};window.dispatchEvent(new CustomEvent('komo:results-rendered',{detail:{hash}}))`);

  const observer="const root=document.querySelector('#viewRoot');if(root)new MutationObserver(()=>schedule()).observe(root,{childList:true,subtree:true});";
  if(!polish.includes(observer))throw new Error('[pulse-results-v31] results polish observer contract changed');
  polish=polish.replace(observer,"window.addEventListener('komo:results-rendered',schedule);");
  if(polish.includes('new MutationObserver('))throw new Error('[pulse-results-v31] results polish observer remains');
  canonical=`${canonical.trim()}\n${polish.trim()}`;
  await writeFile(root+canonicalFile,canonical,'utf8');
}else{
  // Results V2 already owns the complete Connected + Motion + Clinical reading.
  // Do not merge the historical Pulse Free polish into the new canonical owner.
  if(canonical.includes('krp-overview')||canonical.includes('data-krp-action'))throw new Error('[pulse-results-v31] legacy Results polish leaked into Results V2');
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
if(isResultsV2){
  for(const signature of ['data-kresults-v2','KŌMØ CONNECTED','KŌMØ MOTION','KŌMØ CLINICAL'])if(!finalCanonical.includes(signature))throw new Error(`[pulse-results-v31] Results V2 behavior missing: ${signature}`);
  console.log('[pulse-results-v31] Results V2 retained as sole Connected + Motion + Clinical interpretation owner · legacy polish retired');
}else{
  for(const signature of ['komo:results-rendered','krp-overview','data-kcanon-detail'])if(!finalCanonical.includes(signature))throw new Error(`[pulse-results-v31] consolidated results behavior missing: ${signature}`);
  console.log('[pulse-results-v31] canonical results + polish consolidated · view observer retired · one results runtime retained');
}
