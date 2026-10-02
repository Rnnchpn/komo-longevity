import { mkdir, copyFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root=process.cwd();
const source=resolve(root,'src/world');
const out=resolve(root,'site/world');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});

for(const file of ['index.html','world-one-v1.css','world-one-v1.js','world-ecosystem-v1.css','world-ecosystem-v1.js','komo-world-auth-v1.js']){
  await copyFile(resolve(source,file),resolve(out,file));
}

await copyFile(
  resolve(root,'node_modules/@supabase/supabase-js/dist/umd/supabase.js'),
  resolve(out,'supabase-umd-v1.js')
);

console.log('[world-map-v1] built KŌMØ World · PUBLIC / ONE / ECHELON');
