import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-key-results-v2';
const appleRelease='20260831-key-apple-health-v2';
for(const file of ['key-results-v2.css','key-results-v2.js','key-apple-health-import-v1.js']) await copyFile(join(root,'pulse-app',file),join(pulse,file));

// Apple Health stays outside the initial Pulse runtime: it is loaded only after an explicit user action.
const applePath=join(pulse,'key-apple-health-import-v1.js');
let appleBuild=await readFile(applePath,'utf8');
appleBuild=appleBuild.replace("window.KomoPatientNavigation?.go?.('key')||(location.hash='key');","window.KomoPatientNavigation?.go?.('key');");
appleBuild=appleBuild.replace('if(l)l.hidden=!shell||shell.hidden','if(l)l.hidden=true');
await writeFile(applePath,appleBuild,'utf8');

// Put the import action inside the existing KŌMØ operator instead of shipping a second persistent agent.
const operatorPath=join(pulse,'komo-operator-v1.js');
let operator=await readFile(operatorPath,'utf8');
if(!operator.includes('data-kop-key-import')){
  const helper=`\nlet komoKeyAppleHealthPromise=null;\nfunction keyImportSection(){\n  const panel=document.querySelector('#komoOperatorPanel');\n  if(!panel||!/COPILOTE MOTION/.test(panel.textContent||'')||panel.querySelector('[data-kop-key-import]'))return;\n  const section=document.createElement('section');section.className='kop-section';section.dataset.kopKeyImport='1';\n  section.innerHTML='<div class="kop-section-head"><p>KŌMØ KEY</p><span>Apple Health</span></div><div class="kop-context"><strong>Actualiser mes données KEY</strong><p>Importez le ZIP exporté depuis Apple Santé. Le fichier brut reste sur cet appareil ; seules les métriques confirmées sont ajoutées à KEY.</p><div class="kop-actions"><button class="kop-action primary" type="button" data-kop-key-import>Importer Apple Health →</button></div></div>';\n  const caps=[...panel.querySelectorAll('.kop-section')].find(x=>/Capacités V1/.test(x.textContent||''));\n  if(caps)caps.insertAdjacentElement('beforebegin',section);else panel.querySelector('.kop-body')?.appendChild(section);\n  section.querySelector('[data-kop-key-import]')?.addEventListener('click',openKeyAppleHealth);\n}\nfunction openKeyAppleHealth(){\n  const launch=()=>{close();window.KomoKeyAppleHealthImportV2?.open?.()};\n  if(window.KomoKeyAppleHealthImportV2)return launch();\n  if(!komoKeyAppleHealthPromise)komoKeyAppleHealthPromise=new Promise((resolve,reject)=>{\n    const script=document.createElement('script');script.src='./key-apple-health-import-v1.js?v=${appleRelease}';script.dataset.komoKeyAppleHealth='1';script.onload=resolve;script.onerror=()=>reject(new Error('apple_health_import_unavailable'));document.body.appendChild(script);\n  });\n  komoKeyAppleHealthPromise.then(launch).catch(()=>{const d=document.querySelector('#kopDetail');if(d){d.innerHTML='<div class="kop-detail-body"><div class="kop-empty">L’import Apple Health est momentanément indisponible.</div></div>';d.classList.add('is-open')}});\n}\n`;
  operator=operator.replace('function bind(){',`${helper}\nfunction bind(){\n  keyImportSection();`);
  if(!operator.includes('data-kop-key-import'))throw new Error('[pulse-key-results-v2] unable to patch KŌMØ operator with KEY import action');
  await writeFile(operatorPath,operator,'utf8');
}

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/key-results-v2\.css(?:\?[^\"]*)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/key-results-v2\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script src="\.\/key-apple-health-import-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./key-results-v2.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./key-results-v2.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const css=await readFile(join(pulse,'key-results-v2.css'),'utf8');
const js=await readFile(join(pulse,'key-results-v2.js'),'utf8');
const apple=await readFile(applePath,'utf8');
const operatorFinal=await readFile(operatorPath,'utf8');
const final=await readFile(htmlPath,'utf8');
const checks=[
 ['v2 CSS is final visual layer',final.includes(`key-results-v2.css?v=${release}`)],
 ['v2 runtime is final KEY layer',final.includes(`key-results-v2.js?v=${release}`)],
 ['KEY result menu has four views',js.includes("['overview','Aperçu']")&&js.includes("['data','Données']")],
 ['Today session uses real wear minutes',js.includes('wear_minutes')&&js.includes('SESSION PARTIELLE')],
 ['numbers animate with requestAnimationFrame',js.includes('requestAnimationFrame')&&css.includes('kh2DigitIn')],
 ['CSV and JSON test import enabled',js.includes('komo_key_file_import')&&js.includes('kh2File')],
 ['Apple Health ZIP/XML adapter is shipped but lazy',!final.includes('key-apple-health-import-v1.js')&&apple.includes("fflate@0.8.2")&&apple.includes("export.xml")&&apple.includes("apple_health_key_import")],
 ['canonical KŌMØ operator exposes lazy Apple Health import',operatorFinal.includes('data-kop-key-import')&&operatorFinal.includes(`key-apple-health-import-v1.js?v=${appleRelease}`)&&operatorFinal.includes('KŌMØ KEY')],
 ['no duplicate persistent KEY agent launcher is visible',apple.includes('if(l)l.hidden=true')],
 ['raw Apple Health file is not retained',apple.includes('raw_file_retained:false')&&apple.includes('lecture locale')],
 ['Apple Health reimport deduplicates matching dates',apple.includes("wearable_daily_metrics').delete()")&&apple.includes("apple_health_mi_fitness")],
 ['agent navigation stays canonical',!apple.includes("location.hash='key'")&&apple.includes("KomoPatientNavigation?.go?.('key')")],
 ['Motion Score remains untouched by import',js.includes('Aucun score clinique n’est recalculé')]
];
for(const [label,ok] of checks) console.log(`[pulse-key-results-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-key-results-v2] PASS · KEY views + Apple Health ZIP/XML lazy import in canonical KŌMØ operator');

// My KŌMØ is forced into a single, event-driven route owner after every KEY build.
await import('./pulse-my-komo-stability-v4.mjs');
// Fine-detail styling is visual-only and always applied after the stable owner.
await import('./pulse-premium-detail-v1.mjs');
// Home hierarchy helper remains available for the iPhone KEY-first presentation.
await import('./pulse-home-key-position-v1.mjs');
// Official PDF: append a consent-gated longitudinal KEY page without touching score calculation.
await import('./pulse-key-pdf-report-v1.mjs');
// iPhone is the final presentation owner: fixed viewport, safe areas and locked zoom.
await import('./pulse-iphone-app-lock-v1.mjs');
// Authentication is the final session boundary: no login resurfacing or mobile layout jumps.
await import('./pulse-auth-stability-v1.mjs');
// Dark Luxe establishes the shared black visual language.
await import('./pulse-dark-luxe-v1.mjs');
// Final material hierarchy: graphite canvas with porcelain, forest and warm focal surfaces.
await import('./pulse-dark-luxe-polish-v2.mjs');
// Real-device iPhone QA: compact header, edge-to-edge content, aligned copy and compact dock.
await import('./pulse-iphone-density-v1.mjs');
// Desktop web login is a single page-specific owner, applied after every shared visual layer.
await import('./pulse-auth-web-v1.mjs');
// Commercial Home is the final route owner: one cockpit for Motion, Age, KEY, next action, Clinical and trajectory.
await import('./pulse-home-web-v1.mjs');