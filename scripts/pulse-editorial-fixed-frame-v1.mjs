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

const index=await readFile(join(pulse,'index.html'),'utf8');
const present=index.includes(`${file}?v=${version}`);
const survivors=retiredStyles.filter(x=>index.includes(x));
const oldInline=index.includes('kpCanonicalThemePriorityV14');

console.log(
  `[pulse-editorial-fixed-frame-v2] ${present&&!survivors.length&&!oldInline?'PASS':'WARN'} · final stylesheet=${present?'yes':'no'} · retired-survivors=${survivors.join(',')||'none'} · old-inline=${oldInline?'yes':'no'} · ${htmlFiles.length} HTML surfaces`
);
