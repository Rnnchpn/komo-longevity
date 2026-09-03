import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const read=file=>readFile(root+file,'utf8');
const write=(file,content)=>writeFile(root+file,content,'utf8');
const context=(src,needle)=>{const i=src.indexOf(needle);return i<0?'absent':src.slice(Math.max(0,i-140),Math.min(src.length,i+needle.length+220)).replace(/\s+/g,' ')};

// Agenda is owned exclusively by agenda-hub-v4 + premium map.
let motion=await read('motion-journey-v1.js');
const patientStart=motion.indexOf('function patchPreparation(j){');
const proStart=motion.indexOf('function mountPro(j){');
if(patientStart<0||proStart<patientStart)throw new Error('[pulse-agenda-v27] Motion Journey patient mount contract changed');
const pathOnlyMount="function mountPatient(j){if(!j||route()!=='path')return;const root=document.querySelector('#viewRoot'),intro=root?.querySelector('.patient-v4 .pv4-intro');if(!root||!intro)return;document.querySelectorAll('[data-kmj1]').forEach(x=>x.remove());const el=document.createElement('div');el.innerHTML=card(j,false);intro.insertAdjacentElement('afterend',el.firstElementChild)}\n";
motion=motion.slice(0,patientStart)+pathOnlyMount+motion.slice(proStart);
motion=motion.replaceAll("['documents','path','clinical']","['path','clinical']");
motion=motion.replaceAll('"documents","path","clinical"','"path","clinical"');
motion=motion.replaceAll("(r==='documents'||r==='clinical')","(r==='path'||r==='clinical')");
motion=motion.replaceAll("(r==='clinical'||r==='documents')","(r==='clinical'||r==='path')");
const leftovers=["r==='documents'","['documents','path','clinical']",'patchPreparation(j)'].filter(x=>motion.includes(x));
if(leftovers.length){console.error('[pulse-agenda-v27] remaining Motion Agenda contexts',leftovers.map(x=>`${x}: ${context(motion,x)}`).join(' || '));throw new Error('[pulse-agenda-v27] Motion Journey still owns Agenda')}
await write('motion-journey-v1.js',motion);

let canonical=await read('patient-canonical-results.js');
const resultsV4=canonical.includes("const VERSION='4.0.0-motion-report'")&&canonical.includes('data-kresults-v4');
const docRenderStart=canonical.indexOf('function renderDocuments(result){');
const v4Next=canonical.indexOf('async function reportPayload(',docRenderStart);
const v2Next=canonical.indexOf('function connectedStatus(',docRenderStart);
const legacyNext=canonical.indexOf('async function render(force=false){',docRenderStart);
const candidates=[v4Next,v2Next,legacyNext].filter(i=>i>docRenderStart);
const docRenderEnd=candidates.length?Math.min(...candidates):-1;
if(docRenderStart<0||docRenderEnd<0)throw new Error('[pulse-agenda-v27] Canonical document renderer contract changed');
canonical=canonical.slice(0,docRenderStart)+canonical.slice(docRenderEnd);
const docCalls=["if(hash==='#documents')renderDocuments(result)","if(r==='documents')renderDocuments(result);","if(r==='documents')renderDocuments(result)","renderDocuments(result);"];
let removedDocCall=false;
for(const docCall of docCalls){if(canonical.includes(docCall)){canonical=canonical.replace(docCall,'');removedDocCall=true}}
if(canonical.includes('renderDocuments(result)')){canonical=canonical.replaceAll('renderDocuments(result)','void 0');removedDocCall=true}
if(!removedDocCall&&canonical.includes('renderDocuments(result)'))throw new Error('[pulse-agenda-v27] Canonical documents call contract changed');
canonical=canonical.replace("if(h==='#documents'&&!document.querySelector('[data-kcanon-doc]'))schedule(false)",'');
const canonicalLeftovers=['data-kcanon-doc','renderDocuments(result)'].filter(x=>canonical.includes(x));
if(canonicalLeftovers.length){console.error('[pulse-agenda-v27] remaining canonical Agenda contexts',canonicalLeftovers.map(x=>`${x}: ${context(canonical,x)}`).join(' || '));throw new Error('[pulse-agenda-v27] Canonical Results still renders into Agenda')}
if(resultsV4){
  for(const signature of ['4.0.0-motion-report','data-kresults-v4','RÉSULTAT MOTION','RÉSULTATS FONCTIONNELS','RÉSULTAT CLINICAL'])if(!canonical.includes(signature))throw new Error(`[pulse-agenda-v27] Results V4 damaged while retiring documents renderer: ${signature}`);
}else if(v2Next>0&&!canonical.includes('data-kresults-v2'))throw new Error('[pulse-agenda-v27] Results V2 was damaged while retiring document renderer');
await write('patient-canonical-results.js',canonical);

let html=await read('index.html');
const cleanTag=/\s*<script src="\.\/agenda-clean-room-v1\.js(?:\?[^\"]*)?"><\/script>/g;
if(!cleanTag.test(html))throw new Error('[pulse-agenda-v27] Agenda clean-room tag missing before retirement');
html=html.replace(cleanTag,'');
if(html.includes('agenda-clean-room-v1.js'))throw new Error('[pulse-agenda-v27] Agenda clean-room still loaded');
await write('index.html',html);

for(const file of ['agenda-clean-room-v1.js','patient-preparation-hub-v2.js']){
  await rm(root+file,{force:true});
}

const finalHtml=await read('index.html');
const direct=[...finalHtml.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)].map(x=>x[1]);
for(const retired of ['agenda-clean-room-v1.js','patient-motion-booking-v2.js','patient-preparation-hub-v2.js']){
  if(direct.includes(retired))throw new Error(`[pulse-agenda-v27] retired layer still direct: ${retired}`);
}
if(!direct.includes('agenda-hub-v4.js')||!direct.includes('agenda-premium-map-v1.js'))throw new Error('[pulse-agenda-v27] canonical Agenda owners missing');
console.log(`[pulse-agenda-v27] Agenda exclusive ownership locked · Motion/report document producers retired · Results ${resultsV4?'Motion Report v4':'sensor v3'} preserved · clean-room removed`);

await import('./pulse-runtime-mobile-bundle-v28.mjs');
