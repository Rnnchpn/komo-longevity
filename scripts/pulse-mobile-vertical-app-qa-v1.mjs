import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const read=name=>readFile(join(pulse,name),'utf8');
const [html,css,js]=await Promise.all([
  read('index.html'),
  read('mobile-vertical-app-v1.css'),
  read('mobile-vertical-app-v1.js')
]);

const checks=[
  ['vertical app CSS loaded last',html.includes('mobile-vertical-app-v1.css?v=20260829-mobile-vertical-1')],
  ['vertical app JS loaded',html.includes('mobile-vertical-app-v1.js?v=20260829-mobile-vertical-1')],
  ['viewport keeps device width and app keyboard behavior',html.includes('width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content')],
  ['horizontal bottom navigation hidden on phone',css.includes('#kamBottomBar')&&css.includes('display: none !important')],
  ['role switch hidden from horizontal phone surface',css.includes('#kamRoleRow')],
  ['menu navigation is single column',css.includes('.kam-vertical-primary')&&css.includes('grid-template-columns: 1fr !important')],
  ['mobile canvas cannot overflow horizontally',css.includes('overflow-x: hidden !important')&&css.includes('max-width: 100% !important')],
  ['app shell owns vertical scrolling',css.includes('height: 100dvh !important')&&css.includes('overflow-y: auto !important')],
  ['centered KŌMØ brand retained',css.includes('.kam-mobile-brand')&&css.includes('justify-items: center !important')],
  ['centered menu button present',css.includes('#kamTopMenu')&&css.includes('justify-content: center !important')],
  ['primary routes cloned into vertical menu',js.includes("bottom.querySelectorAll('[data-kam-nav]')")&&js.includes("x.dataset.kamNav!=='more'")],
  ['micro animations include reduced-motion fallback',css.includes('@keyframes kamoRouteIn')&&css.includes('prefers-reduced-motion')]
];

let failed=0;
for(const [label,ok] of checks){console.log(`[pulse-mobile-vertical-app-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)throw new Error(`[pulse-mobile-vertical-app-qa] ${failed} check(s) failed`);
console.log(`[pulse-mobile-vertical-app-qa] ${checks.length} checks passed.`);
