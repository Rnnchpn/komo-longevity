import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.cwd();
const source=join(root,'pulse-app');
const target=join(root,'site','pulse-v12');
const version='20261007-operator-v1';

for(const name of ['operator-console-v1.css','operator-console-v1.js']){
  await copyFile(join(source,name),join(target,name));
}

const indexPath=join(target,'index.html');
let html=await readFile(indexPath,'utf8');
html=html
  .replace(/\s*<link[^>]+href=["']\.\/operator-console-v1\.css(?:\?[^"']*)?["'][^>]*>/g,'')
  .replace(/\s*<script[^>]+src=["']\.\/operator-console-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/g,'');

html=html.replace('</head>',`  <link rel="stylesheet" href="./operator-console-v1.css?v=${version}" />\n</head>`);
html=html.replace('</body>',`  <script type="module" src="./operator-console-v1.js?v=${version}"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

const jsCount=(html.match(/operator-console-v1\.js/g)||[]).length;
const cssCount=(html.match(/operator-console-v1\.css/g)||[]).length;
if(jsCount!==1||cssCount!==1)throw new Error(`Operator V1 asset injection invalid: js=${jsCount} css=${cssCount}`);

console.log('[pulse-operator-v1-final] Operator Console owns professional Motion workspace · legacy Myodev remains unexposed');
