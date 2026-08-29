import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-iphone-readability-v2';

await copyFile(join(root,'pulse-app','pulse-iphone-density-v1.css'),join(pulse,'pulse-iphone-density-v1.css'));
let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/pulse-iphone-density-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./pulse-iphone-density-v1.css?v=${release}" />\n</head>`);
await writeFile(htmlPath,html,'utf8');

const [css,final]=await Promise.all([
  readFile(join(pulse,'pulse-iphone-density-v1.css'),'utf8'),
  readFile(htmlPath,'utf8')
]);
const checks=[
  ['iPhone readability CSS loaded last',final.includes(`pulse-iphone-density-v1.css?v=${release}`)],
  ['app topbar is readable 60px',css.includes('min-height:60px!important')&&css.includes('height:60px!important')],
  ['duplicate page title and mobile brand are removed',css.includes('.topbar #pageTitle')&&css.includes('.kam-mobile-brand')&&css.includes('display:none!important')],
  ['single KŌMØ Pulse header remains',css.includes('content:"KŌMØ  ·  PULSE"')&&css.includes('font:600 16px/1')],
  ['patient identity is readable',css.includes('.mykomo-identity h2')&&css.includes('font-size:26px!important')&&css.includes('font-size:12.5px!important')],
  ['glance metrics use 2x2 wearable layout',css.includes('.mykomo-command-strip')&&css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important')&&css.includes('font-size:22px!important')],
  ['score pillars are large enough to scan',css.includes('grid-template-columns:repeat(3,minmax(0,1fr))!important')&&css.includes('width:92px!important')&&css.includes('font-size:27px!important')],
  ['KEY metrics use readable two-column cards',css.includes('.kh2-stat-grid')&&css.includes('font-size:32px!important')&&css.includes('font-size:12px!important')],
  ['My KOMO route has readable hierarchy',css.includes('.mkv4 h3')&&css.includes('font-size:21px!important')&&css.includes('.mkv4-stat strong')&&css.includes('font-size:30px!important')],
  ['canonical dock labels are readable and secondary microcopy removed',css.includes('#kpDockV6 b')&&css.includes('font-size:9.5px!important')&&css.includes('#kpDockV6 small{display:none!important}')],
  ['layout remains phone-only',css.includes('@media (max-width:767px)')],
  ['no auth visibility ownership',!css.includes('#authScreen[hidden]')&&!css.includes('#appShell[hidden]')],
  ['no score/data behavior in visual layer',!css.includes('fetch(')&&!css.includes('supabase')&&!css.includes('motion_score=')]
];
for(const [label,ok] of checks)console.log(`[pulse-iphone-readability-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-iphone-readability-v2] PASS · wearable-app hierarchy · large metrics · readable labels · simple dock');
