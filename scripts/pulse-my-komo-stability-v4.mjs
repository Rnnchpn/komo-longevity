import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-mykomo-stable-v4';
for(const file of ['my-komo-stable-v4.css','my-komo-stable-v4.js']) await copyFile(join(root,'pulse-app',file),join(pulse,file));
let html=await readFile(htmlPath,'utf8');
// Remove the old My KŌMØ route owner. It used a root MutationObserver and a second Supabase client.
html=html.replace(/\s*<script(?: type="module")? src="\.\/my-komo-lobby-v3\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/my-komo-stable-v4\.css(?:\?[^\"]*)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/my-komo-stable-v4\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./my-komo-stable-v4.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./my-komo-stable-v4.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');
const js=await readFile(join(pulse,'my-komo-stable-v4.js'),'utf8');
const css=await readFile(join(pulse,'my-komo-stable-v4.css'),'utf8');
const final=await readFile(htmlPath,'utf8');
const checks=[
 ['stable My KŌMØ CSS shipped last',final.includes(`my-komo-stable-v4.css?v=${release}`)],
 ['stable My KŌMØ runtime shipped last',final.includes(`my-komo-stable-v4.js?v=${release}`)],
 ['legacy lobby route owner removed',!final.includes('my-komo-lobby-v3.js')],
 ['single owner has no MutationObserver',!js.includes('MutationObserver')],
 ['single owner has no permanent polling',!js.includes('setInterval(')],
 ['shared Pulse client is reused',js.includes('window.KomoRuntime?.client')&&!js.includes('createClient(')],
 ['route guard is fail-open',css.includes('body.mykomo-route-pending #viewRoot{visibility:visible!important')],
 ['My KŌMØ still exposes score and progression',js.includes('Motion Score')&&js.includes('KŌMØ Points')&&js.includes('Défis du jour'))
];
for(const [label,ok] of checks) console.log(`[pulse-my-komo-stability-v4] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-my-komo-stability-v4] PASS · one route owner · no observer loop · fail-open rendering');
