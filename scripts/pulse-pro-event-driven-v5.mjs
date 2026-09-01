import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const files={pro:join(pulse,'pro-architecture-v2.js'),clinical:join(pulse,'clinical-cockpit-v1.js')};
const read=k=>readFile(files[k],'utf8');
const write=(k,s)=>writeFile(files[k],s,'utf8');
function req(src,from,to,label){if(src.includes(to))return src;if(!src.includes(from))throw new Error(`[pulse-pro-event-v5] ${label} contract changed`);return src.replace(from,to)}

let pro=await read('pro');
pro=req(pro,'async function loadRole(){if(S.roleLoading)return;','async function loadRole(){if(S.roleLoading||S.ready)return;','professional role lookup must be single-shot');
pro=req(
  pro,
  "document.addEventListener('click',inferActiveFromCockpit,true);window.addEventListener('hashchange',()=>setTimeout(()=>{applyMode();if(location.hash.replace(/^#/,'')==='clinical'&&!['planning','patients','motion','myocare','messages','dashboard'].includes(S.active)){S.active='dashboard';renderActive()}},80));document.addEventListener('DOMContentLoaded',()=>setTimeout(loadRole,500));",
  "function syncRouteMode(){applyMode();if(location.hash.replace(/^#/,'')==='clinical'&&!['planning','patients','motion','myocare','messages','dashboard'].includes(S.active)){S.active='dashboard';renderActive()}}document.addEventListener('click',inferActiveFromCockpit,true);window.addEventListener('hashchange',syncRouteMode);document.addEventListener('DOMContentLoaded',loadRole);window.addEventListener('komo:data-ready',loadRole);",
  'professional navigation must not depend on 80/500ms timers'
);
await write('pro',pro);

let clinical=await read('clinical');
clinical=req(clinical,"function schedule(){clearTimeout(timer);timer=setTimeout(wrap,20)}","function schedule(){if(route()==='clinical')wrap()}",'clinical owner must mount without 20ms route timer');
clinical=req(
  clinical,
  "const obs=new MutationObserver(schedule);obs.observe(document.querySelector('#appShell'),{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});",
  "const viewRoot=document.querySelector('#viewRoot');const obs=new MutationObserver(()=>{if(route()==='clinical'&&!viewRoot?.querySelector('[data-clinical-cockpit-v1]'))schedule()});if(viewRoot)obs.observe(viewRoot,{childList:true});",
  'clinical observer must be bounded to direct view ownership changes'
);
clinical=req(clinical,"document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,900));","document.addEventListener('DOMContentLoaded',schedule);",'clinical 900ms fallback must be removed');
clinical=clinical.replace(";setTimeout(schedule,180)",';');
clinical=clinical.replace("location.hash='admin';setTimeout(()=>window.dispatchEvent(new CustomEvent('komo:admin-open')),40)","location.hash='admin'");
await write('clinical',clinical);

const checks=[
  ['role init has no 500ms fallback',!pro.includes('setTimeout(loadRole,500)')],
  ['hash mode sync has no 80ms fallback',!pro.includes("hashchange',()=>setTimeout")],
  ['role initialization is event-driven',pro.includes("window.addEventListener('komo:data-ready',loadRole)")],
  ['role lookup is single-shot',pro.includes('if(S.roleLoading||S.ready)return')],
  ['clinical mount has no 20ms route timer',!clinical.includes('timer=setTimeout(wrap,20)')],
  ['clinical mount has no 900ms startup fallback',!clinical.includes('setTimeout(schedule,900)')],
  ['clinical observer no longer watches whole app shell',!clinical.includes("obs.observe(document.querySelector('#appShell')")],
  ['clinical observer is bounded to viewRoot direct children',clinical.includes("obs.observe(viewRoot,{childList:true})")],
  ['patient selection has no redundant delayed remount',!clinical.includes('setTimeout(schedule,180)')],
  ['Clinical to Admin uses canonical hash routing only',!clinical.includes("new CustomEvent('komo:admin-open')")]
];
for(const [label,ok] of checks)console.log(`[pulse-pro-event-v5] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-pro-event-v5] PASS · Professional surface is event-driven and bounded');
