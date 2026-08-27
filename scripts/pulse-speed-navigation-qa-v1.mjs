import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pulse=path.join(root,'site','pulse-v12');
const html=fs.readFileSync(path.join(pulse,'index.html'),'utf8');
const app=fs.readFileSync(path.join(pulse,'app.js'),'utf8');
const css=fs.readFileSync(path.join(pulse,'pulse-ui-v1.css'),'utf8');
const middleware=fs.readFileSync(path.join(root,'middleware.js'),'utf8');

const localStyles=(html.match(/<link rel="stylesheet" href="\.\/[^\"]+\.css"/g)||[]).length;
const bundledSources=(css.match(/\/\* FILE:/g)||[]).length;
const checks=[
  ['single local CSS bundle',localStyles===1&&html.includes('./pulse-ui-v1.css')],
  ['bundle preserves many source layers',bundledSources>=20],
  ['Supabase preconnect',html.includes('rel="preconnect" href="https://uqlolefsiktbznnymriy.supabase.co"')],
  ['ESM preconnect',html.includes('rel="preconnect" href="https://esm.sh"')],
  ['stable single-pass app reveal',app.includes("document.body.classList.add('komo-hydrating')")&&app.includes("await loadAppData();document.body.classList.remove('komo-hydrating')")&&app.includes("els.authScreen.hidden=true;els.appShell.hidden=false")&&app.includes("history.replaceState(null,'','#home')")],
  ['data-ready event',app.includes("new CustomEvent('komo:data-ready')")],
  ['hydration navigation state',app.includes("document.body.classList.add('komo-hydrating')")&&css.includes('body.komo-hydrating #refreshButton')],
  ['touch navigation optimized',css.includes('touch-action:manipulation')],
  ['static asset caching enabled',middleware.includes('isStaticAsset')&&middleware.includes("CDN-Cache-Control")],
  ['HTML remains no-store',middleware.includes("'private, no-store, max-age=0'")]
];
for(const [label,ok] of checks){console.log(`[pulse-speed-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exit(1)}
console.log(`[pulse-speed-qa] ${checks.length} checks passed.`);
