import { access, copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'pulse-app','club-incoming-connections-v1.js');
const targetDir=join(root,'site','pulse-v12');
const target=join(targetDir,'club-incoming-connections-v1.js');
const indexPath=join(targetDir,'index.html');
const RELEASE='20260830-club-connections-v1';

await Promise.all([access(source),access(indexPath)]);
await copyFile(source,target);
let html=await readFile(indexPath,'utf8');
html=html.replace(/\s*<script[^>]+src="\.\/club-incoming-connections-v1\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'');
const tag=`<script type="module" src="./club-incoming-connections-v1.js?v=${RELEASE}"></script>`;
if(html.includes('./center-owner-ui-guard-v1.js')) html=html.replace(/(<script[^>]+src="\.\/center-owner-ui-guard-v1\.js[^>]*><\/script>)/,`${tag}\n  $1`);
else html=html.replace('</body>',`  ${tag}\n</body>`);
await writeFile(indexPath,html,'utf8');

const [finalHtml,club,reportRuntime,delivery,dossierEntry]=await Promise.all([
  readFile(indexPath,'utf8'),
  readFile(target,'utf8'),
  readFile(join(targetDir,'report-runtime-v1.js'),'utf8'),
  readFile(join(targetDir,'report-delivery-v2.js'),'utf8'),
  readFile(join(targetDir,'dossier-pdf-export-v2.js'),'utf8')
]);
const failures=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-club-connections-qa-v1] OK · ${label}`)};
ok('incoming Club runtime is loaded',finalHtml.includes(`club-incoming-connections-v1.js?v=${RELEASE}`));
ok('incoming requests are target-side only',club.includes(".eq('addressee_id',uid).eq('status','pending')"));
ok('decision mutation is constrained to recipient and pending state',club.includes(".eq('id',id).eq('addressee_id',uid).eq('status','pending')"));
ok('Club supports accept and decline',club.includes("'accepted','declined'")&&club.includes('data-kci-action="accept"')&&club.includes('data-kci-action="decline"'));
ok('Club incoming runtime has no persistent observer or polling loop',!club.includes('MutationObserver')&&!club.includes('setInterval('));
ok('Mobility Report notifier uses current pulse-notify contract',reportRuntime.includes("kind:'mobility_report_ready'")&&reportRuntime.includes('patientId,reportId,eventReference'));
ok('official report release is persisted before notification',delivery.includes("action:'release'")&&delivery.indexOf("action:'release'")<delivery.indexOf('await notifyReport'));
ok('professional dossier owns Report Delivery v2',dossierEntry.includes("import './report-delivery-v2.js"));
if(failures.length){console.error(`[pulse-club-connections-qa-v1] FAILED · ${failures.join(' | ')}`);process.exit(1)}
console.log('[pulse-club-connections-qa-v1] PASS · incoming Club decisions + Mobility Report delivery contract guarded');
