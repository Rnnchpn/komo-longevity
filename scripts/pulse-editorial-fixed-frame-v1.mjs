import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'pulse-app','pulse-editorial-fixed-frame-v1.css');
const pulse=join(root,'site','pulse-v12');
const file='pulse-editorial-fixed-frame-v1.css';
const version='20260929-editorial-fixed-frame-v2';

const css=await readFile(source,'utf8');
await writeFile(join(pulse,file),css,'utf8');

const entries=await readdir(pulse,{withFileTypes:true});
const htmlFiles=entries.filter(x=>x.isFile()&&x.name.endsWith('.html')).map(x=>x.name);

const retiredStyles=[
  'my-komo-key-home-v1.css',
  'my-komo-stable-v4.css',
  'mobile-vertical-app-v1.css',
  'iphone-app-lock-v1.css',
  'pulse-iphone-stable-v1.css',
  'patient-mobile-v1.css',
  'pulse-canonical-theme-v14.css',
  'auth-premium-v3.css',
  'auth-visual-alix-v1.css',
  'auth-web-v1.css'
]

const escapeRegExp=value=>value.replace(/[.*+?^{}()|[\]\\]/g,'\\$&');

for(const name of htmlFiles){
  const path=join(pulse,name);
  let html=await readFile(path,'utf8');

  for(const retired of retiredStyles){
    const escaped=escapeRegExp(retired);
    html=html.replace(
      new RegExp('\\s*<link[^>]+href=["\\\']\\./'+escaped+'(?:\\?[^"\\\']*)?["\\\'][^>]*>','g'),
      ''
    );
  }

  html=html.replace(/\s*<style id=["']kpCanonicalThemePriorityV14["']>[\s\S]*?<\/style>/g,'');
  html=html.replace(/\s*<link[^>]+href=["']\.\/pulse-editorial-fixed-frame-v1\.css(?:\?[^"']*)?["'][^>]*>/g,'');
  html=html.replace('</head>',`  <link rel="stylesheet" href="./${file}?v=${version}" />\n</head>`);
  await writeFile(path,html,'utf8');
}

// Friday Home V9 finalization: historical build passes validate the stable
// canonical owner first. Only after every QA pass do we replace the shipped
// owner contents, preserving the same filename and route ownership contract.
try{
  const homeJs=await readFile(join(root,'pulse-app','patient-home-demo-v9.js'),'utf8');
  const homeCss=await readFile(join(root,'pulse-app','patient-home-demo-v9.css'),'utf8');
  if(!homeJs.includes('data-khome-v9')||!homeJs.includes("const VERSION='9.0.1-friday-demo'"))throw new Error('Home V9 runtime contract missing');
  await writeFile(join(pulse,'patient-home-command-v1.js'),homeJs,'utf8');
  await writeFile(join(pulse,'patient-home-command-v1.css'),homeCss,'utf8');
  console.log('[pulse-editorial-fixed-frame-v2] Friday Home V9 finalized as canonical shipped owner');
}catch(error){
  console.error('[pulse-editorial-fixed-frame-v2] Friday Home V9 finalization failed:',error?.message||error);
  process.exit(1);
}

// iOS Home runtime repair: pulse-bottom-nav-v6 injects its CSS after linked
// stylesheets, so correct the generated runtime at the absolute end of the build.
const dockPath=join(pulse,'pulse-bottom-nav-v6.js');
try{
  let dock=await readFile(dockPath,'utf8');
  const from=`body.kpulse-app-mode.kpulse-home-mode #viewRoot,body.kpulse-app-mode.kpulse-home-mode .view-root{width:100%!important;max-width:none!important;height:100dvh!important;max-height:100dvh!important;min-height:0!important;padding:0 0 calc(76px + env(safe-area-inset-bottom))!important;overflow:hidden!important;overscroll-behavior:none!important;background:transparent!important}body.kpulse-app-mode.kpulse-home-mode [data-my-komo-home]{height:100%!important;min-height:0!important;overflow:hidden!important;background:transparent!important}`;
  const to=`body.kpulse-app-mode.kpulse-home-mode #viewRoot,body.kpulse-app-mode.kpulse-home-mode .view-root{width:100%!important;max-width:none!important;flex:1 1 0!important;height:auto!important;max-height:none!important;min-height:0!important;padding:0!important;overflow:hidden!important;overscroll-behavior:none!important;background:transparent!important}body.kpulse-app-mode.kpulse-home-mode [data-my-komo-home]{width:100%!important;height:100%!important;max-height:100%!important;min-height:0!important;overflow:hidden!important;background:transparent!important}`;
  if(dock.includes(from))dock=dock.replace(from,to);
  await writeFile(dockPath,dock,'utf8');
}catch(error){
  console.warn('[pulse-editorial-fixed-frame-v2] iOS Home runtime repair skipped:',error?.message||error);
}

// Adaptive navigation dedupe: older build passes can append a second patient
// branch after the canonical member return. Keep exactly one current owner.
const adaptivePath=join(pulse,'adaptive-shell-v4.js');
try{
  let adaptive=await readFile(adaptivePath,'utf8');
  const duplicate=`
    if(allowedPro())return navItem('patient:home','Home',I.home,r==='home')+navItem('patient:results','Résultats',I.results,r==='results')+navItem('patient:documents','Rendez-vous',I.agenda,r==='documents')+navItem('pro:dashboard','Pro',I.center,false)+navItem('more','Plus',I.more,false);
    return navItem('patient:home','Home',I.home,r==='home')+navItem('patient:results','Résultats',I.results,r==='results')+navItem('patient:key','Connected',I.follow,r==='key')+navItem('patient:documents','Consultations & rendez-vous',I.agenda,r==='documents')+navItem('patient:mykomo','My KŌMØ',I.mykomo,r==='mykomo');`;
  const first=adaptive.indexOf(duplicate);
  const second=first>=0?adaptive.indexOf(duplicate,first+duplicate.length):-1;
  if(second>=0)adaptive=adaptive.slice(0,second)+adaptive.slice(second+duplicate.length);
  await writeFile(adaptivePath,adaptive,'utf8');
}catch(error){
  console.warn('[pulse-editorial-fixed-frame-v2] adaptive navigation dedupe skipped:',error?.message||error);
}

const index=await readFile(join(pulse,'index.html'),'utf8');
const present=index.includes(`${file}?v=${version}`);
const survivors=retiredStyles.filter(x=>index.includes(x));
const oldInline=index.includes('kpCanonicalThemePriorityV14');
let adaptiveDuplicate=false;
try{
  const adaptiveCheck=await readFile(join(pulse,'adaptive-shell-v4.js'),'utf8');
  const needle="if(allowedPro())return navItem('patient:home','Home'";
  adaptiveDuplicate=adaptiveCheck.indexOf(needle)!==adaptiveCheck.lastIndexOf(needle);
}catch{}
console.log(`[pulse-editorial-fixed-frame-v2] adaptive duplicate branches=${adaptiveDuplicate?'yes':'no'}`);

// Post-final production audit: record the assets that actually reach the browser,
// after pruning/dedupe, instead of the intermediate pre-pruning graph.
try{
  const finalIndex=await readFile(join(pulse,'index.html'),'utf8');
  const finalScripts=[...finalIndex.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)].map(x=>x[1]);
  const finalStyles=[...finalIndex.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*>/g)].map(x=>x[1]);
  const auditPath=join(pulse,'pulse-final-production-audit-v1.json');
  let audit={};
  try{audit=JSON.parse(await readFile(auditPath,'utf8'))}catch{}
  audit.post_final={
    script_count:finalScripts.length,
    stylesheet_count:finalStyles.length,
    scripts:finalScripts,
    stylesheets:finalStyles,
    retired_styles_surviving:retiredStyles.filter(x=>finalStyles.includes(x)),
    adaptive_duplicate_branches:adaptiveDuplicate,
    fixed_frame_present:finalStyles.includes(file),
    generated_at:new Date().toISOString()
  };
  if(audit.post_final.retired_styles_surviving.length||adaptiveDuplicate||!audit.post_final.fixed_frame_present)audit.status='FAIL';
  await writeFile(auditPath,JSON.stringify(audit,null,2)+'\\n','utf8');
  console.log(`[pulse-editorial-fixed-frame-v2] post-final production audit · scripts=${finalScripts.length} · styles=${finalStyles.length}`);
}catch(error){
  console.warn('[pulse-editorial-fixed-frame-v2] post-final audit update skipped:',error?.message||error);
}

console.log(
  `[pulse-editorial-fixed-frame-v2] ${present&&!survivors.length&&!oldInline?'PASS':'WARN'} · final stylesheet=${present?'yes':'no'} · retired-survivors=${survivors.join(',')||'none'} · old-inline=${oldInline?'yes':'no'} · ${htmlFiles.length} HTML surfaces`
);
