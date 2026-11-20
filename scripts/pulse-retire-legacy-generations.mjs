// 21/11/2026 — une seule PULSE en production : pulse.komolongevity.com (site/pulse-v14).
// Les générations v12 (ancienne application) et v13 restent des étapes intermédiaires de la
// chaîne de build (des passes publiques en dépendent encore), mais ne sont plus publiées :
// leurs dossiers sont supprimés de la sortie et vercel.json redirige leurs URL vers PULSE.
import { rm, readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root=process.cwd(),site=join(root,'site');
const LEGACY=['pulse-v12','pulse-v13'];
for(const dir of LEGACY)await rm(join(site,dir),{recursive:true,force:true});

async function walk(dir){
 const out=[];
 for(const name of await readdir(dir)){
  const p=join(dir,name);
  if((await stat(p)).isDirectory())out.push(...await walk(p));else out.push(p);
 }
 return out;
}
const links=[];
for(const p of await walk(site)){
 if(!/\.(html|js|mjs|css|xml|json)$/.test(p))continue;
 const text=await readFile(p,'utf8');
 if(/\/pulse-v1[23]\//.test(text))links.push(relative(root,p));
}
if(links.length)throw new Error('[pulse-retire-legacy] liens restants vers une ancienne PULSE : '+links.slice(0,10).join(', '));
const vercel=JSON.parse(await readFile(join(root,'vercel.json'),'utf8'));
for(const dir of LEGACY){
 const ok=(vercel.redirects||[]).some(r=>r.source==='/'+dir+'/:path*'&&r.destination==='https://pulse.komolongevity.com/');
 if(!ok)throw new Error('[pulse-retire-legacy] redirection manquante pour /'+dir+'/');
}
console.log('[pulse-retire-legacy] PASS · '+LEGACY.join(', ')+' non publiées · redirigées vers pulse.komolongevity.com');
