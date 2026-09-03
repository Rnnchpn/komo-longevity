import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const pulse=path.join(process.cwd(),'site','pulse-v12');
const htmlPath=path.join(pulse,'index.html');
if(!fs.existsSync(htmlPath))throw new Error('[consultation-prune] Pulse index missing');

// The final consultation patch is generated through a raw template. Normalize
// the escaping needed by the generator so the emitted browser modules contain
// real template literals/interpolations, then syntax-check them before deploy.
for(const name of ['booking-layer-v1.js','center-two-tab-workspace-v1.js']){
  const file=path.join(pulse,name);
  if(!fs.existsSync(file))throw new Error('[consultation-prune] missing runtime: '+name);
  let src=fs.readFileSync(file,'utf8');
  src=src.replace(/\\`/g,'`').replace(/\\\$\{/g,'${');
  if(name==='booking-layer-v1.js'){
    src=src.replace(";if(S.proActive&&!S.proLoading)loadProWeek().catch(console.error)",'');
  }
  fs.writeFileSync(file,src);
  const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(check.status!==0)throw new Error(`[consultation-prune] invalid ${name}: ${check.stderr||check.stdout}`);
}

let html=fs.readFileSync(htmlPath,'utf8');
const retired=[
  'agenda-hub-v4.js',
  'agenda-premium-map-v1.js',
  'pro-agenda-dossier-v1.js',
  'booking-directory-map-v1.js'
];
for(const file of retired){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<script[^>]+${escaped}[^>]*><\\/script>`,'g'),'');
}
for(const file of ['agenda-hub-v4.css','agenda-premium-map-v1.css','booking-directory-map-v1.css']){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<link[^>]+${escaped}[^>]*>`,'g'),'');
}
fs.writeFileSync(htmlPath,html);
for(const file of retired)if(html.includes(file))throw new Error('[consultation-prune] legacy runtime still loaded: '+file);
console.log('[consultation-prune] valid consultation runtime · agenda, agenda map and pro agenda retired');

// Final UX/performance pass: runs after raw-template normalization and before
// the final consultation QA, so production cannot ship the blocking loader.
await import('./pulse-consultation-load-performance-v1.mjs');

// Absolute final product flow: same existing Centre/booking owners, clarified
// as Myodev → attribution → patient starts Motion questionnaires.
await import('./pulse-consultation-flow-final-v1.mjs');
