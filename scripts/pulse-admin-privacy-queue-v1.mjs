import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const indexPath=join(target,'index.html');
const RELEASE='20260830-admin-privacy-v3';
let html=await readFile(indexPath,'utf8');
html=html.replace(/\s*<script[^>]+src="\.\/admin-privacy-queue-v1\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'');
const tag=`  <script type="module" src="./admin-privacy-queue-v1.js?v=${RELEASE}"></script>\n`;
html=html.replace('</body>',`${tag}</body>`);
await writeFile(indexPath,html,'utf8');

const [finalHtml,ui,privacyEdge,exportEdge]=await Promise.all([
  readFile(indexPath,'utf8'),
  readFile(join(target,'admin-privacy-queue-v1.js'),'utf8'),
  readFile(join(root,'supabase','functions','privacy-request','index.ts'),'utf8'),
  readFile(join(root,'supabase','functions','privacy-export','index.ts'),'utf8')
]);
const failures=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-admin-privacy-v3] OK · ${label}`)};
ok('Admin privacy queue is loaded',finalHtml.includes(`admin-privacy-queue-v1.js?v=${RELEASE}`));
ok('Admin queue exposes dedicated privacy tab',ui.includes('data-admin-privacy-tab')&&ui.includes('Confidentialité'));
ok('Admin queue reads requests through authenticated privacy API',ui.includes("action:'list_admin'")&&ui.includes('Authorization:`Bearer ${t}`'));
ok('data export uses dedicated generation action',ui.includes("invokeFunction('privacy-export'")&&ui.includes("action:'generate'")&&ui.includes('data-kapq-generate-export'));
ok('data export cannot be manually marked completed in UI',!ui.includes('data-kapq-complete'));
ok('account closure uses dedicated server execution action',ui.includes("action:'admin_execute_closure'")&&ui.includes('data-kapq-execute-closure'));
ok('account closure requires typed FERMER confirmation',ui.includes("typed!=='FERMER'")&&ui.includes('closure_confirmation:typed'));
ok('Admin copy distinguishes generated export from closure execution',ui.includes('export structuré privé')&&ui.includes('Générer la copie')&&ui.includes('Exécuter la fermeture'));
ok('Admin queue has no persistent observer or polling',!ui.includes('MutationObserver')&&!ui.includes('setInterval('));
ok('privacy request API has explicit Admin role gate',privacyEdge.includes('const admin=async()=>await role()==="admin"'));
ok('privacy request API exposes Admin list, update and closure execution',privacyEdge.includes('action==="list_admin"')&&privacyEdge.includes('action==="admin_update"')&&privacyEdge.includes('action==="admin_execute_closure"'));
ok('privacy request API validates status transitions',privacyEdge.includes('invalid_status_transition')&&privacyEdge.includes('current.status==="submitted"'));
ok('manual completion cannot close an account',privacyEdge.includes('closure_requires_execution_action'));
ok('terminal privacy actions require resolution note',privacyEdge.includes('resolution_note_required'));
ok('Admin update uses optimistic current-status constraint',privacyEdge.includes('.eq("id",id).eq("status",current.status)'));
ok('privacy request notification contains no medical payload',!privacyEdge.includes('wearable_daily_metrics')&&!privacyEdge.includes('assessment_metrics'));
ok('privacy export generation has its own Admin gate',exportEdge.includes('if(await role()!=="admin")')&&exportEdge.includes('action!=="generate"'));
ok('privacy export generation requires request in review',exportEdge.includes('export_requires_review')&&exportEdge.includes('request.data.status!=="in_review"'));
if(failures.length){console.error(`[pulse-admin-privacy-v3] FAILED · ${failures.join(' | ')}`);process.exit(1)}
console.log('[pulse-admin-privacy-v3] PASS · Admin privacy queue + generated private exports + real account closure controls');
