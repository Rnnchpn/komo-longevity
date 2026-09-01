import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260901-home-motion-today-v6-3-komo-links';

let html=await readFile(htmlPath,'utf8');

// Historical stage kept in the production pipeline as a cleanup + cache guard only.
// Home V6.3 owns one daily Motion Today surface. KEY remains a dedicated route and must not be reparented into Home.
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
  ['Home V6.3 owns Motion Today',home.includes("const VERSION='6.3.0'")&&home.includes('data-khome-v6')&&home.includes('MOTION TODAY')],
  ['Home reads one canonical Motion Today RPC',home.includes("rpc('komo_motion_today_v1')")&&!home.includes("rpc('komo_walk_summary')")&&!home.includes('pulseOverview()')],
  ['Home reads existing engagement summary',home.includes("rpc('komo_engagement_summary')")&&home.includes('xp_total')&&home.includes('level')],
  ['Home reads existing profile avatar',home.includes("from('profiles')")&&home.includes('avatar_config')&&home.includes('kh6-avatar')],
  ['Home profile and experience route to My KOMO',home.includes('kh6-profile')&&home.includes('kh6-xp')&&home.includes('href="#mykomo"')],
  ['Home exposes exactly the three daily signal types',home.includes("metricCard('steps'")&&home.includes("metricCard('sleep'")&&home.includes("metricCard('resting_hr'")],
  ['Home exposes consultation and Club without a second owner',home.includes('Préparez votre consultation')&&home.includes('data-kh6-route="documents"')&&home.includes('Komo Club')&&home.includes('data-kh6-route="club"')],
  ['Home keeps clinical Motion Score off the daily surface',!home.includes('MOTION SCORE')&&!home.includes('MOTION AGE')&&!home.includes('pulse_score_runs')],
  ['Home has no delayed retry ladder or polling',!home.includes('[80,260,800,1800]')&&!home.includes('1700')&&!home.includes('setInterval(')],
  ['Home has no persistent mutation observer',!home.includes('MutationObserver')],
  ['Home respects reduced motion',css.includes('@media(prefers-reduced-motion:reduce)')],
  ['Home uses one-screen overflow guard',css.includes('overflow:hidden')],
  ['Home has responsive desktop iPad mobile breakpoints',css.includes('@media(max-width:900px)')&&css.includes('@media(max-width:640px)')&&css.includes('@media(max-width:370px)')],
  ['Home is black clinical, green accent only',css.includes('--kh6-bg:#050706')&&css.includes('--kh6-green-core:#315b41')&&css.includes('--kh6-green:#7fa58a')],
  ['estimated preview is explicit',home.includes('kh6-estimate')&&home.includes('Estimation')&&home.includes('data-estimated')],
  ['score ring is motion-safe',css.includes('kh6-ring-draw')&&css.includes('prefers-reduced-motion:reduce')]
];
for(const [label,ok] of checks) console.log(`[pulse-home-final-v6] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-home-final-v6] PASS · ${checks.length}/${checks.length} Home release assertions`);
