import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const read=file=>readFile(join(pulse,file),'utf8');
const [html,css,dock,adaptive,lobby,hero,micro,score]=await Promise.all([
  read('index.html'),
  read('mobile-performance-final-v1.css'),
  read('pulse-bottom-nav-v6.js'),
  read('adaptive-shell-v4.js'),
  read('my-komo-lobby-v3.js'),
  read('pulse-home-hero-polish-v2.js'),
  read('patient-home-micro-motion-v1.js'),
  read('my-komo-score-motion-v1.js')
]);

const scoreIsEfficient=!score.includes('setInterval(')&&(score.includes("if(!window.matchMedia('(max-width: 767px)').matches)new MutationObserver")||score.includes("observer.observe(root,{childList:true,subtree:true})"));
const checks=[
  ['final mobile CSS shipped',html.includes('mobile-performance-final-v1.css?v=20260829-mobile-perf-final-1')],
  ['legacy bottom dock hidden on phone',css.includes('#kpDockV6')&&css.includes('display: none !important')],
  ['legacy bottom dock runtime does not mount on phone',dock.includes("if(phone())return null")&&dock.includes("document.querySelector('#kpDockV6')?.remove()")],
  ['phone header hides oversized web title',css.includes('html.kamo-phone-app #pageTitle')&&css.includes('display: none !important')],
  ['phone brand is centered',css.includes('.kam-mobile-brand')&&css.includes('justify-items: center !important')],
  ['phone remains vertical only',css.includes('overflow-x: hidden !important')&&css.includes('grid-template-columns: 1fr !important')],
  ['My KOMO mobile removes secondary results block',css.includes('.mkv3-grid .mkv3-stats')&&css.includes('display: none !important')],
  ['My KOMO mobile removes build and trophy overflow',css.includes('.mkv3 > .mkv3-card.mkv3-section')&&css.includes('.mkv3-next')],
  ['My KOMO keeps player card, daily loop and quests',css.includes('.mkv3-hero { order: 1')&&css.includes('.mkv3-lower { order: 2')&&css.includes('.mkv3-grid { order: 3')],
  ['My KOMO lobby shares canonical client',lobby.includes('window.KomoRuntime?.client||client')],
  ['My KOMO lobby hydration is debounced',lobby.includes('Date.now()-lastHydrate<1400')],
  ['adaptive shell no longer observes full body mutations',!adaptive.includes("observer.observe(document.body,{subtree:true,childList:true,attributes:true")&&adaptive.includes("observer.observe(observedShell,{attributes:true,attributeFilter:['hidden']})")],
  ['hero replay animations are reduced on phone',hero.includes("'(max-width: 767px)'")&&hero.includes("if(!window.matchMedia('(max-width: 767px)').matches)new MutationObserver")],
  ['home micro-motion avoids body observer on phone',micro.includes("if(!window.matchMedia('(max-width: 767px)').matches)new MutationObserver")],
  ['score runtime is event-driven without permanent polling',scoreIsEfficient],
  ['Safari auth stability layer preserved',html.includes('mobile-safari-stability-v1.js')&&html.includes('pulseStartupGuard')],
  ['critical mobile runtimes share coherent cache token',html.includes('adaptive-shell-v4.js?v=20260829-mobile-perf-final-1')&&html.includes('my-komo-lobby-v3.js?v=20260829-mobile-perf-final-1')]
];

let failed=0;
for(const [label,ok] of checks){console.log(`[pulse-mobile-performance-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)process.exit(1);
console.log(`[pulse-mobile-performance-qa] ${checks.length} checks passed.`);
