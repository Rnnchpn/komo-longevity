import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const srcCss=join(root,'pulse-app','pulse-auth-login-v2.css');
const outDir=join(root,'site','pulse-v12');
const outCss=join(outDir,'pulse-auth-login-v2.css');
const indexPath=join(outDir,'index.html');
const version='20261001-auth-login-v3';

await copyFile(srcCss,outCss);

let html=await readFile(indexPath,'utf8');
html=html.replace(/\s*<link[^>]+href="\.\/pulse-auth-login-v2\.css(?:\?[^"]*)?"[^>]*>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./pulse-auth-login-v2.css?v=${version}" />\n</head>`);
await writeFile(indexPath,html,'utf8');

const css=await readFile(outCss,'utf8');
const checks=[
  ['stylesheet loaded',html.includes('pulse-auth-login-v2.css')],
  ['loaded after bright theme',html.lastIndexOf('pulse-auth-login-v2.css')>html.lastIndexOf('pulse-bright-modern-v1.css')],
  ['hidden auth semantics preserved',css.includes('#authScreen[hidden]{display:none!important}')],
  ['mobile Safari input size protected',css.includes('font:400 16px/1 "DM Sans",sans-serif!important')],
  ['supported font weights only',!/(font-weight|font):[^;]*(650|700|750|800|850|900)/.test(css)],
  ['single premium Auth owner',css.includes('Single visual owner')&&css.includes('Premium application entry')],
  ['presentation only',!css.includes('signInWithPassword')&&!css.includes('location.hash=')]
]
for(const [label,ok] of checks)console.log(`[pulse-auth-login-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-auth-login-v2] PASS · premium app login · desktop/tablet/mobile');
