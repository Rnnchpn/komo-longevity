import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const indexPath=join(target,'index.html');
const RELEASE='20260830-admin-privacy-v1';
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
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-admin-privacy-v1] OK · ${label}`)};
ok('Admin privacy queue is loaded',finalHtml.includes(`admin-privacy-queue-v1.js?v=${RELEASE}`));
ok('Admin queue exposes dedicated privacy tab',ui.includes('data-admin-privacy-tab')&&ui.includes('Confidentialité'));
ok('Admin queue reads only through authenticated privacy API',ui.includes("action:'list_admin'")&&ui.includes('Authorization:`Bearer ${t}`'));
ok('Admin queue requires explicit execution confirmation before completed',ui.includes('execution_confirmed:confirmed')&&ui.includes('Confirmez uniquement si la fermeture de l’accès Pulse'));
ok('Admin queue explains terminal action does not automate deletion/export',ui.includes('elles ne suppriment ni n’exportent automatiquement les données'));
ok('Admin queue has no persistent observer or polling',!ui.includes('MutationObserver')&&!ui.includes('setInterval('));
ok('privacy API has explicit Admin role gate',edge.includes('const requireAdmin=async()=>')&&edge.includes('return r.data?.role??"member"'));
ok('privacy API exposes Admin list and update only',edge.includes('action==="list_admin"')&&edge.includes('action==="admin_update"'));
ok('privacy API validates status transitions',edge.includes('invalid_status_transition')&&edge.includes('current.status==="submitted"'));
ok('terminal privacy actions require resolution note',edge.includes('resolution_note_required'));
ok('completed privacy action requires execution confirmation',edge.includes('execution_confirmation_required'));
ok('Admin update uses optimistic current-status constraint',edge.includes('.eq("id",id).eq("status",current.status)'));
ok('privacy notification contains no medical payload',!edge.includes('wearable_daily_metrics')&&!edge.includes('assessment_metrics'));
if(failures.length){console.error(`[pulse-admin-privacy-v1] FAILED · ${failures.join(' | ')}`);process.exit(1)}
console.log('[pulse-admin-privacy-v1] PASS · Admin privacy queue + controlled review transitions + explicit execution attestation');
