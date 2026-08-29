import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
const pulse=join(process.cwd(),'site','pulse-v12'),read=f=>readFile(join(pulse,f),'utf8');
const [html,home,homeCss,tabs,tabCss,mobile]=await Promise.all([read('index.html'),read('patient-home-clean-v1.js'),read('patient-home-clean-v1.css'),read('key-view-tabs-v1.js'),read('key-view-tabs-v1.css'),read('mobile-canonical-v1.js')]);
const legacy=['my-komo-home-v1.js','patient-home-visual-v2.js','patient-home-datawall-v3.js','my-komo-dashboard-v2.js','my-komo-key-home-v1.js','patient-home-micro-motion-v1.js','pulse-home-hero-polish-v2.js','my-komo-score-motion-v1.js'];
const checks=[
 ['clean Home runtime shipped for desktop/tablet',html.includes('patient-home-clean-v1.js?v=20260829-patient-clean-room-v3')&&html.includes('patient-home-clean-v1.css?v=20260829-patient-clean-room-v3')],
 ['all superseded legacy Home renderers removed',legacy.every(x=>!html.includes(x))],
 ['clean Home has one renderer and no observers',home.includes("root.innerHTML=html(d)")&&!home.includes('MutationObserver')&&!home.includes('setInterval(')],
 ['clean Home is explicitly desktop/tablet only',home.includes("const desktop=()=>!matchMedia(PHONE).matches")&&home.includes("if(!desktop()||route()!=='home')return")],
 ['clean Home CSS is hidden on phones',homeCss.includes('@media(max-width:767px){.khc,[data-patient-home-clean]{display:none!important}}')],
 ['mobile canonical still owns Home rendering',mobile.includes("if(r==='home')home(false);else if(r==='link')link(false);")&&mobile.includes("route()==='link'?link(true):home(true)")],
 ['mobile canonical Home keeps requested hierarchy',mobile.includes('MON ESPACE')&&mobile.includes('KŌMØ MOTION')&&mobile.includes('KŌMØ CLINICAL')&&mobile.includes('KŌMØ KEY')&&mobile.includes('Votre progression KŌMØ.')],
 ['mobile shell and menu runtime preserved',html.includes('mobile-canonical-v1.js')&&mobile.includes('KŌMØ Link')&&mobile.includes('kcm-menu')],
 ['Home uses canonical clinical result',home.includes("import { loadCanonicalResult } from './canonical-result-runtime.js'")],
 ['desktop Home keeps KEY separate from Motion Score',home.includes('Les données connectées de My Key restent séparées de son calcul')],
 ['My KŌMØ canonical lobby preserved',html.includes('my-komo-lobby-v3.js')],
 ['My Key hub and captured data preserved',html.includes('key-hub-v1.js')&&html.includes('key-data-layer-v1.js')],
 ['My Key focused tabs shipped',html.includes('key-view-tabs-v1.js?v=20260829-patient-clean-room-v3')&&tabs.includes('Overview')&&tabs.includes('Data')&&tabs.includes('Sources')],
 ['Overview hides captured data wall',tabCss.includes('data-kvt-panel="overview"')&&tabCss.includes('>[data-kdl]{display:none!important}')],
 ['Data hides summary and focuses domains/stream',tabCss.includes('data-kvt-panel="data"')&&tabCss.includes('.kdl-vault')&&tabCss.includes('.kdl-grid')],
 ['Sources focuses integrity/provenance',tabCss.includes('data-kvt-panel="sources"')&&tabCss.includes('.kdl-grid>aside.kdl-card')]
];
let failed=0;for(const [label,ok] of checks){console.log(`[pulse-patient-clean-room-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}if(failed)throw new Error(`[pulse-patient-clean-room-qa] ${failed} check(s) failed`);console.log(`[pulse-patient-clean-room-qa] ${checks.length} checks passed.`);

await import('./pulse-asset-fingerprint-v1.mjs');
await import('./pulse-asset-fingerprint-qa-v1.mjs');