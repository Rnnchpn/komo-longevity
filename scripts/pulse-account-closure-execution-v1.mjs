import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const indexPath=join(target,'index.html');
const RELEASE='20260830-account-closure-execution-v1';

let html=await readFile(indexPath,'utf8');
html=html.replace(/\s*<script[^>]+src="\.\/account-access-gate-v1\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'');
html=html.replace('</body>',`  <script type="module" src="./account-access-gate-v1.js?v=${RELEASE}"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

const [finalHtml,gate,admin,edge,migration]=await Promise.all([
  readFile(indexPath,'utf8'),
  readFile(join(target,'account-access-gate-v1.js'),'utf8'),
  readFile(join(target,'admin-privacy-queue-v1.js'),'utf8'),
  readFile(join(root,'supabase','functions','privacy-request','index.ts'),'utf8'),
  readFile(join(root,'supabase','migrations','20260830_account_access_controls_v1.sql'),'utf8')
]);

const failures=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-account-closure-v1] OK · ${label}`)};
ok('account access gate is loaded last',finalHtml.includes(`account-access-gate-v1.js?v=${RELEASE}`));
ok('gate reads dedicated access registry',gate.includes("from('account_access_controls')")&&gate.includes("['closing','closed']"));
ok('gate signs out closed sessions',gate.includes("auth.signOut({scope:'local'})")&&gate.includes('clearAuthStorage()'));
ok('gate reacts to focus and visibility without polling',gate.includes("addEventListener('focus'")&&gate.includes("visibilitychange")&&!gate.includes('setInterval(')&&!gate.includes('MutationObserver'));
ok('Admin uses dedicated irreversible closure action',admin.includes("action:'admin_execute_closure'")&&admin.includes('data-kapq-execute-closure'));
ok('Admin requires typed FERMER confirmation',admin.includes("typed!=='FERMER'")&&admin.includes('closure_confirmation:typed'));
ok('manual completed status cannot close account',edge.includes('closure_requires_execution_action'));
ok('closure requires Admin role',edge.includes('action==="admin_execute_closure"')&&edge.includes('if(!await admin())'));
ok('closure uses Supabase Auth soft delete',edge.includes('auth.admin.deleteUser(current.user_id,true)'));
ok('closure withdraws connected wearable consent',edge.includes('wearable_consents')&&edge.includes('connected_followup'));
ok('closure state is prepared before Auth deletion',edge.indexOf('status:"closing"')<edge.indexOf('auth.admin.deleteUser(current.user_id,true)'));
ok('closure finalizes access and privacy request',edge.includes('status:"closed"')&&edge.includes('closure_request_finalize_failed'));
ok('closure is resumable after partial success',edge.includes('const resumable=')&&edge.includes('idempotent:true'));
ok('closure email source has no malformed quote regression',!edge.includes('</p>\")'));
ok('access registry has RLS own-select only',migration.includes('enable row level security')&&migration.includes('account_access_controls_select_own')&&migration.includes('revoke insert, update, delete'));
ok('access registry avoids auth-user FK cascade',!migration.includes('references auth.users'));

if(failures.length){console.error(`[pulse-account-closure-v1] FAILED · ${failures.join(' | ')}`);process.exit(1)}
console.log('[pulse-account-closure-v1] PASS · server soft-delete + access registry + active-session gate + Admin execution control');
