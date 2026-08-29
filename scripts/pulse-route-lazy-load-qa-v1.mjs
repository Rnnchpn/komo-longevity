import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const html=await readFile(join(pulse,'index.html'),'utf8');
const loader=await readFile(join(pulse,'route-lazy-loader-v1.js'),'utf8');
const match=html.match(/<script id="komoLazyRouteManifest" type="application\/json">([\s\S]*?)<\/script>/);
if(!match)throw new Error('[pulse-route-lazy-qa] manifest missing');
const manifest=JSON.parse(match[1]);
const expected={professional:23,club:2,trajectory:1,agenda:3};
const eagerRequired=['app-router-v2.js','auth-gateway-v2.js','key-hub-v1.js','motion-hub-v3.js','patient-route-runtime-v2.js'];
const representative=['clinical-cockpit-v1.js','admin-console-v2.js','club-hub-v1.js','trajectory-v3.js','agenda-hub-v4.js','agenda-premium-map-v1.js'];
const directTag=name=>new RegExp(`<script[^>]+src="\\./${name.replaceAll('.','\\.')}`).test(html);
const checks=[
  ['v2 loader shipped',html.includes('route-lazy-loader-v1.js?v=20260829-lazy-routes-v2')],
  ['all route groups have exact expected size',Object.entries(expected).every(([g,n])=>(manifest.groups?.[g]||[]).length===n)],
  ['representative route modules are not eager',representative.every(x=>!directTag(x))],
  ['manifest retains all deferred assets',representative.every(x=>html.includes(x))],
  ['critical Home Motion KEY shell stays eager',eagerRequired.every(directTag)],
  ['loader hydrates sequentially',loader.includes('for(const item of items)await inject(item)')],
  ['loader maps professional Club Trajectory Agenda routes',loader.includes("if(r==='club')return'club'")&&loader.includes("if(r==='trajectory')return'trajectory'")&&loader.includes("if(r==='documents')return'agenda'")],
  ['loader preloads on navigation intent',loader.includes("load(group,'intent')")],
  ['loader explicitly wakes secondary route owners',loader.includes('KomoClub?.refresh')&&loader.includes('KomoTrajectoryV3?.refresh')&&loader.includes('KomoAgendaHubV4?.refresh')],
  ['route-ready replay remains present',loader.includes("source:'lazy-route-runtime'")]
];
for(const [label,ok] of checks)console.log(`[pulse-route-lazy-qa] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
const total=Object.values(manifest.groups).reduce((n,x)=>n+x.length,0);
console.log(`[pulse-route-lazy-qa] PASS · ${total} deferred modules · ${(html.match(/<script\b/g)||[]).length} boot script tags`);
