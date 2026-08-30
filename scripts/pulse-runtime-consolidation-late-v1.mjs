import{readFile,writeFile}from'node:fs/promises';

async function patch(path,changes,label){let s=await readFile(path,'utf8');for(const[from,to]of changes){if(s.includes(from))s=s.replace(from,to);else if(!s.includes(to))throw new Error(`[pulse-runtime-late] ${label} contract changed`)}await writeFile(path,s);return s}

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

console.log('[pulse-runtime-late] Center, Results and First Test observers scoped to canonical roots');
