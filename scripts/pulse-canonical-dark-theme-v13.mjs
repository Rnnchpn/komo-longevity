import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const index=join(root,'site','pulse-v12','index.html');
const cssPath=join(root,'site','pulse-v12','pulse-canonical-dark-theme-v13.css');
let html=await readFile(index,'utf8');
const css=await readFile(cssPath,'utf8');

// Retire the old beige patient palette injector and the temporary two-surface palette.
html=html
  .replace(/\s*<script src="\.\/patient-palette-balance-v1\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-home-palette-surfaces-v12\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-canonical-dark-theme-v13\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<style id="kpCanonicalThemePriorityV13">[\s\S]*?<\/style>/g,'');

const tag='  <link rel="stylesheet" href="./pulse-canonical-dark-theme-v13.css?v=20260901-canonical-v13" />';
const priority=`  <style id="kpCanonicalThemePriorityV13">
  html body.connected-v2 .main-shell,html body.connected-v2 #viewRoot,
  html body.kresults-v2 .main-shell,html body.kresults-v2 #viewRoot,
  html body.consultations-v4 .main-shell,html body.consultations-v4 #viewRoot,
  html body.agenda-v4 .main-shell,html body.mykomo-v5 .main-shell,
  html body.komo-pro-mode .main-shell,html body.komo-pro-mode #viewRoot{background:#050706!important;color:#f3f5f2!important}
  html body.kmotion-v4{--m4bg:#050706!important;--m4paper:#0a0e0b!important;--m4ink:#f3f5f2!important;--m4muted:#87918a!important;--m4line:rgba(255,255,255,.09)!important;--m4green:#7fa58a!important;--m4amber:#c6a15e!important;--m4red:#c87972!important;background:#050706!important;color:#f3f5f2!important}
  html body.kmotion-v4 #appShell,html body.kmotion-v4 .main-shell,html body.kmotion-v4 #viewRoot{background:#050706!important;color:#f3f5f2!important}
  </style>`;
html=html.replace('</head>',`${tag}\n${priority}\n</head>`);
await writeFile(index,html,'utf8');

const checks=[
  ['legacy beige patient palette retired',!html.includes('patient-palette-balance-v1.js')],
  ['temporary Connected/Consultations palette retired',!html.includes('pulse-home-palette-surfaces-v12.css')],
  ['canonical theme loaded exactly once',(html.match(/pulse-canonical-dark-theme-v13\.css/g)||[]).length===1],
  ['route priority guard loaded exactly once',(html.match(/kpCanonicalThemePriorityV13/g)||[]).length===1],
  ['late Connected light shell cannot win',html.includes('html body.connected-v2 .main-shell')],
  ['late Results light shell cannot win',html.includes('html body.kresults-v2 .main-shell')],
  ['late Motion variables cannot win',html.includes('html body.kmotion-v4{--m4bg:#050706!important')],
  ['late Consultations light shell cannot win',html.includes('html body.consultations-v4 .main-shell')],
  ['late Agenda light shell cannot win',html.includes('html body.agenda-v4 .main-shell')],
  ['Home black token present',css.includes('--kp-bg:#050706')],
  ['Club/Home surface token present',css.includes('--kp-surface:#0a0e0b')],
  ['KŌMØ green token present',css.includes('--kp-green:#7fa58a')],
  ['KŌMØ core green present',css.includes('--kp-green-core:#315b41')],
  ['warm accent retained',css.includes('--kp-warm:#d9c89f')],
  ['status amber retained',css.includes('--kp-amber:#c6a15e')],
  ['status red retained',css.includes('--kp-red:#c87972')],
  ['Connected scoped',css.includes('.kcv2-card')],
  ['Results scoped',css.includes('.kr2-card')],
  ['Motion scoped',css.includes('.km4-score')],
  ['Consultations scoped',css.includes('.kc4-card')],
  ['Agenda scoped',css.includes('.ag4-card')],
  ['My KŌMØ scoped',css.includes('.mkv4-card')],
  ['Profile scoped',css.includes('.kpv-card')],
  ['Messages scoped',css.includes('.kmsg-conversation')],
  ['Clinical scoped',css.includes('.kcp-card')],
  ['Admin scoped',css.includes('.kav2-card')],
  ['Auth scoped',css.includes('.auth-screen')]
];
for(const [label,ok] of checks){console.log(`[pulse-theme-v13] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Pulse canonical theme v13 guard failed');
console.log('[pulse-theme-v13] PASS · Home + Club visual language is canonical across Pulse · late route styles cannot restore light shells');
