import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const file=join(root,'site','pulse-v12','app.js');
let app=await readFile(file,'utf8');

const legacyPrefix="function renderRoute(route){renderNavigation();if(['documents','plan','messages'].includes(route)){els.viewRoot.innerHTML='<div class=\"empty-state\">Chargement de votre espace…</div>';return}if(route==='admin')";
const stablePrefix="function renderRoute(route){renderNavigation();if(['path','documents','plan','messages','clinical'].includes(route))";

if(!app.includes(legacyPrefix)&&!app.includes(stablePrefix)){
  const pattern=/function renderRoute\(route\)\{[\s\S]*?\n\}\n\nfunction renderHome/;
  if(!pattern.test(app))throw new Error('[pulse-flicker-compat-freeze] modern renderRoute not found');
  const router=`function renderRoute(route){renderNavigation();if(['documents','plan','messages'].includes(route)){els.viewRoot.innerHTML='<div class="empty-state">Chargement de votre espace…</div>';return}if(route==='admin'){els.viewRoot.innerHTML='<div class="empty-state">Chargement de votre espace…</div>';return}\n  const pages={home:['KŌMØ PULSE','',renderHome],results:['VOS REPÈRES','Comprendre vos résultats.',renderResults],path:['VOTRE TRAJECTOIRE','La prochaine étape, simplement.',renderPath],explore:['L’ÉCOSYSTÈME KŌMØ','Explorer KŌMØ.',renderExplore],profile:['VOTRE COMPTE','Profil & accès.',renderProfile]};\n  const [eyebrow,title,renderer]=pages[route]||pages.home;\n  els.pageEyebrow.textContent=eyebrow;\n  els.pageTitle.textContent=title;\n  els.viewRoot.innerHTML=renderer();\n  if(route==='home'){window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:'home',source:'app-home-host'}}));window.KomoPatientHomeCommand?.refresh?.()}\n}\n\nfunction renderHome`;
  app=app.replace(pattern,router);
  await writeFile(file,app,'utf8');
  console.log('[pulse-flicker-compat-freeze] modern app router normalized for legacy flicker guard');
}else{
  console.log('[pulse-flicker-compat-freeze] compatible router already present');
}
