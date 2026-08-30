import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const sources=['mobile-v1.js','mobile-guided-v2.js','mobile-vertical-app-v1.js'];
const bundle='mobile-runtime-v3.js';
const htmlPath=root+'index.html';
let html=await readFile(htmlPath,'utf8');

const entries=[];
for(const file of sources){
  const re=new RegExp(`<script([^>]*)src=["']\\./${file.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?[^"']*)?["']([^>]*)><\\/script>`,'g');
  const matches=[...html.matchAll(re)];
  if(matches.length!==1)throw new Error(`[pulse-mobile-v28] expected one direct ${file} tag, found ${matches.length}`);
  entries.push({file,index:matches[0].index,tag:matches[0][0],source:await readFile(root+file,'utf8')});
}

entries.sort((a,b)=>a.index-b.index);
const anchor=entries.at(-1);
const body=entries.map(({source})=>source.trim()).join('\n');
await writeFile(root+bundle,body,'utf8');

for(const entry of entries){
  html=html.replace(entry.tag,entry===anchor?`<script src="./${bundle}?v=20260831-mobile-runtime-v3"></script>`:'');
}
await writeFile(htmlPath,html,'utf8');
for(const {file} of entries)await rm(root+file,{force:true});

const finalHtml=await readFile(htmlPath,'utf8');
for(const file of sources)if(finalHtml.includes(file))throw new Error(`[pulse-mobile-v28] retired direct mobile layer remains: ${file}`);
if((finalHtml.match(new RegExp(bundle,'g'))||[]).length!==1)throw new Error('[pulse-mobile-v28] consolidated mobile runtime must be loaded exactly once');
const finalBundle=await readFile(root+bundle,'utf8');
for(const signature of ['mobile-test-cta','mobileSurface','kamo-phone-app'])if(!finalBundle.includes(signature))throw new Error(`[pulse-mobile-v28] bundled behavior missing: ${signature}`);
console.log('[pulse-mobile-v28] three auxiliary mobile runtimes bundled into one · behavior preserved without separator overhead');

await import('./pulse-runtime-mykomo-visual-v29.mjs');
