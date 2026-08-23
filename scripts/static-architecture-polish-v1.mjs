import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');
const pages={
 fr:{home:join(site,'fr','index.html'),pro:join(site,'fr','partners','index.html'),pulse:join(site,'fr','pulse','index.html'),case:join(site,'fr','case','index.html'),base:'/fr',library:'/media',proLabel:'Professionnels',networkLabel:'Réseau'},
 en:{home:join(site,'index.html'),pro:join(site,'partners','index.html'),pulse:join(site,'pulse','index.html'),case:join(site,'case','index.html'),base:'',library:'/en/media',proLabel:'Professionals',networkLabel:'Network'},
 es:{home:join(site,'es','index.html'),pro:join(site,'es','partners','index.html'),pulse:join(site,'es','pulse','index.html'),case:join(site,'es','case','index.html'),base:'/es',library:'/es/media',proLabel:'Profesionales',networkLabel:'Red'}
};
async function load(path){try{return await readFile(path,'utf8')}catch{return null}}
async function save(path,h){await writeFile(path,h,'utf8')}

for(const [lang,c] of Object.entries(pages)){
  for(const path of [c.home,c.pro,c.pulse,c.case]){
    let h=await load(path); if(!h) continue;
    h=h.replaceAll(`${c.base}/motion/`,`${c.base}/partners/#motion`).replaceAll(`${c.base}/clinical/`,`${c.base}/partners/#clinical`);
    await save(path,h);
  }

  let h=await load(c.pro);
  if(h){
    if(lang==='fr'){
      h=h.replace('Un système.<br><em>Deux modèles.</em>','Un système.<br><em>Deux usages.</em>')
         .replace('02 · MEDICAL','02 · MÉDICAL')
         .replace('2 tablets','2 tablettes')
         .replace('>Tripod</strong>','>Inclus</strong>')
         .replace('KŌMØ Pulse · subscription','KŌMØ Pulse · abonnement');
    }else if(lang==='en') h=h.replace('One system.<br><em>Two models.</em>','One system.<br><em>Two uses.</em>');
    else h=h.replace('Un sistema.<br><em>Dos modelos.</em>','Un sistema.<br><em>Dos usos.</em>');
    await save(c.pro,h);
  }

  h=await load(c.pulse);
  if(h){
    if(lang==='fr') h=h.replaceAll('TRAJECTORY','TRAJECTOIRE');
    await save(c.pulse,h);
  }

  h=await load(c.case);
  if(h){
    const lead = lang==='fr'
      ? 'KŌMØ Case réunit six capteurs fournis par Myodev, deux tablettes et un trépied. Myocare fournit les données de l’analyse musculaire ; KŌMØ Pulse rassemble ensuite le bilan et son suivi.'
      : lang==='es'
        ? 'KŌMØ Case reúne seis sensores suministrados por Myodev, dos tabletas y un trípode. Myocare aporta los datos del análisis muscular; KŌMØ Pulse reúne después la evaluación y su seguimiento.'
        : 'KŌMØ Case combines six sensors supplied by Myodev, two tablets and a tripod. Myocare supplies the muscle-analysis data; KŌMØ Pulse then brings the full assessment and follow-up together.';
    h=h.replace(/<section class="hero"><div class="sh hg"><div>([\s\S]*?)<\/div><div><p class="lead">[\s\S]*?<\/p>/,m=>m.replace(/<p class="lead">[\s\S]*?<\/p>/,`<p class="lead">${lead}</p>`));
    const menu=`<details class="mobile"><summary>Menu</summary><nav><a href="${c.base}/case/">Case</a><a href="${c.base}/pulse/">Pulse</a><a href="${c.base}/partners/">${c.proLabel}</a><a href="${c.base}/network/">${c.networkLabel}</a><a href="${c.library}">Library</a></nav></details>`;
    h=h.replace(/<details class="mobile"><summary>Menu<\/summary><nav>[\s\S]*?<\/nav><\/details>/,menu);
    if(lang==='fr') h=h.replace('KŌMØ CASE · PRODUCT','KŌMØ CASE · PRODUIT');
    await save(c.case,h);
  }
}
console.log('[static-architecture-polish-v1] final navigation and French microcopy polish applied.');
