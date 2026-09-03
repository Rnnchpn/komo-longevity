import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const index=join(root,'site','pulse-v12','index.html');
const cssPath=join(root,'site','pulse-v12','pulse-canonical-theme-v14.css');
let html=await readFile(index,'utf8');
const css=await readFile(cssPath,'utf8');

// v14 is the only transverse visual owner. Keep structural/component CSS, retire broad historical polish layers.
html=html
  .replace(/\s*<script src="\.\/patient-palette-balance-v1\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-home-palette-surfaces-v12\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-canonical-dark-theme-v13\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-dark-luxe-v1\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-dark-luxe-polish-v2\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-premium-detail-v1\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<style id="kpCanonicalThemePriorityV13">[\s\S]*?<\/style>/g,'')
  .replace(/\s*<link rel="stylesheet" href="\.\/pulse-canonical-theme-v14\.css(?:\?[^\"]*)?"\s*\/>/g,'')
  .replace(/\s*<style id="kpCanonicalThemePriorityV14">[\s\S]*?<\/style>/g,'');

const tag='  <link rel="stylesheet" href="./pulse-canonical-theme-v14.css?v=20260903-canonical-v14-consolidated" />';
const priority=`  <style id="kpCanonicalThemePriorityV14">
  /* Canonical canvas: no stacked visual filters or legacy dimming. */
  html body.connected-v2 .main-shell,html body.connected-v2 #viewRoot,
  html body.kresults-v2 .main-shell,html body.kresults-v2 #viewRoot,
  html body.consultations-v4 .main-shell,html body.consultations-v4 #viewRoot,
  html body.agenda-v4 .main-shell,html body.mykomo-v5 .main-shell,
  html body.komo-pro-mode .main-shell,html body.komo-pro-mode #viewRoot{background:#050706!important;color:#f3f5f2!important}
  html body.kmotion-v4{--m4bg:#050706!important;--m4paper:#0a0e0b!important;--m4ink:#f3f5f2!important;--m4muted:#a2aca5!important;--m4line:rgba(255,255,255,.10)!important;--m4green:#8fb39a!important;--m4amber:#d0ad6b!important;--m4red:#d18a83!important;background:#050706!important;color:#f3f5f2!important}
  html body.kmotion-v4 #appShell,html body.kmotion-v4 .main-shell,html body.kmotion-v4 #viewRoot{background:#050706!important;color:#f3f5f2!important}
  html body #appShell .main-shell #viewRoot{opacity:1!important;filter:none!important;mix-blend-mode:normal!important}
  html body #appShell::before,html body #appShell::after{display:none!important}
  html body #viewRoot :is(.kcv2,.kr2,.km4,.kc4,.ag4,.mkv4,.kpv,.kah,.kap,.kmsg-pro,.kmsg-patient-center,.kcp,.kav2){color:#f3f5f2!important}
  html body #viewRoot :is(.kcv2,.kr2,.km4,.kc4,.ag4,.mkv4,.kpv,.kah,.kap,.kmsg-pro,.kmsg-patient-center,.kcp,.kav2) :is(h1,h2,h3,h4,h5,h6,strong,b){color:#f3f5f2!important}

  /* One patient navigation owner. Legacy sidebar/mobile nav are already retired by the route core; this is a final visual guard. */
  html[data-kp-nav-mode="patient"] #desktopNav,html[data-kp-nav-mode="patient"] #mobileNav,html[data-kp-nav-mode="patient"] #kamBottomBar{display:none!important}
  #kpDockV6{background:rgba(8,12,9,.985)!important;border:1px solid rgba(255,255,255,.10)!important;box-shadow:0 16px 42px rgba(0,0,0,.28)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}
  #kpDockV6::before,#kpDockV6::after,#kpDockV6 .kp6-indicator::before{display:none!important}
  #kpDockV6 .kp6-indicator{background:#edf1ed!important;box-shadow:0 5px 16px rgba(0,0,0,.18)!important}
  #kpDockV6 a{color:#929d95!important;text-shadow:none!important}
  #kpDockV6 a.active{color:#18231c!important;text-shadow:none!important}

  /* Calm chrome: solid surfaces, one border, minimal blur. */
  html body .topbar{background:rgba(5,7,6,.985)!important;border-color:rgba(255,255,255,.075)!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
  html body .account-popover{background:#0a0e0b!important;border-color:rgba(255,255,255,.10)!important;box-shadow:0 18px 46px rgba(0,0,0,.28)!important}
  html body .mode-switch,html body .kam-role-switch{background:#0a0e0b!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}

  /* One sober card language across product surfaces. */
  html body #viewRoot :is(.kcv2-card,.kcv2-metric,.kcv2-panel,.kr2-card,.kr2-section,.kr2-connected-card,.kr2-domain,.kr2-row,.kr2-clinical-card,.km4-score,.km4-komo,.km4-domain,.km4-next,.kc4-card,.kc4-appt,.kc4-plan-item,.kc4-control,.ag4-card,.ag4-next,.ag4-book,.ag4-upcoming,.ag4-network,.mkv4-card,.kpv-card,.kah-card,.kap-card,.kmsg-conversation,.kcp-card,.kav2-card){background:#0a0e0b!important;border-color:rgba(255,255,255,.09)!important;box-shadow:none!important}
  html body #viewRoot :is(.kcv2-hero,.kr2-hero,.kc4-hero,.km4-focus){background:#0b100d!important;border:1px solid rgba(255,255,255,.10)!important;box-shadow:none!important}
  html body #viewRoot :is(.kcv2-panel.good,.kr2-connected-card.good,.kr2-row.good,.kc4-appt.upcoming){background:rgba(127,165,138,.09)!important}
  html body #viewRoot :is(.kr2-connected-card.bad,.kr2-row.bad){background:rgba(200,121,114,.09)!important}

  /* Home stays data-free and becomes quieter: no decorative light layers. */
  html body.khome-final-v1 [data-my-komo-home]{background:#050706!important}
  html body.khome-final-v1 [data-my-komo-home]::before{display:none!important}
  html body.khome-final-v1 .kh7-actions a{background:#0a0e0b!important;border-color:rgba(255,255,255,.09)!important;box-shadow:none!important}
  @media(hover:hover){html body.khome-final-v1 .kh7-actions a:hover{background:#0d1510!important;border-color:rgba(127,165,138,.28)!important;transform:translateY(-1px)!important}}

  /* Authentication keeps its structural responsive CSS, with one restrained finishing layer. */
  html body #authScreen .auth-panel{border-radius:28px!important;box-shadow:0 22px 64px rgba(0,0,0,.20)!important}

  @media(max-width:760px){
    #kpDockV6{box-shadow:0 10px 28px rgba(0,0,0,.28)!important}
    #kpDockV6 b{white-space:normal!important;text-align:center!important;line-height:1.02!important;max-width:100%!important}
    html body.khome-final-v1 .kh7-actions a{border-radius:14px!important}
  }
  @media(prefers-reduced-motion:reduce){#kpDockV6,#kpDockV6 *{transition:none!important}}
  </style>`;
html=html.replace('</head>',`${tag}\n${priority}\n</head>`);
await writeFile(index,html,'utf8');

const checks=[
  ['legacy beige palette retired',!html.includes('patient-palette-balance-v1.js')],
  ['temporary palette retired',!html.includes('pulse-home-palette-surfaces-v12.css')],
  ['v13 stylesheet retired',!html.includes('pulse-canonical-dark-theme-v13.css')],
  ['dark luxe base retired',!html.includes('pulse-dark-luxe-v1.css')],
  ['dark luxe polish retired',!html.includes('pulse-dark-luxe-polish-v2.css')],
  ['premium detail overlay retired',!html.includes('pulse-premium-detail-v1.css')],
  ['v13 priority retired',!html.includes('kpCanonicalThemePriorityV13')],
  ['v14 loaded exactly once',(html.match(/pulse-canonical-theme-v14\.css/g)||[]).length===1],
  ['v14 priority loaded exactly once',(html.match(/kpCanonicalThemePriorityV14/g)||[]).length===1],
  ['single patient chrome guard',priority.includes('#desktopNav')&&priority.includes('#mobileNav')&&priority.includes('#kamBottomBar')],
  ['canonical dock gloss removed',priority.includes('#kpDockV6::before,#kpDockV6::after,#kpDockV6 .kp6-indicator::before{display:none!important}')],
  ['root dim reset protected',html.includes('#appShell .main-shell #viewRoot{opacity:1!important')&&css.includes('opacity:1!important;filter:none!important')],
  ['readable muted token',css.includes('--kp-muted:#a2aca5')],
  ['explicit dark-surface text contract',css.includes(':is(.kcv2,.kr2,.km4,.kc4,.ag4,.mkv4,.kpv,.kah,.kap,.kmsg-pro,.kmsg-patient-center,.kcp,.kav2) :is(h1,h2,h3,h4,h5,h6,strong,b)')],
  ['Auth remains a rounded floating card',css.includes('border-radius:30px!important')&&priority.includes('border-radius:28px!important')],
  ['route animation is short',css.includes('@keyframes kpRouteInV14')&&css.includes('.22s var(--kp-ease)')],
  ['reduced motion respected',css.includes('@media(prefers-reduced-motion:reduce)')&&priority.includes('@media(prefers-reduced-motion:reduce)')],
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
console.log('[pulse-theme-v14] PASS · one transverse visual owner · historical polish layers retired · sober rendering frozen');
