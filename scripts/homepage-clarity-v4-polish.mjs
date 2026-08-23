import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const site=join(root,'site');
const configs={
 en:{file:join(site,'index.html'),links:[['/case/','Case'],['/motion/','Motion'],['/clinical/','Clinical'],['/network/','Network'],['/en/media','Library'],['/partners/','Professionals'],['/science/','Science'],['/contact/','Contact']],old:'6 · Myodev · 2 tablets · tripod',neu:'6 Myodev sensors · 2 tablets · tripod',orgDesc:'KŌMØ develops a system for measuring and following human mobility across the lifespan.'},
 fr:{file:join(site,'fr','index.html'),links:[['/fr/case/','Case'],['/fr/motion/','Motion'],['/fr/clinical/','Clinical'],['/fr/network/','Réseau'],['/media','Library'],['/fr/partners/','Professionnels'],['/fr/science/','Science'],['/fr/contact/','Contact']],old:'6 · Myodev · 2 tablets · tripod',neu:'6 capteurs Myodev · 2 tablettes · trépied',orgDesc:'KŌMØ développe un système de mesure et de suivi de la mobilité humaine dédié à la longévité locomotrice.'},
 es:{file:join(site,'es','index.html'),links:[['/es/case/','Case'],['/es/motion/','Motion'],['/es/clinical/','Clinical'],['/es/network/','Red'],['/es/media','Library'],['/es/partners/','Profesionales'],['/es/science/','Ciencia'],['/es/contact/','Contacto']],old:'6 · Myodev · 2 tablets · tripod',neu:'6 sensores Myodev · 2 tabletas · trípode',orgDesc:'KŌMØ desarrolla un sistema de medición y seguimiento de la movilidad humana dedicado a la longevidad locomotora.'}
};

const logoSafety=`<style>
/* KŌMØ hero wordmark — mobile safe area */
.hp-hero__brand{max-width:100%;}
@media(max-width:620px){
  .hp-hero__brand{font-size:clamp(56px,18.5vw,72px)!important;letter-spacing:-.075em!important;max-width:100%;}
  .hp-hero__brand span{font-size:clamp(34px,10.5vw,41px)!important;}
}
@media(max-width:380px){
  .hp-hero__brand{font-size:clamp(52px,17.5vw,62px)!important;}
  .hp-hero__brand span{font-size:34px!important;}
}
</style>`;

for(const [locale,c] of Object.entries(configs)){
 let html=await readFile(c.file,'utf8');
 html=html.replace(c.old,c.neu);
 const menu=`<details class="hp-mobile-menu"><summary>Menu</summary><nav>${c.links.map(x=>`<a href="${x[0]}">${x[1]}</a>`).join('')}</nav></details>`;
 html=html.replace(/<details class="hp-mobile-menu">[\s\S]*?<\/details>/,menu);
 html=html.replace(/<script type="application\/ld\+json" data-seo-growth="organization">[\s\S]*?<\/script>/g,'');
 const org={ '@context':'https://schema.org','@type':'Organization','@id':'https://komolongevity.com/#organization',name:'KŌMØ Longevity',url:'https://komolongevity.com/',email:'contact@komolongevity.com',description:c.orgDesc };
 const orgScript=`<script type="application/ld+json" data-seo-growth="organization">${JSON.stringify(org)}</script>`;
 html=html.replace('</head>',`${logoSafety}${orgScript}</head>`);
 await writeFile(c.file,html,'utf8');
 console.log(`[homepage-clarity-v4-polish] ${locale}`);
}
