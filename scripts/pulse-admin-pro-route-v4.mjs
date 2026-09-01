import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const file=join(process.cwd(),'site','pulse-v12','app-router-v2.js');
let router=await readFile(file,'utf8');

function req(src,from,to,label){
  if(src.includes(to))return src;
  if(!src.includes(from))throw new Error(`[pulse-admin-pro-route-v4] ${label} contract changed`);
  return src.replace(from,to);
}

router=req(
  router,
  "if(['motion','mykomo','club','key','trajectory','messages','admin'].includes(route)){",
  "if(['motion','mykomo','club','key','trajectory','messages'].includes(route)){",
  'Admin must reach its canonical route-ready branch'
);

const oldModeSwitch="els.modeSwitch.addEventListener('click',event=>{const button=event.target.closest('button[data-mode]');if(!button)return;state.mode=button.dataset.mode;[...els.modeSwitch.querySelectorAll('button')].forEach(btn=>btn.classList.toggle('active',btn===button));if(state.mode==='clinical')location.hash='clinical';else if(currentRoute()==='clinical')location.hash='home';renderNavigation();renderRoute(currentRoute())});";
const newModeSwitch="els.modeSwitch.addEventListener('click',event=>{const button=event.target.closest('button[data-mode]');if(!button)return;state.mode=button.dataset.mode;[...els.modeSwitch.querySelectorAll('button')].forEach(btn=>btn.classList.toggle('active',btn===button));const routeBefore=currentRoute();if(state.mode==='clinical'){if(routeBefore!=='clinical'){location.hash='clinical';return}}else if(routeBefore==='clinical'){location.hash='home';return}renderNavigation();renderRoute(currentRoute())});";
router=req(router,oldModeSwitch,newModeSwitch,'Professional mode switch must render once');

const checks=[
  ['Admin is not swallowed by generic external-owner return',!router.includes("['motion','mykomo','club','key','trajectory','messages','admin']")],
  ['Admin canonical branch still exists',router.includes("if(route==='admin')")],
  ['Admin canonical branch dispatches admin route-ready',router.includes("new CustomEvent('komo:admin-route-ready')")],
  ['Professional mode switch cancels duplicate explicit render after hash navigation',router.includes('const routeBefore=currentRoute()')],
  ['Old double-render mode switch removed',!router.includes("if(state.mode==='clinical')location.hash='clinical';else if(currentRoute()==='clinical')location.hash='home';renderNavigation();renderRoute(currentRoute())")]
];
for(const [label,ok] of checks)console.log(`[pulse-admin-pro-route-v4] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
await writeFile(file,router,'utf8');
console.log('[pulse-admin-pro-route-v4] PASS · canonical Admin routing + single-pass Professional mode navigation');
