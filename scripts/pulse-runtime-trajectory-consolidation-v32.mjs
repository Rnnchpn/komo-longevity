import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const legacy='progression-v2.js';
const canonical='trajectory-v3.js';
let html=await readFile(htmlPath,'utf8');
const legacySource=await readFile(root+legacy,'utf8');
const guardSource=await readFile(root+'trajectory-route-guard-v1.js','utf8');

if(!legacySource.includes("location.hash!=='#path'")&&!legacySource.includes("location.hash.slice(1)!=='path'"))throw new Error('[pulse-trajectory-v32] legacy progression is no longer path-scoped');
if(legacySource.includes("route()!=='trajectory'")||legacySource.includes("location.hash!=='#trajectory'"))throw new Error('[pulse-trajectory-v32] legacy progression unexpectedly owns trajectory');
if(!guardSource.includes("KomoPatientNavigation?.go?.('trajectory'"))throw new Error('[pulse-trajectory-v32] path convergence guard missing');
if(!html.includes(canonical))throw new Error('[pulse-trajectory-v32] canonical trajectory runtime missing');

const tag=new RegExp(`\\s*<script([^>]*)src=[\"']\\./${legacy.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?[^\"']*)?[\"']([^>]*)><\\/script>`,'g');
const matches=[...html.matchAll(tag)];
if(matches.length!==1)throw new Error(`[pulse-trajectory-v32] expected one direct ${legacy} tag, found ${matches.length}`);
html=html.replace(tag,'');
await writeFile(htmlPath,html,'utf8');
await rm(root+legacy,{force:true});

const finalHtml=await readFile(htmlPath,'utf8');
if(finalHtml.includes(legacy))throw new Error('[pulse-trajectory-v32] legacy path renderer remains direct');
if(!finalHtml.includes(canonical))throw new Error('[pulse-trajectory-v32] canonical trajectory owner removed unexpectedly');
console.log('[pulse-trajectory-v32] legacy #path renderer retired · #trajectory remains the single trajectory owner');
await import('./pulse-runtime-home-consolidation-v33.mjs');
