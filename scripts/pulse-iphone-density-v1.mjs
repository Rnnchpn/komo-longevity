import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-iphone-readability-v2';
const wearableRelease='20260829-wearable-mobile-v3';
const noTopbarRelease='20260829-iphone-no-topbar-v1';
const watchRelease='20260829-watch-extension-mobile-v4';
const luxeRelease='20260829-watch-luxe-colors-v1';
const files=['pulse-iphone-density-v1.css','pulse-wearable-mobile-v3.css','pulse-iphone-no-topbar-v1.css','pulse-watch-extension-mobile-v4.css','pulse-watch-luxe-colors-v1.css'];

for(const file of files){
  await copyFile(join(root,'pulse-app',file),join(pulse,file));
}
let html=await readFile(htmlPath,'utf8');
for(const file of files){
  const escaped=file.replaceAll('.','\\.');
  html=html.replace(new RegExp(`\\s*<link rel="stylesheet" href="\\.\\/${escaped}(?:\\?v=[^"]+)?"\\s*\\/?>`,'g'),'');
}
html=html.replace('</head>',`  <link rel="stylesheet" href="./pulse-iphone-density-v1.css?v=${release}" />\n  <link rel="stylesheet" href="./pulse-wearable-mobile-v3.css?v=${wearableRelease}" />\n  <link rel="stylesheet" href="./pulse-iphone-no-topbar-v1.css?v=${noTopbarRelease}" />\n  <link rel="stylesheet" href="./pulse-watch-extension-mobile-v4.css?v=${watchRelease}" />\n  <link rel="stylesheet" href="./pulse-watch-luxe-colors-v1.css?v=${luxeRelease}" />\n</head>`);
await writeFile(htmlPath,html,'utf8');

const [css,wearable,noTopbar,watch,luxe,final]=await Promise.all([
  readFile(join(pulse,'pulse-iphone-density-v1.css'),'utf8'),
  readFile(join(pulse,'pulse-wearable-mobile-v3.css'),'utf8'),
  readFile(join(pulse,'pulse-iphone-no-topbar-v1.css'),'utf8'),
  readFile(join(pulse,'pulse-watch-extension-mobile-v4.css'),'utf8'),
  readFile(join(pulse,'pulse-watch-luxe-colors-v1.css'),'utf8'),
  readFile(htmlPath,'utf8')
]);
const checks=[
  ['iPhone readability CSS loaded',final.includes(`pulse-iphone-density-v1.css?v=${release}`)],
  ['wearable hierarchy loaded after readability',final.includes(`pulse-wearable-mobile-v3.css?v=${wearableRelease}`)&&final.indexOf(`pulse-wearable-mobile-v3.css?v=${wearableRelease}`)>final.indexOf(`pulse-iphone-density-v1.css?v=${release}`)],
  ['no-topbar override loaded after wearable hierarchy',final.includes(`pulse-iphone-no-topbar-v1.css?v=${noTopbarRelease}`)&&final.indexOf(`pulse-iphone-no-topbar-v1.css?v=${noTopbarRelease}`)>final.indexOf(`pulse-wearable-mobile-v3.css?v=${wearableRelease}`)],
  ['watch-extension loaded after no-topbar',final.includes(`pulse-watch-extension-mobile-v4.css?v=${watchRelease}`)&&final.indexOf(`pulse-watch-extension-mobile-v4.css?v=${watchRelease}`)>final.indexOf(`pulse-iphone-no-topbar-v1.css?v=${noTopbarRelease}`)],
  ['luxury palette is final phone visual layer',final.includes(`pulse-watch-luxe-colors-v1.css?v=${luxeRelease}`)&&final.indexOf(`pulse-watch-luxe-colors-v1.css?v=${luxeRelease}`)>final.indexOf(`pulse-watch-extension-mobile-v4.css?v=${watchRelease}`)],
  ['top banner removed on phone',noTopbar.includes('.topbar{display:none!important}')],
  ['KEY is first home signal on phone',watch.includes('.mykomo-key-home')&&watch.includes('order:-20!important')],
  ['profile/dashboard clutter removed from phone home',watch.includes('.mykomo-top')&&watch.includes('.kdw-actions')&&watch.includes('display:none!important')],
  ['Motion and Age remain visible as secondary context',watch.includes('.kdw-score{order:-10!important')&&watch.includes('.kdw-age{order:-9!important')],
  ['daily KEY metrics remain large and readable',watch.includes('.mkh-metrics')&&watch.includes('font-size:34px!important')],
  ['dedicated KEY route keeps two-column wearable metrics',watch.includes('.kh2-stat-grid')&&watch.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important')],
  ['luxury palette uses obsidian ivory and champagne',luxe.includes('--kw-obsidian:#080907')&&luxe.includes('--kw-ivory:#eee9df')&&luxe.includes('--kw-champagne:#b9aa8d')],
  ['neon wearable green removed from final palette',!luxe.includes('#a9d85e')&&!luxe.includes('#b4dd79')],
  ['layout remains phone-only',css.includes('@media (max-width:767px)')&&wearable.includes('@media (max-width:767px)')&&noTopbar.includes('@media (max-width:767px)')&&watch.includes('@media (max-width:767px)')&&luxe.includes('@media (max-width:767px)')],
  ['no auth visibility ownership',![wearable,noTopbar,watch,luxe].some(x=>x.includes('#authScreen[hidden]')||x.includes('#appShell[hidden]'))],
  ['no score/data behavior in visual layers',![wearable,noTopbar,watch,luxe].some(x=>x.includes('fetch(')||x.includes('supabase')||x.includes('motion_score='))]
];
for(const [label,ok] of checks)console.log(`[pulse-watch-luxe-colors-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-watch-luxe-colors-v1] PASS · obsidian + warm ivory + champagne · KEY-first iPhone companion');
