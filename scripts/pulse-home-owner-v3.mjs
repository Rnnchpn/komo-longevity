import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const commandPath=join(pulse,'patient-home-command-v1.js');
const release='20260830-home-owner-v4';
const guard='patient-home-owner-guard-v1.js';
const topbarJs='pulse-topbar-roles-v1.js';
const topbarCss='pulse-topbar-roles-v1.css';

for(const file of [guard,topbarJs,topbarCss])await copyFile(join(root,'pulse-app',file),join(pulse,file));
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
  topbarJs,
  'patient-home-command-v1.js'
];
const legacyHomeStyles=[
  'my-komo-dashboard-v2.css',
  'my-komo-key-home-v1.css',
  'home-key-position-v1.css',
  topbarCss
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

// The Home is an orientation surface, not a second analytics product.
// Remove duplicate lower-page summaries that already have dedicated routes.
let command=await readFile(commandPath,'utf8');
const retiredBlocks=[
  ['weekly KEY duplicate',/<article class="kdw-card khc-card khc-week">[\s\S]*?<\/article>\s*/],
  ['Clinical duplicate',/<article class="kdw-card khc-card khc-clinical">[\s\S]*?<\/article>\s*/],
  ['Report duplicate',/<article class="kdw-card khc-card khc-report">[\s\S]*?<\/article>\s*/],
  ['quick-links duplicate',/<nav class="kdw-card khc-card khc-quick"[\s\S]*?<\/nav>\s*/],
  ['Life XP duplicate',/<article class="kdw-card khc-card khc-life">[\s\S]*?<\/article>\s*/]
];
for(const [label,re] of retiredBlocks){
  if(!re.test(command))throw new Error(`[pulse-home-owner-v3] ${label} block not found`);
  command=command.replace(re,'');
}
command=command.replace("const VERSION='1.0.0';","const VERSION='1.1.0';");
await writeFile(commandPath,command,'utf8');

html=html.replace(/patient-home-command-v1\.css\?v=[^\"]+/g,`patient-home-command-v1.css?v=${release}`);
html=html.replace(/patient-home-hero-v2\.css\?v=[^\"]+/g,`patient-home-hero-v2.css?v=${release}`);
html=html.replace(/my-komo-home-v1\.js\?v=[^\"]+/g,`my-komo-home-v1.js?v=${release}`);

html=html.replace(/\s*<meta name="komo-pulse-home-owner"[^>]*>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./${topbarCss}?v=${release}" />\n  <meta name="komo-pulse-home-owner" content="patient-home-command-v1@${release}" />\n</head>`);

const finalScripts=`  <script type="module" src="./patient-home-command-v1.js?v=${release}"></script>\n  <script src="./${guard}?v=${release}"></script>\n  <script src="./${topbarJs}?v=${release}"></script>\n`;
html=html.replace('</body>',`${finalScripts}</body>`);
await writeFile(htmlPath,html,'utf8');

const final=await readFile(htmlPath,'utf8');
const finalCommand=await readFile(commandPath,'utf8');
const failures=[];
for(const file of legacyHomeScripts.filter(x=>![guard,topbarJs,'patient-home-command-v1.js'].includes(x))){
  if(final.includes(file))failures.push(`legacy runtime still loaded: ${file}`);
}
for(const file of legacyHomeStyles.filter(x=>x!==topbarCss)){if(final.includes(file))failures.push(`legacy stylesheet still loaded: ${file}`)}
const commandCount=(final.match(/patient-home-command-v1\.js/g)||[]).length;
const guardCount=(final.match(/patient-home-owner-guard-v1\.js/g)||[]).length;
const topbarCount=(final.match(/pulse-topbar-roles-v1\.js/g)||[]).length;
if(commandCount!==1)failures.push(`expected 1 command owner, found ${commandCount}`);
if(guardCount!==1)failures.push(`expected 1 owner guard, found ${guardCount}`);
if(topbarCount!==1)failures.push(`expected 1 topbar enhancer, found ${topbarCount}`);
if(!final.includes(`patient-home-command-v1.css?v=${release}`))failures.push('command CSS is not cache-busted');
if(!final.includes(`patient-home-hero-v2.css?v=${release}`))failures.push('hero CSS is not cache-busted');
if(!final.includes(`${topbarCss}?v=${release}`))failures.push('topbar CSS missing');
if(final.indexOf('patient-home-owner-guard-v1.js')<final.indexOf('patient-home-command-v1.js'))failures.push('owner guard must load after final command');
if(final.indexOf(topbarJs)<final.indexOf('patient-home-owner-guard-v1.js'))failures.push('topbar enhancer must load last');
if(!final.includes('my-komo-home-v1.js'))failures.push('My KŌMØ baseline/data source missing');
for(const token of ['khc-week','khc-clinical','khc-report','khc-quick','khc-life']){
  if(finalCommand.includes(`<article class=\"kdw-card khc-card ${token}`)||finalCommand.includes(`<nav class=\"kdw-card khc-card ${token}`))failures.push(`retired Home block still rendered: ${token}`);
}
for(const token of ['khc-motion','khc-age','khc-key','khc-next','khc-trajectory'])if(!finalCommand.includes(token))failures.push(`essential Home block missing: ${token}`);

if(failures.length){
  failures.forEach(x=>console.error(`[pulse-home-owner-v3] FAIL · ${x}`));
  process.exit(1);
}
console.log('[pulse-home-owner-v3] PASS · single Home owner · 5 essential surfaces only · Patient/Pro/Admin topbar · fallback retained');
