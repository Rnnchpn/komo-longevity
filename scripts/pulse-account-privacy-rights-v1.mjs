import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const indexPath=join(target,'index.html');
const RELEASE='20260830-account-privacy-v1';

let html=await readFile(indexPath,'utf8');
html=html.replace(/\s*<script[^>]+src="\.\/account-hub-v2\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'');
html=html.replace(/\s*<script[^>]+src="\.\/account-privacy-v1\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'');
const tags=`  <script type="module" src="./account-hub-v2.js?v=${RELEASE}"></script>\n  <script type="module" src="./account-privacy-v1.js?v=${RELEASE}"></script>\n`;
html=html.replace('</body>',`${tags}</body>`);
await writeFile(indexPath,html,'utf8');

const [finalHtml,hub,privacy,edge,keyMigration,privacyMigration]=await Promise.all([
  readFile(indexPath,'utf8'),
  readFile(join(target,'account-hub-v2.js'),'utf8'),
  readFile(join(target,'account-privacy-v1.js'),'utf8'),
  readFile(join(root,'supabase','functions','privacy-request','index.ts'),'utf8'),
  readFile(join(root,'supabase','migrations','20260830_key_consent_timestamp_contract_v1.sql'),'utf8'),
  readFile(join(root,'supabase','migrations','20260830_account_privacy_requests_v1.sql'),'utf8')
]);

const failures=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-account-privacy-v1] OK · ${label}`)};
ok('official account hub is loaded',finalHtml.includes(`account-hub-v2.js?v=${RELEASE}`));
ok('privacy rights runtime is loaded',finalHtml.includes(`account-privacy-v1.js?v=${RELEASE}`));
ok('preparatory pseudo-contract copy is removed',!hub.includes('Version non contractuelle')&&!hub.includes('Préparatoire ·')&&!hub.includes('Première base contractuelle'));
ok('official legal documents remain linked',hub.includes("legalUrl('privacy')")&&hub.includes("legalUrl('terms')")&&hub.includes("legalUrl('medical-information')")&&hub.includes("legalUrl('legal')"));
ok('account hub has no persistent DOM observer or polling',!hub.includes('MutationObserver')&&!hub.includes('setInterval('));
ok('privacy UI exposes data copy and account closure',privacy.includes("'data_export'")&&privacy.includes("'account_closure'"));
ok('privacy UI exposes explicit KEY consent withdrawal',privacy.includes("action:'withdraw_wearables'")&&privacy.includes('Retirer mon consentement KEY'));
ok('closure copy does not promise instant erasure',privacy.includes("n’entraîne pas nécessairement l’effacement immédiat"));
ok('privacy runtime has no persistent DOM observer or polling',!privacy.includes('MutationObserver')&&!privacy.includes('setInterval('));
ok('privacy API authenticates the caller',edge.includes('uc.auth.getUser(token)')&&edge.includes('if(ur.error||!user)'));
ok('privacy API constrains cancellation to current user',edge.includes('.eq("id",id).eq("user_id",user.id).eq("status","submitted")'));
ok('privacy API withdraws only current user active KEY consent',edge.includes('.eq("user_id",user.id).eq("purpose","connected_followup").eq("status","active")'));
ok('privacy API keeps requests idempotent',edge.includes('idempotent:true')&&privacyMigration.includes('one_open_per_type_uidx'));
ok('KEY migration replaces stale consented_at contract',keyMigration.includes("replace(v_def, 'wc.consented_at', 'wc.accepted_at')"));
ok('privacy request table is RLS protected',privacyMigration.includes('enable row level security')&&privacyMigration.includes('privacy_requests_select_own'));

if(failures.length){console.error(`[pulse-account-privacy-v1] FAILED · ${failures.join(' | ')}`);process.exit(1)}
console.log('[pulse-account-privacy-v1] PASS · official Account + traceable privacy rights + KEY consent contract');
