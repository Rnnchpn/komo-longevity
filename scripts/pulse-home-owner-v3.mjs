import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260830-home-owner-v3';
const guard='patient-home-owner-guard-v1.js';

await copyFile(join(root,'pulse-app',guard),join(pulse,guard));
let html=await readFile(htmlPath,'utf8');

const legacyHomeScripts=[
  'patient-home-datawall-v3.js',
  'patient-home-visual-v2.js',
  'patient-home-micro-motion-v1.js',
  'pulse-home-hero-polish-v2.js',
  'my-komo-dashboard-v2.js',
  'my-komo-key-home-v1.js',
  'home-key-position-v1.js',
  'my-komo-score-motion-v1.js',
  'patient-home-final-v1.js',
  'patient-home-stability-v1.js',
  guard,
  'patient-home-command-v1.js'
];
const legacyHomeStyles=[
  'my-komo-dashboard-v2.css',
  'my-komo-key-home-v1.css',
  'home-key-position-v1.css'
];

const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
for(const file of legacyHomeScripts){
  const re=new RegExp(`\\s*<script(?:\\s+type="module")?(?:\\s+defer)?\\s+src="\\./${esc(file)}(?:\\?v=[^\"]*)?"[^>]*><\\/script>`,'g');
  html=html.replace(re,'');
}
for(const file of legacyHomeStyles){
  const re=new RegExp(`\\s*<link\\s+rel="stylesheet"\\s+href="\\./${esc(file)}(?:\\?v=[^\"]*)?"\\s*\\/?>`,'g');
  html=html.replace(re,'');
}

html=html.replace(/patient-home-command-v1\.css\?v=[^\"]+/g,`patient-home-command-v1.css?v=${release}`);
html=html.replace(/patient-home-hero-v2\.css\?v=[^\"]+/g,`patient-home-hero-v2.css?v=${release}`);
html=html.replace(/my-komo-home-v1\.js\?v=[^\"]+/g,`my-komo-home-v1.js?v=${release}`);

html=html.replace(/\s*<meta name="komo-pulse-home-owner"[^>]*>/g,'');
html=html.replace('</head>',`  <meta name="komo-pulse-home-owner" content="patient-home-command-v1@${release}" />\n</head>`);

const finalScripts=`  <script type="module" src="./patient-home-command-v1.js?v=${release}"></script>\n  <script src="./${guard}?v=${release}"></script>\n`;
html=html.replace('</body>',`${finalScripts}</body>`);
await writeFile(htmlPath,html,'utf8');

const final=await readFile(htmlPath,'utf8');
const failures=[];
for(const file of legacyHomeScripts.filter(x=>![guard,'patient-home-command-v1.js'].includes(x))){
  if(final.includes(file))failures.push(`legacy runtime still loaded: ${file}`);
}
for(const file of legacyHomeStyles){if(final.includes(file))failures.push(`legacy stylesheet still loaded: ${file}`)}
const commandCount=(final.match(/patient-home-command-v1\.js/g)||[]).length;
const guardCount=(final.match(/patient-home-owner-guard-v1\.js/g)||[]).length;
if(commandCount!==1)failures.push(`expected 1 command owner, found ${commandCount}`);
if(guardCount!==1)failures.push(`expected 1 owner guard, found ${guardCount}`);
if(!final.includes(`patient-home-command-v1.css?v=${release}`))failures.push('command CSS is not cache-busted');
if(!final.includes(`patient-home-hero-v2.css?v=${release}`))failures.push('hero CSS is not cache-busted');
if(final.indexOf('patient-home-owner-guard-v1.js')<final.indexOf('patient-home-command-v1.js'))failures.push('owner guard must load after final command');
if(!final.includes('my-komo-home-v1.js'))failures.push('My KŌMØ baseline/data source missing');

if(failures.length){
  failures.forEach(x=>console.error(`[pulse-home-owner-v3] FAIL · ${x}`));
  process.exit(1);
}
console.log('[pulse-home-owner-v3] PASS · one final Home owner · baseline fallback retained · legacy Home observers/pollers removed');
