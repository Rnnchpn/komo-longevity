import { readFile, writeFile } from 'node:fs/promises';
const cockpitPath='pulse-app/clinical-cockpit-v1.js';
const indexPath='pulse-app/index.html';
let src=await readFile(cockpitPath,'utf8');
const replacements=[
  ["const K={patient:'komo_clinical_patient',assessment:'komo_clinical_assessment',tab:'komo_clinical_tab'};","const K={patient:'komo_clinical_patient',assessment:'komo_clinical_assessment',tab:'komo_clinical_tab',org:'komo_clinical_org'};"],
  ["const s={client:null,session:null,role:'member',org:null,patients:[],assessments:[],scores:[],imports:[],priorities:[],contexts:[],appointments:[],patient:null,assessment:null,tab:localStorage.getItem(K.tab)||'dashboard',loaded:false};","const s={client:null,session:null,role:'member',org:null,membership:null,memberships:[],patients:[],assessments:[],scores:[],imports:[],priorities:[],contexts:[],appointments:[],patient:null,assessment:null,tab:localStorage.getItem(K.tab)||'dashboard',loaded:false};"],
  [".select('organization_id,status,organizations(id,name,slug,clinical_data_status,status)')",".select('organization_id,role,access_scope,status,organizations(id,name,slug,clinical_data_status,status)')"],
  ["const memberships=om.data||[],m=memberships.find(x=>x.organizations?.slug==='komo-poc')||memberships[0];s.org=m?.organizations||null;","const memberships=om.data||[];s.memberships=memberships;const savedOrg=localStorage.getItem(K.org),m=memberships.find(x=>x.organization_id===savedOrg)||memberships[0];s.membership=m||null;s.org=m?.organizations||null;if(s.org)localStorage.setItem(K.org,s.org.id);"],
  ["<div class=\"kcp-org\"><span>Organisation</span><strong>${esc(s.org?.name||'—')}</strong><small>${esc(s.org?.clinical_data_status||'—')}</small></div>","<div class=\"kcp-org\"><span>Centre actif</span>${s.memberships.length>1?`<select data-kcp-org-select aria-label=\"Choisir le centre actif\">${s.memberships.map(m=>`<option value=\"${m.organization_id}\" ${m.organization_id===s.org?.id?'selected':''}>${esc(m.organizations?.name||'Centre KŌMØ')}</option>`).join('')}</select>`:`<strong>${esc(s.org?.name||'—')}</strong>`}<small>${esc(s.membership?.role||'—')} · ${esc(s.membership?.access_scope||'—')} · ${esc(s.org?.clinical_data_status||'—')}</small></div>"],
  ["<h3>Patients</h3><p>Dossier transversal relié à Motion, Clinical, plans et rendez-vous.</p>","<h3>${['owner','clinical_admin'].includes(s.membership?.role)?'Patients du centre':'Mes patients'}</h3><p>${['owner','clinical_admin'].includes(s.membership?.role)?'Tous les dossiers autorisés dans ce centre.':'Uniquement les patients qui vous sont explicitement affectés.'}</p>"]
];
for(const [from,to] of replacements){if(!src.includes(from))throw new Error('[clinical-multicenter-v1] expected source fragment missing: '+from.slice(0,70));src=src.replace(from,to)}
await writeFile(cockpitPath,src);

let html=await readFile(indexPath,'utf8');
if(!html.includes('./center-context-v1.css')) html=html.replace('<link rel="stylesheet" href="./admin-console-v2.css" />','<link rel="stylesheet" href="./admin-console-v2.css" />\n  <link rel="stylesheet" href="./center-context-v1.css" />');
if(!html.includes('./center-context-v1.js')) html=html.replace('<script type="module" src="./admin-console-v2.js"></script>','<script type="module" src="./admin-console-v2.js"></script>\n  <script src="./center-context-v1.js"></script>');
await writeFile(indexPath,html);
console.log('[clinical-multicenter-v1] multi-center organization, patient visibility and assets applied');
