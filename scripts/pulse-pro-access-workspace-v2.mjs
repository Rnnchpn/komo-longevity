import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const centerPath=join(pulse,'center-two-tab-workspace-v1.js');
const authPath=join(pulse,'auth-gateway-v2.js');
let center=await readFile(centerPath,'utf8');
const auth=await readFile(authPath,'utf8');

const must=(before,after,label)=>{
  if(!center.includes(before))throw new Error('[pro-access-v2] missing '+label);
  center=center.replace(before,after);
};

must(
  "document.querySelector('#pageEyebrow').textContent='KŌMØ CENTRE';document.querySelector('#pageTitle').textContent='Myodev';",
  "document.querySelector('#pageEyebrow').textContent='KŌMØ PRO';document.querySelector('#pageTitle').textContent='Centre';",
  'Pro chrome title'
);

must(
  "const list=selectedRows(),assigned=list.filter(x=>x.next_appointment).length,ready=list.filter(x=>x.next_appointment&&(x.pre_bilan?.complete===true||Number(x.pre_bilan?.completed||0)>=6)).length,scored=list.filter(x=>x.score?.motion_score!=null).length;",
  "const list=selectedRows(),activeOrg=orgs().find(o=>o.id===S.orgId)||orgs()[0]||null,todayKey=new Date().toDateString(),today=list.filter(x=>x.next_appointment&&new Date(x.next_appointment.scheduled_start).toDateString()===todayKey).length,ready=list.filter(x=>x.next_appointment&&(x.pre_bilan?.complete===true||Number(x.pre_bilan?.completed||0)>=6)).length,scored=list.filter(x=>x.score?.motion_score!=null).length;",
  'Pro KPI model'
);

must(
  '<header class="k2tw-head"><div><p class="eyebrow">KŌMØ CENTRE · MYODEV</p><h2>Attribuer une consultation Motion.</h2><p>Choisissez un patient, attribuez sa consultation, puis retrouvez son pré-bilan avant la réalisation des mesures Myodev.</p></div><div class="k2tw-tools"><label><span>Recherche</span>',
  '<header class="k2tw-head"><div class="k2tw-head-copy"><p class="eyebrow">KŌMØ PRO · CENTRE</p><h2>Votre activité Motion.</h2><p>Consultations, préparation patient et analyses réunies dans un seul workspace professionnel.</p>${activeOrg?\`<span class="k2tw-centre-label">\${esc(activeOrg.name)}</span>\`:\'\'}</div><div class="k2tw-tools"><label><span>Centre</span><select id="k2twOrg">${orgs().map(o=>\`<option value="\${o.id}" \${o.id===S.orgId?\'selected\':\'\'}>\${esc(o.name)}</option>\`).join(\'\')}</select></label><label><span>Recherche</span>',
  'Pro hero and centre selector'
);

must(
  '<div class="k2tw-kpis"><div class="k2tw-kpi"><span>Attribuées</span><strong>${assigned}</strong></div><div class="k2tw-kpi"><span>Prêtes</span><strong>${ready}</strong></div><div class="k2tw-kpi"><span>Bilans réalisés</span><strong>${scored}</strong></div><div class="k2tw-kpi"><span>Patients</span><strong>${list.length}</strong></div></div>',
  '<div class="k2tw-kpis"><div class="k2tw-kpi"><span>Aujourd’hui</span><strong>${today}</strong><small>consultation${today===1?\'\':\'s\'} planifiée${today===1?\'\':\'s\'}</small></div><div class="k2tw-kpi"><span>Prêts pour Motion</span><strong>${ready}</strong><small>pré-bilan 6/6 terminé</small></div><div class="k2tw-kpi"><span>Bilans réalisés</span><strong>${scored}</strong><small>Motion Score disponible</small></div><div class="k2tw-kpi"><span>Patients</span><strong>${list.length}</strong><small>dans le centre sélectionné</small></div></div>',
  'Pro KPI copy'
);

must(
  "function bindPatients(){document.querySelector('#k2twSearch')?.addEventListener('input',",
  "function bindPatients(){document.querySelector('#k2twOrg')?.addEventListener('change',e=>{S.orgId=e.target.value;localStorage.setItem(ORG_KEY,S.orgId);localStorage.removeItem(PATIENT_KEY);localStorage.removeItem(ASSESSMENT_KEY);S.search='';renderPatients()});document.querySelector('#k2twSearch')?.addEventListener('input',",
  'multi-centre selector binding'
);

await writeFile(centerPath,center,'utf8');

const checks=[
  ['professional login copy',auth.includes("title.textContent=pro?'KŌMØ Pro':'Bienvenue'")&&auth.includes("submit.textContent=pro?'Accéder à mon centre':'Se connecter'")],
  ['professional manifesto',auth.includes("Votre centre,<br><em>en mouvement.</em>")],
  ['workspace title',center.includes("textContent='KŌMØ PRO'")&&center.includes("textContent='Centre'")],
  ['centre selector',center.includes('id="k2twOrg"')&&center.includes("localStorage.setItem(ORG_KEY,S.orgId)")],
  ['desktop operational KPIs',center.includes('Aujourd’hui')&&center.includes('Prêts pour Motion')&&center.includes('Motion Score disponible')],
  ['single canonical workspace',center.includes('window.KomoCenterWorkspace={openConsultations,openPatients,openCentre:openConsultations,openDossier}')],
  ['legacy Myodev page title retired',!center.includes("textContent='Myodev'")]
];
for(const [label,ok] of checks)console.log('[pro-access-v2] '+(ok?'OK':'FAIL')+' · '+label);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pro-access-v2] PASS · KŌMØ Pro access + multi-centre desktop workspace');
