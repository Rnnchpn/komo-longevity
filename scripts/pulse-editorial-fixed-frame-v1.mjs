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

for(const name of htmlFiles){
  const path=join(pulse,name);
  let html=await readFile(path,'utf8');
  html=html.replace(/\s*<link[^>]+href=["']\.\/pulse-editorial-fixed-frame-v1\.css(?:\?[^"']*)?["'][^>]*>/g,'');
  html=html.replace('</head>',`  <link rel="stylesheet" href="./${file}?v=${version}" />\n</head>`);
  await writeFile(path,html,'utf8');
}

const index=await readFile(join(pulse,'index.html'),'utf8');
const checks=[
  ['final editorial layer present',index.includes(`${file}?v=${version}`)],
  ['final layer loads after Bright Modern',index.lastIndexOf(file)>index.lastIndexOf('pulse-bright-modern-v1.css')],
  ['final layer loads after Pro desktop',index.lastIndexOf(file)>index.lastIndexOf('pulse-pro-desktop-v1.css')],
  ['document scroll locked',css.includes('overflow:hidden!important')&&css.includes('#viewRoot>*')),
  ['adaptive shell locked',css.includes('html[data-adaptive-shell] .main-shell')&&css.includes('height:100dvh!important')],
  ['auth fixed viewport',css.includes('#authScreen.auth-screen')&&css.includes('max-height:100dvh!important')],
  ['legacy route wrappers normalized',css.includes('.kcp,.kav2,.k2tw,.kcv2,.kr2,.km4,.kc4,.ag4,.mkv4,.kpv')]
];
for(const [label,ok] of checks)console.log(`[pulse-editorial-fixed-frame-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-editorial-fixed-frame-v1] PASS · fixed app frame + unified final visual owner · ${htmlFiles.length} HTML surfaces`);
