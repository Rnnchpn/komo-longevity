import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const RELEASE='20260905-my-world-v1';
const read=name=>readFile(join(pulse,name),'utf8');
const write=(name,src)=>writeFile(join(pulse,name),src,'utf8');

let html=await read('index.html');
html=html
  .replace(/\s*<script[^>]+src=["']\.\/my-komo-stable-v5\.js(?:\?[^"']*)?["'][^>]*><\/script>/g,'')
  .replace(/\s*<script[^>]+src=["']\.\/my-komo-lobby-v3\.js(?:\?[^"']*)?["'][^>]*><\/script>/g,'')
  .replace(/\s*<script[^>]+src=["']\.\/my-world-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/g,'');
html=html.replace('</body>',`  <script src="./my-world-v1.js?v=${RELEASE}"></script>\n</body>`);
await write('index.html',html);

let nav=await read('pulse-bottom-nav-v6.js');
nav=nav
  .replace(/(\[\s*['"]mykomo['"]\s*,\s*['"])[^'"]*(['"])/g,'$1My World$2')
  .replaceAll('My KŌMŌ','My World')
  .replaceAll('MY KŌMŌ','MY WORLD')
  .replaceAll('Mon KŌMŌ','My World');
await write('pulse-bottom-nav-v6.js',nav);

let home=await read('patient-home-command-v1.js');
home=home
  .replaceAll('Ouvrir My KŌMŌ','Ouvrir My World')
  .replaceAll('MY KŌMŌ','MY WORLD')
  .replaceAll('My KŌMŌ','My World')
  .replaceAll('Votre profil, Club et communauté','Votre univers personnel KŌMŌ')
  .replaceAll('Profil social · réglages · Club','Monde personnel · avatar · Club')
  .replace(/(<a[^>]+data-kh8-route=["']mykomo["'][\s\S]*?<h3>)[^<]*(<\/h3>)/,'$1My World$2')
  .replace(/(<article[^>]+data-kh8-route=["']mykomo["'][\s\S]*?<small>)[^<]*(<\/small>)/,'$1MY WORLD$2');
await write('patient-home-command-v1.js',home);

const manifestPath=join(root,'scripts','pulse-runtime-architecture-v37.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
manifest.version='2026-09-05-my-world-v1';
manifest.surfaces.mykomo={owner:'my-world-v1.js',controllers:[],extensions:[]};
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n','utf8');

const finalHtml=await read('index.html');
const finalNav=await read('pulse-bottom-nav-v6.js');
const finalHome=await read('patient-home-command-v1.js');
const checks=[
  ['My World owner injected',finalHtml.includes(`my-world-v1.js?v=${RELEASE}`)],
  ['legacy My KŌMŌ owner removed',!finalHtml.includes('my-komo-stable-v5.js')&&!finalHtml.includes('my-komo-lobby-v3.js')],
  ['dock route survives',/\[\s*['"]mykomo['"]/.test(finalNav)],
  ['Home still routes to My World',finalHome.includes('data-kh8-route="mykomo"')||finalHome.includes("data-kh8-route='mykomo'")],
  ['architecture owner is My World',manifest.surfaces.mykomo?.owner==='my-world-v1.js']
];
for(const [label,ok] of checks)console.log(`[pulse-my-world-v1] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log(`[pulse-my-world-v1] PASS · ${checks.length}/${checks.length} · My World is canonical personal lobby`);
