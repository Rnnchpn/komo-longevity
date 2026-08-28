import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd(),pulse=join(root,'site','pulse-v12'),src=join(root,'pulse-app');
const htmlPath=join(pulse,'index.html'),cssPath=join(pulse,'pulse-ui-v1.css');
const release='20260828-canonical-4p7';
await copyFile(join(src,'tests-status-cockpit-v1.js'),join(pulse,'tests-status-cockpit-v1.js'));
let [html,css,cockpitCss,cockpitJs]=await Promise.all([
  readFile(htmlPath,'utf8'),readFile(cssPath,'utf8'),readFile(join(src,'tests-status-cockpit-v1.css'),'utf8'),readFile(join(src,'tests-status-cockpit-v1.js'),'utf8')
]);
html=html.replace(/\s*<script type="module" src="\.\/tests-status-cockpit-v1\.js(?:\?v=[^\"]+)?"><\/script>/g,'');
html=html.replace('</body>',`  <script type="module" src="./tests-status-cockpit-v1.js"></script>\n</body>`);
css=css.replace(/\n\/\* KŌMØ Tests status cockpit v1 \*\/[\s\S]*?(?=\n\/\* Canonical Pulse shell ownership \*\/|$)/,'');
const owner='\n/* KŌMØ Tests status cockpit v1 */\n'+cockpitCss+'\n';
const canonical=css.indexOf('/* Canonical Pulse shell ownership */');
css=canonical>=0?css.slice(0,canonical)+owner+css.slice(canonical):css+owner;
html=html.replace(/(src|href)="\.\/([^"?#]+\.(?:js|css))(?:\?v=[^"#]+)?"/g,(_,attr,file)=>`${attr}="./${file}?v=${release}"`);
html=html.replace(/<meta name="komo-pulse-release" content="[^"]+"\s*\/>/,`<meta name="komo-pulse-release" content="${release}" />`);
await Promise.all([writeFile(htmlPath,html),writeFile(cssPath,css)]);
const checks=[
 ['cockpit asset shipped',html.includes(`tests-status-cockpit-v1.js?v=${release}`)],
 ['canonical release bumped',html.includes(`komo-pulse-release" content="${release}`)],
 ['all local assets share release',[...html.matchAll(/(?:src|href)="\.\/[^"?#]+\.(?:js|css)\?v=([^"#]+)"/g)].every(x=>x[1]===release)],
 ['old progress block is replaced dynamically',cockpitJs.includes("document.querySelector('.tests-v1-progress-card')")&&cockpitJs.includes('old.replaceWith(node)')],
 ['next action is patient-state aware',cockpitJs.includes('PROCHAINE ÉTAPE')&&cockpitJs.includes('CONSULTATION VALIDÉE')&&cockpitJs.includes('VOS RÉSULTATS SONT DISPONIBLES')],
 ['Start Motion Clinical statuses exist',cockpitJs.includes("step('KŌMØ Start'")&&cockpitJs.includes("step('KŌMØ Motion'")&&cockpitJs.includes("step('KŌMØ Clinical'")],
 ['Agenda and preparation handoffs stay canonical',cockpitJs.includes("komo_booking_service")&&cockpitJs.includes("komo_open_preparation")&&cockpitJs.includes("location.hash='documents'")],
 ['cockpit visual system bundled',css.includes('KŌMØ Tests status cockpit v1')&&css.includes('.tests-v1-status-card')&&css.includes('.kts-steps')]
];
let failed=0;for(const [label,ok] of checks){console.log(`[pulse-tests-status-cockpit] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}if(failed)process.exit(1);
console.log(`[pulse-tests-status-cockpit] ${checks.length} checks passed · release ${release}.`);
