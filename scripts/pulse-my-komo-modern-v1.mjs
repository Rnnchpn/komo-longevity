import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const path=join(root,'site','pulse-v12','index.html');
let html=await readFile(path,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/my-komo-modern-v1\.css(?:\?[^\"]*)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/my-komo-score-motion-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace('</head>','  <link rel="stylesheet" href="./my-komo-modern-v1.css?v=20260829-mykomo-modern-v1" />\n</head>');
html=html.replace('</body>','  <script src="./my-komo-score-motion-v1.js?v=20260829-mykomo-modern-v1"></script>\n</body>');
if(!html.includes('my-komo-modern-v1.css')||!html.includes('my-komo-score-motion-v1.js'))throw new Error('[pulse-my-komo-modern] injection failed');
await writeFile(path,html,'utf8');
console.log('[pulse-my-komo-modern] PASS · modern animated background + score ring count-up shipped');
