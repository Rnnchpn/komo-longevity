import { readFile } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const [html,profile,intake,fn,migration,adminFn]=await Promise.all([
  readFile(join(root,'pulse-app','index.html'),'utf8'),
  readFile(join(root,'pulse-app','profile-v2.js'),'utf8'),
  readFile(join(root,'pulse-app','patient-intake-v1.js'),'utf8'),
  readFile(join(root,'supabase','functions','patient-intake','index.ts'),'utf8'),
  readFile(join(root,'supabase','migrations','20260825214500_patient_intake_and_self_service_profiles.sql'),'utf8'),
  readFile(join(root,'supabase','functions','professional-admin','index.ts'),'utf8')
]);
const checks=[
 ['profile assets loaded',html.includes('./profile-v2.js')&&html.includes('./profile-v2.css')],
 ['intake assets loaded',html.includes('./patient-intake-v1.js')&&html.includes('./patient-intake-v1.css')],
 ['profile self update',profile.includes("from('profiles').update")&&profile.includes("auth.updateUser({email")],
 ['profile password recovery',profile.includes('resetPasswordForEmail')&&profile.includes('/reset/')],
 ['patient Motion request CTA',intake.includes('Demander KŌMØ Motion')&&intake.includes("action:'submit'")],
 ['professional request queue',intake.includes("action:S.role==='admin'?'list_admin':'list_pro'")&&intake.includes('Demandes')],
 ['admin assignment',intake.includes("action:'assign'")&&intake.includes('organization_id')],
 ['professional accepts into Motion',intake.includes("action:'accept'")&&intake.includes('komo_clinical_assessment')&&intake.includes("'motion'"))],
 ['server requires authenticated user',fn.includes('auth.getUser(token)')&&fn.includes('unauthorized')],
 ['server profile completeness gate',fn.includes('profile_incomplete')&&fn.includes('birth_date')&&fn.includes('sex_at_birth')],
 ['server patient creation and Motion assessment',fn.includes('from("patients")')&&fn.includes('create_pulse_assessment')],
 ['server assignment and email',fn.includes('action==="assign"')&&fn.includes('RESEND_API_KEY')],
 ['patient request RLS tracked',migration.includes('enable row level security')&&migration.includes('patient_service_requests_select_self')],
 ['professional approval sends activation email',adminFn.includes('Votre accès KŌMØ Pro est activé')&&adminFn.includes('email_sent')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);if(failed.length){console.error('[intake-profile-qa-v1] failed: '+failed.join(', '));process.exit(1)}console.log(`[intake-profile-qa-v1] ${checks.length} checks passed.`);
