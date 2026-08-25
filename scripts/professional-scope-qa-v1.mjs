import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const [html,form,scope,admin,proAccess,submitFn,adminFn]=await Promise.all([
  readFile(join(root,'pulse-app','index.html'),'utf8'),
  readFile(join(root,'pulse-app','professional-application-v1.js'),'utf8'),
  readFile(join(root,'pulse-app','professional-scope-v1.js'),'utf8'),
  readFile(join(root,'pulse-app','professional-admin-v1.js'),'utf8'),
  readFile(join(root,'pulse-app','pro-access-v1.js'),'utf8'),
  readFile(join(root,'supabase','functions','professional-application','index.ts'),'utf8'),
  readFile(join(root,'supabase','functions','professional-admin','index.ts'),'utf8')
]);
const checks=[
 ['Pro label',html.includes('data-mode="clinical">Pro</button>')],
 ['application assets',html.includes('professional-application-v1.js')&&html.includes('professional-application-v1.css')],
 ['scope gate asset',html.includes('professional-scope-v1.js')],
 ['Motion option without RPPS copy',form.includes('KŌMØ Motion')&&form.includes('Aucun RPPS requis')],
 ['Clinical option registration required',form.includes('KŌMØ Clinical')&&form.includes('registration_identifier')&&form.includes('registration_system')],
 ['authenticated application function',submitFn.includes('auth.getUser')&&submitFn.includes('professional_applications')],
 ['email admin notification',submitFn.includes('RESEND_API_KEY')&&submitFn.includes('contact@komolongevity.com')],
 ['Motion offer enum used',submitFn.includes('pulse_motion')],
 ['admin lists access scope',adminFn.includes('access_scope')&&admin.includes('Motion Operator')&&admin.includes('Clinical Practitioner')],
 ['membership entitlement persisted',adminFn.includes('access_scope:scope')],
 ['Motion-only hides Clinical functions',scope.includes("['validation','plans']")&&scope.includes("scope!=='motion'")],
 ['professional intent supports applicants',proAccess.includes('demander un accès Motion ou Clinical')&&!proAccess.includes('Ce compte ne dispose pas d’un accès professionnel')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);if(failed.length){console.error(`[professional-scope-qa-v1] failed: ${failed.join(', ')}`);process.exit(1)}console.log(`[professional-scope-qa-v1] ${checks.length} checks passed.`);
