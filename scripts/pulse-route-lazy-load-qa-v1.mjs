import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const html=await readFile(join(pulse,'index.html'),'utf8');
const loader=await readFile(join(pulse,'route-lazy-loader-v1.js'),'utf8');
const required=[
  'route-lazy-loader-v1.js?v=20260829-lazy-routes-v1',
  'komoLazyRouteManifest',
  'app-router-v2.js',
  'auth-gateway-v2.js',
  'key-hub-v1.js',
  'motion-hub-v3.js'
];
const deferred=['clinical-cockpit-v1.js','admin-console-v2.js','center-workspace-v1.js'];
const checks=[
  ['required eager/lazy markers present',required.every(x=>html.includes(x))],
  ['heavy professional scripts absent from eager tags',deferred.every(x=>!html.includes(`src="./${x}`))],
  ['manifest still references deferred clinical modules',deferred.every(x=>html.includes(x))],
  ['loader performs sequential hydration',loader.includes('for(const item of items)await inject(item)')],
  ['loader activates on clinical/admin route',loader.includes("r==='clinical'||r==='admin'")],
  ['loader replays canonical route after hydration',loader.includes("source:'lazy-route-runtime'")]
];
for(const [label,ok] of checks)console.log(`[pulse-route-lazy-qa] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-route-lazy-qa] PASS · ${(html.match(/<script\b/g)||[]).length} boot script tags`);
