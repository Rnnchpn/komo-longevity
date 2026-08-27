import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const read=name=>readFile(join(pulse,name),'utf8');
const [html,runtime,perf,guard,css,design]=await Promise.all([
  read('index.html'),read('runtime.js'),read('performance-runtime-v1.js'),read('session-shell-guard-v1.js'),read('pulse-final-design-v1.css'),read('pulse-final-design-v1.js')
]);
const checks=[
  ['dynamic auth storage installed before Supabase modules',runtime.includes('__komoAuthStorageV2')&&runtime.includes('preferredStore')],
  ['runtime rechecks session on navigation',perf.includes("window.addEventListener('hashchange'")&&perf.includes('syncSession')],
  ['runtime follows auth state changes',perf.includes('onAuthStateChange')],
  ['runtime can adopt the app login client',perf.includes('R.adoptClient=')&&perf.includes('bindAuth()')],
  ['shell guard no longer logs out on a transient null runtime session',!guard.includes('app.hidden=true')&&guard.includes('auth.hidden=true')],
  ['home is owned only by My KŌMØ',design.includes('root.children')&&design.includes('node===myKomo')],
  ['final mobile CSS normalizes patient pro admin surfaces',css.includes('Final mobile audit')&&css.includes('data-adaptive-mode="pro"')&&css.includes('data-adaptive-mode="admin"')],
  ['final mobile navigation respects safe area',css.includes('env(safe-area-inset-bottom)')],
  ['core assets share the same release token',html.includes('runtime.js?v=20260827-mobile-stable-2')&&html.includes('app.js?v=20260827-mobile-stable-2')&&html.includes('pulse-ui-v1.css?v=20260827-mobile-stable-2')&&html.includes('pulse-final-design-v1.js?v=20260827-mobile-stable-2')]
];
let failed=0;
for(const [label,ok] of checks){console.log(`[pulse-mobile-final-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)throw new Error(`[pulse-mobile-final-qa] ${failed} check(s) failed`);
console.log(`[pulse-mobile-final-qa] ${checks.length} checks passed.`);
