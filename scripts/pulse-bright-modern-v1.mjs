import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'pulse-app','pulse-bright-modern-v1.css');
const targetDir=join(root,'site','pulse-v12');
const target=join(targetDir,'pulse-bright-modern-v1.css');
const version='20260929-bright-modern-v1';

const css=await readFile(source,'utf8');
await writeFile(target,css,'utf8');

async function inject(name){
  const path=join(targetDir,name);
  let html=await readFile(path,'utf8');
  html=html.replace(/<link[^>]+href="\.\/pulse-bright-modern-v1\.css(?:\?[^"]*)?"[^>]*>\s*/g,'');
  html=html.replace(/<meta name="theme-color" content="[^"]*"\s*\/?\s*>/,'<meta name="theme-color" content="#f4f7f5" />');
  html=html.replace('</head>',`  <link rel="stylesheet" href="./pulse-bright-modern-v1.css?v=${version}" />\n</head>`);
  await writeFile(path,html,'utf8');
  return html;
}

const index=await inject('index.html');
const dossier=await inject('dossier.html');

const checks=[
  ['index bright stylesheet last',index.lastIndexOf('pulse-bright-modern-v1.css')>index.lastIndexOf('pulse-canonical-theme-v14.css')],
  ['index light browser theme',index.includes('content="#f4f7f5"')],
  ['dossier bright stylesheet present',dossier.includes('pulse-bright-modern-v1.css')],
  ['bright tokens shipped',css.includes('--kp-blue:#5d78f4')&&css.includes('--kp-coral:#f56f5c')&&css.includes('--kp-bg:#f4f7f5')]
];
for(const [label,ok] of checks)console.log(`[pulse-bright-modern-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-bright-modern-v1] PASS · bright modern visual system is the final presentation layer');
