import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const cssRelease='20260829-mykomo-stable-v4';
const release='20260829-mykomo-stable-v5';
for(const file of ['my-komo-stable-v4.css','my-komo-stable-v5.js']) await copyFile(join(root,'pulse-app',file),join(pulse,file));
let html=await readFile(htmlPath,'utf8');
// My KŌMØ has one route owner only. Legacy observer-driven and previous clean owner are stripped.
html=html.replace(/\s*<script(?: type="module")? src="\.\/my-komo-lobby-v3\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script src="\.\/my-komo-stable-v4\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script src="\.\/my-komo-stable-v5\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/my-komo-stable-v4\.css(?:\?[^\"]*)?"\s*\/?>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./my-komo-stable-v4.css?v=${cssRelease}" />\n</head>`);
html=html.replace('</body>',`  <script src="./my-komo-stable-v5.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');
const js=await readFile(join(pulse,'my-komo-stable-v5.js'),'utf8');
const css=await readFile(join(pulse,'my-komo-stable-v4.css'),'utf8');
const final=await readFile(htmlPath,'utf8');
const checks=[
 ['stable My KŌMØ CSS shipped',final.includes(`my-komo-stable-v4.css?v=${cssRelease}`)],
 ['hardened My KŌMØ runtime shipped last',final.includes(`my-komo-stable-v5.js?v=${release}`)],
 ['legacy lobby route owner removed',!final.includes('my-komo-lobby-v3.js')],
 ['previous v4 runtime removed',!final.includes('my-komo-stable-v4.js')],
 ['single owner has no MutationObserver',!js.includes('MutationObserver')],
 ['single owner has no permanent polling',!js.includes('setInterval(')],
 ['shared Pulse client is reused',js.includes('window.KomoRuntime?.client')&&!js.includes('createClient(')],
 ['data hydration uses direct resolved values',js.includes('const [profile,eng,patient]=await Promise.all(')&&!js.includes("pr[0]?.status")],
 ['route guard is fail-open',css.includes('body.mykomo-route-pending #viewRoot{visibility:visible!important')],
 ['My KŌMØ still exposes score and progression',js.includes('Motion Score')&&js.includes('KŌMØ Points')&&js.includes('Défis du jour')]
];
for(const [label,ok] of checks) console.log(`[pulse-my-komo-stability-v5] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-my-komo-stability-v5] PASS · one route owner · shared client · fail-open · resolved hydration');
