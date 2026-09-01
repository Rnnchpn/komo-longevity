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
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-canonical-dark-theme-v13\.css(?:\?[^\"]*)?"\s*\/>/g,'');

const tag='  <link rel="stylesheet" href="./pulse-canonical-dark-theme-v13.css?v=20260901-canonical-v13" />';
html=html.replace('</head>',`${tag}\n</head>`);
await writeFile(index,html,'utf8');

const checks=[
  ['legacy beige patient palette retired',!html.includes('patient-palette-balance-v1.js')],
  ['temporary Connected/Consultations palette retired',!html.includes('pulse-home-palette-surfaces-v12.css')],
  ['canonical theme loaded exactly once',(html.match(/pulse-canonical-dark-theme-v13\.css/g)||[]).length===1],
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
console.log('[pulse-theme-v13] PASS · Home + Club visual language is canonical across Pulse · legacy beige injector retired');
