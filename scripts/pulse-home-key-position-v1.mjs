import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260903-home-direction-v7';

let html=await readFile(htmlPath,'utf8');
html=html
  .replace(/\s*<link rel="stylesheet" href="\.\/home-key-position-v1\.css(?:\?[^\"]*)?"\s*\/?>/g,'')
  .replace(/\s*<script src="\.\/home-key-position-v1\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/patient-home-command-v1\.css(?:\?[^\"]*)?/g,`patient-home-command-v1.css?v=${release}`)
  .replace(/patient-home-command-v1\.js(?:\?[^\"]*)?/g,`patient-home-command-v1.js?v=${release}`);

await writeFile(htmlPath,html,'utf8');

const final=await readFile(htmlPath,'utf8');
const home=await readFile(join(root,'pulse-app','patient-home-command-v1.js'),'utf8');
const css=await readFile(join(root,'pulse-app','patient-home-command-v1.css'),'utf8');
const checks=[
  ['canonical Home owner shipped',final.includes(`patient-home-command-v1.js?v=${release}`)],
  ['canonical Home styles shipped',final.includes(`patient-home-command-v1.css?v=${release}`)],
  ['legacy KEY reparent runtime absent',!final.includes('home-key-position-v1.js')],
  ['legacy KEY position stylesheet absent',!final.includes('home-key-position-v1.css')],
  ['Home V7 is data free',home.includes("const VERSION='7.0.0'")&&home.includes('data-khome-v7')&&home.includes('dataFree:true')],
  ['Home performs no health-data fetch',!home.includes("rpc('")&&!home.includes("from('")&&!home.includes('motionToday')&&!home.includes('pulse_score_runs')],
  ['Home exposes no metric or score UI',!home.includes('MOTION TODAY')&&!home.includes('Steps')&&!home.includes('Sleep')&&!home.includes('Resting HR')&&!home.includes('Motion Score')],
  ['Home routes to Results',home.includes('data-kh7-route="results"')],
  ['Home routes to Connected',home.includes('data-kh7-route="key"')],
  ['Home routes to Consultations & rendez-vous',home.includes('data-kh7-route="documents"')&&home.includes('Consultations & rendez-vous')],
  ['Home routes to My KŌMØ',home.includes('data-kh7-route="mykomo"')],
  ['Home uses one canonical navigation controller',home.includes('window.KomoPatientNavigation.go(target)')],
  ['Home has no polling or observer',!home.includes('setInterval(')&&!home.includes('MutationObserver')],
  ['Home respects reduced motion',css.includes('@media(prefers-reduced-motion:reduce)')],
  ['Home uses one-screen overflow guard',css.includes('overflow:hidden!important')],
  ['Home has responsive desktop iPad mobile breakpoints',css.includes('@media(max-width:900px)')&&css.includes('@media(max-width:640px)')&&css.includes('@media(max-width:370px)')],
  ['Home is black clinical with green accent',css.includes('--kh7-bg:#050706')&&css.includes('--kh7-green:#7fa58a')&&css.includes('--kh7-green-core:#315b41')]
];
for(const [label,ok] of checks)console.log(`[pulse-home-v7] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-home-v7] PASS · ${checks.length}/${checks.length} Home direction assertions`);
