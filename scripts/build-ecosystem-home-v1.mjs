import {mkdir,copyFile,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=process.cwd(),src=resolve(root,'src/ecosystem/home'),out=resolve(root,'site/home');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of ['index.html','ecosystem-home-v1.css','ecosystem-home-v1.js'])await copyFile(resolve(src,file),resolve(out,file));
console.log('[ecosystem-home-v1] built connected KŌMØ home');
