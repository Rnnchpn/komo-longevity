import {mkdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=process.cwd(),src=resolve(root,'src/card'),out=resolve(root,'site/card');
await mkdir(out,{recursive:true});
for(const file of ['index.html','card-v1.css','card-v1.js'])await copyFile(resolve(src,file),resolve(out,file));
console.log('[card-v1] built KŌMØ Card NFC route');
