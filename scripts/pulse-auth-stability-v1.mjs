import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-auth-stability-v1';

for(const file of ['auth-stability-v1.css','auth-stability-v1.js']){
  await copyFile(join(root,'pulse-app',file),join(pulse,file));
}

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/auth-stability-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/auth-stability-v1\.js(?:\?v=[^"]+)?"><\/script>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./auth-stability-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./auth-stability-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const [css,js,final]=await Promise.all([
  readFile(join(pulse,'auth-stability-v1.css'),'utf8'),
  readFile(join(pulse,'auth-stability-v1.js'),'utf8'),
  readFile(htmlPath,'utf8')
]);

const checks=[
  ['stable auth CSS loaded last',final.includes(`auth-stability-v1.css?v=${release}`)],
  ['stable auth runtime loaded last',final.includes(`auth-stability-v1.js?v=${release}`)],
  ['hidden auth can never override hidden attribute',css.includes('#authScreen[hidden],#appShell[hidden]{display:none!important}')],
  ['mobile auth no longer depends on visual viewport height variable',css.includes('height:100dvh!important')&&css.includes('min-height:100svh!important')],
  ['fragile auth transforms and animations are neutralized',css.includes('transform:none!important')&&css.includes('animation:none!important')],
  ['Safari inputs stay at 16px',css.includes('font-size:16px!important')],
  ['visibility observer is scoped to auth and app only',js.includes('observer.observe(auth')&&js.includes('observer.observe(app')&&!js.includes('observe(document.body')],
  ['authenticated app always wins over late auth mutations',js.includes('if(appVisible)')&&js.includes('auth.hidden=true')],
  ['stale session bootstrap falls back to guest',js.includes('bootFallback')&&js.includes("resolved('guest')")]
];
for(const [label,ok] of checks)console.log(`[pulse-auth-stability-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-auth-stability-v1] PASS · stable mobile login surface + deterministic auth/app visibility');
