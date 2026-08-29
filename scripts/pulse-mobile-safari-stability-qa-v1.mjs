import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const [html,router,css,js]=await Promise.all([
  readFile(join(pulse,'index.html'),'utf8'),
  readFile(join(pulse,'app-router-v2.js'),'utf8'),
  readFile(join(pulse,'mobile-safari-stability-v1.css'),'utf8'),
  readFile(join(pulse,'mobile-safari-stability-v1.js'),'utf8')
]);
const release='20260829-safari-stable-2';
const checks=[
  ['startup guard is inline before first auth paint',html.includes('id="pulseStartupGuard"')&&html.includes('data-pulse-auth-resolved')],
  ['startup splash is present',html.includes('id="pulseStartup"')&&html.includes('Longevity in motion.')],
  ['final Safari CSS is shipped',html.includes(`mobile-safari-stability-v1.css?v=${release}`)],
  ['final Safari runtime is shipped',html.includes(`mobile-safari-stability-v1.js?v=${release}`)],
  ['patched app router is cache-busted',html.includes(`app-router-v2.js?v=${release}`)],
  ['mobile defaults to persistent login only when preference is unset',router.includes("mobile&&localStorage.getItem(REMEMBER_KEY)===null")&&router.includes("localStorage.setItem(REMEMBER_KEY,'1')")],
  ['explicit remember opt-out is preserved',router.includes("else localStorage.setItem(REMEMBER_KEY,'0');syncClient()")],
  ['login is not displayed while a valid mobile session hydrates',router.includes("els.authScreen.hidden=true;els.appShell.hidden=false;renderNavigation()")&&router.includes('Synchronisation de votre espace')],
  ['auth is only revealed after startup resolution',router.includes("finishStartup('auth')")],
  ['hidden attribute wins over legacy mobile display rules',css.includes('#authScreen[hidden]')&&css.includes('display: none !important')],
  ['Safari BFCache stale page triggers a real reload',js.includes('event.persisted')&&js.includes('location.reload()')],
  ['Safari normal restore reconciles auth and app',js.includes('pageshow')&&js.includes('if(a&&!a.hidden&&login&&!login.hidden)login.hidden=true')],
  ['all entry states reset viewport to top',js.includes('history.scrollRestoration')&&js.includes('window.scrollTo(0,0)')&&js.includes("main()?.scrollTo({top:0,left:0,behavior:'auto'})")],
  ['route changes reset viewport top',js.includes("window.addEventListener('hashchange'")&&js.includes('hardTop()')],
  ['mobile shell still blocks horizontal overflow',css.includes('overflow-x: hidden !important')],
  ['reduced motion remains supported',css.includes('prefers-reduced-motion')]
];
let failed=0;
for(const [label,ok] of checks){console.log(`[pulse-mobile-safari-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)throw new Error(`[pulse-mobile-safari-qa] ${failed} check(s) failed`);
console.log(`[pulse-mobile-safari-qa] ${checks.length} checks passed.`);
