import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'life-app');
for(const name of ['life-v1','life']){
  const target=join(root,'site',name);
  await rm(target,{recursive:true,force:true});
  await mkdir(target,{recursive:true});
  await cp(source,target,{recursive:true});
}
console.log('[life-v1] connected KŌMØ Life copied to /life/ and /life-v1/');

await import('./professional-contact-v1.mjs');
