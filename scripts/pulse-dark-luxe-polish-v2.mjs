import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-dark-luxe-polish-v2';

await copyFile(join(root,'pulse-app','pulse-dark-luxe-polish-v2.css'),join(pulse,'pulse-dark-luxe-polish-v2.css'));

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/pulse-dark-luxe-polish-v2\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./pulse-dark-luxe-polish-v2.css?v=${release}" />\n</head>`);
await writeFile(htmlPath,html,'utf8');

const [css,final]=await Promise.all([
  readFile(join(pulse,'pulse-dark-luxe-polish-v2.css'),'utf8'),
  readFile(htmlPath,'utf8')
]);
const checks=[
  ['polish CSS loaded last',final.includes(`pulse-dark-luxe-polish-v2.css?v=${release}`)],
  ['canvas remains graphite black',css.includes('--kdp-black:#050706')&&css.includes('#appShell,.main-shell')],
  ['home uses three material hierarchy',css.includes('body.khome-v3 .kdw-score')&&css.includes('body.khome-v3 .kdw-age')&&css.includes('body.khome-v3 .kdw-exp')],
  ['Motion Clinical actions are visually differentiated',css.includes('.kdw-action.primary')&&css.includes('.kdw-action.soft')],
  ['KEY retains forest hero and porcelain metric accents',css.includes('.kh2-today')&&css.includes('.kh2-stat:nth-child(1)')],
  ['My KOMO uses light stats and warm daily surface',css.includes('.mkv4-stats')&&css.includes('.mkv4-daily')],
  ['login uses one porcelain panel on black environment',css.includes('#authScreen .auth-panel')&&css.includes('linear-gradient(145deg,#efede6,#e5e2d9)')],
  ['iPhone shares same material language',css.includes('/* ========================================================================== \n   IPHONE')&&css.includes('.kam-bottom')&&css.includes('html.kamo-phone-auth #authScreen .auth-panel')],
  ['visual layer does not own auth visibility',!css.includes('#authScreen[hidden]')&&!css.includes('#appShell[hidden]')],
  ['visual layer does not touch score calculation',!css.includes('motion_score=')&&!css.includes('clinical_score=')]
];
for(const [label,ok] of checks)console.log(`[pulse-dark-luxe-polish-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-dark-luxe-polish-v2] PASS · graphite canvas + porcelain/forest/warm hierarchy · desktop + iPhone');
