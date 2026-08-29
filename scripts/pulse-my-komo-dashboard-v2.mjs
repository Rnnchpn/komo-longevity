import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const path=join(root,'site','pulse-v12','index.html');
let html=await readFile(path,'utf8');
for(const file of ['my-komo-dashboard-v2.css'])html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\./${file.replaceAll('.','\\.')}(?:\\?[^\"]*)?" \\/>`,'g'),'');
for(const file of ['my-komo-dashboard-v2.js'])html=html.replace(new RegExp(`\\s*<script src="\\./${file.replaceAll('.','\\.')}(?:\\?[^\"]*)?"><\\/script>`,'g'),'');
html=html.replace('</head>','  <link rel="stylesheet" href="./my-komo-dashboard-v2.css?v=20260829-dashboard-v2" />\n</head>');
html=html.replace('</body>','  <script src="./my-komo-dashboard-v2.js?v=20260829-dashboard-v2"></script>\n</body>');
if(!html.includes('my-komo-dashboard-v2.css')||!html.includes('my-komo-dashboard-v2.js'))throw new Error('[pulse-my-komo-dashboard-v2] injection failed');
await writeFile(path,html,'utf8');
console.log('[pulse-my-komo-dashboard-v2] PASS · premium wearable hierarchy + Today command strip + primary Motion card');
