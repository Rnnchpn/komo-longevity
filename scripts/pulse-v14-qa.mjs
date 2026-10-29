import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root=process.cwd();
const html=await readFile(join(root,'site','pulse-v14','index.html'),'utf8');
const app=await readFile(join(root,'site','pulse-v14','app.js'),'utf8');
const css=await readFile(join(root,'site','pulse-v14','styles.css'),'utf8');
const onlineHtml=await readFile(join(root,'site','pulse-v14','online','index.html'),'utf8');
const onlineScript=await readFile(join(root,'site','pulse-v14','online','app.js'),'utf8');
const onlineCss=await readFile(join(root,'site','pulse-v14','online','styles.css'),'utf8');
const onlineSyntax=spawnSync(process.execPath,['--check',join(root,'site','pulse-v14','online','app.js')],{encoding:'utf8'});
const vercel=JSON.parse(await readFile(join(root,'vercel.json'),'utf8'));
const middleware=await readFile(join(root,'middleware.js'),'utf8');
const appSyntax=spawnSync(process.execPath,['--check',join(root,'site','pulse-v14','app.js')],{encoding:'utf8'});
const rewrites=Array.isArray(vercel.rewrites)?vercel.rewrites:[];
const hostRule=r=>Array.isArray(r?.has)&&r.has.some(h=>h?.type==='host'&&h?.value==='pulse.komolongevity.com');
const rootV14=rewrites.some(r=>r.source==='/'&&r.destination==='/pulse-v14/'&&hostRule(r));
const nestedV14=rewrites.some(r=>r.source==='/(.*)'&&r.destination==='/pulse-v14/$1'&&hostRule(r));

const checks=[
 ['booking-first cards',['Bilan Gratuit','Bilan Online','Bilan physique Motion'].every(x=>app.includes(x))],
 ['luxury motion art',app.includes('pulse-entry-kinetic')&&app.includes('pulse-offer-art-ring')],
 ['premium onboarding',app.includes('pulse-entry-monogram')&&app.includes('pulse-entry-steps')],
 ['luxury motion animations',css.includes('pulseSculptureFloat')&&css.includes('pulseCardReveal')&&css.includes('pulseTimelineGrow')],
 ['accessible reduced motion',css.includes('@media(prefers-reduced-motion:reduce)')],
 ['pulse javascript syntax',appSyntax.status===0],
 ['acuity public scheduling',app.includes('app.acuityscheduling.com/schedule.php?owner=40696577')],
 ['booking promise verified',app.includes('La réservation ne crée pas automatiquement de compte Pulse')&&app.includes('Choisir mon bilan et réserver')],
 ['free clearly upcoming; online bookable',app.includes('Découverte · réservation à venir')&&!app.includes('En ligne · réservation à venir')&&app.includes('30 min · 49 € · réserver en ligne')],
 ['Acuity Online type 99940918 deep link',app.includes('owner=40696577&appointmentType=99940918')],
 ['direct online link on card and panel',app.includes('href:onlineBookingUrl,tone:\'online\'')&&app.includes('class="pulse-entry-online-shortcut" href="${onlineBookingUrl}"')],
 ['online booking shortcut styled',css.includes('.pulse-entry-online-shortcut')],
 ['existing login preserved',app.includes('pulseShowLogin')&&app.includes('signInWithPassword')],
 ['Online preflight accessible from landing',app.includes('href="./online/"')&&css.includes('.pulse-entry-prep-link')],
 ['Online preflight page branded',onlineHtml.includes('Préparer mon Bilan Online')&&onlineHtml.includes('KŌMØ <span>PULSE</span>')],
 ['Online preflight references verified booking',onlineHtml.includes('owner=40696577&amp;appointmentType=99940918')],
 ['Online preflight safety checklist',onlineHtml.includes('id="ready-checklist"')&&(onlineHtml.match(/data-preflight-check/g)||[]).length===4],
 ['Online preflight camera permission only',onlineScript.includes('navigator.mediaDevices.getUserMedia')&&onlineScript.includes('audio: false')],
 ['Online preflight stops media tracks',onlineScript.includes('getTracks().forEach(track => track.stop())')&&onlineScript.includes("addEventListener('pagehide'")],
 ['Online preflight does not record or upload video',!(/MediaRecorder|fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/.test(onlineScript))],
 ['Online preflight syntax and responsive layout',onlineSyntax.status===0&&onlineCss.includes('@media(max-width:690px)')],
 ['booking-first responsive styles',css.includes('.pulse-offer-list')&&css.includes('.pulse-entry-panel')],
 ['patient title',html.includes('Votre santé en mouvement')],
 ['single entry script',(html.match(/<script/g)||[]).length===1],
 ['patient navigation',['Aujourd’hui','Mon bilan','Résultats','Mon plan','Rendez-vous'].every(x=>app.includes(x))],
 ['human next action',app.includes('VOTRE PROCHAINE ÉTAPE')&&app.includes('nextAction')],
 ['four-step journey',app.includes('4 étapes terminées')&&app.includes('Prise de sang')&&app.includes('Mesures de mouvement')],
 ['friendly results',app.includes('Votre point fort')&&app.includes('Votre priorité')],
 ['plan journey',app.includes('Installer les bases')&&app.includes('Renforcer')&&app.includes('Transférer')],
 ['operator preserved',app.includes('D0 ·')===false&&app.includes('Session D0')&&app.includes('finalize_pulse_operator_session_v1')],
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
