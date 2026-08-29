import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-iphone-app-lock-v1';

for(const file of ['iphone-app-lock-v1.css','iphone-app-lock-v1.js']){
  await copyFile(join(root,'pulse-app',file),join(pulse,file));
}

let html=await readFile(htmlPath,'utf8');
html=html.replace(/<meta name="viewport" content="[^"]*"\s*\/?>/,'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/iphone-app-lock-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/iphone-app-lock-v1\.js(?:\?v=[^"]+)?"><\/script>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./iphone-app-lock-v1.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./iphone-app-lock-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const [css,js,final]=await Promise.all([
  readFile(join(pulse,'iphone-app-lock-v1.css'),'utf8'),
  readFile(join(pulse,'iphone-app-lock-v1.js'),'utf8'),
  readFile(htmlPath,'utf8')
]);

const checks=[
  ['iPhone lock CSS is loaded last',final.includes(`iphone-app-lock-v1.css?v=${release}`)],
  ['iPhone lock runtime is loaded last',final.includes(`iphone-app-lock-v1.js?v=${release}`)],
  ['base viewport keeps safe areas and keyboard resizing',final.includes('viewport-fit=cover')&&final.includes('interactive-widget=resizes-content')],
  ['zoom lock is scoped to iPhone runtime',js.includes('maximum-scale=1')&&js.includes('user-scalable=no')&&js.includes('const IOS=')],
  ['phone shell is fixed to viewport',css.includes('position: fixed !important')&&css.includes('kamo-iphone-locked')],
  ['app content owns vertical scroll',css.includes('.main-shell')&&css.includes('overflow-y: auto !important')],
  ['horizontal page drift is blocked',css.includes('overflow-x: hidden !important')&&css.includes('touch-action: pan-y !important')],
  ['Safari form zoom is prevented',css.includes('font-size: 16px !important')],
  ['pinch gesture is actively blocked on iPhone',js.includes("'gesturestart'")&&js.includes('blockMultiTouch')],
  ['double-tap zoom is actively blocked',js.includes('blockDoubleTap')],
  ['visual viewport drives app height',js.includes('visualViewport')&&js.includes('--kamo-viewport-height')]
];

for(const [label,ok] of checks)console.log(`[pulse-iphone-app-lock-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-iphone-app-lock-v1] PASS · iPhone behaves as a fixed app surface with zoom locked');
