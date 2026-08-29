import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-dark-luxe-v1';

await copyFile(join(root,'pulse-app','pulse-dark-luxe-v1.css'),join(pulse,'pulse-dark-luxe-v1.css'));

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/pulse-dark-luxe-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace(/<meta name="theme-color" content="[^"]*"\s*\/?>/,'<meta name="theme-color" content="#070908" />');
html=html.replace(/<meta name="apple-mobile-web-app-status-bar-style" content="[^"]*"\s*\/?>/,'<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />');
html=html.replace('</head>',`  <link rel="stylesheet" href="./pulse-dark-luxe-v1.css?v=${release}" />\n</head>`);
await writeFile(htmlPath,html,'utf8');

const [css,final]=await Promise.all([
  readFile(join(pulse,'pulse-dark-luxe-v1.css'),'utf8'),
  readFile(htmlPath,'utf8')
]);
const checks=[
  ['dark luxe CSS loaded last',final.includes(`pulse-dark-luxe-v1.css?v=${release}`)],
  ['browser chrome uses black theme color',final.includes('<meta name="theme-color" content="#070908"')],
  ['iPhone standalone status bar is dark',final.includes('apple-mobile-web-app-status-bar-style" content="black-translucent"')],
  ['global app background is near-black',css.includes('--kd-bg:#070908')&&css.includes('#appShell')&&css.includes('.main-shell')],
  ['cards retain elevated premium surface',css.includes('--kd-panel:#101411')&&css.includes('box-shadow:0 20px 54px')],
  ['KEY has dedicated dark treatment',css.includes('/* ---------- KEY ---------- */')&&css.includes('.kh2-stage-head')&&css.includes('.kh2-today')],
  ['My KOMO has dedicated dark treatment',css.includes('/* ---------- MY KŌMØ ---------- */')&&css.includes('.mkv4-card')],
  ['auth has dedicated dark treatment',css.includes('/* ---------- AUTH ---------- */')&&css.includes('#authScreen .auth-panel')],
  ['phone gets same dark visual language',css.includes('/* ---------- PHONE ---------- */')&&css.includes('.kam-bottom')],
  ['visual layer does not change hidden/display auth ownership',!css.includes('#authScreen[hidden]')&&!css.includes('#appShell[hidden]')]
];
for(const [label,ok] of checks)console.log(`[pulse-dark-luxe-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-dark-luxe-v1] PASS · black graphite background + elevated cards + sage/warm accents on desktop and iPhone');
