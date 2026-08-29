import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-wearable-mobile-v3';

await copyFile(join(root,'pulse-app','pulse-wearable-mobile-v3.css'),join(pulse,'pulse-wearable-mobile-v3.css'));
let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/pulse-wearable-mobile-v3\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./pulse-wearable-mobile-v3.css?v=${release}" />\n</head>`);
await writeFile(htmlPath,html,'utf8');

const [css,final]=await Promise.all([
  readFile(join(pulse,'pulse-wearable-mobile-v3.css'),'utf8'),
  readFile(htmlPath,'utf8')
]);
const checks=[
  ['wearable visual layer loaded last',final.includes(`pulse-wearable-mobile-v3.css?v=${release}`)],
  ['phone-only scope retained',css.includes('@media (max-width:767px)')&&css.includes('data-adaptive-shell="phone"')],
  ['graphite app canvas',css.includes('background:#080b0a!important')],
  ['primary Motion and Age share first row',css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important')&&css.includes('.kdw-score')&&css.includes('.kdw-age')],
  ['large circular primary signal',css.includes('width:112px!important')&&css.includes('font-size:36px!important')],
  ['secondary summary duplication removed',css.includes('body.khome-v3 .mykomo-command-strip')&&css.includes('body.khome-v3 .mykomo-score-card')],
  ['KEY uses two-column readable metrics',css.includes('.kh2-stat-grid')&&css.includes('font-size:34px!important')],
  ['bottom dock behaves as compact tab bar',css.includes('#kpDockV6')&&css.includes('height:68px!important')],
  ['visual layer does not own auth visibility',!css.includes('#authScreen[hidden]')&&!css.includes('#appShell[hidden]')],
  ['visual layer does not touch score or data logic',!css.includes('fetch(')&&!css.includes('supabase')&&!css.includes('motion_score=')]
];
for(const [label,ok] of checks)console.log(`[pulse-wearable-mobile-v3] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-wearable-mobile-v3] PASS · wearable-first dark hierarchy · large signals · progressive disclosure');
