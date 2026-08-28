import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd(),pulse=join(root,'site','pulse-v12'),src=join(root,'pulse-app');
const htmlPath=join(pulse,'index.html'),cssPath=join(pulse,'pulse-ui-v1.css'),proArchPath=join(pulse,'pro-architecture-v2.js'),myocarePath=join(pulse,'myocare-import-v1.js'),prepPath=join(pulse,'patient-preparation-hub-v2.js'),questionnairePath=join(pulse,'questionnaire-engine-v1.js');
const release='20260828-canonical-4p8';
await Promise.all([
  copyFile(join(src,'tests-status-cockpit-v1.js'),join(pulse,'tests-status-cockpit-v1.js')),
  copyFile(join(src,'pro-agenda-dossier-v1.js'),join(pulse,'pro-agenda-dossier-v1.js'))
]);
let [html,css,cockpitCss,cockpitJs,proCss,proJs,proArch,myocare,prep,questionnaire]=await Promise.all([
  readFile(htmlPath,'utf8'),readFile(cssPath,'utf8'),readFile(join(src,'tests-status-cockpit-v1.css'),'utf8'),readFile(join(src,'tests-status-cockpit-v1.js'),'utf8'),readFile(join(src,'pro-agenda-dossier-v1.css'),'utf8'),readFile(join(src,'pro-agenda-dossier-v1.js'),'utf8'),readFile(proArchPath,'utf8'),readFile(myocarePath,'utf8'),readFile(prepPath,'utf8'),readFile(questionnairePath,'utf8')
]);

// Patient Tests: replace the decorative progress card with a state-aware status cockpit.
html=html.replace(/\s*<script type="module" src="\.\/tests-status-cockpit-v1\.js(?:\?v=[^\"]+)?"><\/script>/g,'');
html=html.replace(/\s*<script type="module" src="\.\/pro-agenda-dossier-v1\.js(?:\?v=[^\"]+)?"><\/script>/g,'');
html=html.replace('</body>',`  <script type="module" src="./tests-status-cockpit-v1.js"></script>\n  <script type="module" src="./pro-agenda-dossier-v1.js"></script>\n</body>`);

// Professional Agenda is the canonical approval surface. No route/menu is added.
proArch=proArch.replace("window.KomoBooking?.deactivatePro?.();if(id==='dashboard')","window.KomoBooking?.deactivatePro?.();window.KomoProAgendaWorkflow?.deactivate?.();if(id==='dashboard')");
proArch=proArch.replace("else if(id==='planning')window.KomoBooking?.openProPlanning?.();","else if(id==='planning'){if(window.KomoProAgendaWorkflow?.open)window.KomoProAgendaWorkflow.open();else window.KomoBooking?.openProPlanning?.();}");
proArch=proArch.replace("if(s&&s.textContent!=='RDV')s.textContent='RDV';if(b.getAttribute('aria-label')!=='Rendez-vous')b.setAttribute('aria-label','Rendez-vous')","if(s&&s.textContent!=='Agenda et réseau')s.textContent='Agenda et réseau';if(b.getAttribute('aria-label')!=='Agenda et réseau')b.setAttribute('aria-label','Agenda et réseau')");
if(!proArch.includes('KomoProAgendaWorkflow?.open'))throw new Error('[pulse-4p8] pro Agenda ownership patch missing');
if(!proArch.includes("s.textContent='Agenda et réseau'"))throw new Error('[pulse-4p8] patient Agenda label can regress to RDV');
await writeFile(proArchPath,proArch);

// Real field-test imports belong to Motion v0.5, never the retired v0.4 default.
myocare=myocare.replace("PROTOCOL='motion-v0.4'","PROTOCOL='motion-v0.5'");
if(!myocare.includes("PROTOCOL='motion-v0.5'"))throw new Error('[pulse-4p8] MyoCare protocol default not v0.5');
await writeFile(myocarePath,myocare);

// Patient preparation is genuinely post-validation. The RPC returns a JSON contract,
// therefore progress must read assessmentId rather than treating the whole object as a UUID.
const prepOld="if(motion){const e=await c.rpc('ensure_motion_appointment_episode',{p_appointment_id:motion.id});if(!e.error){const qs=await c.from('questionnaire_sessions').select('instrument_code,status,completeness').eq('assessment_id',e.data).in('instrument_code',BASE);";
const prepNew="if(motion){const e=await c.rpc('ensure_motion_appointment_episode',{p_appointment_id:motion.id});const assessmentId=e.data?.assessmentId||e.data?.assessment_id||e.data;if(!e.error&&assessmentId){const qs=await c.from('questionnaire_sessions').select('instrument_code,status,completeness').eq('assessment_id',assessmentId).in('instrument_code',BASE);";
if(!prep.includes(prepOld))throw new Error('[pulse-4p8] Motion preparation RPC contract changed');
prep=prep.replace(prepOld,prepNew);
if(prep.includes(".in('status',['scheduled','confirmed','arrived','in_progress'])"))throw new Error('[pulse-4p8] pending appointment still exposed to patient preparation');
if(!prep.includes(".in('status',['confirmed','arrived','in_progress'])"))throw new Error('[pulse-4p8] validated preparation status contract missing');
await writeFile(prepPath,prep);

// The questionnaire engine itself also gates Motion preparation. Booking creates the
// episode early for continuity, but the patient may only select it after center validation.
const loadRx=/async function loadPatientAssessment\(\)\{[\s\S]*?\}\nasync function loadRegistry/;
if(!loadRx.test(questionnaire))throw new Error('[pulse-4p8] questionnaire assessment loader contract changed');
const gatedLoader=`async function loadPatientAssessment(){S.patient=null;S.assessment=null;if(!S.session?.user)return;const p=await sb().from('patients').select('id,birth_date,organization_id,first_name,last_name,created_at').eq('patient_user_id',S.session.user.id).order('created_at',{ascending:false});if(p.error)throw p.error;const patients=p.data||[];if(!patients.length)return;const ids=patients.map(x=>x.id);const ap=await sb().from('organization_appointments').select('patient_id,scheduled_start,status').in('patient_id',ids).eq('appointment_type','motion').in('status',['confirmed','arrived','in_progress']).gte('scheduled_start',new Date(Date.now()-3600000).toISOString()).order('scheduled_start',{ascending:true});if(ap.error)throw ap.error;const allowed=ap.data||[];if(!allowed.length){S.patient=patients[0];return}const a=await sb().from('assessments').select('id,patient_id,status,protocol_version,created_at,started_at,scheduled_at').in('patient_id',ids).eq('product_mode','motion').order('created_at',{ascending:false});if(a.error)throw a.error;const preferred=allowed[0];S.assessment=(a.data||[]).find(x=>x.patient_id===preferred.patient_id&&x.scheduled_at&&Math.abs(new Date(x.scheduled_at).getTime()-new Date(preferred.scheduled_start).getTime())<60000)||(a.data||[]).find(x=>x.patient_id===preferred.patient_id)||null;S.patient=patients.find(x=>x.id===(S.assessment?.patient_id||preferred.patient_id))||patients[0]}\nasync function loadRegistry`;
questionnaire=questionnaire.replace(loadRx,gatedLoader);
questionnaire=questionnaire.replace('Votre dossier patient est créé. Le pré-bilan s’ouvrira dès qu’un épisode Motion sera associé à votre rendez-vous.','Votre demande Motion doit d’abord être validée par le centre. Les questionnaires pré-consultation s’ouvriront ensuite automatiquement.');
questionnaire=questionnaire.replace("button='Choisir mon rendez-vous'","button='Voir ma demande'");
if(!questionnaire.includes(".eq('appointment_type','motion').in('status',['confirmed','arrived','in_progress'])"))throw new Error('[pulse-4p8] questionnaire engine validation gate missing');
await writeFile(questionnairePath,questionnaire);

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
 ['patient Agenda label cannot fall back to RDV',proArch.includes("s.textContent='Agenda et réseau'")&&!proArch.includes("s.textContent='RDV'" )],
 ['pro Agenda is canonical planning owner',proArch.includes('KomoProAgendaWorkflow?.open')&&proJs.includes('AGENDA · VALIDATION DES DEMANDES')],
 ['pending appointment has explicit validation switch',proJs.includes('En attente de validation')&&proJs.includes('data-kpad-approve')&&proJs.includes("rpc('approve_komo_appointment'" )],
 ['patient dossier opens from Agenda and Patients',proJs.includes('KomoProPatientDossier')&&proJs.includes('[data-kfollow-open]')&&proJs.includes('#kcpPatientsBody tr[data-patient]')],
 ['patient Start results are visible to professional',proJs.includes('KŌMØ Check')&&proJs.includes('Chair Stand')&&proJs.includes('Two-Step')],
 ['pre-consultation six sections are visible',proJs.includes('PRÉ-CONSULTATION MOTION')&&proJs.includes('/6 sections complétées')],
 ['patient prep only sees validated appointments',prep.includes(".in('status',['confirmed','arrived','in_progress'])")&&!prep.includes(".in('status',['scheduled','confirmed','arrived','in_progress'])")],
 ['patient prep reads assessmentId from RPC contract',prep.includes('e.data?.assessmentId')&&prep.includes(".eq('assessment_id',assessmentId)" )],
 ['questionnaire engine independently enforces validation',questionnaire.includes(".eq('appointment_type','motion').in('status',['confirmed','arrived','in_progress'])")&&questionnaire.includes('scheduled_at')],
 ['SVA is saved through protected RPC',proJs.includes("rpc('save_komo_motion_sva'")&&proJs.includes('POSTURE · SVA')],
 ['MyoCare Excel importer mounts inside dossier',proJs.includes('id="clmImporter"')&&proJs.includes("komo:clinical-motion-render")],
 ['MyoCare default protocol is v0.5',myocare.includes("PROTOCOL='motion-v0.5'")&&!myocare.includes("PROTOCOL='motion-v0.4'" )],
 ['visual systems bundled',css.includes('KŌMØ Tests status cockpit v1')&&css.includes('.tests-v1-status-card')&&css.includes('KŌMØ Pro agenda dossier v1')&&css.includes('.kpad-drawer')]
];
let failed=0;for(const [label,ok] of checks){console.log(`[pulse-4p8] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}if(failed)process.exit(1);
console.log(`[pulse-4p8] ${checks.length} checks passed · slide-contract release ${release}.`);
