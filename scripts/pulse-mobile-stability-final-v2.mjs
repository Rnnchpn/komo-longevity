import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
let html=await readFile(htmlPath,'utf8');
const release='20260827-mobile-stable-2';
const assets=[
  'runtime.js',
  'app.js',
  'performance-runtime-v1.js',
  'session-shell-guard-v1.js',
  'adaptive-shell-v4.js',
  'my-komo-home-v1.js',
  'adaptive-plus-v1.js',
  'pulse-final-design-v1.js',
  'pulse-final-design-v1.css',
  'pulse-ui-v1.css'
];
for(const file of assets){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\./${escaped}(?:\\?v=[^\"']+)?`,'g'),`./${file}?v=${release}`);
}
await writeFile(htmlPath,html);
console.log('[pulse-mobile-stability-final-v2] coherent auth/navigation/design release cache-busted');
