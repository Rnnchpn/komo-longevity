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

// One final owner per consultation surface. These historical Centre/Agenda
// layers used to mutate the same Clinical DOM after the canonical workspace,
// which caused stacked builds, click interception and theme conflicts.
const retired=[
  'agenda-hub-v4.js',
  'agenda-premium-map-v1.js',
  'pro-agenda-dossier-v1.js',
  'booking-directory-map-v1.js',
  'center-patient-links.js',
  'center-context-v1.js',
  'center-command-cockpit-v2.js',
  'center-profile-v1.js',
  'center-workspace-v1.js',
  'center-messaging-v1.js',
  'center-patient-polish.js',
  'center-owner-ui-guard-v1.js'
];
for(const file of retired){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<script[^>]+${escaped}[^>]*><\\/script>`,'g'),'');
}

const retiredCss=[
  'agenda-hub-v4.css',
  'agenda-premium-map-v1.css',
  'booking-directory-map-v1.css',
  'center-patient-links.css',
  'center-context-v1.css',
  'center-command-cockpit-v2.css',
  'center-profile-v1.css',
  'center-workspace-v1.css',
  'center-messaging-v1.css',
  'center-patient-polish.css',
  'center-owner-ui-guard-v1.css'
];
for(const file of retiredCss){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<link[^>]+${escaped}[^>]*>`,'g'),'');
}

fs.writeFileSync(htmlPath,html);
for(const file of [...retired,...retiredCss])if(html.includes(file))throw new Error('[consultation-prune] legacy asset still loaded: '+file);
if(!html.includes('center-two-tab-workspace-v1.js'))throw new Error('[consultation-prune] canonical Centre workspace missing');
console.log('[consultation-prune] PASS · one Centre owner · legacy Centre/agenda layers retired');

// Final UX/performance pass: runs after raw-template normalization and before
// the final consultation QA, so production cannot ship the blocking loader.
await import('./pulse-consultation-load-performance-v1.mjs');

// Absolute final product flow: same existing Centre/booking owners, clarified
// as Myodev → attribution → patient starts Motion questionnaires.
await import('./pulse-consultation-flow-final-v1.mjs');
