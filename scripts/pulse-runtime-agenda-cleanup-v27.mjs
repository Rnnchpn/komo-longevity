import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const read=file=>readFile(root+file,'utf8');
const write=(file,content)=>writeFile(root+file,content,'utf8');

// Agenda is owned exclusively by agenda-hub-v4 + premium map.
let motion=await read('motion-journey-v1.js');
const prepStart=motion.indexOf('function patchPreparation(j){');
const mountStart=motion.indexOf('function mountPatient(j){');
if(prepStart<0||mountStart<prepStart)throw new Error('[pulse-agenda-v27] Motion preparation/document block contract changed');
motion=motion.slice(0,prepStart)+motion.slice(mountStart);
const docsStart=motion.indexOf("if(r==='documents'){",motion.indexOf('function mountPatient(j){'));
const pathStart=motion.indexOf("if(r==='path'){",docsStart);
if(docsStart<0||pathStart<docsStart)throw new Error('[pulse-agenda-v27] Motion Journey documents branch contract changed');
motion=motion.slice(0,docsStart)+motion.slice(pathStart);
motion=motion.replace("if(!['documents','path','clinical'].includes(r))return;","if(!['path','clinical'].includes(r))return;");
motion=motion.replace("if(['documents','path','clinical'].includes(r)&&!document.querySelector('[data-kmj1]'))schedule()","if(['path','clinical'].includes(r)&&!document.querySelector('[data-kmj1]'))schedule()");
if(motion.includes("r==='documents'")||motion.includes("['documents','path','clinical']"))throw new Error('[pulse-agenda-v27] Motion Journey still owns Agenda');
await write('motion-journey-v1.js',motion);

let canonical=await read('patient-canonical-results.js');
const docRenderStart=canonical.indexOf('function renderDocuments(result){');
const renderStart=canonical.indexOf('async function render(force=false){');
if(docRenderStart<0||renderStart<docRenderStart)throw new Error('[pulse-agenda-v27] Canonical document renderer contract changed');
canonical=canonical.slice(0,docRenderStart)+canonical.slice(renderStart);
const docCall="if(hash==='#documents')renderDocuments(result)";
if(!canonical.includes(docCall))throw new Error('[pulse-agenda-v27] Canonical documents call contract changed');
canonical=canonical.replace(docCall,'');
if(canonical.includes('data-kcanon-doc')||canonical.includes('renderDocuments(result)'))throw new Error('[pulse-agenda-v27] Canonical Results still renders into Agenda');
await write('patient-canonical-results.js',canonical);

let html=await read('index.html');
const cleanTag=/\s*<script src="\.\/agenda-clean-room-v1\.js(?:\?[^\"]*)?"><\/script>/g;
if(!cleanTag.test(html))throw new Error('[pulse-agenda-v27] Agenda clean-room tag missing before retirement');
html=html.replace(cleanTag,'');
if(html.includes('agenda-clean-room-v1.js'))throw new Error('[pulse-agenda-v27] Agenda clean-room still loaded');
await write('index.html',html);

for(const file of ['agenda-clean-room-v1.js','patient-motion-booking-v2.js','patient-preparation-hub-v2.js']){
  await rm(root+file,{force:true});
}

const finalHtml=await read('index.html');
const direct=[...finalHtml.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)].map(x=>x[1]);
for(const retired of ['agenda-clean-room-v1.js','patient-motion-booking-v2.js','patient-preparation-hub-v2.js']){
  if(direct.includes(retired))throw new Error(`[pulse-agenda-v27] retired layer still direct: ${retired}`);
}
if(!direct.includes('agenda-hub-v4.js')||!direct.includes('agenda-premium-map-v1.js'))throw new Error('[pulse-agenda-v27] canonical Agenda owners missing');
console.log('[pulse-agenda-v27] Agenda exclusive ownership locked · Motion/report document producers retired · clean-room removed');
