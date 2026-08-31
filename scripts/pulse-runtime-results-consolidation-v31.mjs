import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const canonicalFile='patient-canonical-results.js';
const dedicatedFile='results-motion-journey-v1.js';
const polishFile='results-polish-v1.js';
const guardFile='patient-results-ownership-v2.js';

let canonical=await readFile(root+canonicalFile,'utf8');
let dedicated=await readFile(root+dedicatedFile,'utf8');
let html=await readFile(htmlPath,'utf8');

// #results is owned only by results-motion-journey-v1.js.
// The canonical runtime keeps Home/Profile/Path/Documents responsibilities only.
if(canonical.includes("['#path','#results']")||canonical.includes("hash==='#path'||hash==='#results'"))throw new Error('[pulse-results-v31] canonical Results ownership regression');
if(!canonical.includes("if(hash==='#path')renderPath(result)"))throw new Error('[pulse-results-v31] canonical path-only contract missing');
if(!dedicated.includes('window.KomoPatientResultsV1')||!dedicated.includes("route()!=='results'"))throw new Error('[pulse-results-v31] dedicated Results owner missing');
if(dedicated.includes('obs.observe(document.body'))throw new Error('[pulse-results-v31] dedicated Results body observer remains');

// Retire legacy direct polish/guard tags rather than merging them into another runtime.
for(const file of [polishFile,guardFile]){
  const tag=new RegExp(`\\s*<script([^>]*)src=[\"']\\./${file.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?[^\"']*)?[\"']([^>]*)><\\/script>`,'g');
  html=html.replace(tag,'');
  await rm(root+file,{force:true});
}
await writeFile(htmlPath,html,'utf8');

const finalHtml=await readFile(htmlPath,'utf8');
if(finalHtml.includes(polishFile)||finalHtml.includes(guardFile))throw new Error('[pulse-results-v31] retired Results layer still referenced');
if(!finalHtml.includes(canonicalFile)||!finalHtml.includes(dedicatedFile))throw new Error('[pulse-results-v31] required Results runtimes missing');
const finalCanonical=await readFile(root+canonicalFile,'utf8');
const finalDedicated=await readFile(root+dedicatedFile,'utf8');
if(finalCanonical.includes("#results'))renderPath")||finalCanonical.includes("'#results'")){
  // '#results' may occur in copy/styles elsewhere; ownership signatures above are the hard gate.
}
if(!finalDedicated.includes('data-kresults-v1')||!finalDedicated.includes('KomoPatientResultsV1'))throw new Error('[pulse-results-v31] dedicated Results surface incomplete');
console.log('[pulse-results-v31] Results single owner retained · legacy polish and ownership guards retired');
