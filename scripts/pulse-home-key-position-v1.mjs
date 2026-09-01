import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260901-home-motion-today-v51';

let html=await readFile(htmlPath,'utf8');

// Historical stage kept in the production pipeline as a cleanup guard only.
// Home V5.1 consumes KEY daily signals in its canonical DOM order; no viewport-specific reparenting is allowed.
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
  ['Home consumes KEY as three native daily signals',home.includes("dailySignal('steps','STEPS'")&&home.includes("dailySignal('sleep','SLEEP'")&&home.includes("dailySignal('rhr','RESTING HR'")&&home.includes("from('wearable_daily_metrics')")],
  ['Home compares daily signals with personal baselines',home.includes('baselineFor(')&&home.includes('stepsBase')&&home.includes('sleepBase')&&home.includes('rhrBase')],
  ['Home has no delayed retry ladder',!home.includes('[80,260,800,1800]')&&!home.includes('1700')],
  ['Home animation respects reduced motion',css.includes('@media(prefers-reduced-motion:reduce)')],
  ['Home score animation is finite',home.includes('duration=620')&&!css.includes('infinite')]
];
for(const [label,ok] of checks) console.log(`[pulse-home-final-v5] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-home-final-v5] PASS · ${checks.length}/${checks.length} Home release assertions`);