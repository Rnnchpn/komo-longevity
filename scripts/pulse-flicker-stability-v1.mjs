import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pulse=path.join(root,'site','pulse-v12');
const files={
  app:path.join(pulse,'app.js'),
  patient:path.join(pulse,'patient-v4.js'),
  progression:path.join(pulse,'progression-v2.js'),
  results:path.join(pulse,'results-motion-journey-v1.js'),
  cockpit:path.join(pulse,'clinical-cockpit-v1.js'),
  motion:path.join(pulse,'clinical-motion-v1.js'),
  css:path.join(pulse,'pulse-ui-v1.css')
};
for(const [name,file] of Object.entries(files)){if(!fs.existsSync(file)){console.error(`[pulse-flicker] missing ${name}`);process.exit(1)}}

function replaceRequired(text,oldValue,newValue,label){
  if(text.includes(newValue))return text;
  if(!text.includes(oldValue)){console.error(`[pulse-flicker] missing ${label}`);process.exit(1)}
  return text.replace(oldValue,newValue);
}

// Core router: routes with a dedicated renderer must never paint a competing
// legacy screen first. A quiet mount state is preferable to a visible swap.
let app=fs.readFileSync(files.app,'utf8');
const oldRouter="function renderRoute(route){renderNavigation();if(['documents','plan','messages'].includes(route)){els.viewRoot.innerHTML='<div class=\"empty-state\">Chargement de votre espace…</div>';return}if(route==='admin')";
const legacyStableRouter="function renderRoute(route){renderNavigation();if(['path','documents','plan','messages','clinical'].includes(route)){const labels={path:['KŌMØ · PROGRESSION','Votre trajectoire locomotrice.'],documents:['RENDEZ-VOUS','Votre agenda KŌMØ.'],plan:['MON PLAN','Votre plan personnalisé.'],messages:['MESSAGES','Votre messagerie KŌMØ.'],clinical:['KŌMØ CENTRE','Votre centre, en un seul espace.']};const selectors={path:'[data-kpv2]',documents:'[data-patient-v4=\"documents\"]',plan:'[data-patient-v4=\"plan\"]',clinical:'[data-clinical-cockpit-v1]'};const stable=selectors[route]&&els.viewRoot.querySelector(selectors[route]);if(stable)return;els.pageEyebrow.textContent=labels[route]?.[0]||'KŌMØ PULSE';els.pageTitle.textContent=labels[route]?.[1]||'Chargement';els.viewRoot.innerHTML=`<div class=\"komo-route-loading\" data-route-loading=\"${route}\" role=\"status\">Chargement de votre espace…</div>`;return}if(route==='admin')";
const newRouter="function renderRoute(route){renderNavigation();if(['path','documents','plan','messages','clinical'].includes(route)){const labels={path:['KŌMØ PULSE · TRAJECTOIRE','Votre évolution'],documents:['RENDEZ-VOUS','Votre agenda KŌMØ.'],plan:['MON PLAN','Votre plan personnalisé.'],messages:['MESSAGES','Votre messagerie KŌMØ.'],clinical:['KŌMØ CENTRE','Votre centre, en un seul espace.']};const selectors={path:'[data-ktrajectory-v1]',documents:'[data-patient-v4=\"documents\"]',plan:'[data-patient-v4=\"plan\"]',clinical:'[data-clinical-cockpit-v1]'};const stable=selectors[route]&&els.viewRoot.querySelector(selectors[route]);if(stable)return;els.pageEyebrow.textContent=labels[route]?.[0]||'KŌMØ PULSE';els.pageTitle.textContent=labels[route]?.[1]||'Chargement';els.viewRoot.innerHTML=`<div class=\"komo-route-loading\" data-route-loading=\"${route}\" role=\"status\">Chargement de votre espace…</div>`;return}if(route==='admin')";
if(app.includes(legacyStableRouter))app=app.replace(legacyStableRouter,newRouter);else app=replaceRequired(app,oldRouter,newRouter,'dedicated route ownership');
fs.writeFileSync(files.app,app);

// Patient v4 no longer owns #path. Progression v2 is the only renderer there.
let patient=fs.readFileSync(files.patient,'utf8');
patient=replaceRequired(patient,"const TARGETS=new Set(['path','plan','documents']);","const TARGETS=new Set(['plan','documents']);",'patient-v4 path ownership');
patient=replaceRequired(patient,"function client(){return createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}","function client(){return window.KomoRuntime?.client||createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}",'patient-v4 shared client');
patient=replaceRequired(patient,"function schedule(force=false){clearTimeout(scheduled);scheduled=setTimeout(()=>render(force),force?80:35)}","function schedule(force=false){clearTimeout(scheduled);scheduled=setTimeout(()=>{const r=route(),root=document.querySelector('#viewRoot');if(!force&&root?.querySelector(`[data-patient-v4=\"${r}\"]`))return;render(force)},force?80:35)}",'patient-v4 render dedupe');
if(!patient.includes("window.addEventListener('komo:data-ready',()=>schedule(false));"))patient=patient.replace("window.addEventListener('hashchange',()=>schedule(false));","window.addEventListener('hashchange',()=>schedule(false));window.addEventListener('komo:data-ready',()=>schedule(false));");
fs.writeFileSync(files.patient,patient);

// Progression: preserve the current Trajectory owner when present; only patch
// the historical renderer on older builds.
let progression=fs.readFileSync(files.progression,'utf8');
if(progression.includes('[data-ktrajectory-v1]')){
  const stableCurrent=progression.includes("key===lastKey&&root.querySelector('[data-ktrajectory-v1]')")&&progression.includes("!document.querySelector('[data-ktrajectory-v1]')");
  if(!stableCurrent){console.error('[pulse-flicker] current trajectory is missing its mount guard');process.exit(1)}
}else{
  progression=replaceRequired(progression,"async function mount(){if(location.hash!=='#path'||!memberMode()||busy)return;","async function mount(force=false){if(location.hash!=='#path'||!memberMode()||busy||(!force&&document.querySelector('[data-kpv2]')))return;",'progression mount guard');
  progression=replaceRequired(progression,"function schedule(){clearTimeout(timer);timer=setTimeout(mount,170)}","function schedule(force=false){clearTimeout(timer);timer=setTimeout(()=>mount(force),120)}",'progression schedule guard');
  progression=progression.replace("document.querySelector('#refreshButton')?.addEventListener('click',()=>setTimeout(schedule,300));","document.querySelector('#refreshButton')?.addEventListener('click',()=>setTimeout(()=>schedule(true),300));");
  if(!progression.includes("window.addEventListener('komo:data-ready',schedule);"))progression=progression.replace("window.addEventListener('komo:route-ready',schedule);","window.addEventListener('komo:route-ready',schedule);window.addEventListener('komo:data-ready',schedule);");
}
fs.writeFileSync(files.progression,progression);

// Results: preserve the current patient-results owner when present; only patch
// the historical additive renderer on older builds.
let results=fs.readFileSync(files.results,'utf8');
if(results.includes('[data-kresults-v1]')){
  const stableCurrent=results.includes("key===lastKey&&root.querySelector('[data-kresults-v1]')")&&results.includes("!document.querySelector('[data-kresults-v1]')");
  if(!stableCurrent){console.error('[pulse-flicker] current results view is missing its mount guard');process.exit(1)}
}else{
  results=replaceRequired(results,"async function mount(){if(busy||route()!=='results'||!memberMode())return;","async function mount(force=false){if(busy||route()!=='results'||!memberMode()||(!force&&document.querySelector('[data-krmj]')))return;",'results mount guard');
  results=replaceRequired(results,"function schedule(){clearTimeout(timer);timer=setTimeout(()=>mount(),160)}","function schedule(force=false){clearTimeout(timer);timer=setTimeout(()=>mount(force),120)}",'results schedule guard');
  results=results.replace("window.addEventListener('komo:questionnaire-saved',schedule);","window.addEventListener('komo:questionnaire-saved',()=>schedule(true));");
  results=results.replace("window.addEventListener('komo:myocare-imported',schedule);","window.addEventListener('komo:myocare-imported',()=>schedule(true));");
  results=results.replace("window.addEventListener('komo:motion-v05-release',schedule);","window.addEventListener('komo:motion-v05-release',()=>schedule(true));");
  if(!results.includes("window.addEventListener('komo:data-ready',schedule);"))results=results.replace("window.addEventListener('komo:route-ready',schedule);","window.addEventListener('komo:route-ready',schedule);window.addEventListener('komo:data-ready',schedule);");
}
fs.writeFileSync(files.results,results);

// Clinical cockpit becomes the visible owner immediately. Motion renders inside
// its host instead of painting a full temporary page and being wrapped later.
let cockpit=fs.readFileSync(files.cockpit,'utf8');
cockpit=cockpit.replace("function sb(){if(!s.client)s.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return s.client}","function sb(){return window.KomoRuntime?.client||(s.client||(s.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}");
const wrapPattern=/async function wrap\(\)\{.*?\}\nasync function refresh\(\)/s;
const stableWrap=`async function wrap(){if(wrapping||route()!=='clinical')return;const root=document.querySelector('#viewRoot');if(!root||root.querySelector('[data-clinical-cockpit-v1]'))return;wrapping=true;try{root.innerHTML=shell();bindShell();if(!s.loaded)await load();if(!isPro()){root.innerHTML='';return}render();window.dispatchEvent(new CustomEvent('komo:clinical-cockpit-ready'))}catch(e){console.error('[clinical-cockpit]',e)}finally{wrapping=false}}\nasync function refresh()`;
if(!cockpit.includes("new CustomEvent('komo:clinical-cockpit-ready')")){
  if(!wrapPattern.test(cockpit)){console.error('[pulse-flicker] missing clinical cockpit wrap');process.exit(1)}
  cockpit=cockpit.replace(wrapPattern,stableWrap);
}
cockpit=cockpit.replace("function schedule(){clearTimeout(timer);timer=setTimeout(wrap,60)}","function schedule(){clearTimeout(timer);timer=setTimeout(wrap,20)}");
if(!cockpit.includes("window.addEventListener('komo:data-ready',schedule);"))cockpit=cockpit.replace("window.addEventListener('hashchange',()=>{if(route()==='clinical'){s.loaded=false;schedule()}});","window.addEventListener('hashchange',()=>{if(route()==='clinical'){s.loaded=false;schedule()}});window.addEventListener('komo:data-ready',schedule);");
fs.writeFileSync(files.cockpit,cockpit);

let motion=fs.readFileSync(files.motion,'utf8');
motion=motion.replace("function sb(){if(!st.client)st.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return st.client}","function sb(){return window.KomoRuntime?.client||(st.client||(st.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}");
const oldRenderPrefix="function render(){const root=document.querySelector('#viewRoot');if(!root)return;document.querySelector('#pageEyebrow').textContent='KŌMØ CLINICAL · PRO';document.querySelector('#pageTitle').textContent='Motion workspace';";
const newRenderPrefix="function render(){const cockpitHost=document.querySelector('#kcpMotionHost');const root=cockpitHost||document.querySelector('#viewRoot');if(!root)return;if(!cockpitHost){document.querySelector('#pageEyebrow').textContent='KŌMØ CLINICAL · PRO';document.querySelector('#pageTitle').textContent='Motion workspace'}";
motion=replaceRequired(motion,oldRenderPrefix,newRenderPrefix,'clinical motion host ownership');
motion=replaceRequired(motion,"async function refresh(){if(route()!=='clinical'||rendering)return;","async function refresh(force=false){if(route()!=='clinical'||rendering||(!force&&document.querySelector('#kcpMotionHost [data-clinical-motion-v1]')))return;",'clinical motion render guard');
motion=replaceRequired(motion,"function schedule(){clearTimeout(timer);timer=setTimeout(refresh,50)}","function schedule(force=false){clearTimeout(timer);timer=setTimeout(()=>refresh(force),80)}",'clinical motion schedule');
if(!motion.includes("window.addEventListener('komo:data-ready',schedule);"))motion=motion.replace("window.addEventListener('hashchange',schedule);","window.addEventListener('hashchange',schedule);window.addEventListener('komo:data-ready',schedule);");
fs.writeFileSync(files.motion,motion);

let css=fs.readFileSync(files.css,'utf8');
if(!css.includes('/* Route stability */'))css+=`\n/* Route stability */\n.komo-route-loading{min-height:260px;display:grid;place-items:center;padding:32px;border:1px solid rgba(37,48,40,.08);border-radius:24px;background:rgba(255,255,255,.42);color:#7b817b;font-size:11px;letter-spacing:.02em}\n@media(max-width:767px){.komo-route-loading{min-height:180px;border-radius:20px}}\n`;
fs.writeFileSync(files.css,css);

console.log('[pulse-flicker] single-owner route rendering and stable clinical mounting applied');
