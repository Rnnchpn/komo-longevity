import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-iphone-density-v1';

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
  ['iPhone density CSS loaded last',final.includes(`pulse-iphone-density-v1.css?v=${release}`)],
  ['compact topbar is 54px',css.includes('min-height:54px!important')&&css.includes('height:54px!important')],
  ['duplicate page title and mobile brand are removed',css.includes('.topbar #pageTitle')&&css.includes('.kam-mobile-brand')&&css.includes('display:none!important')],
  ['single KŌMØ Pulse compact header remains',css.includes('content:"KŌMØ  ·  PULSE"')],
  ['view uses near-edge-to-edge width',css.includes('padding:6px 7px 72px!important')],
  ['home identity is left aligned',css.includes('.mykomo-identity')&&css.includes('justify-content:flex-start!important')],
  ['dashboard cells are denser',css.includes('min-height:72px!important')&&css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important')],
  ['score instruments fit three across',css.includes('grid-template-columns:repeat(3,minmax(0,1fr))!important')&&css.includes('width:72px!important')],
  ['canonical patient dock is compact',css.includes('#kpDockV6')&&css.includes('height:60px!important')],
  ['layout remains phone-only',css.includes('@media (max-width:767px)')],
  ['no auth visibility ownership',!css.includes('#authScreen[hidden]')&&!css.includes('#appShell[hidden]')],
  ['no score/data behavior in visual layer',!css.includes('fetch(')&&!css.includes('supabase')&&!css.includes('motion_score=')]
];
for(const [label,ok] of checks)console.log(`[pulse-iphone-density-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-iphone-density-v1] PASS · compact header + full-width content + aligned mobile home + compact dock');
