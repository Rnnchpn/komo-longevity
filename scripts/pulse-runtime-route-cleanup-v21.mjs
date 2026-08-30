import{readFile,writeFile,readdir}from'node:fs/promises';
const root='site/pulse-v12/';
const writer=/location\.hash\s*=(?!=)|history\.(?:pushState|replaceState)\s*\(/;
async function patch(file,changes){const path=root+file;let s=await readFile(path,'utf8');for(const[a,b]of changes){if(s.includes(a))s=s.replace(a,b);else if(!s.includes(b))throw new Error(`[pulse-route-v21] ${file} contract changed`)}await writeFile(path,s);return s}
const sva=await patch('motion-sva-ui-v1.js',[["location.hash==='#clinical'","location.hash.slice(1)==='clinical'"]]);
if(writer.test(sva))throw new Error('[pulse-route-v21] motion SVA still classified as writer');
const muscle=await patch('muscle-analysis-v1.js',[["location.hash==='#clinical'","location.hash.slice(1)==='clinical'"]]);
if(writer.test(muscle))throw new Error('[pulse-route-v21] muscle analysis still classified as writer');
const progression=await patch('progression-v2.js',[["location.hash==='#path'","location.hash.slice(1)==='path'"]]);
if(writer.test(progression))throw new Error('[pulse-route-v21] progression still classified as writer');
const tests=await patch('patient-tests-scope-v2.js',[["section.querySelector('[data-find-motion]')?.addEventListener('click',()=>{location.hash='documents'});","section.querySelector('[data-find-motion]')?.addEventListener('click',()=>window.KomoPatientNavigation?.go?.('documents'));"]]);
if(writer.test(tests))throw new Error('[pulse-route-v21] patient tests scope still writes routes directly');
const key=await patch('my-komo-key-home-v1.js',[["fresh.querySelector('[data-key-open]')?.addEventListener('click',()=>{if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go('key');else location.hash='key'})","fresh.querySelector('[data-key-open]')?.addEventListener('click',()=>window.KomoPatientNavigation?.go?.('key'))"]]);
const compact=key.replace(/^\/\*[^\n]*\*\/\n/,'').replace("'use strict';\n",'');
await writeFile(root+'my-komo-key-home-v1.js',compact);
if(writer.test(compact))throw new Error('[pulse-route-v21] KEY Home still writes routes directly');
const files=(await readdir(root)).filter(x=>x.endsWith('.js')),texts=new Map();for(const f of files)texts.set(f,await readFile(root+f,'utf8'));
const html=await readFile(root+'index.html','utf8'),direct=[...html.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)].map(x=>x[1]);
const reachable=new Set(),q=[];for(const f of direct)if(texts.has(f)&&!reachable.has(f)){reachable.add(f);q.push(f)}
while(q.length){const t=texts.get(q.shift())||'';for(const m of t.matchAll(/(?:from\s*|import\s*)["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']|import\s*\(\s*["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']\s*\)/g)){const d=m[1]||m[2];if(texts.has(d)&&!reachable.has(d)){reachable.add(d);q.push(d)}}}
const actual=[...reachable].filter(f=>writer.test(texts.get(f)||'')).sort();
console.log(`[pulse-route-v21] five non-owner route writers retired · reachable actual route writers=${actual.length}`);
console.log('[pulse-route-v21] reachable actual writers '+(actual.join(', ')||'none'));
