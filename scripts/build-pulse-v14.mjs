import { rm, mkdir, cp, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.cwd();
const src=join(root,'pulse-v14-src');
const out=join(root,'site','pulse-v14');

await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(src,out,{recursive:true});
// Carry over the existing KŌMØ Mediterranean photography for the patient welcome.
await mkdir(join(out,'assets'),{recursive:true});
await cp(join(root,'src','assets','images','hero-mediterranean-motion-v1.webp'),join(out,'assets','hero-mediterranean-motion-v1.webp'));


const html=await readFile(join(out,'index.html'),'utf8');
const app=await readFile(join(out,'app.js'),'utf8');
for(const required of ['./styles.css','./app.js','Votre santé en mouvement']){
  if(!html.includes(required))throw new Error('[pulse-v14] missing '+required);
}
if(/myodev|myocare/i.test(app))throw new Error('[pulse-v14] legacy Myodev/Myocare reference detected');
if(!app.includes("motion-v1.0"))throw new Error('[pulse-v14] Motion v1.0 binding missing');
if(!app.includes("['mykomo','My KŌMØ']")||!app.includes('async function questionnaires()'))throw new Error('[pulse-v14] patient home / questionnaire route missing');
console.log('[pulse-v14] patient-first Pulse built, with welcome photography');
