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
const center=await patch('center-workspace-v1.js',[
["    if(route()!=='clinical')location.hash='clinical';","    if(route()!=='clinical')window.KomoPatientNavigation?.go?.('clinical');"],
["window.KomoCenterWorkspace={open:()=>{location.hash='clinical';setTimeout(openCenter,120)},activeCenter:()=>localStorage.getItem(CENTER_KEY)||''};","window.KomoCenterWorkspace={open:()=>{window.KomoPatientNavigation?.go?.('clinical');setTimeout(openCenter,120)},activeCenter:()=>localStorage.getItem(CENTER_KEY)||''};"]
]);
if(writer.test(center))throw new Error('[pulse-route-v22] Center Workspace still writes routes directly');
const admin=await patch('admin-shortcut-v1.js',[["function openAdmin(){if(location.hash!=='#admin')location.hash='admin';announceOpen();setTimeout(announceOpen,80);setTimeout(announceOpen,260)}","function openAdmin(){if(location.hash!=='#admin')window.KomoPatientNavigation?.go?.('admin');announceOpen();setTimeout(announceOpen,80);setTimeout(announceOpen,260)}"]]);
if(writer.test(admin))throw new Error('[pulse-route-v22] Admin shortcut still writes routes directly');
const booking=await patch('patient-motion-booking-v2.js',[["    if(location.hash!=='#documents')location.hash='documents';","    if(location.hash!=='#documents')window.KomoPatientNavigation?.go?.('documents');"]]);
const bookingCompact=booking.replace(/^\/\*[\s\S]*?\*\/\n/,'');await writeFile(root+'patient-motion-booking-v2.js',bookingCompact);
if(writer.test(bookingCompact))throw new Error('[pulse-route-v22] Patient Motion Booking still writes routes directly');
const trio=await patch('patient-assessment-trio-v1.js',[
["function goBooking(type){sessionStorage.setItem('komo_booking_service',type);location.hash='documents'}","function goBooking(type){sessionStorage.setItem('komo_booking_service',type);window.KomoPatientNavigation?.go?.('documents')}"],
["function goPrep(type){sessionStorage.setItem('komo_open_preparation',type);location.hash='documents'}","function goPrep(type){sessionStorage.setItem('komo_open_preparation',type);window.KomoPatientNavigation?.go?.('documents')}"]
]);
if(writer.test(trio))throw new Error('[pulse-route-v22] Assessment Trio still writes routes directly');
const files=(await readdir(root)).filter(x=>x.endsWith('.js')),texts=new Map();for(const f of files)texts.set(f,await readFile(root+f,'utf8'));
const html=await readFile(root+'index.html','utf8'),direct=[...html.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)].map(x=>x[1]);
const reachable=new Set(),q=[];for(const f of direct)if(texts.has(f)&&!reachable.has(f)){reachable.add(f);q.push(f)}
while(q.length){const t=texts.get(q.shift())||'';for(const m of t.matchAll(/(?:from\s*|import\s*)["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']|import\s*\(\s*["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']\s*\)/g)){const d=m[1]||m[2];if(texts.has(d)&&!reachable.has(d)){reachable.add(d);q.push(d)}}}
const actual=[...reachable].filter(f=>writer.test(texts.get(f)||'')).sort();
if(actual.length>23)throw new Error(`[pulse-route-v22] actual route writers regression ${actual.length}>23`);
console.log(`[pulse-route-v22] four non-owner route writers centralized · reachable actual route writers=${actual.length}`);
console.log('[pulse-route-v22] reachable actual writers '+(actual.join(', ')||'none'));
