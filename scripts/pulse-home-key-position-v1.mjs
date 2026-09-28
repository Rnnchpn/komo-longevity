import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');

// Compatibility guard only. This historical KEY-position layer must never retag,
// rewrite or own Home. It only removes its retired assets and confirms that the
// current canonical patient-home-command-v1 source is the approved V8 cockpit.
let html=await readFile(htmlPath,'utf8');
html=html
  .replace(/\s*<link rel="stylesheet" href="\.\/home-key-position-v1\.css(?:\?[^\"]*)?"\s*\/?>/g,'')
  .replace(/\s*<script src="\.\/home-key-position-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
await writeFile(htmlPath,html,'utf8');

const final=await readFile(htmlPath,'utf8');
const home=await readFile(join(root,'pulse-app','patient-home-command-v1.js'),'utf8');
const css=await readFile(join(root,'pulse-app','patient-home-command-v1.css'),'utf8');
const checks=[
  ['legacy KEY reparent runtime absent',!final.includes('home-key-position-v1.js')],
  ['legacy KEY position stylesheet absent',!final.includes('home-key-position-v1.css')],
  ['Home commercial V8 source present',home.includes("const VERSION='8.1.0-commercial'")&&home.includes('data-khome-v8')&&home.includes("host.dataset.khomeOwner='patient-home-command-v1@8'")],
  ['Home V8 uses released scores only',home.includes("from('scores')")&&home.includes("eq('release_status','released')")],
  ['Home V8 uses real Connected daily metrics',home.includes("from('wearable_daily_metrics')")&&home.includes('sleep_minutes')&&home.includes('resting_hr')],
  ['Home V8 uses persisted future consultations',home.includes("from('organization_appointments')")&&home.includes("gte('scheduled_start'")],
  ['Home identity stays lean',home.includes("rpc('komo_my_community_identity_v1')")&&!home.includes("rpc('komo_engagement_summary')")&&!home.includes("rpc('komo_wallet_summary')")],
  ['Home V8 routes to Results',home.includes('data-kh8-route="results"')],
  ['Home V8 routes to Connected',home.includes('data-kh8-route="key"')],
  ['Home V8 routes to Consultations',home.includes('data-kh8-route="documents"')],
  ['Home V8 routes to My KŌMØ',home.includes('data-kh8-route="mykomo"')],
  ['Home exposes World directly',home.includes('https://komolongevity.com/world/')&&home.includes('Entrer dans KŌMØ World')],
  ['Home exposes commercial consultation CTA',home.includes('Débuter votre consultation')&&home.includes('data-kh8-route="documents"')],
  ['Home uses one canonical navigation controller',home.includes('window.KomoPatientNavigation.go(target)')],
  ['Home has no polling or observer',!home.includes('setInterval(')&&!home.includes('MutationObserver')],
  ['Home supports reduced motion',css.includes('@media(prefers-reduced-motion:reduce)')],
  ['Home prevents horizontal drift',css.includes('overflow-x:hidden!important')],
  ['Home has desktop iPad mobile breakpoints',css.includes('@media(max-width:1080px)')&&css.includes('@media(max-width:820px)')&&css.includes('@media(max-width:620px)')&&css.includes('@media(max-width:380px)')],
  ['Home uses premium light canvas with green accent',css.includes('KŌMØ Pulse — Home V8.1 commercial light canvas')&&css.includes('--kh8-bg:#f6f7f3')&&css.includes('--kh8-green:#52705b')]
];
for(const [label,ok] of checks)console.log(`[pulse-home-compat-v8] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-home-compat-v8] PASS · ${checks.length}/${checks.length} compatibility assertions; canonical Home owner preserved · commercial light contract`);
