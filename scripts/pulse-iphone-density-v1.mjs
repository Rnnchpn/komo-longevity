import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-iphone-stable-v1';
const stable='pulse-iphone-stable-v1.css';
const legacy=[
  'pulse-iphone-density-v1.css',
  'pulse-wearable-mobile-v3.css',
  'pulse-iphone-no-topbar-v1.css',
  'pulse-watch-extension-mobile-v4.css',
  'pulse-watch-luxe-colors-v1.css',
  stable
];

await copyFile(join(root,'pulse-app',stable),join(pulse,stable));
let html=await readFile(htmlPath,'utf8');
for(const file of legacy){
  const escaped=file.replaceAll('.','\\.');
  html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\.\\/${escaped}(?:\\?v=[^"]+)?"\\s*\\/?>`,'g'),'');
}
html=html.replace('</head>',`  <link rel="stylesheet" href="./${stable}?v=${release}" />\n</head>`);
await writeFile(htmlPath,html,'utf8');

const [css,final]=await Promise.all([
  readFile(join(pulse,stable),'utf8'),
  readFile(htmlPath,'utf8')
]);
const checks=[
  ['single stable iPhone layer loaded',final.includes(`${stable}?v=${release}`)],
  ['legacy mobile visual layers removed',legacy.filter(x=>x!==stable).every(x=>!final.includes(`./${x}`))],
  ['top banner removed on phone',css.includes('.topbar{display:none!important}')],
  ['KEY remains first home signal',css.includes('.mykomo-key-home{order:-20!important')],
  ['profile/dashboard clutter removed',css.includes('.mykomo-top')&&css.includes('.kdw-actions')&&css.includes('display:none!important')],
  ['Motion and Age remain visible',css.includes('.kdw-score{order:-10!important')&&css.includes('.kdw-age{order:-9!important')],
  ['KEY metrics are two-column and readable',css.includes('.mkh-metrics')&&css.includes('font-size:34px!important')],
  ['KEY route uses same two-column grammar',css.includes('.kh2-stat-grid')&&css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important')],
  ['single persistent dock retained',css.includes('#kpDockV6')&&css.includes('height:64px!important')],
  ['phone only',css.includes('@media (max-width:767px)')],
  ['no auth visibility ownership',!css.includes('#authScreen[hidden]')&&!css.includes('#appShell[hidden]')],
  ['no score/data behavior',!css.includes('fetch(')&&!css.includes('supabase')&&!css.includes('motion_score=')]
];
for(const [label,ok] of checks)console.log(`[pulse-iphone-stable-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-iphone-stable-v1] PASS · one iPhone presentation owner · KEY-first · no stacked visual patches');
