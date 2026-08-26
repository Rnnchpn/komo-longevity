import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const html=await readFile(join(root,'pulse-app','index.html'),'utf8');
const ui=await readFile(join(root,'pulse-app','professional-admin-v1.js'),'utf8');
const css=await readFile(join(root,'pulse-app','professional-admin-v1.css'),'utf8');
const fn=await readFile(join(root,'supabase','functions','professional-admin','index.ts'),'utf8');
const checks=[
 ['admin assets loaded',html.includes('./professional-admin-v1.js')&&html.includes('./professional-admin-v1.css')],
 ['admin UI role gated',ui.includes("A.role==='admin'")&&ui.includes('data-kcp-admin-tab')],
 ['admin UI uses server function',ui.includes("functions.invoke('professional-admin'")],
 ['admin UI supports review approve decline',['review','approve','decline'].every(x=>ui.includes(`'${x}'`))],
 ['admin UI states test only boundary',ui.includes('test_only')&&css.includes('.kpa-security')],
 ['server requires authenticated admin',fn.includes('roleResult.data?.role !== "admin"')&&fn.includes('auth.getUser(token)')],
 ['server uses service role only server side',fn.includes('SUPABASE_SERVICE_ROLE_KEY')&&!ui.includes('SERVICE_ROLE')],
 ['approval uses transactional RPC',fn.includes('approve_professional_application_v1')&&fn.includes('uc.rpc')],
 ['transaction receives organization role',fn.includes('p_organization_role')&&fn.includes('requestedRole')],
 ['approval failure is surfaced',fn.includes('approval_failed')&&fn.includes('rpc.error.message')],
 ['activation email remains server side',fn.includes('Votre accès KŌMØ Pro est activé')&&fn.includes('email_sent')],
 ['responsive admin interface',css.includes('@media(max-width:700px)')]
];
const fail=checks.filter(([,ok])=>!ok).map(([n])=>n);if(fail.length){console.error('[professional-admin-qa-v1] failed: '+fail.join(', '));process.exit(1)}console.log(`[professional-admin-qa-v1] ${checks.length} checks passed.`);
