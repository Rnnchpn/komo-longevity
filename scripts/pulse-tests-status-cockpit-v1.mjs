import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd(),pulse=join(root,'site','pulse-v12'),src=join(root,'pulse-app');
const htmlPath=join(pulse,'index.html'),cssPath=join(pulse,'pulse-ui-v1.css'),proArchPath=join(pulse,'pro-architecture-v2.js'),myocarePath=join(pulse,'myocare-import-v1.js');
const release='20260828-canonical-4p7';
await Promise.all([
  copyFile(join(src,'tests-status-cockpit-v1.js'),join(pulse,'tests-status-cockpit-v1.js')),
  copyFile(join(src,'pro-agenda-dossier-v1.js'),join(pulse,'pro-agenda-dossier-v1.js'))
]);
let [html,css,cockpitCss,cockpitJs,proCss,proJs,proArch,myocare]=await Promise.all([
  readFile(htmlPath,'utf8'),readFile(cssPath,'utf8'),readFile(join(src,'tests-status-cockpit-v1.css'),'utf8'),readFile(join(src,'tests-status-cockpit-v1.js'),'utf8'),readFile(join(src,'pro-agenda-dossier-v1.css'),'utf8'),readFile(join(src,'pro-agenda-dossier-v1.js'),'utf8'),readFile(proArchPath,'utf8'),readFile(myocarePath,'utf8')
]);

// Patient Tests: replace the decorative progress card with a state-aware status cockpit.
html=html.replace(/\s*<script type="module" src="\.\/tests-status-cockpit-v1\.js(?:\?v=[^\"]+)?"><\/script>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/pro-agenda-dossier-v1\.js(?:\?v=[^\"]+)?"><\/script>/g,'');
html=html.replace('</body>',`  <script type="module" src="./tests-status-cockpit-v1.js"></script>\n  <script type="module" src="./pro-agenda-dossier-v1.js"></script>\n</body>`);

// Professional Agenda becomes the canonical approval surface. No new route/menu is created.
proArch=proArch.replace("window.KomoBooking?.deactivatePro?.();if(id==='dashboard')","window.KomoBooking?.deactivatePro?.();window.KomoProAgendaWorkflow?.deactivate?.();if(id==='dashboard')");
proArch=proArch.replace("else if(id==='planning')window.KomoBooking?.openProPlanning?.();","else if(id==='planning'){if(window.KomoProAgendaWorkflow?.open)window.KomoProAgendaWorkflow.open();else window.KomoBooking?.openProPlanning?.();}");
if(!proArch.includes('KomoProAgendaWorkflow?.open'))throw new Error('[pulse-4p7] pro Agenda ownership patch missing');
await writeFile(proArchPath,proArch);

// Real field-test imports belong to Motion v0.5, never the retired v0.4 default.
myocare=myocare.replace("PROTOCOL='motion-v0.4'","PROTOCOL='motion-v0.5'");
if(!myocare.includes("PROTOCOL='motion-v0.5'"))throw new Error('[pulse-4p7] MyoCare protocol default not v0.5');
await writeFile(myocarePath,myocare);

// Bundle both visual systems before the canonical shell guard.
css=css.replace(/\n\/\* KŌMØ Tests status cockpit v1 \*\/[\s\S]*?(?=\n\/\* KŌMØ Pro agenda dossier v1 \*\/|\n\/\* Canonical Pulse shell ownership \*\/|$)/,'');
css=css.replace(/\n\/\* KŌMØ Pro agenda dossier v1 \*\/[\s\S]*?(?=\n\/\* Canonical Pulse shell ownership \*\/|$)/,'');
const owner=`\n/* KŌMØ Tests status cockpit v1 */\n${cockpitCss}\n/* KŌMØ Pro agenda dossier v1 */\n${proCss}\n`;
const canonical=css.indexOf('/* Canonical Pulse shell ownership */');
css=canonical>=0?css.slice(0,canonical)+owner+css.slice(canonical):css+owner;

// One release token avoids mixed caches across phone, tablet and desktop.
html=html.replace(/(src|href)="\.\/([^"?#]+\.(?:js|css))(?:\?v=[^"#]+)?"/g,(_,attr,file)=>`${attr}="./${file}?v=${release}"`);
html=html.replace(/<meta name="komo-pulse-release" content="[^"]+"\s*\/>/,`<meta name="komo-pulse-release" content="${release}" />`);
await Promise.all([writeFile(htmlPath,html),writeFile(cssPath,css)]);

const checks=[
 ['test cockpit asset shipped',html.includes(`tests-status-cockpit-v1.js?v=${release}`)],
 ['professional workflow asset shipped',html.includes(`pro-agenda-dossier-v1.js?v=${release}`)],
 ['canonical release bumped',html.includes(`komo-pulse-release" content="${release}`)],
 ['all local assets share release',[...html.matchAll(/(?:src|href)="\.\/[^"?#]+\.(?:js|css)\?v=([^"#]+)"/g)].every(x=>x[1]===release)],
 ['old progress block is replaced dynamically',cockpitJs.includes("document.querySelector('.tests-v1-progress-card')")&&cockpitJs.includes('old.replaceWith(node)')],
 ['next action is patient-state aware',cockpitJs.includes('PROCHAINE ÉTAPE')&&cockpitJs.includes('CONSULTATION VALIDÉE')&&cockpitJs.includes('VOS RÉSULTATS SONT DISPONIBLES')],
 ['Start Motion Clinical statuses exist',cockpitJs.includes("step('KŌMØ Start'")&&cockpitJs.includes("step('KŌMØ Motion'")&&cockpitJs.includes("step('KŌMØ Clinical'")],
 ['Agenda and preparation handoffs stay canonical',cockpitJs.includes('komo_booking_service')&&cockpitJs.includes('komo_open_preparation')&&cockpitJs.includes("location.hash='documents'")],
 ['pro Agenda is canonical planning owner',proArch.includes('KomoProAgendaWorkflow?.open')&&proJs.includes('AGENDA · VALIDATION DES DEMANDES')],
 ['pending appointment has explicit validation switch',proJs.includes('En attente de validation')&&proJs.includes('data-kpad-approve')&&proJs.includes("rpc('approve_komo_appointment'" )],
 ['patient dossier opens from Agenda and Patients',proJs.includes('KomoProPatientDossier')&&proJs.includes('[data-kfollow-open]')&&proJs.includes('#kcpPatientsBody tr[data-patient]')],
 ['patient Start results are visible to professional',proJs.includes('KŌMØ Check')&&proJs.includes('Chair Stand')&&proJs.includes('Two-Step')],
 ['pre-consultation six sections are visible',proJs.includes('PRÉ-CONSULTATION MOTION')&&proJs.includes('/6 sections complétées')],
 ['SVA is saved through protected RPC',proJs.includes("rpc('save_komo_motion_sva'")&&proJs.includes('POSTURE · SVA')],
 ['MyoCare Excel importer mounts inside dossier',proJs.includes('id="clmImporter"')&&proJs.includes("komo:clinical-motion-render")],
 ['MyoCare default protocol is v0.5',myocare.includes("PROTOCOL='motion-v0.5'")&&!myocare.includes("PROTOCOL='motion-v0.4'" )],
 ['visual systems bundled',css.includes('KŌMØ Tests status cockpit v1')&&css.includes('.tests-v1-status-card')&&css.includes('KŌMØ Pro agenda dossier v1')&&css.includes('.kpad-drawer')]
];
let failed=0;for(const [label,ok] of checks){console.log(`[pulse-4p7] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}if(failed)process.exit(1);
console.log(`[pulse-4p7] ${checks.length} checks passed · release ${release}.`);
