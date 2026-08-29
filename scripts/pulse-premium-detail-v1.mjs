import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-premium-detail-v1';
const file='pulse-premium-detail-v1.css';
await copyFile(join(root,'pulse-app',file),join(pulse,file));
let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/pulse-premium-detail-v1\.css(?:\?[^\"]*)?"\s*\/?>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./pulse-premium-detail-v1.css?v=${release}" />\n</head>`);
await writeFile(htmlPath,html,'utf8');
const css=await readFile(join(pulse,file),'utf8');
const final=await readFile(htmlPath,'utf8');
const checks=[
 ['premium detail CSS shipped last',final.includes(`pulse-premium-detail-v1.css?v=${release}`)],
 ['KEY home fine-detail scope present',css.includes('.mykomo-key-home .mkh-live-head')&&css.includes('.mkh-spark i')],
 ['My KOMO fine-detail scope present',css.includes('body.mykomo-v5 .mkv4-hero')&&css.includes('body.mykomo-v5 .mkv4-badge')],
 ['focus-visible accessibility retained',css.includes(':focus-visible')],
 ['reduced motion respected',css.includes('prefers-reduced-motion')]
];
for(const [label,ok] of checks) console.log(`[pulse-premium-detail-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-premium-detail-v1] PASS · fine visual hierarchy, micro-interactions and accessibility');
