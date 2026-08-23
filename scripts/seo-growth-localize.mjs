import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));const site=join(root,'site');
const maps={
 fr:{dir:'fr',r:[['Portable system','Système portable'],['Measurement','Mesure'],['Clinical','Clinique'],['Follow-up','Suivi'],['Network','Réseau'],['Knowledge','Connaissance'],['Deploy','Déployer']]},
 es:{dir:'es',r:[['Portable system','Sistema portátil'],['Measurement','Medición'],['Clinical','Clínico'],['Follow-up','Seguimiento'],['Network','Red'],['Knowledge','Conocimiento'],['Deploy','Despliegue']]}
};
async function walk(dir,out=[]){for(const e of await (await import('node:fs/promises')).readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())await walk(p,out);else if(e.isFile()&&e.name==='index.html')out.push(p)}return out}
for(const {dir,r} of Object.values(maps)){
  let files=[];try{files=await walk(join(site,dir))}catch{continue}
  for(const f of files){let h=await readFile(f,'utf8');if(!h.includes('seo-discovery'))continue;for(const [a,b] of r)h=h.replaceAll(`· ${a}</small>`,`· ${b}</small>`);await writeFile(f,h,'utf8')}
}
console.log('[seo-growth-localize] discovery labels localized');
