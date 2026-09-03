import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const pulse=path.join(process.cwd(),'site','pulse-v12');
const centerPath=path.join(pulse,'center-two-tab-workspace-v1.js');
if(!fs.existsSync(centerPath))throw new Error('[center-crash-hotfix] missing center runtime');

let src=fs.readFileSync(centerPath,'utf8');
const replace=(from,to,label)=>{if(!src.includes(from))throw new Error('[center-crash-hotfix] marker missing: '+label);src=src.replace(from,to)};

replace('let timer=null;','let timer=null,rowsLoadPromise=null,activating=false,navRefreshQueued=false,rowsLoadedAt=0;','state guards');

replace(
`function rebuildNav(){if(!isPro())return;styles();for(const id of ['proDesktopNav','proMobileNav']){const nav=document.querySelector('#'+id);if(!nav)continue;nav.innerHTML=\`<button type="button" class="nav-item pro-nav-item active" data-k2tw-nav="patients">\${navIcon('patients')}<span>Consultations</span></button>\`}}`,
`function rebuildNav(){if(!isPro())return;styles();const markup=\`<button type="button" class="nav-item pro-nav-item active" data-k2tw-nav="patients">\${navIcon('patients')}<span>Consultations</span></button>\`;for(const id of ['proDesktopNav','proMobileNav']){const nav=document.querySelector('#'+id);if(!nav)continue;if(nav.dataset.k2twOwner==='consultations'&&nav.innerHTML===markup)continue;nav.dataset.k2twOwner='consultations';nav.innerHTML=markup}}`,
'idempotent nav');

replace(
`async function role(){const {data:{session}}=await sb().auth.getSession();if(!session?.user)return false;const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';return['professional','admin'].includes(S.role)}`,
`async function role(){if(['professional','admin'].includes(S.role))return true;const {data:{session}}=await sb().auth.getSession();if(!session?.user)return false;const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';return['professional','admin'].includes(S.role)}`,
'role cache');

replace(
`async function loadRows(){S.loading=true;S.error='';renderPatients();try{const d=await sb().functions.invoke('professional-dashboard',{body:{action:'list'}});if(d.error)throw d.error;if(d.data?.error)throw new Error(d.data.detail||d.data.error);S.rows=d.data?.rows||[];selectedRows()}catch(e){S.error=e.message||'Chargement impossible'}finally{S.loading=false;renderPatients()}}`,
`async function loadRows(force=false){if(!force&&S.rows.length&&Date.now()-rowsLoadedAt<15000){renderPatients();return S.rows}if(rowsLoadPromise)return rowsLoadPromise;rowsLoadPromise=(async()=>{S.loading=!S.rows.length;S.error='';renderPatients();try{const d=await sb().functions.invoke('professional-dashboard',{body:{action:'list'}});if(d.error)throw d.error;if(d.data?.error)throw new Error(d.data.detail||d.data.error);S.rows=d.data?.rows||[];rowsLoadedAt=Date.now();selectedRows();return S.rows}catch(e){S.error=e.message||'Chargement impossible';console.error('[center-two-tab] dashboard',e);return S.rows}finally{S.loading=false;renderPatients()}})().finally(()=>{rowsLoadPromise=null});return rowsLoadPromise}`,
'rows dedupe');

replace(
`async function activate(){if(route()!=='clinical')return;if(!await role())return;rebuildNav();hideCockpitChrome();navState();S.active='patients';await openPatients()}`,
`async function activate(){if(route()!=='clinical'||activating)return;activating=true;try{if(!await role())return;document.body.classList.add('komo-pro-mode');rebuildNav();hideCockpitChrome();navState();S.active='patients';await openPatients()}finally{activating=false}}`,
'activation guard');

replace(
`function schedule(){clearTimeout(timer);timer=setTimeout(()=>activate().catch(console.error),100)}`,
`function schedule(){clearTimeout(timer);timer=setTimeout(()=>activate().catch(console.error),40)}`,
'fast schedule');

const oldTail=`window.addEventListener('hashchange',schedule);window.addEventListener('komo:route-ready',schedule);window.addEventListener('komo:myocare-imported',()=>{if(S.selected)setTimeout(()=>openDossier(S.selected),180)});const obs=new MutationObserver(()=>{if(isPro()){rebuildNav();hideCockpitChrome()}});obs.observe(document.querySelector('#appShell'),{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,700));setTimeout(schedule,1100);`;
const newTail=`function refreshChrome(){if(navRefreshQueued||!isPro())return;navRefreshQueued=true;requestAnimationFrame(()=>{navRefreshQueued=false;rebuildNav();hideCockpitChrome()})}\nwindow.addEventListener('hashchange',schedule);window.addEventListener('komo:route-ready',schedule);window.addEventListener('komo:data-ready',schedule);window.addEventListener('komo:clinical-cockpit-ready',()=>{refreshChrome();schedule()});window.addEventListener('komo:myocare-imported',()=>{rowsLoadedAt=0;if(S.selected)setTimeout(()=>openDossier(S.selected),120);else schedule()});document.addEventListener('DOMContentLoaded',schedule);schedule();`;
replace(oldTail,newTail,'observer retirement');

replace(
`body.komo-pro-mode .kcp-tabs{display:none!important}`,
`body.komo-pro-mode .kcp-head,body.komo-pro-mode .kcp-tabs,body.komo-pro-mode #kcpPatientBar{display:none!important}`,
'cockpit chrome cleanup');

// The consultation workflow emits this owner through a raw build template.
// Normalize it here so all subsequent architecture/debt checks see valid browser JS.
src=src.replace(/\\`/g,'`').replace(/\\\$\{/g,'${');

fs.writeFileSync(centerPath,src);
const check=spawnSync(process.execPath,['--check',centerPath],{encoding:'utf8'});
if(check.status!==0)throw new Error('[center-crash-hotfix] syntax: '+(check.stderr||check.stdout));

const final=fs.readFileSync(centerPath,'utf8');
const checks=[
  ['no mutation observer feedback loop',!final.includes('new MutationObserver')],
  ['nav writes are idempotent',final.includes("nav.dataset.k2twOwner==='consultations'")],
  ['dashboard request deduplicated',final.includes('rowsLoadPromise')],
  ['centre activation guarded',final.includes('activating=true')],
  ['cockpit ready resynchronizes consultation owner',final.includes("komo:clinical-cockpit-ready")],
  ['legacy cockpit header hidden in consultation mode',final.includes('.kcp-head,body.komo-pro-mode .kcp-tabs')]
];
for(const [label,ok] of checks)if(!ok)throw new Error('[center-crash-hotfix] failed: '+label);
console.log('[center-crash-hotfix] PASS · Centre render loop retired · loads deduped · consultation owner stable');
