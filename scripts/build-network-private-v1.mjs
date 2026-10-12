import {mkdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const dir=resolve(process.cwd(),'site/Network');
await mkdir(dir,{recursive:true});
await copyFile(resolve(process.cwd(),'src/network-private/index.html'),resolve(dir,'index.html'));
console.log('[network-private] KŌMØ Network internal workspace copied');
