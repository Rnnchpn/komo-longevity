import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd(),pulse=join(root,'site','pulse-v12');
const [html,css,js,adaptive,home,dashboard,datawall,nav,app]=await Promise.all([
  readFile(join(pulse,'index.html'),'utf8'),
  readFile(join(pulse,'mobile-canonical-v1.css'),'utf8'),
  readFile(join(pulse,'mobile-canonical-v1.js'),'utf8'),
  readFile(join(pulse,'adaptive-shell-v4.js'),'utf8'),
  readFile(join(pulse,'my-komo-home-v1.js'),'utf8'),
  readFile(join(pulse,'my-komo-dashboard-v2.js'),'utf8'),
  readFile(join(pulse,'patient-home-datawall-v3.js'),'utf8'),
  readFile(join(pulse,'patient-navigation-core-v1.js'),'utf8'),
  readFile(join(pulse,'app-router-v2.js'),'utf8')
]);
const release='20260829-mobile-canonical-3';
const checks=[
  ['canonical CSS is final phone stylesheet',html.includes(`mobile-canonical-v1.css?v=${release}`)],
  ['canonical JS is final phone runtime',html.includes(`mobile-canonical-v1.js?v=${release}`)],
  ['document release marker matches canonical mobile release',html.includes(`<meta name="komo-pulse-release" content="${release}" />`)],
  ['patient route coordinator is cache-busted with mobile release',html.includes(`patient-navigation-core-v1.js?v=${release}`)],
  ['old vertical app runtime removed',!html.includes('mobile-vertical-app-v1.js')&&!html.includes('mobile-vertical-app-v1.css')],
  ['old guided phone runtime removed',!html.includes('mobile-guided-v2.js')],
  ['old final performance CSS removed',!html.includes('mobile-performance-final-v1.css')],
  ['Safari auth/session stability preserved',html.includes('mobile-safari-stability-v1.js')&&html.includes('mobile-safari-stability-v1.css')],
  ['adaptive shell is tablet only',adaptive.includes("function adaptive(){return window.matchMedia(TABLET).matches")&&adaptive.includes("html.dataset.adaptiveShell='tablet'")],
  ['phone home is owned by canonical runtime',home.includes("'__kcm__'")&&dashboard.includes("'__kcm__'")&&datawall.includes("'__kcm__'")],
  ['home begins with account and three clickable Komo universes',js.includes('MON ESPACE')&&js.includes('KŌMØ MOTION')&&js.includes('KŌMØ CLINICAL')&&js.includes('KŌMØ KEY')],
  ['home KEY shows only useful daily results',js.includes('Vos signaux du quotidien.')&&js.includes("['Pas'")&&js.includes("['Sommeil'")&&js.includes("['FC repos'")&&js.includes("['Activité'")],
  ['provider brands are not rendered by the home KEY card',!js.slice(js.indexOf('function keyCard'),js.indexOf('function xpCard')).includes('Garmin')],
  ['experience progress is first-page third block',js.includes('Votre progression KŌMØ.')&&js.includes('xp_total')&&js.includes('xp_today')&&js.includes('${points}</b> KP')],
  ['Komo Link is a registered patient route',nav.includes("'link'")&&app.includes("'link'")],
  ['Komo Connected provider list is consolidated under Link',js.includes('KŌMØ CONNECTED')&&js.includes('Apple Health & Watch')&&js.includes('Garmin Connect')&&js.includes('WHOOP')&&js.includes('Oura')&&js.includes('Strava')&&js.includes('Health Connect')&&js.includes('Fitbit')],
  ['mobile menu follows requested hierarchy',js.includes("routeButton('mykomo','My KŌMØ'")&&js.includes("routeButton('key','KŌMØ Key'")&&js.includes("routeButton('link','KŌMØ Link'")&&js.includes("routeButton('documents','Rendez-vous & agenda'")],
  ['professional and admin remain secondary access',js.includes('Espace professionnel')&&js.includes('Administration KŌMØ')],
  ['phone canvas blocks horizontal layout',css.includes('overflow-x:hidden!important')&&css.includes('height:100dvh!important')],
  ['mobile avoids Safari focus zoom',css.includes('font-size:16px!important')],
  ['legacy bottom docks are hidden',css.includes('#kpDockV6')&&css.includes('#kamBottomBar')],
  ['canonical clinical result remains available for account status',js.includes("import { loadCanonicalResult } from './canonical-result-runtime.js'")],
  ['wearable data is read without displaying provider brands on home',js.includes('wearable_daily_metrics')&&js.includes('wearable_consents')],
  ['mobile home includes no old score-ring hero',!js.includes('kcm-score-ring')&&!js.includes('Votre mobilité, en un regard.')]
];
let failed=0;
for(const [label,ok] of checks){console.log(`[pulse-mobile-canonical-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)throw new Error(`[pulse-mobile-canonical-qa] ${failed} check(s) failed`);
console.log(`[pulse-mobile-canonical-qa] ${checks.length} checks passed.`);
