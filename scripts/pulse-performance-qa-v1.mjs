import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const files=['auth-gateway-v2.js','patient-onboarding-v1.js','pro-signup-identity-v1.js','pro-access-v1.js','pro-architecture-v2.js','booking-layer-v1.js','care-messaging-v1.js','pro-followup-v1.js','professional-scope-v1.js','admin-shortcut-v1.js','admin-ux-v2.js','admin-professionals-v1.js'];
const entries=await Promise.all(files.map(async f=>[f,await readFile(join(root,'pulse-app',f),'utf8')]));
const html=await readFile(join(root,'pulse-app','index.html'),'utf8');
const app=await readFile(join(root,'pulse-app','app.js'),'utf8');
const runtime=await readFile(join(root,'pulse-app','performance-runtime-v1.js'),'utf8');
const syntax=entries.map(([f])=>[f,spawnSync(process.execPath,['--check',join(root,'pulse-app',f)],{encoding:'utf8'})]);
const critical=entries.filter(([f])=>!['admin-ux-v2.js','admin-professionals-v1.js'].includes(f));
const source=(name)=>entries.find(([f])=>f===name)?.[1]||'';
const checks=[
 ['performance runtime loaded after app',html.includes('./app.js')&&html.includes('./performance-runtime-v1.js')&&html.indexOf('./performance-runtime-v1.js')>html.indexOf('./app.js')],
 ['app publishes canonical Supabase client',app.includes('window.KomoRuntime.client=state.client')],
 ['runtime exposes shared session context',runtime.includes('komo:session-ready')&&runtime.includes('komo:route-ready')&&runtime.includes('setContext')],
 ['critical modules prefer shared Supabase client',critical.every(([,s])=>s.includes('window.KomoRuntime?.client'))],
 ['no body-wide MutationObserver remains in optimized modules',entries.every(([,s])=>!s.includes('new MutationObserver'))],
 ['all optimized JavaScript parses',syntax.every(([,r])=>r.status===0)],
 ['Pro architecture is event driven',source('pro-architecture-v2.js').includes("addEventListener('komo:route-ready'")],
 ['booking is event driven',source('booking-layer-v1.js').includes("addEventListener('komo:route-ready'")],
 ['messaging is event driven',source('care-messaging-v1.js').includes("addEventListener('komo:route-ready'")],
 ['auth gateway no longer tracks DOM mutations',source('auth-gateway-v2.js').includes("addEventListener('komo:session-ready'")]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);
if(failed.length){
 for(const [f,r] of syntax)if(r.status!==0)console.error(`[${f}] ${r.stderr||r.stdout}`);
 console.error('[pulse-performance-qa-v1] failed: '+failed.join(', '));
 process.exit(1);
}
console.log(`[pulse-performance-qa-v1] ${checks.length} checks passed.`);
