import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd(),pulse=join(root,'site','pulse-v12');
const [html,css,js,adaptive,home,dashboard,datawall]=await Promise.all([
  readFile(join(pulse,'index.html'),'utf8'),
  readFile(join(pulse,'mobile-canonical-v1.css'),'utf8'),
  readFile(join(pulse,'mobile-canonical-v1.js'),'utf8'),
  readFile(join(pulse,'adaptive-shell-v4.js'),'utf8'),
  readFile(join(pulse,'my-komo-home-v1.js'),'utf8'),
  readFile(join(pulse,'my-komo-dashboard-v2.js'),'utf8'),
  readFile(join(pulse,'patient-home-datawall-v3.js'),'utf8')
]);

const checks=[
  ['canonical CSS is final phone stylesheet',/mobile-canonical-v1\.css\?v=20260829-mobile-canonical-1/.test(html)],
  ['canonical JS is final phone runtime',/mobile-canonical-v1\.js\?v=20260829-mobile-canonical-1/.test(html)],
  ['old vertical app runtime removed',!html.includes('mobile-vertical-app-v1.js')&&!html.includes('mobile-vertical-app-v1.css')],
  ['old guided phone runtime removed',!html.includes('mobile-guided-v2.js')],
  ['old final performance CSS removed',!html.includes('mobile-performance-final-v1.css')],
  ['Safari auth/session stability preserved',html.includes('mobile-safari-stability-v1.js')&&html.includes('mobile-safari-stability-v1.css')],
  ['adaptive shell is tablet only',adaptive.includes("function adaptive(){return window.matchMedia(TABLET).matches")&&adaptive.includes("html.dataset.adaptiveShell='tablet'")],
  ['phone home is owned by canonical runtime',home.includes("'__kcm__'")&&dashboard.includes("'__kcm__'")&&datawall.includes("'__kcm__'")],
  ['mobile home prioritizes Motion Score and KOMO Age',js.includes('Motion Score')&&js.includes('KŌMØ AGE')&&js.includes('Voir tous mes scores')],
  ['connected watch follow-up is first class',js.includes('SUIVI CONNECTÉ · KŌMØ KEY')&&js.includes('wearable_daily_metrics')&&js.includes('wearable_consents')],
  ['canonical navigation is vertical and patient focused',js.includes("routeButton('home','Accueil'")&&js.includes("routeButton('trajectory','Mes scores'")&&js.includes("routeButton('key','Suivi montre · KEY'")&&css.includes('.kcm-menu-nav{width:100%;max-width:420px;margin:auto;display:grid')],
  ['professional and admin remain secondary access',js.includes('Espace professionnel')&&js.includes('Administration KŌMØ')],
  ['phone canvas blocks horizontal layout',css.includes('overflow-x:hidden!important')&&css.includes('height:100dvh!important')],
  ['mobile avoids zoom-sized form controls',css.includes('font-size:16px!important')],
  ['legacy bottom docks are hidden',css.includes('#kpDockV6')&&css.includes('#kamBottomBar')],
  ['canonical result remains source of clinical score',js.includes("import { loadCanonicalResult } from './canonical-result-runtime.js'")],
  ['wearable data stays separated from Motion Score copy',js.includes('restent séparées du calcul du Motion Score')]
];
let failed=0;
for(const [label,ok] of checks){console.log(`[pulse-mobile-canonical-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)throw new Error(`[pulse-mobile-canonical-qa] ${failed} check(s) failed`);
console.log(`[pulse-mobile-canonical-qa] ${checks.length} checks passed.`);
