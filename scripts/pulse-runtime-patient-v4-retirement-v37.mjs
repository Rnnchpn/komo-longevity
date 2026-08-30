import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const legacy='patient-v4.js';
let html=await readFile(htmlPath,'utf8');
const source=await readFile(root+legacy,'utf8');
const trajectoryGuard=await readFile(root+'trajectory-route-guard-v1.js','utf8');

for(const signature of ["const TARGETS=new Set(['path','plan','documents'])","if(r==='path')","else if(r==='plan')","else if(r==='documents')"])if(!source.includes(signature))throw new Error(`[pulse-patient-v37] legacy patient renderer contract changed: ${signature}`);
if(source.includes("TARGETS=new Set(['home'"))throw new Error('[pulse-patient-v37] patient-v4 unexpectedly owns Home');
if(!trajectoryGuard.includes("KomoPatientNavigation?.go?.('trajectory'"))throw new Error('[pulse-patient-v37] path/plan convergence guard missing');
if(!html.includes('trajectory-v3.js')||!html.includes('agenda-hub-v4.js')||!html.includes('booking-layer-v1.js'))throw new Error('[pulse-patient-v37] canonical replacement owners missing');

const tag=new RegExp(`\\s*<script([^>]*)src=[\"']\\./${legacy.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?[^\"']*)?[\"']([^>]*)><\\/script>`,'g');
const matches=[...html.matchAll(tag)];
if(matches.length!==1)throw new Error(`[pulse-patient-v37] expected one direct ${legacy} tag, found ${matches.length}`);
html=html.replace(tag,'');
await writeFile(htmlPath,html,'utf8');
await rm(root+legacy,{force:true});

const finalHtml=await readFile(htmlPath,'utf8');
if(finalHtml.includes(legacy))throw new Error('[pulse-patient-v37] retired patient-v4 remains direct');
console.log('[pulse-patient-v37] legacy path/plan/documents renderer retired · canonical Trajectory and Agenda owners preserved');
