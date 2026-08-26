import {readFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const [html,patient,pro,inject,mig]=await Promise.all([
 readFile(join(root,'pulse-app','index.html'),'utf8'),
 readFile(join(root,'pulse-app','patient-onboarding-v1.js'),'utf8'),
 readFile(join(root,'pulse-app','pro-signup-identity-v1.js'),'utf8'),
 readFile(join(root,'scripts','auth-gateway-inject-v2.mjs'),'utf8'),
 readFile(join(root,'supabase','migrations','202608261145_signup_identity_profile_v1.sql'),'utf8')
]);
const syntax=['patient-onboarding-v1.js','pro-signup-identity-v1.js'].map(f=>[f,spawnSync(process.execPath,['--check',join(root,'pulse-app',f)],{encoding:'utf8'})]);
const common=['first_name','last_name','birth_date','phone','address_line1','postal_code','city','country','email'];
const checks=[
 ['signup JavaScript parses',syntax.every(([,r])=>r.status===0)],
 ['patient onboarding injected',inject.includes('./patient-onboarding-v1.js')&&inject.includes('./patient-onboarding-v1.css')],
 ['professional identity patch injected',inject.includes('./pro-signup-identity-v1.js')&&inject.includes('./signup-identity-v1.css')],
 ['patient captures complete common identity',common.every(k=>patient.includes(`name="${k}"`)||patient.includes(`${k}:`))],
 ['professional captures complete common identity',common.every(k=>pro.includes(`name="${k}"`)||pro.includes(`${k}:`))],
 ['patient signup persists identity metadata',common.filter(k=>k!=='email').every(k=>patient.includes(`${k}:`))],
 ['professional signup persists identity metadata',common.filter(k=>k!=='email').every(k=>pro.includes(`${k}:`))],
 ['professional signup remains approval gated',pro.includes('komo_pro_application:true')&&pro.includes("komo_pro_access_scope")&&pro.includes("professional-application"))],
 ['patient signup redirects to KŌMØ Check handoff',patient.includes('?start=check')&&patient.includes('Commencer mon KŌMØ Check')&&patient.includes("location.hash='results'"))],
 ['patient handoff is one-time guarded',patient.includes('handoffShown')&&patient.includes('clearStart()')),
 ['profiles schema tracks address fields',mig.includes('address_line1')&&mig.includes('postal_code')),
 ['built Pulse HTML receives onboarding assets',html.includes('./patient-onboarding-v1.js')&&html.includes('./pro-signup-identity-v1.js')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);
if(failed.length){for(const [f,r] of syntax)if(r.status!==0)console.error(`[${f}] ${r.stderr||r.stdout}`);console.error('[signup-onboarding-qa-v1] failed: '+failed.join(', '));process.exit(1)}
console.log(`[signup-onboarding-qa-v1] ${checks.length} checks passed.`);
