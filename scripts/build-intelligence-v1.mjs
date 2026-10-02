import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root=process.cwd(),source=resolve(root,'src/intelligence'),out=resolve(root,'site/intelligence');
await mkdir(out,{recursive:true});
for(const file of ['index.html','world-members-admin-v1.js'])await copyFile(resolve(source,file),resolve(out,file));
console.log('[intelligence-v1] built KŌMØ Intelligence Service + member administration');
