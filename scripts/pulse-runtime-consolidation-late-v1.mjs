import{readFile,writeFile}from'node:fs/promises';

async function patch(path,changes,label,{stripHeader=false}={}){let s=await readFile(path,'utf8');for(const[from,to]of changes){if(s.includes(from))s=s.replace(from,to);else if(!s.includes(to))throw new Error(`[pulse-runtime-late] ${label} contract changed`)}if(stripHeader)s=s.replace(/^\/\*[\s\S]*?\*\/\n/,'');await writeFile(path,s);return s}
const hasRouteWrite=s=>/location\.hash\s*=|history\.(?:pushState|replaceState)\s*\(/.test(s);

const center=await patch('site/pulse-v12/center-command-cockpit-v2.js',[["obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});","obs.observe(document.querySelector('#appShell'),{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});"]],'Center Command');
if(center.includes('obs.observe(document.body'))throw new Error('[pulse-runtime-late] Center Command body observer remains');

const canonical=await patch('site/pulse-v12/patient-canonical-results.js',[["}).observe(document.body,{childList:true,subtree:true});","}).observe(document.querySelector('#viewRoot'),{childList:true,subtree:true});"]],'Canonical Results');
if(canonical.includes('.observe(document.body'))throw new Error('[pulse-runtime-late] Canonical Results body observer remains');

const first=await patch('site/pulse-v12/first-test-entry-v1.js',[
["const URL='https://uqlolefsiktbznnymriy.supabase.co';\nconst KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';\nconst REM='komo_pulse_remember';\nconst PENDING='komo_open_first_test_v1';\nlet client=null;\nlet freeState=null;\nlet checkedAt=0;\nlet checking=false;","const URL='https://uqlolefsiktbznnymriy.supabase.co',KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n',REM='komo_pulse_remember',PENDING='komo_open_first_test_v1';let client,freeState,checkedAt=0,checking=false;"],
["  if(!button)return;","  if(!button){return}"],
["observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','data-handoff','class']});","observer.observe(document.querySelector('#viewRoot'),{subtree:true,childList:true});"]
],'First Test');
if(first.includes('observer.observe(document.body'))throw new Error('[pulse-runtime-late] First Test body observer remains');
if(!first.includes('if(!button){return}'))throw new Error('[pulse-runtime-late] First Test welcome guard is not deterministic');

const myocare=await patch('site/pulse-v12/myocare-import-entry-v2.js',[
["function activeClinical(){return location.hash==='#clinical'&&document.body.classList.contains('komo-pro-mode')}","function activeClinical(){return location.hash.slice(1)==='clinical'&&document.body.classList.contains('komo-pro-mode')}"],
["observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});","observer.observe(document.querySelector('#viewRoot'),{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});"]
],'MyoCare Import');
if(myocare.includes('observer.observe(document.body'))throw new Error('[pulse-runtime-late] MyoCare body observer remains');
if(hasRouteWrite(myocare))throw new Error('[pulse-runtime-late] MyoCare Import still classified as direct route writer');

const adaptive=await patch('site/pulse-v12/adaptive-shell-v4.js',[["observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});","observer.observe(document.querySelector('#appShell'),{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});"]],'Adaptive Shell',{stripHeader:true});
if(adaptive.includes('observer.observe(document.body'))throw new Error('[pulse-runtime-late] Adaptive Shell body observer remains');

const free=await patch('site/pulse-v12/pulse-free-continuity-v2.js',[
["function sb(){if(!S.client)S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return S.client}","function sb(){return window.KomoRuntime?.client||(S.client||(S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}"],
["obs.observe(document.body,{childList:true,subtree:true});","obs.observe(document.querySelector('#viewRoot'),{childList:true,subtree:true});"]
],'Pulse Free Continuity');
if(free.includes('obs.observe(document.body'))throw new Error('[pulse-runtime-late] Pulse Free body observer remains');
if(!free.includes('window.KomoRuntime?.client'))throw new Error('[pulse-runtime-late] Pulse Free shared client missing');

const homeVisual=await patch('site/pulse-v12/patient-home-visual-v2.js',[["new MutationObserver(patch).observe(document.body,{childList:true,subtree:true});","new MutationObserver(patch).observe(document.querySelector('#viewRoot'),{childList:true,subtree:true});"]],'Home Visual',{stripHeader:true});
if(homeVisual.includes('.observe(document.body'))throw new Error('[pulse-runtime-late] Home Visual body observer remains');

const homeMotion=await patch('site/pulse-v12/patient-home-micro-motion-v1.js',[["}).observe(document.body,{childList:true,subtree:true});","}).observe(document.querySelector('#viewRoot'),{childList:true,subtree:true});"]],'Home Micro Motion',{stripHeader:true});
if(homeMotion.includes('.observe(document.body'))throw new Error('[pulse-runtime-late] Home Micro Motion body observer remains');

const hero=await patch('site/pulse-v12/pulse-home-hero-polish-v2.js',[["new MutationObserver(()=>schedule(false)).observe(document.body,{childList:true,subtree:true});","new MutationObserver(()=>schedule(false)).observe(document.querySelector('#appShell'),{childList:true,subtree:true});"]],'Home Hero Polish',{stripHeader:true});
if(hero.includes('.observe(document.body'))throw new Error('[pulse-runtime-late] Home Hero body observer remains');

let html=await readFile('site/pulse-v12/index.html','utf8');
const perfAt=html.indexOf('./performance-runtime-v1.js'),motionAt=html.indexOf('./motion-hub-v3.js');
if(perfAt<0||motionAt<0||perfAt>motionAt)throw new Error('[pulse-runtime-late] shared runtime must load before Motion Hub');
const motion=await patch('site/pulse-v12/motion-hub-v3.js',[
["import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';\n\n",''],
["const URL='https://uqlolefsiktbznnymriy.supabase.co';\nconst KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';\nconst REM='komo_pulse_remember';\n",''],
["const S={client:null,user:null,patient:null,assessment:null,registry:{},sessions:{},responses:{},loading:false,openCode:null,message:'',kind:''};","const S={user:null,patient:null,assessment:null,registry:{},sessions:{},responses:{},loading:false,openCode:null,message:'',kind:''};"],
["const storage=()=>localStorage.getItem(REM)==='1'?localStorage:sessionStorage;\nconst sb=()=>S.client||(S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));","const sb=()=>window.KomoRuntime.client;"],
["window.addEventListener('hashchange',()=>enter(false));window.addEventListener('pageshow',()=>enter(false));window.addEventListener('komo:questionnaire-saved',()=>{if(route()==='motion')setTimeout(load,120)});","window.addEventListener('hashchange',()=>enter(false));window.addEventListener('pageshow',()=>enter(false));window.addEventListener('komo:route-ready',()=>enter(false));window.addEventListener('komo:session-ready',()=>{if(route()==='motion')setTimeout(load,30)});window.addEventListener('komo:questionnaire-saved',()=>{if(route()==='motion')setTimeout(load,120)});"],
],'Motion Hub');
if(motion.includes('createClient')||motion.includes('S.client'))throw new Error('[pulse-runtime-late] Motion Hub still owns a Supabase client');

const trajectory=await patch('site/pulse-v12/trajectory-v3.js',[["window.addEventListener('hashchange',()=>enter(false));window.addEventListener('pageshow',()=>enter(false));window.addEventListener('komo:canonical-result-invalidated',()=>{if(route()==='trajectory')hydrate(true)});","window.addEventListener('hashchange',()=>enter(false));window.addEventListener('pageshow',()=>enter(false));window.addEventListener('komo:route-ready',()=>enter(false));window.addEventListener('komo:session-ready',()=>{if(route()==='trajectory')setTimeout(()=>hydrate(false),30)});window.addEventListener('komo:canonical-result-invalidated',()=>{if(route()==='trajectory')hydrate(true)});"]],'Trajectory owner');
if(!trajectory.includes("komo:route-ready',()=>enter(false)"))throw new Error('[pulse-runtime-late] Trajectory route-ready ownership missing');

const agenda=await patch('site/pulse-v12/agenda-hub-v4.js',[["window.addEventListener('pageshow',()=>{if(route()==='documents')setTimeout(()=>refresh(),70)});","window.addEventListener('pageshow',()=>{if(route()==='documents')setTimeout(()=>refresh(),70)});window.addEventListener('komo:route-ready',()=>{if(route()==='documents')setTimeout(()=>refresh(),30)});window.addEventListener('komo:session-ready',()=>{if(route()==='documents')setTimeout(()=>refresh(),30)});"]],'Agenda owner');
if(!agenda.includes("komo:route-ready',()=>{if(route()==='documents')"))throw new Error('[pulse-runtime-late] Agenda route-ready ownership missing');

const clubEntry=await patch('site/pulse-v12/my-komo-club-entry-v1.js',[["    if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go('club');\n    else location.hash='club';","    window.KomoPatientNavigation?.go?.('club');"]],'Club entry');
if(hasRouteWrite(clubEntry))throw new Error('[pulse-runtime-late] Club entry still writes routes directly');

const patientReport=await patch('site/pulse-v12/report-patient-ui-v1.js',[["function go(r){if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go(r);else location.hash=r}","function go(r){window.KomoPatientNavigation?.go?.(r)}"]],'Patient report');
if(hasRouteWrite(patientReport))throw new Error('[pulse-runtime-late] Patient report still writes routes directly');

const motionAccess=await patch('site/pulse-v12/motion-access-fix-v1.js',[
["    if(window.KomoPatientNavigation?.go) window.KomoPatientNavigation.go('motion');\n    else if(location.hash!=='#motion') location.hash='motion';\n    else window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:'motion',source:'motion-access-fix'}}));","    window.KomoPatientNavigation?.go?.('motion');"],
["    location.hash='results';","    window.KomoPatientNavigation?.go?.('results');"]
],'Motion access');
if(hasRouteWrite(motionAccess))throw new Error('[pulse-runtime-late] Motion access still writes routes directly');

const resultsPolish=await patch('site/pulse-v12/results-polish-v1.js',[
["      next.querySelector('[data-krp-action=\"motion\"]')?.addEventListener('click',()=>{location.hash='documents'});","      next.querySelector('[data-krp-action=\"motion\"]')?.addEventListener('click',()=>window.KomoPatientNavigation?.go?.('documents'));"],
["      next.querySelector('[data-krp-action=\"score\"]')?.addEventListener('click',()=>{location.hash='path'});","      next.querySelector('[data-krp-action=\"score\"]')?.addEventListener('click',()=>window.KomoPatientNavigation?.go?.('trajectory'));"],
],'Results polish');
if(hasRouteWrite(resultsPolish))throw new Error('[pulse-runtime-late] Results polish still writes routes directly');

const logoutVisible=await patch('site/pulse-v12/account-logout-visible-v1.js',[
["    location.hash='home';","    0;"],
["new MutationObserver(()=>{if(location.hash==='#profile'&&!document.getElementById(CARD_ID))schedule()})","new MutationObserver(()=>{if(location.hash.slice(1)==='profile'&&!document.getElementById(CARD_ID))schedule()})"]
],'Visible logout');
if(hasRouteWrite(logoutVisible))throw new Error('[pulse-runtime-late] Visible logout still classified as direct route writer');

const profileAvatar=await patch('site/pulse-v12/profile-avatar-v1.js',[["if(location.hash==='#profile'&&!document.querySelector('[data-profile-avatar]'))schedule()","if(location.hash.slice(1)==='profile'&&!document.querySelector('[data-profile-avatar]'))schedule()"]],'Profile avatar');
if(hasRouteWrite(profileAvatar))throw new Error('[pulse-runtime-late] Profile avatar still classified as direct route writer');

const legacyRouteScript=/\s*<script(?: type="module")? src="\.\/patient-route-runtime-v2\.js(?:\?v=[^\"']+)?"><\/script>/g;
if(!legacyRouteScript.test(html))throw new Error('[pulse-runtime-late] patient-route-runtime-v2 script tag missing before retirement');
html=html.replace(legacyRouteScript,'');
if(html.includes('patient-route-runtime-v2.js'))throw new Error('[pulse-runtime-late] retired patient route runtime still loaded');
await writeFile('site/pulse-v12/index.html',html);

console.log('[pulse-runtime-late] zero whole-body observers retained; Motion shared Supabase; seven patient route writers centralized; three false-positive route writers retired; patient-route-runtime-v2 retired');
