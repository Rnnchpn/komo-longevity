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

const homeBrandHref='./mobile-home-brand-final-v1.css?v=20260828-home-brand-1';
if(!html.includes(homeBrandHref))html=html.replace('</head>',`  <link rel="stylesheet" href="${homeBrandHref}" />\n</head>`);

await writeFile(htmlPath,html);
console.log('[pulse-mobile-stability-final-v2] coherent auth/navigation/design release cache-busted + mobile home brand emphasized');
