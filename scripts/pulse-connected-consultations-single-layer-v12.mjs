import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const built=join(root,'site','pulse-v12');
const indexPath=join(built,'index.html');
let html=await readFile(indexPath,'utf8');

const retiredScripts=[
  'key-results-grid-v1.js',
  'key-results-v2.js',
  'wearable-cycle-v1.js',
  'wearable-poc-mode-v1.js',
  'trajectory-route-guard-v1.js'
];
const retiredStyles=[
  'key-hub-v1.css',
  'key-results-v2.css',
  'trajectory-color-v4.css'
];
const rx=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
for(const file of retiredScripts){
  html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\.\\/${rx(file)}(?:\\?[^\"]*)?"><\\/script>`,'g'),'');
}
for(const file of retiredStyles){
  html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\.\\/${rx(file)}(?:\\?[^\"]*)?"\\s*\\/?>`,'g'),'');
}

const palette='pulse-home-palette-surfaces-v12.css';
if(!html.includes(palette)){
  html=html.replace('</head>',`  <link rel="stylesheet" href="./${palette}?v=20260901-palette-v12" />\n</head>`);
}
await writeFile(indexPath,html,'utf8');

const [css,key,consultations]=await Promise.all([
  readFile(join(built,palette),'utf8'),
  readFile(join(built,'key-hub-v1.js'),'utf8'),
  readFile(join(built,'trajectory-v3.js'),'utf8')
]);

const homeTokens=['#050706','#070a08','#0a0e0c','#101512','#f2f4f1','#808983','#7fa58a','#315b41','#c6a15e','#c87972'];
const checks=[
  ['Connected canonical v3 owner remains loaded',html.includes('./key-hub-v1.js')&&key.includes('data-connected-v3')&&key.includes("const V='3.1.0'")],
  ['Consultations canonical owner remains loaded',html.includes('./trajectory-v3.js')&&consultations.includes('data-consultations-v4')],
  ['legacy KEY prototype retired',!html.includes('key-results-grid-v1.js')],
  ['legacy KEY enhancer retired',!html.includes('key-results-v2.js')],
  ['legacy wearable cycle retired',!html.includes('wearable-cycle-v1.js')],
  ['legacy wearable POC enhancer retired',!html.includes('wearable-poc-mode-v1.js')],
  ['legacy Trajectory route guard retired',!html.includes('trajectory-route-guard-v1.js')],
  ['legacy KEY styles retired',!html.includes('key-hub-v1.css')&&!html.includes('key-results-v2.css')],
  ['legacy Trajectory style retired',!html.includes('trajectory-color-v4.css')],
  ['Home palette stylesheet loaded once',(html.match(new RegExp(palette,'g'))||[]).length===1],
  ['Home palette tokens reused',homeTokens.every(token=>css.includes(token))],
  ['Connected shell palette scoped',css.includes('body.connected-v2')],
  ['Consultations palette scoped',css.includes('body.consultations-v4')],
  ['no light shell in palette',!css.includes('#f6f7f5')&&!css.includes('background:#fff')]
];
for(const [label,ok] of checks){
  console.log(`[pulse-single-layer-v12] ${ok?'OK':'FAIL'} · ${label}`);
  if(!ok)process.exitCode=1;
}
if(process.exitCode)throw new Error('Connected / Consultations single-layer v12 guard failed');
console.log('[pulse-single-layer-v12] PASS · one visible owner per surface · Connected v3.1 owns its route · legacy KEY/Trajectory presentation layers retired');
