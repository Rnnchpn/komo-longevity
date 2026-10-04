import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const src=join(root,'src','experiences-gstaad');
const out=join(root,'site','Experiences');
await mkdir(out,{recursive:true});
await cp(src,out,{recursive:true});
console.log('[experience-gstaad] /Experiences/ copied to production output');