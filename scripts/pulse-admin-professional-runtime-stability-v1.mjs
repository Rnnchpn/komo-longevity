import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const paths={
  admin:join(pulse,'admin-console-v2.js'),
  adminPros:join(pulse,'admin-professionals-v1.js'),
  adminPatients:join(pulse,'admin-patient-manager-v1.js'),
  pro:join(pulse,'pro-architecture-v2.js'),
  clinical:join(pulse,'clinical-cockpit-v1.js')
};

async function read(name){return readFile(paths[name],'utf8')}
async function write(name,src){await writeFile(paths[name],src,'utf8')}
function replaceRequired(src,from,to,label){
  if(src.includes(to))return src;
  if(!src.includes(from))throw new Error(`[pulse-admin-pro-stability] ${label} contract changed`);
  return src.replace(from,to);
}

// ADMIN — the console remains the sole route owner. Bounded controller tabs may
// render inside data-admin-panel, but background refreshes must never overwrite
// whichever controller the operator is actively using.
let admin=await read('admin');
admin=replaceRequired(
  admin,
  "const S={tab:'patients',patients:[],registryCounts:{},applications:[],applicationCounts:{},requests:[],organizations:[],professionals:[],errors:{},search:'',selected:null,loading:false,authorized:true,busy:null,actionError:null};\nlet openTimer=null;",
  "const S={tab:'patients',patients:[],registryCounts:{},applications:[],applicationCounts:{},requests:[],organizations:[],professionals:[],errors:{},search:'',selected:null,loading:false,loaded:false,authorized:true,busy:null,actionError:null};\nlet openTimer=null,loadGeneration=0;",
  'Admin lifecycle state'
);
if(!admin.includes('function externalAdminTabActive()')){
  admin=replaceRequired(
    admin,
    "function errorBox(key,label){const e=S.errors[key];return e?`<div class=\"kav2-empty\"><strong>${esc(label)} indisponible.</strong><br>${esc(e)}</div>`:''}",
    "function externalAdminTabActive(){return !!document.querySelector('.kav2-tabs [data-admin-professionals].active,.kav2-tabs [data-kamv-tab].active,.kav2-tabs [data-admin-centers].active,.kav2-tabs [data-admin-privacy-tab].active')}\nfunction errorBox(key,label){const e=S.errors[key];return e?`<div class=\"kav2-empty\"><strong>${esc(label)} indisponible.</strong><br>${esc(e)}</div>`:''}",
    'Admin bounded-controller guard'
  );
}
admin=replaceRequired(
  admin,
  "async function loadAll(){if(location.hash!=='#admin')return;S.loading=true;S.errors={};S.actionError=null;render();const results=await Promise.allSettled([invoke('admin-registry',{action:'list'}),invoke('professional-admin',{action:'list'}),invoke('patient-intake',{action:'list_admin'})]);const [a,b,c]=results;",
  "async function loadAll(force=false){if(location.hash!=='#admin'||(S.loading&&!force))return;const generation=++loadGeneration;S.loading=true;S.errors={};S.actionError=null;if(!externalAdminTabActive())render();const results=await Promise.allSettled([invoke('admin-registry',{action:'list'}),invoke('professional-admin',{action:'list'}),invoke('patient-intake',{action:'list_admin'})]);if(generation!==loadGeneration)return;const [a,b,c]=results;",
  'Admin deduplicated loading'
);
admin=replaceRequired(
  admin,
  "if(S.selected)S.selected=S.applications.find(x=>x.id===S.selected.id)||null;S.loading=false;render()}",
  "if(S.selected)S.selected=S.applications.find(x=>x.id===S.selected.id)||null;S.loading=false;S.loaded=true;if(!externalAdminTabActive())render()}",
  'Admin stable load completion'
);
admin=replaceRequired(
  admin,
  "if(tab){S.tab=tab.dataset.adminTab;S.selected=null;S.actionError=null;render();return}if(e.target.closest('[data-admin-refresh]')){loadAll();return}",
  "if(tab){document.querySelectorAll('.kav2-tabs [data-admin-professionals],.kav2-tabs [data-kamv-tab],.kav2-tabs [data-admin-centers],.kav2-tabs [data-admin-privacy-tab]').forEach(x=>x.classList.remove('active'));S.tab=tab.dataset.adminTab;S.selected=null;S.actionError=null;render();return}if(e.target.closest('[data-admin-refresh]')){loadAll(true);return}",
  'Admin tab ownership + explicit refresh'
);
admin=replaceRequired(
  admin,
  "function open(){if(location.hash!=='#admin')return;S.authorized=true;setHeading();render();clearTimeout(openTimer);openTimer=setTimeout(()=>loadAll().catch(e=>{S.loading=false;S.errors.patients=S.errors.pros=S.errors.motion=e.message||'Chargement impossible';render()}),20)}",
  "function open(){if(location.hash!=='#admin')return;S.authorized=true;setHeading();if(!root()?.querySelector('[data-admin-console-v2]'))render();clearTimeout(openTimer);if(S.loaded||S.loading)return;openTimer=setTimeout(()=>loadAll().catch(e=>{S.loading=false;S.errors.patients=S.errors.pros=S.errors.motion=e.message||'Chargement impossible';if(!externalAdminTabActive())render()}),20)}",
  'Admin idempotent mount'
);
admin=replaceRequired(
  admin,
  "document.addEventListener('click',click);document.addEventListener('input',input);document.addEventListener('change',change);window.addEventListener('hashchange',open);window.addEventListener('komo:admin-route-ready',open);window.addEventListener('komo:admin-open',open);document.addEventListener('DOMContentLoaded',open);setTimeout(open,250);",
  "document.addEventListener('click',click);document.addEventListener('input',input);document.addEventListener('change',change);window.addEventListener('hashchange',open);window.addEventListener('komo:admin-route-ready',open);window.addEventListener('komo:admin-open',open);document.addEventListener('DOMContentLoaded',open);",
  'Admin redundant startup timer removal'
);
admin=admin.replaceAll('setTimeout(open,250);','');
await write('admin',admin);

// Admin / Professionnels tab — one request at a time and no unconditional late
// reinjection. Parent route events remain sufficient to restore the bounded tab.
let adminPros=await read('adminPros');
adminPros=replaceRequired(
  adminPros,
  "async function load(){state.loading=true;state.error=null;panel();try{",
  "async function load(){if(state.loading)return;state.loading=true;state.error=null;panel();try{",
  'Admin Professionals request dedupe'
);
adminPros=adminPros.replace("\n  setTimeout(injectTab,500);",'');
await write('adminPros',adminPros);

// Patient manager already remounts from route/admin events; the fixed late timer
// only creates a second pass on slower devices.
let adminPatients=await read('adminPatients');
adminPatients=adminPatients.replace("document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,900));setTimeout(schedule,1400);","document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,900));");
await write('adminPatients',adminPatients);

// PROFESSIONAL — serialize role discovery so route/data/center events cannot start
// concurrent account-role reads and re-apply the shell twice.
let pro=await read('pro');
pro=replaceRequired(
  pro,
  "const S={client:null,role:'member',ready:false,active:'dashboard'};let actionToken=0;",
  "const S={client:null,role:'member',ready:false,roleLoading:false,active:'dashboard'};let actionToken=0;",
  'Professional role lifecycle state'
);
pro=replaceRequired(
  pro,
  "async function loadRole(){const {data:{session}}=await sb().auth.getSession();if(!session?.user)return;const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';S.ready=true;ensureProNav();applyMode()}",
  "async function loadRole(){if(S.roleLoading)return;S.roleLoading=true;try{const {data:{session}}=await sb().auth.getSession();if(!session?.user)return;const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';S.ready=true;ensureProNav();applyMode()}finally{S.roleLoading=false}}",
  'Professional serialized role loading'
);
pro=pro.replace("setTimeout(()=>loadRole().catch(console.error),1000);",'');
await write('pro',pro);

// Clinical is already the canonical visible owner. The route, data-ready and DOM
// hooks are enough; the historical 1.3 s fallback causes an unnecessary second
// scheduler pass after the cockpit is already mounted.
let clinical=await read('clinical');
clinical=clinical.replace('setTimeout(schedule,1300);','');
await write('clinical',clinical);

const checks=[
  ['Admin tracks completed initial hydration',admin.includes('loaded:false')&&admin.includes('S.loaded=true')],
  ['Admin ignores stale concurrent hydration',admin.includes('loadGeneration')&&admin.includes('generation!==loadGeneration')],
  ['Admin preserves bounded controller tab during hydration',admin.includes('externalAdminTabActive()')],
  ['Admin refresh is explicit and forced',admin.includes("loadAll(true);return")],
  ['Admin fixed startup timer removed',!admin.includes('setTimeout(open,250)')],
  ['Admin Professionals deduplicates requests',adminPros.includes('if(state.loading)return')],
  ['Professional role lookup serialized',pro.includes('roleLoading:false')&&pro.includes('if(S.roleLoading)return')],
  ['Professional duplicate fallback role timer removed',!pro.includes("setTimeout(()=>loadRole().catch(console.error),1000)")],
  ['Clinical duplicate fallback mount timer removed',!clinical.includes('setTimeout(schedule,1300)')]
];
for(const [label,ok] of checks)console.log(`[pulse-admin-pro-stability] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-admin-pro-stability] PASS · Admin + Professionals lifecycle stabilized without changing canonical owners');
