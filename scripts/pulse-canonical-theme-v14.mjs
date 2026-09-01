import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const index=join(root,'site','pulse-v12','index.html');
const cssPath=join(root,'site','pulse-v12','pulse-canonical-theme-v14.css');
let html=await readFile(index,'utf8');
const css=await readFile(cssPath,'utf8');

// v14 replaces every temporary/canonical palette predecessor. One final visual owner only.
html=html
  .replace(/\s*<script src="\.\/patient-palette-balance-v1\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-home-palette-surfaces-v12\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-canonical-dark-theme-v13\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<style id="kpCanonicalThemePriorityV13">[\s\S]*?<\/style>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-canonical-theme-v14\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<style id="kpCanonicalThemePriorityV14">[\s\S]*?<\/style>/g,'');

const tag='  <link rel="stylesheet" href="./pulse-canonical-theme-v14.css?v=20260901-canonical-v14-final" />';
const priority=`  <style id="kpCanonicalThemePriorityV14">
  html body.connected-v2 .main-shell,html body.connected-v2 #viewRoot,
  html body.kresults-v2 .main-shell,html body.kresults-v2 #viewRoot,
  html body.consultations-v4 .main-shell,html body.consultations-v4 #viewRoot,
  html body.agenda-v4 .main-shell,html body.mykomo-v5 .main-shell,
  html body.komo-pro-mode .main-shell,html body.komo-pro-mode #viewRoot{background:#050706!important;color:#f3f5f2!important}
  html body.kmotion-v4{--m4bg:#050706!important;--m4paper:#0a0e0b!important;--m4ink:#f3f5f2!important;--m4muted:#a2aca5!important;--m4line:rgba(255,255,255,.10)!important;--m4green:#8fb39a!important;--m4amber:#d0ad6b!important;--m4red:#d18a83!important;background:#050706!important;color:#f3f5f2!important}
  html body.kmotion-v4 #appShell,html body.kmotion-v4 .main-shell,html body.kmotion-v4 #viewRoot{background:#050706!important;color:#f3f5f2!important}
  html body #appShell .main-shell #viewRoot{opacity:1!important;filter:none!important;mix-blend-mode:normal!important}
  html body #viewRoot :is(.kcv2,.kr2,.km4,.kc4,.ag4,.mkv4,.kpv,.kah,.kap,.kmsg-pro,.kmsg-patient-center,.kcp,.kav2){color:#f3f5f2!important}
  html body #viewRoot :is(.kcv2,.kr2,.km4,.kc4,.ag4,.mkv4,.kpv,.kah,.kap,.kmsg-pro,.kmsg-patient-center,.kcp,.kav2) :is(h1,h2,h3,h4,h5,h6,strong,b){color:#f3f5f2!important}
  html body #authScreen .auth-panel{border-radius:30px!important}
  </style>`;
html=html.replace('</head>',`${tag}\n${priority}\n</head>`);
await writeFile(index,html,'utf8');

const checks=[
  ['legacy beige palette retired',!html.includes('patient-palette-balance-v1.js')],
  ['temporary palette retired',!html.includes('pulse-home-palette-surfaces-v12.css')],
  ['v13 stylesheet retired',!html.includes('pulse-canonical-dark-theme-v13.css')],
  ['v13 priority retired',!html.includes('kpCanonicalThemePriorityV13')],
  ['v14 loaded exactly once',(html.match(/pulse-canonical-theme-v14\.css/g)||[]).length===1],
  ['v14 priority loaded exactly once',(html.match(/kpCanonicalThemePriorityV14/g)||[]).length===1],
  ['root dim reset protected',html.includes('#appShell .main-shell #viewRoot{opacity:1!important')&&css.includes('opacity:1!important;filter:none!important')],
  ['readable muted token',css.includes('--kp-muted:#a2aca5')],
  ['explicit dark-surface text contract',css.includes(':is(.kcv2,.kr2,.km4,.kc4,.ag4,.mkv4,.kpv,.kah,.kap,.kmsg-pro,.kmsg-patient-center,.kcp,.kav2) :is(h1,h2,h3,h4,h5,h6,strong,b)')],
  ['Auth is a rounded floating card',css.includes('border-radius:30px!important')&&css.includes('box-shadow:0 34px 100px')],
  ['route animation is short',css.includes('@keyframes kpRouteInV14')&&css.includes('.22s var(--kp-ease)')],
  ['reduced motion respected',css.includes('@media(prefers-reduced-motion:reduce)')],
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
  ['Auth scoped',css.includes('#authScreen .auth-panel')]
];
for(const [label,ok] of checks){console.log(`[pulse-theme-v14] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Pulse canonical theme v14 guard failed');
console.log('[pulse-theme-v14] PASS · contrast, Auth card and motion timing frozen across Pulse');
