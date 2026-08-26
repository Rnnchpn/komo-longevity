import { readFile, writeFile } from 'node:fs/promises';
const path='pulse-app/clinical-cockpit-v1.js';
let src=await readFile(path,'utf8');
const replacements=[
  ["const K={patient:'komo_clinical_patient',assessment:'komo_clinical_assessment',tab:'komo_clinical_tab'};","const K={patient:'komo_clinical_patient',assessment:'komo_clinical_assessment',tab:'komo_clinical_tab',org:'komo_clinical_org'};"],
  ["const s={client:null,session:null,role:'member',org:null,patients:[],assessments:[],scores:[],imports:[],priorities:[],contexts:[],appointments:[],patient:null,assessment:null,tab:localStorage.getItem(K.tab)||'dashboard',loaded:false};","const s={client:null,session:null,role:'member',org:null,memberships:[],patients:[],assessments:[],scores:[],imports:[],priorities:[],contexts:[],appointments:[],patient:null,assessment:null,tab:localStorage.getItem(K.tab)||'dashboard',loaded:false};"],
  ["const memberships=om.data||[],m=memberships.find(x=>x.organizations?.slug==='komo-poc')||memberships[0];s.org=m?.organizations||null;","const memberships=om.data||[];s.memberships=memberships;const savedOrg=localStorage.getItem(K.org),m=memberships.find(x=>x.organization_id===savedOrg)||memberships[0];s.org=m?.organizations||null;if(s.org)localStorage.setItem(K.org,s.org.id);"],
  ["<div class=\"kcp-org\"><span>Organisation</span><strong>${esc(s.org?.name||'—')}</strong><small>${esc(s.org?.clinical_data_status||'—')}</small></div>","<div class=\"kcp-org\"><span>Centre actif</span>${s.memberships.length>1?`<select data-kcp-org-select aria-label=\"Choisir le centre actif\">${s.memberships.map(m=>`<option value=\"${m.organization_id}\" ${m.organization_id===s.org?.id?'selected':''}>${esc(m.organizations?.name||'Centre KŌMØ')}</option>`).join('')}</select>`:`<strong>${esc(s.org?.name||'—')}</strong>`}<small>${esc(s.org?.clinical_data_status||'—')}</small></div>"
];
for(const [from,to] of replacements){if(!src.includes(from))throw new Error('[clinical-multicenter-v1] expected source fragment missing');src=src.replace(from,to)}
await writeFile(path,src);
console.log('[clinical-multicenter-v1] multi-center organization context applied');
