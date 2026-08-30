import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const sources=['my-komo-score-motion-v1.js','my-komo-dashboard-v2.js'];
const bundle='my-komo-visual-runtime-v3.js';
let html=await readFile(htmlPath,'utf8');
const entries=[];

for(const file of sources){
  const re=new RegExp(`<script([^>]*)src=["']\\./${file.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?[^"']*)?["']([^>]*)><\\/script>`,'g');
  const matches=[...html.matchAll(re)];
  if(matches.length!==1)throw new Error(`[pulse-mykomo-v29] expected one direct ${file} tag, found ${matches.length}`);
  let source=await readFile(root+file,'utf8');
  const before=(source.match(/setInterval\s*\(/g)||[]).length;
  if(before!==1)throw new Error(`[pulse-mykomo-v29] expected one polling interval in ${file}, found ${before}`);
  if(file==='my-komo-score-motion-v1.js'){
    const target="setInterval(()=>{if((location.hash.replace(/^#/,'')||'home')==='home')guardVisible()},3500);";
    if(!source.includes(target))throw new Error('[pulse-mykomo-v29] score polling contract changed');
    source=source.replace(target,'');
  }else{
    const target="setInterval(()=>{if(route()==='home')run()},5000);";
    if(!source.includes(target))throw new Error('[pulse-mykomo-v29] dashboard polling contract changed');
    source=source.replace(target,'');
  }
  if(source.includes('setInterval('))throw new Error(`[pulse-mykomo-v29] persistent polling remains in ${file}`);
  entries.push({file,index:matches[0].index,tag:matches[0][0],source});
}

entries.sort((a,b)=>a.index-b.index);
const anchor=entries.at(-1);
const body=entries.map(({source})=>source.trim()).join('\n');
await writeFile(root+bundle,body,'utf8');
for(const entry of entries)html=html.replace(entry.tag,entry===anchor?`<script src="./${bundle}?v=20260831-mykomo-visual-v3"></script>`:'');
await writeFile(htmlPath,html,'utf8');
for(const {file} of entries)await rm(root+file,{force:true});

const finalHtml=await readFile(htmlPath,'utf8');
for(const file of sources)if(finalHtml.includes(file))throw new Error(`[pulse-mykomo-v29] retired visual layer remains direct: ${file}`);
if((finalHtml.match(new RegExp(bundle,'g'))||[]).length!==1)throw new Error('[pulse-mykomo-v29] visual bundle must be loaded exactly once');
const finalBundle=await readFile(root+bundle,'utf8');
for(const signature of ['komoAnimated','mykomo-command-strip','KomoHomeDashboardV2'])if(!finalBundle.includes(signature))throw new Error(`[pulse-mykomo-v29] visual behavior missing: ${signature}`);
if(finalBundle.includes('setInterval('))throw new Error('[pulse-mykomo-v29] My KŌMØ visual polling was not fully retired');
console.log('[pulse-mykomo-v29] two My KŌMØ visual overlays bundled · persistent polling retired · event-driven behavior preserved');
