import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.cwd();
const source=join(root,'pulse-app');
const target=join(root,'site','pulse-v12');
const version='20261007-poc-v1';
for(const name of ['poc-v1.css','poc-v1.js'])await copyFile(join(source,name),join(target,name));

const indexPath=join(target,'index.html');
let html=await readFile(indexPath,'utf8');
html=html
  .replace(/\s*<link[^>]+href=["']\.\/poc-v1\.css(?:\?[^"']*)?["'][^>]*>/g,'')
  .replace(/\s*<script[^>]+src=["']\.\/poc-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/g,'')
  .replace(/<title>[\s\S]*?<\/title>/,'<title>KŌMØ Pulse — Baseline & Trajectory</title>')
  .replace(/<meta name="description" content="[^"]*"\s*\/>/,'<meta name="description" content="KŌMØ Pulse rassemble questionnaires, biologie, mesures VALD, résultats et trajectoire longitudinale." />');
html=html.replace('</head>',`  <link rel="stylesheet" href="./poc-v1.css?v=${version}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./poc-v1.js?v=${version}"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

const count=(html.match(/poc-v1\.js/g)||[]).length;
if(count!==1)throw new Error(`Expected one POC V1 runtime owner, found ${count}`);
console.log('[pulse-poc-v1-final] patient Home/Baseline/Results/Trajectory replaced by POC V1 owner · legacy auth/pro surfaces preserved');
