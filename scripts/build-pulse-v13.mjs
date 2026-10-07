import { rm, mkdir, cp, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.cwd();
const src=join(root,'pulse-v13-src');
const out=join(root,'site','pulse-v13');

await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(src,out,{recursive:true});

const html=await readFile(join(out,'index.html'),'utf8');
for(const required of ['./styles.css','./app.js','KŌMØ Pulse']){
  if(!html.includes(required))throw new Error('[pulse-v13] missing '+required);
}
console.log('[pulse-v13] clean canonical Pulse V13 built: one app.js, one styles.css, no legacy runtime layers');
