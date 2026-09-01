import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const paths={
  html:join(pulse,'index.html'),
  admin:join(pulse,'admin-console-v2.js'),
  adminPros:join(pulse,'admin-professionals-v1.js'),
  adminCenters:join(pulse,'admin-centers-v1.js'),
  adminMotion:join(pulse,'admin-motion-validation-v1.js'),
  adminPrivacy:join(pulse,'admin-privacy-queue-v1.js'),
  adminPatients:join(pulse,'admin-patient-manager-v1.js'),
  pro:join(pulse,'pro-architecture-v2.js')
};

async function read(name){return readFile(paths[name],'utf8')}
async function write(name,src){return writeFile(paths[name],src,'utf8')}
function mustReplace(src,from,to,label){
  if(src.includes(to))return src;
  if(!src.includes(from))throw new Error(`[pulse-admin-pro-owner-v2] ${label} contract changed`);
  return src.replace(from,to);
}

// 1. Retire two obsolete runtime layers. Professional approvals already live in
// canonical Admin; admin-ux-v2 only polishes that retired Clinical admin surface.
let html=await read('html');
for(const file of ['professional-admin-v1.js','admin-ux-v2.js']){
  const re=new RegExp(`\\s*<script(?: type="module")? src="\\./${file.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}(?:\\?v=[^\"']+)?"><\\/script>`,'g');
  html=html.replace(re,'');
}
await write('html',html);

// 2. ADMIN owns the full navigation from first paint. Bounded controllers only
// populate their panel; they no longer add tabs seconds after the route appears.
let admin=await read('admin');
const motionTab=`<button class="${S.tab==='motion'?'active':''}" data-admin-tab="motion">Demandes Motion${openMotion?` <b>${openMotion}</b>`:''}</button>`;
const stableTabs=`${motionTab}<button data-admin-professionals>Professionnels</button><button data-kamv-tab>Validations Motion</button><button data-admin-centers>Centres</button><button data-admin-privacy-tab>Confidentialité</button>`;
admin=mustReplace(admin,motionTab,stableTabs,'canonical Admin tab bar');
await write('admin',admin);

// 3. Professionnels Admin controller: if the canonical button already exists,
// update its count/state instead of injecting another button.
let adminPros=await read('adminPros');
adminPros=mustReplace(
  adminPros,
  "const nav=document.querySelector('.kav2-tabs');if(!nav||nav.querySelector('[data-admin-professionals]'))return;const refresh=nav.querySelector('[data-admin-refresh]');const b=document.createElement('button');",
  "const nav=document.querySelector('.kav2-tabs');if(!nav)return;const existing=nav.querySelector('[data-admin-professionals]');if(existing){existing.innerHTML=`Professionnels${state.professionals.length?` <b>${state.professionals.length}</b>`:''}`;existing.classList.toggle('active',state.active);return}const refresh=nav.querySelector('[data-admin-refresh]');const b=document.createElement('button');",
  'Admin Professionals stable button'
);
await write('adminPros',adminPros);

// 4. Centres controller binds the canonical button and removes late startup
// fallbacks. Route-ready/DOMContentLoaded are enough.
let adminCenters=await read('adminCenters');
adminCenters=mustReplace(
  adminCenters,
  "let b=nav.querySelector('[data-admin-centers]');if(!b){b=document.createElement('button');",
  "let b=nav.querySelector('[data-admin-centers]');if(b&&!b.dataset.kacBoundClick){b.dataset.kacBoundClick='1';b.addEventListener('click',activate)}if(!b){b=document.createElement('button');",
  'Admin Centres canonical button binding'
);
adminCenters=adminCenters.replace("document.addEventListener('DOMContentLoaded',()=>setTimeout(ensure,900));setTimeout(ensure,1400);","document.addEventListener('DOMContentLoaded',ensure);window.addEventListener('komo:admin-route-ready',schedule);");
await write('adminCenters',adminCenters);

// 5. Motion validation controller uses the pre-rendered tab instead of creating
// one later, and loses its 1.6 s fallback.
let adminMotion=await read('adminMotion');
const oldEnsure=/function ensureTab\(\)\{if\(location\.hash!==\'#admin\'\)return;const nav=document\.querySelector\('\.kav2-tabs'\);if\(!nav\|\|nav\.querySelector\('\[data-kamv-tab\]'\)\)return;const refresh=document\.querySelector\('\.kav2-refresh'\),b=document\.createElement\('button'\);b\.dataset\.kamvTab='1';b\.textContent='Validations Motion';b\.addEventListener\('click',e=>\{e\.preventDefault\(\);active=true;nav\.querySelectorAll\('button'\)\.forEach\(x=>x\.classList\.remove\('active'\)\);b\.classList\.add\('active'\);render\(\)\}\);if\(refresh\)nav\.insertBefore\(b,refresh\);else nav\.appendChild\(b\)\}/;
const newEnsure="function ensureTab(){if(location.hash!=='#admin')return;const nav=document.querySelector('.kav2-tabs');if(!nav)return;const refresh=nav.querySelector('.kav2-refresh');let b=nav.querySelector('[data-kamv-tab]');if(!b){b=document.createElement('button');b.dataset.kamvTab='1';b.textContent='Validations Motion';if(refresh)nav.insertBefore(b,refresh);else nav.appendChild(b)}if(!b.dataset.kamvBound){b.dataset.kamvBound='1';b.addEventListener('click',e=>{e.preventDefault();active=true;nav.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()})}}";
if(!newEnsure||(!oldEnsure.test(adminMotion)&&!adminMotion.includes("b.dataset.kamvBound='1'")))throw new Error('[pulse-admin-pro-owner-v2] Admin Motion ensureTab contract changed');
if(oldEnsure.test(adminMotion))adminMotion=adminMotion.replace(oldEnsure,newEnsure);
adminMotion=adminMotion.replace('setTimeout(schedule,1600);',"window.addEventListener('komo:admin-route-ready',schedule);document.addEventListener('DOMContentLoaded',schedule);");
await write('adminMotion',adminMotion);

// 6. Privacy controller no longer schedules four repaint attempts over 2.3 s.
let adminPrivacy=await read('adminPrivacy');
adminPrivacy=mustReplace(
  adminPrivacy,
  "function schedule(){if(location.hash!=='#admin')return;for(const ms of [100,450,1100,2300])setTimeout(()=>{ensureTab();if(P.active)view()},ms)}",
  "function schedule(){if(location.hash!=='#admin')return;ensureTab();if(P.active)view()}",
  'Admin privacy late repaint loop'
);
await write('adminPrivacy',adminPrivacy);

// 7. Patient manager still enriches the Patients tab, but it mounts from route
// events instead of a late 900 ms startup pass.
let adminPatients=await read('adminPatients');
adminPatients=adminPatients.replace("document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,900));","document.addEventListener('DOMContentLoaded',schedule);window.addEventListener('komo:admin-route-ready',schedule);");
await write('adminPatients',adminPatients);

// 8. Professional shell: one immediate editorial pass, not three delayed DOM
// rewrites at 80/260/650 ms.
let pro=await read('pro');
pro=mustReplace(
  pro,
  "if(location.hash==='#clinical')[80,260,650].forEach(ms=>setTimeout(polishCockpit,ms))",
  "if(location.hash==='#clinical')requestAnimationFrame(polishCockpit)",
  'Professional delayed polish passes'
);
await write('pro',pro);

const checks=[
  ['retired Clinical professional-admin runtime is not shipped',!html.includes('professional-admin-v1.js')],
  ['retired Admin UX overlay is not shipped',!html.includes('admin-ux-v2.js')],
  ['Admin renders Professionnels from first paint',admin.includes('data-admin-professionals')],
  ['Admin renders Motion validation from first paint',admin.includes('data-kamv-tab')],
  ['Admin renders Centres from first paint',admin.includes('data-admin-centers')],
  ['Admin renders Privacy from first paint',admin.includes('data-admin-privacy-tab')],
  ['Admin Professionals updates existing canonical tab',adminPros.includes("const existing=nav.querySelector('[data-admin-professionals]')")],
  ['Admin Centres has no 1.4s startup reinjection',!adminCenters.includes('setTimeout(ensure,1400)')],
  ['Admin Motion has no 1.6s startup reinjection',!adminMotion.includes('setTimeout(schedule,1600)')],
  ['Admin Privacy has no 2.3s repaint train',!adminPrivacy.includes('[100,450,1100,2300]')],
  ['Admin patient manager has no 900ms startup reinjection',!adminPatients.includes('setTimeout(schedule,900)')],
  ['Professional shell has no 80/260/650ms rewrite train',!pro.includes('[80,260,650]')]
];
for(const [label,ok] of checks)console.log(`[pulse-admin-pro-owner-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-admin-pro-owner-v2] PASS · stable Admin first paint + single professional surface');
