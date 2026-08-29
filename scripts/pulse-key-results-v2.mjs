import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-key-results-v2';
const appleRelease='20260829-key-apple-health-v1';
for(const file of ['key-results-v2.css','key-results-v2.js','key-apple-health-import-v1.js']) await copyFile(join(root,'pulse-app',file),join(pulse,file));
let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/key-results-v2\.css(?:\?[^\"]*)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/key-results-v2\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace(/\s*<script src="\.\/key-apple-health-import-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');
html=html.replace('</head>',`  <link rel="stylesheet" href="./key-results-v2.css?v=${release}" />\n</head>`);
html=html.replace('</body>',`  <script src="./key-results-v2.js?v=${release}"></script>\n  <script src="./key-apple-health-import-v1.js?v=${appleRelease}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');
const css=await readFile(join(pulse,'key-results-v2.css'),'utf8');
const js=await readFile(join(pulse,'key-results-v2.js'),'utf8');
const apple=await readFile(join(pulse,'key-apple-health-import-v1.js'),'utf8');
const final=await readFile(htmlPath,'utf8');
const checks=[
 ['v2 CSS is final visual layer',final.includes(`key-results-v2.css?v=${release}`)],
 ['v2 runtime is final KEY layer',final.includes(`key-results-v2.js?v=${release}`)],
 ['KEY result menu has four views',js.includes("['overview','Aperçu']")&&js.includes("['data','Données']")],
 ['Today session uses real wear minutes',js.includes('wear_minutes')&&js.includes('SESSION PARTIELLE')],
 ['numbers animate with requestAnimationFrame',js.includes('requestAnimationFrame')&&css.includes('kh2DigitIn')],
 ['CSV and JSON test import enabled',js.includes('komo_key_file_import')&&js.includes('kh2File')],
 ['Apple Health XML adapter shipped',final.includes(`key-apple-health-import-v1.js?v=${appleRelease}`)&&apple.includes('apple_health_mi_fitness')&&apple.includes('Smart Band 9 Active')],
 ['Motion Score remains untouched by import',js.includes('Aucun score clinique n’est recalculé')]
];
for(const [label,ok] of checks) console.log(`[pulse-key-results-v2] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log('[pulse-key-results-v2] PASS · premium KEY views + animated numbers + CSV/JSON + Apple Health XML POC import');

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