// PULSE v14 — contrôle de standardisation (21/11/2026).
// 1. Le protocole KŌMØ Motion n'existe qu'une fois (source + copie serveur générée, identiques).
// 2. Une seule étiquette de version, aucun fichier orphelin, aucune référence cassée.
// 3. Aucune trace de l'offre Motion Online retirée dans l'application servie.
import { spawnSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root=process.cwd();
for(const args of [['scripts/motion-protocol-sync.mjs','--check'],['scripts/pulse-v14-release.mjs','--check']]){
 const run=spawnSync(process.execPath,args,{stdio:'inherit'});
 if(run.status!==0)process.exit(run.status??1);
}
async function walk(dir){
 const out=[];
 for(const name of await readdir(dir)){
  const p=join(dir,name);
  if((await stat(p)).isDirectory())out.push(...await walk(p));else out.push(p);
 }
 return out;
}
const built=join(root,'site','pulse-v14');
const forbidden=[/Motion Online/,/39\s?€/,/bilan-en-ligne/,/\/online\/(session|activate|stripe)/,/motion-online-(guest|dossier|operator|stripe)/,/motion_online_sessions/];
const hits=[];
for(const p of await walk(built)){
 if(!/\.(html|js|mjs|css|webmanifest)$/.test(p))continue;
 const text=await readFile(p,'utf8');
 for(const re of forbidden)if(re.test(text))hits.push(relative(root,p)+' : '+re);
}
if(hits.length){console.error('[pulse-v14-standard] offre Online encore présente :\n - '+hits.join('\n - '));process.exit(1);}
// Le serveur ne redéfinit pas le protocole : il le lit dans protocol.ts.
const edge=await readFile(join(root,'supabase/functions/motion-live-test/index.ts'),'utf8');
if(!edge.includes('import { SPEC } from "./protocol.ts"')||/const STEPS=\[/.test(edge))
 throw new Error('[pulse-v14-standard] motion-live-test doit lire le protocole depuis protocol.ts');
for(const consumer of ['app.js','motion-live-operator-consult-v1.js','motion-live-clinic-passport-v2.mjs']){
 const text=await readFile(join(built,consumer),'utf8');
 if(!text.includes('./motion-protocol.mjs'))throw new Error('[pulse-v14-standard] '+consumer+' doit lire motion-protocol.mjs');
}
console.log('[pulse-v14-standard] PASS · protocole unique · version unique · aucune trace Online');
