import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const index=join(root,'site','pulse-v12','index.html');
const cssPath=join(root,'site','pulse-v12','pulse-canonical-theme-v14.css');
let html=await readFile(index,'utf8');
const css=await readFile(cssPath,'utf8');

// v14 remains the single canonical visual owner. This pass only hardens contrast
// and eliminates light legacy islands that can inherit white text at runtime.
html=html
  .replace(/\s*<script src="\.\/patient-palette-balance-v1\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-home-palette-surfaces-v12\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-canonical-dark-theme-v13\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<style id="kpCanonicalThemePriorityV13">[\s\S]*?<\/style>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-canonical-theme-v14\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<style id="kpCanonicalThemePriorityV14">[\s\S]*?<\/style>/g,'');

const tag='  <link rel="stylesheet" href="./pulse-canonical-theme-v14.css?v=20260903-canonical-v14-contrast-stable" />';
const priority=`  <style id="kpCanonicalThemePriorityV14">
  /* Canonical canvas */
  html,html body{background:#050706!important;color:#f3f5f2!important;color-scheme:dark}
  html body #appShell,html body .app-shell,html body .main-shell,html body #viewRoot,html body .view-root{background:#050706!important;color:#f3f5f2!important}
  html body.connected-v2 .main-shell,html body.connected-v2 #viewRoot,
  html body.kresults-v2 .main-shell,html body.kresults-v2 #viewRoot,
  html body.consultations-v4 .main-shell,html body.consultations-v4 #viewRoot,
  html body.agenda-v4 .main-shell,html body.agenda-v4 #viewRoot,
  html body.mykomo-v5 .main-shell,html body.mykomo-v5 #viewRoot,
  html body.komo-pro-mode .main-shell,html body.komo-pro-mode #viewRoot{background:#050706!important;color:#f3f5f2!important}

  /* Chrome must never fall back to the old beige shell. */
  html body .topbar{background:rgba(5,7,6,.96)!important;border-color:rgba(255,255,255,.08)!important;color:#f3f5f2!important;box-shadow:none!important}
  html body .topbar :is(a,button,span,strong,b){color:inherit}
  html body .mode-switch,html body .kam-role-switch{background:rgba(255,255,255,.045)!important;border-color:rgba(255,255,255,.10)!important}
  html body .mode-switch button,html body .kam-role-switch button{color:#a2aca5!important}
  html body .mode-switch button.active,html body .kam-role-switch button.active{background:#edf1ed!important;color:#18231c!important}

  /* Motion variables remain presentation-only. */
  html body.kmotion-v4{--m4bg:#050706!important;--m4paper:#0a0e0b!important;--m4ink:#f3f5f2!important;--m4muted:#a2aca5!important;--m4line:rgba(255,255,255,.10)!important;--m4green:#8fb39a!important;--m4amber:#d0ad6b!important;--m4red:#d18a83!important;background:#050706!important;color:#f3f5f2!important}
  html body.kmotion-v4 #appShell,html body.kmotion-v4 .main-shell,html body.kmotion-v4 #viewRoot{background:#050706!important;color:#f3f5f2!important}

  /* Never inherit stale route dimming or blend modes. */
  html body #appShell .main-shell #viewRoot{opacity:1!important;filter:none!important;mix-blend-mode:normal!important}

  /* Dark-surface text contract. */
  html body #viewRoot :is(.kcv2,.kr2,.km4,.kc4,.ag4,.mkv4,.kpv,.kah,.kap,.kmsg-pro,.kmsg-patient-center,.kcp,.kav2){color:#f3f5f2!important}
  html body #viewRoot :is(.kcv2,.kr2,.km4,.kc4,.ag4,.mkv4,.kpv,.kah,.kap,.kmsg-pro,.kmsg-patient-center,.kcp,.kav2) :is(h1,h2,h3,h4,h5,h6,strong,b){color:#f3f5f2!important}
  html body #viewRoot :is(.kcv2,.kr2,.km4,.kc4,.ag4,.mkv4,.kpv,.kah,.kap,.kmsg-pro,.kmsg-patient-center,.kcp,.kav2) :is(p,small,li,label){color:#a2aca5!important}

  /* Forms: explicit foreground/background so browser defaults cannot create white-on-white. */
  html body #viewRoot :is(input,select,textarea){background:#070a08!important;border-color:rgba(255,255,255,.12)!important;color:#f3f5f2!important;-webkit-text-fill-color:#f3f5f2!important}
  html body #viewRoot :is(input,textarea)::placeholder{color:#707a73!important;-webkit-text-fill-color:#707a73!important}
  html body #viewRoot select option{background:#070a08!important;color:#f3f5f2!important}

  /* Agenda premium map used to inject an ivory island after the canonical theme.
     Keep the map itself light, but its UI chrome belongs to the dark Pulse system. */
  html body #viewRoot .ag4 .agp-network,
  html body #viewRoot .ag4 .agp-head,
  html body #viewRoot .ag4 .agp-card,
  html body #viewRoot .ag4 .agp-place,
  html body #viewRoot .ag4 .agp-search input,
  html body #viewRoot .ag4 .agp-near,
  html body #viewRoot .ag4 .agp-filter{background:#0a0e0b!important;border-color:rgba(255,255,255,.10)!important;color:#f3f5f2!important;box-shadow:none!important}
  html body #viewRoot .ag4 .agp-head h3,
  html body #viewRoot .ag4 .agp-card h4,
  html body #viewRoot .ag4 .agp-place strong{color:#f3f5f2!important}
  html body #viewRoot .ag4 :is(.agp-head p,.agp-card .address,.agp-card .desc,.agp-distance,.agp-place small){color:#8d9890!important}
  html body #viewRoot .ag4 .agp-filter.active,
  html body #viewRoot .ag4 .agp-select,
  html body #viewRoot .ag4 .agp-place.active{background:#315b41!important;border-color:#315b41!important;color:#f3f5f2!important}
  html body #viewRoot .ag4 .agp-tag.motion,
  html body #viewRoot .ag4 .agp-tag.clinical{background:rgba(127,165,138,.13)!important;color:#b6cfbb!important}
  html body #viewRoot .ag4 .agp-pro{background:rgba(255,255,255,.045)!important;color:#cbd3cd!important}
  html body #viewRoot .ag4 .agp-map-wrap{border:1px solid rgba(255,255,255,.08)!important}

  /* Agenda booking chrome: remove any remaining paper controls while preserving hierarchy. */
  html body #viewRoot .ag4 :is(.ag4-weekbar,.ag4-day,.ag4-slot,.ag4-select select,.ag4-segment,.ag4-network){background:#0a0e0b!important;border-color:rgba(255,255,255,.10)!important;color:#f3f5f2!important}
  html body #viewRoot .ag4 .ag4-segment button{color:#9da7a0!important}
  html body #viewRoot .ag4 .ag4-segment button.active{background:#315b41!important;color:#f3f5f2!important}

  /* Auth remains the only deliberately floating instrument card. */
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
  ['explicit dark-surface text contract',html.includes('Dark-surface text contract')&&html.includes('color:#f3f5f2!important')],
  ['forms have explicit dark contrast',html.includes('select option{background:#070a08!important;color:#f3f5f2!important}')],
  ['premium Agenda light island removed',html.includes('.ag4 .agp-network')&&html.includes('.ag4 .agp-card')&&html.includes('background:#0a0e0b!important')],
  ['topbar contrast locked',html.includes('html body .topbar{background:rgba(5,7,6,.96)!important')],
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
console.log('[pulse-theme-v14] PASS · canonical dark contrast stabilized across Pulse');
