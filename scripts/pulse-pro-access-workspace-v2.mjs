import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const centerPath=join(pulse,'center-two-tab-workspace-v1.js');
const authPath=join(pulse,'auth-gateway-v2.js');
const proPath=join(pulse,'pro-architecture-v2.js');
let center=await readFile(centerPath,'utf8');
let pro=await readFile(proPath,'utf8');
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
  "const patients=selectedRows(),activeOrg=orgs().find(o=>o.id===S.orgId)||orgs()[0]||null,list=patients.filter(x=>x.next_appointment&&!['cancelled','completed','no_show'].includes(x.next_appointment.status)).sort((a,b)=>new Date(a.next_appointment.scheduled_start)-new Date(b.next_appointment.scheduled_start)),todayKey=new Date().toDateString(),today=list.filter(x=>new Date(x.next_appointment.scheduled_start).toDateString()===todayKey).length,ready=list.filter(x=>x.pre_bilan?.complete===true||Number(x.pre_bilan?.completed||0)>=6).length,scored=patients.filter(x=>x.score?.motion_score!=null).length;",
  'Pro KPI model'
);

must(
  '<header class="k2tw-head"><div><p class="eyebrow">KŌMØ CENTRE · MYODEV</p><h2>Attribuer une consultation Motion.</h2><p>Choisissez un patient, attribuez sa consultation, puis retrouvez son pré-bilan avant la réalisation des mesures Myodev.</p></div><div class="k2tw-tools"><label><span>Recherche</span>',
  '<header class="k2tw-head"><div class="k2tw-head-copy"><p class="eyebrow">KŌMØ PRO · AUJOURD’HUI</p><h2>Votre journée au centre.</h2><p>Commencez ici : consultations à venir, patients prêts pour Motion et dossiers qui nécessitent votre attention.</p>${activeOrg?\`<span class="k2tw-centre-label">\${esc(activeOrg.name)}</span>\`:\'\'}</div><div class="k2tw-tools"><label><span>Centre</span><select id="k2twOrg">${orgs().map(o=>\`<option value="\${o.id}" \${o.id===S.orgId?\'selected\':\'\'}>\${esc(o.name)}</option>\`).join(\'\')}</select></label><label><span>Rechercher dans les consultations</span>',
  'Pro hero and centre selector'
);

must(
  '<div class="k2tw-kpis"><div class="k2tw-kpi"><span>Attribuées</span><strong>${assigned}</strong></div><div class="k2tw-kpi"><span>Prêtes</span><strong>${ready}</strong></div><div class="k2tw-kpi"><span>Bilans réalisés</span><strong>${scored}</strong></div><div class="k2tw-kpi"><span>Patients</span><strong>${list.length}</strong></div></div>',
  '<div class="k2tw-kpis"><div class="k2tw-kpi"><span>Consultations aujourd’hui</span><strong>${today}</strong><small>${today?\'à traiter aujourd’hui\':\'aucune consultation aujourd’hui\'}</small></div><div class="k2tw-kpi"><span>Prêts pour Motion</span><strong>${ready}</strong><small>pré-bilan 6/6 terminé</small></div><div class="k2tw-kpi"><span>Bilans réalisés</span><strong>${scored}</strong><small>Motion Score disponible</small></div><div class="k2tw-kpi"><span>Patients du centre</span><strong>${patients.length}</strong><small>registre complet dans « Patients »</small></div></div><div class="k2tw-section-label"><div><p class="eyebrow">PROCHAINES CONSULTATIONS</p><h3>${list.length?\'Ce qui arrive maintenant.\':\'Aucune consultation attribuée.\'}</h3></div><button type="button" class="k2tw-btn" data-k2tw-go-patients>Ouvrir le registre patients →</button></div>',
  'Pro KPI copy'
);

must(
  "function bindPatients(){document.querySelector('#k2twSearch')?.addEventListener('input',",
  "function bindPatients(){document.querySelector('#k2twOrg')?.addEventListener('change',e=>{S.orgId=e.target.value;localStorage.setItem(ORG_KEY,S.orgId);localStorage.removeItem(PATIENT_KEY);localStorage.removeItem(ASSESSMENT_KEY);S.search='';renderPatients()});document.querySelector('#k2twSearch')?.addEventListener('input',",
  'multi-centre selector binding'
);

pro=pro.replace("navItem('planning','Consultations',icons.planning)","navItem('planning','Aujourd’hui',icons.planning)");
center=center.replace(/<span>Consultation<\/span>/g,'<span>Prochain rendez-vous</span>').replace(/<span>Questionnaires<\/span>/g,'<span>Pré-bilan patient</span>').replace(/<span>Motion Score<\/span>/g,'<span>Résultat</span>');
center=center.replace("function bindPatients(){document.querySelector('#k2twOrg')?.addEventListener('change',","function bindPatients(){document.querySelector('[data-k2tw-go-patients]')?.addEventListener('click',()=>window.KomoPatientManagement?.open?.());document.querySelector('#k2twOrg')?.addEventListener('change',");
const dossierMarker='<p class="eyebrow">CONSULTATION MOTION</p>';
const dossierIndex=center.indexOf(dossierMarker);
if(dossierIndex>=0){
  const gridToken='</header><div class="k2tw-grid">';
  const gridIndex=center.indexOf(gridToken,dossierIndex);
  if(gridIndex>=0){
    const guidance=`</header><section class="k2tw-next-action"><div><small>PROCHAINE ACTION</small><strong>\${!appt?'Attribuer la consultation':!ready?'Pré-bilan à compléter · '+c.qs+'/6':!imports.length?'Charger l’analyse Motion':score==null?'Finaliser l’analyse Motion':'Résultat disponible'}</strong><span>\${!appt?'Le parcours patient démarre après attribution.':!ready?'Le patient doit terminer les six questionnaires avant les mesures.':!imports.length?'Le patient est prêt pour l’acquisition Myodev / MyoCare.':score==null?'Les données sont chargées : poursuivez l’analyse.':'Le bilan est prêt à être relu et restitué.'}</span></div>\${!appt?'<button class="k2tw-btn primary" data-k2tw-dossier-assign>Attribuer maintenant</button>':ready&&!imports.length?'<button class="k2tw-btn primary" data-k2tw-import>Charger Motion</button>':score!=null?'<button class="k2tw-btn primary" data-k2tw-results>Voir les résultats</button>':''}</section><div class="k2tw-flow"><span class="\${appt?'done':'active'}"><b>1</b> Consultation</span><span class="\${ready?'done':appt?'active':''}"><b>2</b> Pré-bilan</span><span class="\${imports.length?'done':ready?'active':''}"><b>3</b> Motion</span><span class="\${score!=null?'done':imports.length?'active':''}"><b>4</b> Résultat</span></div><div class="k2tw-grid">`;
    center=center.slice(0,gridIndex)+guidance+center.slice(gridIndex+gridToken.length);
  }
}
await writeFile(centerPath,center,'utf8');
await writeFile(proPath,pro,'utf8');

const checks=[
  ['professional login copy',auth.includes("title.textContent=pro?'KŌMØ Pro':'Bienvenue'")&&auth.includes("submit.textContent=pro?'Accéder à mon centre':'Se connecter'")],
  ['professional manifesto',auth.includes("Votre centre,<br><em>en mouvement.</em>")],
  ['workspace title',center.includes("textContent='KŌMØ PRO'")&&center.includes("textContent='Centre'")],
  ['centre selector',center.includes('id="k2twOrg"')&&center.includes("localStorage.setItem(ORG_KEY,S.orgId)")],
  ['desktop operational KPIs',center.includes('Consultations aujourd’hui')&&center.includes('Prêts pour Motion')&&center.includes('Patients du centre')],
  ['cabinet start screen is operational',center.includes('Votre journée au centre.')&&center.includes('PROCHAINES CONSULTATIONS')&&center.includes('Ouvrir le registre patients')],
  ['dossier next action guidance',center.includes('PROCHAINE ACTION')&&center.includes('k2tw-flow')&&center.includes('Pré-bilan à compléter')],
  ['single canonical workspace',center.includes('window.KomoCenterWorkspace={openConsultations,openPatients,openCentre:openConsultations,openDossier}')],
  ['Pro navigation says Today',pro.includes("navItem('planning','Aujourd’hui'" )],
  ['legacy Myodev page title retired',!center.includes("textContent='Myodev'")]
];
for(const [label,ok] of checks)console.log('[pro-access-v2] '+(ok?'OK':'FAIL')+' · '+label);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pro-access-v2] PASS · KŌMØ Pro access + multi-centre desktop workspace');
