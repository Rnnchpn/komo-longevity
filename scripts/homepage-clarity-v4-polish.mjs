import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const site=join(root,'site');
const configs={
 en:{file:join(site,'index.html'),links:[['/case/','Case'],['/motion/','Motion'],['/clinical/','Clinical'],['/network/','Network'],['/en/media','Library'],['/partners/','Professionals'],['/science/','Science'],['/contact/','Contact']],old:'6 · Myodev · 2 tablets · tripod',neu:'6 Myodev sensors · 2 tablets · tripod'},
 fr:{file:join(site,'fr','index.html'),links:[['/fr/case/','Case'],['/fr/motion/','Motion'],['/fr/clinical/','Clinical'],['/fr/network/','Réseau'],['/media','Library'],['/fr/partners/','Professionnels'],['/fr/science/','Science'],['/fr/contact/','Contact']],old:'6 · Myodev · 2 tablets · tripod',neu:'6 capteurs Myodev · 2 tablettes · trépied'},
 es:{file:join(site,'es','index.html'),links:[['/es/case/','Case'],['/es/motion/','Motion'],['/es/clinical/','Clinical'],['/es/network/','Red'],['/es/media','Library'],['/es/partners/','Profesionales'],['/es/science/','Ciencia'],['/es/contact/','Contacto']],old:'6 · Myodev · 2 tablets · tripod',neu:'6 sensores Myodev · 2 tabletas · trípode'}
};
for(const [locale,c] of Object.entries(configs)){
 let html=await readFile(c.file,'utf8');
 html=html.replace(c.old,c.neu);
 const menu=`<details class="hp-mobile-menu"><summary>Menu</summary><nav>${c.links.map(x=>`<a href="${x[0]}">${x[1]}</a>`).join('')}</nav></details>`;
 html=html.replace(/<details class="hp-mobile-menu">[\s\S]*?<\/details>/,menu);
 await writeFile(c.file,html,'utf8');
 console.log(`[homepage-clarity-v4-polish] ${locale}`);
}
