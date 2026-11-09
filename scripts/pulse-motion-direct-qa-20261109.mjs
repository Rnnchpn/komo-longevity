import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const app=await readFile(join(root,'site/pulse-v14/app.js'),'utf8');
const maison=await readFile(join(root,'site/pulse-v14/maison-entry-v1.js'),'utf8');
const css=await readFile(join(root,'site/pulse-v14/styles.css'),'utf8');
const parse=path=>spawnSync(process.execPath,['--check',join(root,path)],{encoding:'utf8'}).status===0;
const checks=[
  ['entry scripts parse',parse('site/pulse-v14/app.js')&&parse('site/pulse-v14/maison-entry-v1.js')],
  ['online offer preserved',maison.includes('data-maison-choice="online"')&&maison.includes('39 €')],
  ['onsite Motion is direct',maison.includes('data-maison-choice="motion"')&&maison.includes("show('motion')")],
  ['no account request or approval form',!maison.includes('maisonRequestForm')&&!maison.includes('maisonNewAccount')&&!maison.includes("operator-requests-v1.js")],
  ['existing patient login preserved',maison.includes("show('login')")&&app.includes("signInWithPassword")],
  ['operator creates through protected Edge Function',app.includes("sb.functions.invoke('professional-patient'")&&app.includes("organization_id:S.org.id")&&app.includes("create_account:false")],
  ['creation bound to operator patient directory',app.includes("id=\"opPatientCreateForm\"")&&app.includes("localStorage.setItem('komo_v14_patient',data.patient.id)")&&app.includes("await loadPro()")],
  ['no anonymous patient write',!maison.includes("from('patients')")&&!app.includes("from('patients').insert(")],
  ['real health records not activated before HDS/security clearance',app.includes("Environnement non validé pour de vraies données de santé")],
  ['operator layout available',css.includes('.op-create-patient-form')&&css.includes('op-create-patient-grid')]
];
const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks)console.log(`[motion-direct] ${ok?'PASS':'FAIL'} ${name}`);
if(failed.length)process.exit(1);
console.log('[motion-direct] Patient access simplified; secure operator dossier flow prepared.');
