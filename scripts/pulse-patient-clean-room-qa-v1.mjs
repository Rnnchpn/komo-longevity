import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
const pulse=join(process.cwd(),'site','pulse-v12'),read=f=>readFile(join(pulse,f),'utf8');
const [html,home,homeCss,tabs,tabCss,mobile]=await Promise.all([read('index.html'),read('patient-home-clean-v1.js'),read('patient-home-clean-v1.css'),read('key-view-tabs-v1.js'),read('key-view-tabs-v1.css'),read('mobile-canonical-v1.js')]);
const legacy=['my-komo-home-v1.js','patient-home-visual-v2.js','patient-home-datawall-v3.js','my-komo-dashboard-v2.js','my-komo-key-home-v1.js','patient-home-micro-motion-v1.js','pulse-home-hero-polish-v2.js','my-komo-score-motion-v1.js'];
const checks=[
 ['clean Home runtime shipped',html.includes('patient-home-clean-v1.js?v=20260829-patient-clean-room-v2')&&html.includes('patient-home-clean-v1.css?v=20260829-patient-clean-room-v2')],
 ['all legacy Home renderers removed',legacy.every(x=>!html.includes(x))],
 ['Home has one renderer and no observers',home.includes("root.innerHTML=html(d)")&&!home.includes('MutationObserver')&&!home.includes('setInterval(')],
 ['clean Home is viewport agnostic',!home.includes('desktop()')&&!home.includes("matchMedia(PHONE)")&&!home.includes("if(!desktop()")],
 ['phone CSS renders clean Home',homeCss.includes('@media(max-width:767px)')&&homeCss.includes('.khc{display:grid!important')&&!homeCss.includes('.khc{display:none!important}')],
 ['mobile canonical delegates Home instead of rendering it',mobile.includes("if(r==='home')window.KomoPatientHomeClean?.refresh?.();else if(r==='link')link(false);")&&!mobile.includes("if(r==='home')home(false);else if(r==='link')link(false);")],
 ['mobile canonical refresh delegates Home',mobile.includes("route()==='link'?link(true):window.KomoPatientHomeClean?.refresh?.()")&&!mobile.includes("route()==='link'?link(true):home(true)")],
 ['Home uses canonical clinical result',home.includes("import { loadCanonicalResult } from './canonical-result-runtime.js'")],
 ['Home keeps KEY separate from Motion Score',home.includes('Les données connectées de My Key restent séparées de son calcul')],
 ['Home exposes only summary routes',home.includes('Ouvrir My Key')&&home.includes('Ouvrir My KŌMØ')&&home.includes('PROCHAINE ÉTAPE')],
 ['mobile shell and menu runtime preserved',html.includes('mobile-canonical-v1.js')&&mobile.includes('KŌMØ Link')&&mobile.includes('kcm-menu')),
 ['My KŌMØ canonical lobby preserved',html.includes('my-komo-lobby-v3.js')],
 ['My Key hub and captured data preserved',html.includes('key-hub-v1.js')&&html.includes('key-data-layer-v1.js')],
 ['My Key focused tabs shipped',html.includes('key-view-tabs-v1.js?v=20260829-patient-clean-room-v2')&&tabs.includes('Overview')&&tabs.includes('Data')&&tabs.includes('Sources')],
 ['Overview hides captured data wall',tabCss.includes('data-kvt-panel="overview"')&&tabCss.includes('>[data-kdl]{display:none!important}')],
 ['Data hides summary and focuses domains/stream',tabCss.includes('data-kvt-panel="data"')&&tabCss.includes('.kdl-vault')&&tabCss.includes('.kdl-grid')],
 ['Sources focuses integrity/provenance',tabCss.includes('data-kvt-panel="sources"')&&tabCss.includes('.kdl-grid>aside.kdl-card')]
];
let failed=0;for(const [label,ok] of checks){console.log(`[pulse-patient-clean-room-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}if(failed)throw new Error(`[pulse-patient-clean-room-qa] ${failed} check(s) failed`);console.log(`[pulse-patient-clean-room-qa] ${checks.length} checks passed.`);

// Fingerprint only after all final clean-room checks pass so immutable browser caches always receive new URLs.
await import('./pulse-asset-fingerprint-v1.mjs');
await import('./pulse-asset-fingerprint-qa-v1.mjs');
