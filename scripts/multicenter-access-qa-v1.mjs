import { readFile } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const [html,cockpit,context]=await Promise.all([
  readFile(join(root,'site','pulse-v12','index.html'),'utf8'),
  readFile(join(root,'site','pulse-v12','clinical-cockpit-v1.js'),'utf8'),
  readFile(join(root,'site','pulse-v12','center-context-v1.js'),'utf8')
]);
const checks=[
  ['center context assets loaded',html.includes('./center-context-v1.js')&&html.includes('./center-context-v1.css')],
  ['saved center context',cockpit.includes("org:'komo_clinical_org'")&&context.includes("ORG_KEY='komo_clinical_org'")],
  ['organization memberships include role and scope',cockpit.includes("organization_id,role,access_scope,status")],
  ['center switcher rendered for multi memberships',cockpit.includes('data-kcp-org-select')&&cockpit.includes('Centre actif')],
  ['center switch resets patient context',context.includes("localStorage.removeItem(PATIENT_KEY)")&&context.includes("localStorage.removeItem(ASSESSMENT_KEY)")],
  ['patient list distinguishes managers',cockpit.includes('Patients du centre')&&cockpit.includes('Mes patients')],
  ['standard professional copy states assignment boundary',cockpit.includes('Uniquement les patients qui vous sont explicitement affectés.')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);
if(failed.length){console.error('[multicenter-access-qa-v1] failed: '+failed.join(', '));process.exit(1)}
console.log(`[multicenter-access-qa-v1] ${checks.length} checks passed.`);
