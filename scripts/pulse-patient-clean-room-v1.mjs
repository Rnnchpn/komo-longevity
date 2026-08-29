import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd(),pulse=join(root,'site','pulse-v12'),htmlPath=join(pulse,'index.html');
const release='20260829-patient-clean-room-v1';
for(const f of ['patient-home-clean-v1.css','patient-home-clean-v1.js','key-view-tabs-v1.css','key-view-tabs-v1.js'])await copyFile(join(root,'pulse-app',f),join(pulse,f));
let html=await readFile(htmlPath,'utf8');
const legacy=['my-komo-home-v1.js','patient-home-visual-v2.js','patient-home-datawall-v3.js','my-komo-dashboard-v2.js','my-komo-key-home-v1.js','patient-home-micro-motion-v1.js','pulse-home-hero-polish-v2.js','my-komo-score-motion-v1.js'];
for(const name of legacy){const e=name.replaceAll('.','\\.');html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${e}(?:\\?[^\"]*)?"><\\/script>`,'g'),'')}
for(const name of ['my-komo-dashboard-v2.css','my-komo-key-home-v1.css']){const e=name.replaceAll('.','\\.');html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\./${e}(?:\\?[^\"]*)?"\\s*\\/?>`,'g'),'')}
for(const name of ['patient-home-clean-v1.css','key-view-tabs-v1.css']){const e=name.replaceAll('.','\\.');html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\./${e}(?:\\?[^\"]*)?"\\s*\\/?>`,'g'),'')}
for(const name of ['patient-home-clean-v1.js','key-view-tabs-v1.js']){const e=name.replaceAll('.','\\.');html=html.replace(new RegExp(`\\s*<script(?: type="module")? src="\\./${e}(?:\\?[^\"]*)?"><\\/script>`,'g'),'')}
html=html.replace('</head>',`  <link rel="stylesheet" href="./patient-home-clean-v1.css?v=${release}" />\n  <link rel="stylesheet" href="./key-view-tabs-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./patient-home-clean-v1.js?v=${release}"></script>\n  <script src="./key-view-tabs-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');
console.log('[pulse-patient-clean-room] Home single owner · My Key Overview/Data/Sources · legacy home renderers removed');
