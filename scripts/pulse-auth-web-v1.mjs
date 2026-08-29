import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260830-auth-web-v1';

for(const file of ['auth-web-v1.css','auth-web-v1.js']){
  await copyFile(join(root,'pulse-app',file),join(pulse,file));
}

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/auth-web-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/auth-web-v1\.js(?:\?v=[^"]+)?"><\/script>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./auth-web-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./auth-web-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const [css,js,final]=await Promise.all([
  readFile(join(pulse,'auth-web-v1.css'),'utf8'),
  readFile(join(pulse,'auth-web-v1.js'),'utf8'),
  readFile(htmlPath,'utf8')
]);

const checks=[
  ['desktop login CSS is loaded',final.includes(`auth-web-v1.css?v=${release}`)],
  ['desktop login enhancer is loaded',final.includes(`auth-web-v1.js?v=${release}`)],
  ['desktop-only visual ownership',css.includes('@media (min-width:768px)')&&js.includes("matchMedia('(min-width:768px)')")],
  ['hidden semantics preserved',css.includes('#authScreen[data-auth-web="1"][hidden]{display:none!important}')],
  ['solid split-screen geometry',css.includes('grid-template-columns:minmax(0,1.08fr) minmax(430px,.92fr)')],
  ['private-access status detail present',js.includes('ACCÈS PRIVÉ')&&css.includes('.kaw-panel-status')],
  ['platform layers detail present',js.includes('MOTION')&&js.includes('CLINICAL')&&js.includes('KEY')],
  ['loading state is visual only',css.includes('html.komo-auth-submitting')&&!js.includes('signInWithPassword')&&!js.includes('supabase')],
  ['no mobile auth ownership',!css.includes('@media (max-width:767px)')&&!js.includes('max-width:767px')],
  ['no score or route behavior',!js.includes('location.hash')&&!js.includes('motion_score')&&!js.includes('fetch(')]
];
for(const [label,ok] of checks)console.log(`[pulse-auth-web-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-auth-web-v1] PASS · canonical desktop login surface · presentation only');
