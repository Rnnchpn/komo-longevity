import { build } from 'vite';
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';

const pulseRoot='site/pulse-v12';
const outputName='supabase-local-v1.js';
const outputFile=join(pulseRoot,outputName);
const remote=/https:\/\/esm\.sh\/@supabase\/supabase-js@2\.57\.4/g;

const temp=await mkdtemp(join(tmpdir(),'komo-supabase-'));
const entry=join(temp,'entry.mjs');
await writeFile(entry,"export { createClient } from '@supabase/supabase-js';\n",'utf8');

try{
  await build({
    configFile:false,
    logLevel:'warn',
    build:{
      target:'es2018',
      minify:true,
      sourcemap:false,
      emptyOutDir:false,
      outDir:pulseRoot,
      lib:{
        entry,
        formats:['es'],
        fileName:()=>outputName
      }
    }
  });
}finally{
  await rm(temp,{recursive:true,force:true});
}

let patched=0;
async function walk(dir){
  for(const item of await readdir(dir,{withFileTypes:true})){
    const file=join(dir,item.name);
    if(item.isDirectory()){await walk(file);continue}
    if(!item.isFile()||!file.endsWith('.js')||file===outputFile)continue;
    const source=await readFile(file,'utf8');
    if(!remote.test(source)){remote.lastIndex=0;continue}
    remote.lastIndex=0;
    let local=relative(dirname(file),outputFile).split(sep).join('/');
    if(!local.startsWith('.'))local='./'+local;
    const next=source.replace(remote,local);
    remote.lastIndex=0;
    await writeFile(file,next,'utf8');
    patched++;
  }
}
await walk(pulseRoot);

let leftovers=[];
async function audit(dir){
  for(const item of await readdir(dir,{withFileTypes:true})){
    const file=join(dir,item.name);
    if(item.isDirectory()){await audit(file);continue}
    if(!item.isFile()||!file.endsWith('.js')||file===outputFile)continue;
    const source=await readFile(file,'utf8');
    if(source.includes('https://esm.sh/@supabase/supabase-js@2.57.4'))leftovers.push(file);
  }
}
await audit(pulseRoot);
if(leftovers.length)throw new Error('[pulse-supabase-local] remote Supabase imports remain: '+leftovers.join(', '));

console.log('[pulse-supabase-local] PASS · local Supabase bundle generated · modules patched:',patched);
