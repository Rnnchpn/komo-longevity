import fs from 'node:fs';
import path from 'node:path';

const pulse=path.join(process.cwd(),'site','pulse-v12');
const indexPath=path.join(pulse,'index.html');
const bookingPath=path.join(pulse,'booking-layer-v1.js');
const centerPath=path.join(pulse,'center-two-tab-workspace-v1.js');
const appPath=path.join(pulse,'app-router-v2.js');
for(const file of [indexPath,bookingPath,centerPath,appPath])if(!fs.existsSync(file))throw new Error('[consultation-final-qa] missing '+file);

const html=fs.readFileSync(indexPath,'utf8');
const booking=fs.readFileSync(bookingPath,'utf8');
const center=fs.readFileSync(centerPath,'utf8');
const app=fs.readFileSync(appPath,'utf8');

const retired=[
  'agenda-hub-v4.js',
  'agenda-premium-map-v1.js',
  'pro-agenda-dossier-v1.js',
  'booking-directory-map-v1.js',
  'agenda-hub-v4.css',
  'agenda-premium-map-v1.css',
  'booking-directory-map-v1.css'
];
for(const file of retired)if(html.includes(file))throw new Error('[consultation-final-qa] legacy asset still loaded: '+file);

const checks=[
  ['patient consultation owner',booking.includes('Votre consultation Motion est prête.')],
  ['patient start CTA',booking.includes('Débuter consultation Motion')],
  ['six questionnaire labels visible before start',booking.includes('Profil & sécurité')&&booking.includes('GLFS-25')&&booking.includes('Sommeil & récupération')&&booking.includes('Bien-être')&&booking.includes('Mode de vie')&&booking.includes('Antécédents')],
  ['assigned assessment opens questionnaire engine',booking.includes('KomoQuestionnaireEngine')&&booking.includes('openAssessment(id)')],
  ['patient assigned consultation RPC',booking.includes('komo_my_motion_consultations')],
  ['patient mode follows active workspace instead of account role',booking.includes('function patientMode()')],
  ['consultation cache is session scoped',booking.includes("PATIENT_CACHE='komo_consultations_cache_v1'")&&booking.includes('sessionStorage.setItem(patientCacheKey')],
  ['consultation requests are deduplicated',booking.includes('patientLoadPromise')],
  ['role and consultation data load in parallel',booking.includes('const [roleRes,q]=await Promise.all')],
  ['no delayed patient boot',!booking.includes('setTimeout(refresh,900)')&&!booking.includes('setTimeout(refresh,1400)')&&!booking.includes('setTimeout(refresh,120)')],
  ['compact consultation sync state',booking.includes('kbook-sync-dot')],
  ['no patient map shell',!booking.includes('data-kbd-shell')],
  ['no weekly agenda callback',!booking.includes('loadProWeek')],
  ['no weekly planning renderer',!booking.includes('Planning hebdomadaire')],
  ['no calendar grid renderer',!booking.includes('kbook-calendar')],
  ['documents route gets instant consultation shell',app.includes('data-kbook-prime')],
  ['blocking grey loader is not used for documents',app.includes("if(route==='documents')")&&app.includes("source:'instant-consultation-shell'")],
  ['authenticated instant route before full data hydration',app.includes("const instant=['home','documents'" )],
  ['consultation loading CSS is present',html.includes('id="kpConsultationLoadV1"')],
  ['final Motion consultation CSS is present',html.includes('id="kpMotionConsultationFinalV1"')],
  ['Centre title is Myodev',center.includes("textContent='Myodev'")],
  ['Centre assignment CTA',center.includes('Attribuer consultation')],
  ['professional assignment RPC',center.includes('komo_assign_motion_consultation')],
  ['Centre has no mutation observer render loop',!center.includes('new MutationObserver')],
  ['Centre navigation writes are idempotent',center.includes("nav.dataset.k2twOwner==='consultations'")],
  ['Centre dashboard requests are deduplicated',center.includes('rowsLoadPromise')],
  ['Centre activation is guarded',center.includes('activating=true')],
  ['Centre resynchronizes after cockpit shell',center.includes('komo:clinical-cockpit-ready')],
  ['legacy cockpit chrome is hidden in Centre consultation mode',center.includes('.kcp-head,body.komo-pro-mode .kcp-tabs')]
];
for(const [label,ok] of checks)if(!ok)throw new Error('[consultation-final-qa] failed: '+label);
console.log('[consultation-final-qa] PASS · Centre Myodev → patient assignment → Débuter consultation Motion → questionnaires');
