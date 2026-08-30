import{readFile,writeFile}from'node:fs/promises';

async function patch(path,changes,label,{stripHeader=false}={}){let s=await readFile(path,'utf8');for(const[from,to]of changes){if(s.includes(from))s=s.replace(from,to);else if(!s.includes(to))throw new Error(`[pulse-runtime-late] ${label} contract changed`)}if(stripHeader)s=s.replace(/^\/\*[\s\S]*?\*\/\n/,'');await writeFile(path,s);return s}

const center=await patch('site/pulse-v12/center-command-cockpit-v2.js',[["obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});","obs.observe(document.querySelector('#appShell'),{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});"]],'Center Command');
if(center.includes('obs.observe(document.body'))throw new Error('[pulse-runtime-late] Center Command body observer remains');

const canonical=await patch('site/pulse-v12/patient-canonical-results.js',[["}).observe(document.body,{childList:true,subtree:true});","}).observe(document.querySelector('#viewRoot'),{childList:true,subtree:true});"]],'Canonical Results');
if(canonical.includes('.observe(document.body'))throw new Error('[pulse-runtime-late] Canonical Results body observer remains');

const first=await patch('site/pulse-v12/first-test-entry-v1.js',[
["const URL='https://uqlolefsiktbznnymriy.supabase.co';\nconst KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';\nconst REM='komo_pulse_remember';\nconst PENDING='komo_open_first_test_v1';\nlet client=null;\nlet freeState=null;\nlet checkedAt=0;\nlet checking=false;","const URL='https://uqlolefsiktbznnymriy.supabase.co',KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n',REM='komo_pulse_remember',PENDING='komo_open_first_test_v1';let client,freeState,checkedAt=0,checking=false;"],
["  if(!button)return;","  if(!button){event.target.closest?.('#signupButton')&&setTimeout(schedule);return}"],
["observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','data-handoff','class']});","observer.observe(document.querySelector('#viewRoot'),{subtree:true,childList:true});"]
],'First Test');
if(first.includes('observer.observe(document.body'))throw new Error('[pulse-runtime-late] First Test body observer remains');

const myocare=await patch('site/pulse-v12/myocare-import-entry-v2.js',[["observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});","observer.observe(document.querySelector('#viewRoot'),{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});"]],'MyoCare Import');
if(myocare.includes('observer.observe(document.body'))throw new Error('[pulse-runtime-late] MyoCare body observer remains');

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

const legacyRouteScript=/\s*<script(?: type="module")? src="\.\/patient-route-runtime-v2\.js(?:\?v=[^\"']+)?"><\/script>/g;
if(!legacyRouteScript.test(html))throw new Error('[pulse-runtime-late] patient-route-runtime-v2 script tag missing before retirement');
html=html.replace(legacyRouteScript,'');
if(html.includes('patient-route-runtime-v2.js'))throw new Error('[pulse-runtime-late] retired patient route runtime still loaded');
await writeFile('site/pulse-v12/index.html',html);

console.log('[pulse-runtime-late] zero whole-body observers retained; Motion uses shared Supabase; patient-route-runtime-v2 retired into canonical owners');
