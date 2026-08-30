import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const command='patient-home-command-v1.js';
const home='my-komo-home-v1.js';
const micro='patient-home-micro-motion-v1.js';
const key='my-komo-key-home-v1.js';
const hero='pulse-home-hero-polish-v2.js';
let commandSource=await readFile(root+command,'utf8');
let homeSource=await readFile(root+home,'utf8');
let microSource=await readFile(root+micro,'utf8');
let keySource=await readFile(root+key,'utf8');
let heroSource=await readFile(root+hero,'utf8');
let html=await readFile(htmlPath,'utf8');

const commandTail="home.appendChild(wall);bind(wall);lastSignature=signature;";
if(!commandSource.includes(commandTail))throw new Error('[pulse-home-v35] Home command render contract changed');
commandSource=commandSource.replace(commandTail,`${commandTail}window.dispatchEvent(new CustomEvent('komo:home-command-rendered'));`);

const microObserver=/new MutationObserver\(\(\)=>\{if\(\(location\.hash\.replace\(\/\^#\/,''\)\|\|'home'\)==='home'\)schedule\(\)\}\)\.observe\((?:document\.body|document\.querySelector\('#viewRoot'\)),\{childList:true,subtree:true\}\);/;
if(!microObserver.test(microSource))throw new Error('[pulse-home-v35] Home micro-motion observer contract changed');
microSource=microSource.replace(microObserver,"window.addEventListener('komo:home-command-rendered',schedule);");
if(microSource.includes('new MutationObserver('))throw new Error('[pulse-home-v35] Home micro-motion observer remains');

const heroObserver=/new MutationObserver\(\(\)=>schedule\(false\)\)\.observe\((?:document\.body|document\.querySelector\('#appShell'\)),\{childList:true,subtree:true\}\);/;
if(!heroObserver.test(heroSource))throw new Error('[pulse-home-v35] Home hero observer contract changed');
heroSource=heroSource.replace(heroObserver,"window.addEventListener('komo:home-rendered',()=>schedule(false));");
if(heroSource.includes('new MutationObserver('))throw new Error('[pulse-home-v35] Home hero observer remains');

const keyEvents="['hashchange','komo:route-ready','komo:data-ready','komo:wearable-data-updated'].forEach(e=>addEventListener(e,()=>schedule()));";
if(!keySource.includes(keyEvents))throw new Error('[pulse-home-v35] KEY Home event contract changed');
keySource=keySource.replace(keyEvents,`${keyEvents}window.addEventListener('komo:home-rendered',()=>schedule(0));`);

await writeFile(root+command,`${commandSource.trim()}\n${microSource.trim()}`,'utf8');
await writeFile(root+home,`${homeSource.trim()}\n${keySource.trim()}\n${heroSource.trim()}`,'utf8');

for(const file of [micro,key,hero]){
  const re=new RegExp(`\\s*<script([^>]*)src=[\"']\\./${file.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?[^\"']*)?[\"']([^>]*)><\\/script>`,'g');
  const matches=[...html.matchAll(re)];
  if(matches.length!==1)throw new Error(`[pulse-home-v35] expected one direct ${file} tag, found ${matches.length}`);
  html=html.replace(re,'');
}
await writeFile(htmlPath,html,'utf8');
for(const file of [micro,key,hero])await rm(root+file,{force:true});

const finalHtml=await readFile(htmlPath,'utf8');
const finalCommand=await readFile(root+command,'utf8');
const finalHome=await readFile(root+home,'utf8');
for(const file of [micro,key,hero])if(finalHtml.includes(file))throw new Error(`[pulse-home-v35] retired Home extension remains direct: ${file}`);
for(const signature of ['komo:home-command-rendered','KomoHomeMicroMotion'])if(!finalCommand.includes(signature))throw new Error(`[pulse-home-v35] Home command extension missing: ${signature}`);
for(const signature of ['KomoKeyHome','KomoPulseHeroPolish','komo:home-rendered'])if(!finalHome.includes(signature))throw new Error(`[pulse-home-v35] canonical Home extension missing: ${signature}`);
console.log('[pulse-home-v35] KEY + micro-motion + hero polish consolidated into canonical Home runtimes · two presentation observers retired');
await import('./pulse-runtime-mobile-observer-v36.mjs');
