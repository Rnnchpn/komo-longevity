import { readFile } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const [html,app,auth]=await Promise.all([
  readFile(join(root,'site','pulse-v12','index.html'),'utf8'),
  readFile(join(root,'site','pulse-v12','app.js'),'utf8'),
  readFile(join(root,'site','pulse-v12','auth-gateway-v2.js'),'utf8')
]);
const checks=[
  ['admin route recognized',app.includes("'profile','admin'")&&app.includes("route==='admin'&&state.role!=='admin'")],
  ['admin route mount exists',app.includes('data-admin-route-mount')],
  ['auth gateway assets loaded',html.includes('./auth-gateway-v2.css')&&html.includes('./auth-gateway-v2.js')],
  ['patient professional switch',auth.includes('Patient')&&auth.includes('Professionnel')&&auth.includes('data-auth-audience')],
  ['professional login copy',auth.includes('Se connecter à KŌMØ Pro')],
  ['professional account request entry',auth.includes('Demander un compte professionnel')],
  ['professional request creates Pulse account',auth.includes('auth.signUp')&&auth.includes('emailRedirectTo')],
  ['professional application fields',auth.includes('professional_title')&&auth.includes('organization_name')&&auth.includes('access_scope')],
  ['clinical registry gate',auth.includes('registration_system')&&auth.includes('registration_identifier')],
  ['pending request resumes after confirmation',auth.includes('komo_pending_pro_application_v1')&&auth.includes('attemptPending')],
  ['professional application endpoint used',auth.includes("functions.invoke('professional-application'")]
];
const failed=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('[auth-admin-entry-qa-v2] failed: '+failed.join(', '));process.exit(1)}
console.log(`[auth-admin-entry-qa-v2] ${checks.length} checks passed.`);