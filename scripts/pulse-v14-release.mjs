// PULSE v14 — une seule étiquette de version pour tous les fichiers du front.
//   node scripts/pulse-v14-release.mjs <etiquette>   → applique l'étiquette à toutes les références locales
//   node scripts/pulse-v14-release.mjs --check       → contrôle de build : étiquette unique, aucune
//                                                      référence cassée, aucun fichier orphelin.
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, relative, dirname, posix } from 'node:path';

const root=join(process.cwd(),'pulse-v14-src');
const ENTRIES=['index.html','camera/index.html','commencer/index.html','manifest.webmanifest','camera/manifest.webmanifest'];
const TEXT=/\.(html|js|mjs|css|webmanifest)$/;
const REF=/(["'`(])((?:\.\.?\/)[A-Za-z0-9_./-]+\.(?:m?js|css|svg|webmanifest|png|webp|jpg))(?:\?v=[A-Za-z0-9_.-]+)?(?=["'`)])/g;

async function walk(dir){
 const out=[];
 for(const name of await readdir(dir)){
  const p=join(dir,name);
  if((await stat(p)).isDirectory())out.push(...await walk(p));else out.push(p);
 }
 return out;
}
const files=(await walk(root)).map(p=>relative(root,p).split('\\').join('/'));
const fileSet=new Set(files);
const textFiles=files.filter(f=>TEXT.test(f));

const arg=process.argv[2];
if(arg&&arg!=='--check'){
 if(!/^[0-9]{8}-[a-z0-9-]+$/.test(arg))throw new Error('étiquette attendue : AAAAMMJJ-libelle');
 let changed=0;
 for(const f of textFiles){
  if(f.endsWith('.webmanifest')||f.endsWith('.css'))continue;
  const p=join(root,f),src=await readFile(p,'utf8');
  const next=src.replace(REF,(m,q,ref)=>/\.(png|webp|jpg|svg|webmanifest)$/.test(ref)?m:q+ref+'?v='+arg);
  if(next!==src){await writeFile(p,next);changed++;}
 }
 console.log('[pulse-v14-release] étiquette '+arg+' appliquée à '+changed+' fichier(s)');
 process.exit(0);
}

// --check
const tags=new Set(),broken=[],graph=new Map();
for(const f of textFiles){
 const src=await readFile(join(root,f),'utf8');
 const refs=new Set();
 for(const m of src.matchAll(new RegExp(REF.source,'g'))){
  const ref=m[2];
  const resolved=posix.normalize(posix.join(posix.dirname(f),ref));
  if(!fileSet.has(resolved)){broken.push(f+' → '+ref);continue;}
  refs.add(resolved);
  const full=m[0];const tag=/\?v=([A-Za-z0-9_.-]+)/.exec(src.slice(m.index,m.index+full.length+80))?.[1];
  if(/\.(m?js|css)$/.test(ref)&&!f.endsWith('.css'))tags.add(tag||'(sans étiquette)');
 }
 graph.set(f,refs);
}
const seen=new Set(),stack=ENTRIES.filter(e=>fileSet.has(e));
while(stack.length){const f=stack.pop();if(seen.has(f))continue;seen.add(f);for(const r of graph.get(f)||[])stack.push(r);}
const orphans=files.filter(f=>!seen.has(f));
const errors=[];
if(broken.length)errors.push('références cassées : '+broken.join(', '));
if(tags.size!==1)errors.push('étiquettes multiples : '+[...tags].join(', '));
if(orphans.length)errors.push('fichiers orphelins (non chargés) : '+orphans.join(', '));
if(errors.length){console.error('[pulse-v14-release] ÉCHEC\n - '+errors.join('\n - '));process.exit(1);}
console.log('[pulse-v14-release] PASS · étiquette '+[...tags][0]+' · '+seen.size+' fichiers chargés · 0 orphelin · 0 référence cassée');
