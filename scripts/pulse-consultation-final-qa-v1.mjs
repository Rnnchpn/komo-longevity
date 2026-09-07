import fs from 'node:fs';
import path from 'node:path';

const pulse=path.join(process.cwd(),'site','pulse-v12');
const indexPath=path.join(pulse,'index.html');
const bookingPath=path.join(pulse,'booking-layer-v1.js');
const centerPath=path.join(pulse,'center-two-tab-workspace-v1.js');
const appPath=path.join(pulse,'app-router-v2.js');
const dockPath=path.join(pulse,'pulse-bottom-nav-v6.js');
const myKomoPath=path.join(pulse,'my-komo-stable-v5.js');
const worldPath=path.join(process.cwd(),'site','world','index.html');
for(const file of [indexPath,bookingPath,centerPath,appPath,dockPath,myKomoPath,worldPath])if(!fs.existsSync(file))throw new Error('[consultation-final-qa] missing '+file);

const html=fs.readFileSync(indexPath,'utf8');
const booking=fs.readFileSync(bookingPath,'utf8');
const center=fs.readFileSync(centerPath,'utf8');
const app=fs.readFileSync(appPath,'utf8');
const dock=fs.readFileSync(dockPath,'utf8');
const mykomo=fs.readFileSync(myKomoPath,'utf8');
const world=fs.readFileSync(worldPath,'utf8');

const retired=[
  'agenda-hub-v4.js','agenda-premium-map-v1.js','pro-agenda-dossier-v1.js','booking-directory-map-v1.js',
  'agenda-hub-v4.css','agenda-premium-map-v1.css','booking-directory-map-v1.css','center-patient-links.js',
  'center-context-v1.js','center-command-cockpit-v2.js','center-profile-v1.js','center-workspace-v1.js',
  'center-messaging-v1.js','center-patient-polish.js','center-owner-ui-guard-v1.js','center-patient-links.css',
  'center-context-v1.css','center-command-cockpit-v2.css','center-profile-v1.css','center-workspace-v1.css',
  'center-messaging-v1.css','center-patient-polish.css','center-owner-ui-guard-v1.css','account-tab-restore-v1.js'
];
for(const file of retired)if(html.includes(file))throw new Error('[consultation-final-qa] legacy asset still loaded: '+file);

const checks=[
  ['patient consultation owner',booking.includes('Votre consultation Motion est prête.')],
  ['patient card opens complete consultation',booking.includes('Ouvrir ma consultation')&&booking.includes('komo_my_motion_consultation_detail')],
  ['patient detail displays six questionnaire results',booking.includes('Votre consultation complète.')&&booking.includes('6/6 terminés')&&booking.includes('patientDetailProgress')],
  ['patient can reopen questionnaire engine',booking.includes('KomoQuestionnaireEngine')&&booking.includes('openAssessment(id)')&&booking.includes('Relire mes questionnaires')],
  ['patient assigned consultation RPC',booking.includes('komo_my_motion_consultations')],
  ['six questionnaire labels visible',booking.includes('Profil & sécurité')&&booking.includes('GLFS-25')&&booking.includes('Sommeil & récupération')&&booking.includes('Bien-être')&&booking.includes('Mode de vie')&&booking.includes('Antécédents')],
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
  ['canonical Centre runtime remains loaded',html.includes('center-two-tab-workspace-v1.js')],
  ['Centre title is Myodev',center.includes("textContent='Myodev'")],
  ['Centre assignment CTA',center.includes('Attribuer consultation')],
  ['professional assignment RPC',center.includes('komo_assign_motion_consultation')],
  ['professional consultation detail RPC',center.includes('komo_professional_motion_consultation')],
  ['professional readiness reads six questionnaire sessions',center.includes('x.pre_bilan')&&center.includes('6/6 · Complet')],
  ['Motion acquisition CTA appears only after readiness',center.includes('Charger analyse Motion')&&center.includes('Le patient doit terminer les 6 questionnaires')],
  ['Centre patient search remains interactive',center.includes("addEventListener('input'")&&center.includes('setSelectionRange(pos,pos)')],
  ['Centre readable light-surface contrast',html.includes('body.komo-pro-mode #kcpView .k2tw-patients')&&html.includes('-webkit-text-fill-color:#18241d!important')],
  ['Centre has no mutation observer render loop',!center.includes('new MutationObserver')],
  ['Centre navigation writes are idempotent',center.includes("nav.dataset.k2twOwner==='consultations'")],
  ['Centre dashboard requests are deduplicated',center.includes('rowsLoadPromise')],
  ['Centre activation is guarded',center.includes('activating=true')],
  ['Centre resynchronizes after cockpit shell',center.includes('komo:clinical-cockpit-ready')],
  ['legacy cockpit chrome is hidden in Centre consultation mode',center.includes('.kcp-head,body.komo-pro-mode .kcp-tabs')],
  ['patient dock keeps five canonical destinations',dock.includes("['home','Home'")&&dock.includes("['results','Résultats'")&&dock.includes("['key','Connected'")&&dock.includes("['agenda','Consultations & rendez-vous'")&&dock.includes("['mykomo','My KŌMØ'")],
  ['account is not a patient dock destination',!dock.includes("['account'")&&!html.includes('account-tab-restore-v1.js')],
  ['KŌMØ World visible in My KŌMØ',mykomo.includes('data-mkv5-world')&&mykomo.includes('KŌMØ World')],
  ['KŌMØ World canonical entry targets v0.13.5',world.includes('./v135/')],
  ['single consultation runtime owner',!html.includes('pro-agenda-dossier-v1.js')&&!html.includes('booking-directory-map-v1.js')],
  ['single Centre runtime owner',html.includes('center-two-tab-workspace-v1.js')&&!html.includes('center-workspace-v1.js')&&!html.includes('center-command-cockpit-v2.js')]
];
for(const [label,ok] of checks)if(!ok)throw new Error('[consultation-final-qa] failed: '+label);
console.log('[consultation-final-qa] PASS · full consultation detail · 6/6 Motion handoff · KŌMØ World · single runtime owners');
