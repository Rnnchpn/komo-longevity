import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'pulse-app','pulse-editorial-fixed-frame-v1.css');
const pulse=join(root,'site','pulse-v12');
const file='pulse-editorial-fixed-frame-v1.css';
const version='20260929-editorial-fixed-frame-v1';

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
  'pulse-canonical-theme-v14.css'
];

for(const name of htmlFiles){
  const path=join(pulse,name);
  let html=await readFile(path,'utf8');
  for(const retired of retiredStyles){
    const escaped=retired.replace(/[.*+?^$()|[\]{}\\]/g,'\\for(const name of htmlFiles){
  const path=join(pulse,name);
  let html=await readFile(path,'utf8');');
    html=html.replace(new RegExp('\\\\s*<link[^>]+href=["\\\']\\\\./'+escaped+'(?:\\\\?[^"\\\']*)?["\\\'][^>]*>','g'),'');
  }
  html=html.replace(/\\s*<style id=["']kpCanonicalThemePriorityV14["']>[\\s\\S]*?<\\/style>/g,'');
  html=html.replace(/\s*<link[^>]+href=["']\.\/pulse-editorial-fixed-frame-v1\.css(?:\?[^"']*)?["'][^>]*>/g,'');
  html=html.replace('</head>',`  <link rel="stylesheet" href="./${file}?v=${version}" />\n</head>`);
  await writeFile(path,html,'utf8');
}

const index=await readFile(join(pulse,'index.html'),'utf8');
const present=index.includes(`${file}?v=${version}`);
const survivors=retiredStyles.filter(x=>index.includes(x));
const oldInline=index.includes('kpCanonicalThemePriorityV14');
console.log(`[pulse-editorial-fixed-frame-v1] ${present&&!survivors.length&&!oldInline?'PASS':'WARN'} · final stylesheet=${present?'yes':'no'} · retired-survivors=${survivors.join(',')||'none'} · old-inline=${oldInline?'yes':'no'} · ${htmlFiles.length} HTML surfaces`);
