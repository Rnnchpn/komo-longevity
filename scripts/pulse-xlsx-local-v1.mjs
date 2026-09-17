import { copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';

const pulseRoot='site/pulse-v12';
const umdName='xlsx-umd-v1.js';
const esmName='xlsx-local-v1.js';
const umdSource='node_modules/xlsx/dist/xlsx.full.min.js';
const umdOutput=join(pulseRoot,umdName);
const esmOutput=join(pulseRoot,esmName);
const remote=/https:\/\/esm\.sh\/xlsx@0\.18\.5/g;

await copyFile(umdSource,umdOutput);
await writeFile(
  esmOutput,
  `const api=globalThis.XLSX;
if(!api?.read||!api?.utils)throw new Error('KŌMØ Pulse: XLSX browser bundle unavailable.');
export const read=api.read.bind(api);
export const utils=api.utils;
export default api;
`,
  'utf8'
);

let patched=0;
async function walk(dir){
  for(const item of await readdir(dir,{withFileTypes:true})){
    const file=join(dir,item.name);
    if(item.isDirectory()){await walk(file);continue}
    if(!item.isFile()||!file.endsWith('.js')||file===esmOutput||file===umdOutput)continue;
    const source=await readFile(file,'utf8');
    remote.lastIndex=0;
    if(!remote.test(source)){remote.lastIndex=0;continue}
    remote.lastIndex=0;
    let local=relative(dirname(file),esmOutput).split(sep).join('/');
    if(!local.startsWith('.'))local='./'+local;
    const next=source.replace(remote,local);
    remote.lastIndex=0;
    await writeFile(file,next,'utf8');
    patched++;
  }
}
await walk(pulseRoot);

const htmlPath=join(pulseRoot,'index.html');
let html=await readFile(htmlPath,'utf8');
if(!html.includes(`src="./${umdName}`)){
  const marker='</head>';
  if(!html.includes(marker))throw new Error('[pulse-xlsx-local] </head> marker missing');
  html=html.replace(marker,`  <script src="./${umdName}" data-komo-xlsx-local></script>\n</head>`);
}
await writeFile(htmlPath,html,'utf8');

const leftovers=[];
async function audit(dir){
  for(const item of await readdir(dir,{withFileTypes:true})){
    const file=join(dir,item.name);
    if(item.isDirectory()){await audit(file);continue}
    if(!item.isFile()||!file.endsWith('.js')||file===umdOutput)continue;
    const source=await readFile(file,'utf8');
    if(source.includes('https://esm.sh/xlsx@0.18.5'))leftovers.push(file);
  }
}
await audit(pulseRoot);
if(leftovers.length)throw new Error('[pulse-xlsx-local] remote XLSX imports remain: '+leftovers.join(', '));

console.log('[pulse-xlsx-local] PASS · local XLSX bundle installed · modules patched:',patched);
