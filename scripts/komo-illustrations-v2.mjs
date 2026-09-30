import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root=process.cwd();
const site=join(root,'site');
const sources=join(root,'src/assets/site2026/generated-v2'); // legacy source kept for compatibility; binary image assets now live in src/assets/images.

async function decode(name,out){
  const src=join(sources,name+'.b64');
  try{await access(src)}catch{return}
  const raw=(await readFile(src,'utf8')).replace(/\s+/g,'');
  const fp=join(site,'assets/images',out);
  await mkdir(dirname(fp),{recursive:true});
  await writeFile(fp,Buffer.from(raw,'base64'));
}


async function patch(rel,fn){
  const fp=join(site,rel);
  try{await access(fp)}catch{return}
  let html=await readFile(fp,'utf8');
  html=fn(html);
  await writeFile(fp,html,'utf8');
}

const homeFiles=['index.html','fr/index.html'];
for(const rel of homeFiles){
  await patch(rel,html=>{
    html=html
      .replace(/(<figure class="kpv-hero-media"><img src=")[^"]+(" alt=")[^"]*(" fetchpriority="high"><\/figure>)/,
        '$1/assets/images/komo-longevity-v3.webp$2KŌMØ Longevity, environnement de consultation et d’évaluation fonctionnelle sur la Côte d’Azur$3')
      .replaceAll('/assets/site2026/generated/komo-clinical-premium.webp','/assets/images/komo-clinical-v3.webp')
      .replaceAll('/assets/images/komo-clinical-premium.webp','/assets/images/komo-clinical-v3.webp');
    return html;
  });
}

for(const rel of ['fr/motion/index.html','motion/index.html','es/motion/index.html']){
  await patch(rel,html=>html.replace(
    /(<figure class="kpv-hero-media"><img src=")[^"]+(" alt=")[^"]*(" fetchpriority="high"><\/figure>)/,
    '$1/assets/images/komo-motion-v3.webp$2Évaluation KŌMØ Motion avec analyse de la marche, de la posture et de l’activité musculaire$3'
  ));
}

for(const rel of ['fr/clinical/index.html','clinical/index.html','es/clinical/index.html']){
  await patch(rel,html=>html
    .replaceAll('/assets/site2026/generated/komo-clinical-premium.webp','/assets/images/komo-clinical-v3.webp')
    .replaceAll('/assets/images/komo-clinical-premium.webp','/assets/images/komo-clinical-v3.webp')
    .replace(/alt="KŌMØ Clinical dans un environnement privé"/g,'alt="Consultation KŌMØ Clinical avec restitution intégrée des données fonctionnelles et biologiques"')
  );
}

for(const rel of ['fr/a-propos/index.html','about/index.html','es/sobre/index.html']){
  await patch(rel,html=>{
    if(html.includes('komo-longevity-v3.webp')) return html;
    return html.replace(/(<section class="kt-pagehero">[\s\S]*?<\/section>)/,
      '$1<section class="kpv-wide-media"><img src="/assets/images/komo-longevity-v3.webp" alt="KŌMØ Longevity, environnement de consultation et de mesure" loading="lazy"></section>');
  });
}

console.log('[komo-illustrations-v2] PASS · first visual wave integrated: Longevity + Motion + Clinical.');
