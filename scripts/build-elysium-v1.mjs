import { mkdir, copyFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const source = join(process.cwd(),'src','elysium','index.html');
const target = join(process.cwd(),'site','elysium','index.html');

const html = await readFile(source,'utf8');
const required = [
  'KŌMØ ELYSIUM','KŌMØ Longevity','KŌMØ Aesthetic',
  'KŌMØ IV Drip','KŌMØ Cosmetic & Supplements','KŌMØ Life',
  'KŌMØ Gastronomy','KŌMØ High Luxury','KŌMØ Service','KŌMØ Team',
  '/api/elysium-request'
];
for (const item of required) {
  if (!html.includes(item)) throw new Error('ELYSlUM missing: '+item);
}
await mkdir(join(process.cwd(),'site','elysium'),{recursive:true});
await copyFile(source,target);
console.log('[elysium] private collection published at /elysium/ ('+html.length+' bytes)');
