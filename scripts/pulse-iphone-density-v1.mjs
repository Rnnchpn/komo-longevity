import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-iphone-readability-v2';
const noTopbarRelease='20260829-iphone-no-topbar-v1';

await copyFile(join(root,'pulse-app','pulse-iphone-density-v1.css'),join(pulse,'pulse-iphone-density-v1.css'));
await copyFile(join(root,'pulse-app','pulse-iphone-no-topbar-v1.css'),join(pulse,'pulse-iphone-no-topbar-v1.css'));
let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/pulse-iphone-density-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/pulse-iphone-no-topbar-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./pulse-iphone-density-v1.css?v=${release}" />\n  <link rel="stylesheet" href="./pulse-iphone-no-topbar-v1.css?v=${noTopbarRelease}" />\n</head>`);
await writeFile(htmlPath,html,'utf8');

const [css,noTopbar,final]=await Promise.all([
  readFile(join(pulse,'pulse-iphone-density-v1.css'),'utf8'),
  readFile(join(pulse,'pulse-iphone-no-topbar-v1.css'),'utf8'),
  readFile(htmlPath,'utf8')
]);
const checks=[
  ['iPhone readability CSS loaded',final.includes(`pulse-iphone-density-v1.css?v=${release}`)],
  ['no-topbar override loaded after readability',final.includes(`pulse-iphone-no-topbar-v1.css?v=${noTopbarRelease}`)&&final.indexOf(`pulse-iphone-no-topbar-v1.css?v=${noTopbarRelease}`)>final.indexOf(`pulse-iphone-density-v1.css?v=${release}`)],
  ['top banner removed on phone',noTopbar.includes('.topbar{display:none!important}')],
  ['content starts near top',noTopbar.includes('padding-top:8px!important')],
  ['patient identity remains readable',css.includes('.mykomo-identity h2')&&css.includes('font-size:26px!important')&&css.includes('font-size:12.5px!important')],
  ['KEY metrics remain readable',css.includes('.kh2-stat-grid')&&css.includes('font-size:32px!important')],
  ['layout remains phone-only',css.includes('@media (max-width:767px)')&&noTopbar.includes('@media (max-width:767px)')],
  ['no auth visibility ownership',!noTopbar.includes('#authScreen[hidden]')&&!noTopbar.includes('#appShell[hidden]')],
  ['no score/data behavior in visual layer',!noTopbar.includes('fetch(')&&!noTopbar.includes('supabase')&&!noTopbar.includes('motion_score=')]
];
for(const [label,ok] of checks)console.log(`[pulse-iphone-readability-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-iphone-readability-v2] PASS · readable wearable layout + no top banner on iPhone');
