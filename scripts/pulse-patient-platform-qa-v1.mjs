import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd(),pulse=join(root,'site','pulse-v12');
const [html,css,app,adaptive,tests,score,therapy,booking,prep,publicPulse]=await Promise.all([
  readFile(join(pulse,'index.html'),'utf8'),readFile(join(pulse,'pulse-ui-v1.css'),'utf8'),readFile(join(pulse,'app.js'),'utf8'),readFile(join(pulse,'adaptive-shell-v4.js'),'utf8'),readFile(join(pulse,'patient-assessment-trio-v1.js'),'utf8'),readFile(join(pulse,'progression-v2.js'),'utf8'),readFile(join(pulse,'patient-v4.js'),'utf8'),readFile(join(pulse,'booking-layer-v1.js'),'utf8'),readFile(join(pulse,'patient-preparation-hub-v2.js'),'utf8'),readFile(join(root,'site','fr','pulse','index.html'),'utf8')
]);
const checks=[
 ['three assessment cards are loaded',html.includes('patient-assessment-trio-v1.js')&&tests.includes('KŌMØ Start')&&tests.includes('KŌMØ Motion')&&tests.includes('KŌMØ Clinical')],
 ['Tests no longer owns detailed results',!html.includes('free-result-v2.js')&&!html.includes('tests-score-trilogy-v1.js')&&!html.includes('results-motion-journey-v1.js')],
 ['Motion and Clinical cards model pending and validated states',tests.includes('Validation en attente')&&tests.includes('Votre consultation est validée, vous pouvez commencer les questionnaires pré-consultation.')],
 ['assessment cards link to main-site explanations',tests.includes('komolongevity.com/fr/pulse/?assessment=')],
 ['My Komo Score owns results route',score.includes("location.hash!=='#path'")&&score.includes('MY KŌMØ SCORE')&&score.includes("rpc('komo_score_benchmark'")],
 ['score page uses percentage rings and Me situer',score.includes('kms-ring')&&score.includes('ME SITUER')&&score.includes('percentile')],
 ['benchmark is privacy-threshold aware',score.includes('minimum')&&score.includes('Référence KŌMØ est en constitution')],
 ['Komo Therapy owns plan route',therapy.includes("location.hash!=='#plan'")&&therapy.includes('KŌMØ THERAPY')&&therapy.includes('PLAN DE SOINS')],
 ['therapy only shows validated priorities',therapy.includes("eq('validation_status','validated')")],
 ['Agenda et réseau label is used on mobile',adaptive.includes("actionButton('Agenda et réseau','patient:documents')")],
 ['mobile score and therapy labels are updated',adaptive.includes("'My KŌMØ Score'")&&adaptive.includes("'KŌMØ Therapy'")),
 ['desktop route labels are updated',app.includes("label: 'My KŌMØ Score'")&&app.includes("label: 'KŌMØ Therapy'")&&app.includes("label: 'Agenda et réseau'")),
 ['patient booking is presented as a request',booking.includes('Demande envoyée au centre')&&booking.includes('En attente de validation')],
 ['professional can approve pending consultation',booking.includes("rpc('approve_komo_appointment'")&&booking.includes('Valider la consultation')],
 ['pre-consultation excludes pending scheduled appointments',prep.includes(".in('status',['confirmed','arrived','in_progress'])")&&!prep.includes(".in('status',['scheduled','confirmed','arrived','in_progress'])")],
 ['validated card can open the right preparation',prep.includes('komo_open_preparation')&&tests.includes("sessionStorage.setItem('komo_open_preparation',type)")),
 ['public site explainer window exists',publicPulse.includes('KŌMØ assessment explainer v1')&&publicPulse.includes('komoAssessmentExplainer')],
 ['modern patient visual system is bundled',css.includes('KŌMØ Pulse patient platform v1')&&css.includes('.kpa-grid')&&css.includes('.kms-ring')&&css.includes('.kth-care-grid')]
];
let failed=0;for(const [label,ok] of checks){console.log(`[pulse-patient-platform-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}if(failed)process.exit(1);console.log(`[pulse-patient-platform-qa] ${checks.length} checks passed.`);
