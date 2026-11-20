import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root=process.cwd();
const html=await readFile(join(root,'site','pulse-v14','index.html'),'utf8');
const app=await readFile(join(root,'site','pulse-v14','app.js'),'utf8');
const css=await readFile(join(root,'site','pulse-v14','styles.css'),'utf8');
const luxuryCss=await readFile(join(root,'site','pulse-v14','pulse-quiet-luxury-v2.css'),'utf8');
const mobileCss=await readFile(join(root,'site','pulse-v14','pulse-mobile-first-v3.css'),'utf8');
const editorialCss=await readFile(join(root,'site','pulse-v14','pulse-patient-editorial-v1.css'),'utf8');
const maisonCss=await readFile(join(root,'site','pulse-v14','maison-entry-v1.css'),'utf8');
const maisonJs=await readFile(join(root,'site','pulse-v14','maison-entry-v1.js'),'utf8');
const maisonSyntax=spawnSync(process.execPath,['--check',join(root,'site','pulse-v14','maison-entry-v1.js')],{encoding:'utf8'});
const poseEngine=await readFile(join(root,'site','pulse-v14','motion-engine','pose-engine.js'),'utf8');
const metrics=await readFile(join(root,'site','pulse-v14','motion-engine','metrics.mjs'),'utf8');
const voiceControl=await readFile(join(root,'site','pulse-v14','motion-engine','voice-control.js'),'utf8');
const voiceCommands=await readFile(join(root,'site','pulse-v14','motion-engine','voice-commands.mjs'),'utf8');
const intakeModel=await readFile(join(root,'site','pulse-v14','motion-engine','intake-model.mjs'),'utf8');
const audioFeedback=await readFile(join(root,'site','pulse-v14','motion-engine','audio-feedback.js'),'utf8');
const profileGeometry=await readFile(join(root,'site','pulse-v14','motion-engine','profile-photo-metrics.mjs'),'utf8');
const unipodalGeometry=await readFile(join(root,'site','pulse-v14','motion-engine','unipodal-metrics.mjs'),'utf8');
const vercel=JSON.parse(await readFile(join(root,'vercel.json'),'utf8'));
const middleware=await readFile(join(root,'middleware.js'),'utf8');
const appSyntax=spawnSync(process.execPath,['--check',join(root,'site','pulse-v14','app.js')],{encoding:'utf8'});
const rewrites=Array.isArray(vercel.rewrites)?vercel.rewrites:[];
const hostRule=r=>Array.isArray(r?.has)&&r.has.some(h=>h?.type==='host'&&h?.value==='pulse.komolongevity.com');
const rootV14=rewrites.some(r=>r.source==='/'&&r.destination==='/pulse-v14/'&&hostRule(r));
const nestedV14=rewrites.some(r=>r.source==='/(.*)'&&r.destination==='/pulse-v14/$1'&&hostRule(r));

const checks=[
 ['mobile booking bar does not overlay login',mobileCss.includes('.pulse-entry-panel:not([hidden])')&&app.includes('entry.hidden=visible')],
 ['iPhone safe area and touchscreen destinations',mobileCss.includes('safe-area-inset-bottom')&&mobileCss.includes('repeat(5,minmax(0,1fr))')&&mobileCss.includes('min-height:54px')],
 ['mobile signed-in account controls and ARIA nav',app.includes("pulse-mobile-logout")&&app.includes("$('#pulse-mobile-logout').onclick=$('#logout').onclick")&&app.includes('aria-current=')],

 ['quiet luxury stylesheet loaded after canonical CSS',html.indexOf('pulse-quiet-luxury-v2.css')>html.indexOf('styles.css')],
 ['quiet luxury palette and font family',luxuryCss.includes('#171718')&&luxuryCss.includes('#B89B6A')&&html.includes('Cormorant+Garamond')&&html.includes('Inter:wght@')],
 ['two consultation places, no remote offer',['Clinique HIRO','Maison Epigenetic'].every(x=>app.includes(x)&&maisonJs.includes(x))&&!/Motion Online|39 €|bilan-en-ligne/.test(app+maisonJs)&&!app.includes('Bilan Gratuit')],
 ['luxury motion art',app.includes('pulse-entry-kinetic')&&app.includes('pulse-offer-art-ring')],
 ['premium onboarding',app.includes('pulse-entry-monogram')&&app.includes('pulse-entry-steps')],
 ['luxury motion animations',css.includes('pulseSculptureFloat')&&css.includes('pulseCardReveal')&&css.includes('pulseTimelineGrow')],
 ['accessible reduced motion',css.includes('@media(prefers-reduced-motion:reduce)')],
 ['pulse javascript syntax',appSyntax.status===0],
 ['onsite request promise precise',app.includes('Une demande de créneau ne vaut pas réservation')&&maisonJs.includes('reserver-motion-cannes')],
 ['existing login preserved',app.includes('pulseShowLogin')&&app.includes('signInWithPassword')],
 ['admin patient mode uses only own linked records',app.includes('S.ownPatients=own.filter(p=>p.patient_user_id===S.user.id)')&&app.includes('loadPatientContext(S.ownPatient)')&&app.includes("S.mode=saved==='patient'&&Boolean(S.ownPatient)?'patient':'pro'")],
 ['patient/team switch remains accessible',app.includes('p-team-link')&&app.includes("localStorage.setItem('komo_v14_mode','pro')")&&app.includes('history.replaceState(null,')],
 ['tester sidebar available only by verified role',app.includes('const isOnlineTester=')&&app.includes('S.role===\'admin\'')&&!app.includes('pulse-online-tester-link')],


 ['booking-first responsive styles',css.includes('.pulse-offer-list')&&css.includes('.pulse-entry-panel')],
 ['patient title',html.includes('Votre santé en mouvement')],
 ['Maison choice and login script validates',maisonSyntax.status===0&&maisonJs.includes('data-maison-choice="hiro"')&&maisonJs.includes('data-maison-choice="cannes"')&&maisonJs.includes('id="maisonChooseMotion"')&&maisonJs.includes('sessionStorage')&&maisonCss.includes('.maison-choice')],
 ['consultation console reads the standard protocol',app.includes("from './motion-protocol.mjs")&&app.includes('PROTOCOL_STEPS')&&app.includes("start_pulse_operator_session_v1")&&app.includes("['operator','Consultation Motion']")],
 ['canonical app plus isolated Maison patient entry',(html.match(/<script/g)||[]).length===2&&html.includes('src="./maison-entry-v1.js')&&html.includes('src="./app.js')],
 ['approved patient stylesheet loaded after mobile overrides',html.indexOf('pulse-patient-editorial-v1.css')>html.indexOf('pulse-mobile-first-v3.css')],

 ['existing profile photo restored from private user storage',app.includes("avatar_config?.mode==='photo'")&&app.includes("storage.from('profile-avatars').createSignedUrl(path,3600)")&&app.includes('p-account-avatar')&&app.includes('p-overview-photo')],
 ['authenticated photo is visible on desktop and mobile',editorialCss.includes('.p-overview-photo img')&&editorialCss.includes('.p-greeting-photo img')&&editorialCss.includes('@media(max-width:800px)')],
 ['no generic marketing welcome slogans',!app.includes('Vos rendez-vous et votre bilan, au même endroit. Rien de plus.')&&!app.includes('Une étape<br>à la fois.')&&!app.includes('La bonne information, au moment où elle est utile.')],
 ['approved one-page patient design',app.includes("const PATIENT_NAV=[['home','Mon espace']]")&&app.includes('function patientHome(){')&&app.includes('p-overview')&&app.includes('p-two-cards')&&app.includes('p-topbar')&&editorialCss.includes('#F5F6F6')],
 ['appointment is actually future, not stale demo',app.includes('const upcoming=chronological.find')&&app.includes('const appointment=inProgress||upcoming')&&app.includes('Aucun rendez-vous à venir')&&!app.includes('appt=next||ordered.at(-1)')],
 ['optional one-page actions and content',app.includes('id="p-preparation"')&&app.includes('id="p-result"')&&app.includes('id="p-history"')&&app.includes('data-p-open="preparation"')],
 ['released scores shown only after actual publication',app.includes("overall_score!==null")&&app.includes('const published=releasedScore()')&&app.includes('const resultTitle=published?')],
 ['patient shell excludes sidebar entirely',app.includes("if(S.mode==='patient'){")&&app.includes('p-editorial')&&app.includes('p-topbar')&&app.includes('return;')&&editorialCss.includes('@media(max-width:520px)')],
 ['legacy patient routes return to the single home',app.includes("history.replaceState(null,'',location.pathname+location.search+'#home')")],
 ['motion v1 only',app.includes("motion-v1.0")&&!/myodev|myocare/i.test(app)],
 ['responsive',css.includes('@media(max-width:700px)')&&css.includes('@media(max-width:1000px)')],
 ['reduced motion',css.includes('prefers-reduced-motion')],
 ['canonical root is V14',rootV14],
 ['canonical nested routes are V14',nestedV14],
 ['middleware points to V14',middleware.includes("[PULSE_HOST]: { prefix: '/pulse-v14'")]
];
const failed=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('[pulse-v14-qa] failed: '+failed.join(', '));process.exit(1)}
console.log('[pulse-v14-qa] '+checks.length+' patient-first checks passed');
