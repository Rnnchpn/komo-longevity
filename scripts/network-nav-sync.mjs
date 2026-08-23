import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const site=join(root,'site');
const locales={
 en:{base:'',network:'/network/',label:'Network',library:'/media'},
 fr:{base:'fr',network:'/fr/network/',label:'Réseau',library:'/media'},
 es:{base:'es',network:'/es/network/',label:'Red',library:'/media'}
};
for(const [locale,c] of Object.entries(locales)){
 const roots=[join(site,...(c.base?[c.base]:[]),'index.html'),...['case','motion','clinical','pulse'].map(p=>join(site,...(c.base?[c.base]:[]),p,'index.html'))];
 for(const file of roots){
  let h;try{h=await readFile(file,'utf8')}catch{continue}
  if(!h.includes(`href="${c.network}"`)){
    const marker=`<a href="${c.library}">Library</a>`;
    h=h.replace(marker,`<a href="${c.network}">${c.label}</a>${marker}`);
    h=h.replace(marker,`<a href="${c.network}">${c.label}</a>${marker}`);
    await writeFile(file,h,'utf8');
    console.log(`[network-nav] ${locale} ${file.replace(site,'')}`);
  }
 }
}
