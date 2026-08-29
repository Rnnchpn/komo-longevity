import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-home-key-position-v1';
for(const file of ['home-key-position-v1.css','home-key-position-v1.js']) await copyFile(join(root,'pulse-app',file),join(pulse,file));
let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/home-key-position-v1\.css(?:\?[^\"]*)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/home-key-position-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./home-key-position-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./home-key-position-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');
const js=await readFile(join(pulse,'home-key-position-v1.js'),'utf8');
const css=await readFile(join(pulse,'home-key-position-v1.css'),'utf8');
const final=await readFile(htmlPath,'utf8');
const checks=[
 ['position CSS shipped last',final.includes(`home-key-position-v1.css?v=${release}`)],
 ['position runtime shipped last',final.includes(`home-key-position-v1.js?v=${release}`)],
 ['KEY targets canonical data wall',js.includes("[data-khome-datawall] .kdw-grid")],
 ['KEY is inserted directly after age',js.includes("age.insertAdjacentElement('afterend',key)")],
 ['score and age share leading row',css.includes('grid-column:span 6!important')],
 ['KEY spans full row',css.includes('grid-column:1/-1!important')],
 ['placement has no MutationObserver or polling',!js.includes('MutationObserver')&&!js.includes('setInterval(')]
];
for(const [label,ok] of checks) console.log(`[pulse-home-key-position-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-home-key-position-v1] PASS · Motion Score + Locomotor Age first, KEY immediately below');
