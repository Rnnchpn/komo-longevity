import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root=process.cwd();
const html=await readFile(join(root,'site','pulse-v14','index.html'),'utf8');
const app=await readFile(join(root,'site','pulse-v14','app.js'),'utf8');
const css=await readFile(join(root,'site','pulse-v14','styles.css'),'utf8');
const mineralCss=await readFile(join(root,'site','pulse-v14','pulse-graphite-mineral-v1.css'),'utf8');
const onlineHtml=await readFile(join(root,'site','pulse-v14','online','index.html'),'utf8');
const onlineScript=await readFile(join(root,'site','pulse-v14','online','app.js'),'utf8');
const onlineCss=await readFile(join(root,'site','pulse-v14','online','styles.css'),'utf8');
const sessionHtml=await readFile(join(root,'site','pulse-v14','online','session','index.html'),'utf8');
const sessionJs=await readFile(join(root,'site','pulse-v14','online','session','app.js'),'utf8');
const sessionCss=await readFile(join(root,'site','pulse-v14','online','session','styles.css'),'utf8');
const poseEngine=await readFile(join(root,'site','pulse-v14','online','session','pose-engine.js'),'utf8');
const motionView=await readFile(join(root,'site','pulse-v14','online','session','motion-view.js'),'utf8');
const motionController=await readFile(join(root,'site','pulse-v14','online','session','motion-controller.js'),'utf8');
const sharedMedia=await readFile(join(root,'site','pulse-v14','online','session','shared-media.js'),'utf8');
const sessionProgress=await readFile(join(root,'site','pulse-v14','online','session','session-progress.mjs'),'utf8');
const metrics=await readFile(join(root,'site','pulse-v14','online','session','metrics.mjs'),'utf8');
const voiceControl=await readFile(join(root,'site','pulse-v14','online','session','voice-control.js'),'utf8');
const voiceCommands=await readFile(join(root,'site','pulse-v14','online','session','voice-commands.mjs'),'utf8');
const testGuides=await readFile(join(root,'site','pulse-v14','online','session','test-guides.mjs'),'utf8');
const testNavigator=await readFile(join(root,'site','pulse-v14','online','session','test-navigation.js'),'utf8');
const paidAccess=await readFile(join(root,'site','pulse-v14','online','session','paid-access.js'),'utf8');
const secureDossier=await readFile(join(root,'site','pulse-v14','online','session','secure-dossier.js'),'utf8');
const intakeModel=await readFile(join(root,'site','pulse-v14','online','session','intake-model.mjs'),'utf8');
const intakeView=await readFile(join(root,'site','pulse-v14','online','session','intake-view.js'),'utf8');
const intakeReport=await readFile(join(root,'site','pulse-v14','online','session','intake-report.js'),'utf8');
const motionFormula=await readFile(join(root,'site','pulse-v14','online','session','motion-score.mjs'),'utf8');
const pdfReport=await readFile(join(root,'site','pulse-v14','online','session','pdf-report.js'),'utf8');
const audioFeedback=await readFile(join(root,'site','pulse-v14','online','session','audio-feedback.js'),'utf8');
const postureMetrics=await readFile(join(root,'site','pulse-v14','online','session','posture-metrics.mjs'),'utf8');
const referenceNorms=await readFile(join(root,'site','pulse-v14','online','session','reference-norms.mjs'),'utf8');
const normPanel=await readFile(join(root,'site','pulse-v14','online','session','normative-panel.js'),'utf8');
const profilePhoto=await readFile(join(root,'site','pulse-v14','online','session','profile-photo.js'),'utf8');
const profileGeometry=await readFile(join(root,'site','pulse-v14','online','session','profile-photo-metrics.mjs'),'utf8');
const unipodalController=await readFile(join(root,'site','pulse-v14','online','session','unipodal-controller.js'),'utf8');
const unipodalGeometry=await readFile(join(root,'site','pulse-v14','online','session','unipodal-metrics.mjs'),'utf8');
const captureEnhancements=await readFile(join(root,'site','pulse-v14','online','session','capture-enhancements.js'),'utf8');
const nodeSyntax=file=>spawnSync(process.execPath,['--check',join(root,'site','pulse-v14','online','session',file)],{encoding:'utf8'}).status===0;
const sessionSyntax=spawnSync(process.execPath,['--check',join(root,'site','pulse-v14','online','session','app.js')],{encoding:'utf8'});
const activationHtml=await readFile(join(root,'site','pulse-v14','online','activate','index.html'),'utf8');
const activationScript=await readFile(join(root,'site','pulse-v14','online','activate','app.js'),'utf8');
const verifyJs=await readFile(join(root,'api','pulse-online-verify.js'),'utf8');
const activationSyntax=spawnSync(process.execPath,['--check',join(root,'site','pulse-v14','online','activate','app.js')],{encoding:'utf8'});
const verifySyntax=spawnSync(process.execPath,['--check',join(root,'api','pulse-online-verify.js')],{encoding:'utf8'});
const onlineSyntax=spawnSync(process.execPath,['--check',join(root,'site','pulse-v14','online','app.js')],{encoding:'utf8'});
const vercel=JSON.parse(await readFile(join(root,'vercel.json'),'utf8'));
const middleware=await readFile(join(root,'middleware.js'),'utf8');
const appSyntax=spawnSync(process.execPath,['--check',join(root,'site','pulse-v14','app.js')],{encoding:'utf8'});
const rewrites=Array.isArray(vercel.rewrites)?vercel.rewrites:[];
const hostRule=r=>Array.isArray(r?.has)&&r.has.some(h=>h?.type==='host'&&h?.value==='pulse.komolongevity.com');
const rootV14=rewrites.some(r=>r.source==='/'&&r.destination==='/pulse-v14/'&&hostRule(r));
const nestedV14=rewrites.some(r=>r.source==='/(.*)'&&r.destination==='/pulse-v14/$1'&&hostRule(r));

const checks=[
 ['graphite theme loaded after core CSS',html.indexOf('styles.css')>=0&&html.indexOf('pulse-graphite-mineral-v1.css')>html.indexOf('styles.css')],
 ['entry graphite palette present',mineralCss.includes('#171e2b')&&mineralCss.includes('#aacce8')&&mineralCss.includes('.pulse-entry-panel')],
 ['login and Acuity buttons remain intact',app.includes('pulseAcuityEntry')&&app.includes('pulseShowLogin')],

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
 ['Online preflight no unverified payment promise',onlineHtml.includes('49 €</strong> tarif du bilan')&&!onlineHtml.includes('49 €</strong> à la réservation')&&onlineHtml.includes('Cette page ne collecte aucun paiement et ne confirme pas si le rendez-vous est réglé.')],
 ['Online preflight safety checklist',onlineHtml.includes('id="ready-checklist"')&&(onlineHtml.match(/data-preflight-check/g)||[]).length===4],
 ['Online preflight camera permission only',onlineScript.includes('navigator.mediaDevices.getUserMedia')&&onlineScript.includes('audio: false')],
 ['Online preflight stops media tracks',onlineScript.includes('getTracks().forEach(track => track.stop())')&&onlineScript.includes("addEventListener('pagehide'")],
 ['Online preflight does not record or upload video',!(/MediaRecorder|fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/.test(onlineScript))],
 ['Online preflight syntax and responsive layout',onlineSyntax.status===0&&onlineCss.includes('@media(max-width:690px)')],
 ['tester post-login redirect',app.includes("window.location.assign('/online/session/')")&&app.includes('eef2c1ed-3872-47a7-84da-0f70b975c96f')],
 ['tester sidebar available only by verified role',app.includes('const isOnlineTester=')&&app.includes('S.role===\'admin\'')&&app.includes('pulse-online-tester-link')],
 ['authenticated session user lookup',sessionJs.includes('sb.auth.getUser()')&&sessionJs.includes("role.data?.role==='admin'")&&sessionJs.includes('verifyPaidSession({')],
 ['session security no public clinical record writes',!(/sb\.from\(.+\.insert\(|localStorage\.setItem|sessionStorage\.setItem|fetch\s*\(/.test(sessionJs))],
 ['session questionnaire and safety',sessionJs.includes('function questionnaire()')&&sessionJs.includes('function safety()')],
 ['online original self-report replaces four-question demo',sessionJs.includes('intakeMarkup(state.answers,state.questionStep)')&&intakeModel.includes('QUESTIONNAIRE_VERSION')&&intakeModel.includes('walk10')&&intakeView.includes('bindIntake')],
 ['questionnaire cannot skip missing answers',intakeView.includes('completeGroup(group,answers)')&&intakeModel.includes('profileIndex=complete?')],
 ['self-report scored domains and separate final score',intakeModel.includes('SCORING_GROUPS')&&intakeReport.includes('INDICE DE PROFIL DÉCLARÉ')&&intakeReport.includes('Motion Score indisponible')],
 ['final score exact linear formula and gates',motionFormula.includes('40*F+35*M+6.25*B')&&motionFormula.includes('operatorVerified')&&motionFormula.includes('stsP10')&&motionFormula.includes('tugP90')],
 ['no invented motion age or norms',!motionFormula.includes('Motion Age')&&motionFormula.includes('normsSource')&&intakeReport.includes('Aucune norme statistique n’a été inventée')],
 ['intake source scripts parse',nodeSyntax('intake-model.mjs')&&nodeSyntax('intake-view.js')&&nodeSyntax('intake-report.js')&&nodeSyntax('motion-score.mjs')],
 ['PDF download on final consultation',intakeReport.includes('id="download-pdf"')&&intakeReport.includes('downloadMotionPdf(payload)')],
 ['PDF includes all questionnaires and observations',pdfReport.includes('INTAKE_GROUPS.map')&&pdfReport.includes('OBSERVATIONS.map')&&pdfReport.includes('Detail des reponses')],
 ['PDF never fabricates Motion Score',pdfReport.includes('motionScore?.complete===true')&&pdfReport.includes('score:null')&&pdfReport.includes('NON CALCULABLE')],
 ['PDF generated in browser without submitting data',pdfReport.includes("import('https://esm.sh/jspdf@4.2.1')")&&pdfReport.includes('pdf.save(filename)')&&!/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(pdfReport)],
 ['PDF formatter and logic syntactically valid',nodeSyntax('pdf-report.js')],

 ['intake layout mobile',sessionCss.includes('.intake-choices')&&sessionCss.includes('.intake-domain-grid')&&sessionCss.includes('.motion-score-locked')],
 ['session auto pose capture and test timer',sharedMedia.includes('navigator.mediaDevices.getUserMedia')&&sessionJs.includes('function test()')&&sessionJs.includes('function summary()')&&motionController.includes('C’est parti →')],
 ['session video stops on navigation',sessionJs.includes("pagehide")&&sessionJs.includes('stopCamera(true)')&&sharedMedia.includes('stream.getTracks().forEach(t=>t.stop())')],
 ['continuous camera and voice across all tests',sessionJs.includes('stopCamera(state.page!==3)')&&sharedMedia.includes('availableCamera')&&motionController.includes('sharedMotionMedia.ensureCamera()')&&unipodalController.includes('sharedMotionMedia.ensureCamera()')&&profilePhoto.includes('sharedMotionMedia.ensureCamera()')],
 ['position validated audible beep for all test types',motionController.includes('sharedMotionMedia.readyBeep(task.id)')&&unipodalController.includes('sharedMotionMedia.readyBeep(task.id)')&&profilePhoto.includes('sharedMotionMedia.readyBeep(task.id)')],
 ['session-only progress without raw media',sessionJs.includes('loadProgress(progressStore)')&&sessionJs.includes('persistProgress()')&&sessionProgress.includes('PROGRESS_KEY')&&sessionProgress.includes('expiresAt')&&!/MediaRecorder|toDataURL|toBlob/.test(sessionProgress)],
 ['session progress syntax',nodeSyntax('shared-media.js')&&nodeSyntax('session-progress.mjs')],
 ['session ready for desktop and mobile',sessionSyntax.status===0&&sessionHtml.includes('Ma consultation Online')&&sessionCss.includes('@media(max-width:570px)')],
 ['motion pose engine supported browser inference',poseEngine.includes('detectForVideo')&&poseEngine.includes('pose_landmarker_lite.task')&&poseEngine.includes('requestAnimationFrame')&&nodeSyntax('pose-engine.js')],
 ['pose camera privacy and local overlay',!(/fetch\s*\(|MediaRecorder|localStorage/.test(poseEngine+motionController))&&poseEngine.includes('canvas.getContext')&&motionView.includes('pose-canvas')],
 ['full-body quality gated start',motionController.includes('validStreak>=3')&&metrics.includes('frameInfo(points,task')&&metrics.includes('visibility')&&nodeSyntax('metrics.mjs')],
 ['explicit privacy opt-in',motionView.includes('id="pose-consent"')&&motionController.includes('if(!consent.checked)')&&sessionCss.includes('.pose-consent')],
 ['voice mic consent independent of camera',motionView.includes('id="voice-consent"')&&motionView.includes('peut transmettre ma voix')&&motionController.includes("voiceConsent.onchange")],
 ['voice activation and safety command gate',motionView.includes('Activer les commandes vocales')&&motionController.includes("command==='start'")&&motionController.includes('!go.disabled')&&motionController.includes("command==='stop'")],
 ['voice error and cleanup',voiceControl.includes('not-allowed')&&voiceControl.includes('continuous=true')&&voiceControl.includes('destroy()')&&sessionJs.includes('currentMotionCleanup')],
 ['spoken instructions and clear test objectives',testGuides.includes('Objectif')===false&&testGuides.includes('Observer votre capacité')&&motionView.includes('COMMENT FONCTIONNE CE TEST')&&motionController.includes('speechSynthesis')],
 ['voice modules syntax',nodeSyntax('voice-control.js')&&nodeSyntax('voice-commands.mjs')&&nodeSyntax('test-guides.mjs')],
 ['voice guidance on phone and distance mode',sessionCss.includes('.voice-setup')&&sessionCss.includes('.voice-hud')&&motionView.includes('Mode à distance')],
 ['spoken 3 2 1 Top countdown',audioFeedback.includes("['3'")===false&&audioFeedback.includes("'Trois'")&&audioFeedback.includes("'Deux'")&&audioFeedback.includes("'Un'")&&audioFeedback.includes("'Top !'")&&motionView.includes('id="countdown-cover"')],
 ['click for each detected repetition',captureEnhancements.includes('audio.click()')&&captureEnhancements.includes('onCount(n)')&&motionController.includes('enhancements.onCount(result.count)')],
 ['speaker remaining-time callouts',audioFeedback.includes('Encore ')&&captureEnhancements.includes('onRemaining')&&motionController.includes('enhancements.onRemaining(state.remaining)')],
 ['countdown starts timer on Top',motionController.includes('void enhancements.begin(()=>')&&motionController.includes('state.startedAt=performance.now()')&&motionController.includes('state.countdownActive')],
 ['speaker is optional and cleaned up',motionView.includes('id="sound-enabled"')&&captureEnhancements.includes('audible:enabled()')&&captureEnhancements.includes('audio.destroy()')],
 ['posture observation and careful summary',postureMetrics.includes('observeFrontalPosture')&&captureEnhancements.includes('postureSummary()')&&sessionJs.includes("id:'posture'")&&intakeReport.includes("id==='posture'")],
 ['posture is non-diagnostic and local',testGuides.includes("posture:{")&&testGuides.includes("scoliose")&&motionView.includes('id="posture-results"')],
 ['paid dossier server-only persistence',sessionJs.includes('loadSecureDossier(')&&sessionJs.includes('dossierQueue.firstSave(state)')&&secureDossier.includes('/functions/v1/motion-online-dossier')&&secureDossier.includes('snapshotProgress')],
 ['paid dossier consent and isolated progress',sessionJs.includes('dossier-consent')&&sessionJs.includes('paidConsentAccepted')&&sessionJs.includes('scopedProgressStorage(store,user.id,bookingId)')],
 ['paid dossier client adapter parses',nodeSyntax('secure-dossier.js')],
 ['paid online appointment verification is server controlled',sessionJs.includes('verifyPaidSession({')&&paidAccess.includes('/api/pulse-online-verify')&&verifyJs.includes('PULSE_ONLINE_PAID_SESSION_ENABLED')],
 ['paid sessions are isolated and the commercial gate is closed by default',sessionJs.includes('scopedProgressStorage(store,user.id,bookingId)')&&paidAccess.includes('canStart!==true')&&nodeSyntax('paid-access.js')],
 ['test revisit navigator built for all six exercises',sessionJs.includes('testNavigatorMarkup(TESTS,state.results,state.task)')&&sessionJs.includes('mountTestNavigation(root,TESTS,state.results,jumpToTest')&&testNavigator.includes('data-motion-test')],
 ['saved results are not erased on revisit',sessionJs.includes('completedTestMarkup(t,record)')&&sessionJs.includes('delete state.results[t.id]')&&testNavigator.includes('redo-stored-test')],
 ['review navigation respects safety gate',sessionJs.includes("state.answers.safety!=='no'")&&sessionJs.includes('state.sessionActive||state.countdownActive')],
 ['test navigation script parses',nodeSyntax('test-navigation.js')],
 ['posture automatic 3 2 1 and manual backup',profilePhoto.includes('sharedMotionMedia.postureCountdown')&&profilePhoto.includes('manual.onclick')&&profilePhoto.includes('state.results[task.id]=record')],
 ['age norms and protocol guards',referenceNorms.includes('protocolConfirmed')&&referenceNorms.includes('Rikli & Jones')&&normPanel.includes('norm-exact-age')],
 ['no visible-only balance step',!sessionJs.includes("id:'balance'")&&!intakeReport.includes("['balance','Visibilité debout'")],
 ['reference panel syntax',nodeSyntax('normative-panel.js')&&nodeSyntax('reference-norms.mjs')],
 ['auto side photo, not radiographic SVA',profilePhoto.includes('createSideProfileStability')&&profilePhoto.includes('drawImage(video')&&profilePhoto.includes('Photo capturée automatiquement')&&profileGeometry.includes('NOT SVA')&&profileGeometry.includes('NOT mm')],
 ['photo marker correction and in-memory image',profilePhoto.includes('profile-photo')&&profilePhoto.includes('snap.onpointerdown')&&!/fetch\s*\(|localStorage|sessionStorage|toBlob|toDataURL/.test(profilePhoto)],
 ['unipodal both legs, auto timing on foot lift',sessionJs.includes("id:'unipodal_left'")&&sessionJs.includes("id:'unipodal_right'")&&unipodalController.includes('createOneLegObserver')&&unipodalGeometry.includes('at-raisedSince>=850')],
 ['camera-only before auto capture',profilePhoto.includes('consent.checked')&&unipodalController.includes('consent.checked')&&sharedMedia.includes('audio:false')],
 ['large video and compact microphone/audio',sessionCss.includes('.voice-compact')&&sessionCss.includes('height:min(76vh,880px)')&&motionView.includes('id="voice-panel"')],
 ['new side camera controllers parse',nodeSyntax('profile-photo.js')&&nodeSyntax('profile-photo-metrics.mjs')&&nodeSyntax('unipodal-controller.js')&&nodeSyntax('unipodal-metrics.mjs')],

 ['audio posture code parses',nodeSyntax('audio-feedback.js')&&nodeSyntax('capture-enhancements.js')&&nodeSyntax('posture-metrics.mjs')],
 ['test still requires real camera capture before advancing',motionController.includes('if(!state.sessionFinished)')&&motionController.includes("finish(true)")],
 ['prominent start and auto counted movements',motionView.includes('C’est parti →')&&motionController.includes('tracker.observe(points,time)')&&motionController.includes('record.status=')],
 ['automatic 30 second sit-to-stand',sessionJs.includes('seconds:30')&&metrics.includes("task==='sts'")&&metrics.includes('lastCountAt')],
 ['large responsive webcam',sessionCss.includes('live-capture-layout')&&sessionCss.includes('aspect-ratio:16/9')&&sessionCss.includes('@media(max-width:590px)')],
 ['modular capture syntax',nodeSyntax('motion-view.js')&&nodeSyntax('motion-controller.js')],
 ['activation link from preparation and home',onlineHtml.includes('href="/online/activate/"')&&app.includes('href="./online/activate/"')&&css.includes('.pulse-entry-activation-link')],
 ['activation form guarded by verified identity',activationScript.includes('sb.auth.getUser()')&&activationScript.includes('shouldCreateUser:true')&&activationHtml.includes('ACCÈS CONTRÔLÉ')],
 ['activation client checks paid appointment via server',activationScript.includes('/api/pulse-online-verify')&&activationScript.includes('access_token')&&activationSyntax.status===0],
 ['server validates Acuity transaction and Supabase identity',verifyJs.includes("'/auth/v1/user'")&&verifyJs.includes('getUser')===false&&verifyJs.includes("+'/payments'")&&verifyJs.includes('transactionID')&&verifyJs.includes('appointmentTypeID')],
 ['server verification fails closed on invalid appointment',verifyJs.includes('booking_not_eligible')&&verifyJs.includes('payment_not_confirmed')&&verifyJs.includes('email_not_verified')&&verifySyntax.status===0],
 ['server uses protected Acuity env',verifyJs.includes('process.env.ACUITY_API_KEY')&&verifyJs.includes('process.env.ACUITY_USER_ID')&&!activationScript.includes('ACUITY_API_KEY')],
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
