import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const paths={booking:join(pulse,'booking-layer-v1.js'),map:join(pulse,'booking-directory-map-v1.js'),cockpit:join(pulse,'clinical-cockpit-v1.js'),centerHub:join(pulse,'center-hub-v1.js'),centerContext:join(pulse,'center-context-v1.js'),pro:join(pulse,'pro-architecture-v2.js'),html:join(pulse,'index.html')};
const files={};for(const [k,p] of Object.entries(paths))files[k]=await readFile(p,'utf8');

let booking=files.booking;
if(!booking.includes('const mapKeep=root.querySelector')){
  booking=booking.replace("const root=document.querySelector('#viewRoot');if(!root)return;const c=","const root=document.querySelector('#viewRoot');if(!root)return;const mapKeep=root.querySelector('[data-kbd-shell][data-kbd-mounted=\"1\"]');const c=");
  booking=booking.replace('</section></div>`;bindPatient()}','</section></div>`;if(mapKeep){const nextMap=root.querySelector(\'[data-kbd-shell]\');if(nextMap)nextMap.replaceWith(mapKeep);window.dispatchEvent(new CustomEvent(\'komo:booking-map-restored\'))}bindPatient()}');
}
if(!booking.includes('const mapKeep=root.querySelector'))throw new Error('[pro-stability] booking map persistence patch failed');await writeFile(paths.booking,booking);

let map=files.map;
if(!map.includes('Promise.allSettled(tasks)'))map=map.replace(/async function directory\(\)\{.*?\}\nasync function leaflet/s,`async function directory(){
  if(S.directory)return S.directory;if(S.promise)return S.promise;
  S.promise=(async()=>{const q=await sb().rpc('komo_booking_directory');if(q.error)throw q.error;S.directory=q.data||{centers:[],professionals:[]};const seen=new Set(),tasks=[];for(const x of items()){const query=locationQuery(x);if(!query||seen.has(query))continue;seen.add(query);tasks.push(geocode(query))}Promise.allSettled(tasks).then(()=>{const shell=document.querySelector('[data-kbd-shell][data-kbd-mounted="1"]');if(shell&&location.hash.replace(/^#/,'')==='documents'){renderList(shell);renderMap(shell).catch(()=>{})}});return S.directory})().finally(()=>S.promise=null);return S.promise
}
async function leaflet`);
if(!map.includes('window.KomoBookingDirectoryMap'))map=map.replace('function schedule(){clearTimeout(mountTimer);mountTimer=setTimeout(()=>mount().catch(console.error),30)}',`function refreshMountedMap(){const shell=document.querySelector('[data-kbd-shell][data-kbd-mounted="1"]');if(!shell)return;renderList(shell);renderMap(shell).catch(()=>{})}
window.KomoBookingDirectoryMap={mount,refresh:refreshMountedMap,invalidate(){setTimeout(()=>S.map?.invalidateSize?.(),40)}};
window.addEventListener('komo:booking-map-restored',()=>{window.KomoBookingDirectoryMap.invalidate();refreshMountedMap()});
function schedule(){clearTimeout(mountTimer);mountTimer=setTimeout(()=>mount().catch(console.error),30)}`);
if(!map.includes('Promise.allSettled(tasks)')||!map.includes('window.KomoBookingDirectoryMap'))throw new Error('[pro-stability] nonblocking map patch failed');await writeFile(paths.map,map);

let cockpit=files.cockpit;
cockpit=cockpit.replace("function sb(){if(!s.client)s.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return s.client}","function sb(){return window.KomoRuntime?.client||(s.client||(s.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}");
if(!cockpit.includes("accountRole=rr.data?.role||'member'"))cockpit=cockpit.replace("s.role=rr.data?.role||'member';if(!isPro())return false;","const accountRole=rr.data?.role||'member';s.role=route()==='clinical'&&accountRole==='admin'?'professional':accountRole;if(!isPro())return false;");
if(!cockpit.includes('komo:center-changed'))cockpit=cockpit.replace("window.addEventListener('komo:myocare-imported',()=>setTimeout(refresh,150));","window.addEventListener('komo:myocare-imported',()=>setTimeout(refresh,150));window.addEventListener('komo:center-changed',()=>setTimeout(refresh,50));window.addEventListener('komo:patient-changed',()=>setTimeout(refresh,50));");
if(!cockpit.includes("route()==='clinical'&&accountRole==='admin'?'professional':accountRole"))throw new Error('[pro-stability] admin-as-professional cockpit patch failed');await writeFile(paths.cockpit,cockpit);

let hub=files.centerHub;
hub=hub.replace("function sb(){if(!S.client)S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return S.client}","function sb(){return window.KomoRuntime?.client||(S.client||(S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}");
hub=hub.replace("document.querySelector('#kcenterSelect')?.addEventListener('change',e=>{S.centerId=e.target.value;localStorage.setItem(ORG_KEY,S.centerId);render()});","document.querySelector('#kcenterSelect')?.addEventListener('change',e=>{S.centerId=e.target.value;localStorage.setItem(ORG_KEY,S.centerId);localStorage.removeItem('komo_clinical_patient');localStorage.removeItem('komo_clinical_assessment');render();window.dispatchEvent(new CustomEvent('komo:center-changed',{detail:{organizationId:S.centerId}}))});");
hub=hub.replace("document.querySelectorAll('[data-open-patient]').forEach(b=>b.addEventListener('click',()=>{localStorage.setItem('komo_clinical_patient',b.dataset.openPatient);localStorage.setItem(ORG_KEY,S.centerId);location.reload()}));","document.querySelectorAll('[data-open-patient]').forEach(b=>b.addEventListener('click',()=>{localStorage.setItem('komo_clinical_patient',b.dataset.openPatient);localStorage.setItem(ORG_KEY,S.centerId);window.dispatchEvent(new CustomEvent('komo:center-changed',{detail:{organizationId:S.centerId}}));window.dispatchEvent(new CustomEvent('komo:patient-changed',{detail:{patientId:b.dataset.openPatient}}));window.KomoProArchitecture?.open?.('patients')}));");
if(!hub.includes('window.KomoCenterHub='))hub+='\nwindow.KomoCenterHub={open:activate,refresh:load};\n';
if(hub.includes("localStorage.setItem('komo_clinical_patient',b.dataset.openPatient);localStorage.setItem(ORG_KEY,S.centerId);location.reload()"))throw new Error('[pro-stability] center hub still reloads on patient open');await writeFile(paths.centerHub,hub);

let context=files.centerContext;context=context.replace('  location.reload();',"  window.dispatchEvent(new CustomEvent('komo:center-changed',{detail:{organizationId:next}}));");await writeFile(paths.centerContext,context);

let pro=files.pro;
if(!pro.includes('let actionToken=0;'))pro=pro.replace("const S={client:null,role:'member',ready:false,active:'dashboard'};","const S={client:null,role:'member',ready:false,active:'dashboard'};let actionToken=0;");
pro=pro.replace("function hiddenClick(sel,retry=0){const b=document.querySelector(sel);if(b){b.click();return}if(retry<12)setTimeout(()=>hiddenClick(sel,retry+1),120)}","function hiddenClick(sel,retry=0,token=actionToken){if(token!==actionToken)return;const b=document.querySelector(sel);if(b){b.click();return}if(retry<10)setTimeout(()=>hiddenClick(sel,retry+1,token),100)}");
pro=pro.replace('function openTarget(id){S.active=id;','function openTarget(id){actionToken++;S.active=id;');
pro=pro.replace(/document\.addEventListener\('DOMContentLoaded',\(\)=>setTimeout\(loadRole,500\)\);let scheduled=false;const obs=new MutationObserver\(\(\)=>\{.*?obs\.observe\(document\.body,\{subtree:true,childList:true,attributes:true,attributeFilter:\['hidden','class'\]\}\);setTimeout\(\(\)=>loadRole\(\)\.catch\(console\.error\),1000\);/s,`document.addEventListener('DOMContentLoaded',()=>setTimeout(loadRole,500));let scheduled=false;function scheduleApply(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(!S.ready)loadRole().catch(console.error);else{ensureProNav();applyMode()}})}const view=document.querySelector('#viewRoot');if(view)new MutationObserver(scheduleApply).observe(view,{childList:true,subtree:false});['komo:route-ready','komo:data-ready','komo:center-changed','komo:patient-changed','komo:clinical-cockpit-ready'].forEach(name=>window.addEventListener(name,scheduleApply));setTimeout(()=>loadRole().catch(console.error),1000);`);
if(!pro.includes('let actionToken=0;')||pro.includes("obs.observe(document.body,{subtree:true,childList:true,attributes:true"))throw new Error('[pro-stability] professional nav observer patch failed');await writeFile(paths.pro,pro);

let html=files.html;const release='20260827-pro-stable-2';for(const file of ['booking-layer-v1.js','booking-directory-map-v1.js','clinical-cockpit-v1.js','center-hub-v1.js','center-context-v1.js','pro-architecture-v2.js']){const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');html=html.replace(new RegExp(`\\./${escaped}(?:\\?v=[^\"']+)?`,'g'),`./${file}?v=${release}`)}await writeFile(paths.html,html);
console.log('[pulse-professional-stability] pro center context + persistent nonblocking RDV map applied');
