import{readFile,writeFile,rm}from'node:fs/promises';

const root='site/pulse-v12/';
const htmlPath=root+'index.html';
const canonical='auth-login-canonical.js';
const presentation=['auth-premium-v3.js','auth-stability-v1.js','auth-web-v1.js'];
const files=[canonical,...presentation];
let html=await readFile(htmlPath,'utf8');
const entries=[];

for(const file of files){
  const re=new RegExp(`<script([^>]*)src=[\"']\\./${file.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?[^\"']*)?[\"']([^>]*)><\\/script>`,'g');
  const matches=[...html.matchAll(re)];
  if(matches.length!==1)throw new Error(`[pulse-auth-v34] expected one direct ${file} tag, found ${matches.length}`);
  entries.push({file,index:matches[0].index,tag:matches[0][0],source:await readFile(root+file,'utf8')});
}
entries.sort((a,b)=>a.index-b.index);
const anchor=entries.at(-1);
const bundle=entries.map(x=>x.source.trim()).join('\n');
for(const entry of entries)html=html.replace(entry.tag,entry===anchor?`<script src="./${canonical}?v=20260831-auth-runtime-v4"></script>`:'');
await writeFile(root+canonical,bundle,'utf8');
await writeFile(htmlPath,html,'utf8');
for(const file of presentation)await rm(root+file,{force:true});

const finalHtml=await readFile(htmlPath,'utf8');
const finalAuth=await readFile(root+canonical,'utf8');
for(const file of presentation)if(finalHtml.includes(file))throw new Error(`[pulse-auth-v34] retired Auth presentation layer remains: ${file}`);
if((finalHtml.match(new RegExp(canonical,'g'))||[]).length!==1)throw new Error('[pulse-auth-v34] canonical login runtime must load exactly once');
if(!finalHtml.includes('auth-gateway-v2.js'))throw new Error('[pulse-auth-v34] professional gateway must remain separate');
for(const signature of ['KomoCanonicalLogin','authPremiumV3','komoAuthBootstrap','authWebVersion'])if(!finalAuth.includes(signature))throw new Error(`[pulse-auth-v34] consolidated Auth behavior missing: ${signature}`);
console.log('[pulse-auth-v34] login + premium/stability/web presentation consolidated · professional gateway remains separate');
