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
  ['mobile app CSS loaded last with v2 release',html.includes('mobile-vertical-app-v1.css?v=20260829-mobile-app-v2')],
  ['mobile app JS loaded last with v2 release',html.includes('mobile-vertical-app-v1.js?v=20260829-mobile-app-v2')],
  ['viewport keeps device width and keyboard resizing',html.includes('width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content')],
  ['viewport does not disable accessibility zoom',!html.includes('user-scalable=no')&&!html.includes('maximum-scale=1')],
  ['standalone mobile metadata is present',html.includes('apple-mobile-web-app-capable')&&html.includes('mobile-web-app-capable')],
  ['phone auth is a dedicated responsive surface',css.includes('html.kamo-phone-auth #authScreen')&&css.includes('.auth-panel-wrap')&&css.includes('.auth-manifesto h1')],
  ['login controls avoid Safari focus zoom',css.includes('font-size: 16px !important')&&css.includes('.auth-form input[type="email"]')],
  ['authenticated canvas is app-height and internally scrollable',css.includes('html.kamo-phone-app #appShell')&&css.includes('var(--kamo-viewport-height, 100dvh)')&&css.includes('overflow-y: auto !important')],
  ['horizontal bottom navigation is hidden',css.includes('#kamBottomBar')&&css.includes('display: none !important')],
  ['role strip is removed from phone surface',css.includes('#kamRoleRow')],
  ['primary menu is centered and vertical',css.includes('.kam-vertical-primary')&&css.includes('grid-template-columns: 1fr !important')&&css.includes('max-width: 360px !important')],
  ['professional tabs are vertical on phone',css.includes('.kcp-tabs')&&css.includes('[data-mobile-stack-tabs="1"]')],
  ['admin tabs are vertical on phone',css.includes('.kav2-tabs')],
  ['desktop tables become mobile cards',css.includes('.kamo-mobile-table td::before')&&js.includes('annotateTables')&&js.includes('dataset.mobileLabel')],
  ['mobile canvas explicitly blocks horizontal overflow',css.includes('overflow-x: hidden !important')&&css.includes('max-width: 100% !important')],
  ['forms stack and inputs stay device width',css.includes('#viewRoot input')&&css.includes('grid-template-columns: 1fr !important')],
  ['centered KŌMØ brand and menu button remain',css.includes('.kam-mobile-brand')&&css.includes('#kamTopMenu')&&css.includes('justify-content: center !important')],
  ['runtime distinguishes login and app states',js.includes('kamo-phone-auth')&&js.includes('kamo-phone-app')],
  ['runtime uses visual viewport for iOS keyboard',js.includes('window.visualViewport')&&js.includes('--kamo-viewport-height')],
  ['runtime avoids body-wide mutation observer',!js.includes('observer.observe(document.body')&&!js.includes('observe(document.body')],
  ['route changes reset horizontal position and animate subtly',js.includes('routeTransition')&&js.includes("scrollTo({top:0,left:0,behavior:'auto'})")&&css.includes('@keyframes kamoRouteIn')],
  ['micro animations respect reduced motion',css.includes('prefers-reduced-motion: reduce')]
];

let failed=0;
for(const [label,ok] of checks){
  console.log(`[pulse-mobile-vertical-app-qa] ${ok?'OK':'FAIL'} · ${label}`);
  if(!ok)failed++;
}
if(failed)throw new Error(`[pulse-mobile-vertical-app-qa] ${failed} check(s) failed`);
console.log(`[pulse-mobile-vertical-app-qa] ${checks.length} checks passed.`);
