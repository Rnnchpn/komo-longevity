import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const release='20260827-canonical-1';
const [html,css,adaptive,mobile,guided,design]=await Promise.all([
  readFile(join(pulse,'index.html'),'utf8'),
  readFile(join(pulse,'pulse-ui-v1.css'),'utf8'),
  readFile(join(pulse,'adaptive-shell-v4.js'),'utf8'),
  readFile(join(pulse,'mobile-v1.js'),'utf8'),
  readFile(join(pulse,'mobile-guided-v2.js'),'utf8'),
  readFile(join(pulse,'pulse-final-design-v1.js'),'utf8')
]);

const localAssets=[...html.matchAll(/(?:src|href)="\.\/([^"?#]+\.(?:js|css))(\?v=([^"#]+))?"/g)];
const assetVersions=localAssets.map(x=>x[3]||'');
const adaptiveCount=(html.match(/adaptive-shell-v4\.js/g)||[]).length;

const checks=[
  ['canonical release marker',html.includes(`<meta name="komo-pulse-release" content="${release}"`)],
  ['all local JS/CSS share one release',localAssets.length>20&&assetVersions.every(v=>v===release)],
  ['adaptive shell is the only phone/iPad shell runtime',adaptiveCount===1&&!html.includes('mobile-menu-v3.js')&&!html.includes('tablet-patient-v1.js')],
  ['retired shell CSS removed from bundle',!css.includes('/* FILE: mobile-menu-v3.css */')&&!css.includes('/* FILE: tablet-patient-v1.css */')],
  ['desktop shell remains available',css.includes('/* FILE: bottom-dock-v1.css */')],
  ['adaptive shell CSS remains available',css.includes('/* FILE: adaptive-shell-v4.css */')],
  ['adaptive shell keeps frozen patient labels',adaptive.includes("'Accueil'")&&adaptive.includes("'Tests'")&&adaptive.includes("'Résultats'")&&adaptive.includes("'Suivi'")],
  ['mobile utility no longer mutates account navigation',!mobile.includes('ensureExplorerInAccount')&&!mobile.includes('observe(document.body')],
  ['guided mobile layer is content-only',!guided.includes('ensureAccountTrigger')&&!guided.includes('ensureAccountHub')&&!guided.includes('mg-mobile-menu')&&!guided.includes('observe(document.body')],
  ['guided mobile layer no longer owns home',!guided.includes('enhanceHome')&&guided.includes('enhanceTests')],
  ['final design avoids body-wide observer',!design.includes('observe(document.body')&&design.includes("observe(root,{childList:true,subtree:true})")],
  ['session sync is event driven in final design',design.includes('if(sync)await window.KomoRuntime?.syncSession?.()')],
  ['My KŌMØ remains canonical home presentation',design.includes('kamo-home-result-removed')],
  ['canonical ownership note emitted',css.includes('/* Canonical Pulse shell ownership */')]
];

let failed=0;
for(const [label,ok] of checks){console.log(`[pulse-production-consolidation-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)process.exit(1);
console.log(`[pulse-production-consolidation-qa] ${checks.length} checks passed · ${localAssets.length} local assets locked to ${release}.`);
