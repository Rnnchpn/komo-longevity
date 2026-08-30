import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const indexPath=join(target,'index.html');
const RELEASE='20260830-admin-privacy-v2';
let html=await readFile(indexPath,'utf8');
html=html.replace(/\s*<script[^>]+src="\.\/admin-privacy-queue-v1\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'');
const tag=`  <script type="module" src="./admin-privacy-queue-v1.js?v=${RELEASE}"></script>\n`;
html=html.replace('</body>',`${tag}</body>`);
await writeFile(indexPath,html,'utf8');

const [finalHtml,ui,edge]=await Promise.all([
  readFile(indexPath,'utf8'),
  readFile(join(target,'admin-privacy-queue-v1.js'),'utf8'),
  readFile(join(root,'supabase','functions','privacy-request','index.ts'),'utf8')
]);
const failures=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-admin-privacy-v2] OK · ${label}`)};
ok('Admin privacy queue is loaded',finalHtml.includes(`admin-privacy-queue-v1.js?v=${RELEASE}`));
ok('Admin queue exposes dedicated privacy tab',ui.includes('data-admin-privacy-tab')&&ui.includes('Confidentialité'));
ok('Admin queue reads only through authenticated privacy API',ui.includes("action:'list_admin'")&&ui.includes('Authorization:`Bearer ${t}`'));
ok('data export completion keeps execution attestation',ui.includes('execution_confirmed:confirmed')&&ui.includes('copie des données a déjà été remise'));
ok('account closure uses dedicated server execution action',ui.includes("action:'admin_execute_closure'")&&ui.includes('data-kapq-execute-closure'));
ok('account closure requires typed FERMER confirmation',ui.includes("typed!=='FERMER'")&&ui.includes('closure_confirmation:typed'));
ok('Admin copy distinguishes closure execution from data export',ui.includes('soft-delete l’utilisateur Auth')&&ui.includes('Copie de données'));
ok('Admin queue has no persistent observer or polling',!ui.includes('MutationObserver')&&!ui.includes('setInterval('));
ok('privacy API has explicit Admin role gate',edge.includes('const admin=async()=>await role()==="admin"'));
ok('privacy API exposes Admin list, update and closure execution',edge.includes('action==="list_admin"')&&edge.includes('action==="admin_update"')&&edge.includes('action==="admin_execute_closure"'));
ok('privacy API validates status transitions',edge.includes('invalid_status_transition')&&edge.includes('current.status==="submitted"'));
ok('manual completion cannot close an account',edge.includes('closure_requires_execution_action'));
ok('terminal privacy actions require resolution note',edge.includes('resolution_note_required'));
ok('data export completion requires execution confirmation',edge.includes('execution_confirmation_required'));
ok('Admin update uses optimistic current-status constraint',edge.includes('.eq("id",id).eq("status",current.status)'));
ok('privacy notification contains no medical payload',!edge.includes('wearable_daily_metrics')&&!edge.includes('assessment_metrics'));
if(failures.length){console.error(`[pulse-admin-privacy-v2] FAILED · ${failures.join(' | ')}`);process.exit(1)}
console.log('[pulse-admin-privacy-v2] PASS · Admin privacy queue + real account closure action + controlled data-export attestation');
