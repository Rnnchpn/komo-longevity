import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const read=file=>readFile(root+file,'utf8');
const write=(file,content)=>writeFile(root+file,content,'utf8');
const context=(src,needle)=>{const i=src.indexOf(needle);return i<0?'absent':src.slice(Math.max(0,i-120),Math.min(src.length,i+needle.length+180)).replace(/\s+/g,' ')};

// Agenda is owned exclusively by agenda-hub-v4 + premium map.
let motion=await read('motion-journey-v1.js');
const patientStart=motion.indexOf('function patchPreparation(j){');
const proStart=motion.indexOf('function mountPro(j){');
if(patientStart<0||proStart<patientStart)throw new Error('[pulse-agenda-v27] Motion Journey patient mount contract changed');
const pathOnlyMount="function mountPatient(j){if(!j||route()!=='path')return;const root=document.querySelector('#viewRoot'),intro=root?.querySelector('.patient-v4 .pv4-intro');if(!root||!intro)return;document.querySelectorAll('[data-kmj1]').forEach(x=>x.remove());const el=document.createElement('div');el.innerHTML=card(j,false);intro.insertAdjacentElement('afterend',el.firstElementChild)}\n";
motion=motion.slice(0,patientStart)+pathOnlyMount+motion.slice(proStart);
motion=motion.replaceAll("['documents','path','clinical']","['path','clinical']");
motion=motion.replaceAll('"documents","path","clinical"','"path","clinical"');
const leftovers=["r==='documents'","['documents','path','clinical']",'patchPreparation(j)'].filter(x=>motion.includes(x));
if(leftovers.length){console.error('[pulse-agenda-v27] remaining Motion Agenda contexts',leftovers.map(x=>`${x}: ${context(motion,x)}`).join(' || '));throw new Error('[pulse-agenda-v27] Motion Journey still owns Agenda')}
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

// Keep patient-motion-booking-v2.js on disk until the later compatibility patcher has read it;
// it is already unloaded since wave 26 and remains asserted absent from direct runtime.
for(const file of ['agenda-clean-room-v1.js','patient-preparation-hub-v2.js']){
  await rm(root+file,{force:true});
}

const finalHtml=await read('index.html');
const direct=[...finalHtml.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)].map(x=>x[1]);
for(const retired of ['agenda-clean-room-v1.js','patient-motion-booking-v2.js','patient-preparation-hub-v2.js']){
  if(direct.includes(retired))throw new Error(`[pulse-agenda-v27] retired layer still direct: ${retired}`);
}
if(!direct.includes('agenda-hub-v4.js')||!direct.includes('agenda-premium-map-v1.js'))throw new Error('[pulse-agenda-v27] canonical Agenda owners missing');
console.log('[pulse-agenda-v27] Agenda exclusive ownership locked · Motion/report document producers retired · clean-room removed');
