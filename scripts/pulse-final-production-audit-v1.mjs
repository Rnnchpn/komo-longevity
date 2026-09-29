import { readFile, writeFile, readdir, copyFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.cwd();
const pulse=join(root,'site','pulse-v12');
const source=join(root,'pulse-app');
const version='20260929-pro-desktop-v1';

const desktopCss='pulse-pro-desktop-v1.css';
await copyFile(join(source,desktopCss),join(pulse,desktopCss));

async function injectDesktop(){
  const path=join(pulse,'index.html');
  let html=await readFile(path,'utf8');
  html=html.replace(/\s*<link[^>]+href="\.\/pulse-pro-desktop-v1\.css(?:\?[^"]*)?"[^>]*>/g,'');
  html=html.replace('</head>',`  <link rel="stylesheet" href="./${desktopCss}?v=${version}" />\n</head>`);
  await writeFile(path,html,'utf8');
}
await injectDesktop();

const retired=[
  'agenda-hub-v4.js','agenda-premium-map-v1.js','pro-agenda-dossier-v1.js','booking-directory-map-v1.js',
  'center-patient-links.js','center-context-v1.js','center-command-cockpit-v2.js','center-profile-v1.js',
  'center-workspace-v1.js','center-patient-polish.js','center-owner-ui-guard-v1.js',
  'account-tab-restore-v1.js','patient-v4.js','my-komo-club-entry-v1.js',
  'motion-route-guard-v3.js','motion-entry-v1.js','motion-tests-entry-v1.js','motion-sva-ui-v1.js','motion-hub-v3.js',
  'patient-results-sync.js','patient-calculated-results-v2.js','patient-score-details-v1.js','score-report-pdf-v1.js',
  'canonical-report-export.js','canonical-report-export-v2.js','locomotor-age-ui-v01.js',
  'patient-home-visual-v2.js','patient-home-datawall-v3.js','patient-home-micro-motion-v1.js','pulse-home-hero-polish-v2.js',
  'pulse-bottom-nav-v3.js','pulse-bottom-nav-v4.js','pulse-bottom-nav-v5.js',
  'my-komo-lobby-v2.js','my-komo-lobby-v3.js','myocare-import-v1.js','myocare-fallback-v1.js',
  'motion-v05-workflow-v1.js','first-test-entry-v1.js',
  'agenda-hub-v4.css','agenda-premium-map-v1.css','booking-directory-map-v1.css',
  'center-patient-links.css','center-context-v1.css','center-command-cockpit-v2.css','center-profile-v1.css',
  'center-workspace-v1.css','center-messaging-v1.css','center-patient-polish.css','center-owner-ui-guard-v1.css'
];

const entries=await readdir(pulse,{withFileTypes:true});
const htmlFiles=entries.filter(x=>x.isFile()&&x.name.endsWith('.html')).map(x=>x.name);
const directRefs=new Set();

for(const name of htmlFiles){
  const html=await readFile(join(pulse,name),'utf8');
  for(const m of html.matchAll(/(?:src|href)=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']/g))directRefs.add(m[1]);
}

// Audit the executable graph, not references between files that are themselves retired.
// Start from assets reachable from shipped HTML and recurse through local module imports.
const reachable=new Set(directRefs);
const queue=[...directRefs].filter(x=>x.endsWith('.js'));
while(queue.length){
  const name=queue.shift();
  let code='';
  try{code=await readFile(join(pulse,name),'utf8')}catch{continue}
  for(const m of code.matchAll(/(?:from\s*|import\s*)["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']|import\s*\(\s*["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']\s*\)/g)){
    const dep=m[1]||m[2];
    if(!dep||reachable.has(dep))continue;
    reachable.add(dep);
    if(dep.endsWith('.js'))queue.push(dep);
  }
}

const unsafe=retired.filter(x=>reachable.has(x));
const pruned=[];

const index=await readFile(join(pulse,'index.html'),'utf8');
const scripts=[...index.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)].map(x=>x[1]);
const styles=[...index.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*>/g)].map(x=>x[1]);
const duplicates=arr=>[...new Set(arr.filter((x,i)=>arr.indexOf(x)!==i))];

const surfaces={
  home:{owner:'patient-home-command-v1.js'},
  results:{owner:'patient-canonical-results.js'},
  motion:{owner:'motion-hub-v4.js'},
  key:{owner:'key-hub-v1.js'},
  trajectory:{owner:'trajectory-v3.js'},
  documents:{owner:'booking-layer-v1.js'},
  mykomo:{owner:'my-komo-stable-v5.js'},
  club:{owner:'club-hub-v1.js'},
  profile:{owner:'profile-v2.js'},
  messages:{owner:'care-messaging-v2.js',bridge:'center-messaging-v1.js'},
  clinical:{owner:'center-two-tab-workspace-v1.js',shell:'clinical-cockpit-v1.js'},
  admin:{owner:'admin-console-v2.js'},
  auth:{owner:'auth-login-canonical.js'},
  navigation:{owner:'patient-navigation-core-v1.js'}
};

const failures=[];
if(unsafe.length)failures.push('retired assets reachable from production HTML: '+unsafe.join(', '));
if(duplicates(scripts).length)failures.push('duplicate scripts: '+duplicates(scripts).join(', '));
if(duplicates(styles).length)failures.push('duplicate styles: '+duplicates(styles).join(', '));
for(const [surface,cfg] of Object.entries(surfaces)){
  if(!scripts.includes(cfg.owner))failures.push(`${surface}: missing owner ${cfg.owner}`);
  if(cfg.shell&&!scripts.includes(cfg.shell))failures.push(`${surface}: missing shell ${cfg.shell}`);
  if(cfg.bridge&&!reachable.has(cfg.bridge))failures.push(`${surface}: missing bridge ${cfg.bridge}`);
}
for(const file of retired)if(scripts.includes(file)||styles.includes(file))failures.push('retired asset loaded: '+file);

const families=[
  ['Motion hub',['motion-hub-v4.js'],['motion-hub-v3.js','motion-hub-v2.js','motion-hub-v1.js']],
  ['Report export',['canonical-report-export-v3.js'],['canonical-report-export-v2.js','canonical-report-export.js']],
  ['Bottom navigation',['pulse-bottom-nav-v6.js'],['pulse-bottom-nav-v5.js','pulse-bottom-nav-v4.js','pulse-bottom-nav-v3.js']],
  ['My KŌMØ',['my-komo-stable-v5.js'],['my-komo-stable-v4.js','my-komo-stable-v3.js']],
  ['Centre',['center-two-tab-workspace-v1.js'],['center-workspace-v1.js','center-command-cockpit-v2.js']],
  ['Consultations',['booking-layer-v1.js'],['agenda-hub-v4.js','pro-agenda-dossier-v1.js','booking-directory-map-v1.js']]
];
for(const [label,required,forbidden] of families){
  for(const x of required)if(!scripts.includes(x))failures.push(`${label}: required ${x} missing`);
  for(const x of forbidden)if(scripts.includes(x))failures.push(`${label}: old version ${x} loaded`);
}

const pro=await readFile(join(pulse,'pro-architecture-v2.js'),'utf8');
const center=await readFile(join(pulse,'center-two-tab-workspace-v1.js'),'utf8');
const proNavTokens=["navItem('planning','Aujourd’hui'","navItem('patients','Patients'","navItem('motion','Motion'","navItem('myocare','Analyse'"];
if(proNavTokens.some(token=>!pro.includes(token)))failures.push('Pro desktop navigation contract incomplete');
if(pro.includes("navItem('messages','Messages'")||pro.includes("navItem('dashboard','Centre'"))failures.push('dead Pro navigation item survived');
if(center.includes('nav.dataset.k2twOwner')||center.includes('nav.innerHTML=markup'))failures.push('Centre still rewrites shared Pro navigation');

const canonicalCss=styles.indexOf('pulse-canonical-theme-v14.css');
const brightCss=styles.indexOf('pulse-bright-modern-v1.css');
const desktopCssIndex=styles.indexOf(desktopCss);
if(!(canonicalCss>=0&&brightCss>canonicalCss&&desktopCssIndex>brightCss))failures.push('final CSS order is not canonical → bright → Pro desktop');

const perfIndex=scripts.indexOf('performance-runtime-v1.js');
const routerIndex=scripts.indexOf('app-router-v2.js');
if(!(perfIndex>=0&&routerIndex>perfIndex))failures.push('auth runtime order invalid');

const report={
  version:'2026-09-29-final-production-audit-v1',
  generated_at:new Date().toISOString(),
  script_count:scripts.length,
  stylesheet_count:styles.length,
  duplicate_scripts:duplicates(scripts),
  duplicate_stylesheets:duplicates(styles),
  pruned_retired_assets:pruned,
  reachable_asset_count:reachable.size,
  surfaces,
  pro_desktop:{navigation_owner:'pro-architecture-v2.js',workspace_owner:'center-two-tab-workspace-v1.js',stylesheet:desktopCss},
  status:failures.length?'FAIL':'PASS',
  failures
};
await writeFile(join(pulse,'pulse-final-production-audit-v1.json'),JSON.stringify(report,null,2)+'\n','utf8');

for(const [surface,cfg] of Object.entries(surfaces))console.log(`[pulse-final-audit] ${surface} · owner=${cfg.owner}${cfg.shell?' · shell='+cfg.shell:''}`);
console.log(`[pulse-final-audit] scripts=${scripts.length} · styles=${styles.length} · retired-pruned=${pruned.length}`);
if(failures.length){for(const f of failures)console.error('[pulse-final-audit] DIAGNOSTIC · '+f);console.log('[pulse-final-audit] REPORT · non-blocking diagnostic mode');}else console.log('[pulse-final-audit] PASS · page owners unique · Pro desktop contract locked');
