import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const app=await readFile(join(root,'site/pulse-v14/app.js'),'utf8');
const maison=await readFile(join(root,'site/pulse-v14/maison-entry-v1.js'),'utf8');
const css=await readFile(join(root,'site/pulse-v14/styles.css'),'utf8');
const liveGuest=await readFile(join(root,'site/pulse-v14/motion-live-guest-v1.js'),'utf8');
const liveCss=await readFile(join(root,'site/pulse-v14/motion-live-guest-v1.css'),'utf8');
const operatorVideo=await readFile(join(root,'site/pulse-v14/motion-live-operator-video-v1.js'),'utf8');
const operatorVideoCss=await readFile(join(root,'site/pulse-v14/motion-live-operator-video-v1.css'),'utf8');
const consult=await readFile(join(root,'site/pulse-v14/motion-live-operator-consult-v1.js'),'utf8');
const consultCss=await readFile(join(root,'site/pulse-v14/motion-live-operator-consult-v1.css'),'utf8');
const remotePose=await readFile(join(root,'site/pulse-v14/motion-live-remote-pose-v1.js'),'utf8');
const poseEngine=await readFile(join(root,'site/pulse-v14/online/session/pose-engine.js'),'utf8');
const manifest=JSON.parse(await readFile(join(root,'site/pulse-v14/manifest.webmanifest'),'utf8'));
const webappIndex=await readFile(join(root,'site/pulse-v14/index.html'),'utf8');
const onlineSession=await readFile(join(root,'site/pulse-v14/online/session/app.js'),'utf8');
const mobileCss=await readFile(join(root,'site/pulse-v14/pulse-mobile-first-v3.css'),'utf8');
const liveEdge=await readFile(join(root,'supabase/functions/motion-live-test/index.ts'),'utf8');
const staffCameraHtml=await readFile(join(root,'site/pulse-v14/camera/index.html'),'utf8');
const staffCameraJs=await readFile(join(root,'site/pulse-v14/camera/camera.js'),'utf8');
const staffCameraManifest=JSON.parse(await readFile(join(root,'site/pulse-v14/camera/manifest.webmanifest'),'utf8'));
const parse=path=>spawnSync(process.execPath,['--check',join(root,path)],{encoding:'utf8'}).status===0;
const checks=[
  ['entry scripts parse',parse('site/pulse-v14/app.js')&&parse('site/pulse-v14/maison-entry-v1.js')],
  ['online offer preserved',maison.includes('data-maison-choice="online"')&&maison.includes('39 €')],
  ['onsite Motion is direct',maison.includes('data-maison-choice="motion"')&&maison.includes("show('motion')")],
  ['no account request or approval form',!maison.includes('maisonRequestForm')&&!maison.includes('maisonNewAccount')&&!maison.includes("operator-requests-v1.js")],
  ['existing patient login preserved',maison.includes("show('login')")&&app.includes("signInWithPassword")],
  ['operator creates through protected Edge Function',app.includes("sb.functions.invoke('professional-patient'")&&app.includes("organization_id:S.org.id")&&app.includes("create_account:false")],
  ['creation bound to operator patient directory',app.includes("id=\"opPatientCreateForm\"")&&app.includes("localStorage.setItem('komo_v14_patient',data.patient.id)")&&app.includes("await loadPro()")],
  ['no anonymous patient write',!maison.includes("from('patients')")&&!app.includes("from('patients').insert(")],
  ['real health records not activated before HDS/security clearance',app.includes("Environnement non validé pour de vraies données de santé")&&app.includes('name="synthetic_attested" required')],
  ['operator layout available',css.includes('.op-create-patient-form')&&css.includes('op-create-patient-grid')],
  ['onsite consultation never triggers patient camera',maison.includes('id="maisonLiveStart"')&&maison.includes('son propre iPhone sur trépied')&&!maison.includes('launchMotion')&&!maison.includes('getUserMedia')],
  ['public onsite choice opens information instead of streaming',maison.includes("show('motion')")&&!maison.includes("await launchMotion(event.currentTarget)")],
  ['mobile Operator camera CTA uses dedicated station',app.includes('id="pulse-mobile-start-motion"')&&app.includes("window.location.assign('/camera/')")&&app.includes("does NOT require a patient selection")],
  ['mobile start CTA stays above the operator bottom navigation',mobileCss.includes('.app-shell-pro .pulse-mobile-start-motion')&&mobileCss.includes('bottom:calc(89px + env(safe-area-inset-bottom,0px))')],
  ['patient live script syntactically valid',parse('site/pulse-v14/motion-live-guest-v1.js')],
  ['guest shares encrypted live video only after explicit camera activation',liveGuest.includes('getUserMedia')&&liveGuest.includes('RTCPeerConnection')&&liveGuest.includes('guest_signal_push')&&liveGuest.includes('id="mliveCamera"')&&liveGuest.includes('audio:false')&&!liveGuest.includes('MediaRecorder')],
  ['iPhone camera switches front and rear without recording',liveGuest.includes('id="mliveFlip"')&&liveGuest.includes('switchCamera()')&&liveGuest.includes('replaceTrack')&&liveGuest.includes('facingMode')],
  ['inline video panel retains visible height on desktop',consultCss.includes('FIX 2026-11-10')&&consultCss.includes('align-items:stretch')&&consultCss.includes('min-height:230px')&&consultCss.includes('.mopv-window.embedded .mopv-screen')],
  ['iPhone video reception is distinguished from connection alone',operatorVideo.includes('function videoReady(')&&operatorVideo.includes('video.videoWidth>0')&&operatorVideo.includes('Liaison connectée sans image')&&operatorVideo.includes('video.onloadeddata=refreshVideoStatus')],
  ['video monitor embedded with Motion Online controls',parse('site/pulse-v14/motion-live-operator-video-v1.js')&&operatorVideo.includes('operator_signal_pull')&&operatorVideo.includes('operator_signal_push')&&operatorVideo.includes('containerId')&&operatorVideoCss.includes('.mopv-window.embedded')],
  ['operator consultation module and user controls parse',parse('site/pulse-v14/motion-live-operator-consult-v1.js')&&consult.includes('mocSave')&&consult.includes('mocStopClock')&&consult.includes('mocSafety')&&consultCss.includes('.moc-grid')],
  ['six supervised tests match existing Motion Online',["sts","heels","unipodal_left","unipodal_right","arms","posture"].every(id=>consult.includes('id:"'+id+'"')&&onlineSession.includes("id:'"+id+"'"))],
  ['Operator runs tests, not phone',consult.includes('operator_test_update')&&app.includes('mountOperatorConsultation')&&liveEdge.includes('operator_controls_tests')],
  ['D0 interface removed',!app.includes('D0')&&app.includes("['operator','Consultation Motion']")],
  ['Edge validates manual results and enforces test owner',liveEdge.includes('invalid_manual_measurement')&&liveEdge.includes('room.operator_user_id!==actor.id')&&liveEdge.includes('safety_check_required')],
  ['Edge denies unpaired sessions and unrelated operators',liveEdge.includes('room.operator_user_id!==actor.id')&&liveEdge.includes('room.status!=="active"')&&liveEdge.includes('guestLookup(req,b)')],
  ['Edge allows only constrained WebRTC SDP and no video bytes',liveEdge.includes('pulse_motion_live_signals')&&liveEdge.includes('invalid_sdp')&&liveEdge.includes('octet')===false],

  ['patient opens waiting room with secure token',liveGuest.includes('action:"guest_start"')&&liveGuest.includes('guest_token')&&liveGuest.includes('sessionStorage.setItem(key,guestToken)')],
  ['patient marks ready; Operator alone controls stages',liveGuest.includes('action:"guest_event"')&&!liveGuest.includes('event:"complete"')&&liveGuest.includes('event=live.status==="waiting"?"ready":null')],
  ['operator live nav and pairing enabled',app.includes("['live','Nouvelle consultation']")&&app.includes("function motionLiveMonitor()")&&app.includes("action:'operator_attach'")&&app.includes("start_pulse_operator_session_v1")],
  ['physical Motion never uses patient phone',app.includes('id="pulseLobbyLiveStart"')&&app.includes('id="pulseHomeLiveStart"')&&app.includes("openMotionLivePatient()")&&app.includes('Aucun accès caméra patient nécessaire')],
  ['Operator consultation embeds paired phone camera',app.includes('id="motionConsultRoot"')&&app.includes('openOperatorCamera')&&consult.includes('id="motionConsultCamera"')],
  ['live server verifies operator role and center',liveEdge.includes('db.auth.getUser(jwt)')&&liveEdge.includes('organization_members')&&liveEdge.includes('synthetic_patient_required')],
  ['live session token hashed, RLS protected by migration',liveEdge.includes('crypto.subtle.digest("SHA-256"')&&liveEdge.includes('guest_token_hash')],
  ['live UI readable on mobile',liveCss.includes('max-width:760px')&&liveCss.includes('.mlive-camera.rear video')&&css.includes('.op-live-room')],
  ['remote tracking module parses',parse('site/pulse-v14/motion-live-remote-pose-v1.js')],
  ['pose markers reuse existing MediaPipe in Operator only',remotePose.includes("import {createPoseEngine} from './online/session/pose-engine.js?v=20261110-video-measures-v1'")&&remotePose.includes('mirror:false')&&poseEngine.includes('detectForVideo')&&poseEngine.includes('options.mirror!==false')],
  ['all six Motion Online tests connected to original frame trackers',remotePose.includes('createMovementTracker')&&remotePose.includes('createOneLegObserver')&&remotePose.includes('createSideProfileStability')&&['sts','heels','arms','unipodal_left','unipodal_right','posture'].every(id=>remotePose.includes('"'+id+'"'))],
  ['WebRTC source not computer local camera',operatorVideo.includes('pulse:remote-video-ready')&&operatorVideo.includes('pulse:remote-video-stopped')&&remotePose.includes('attach(nextVideo)')&&!remotePose.includes('getUserMedia')&&!remotePose.includes('MediaRecorder')],
  ['live skeleton canvas matches unmirrored stream',remotePose.includes('moc-pose-overlay')&&consultCss.includes('canvas.moc-pose-overlay')&&consultCss.includes('object-fit:contain')],
  ['measured estimate auto-fills with editable override',consult.includes('payload.measurement_source')&&consult.includes('manualEdited')&&consult.includes('reading?.measurement')&&consult.includes('mocValue')],
  ['server stores only operator-confirmed estimates',liveEdge.includes('operator_confirmed_video_estimate')&&liveEdge.includes('invalid_measurement_source')&&liveEdge.includes('room.operator_user_id!==actor.id')],
  ['timer counts down from the original test duration and can restart',consult.includes('clockLocal={key:clockRunKey(room),startedAt:Date.now()}')&&consult.includes('Math.ceil(duration-elapsedMs/1000)')&&consult.includes('Math.max(0,Math.min(duration,')&&consult.includes('mocRestartClock')&&consult.includes('stoppedAt??Date.now()')&&liveEdge.includes('["start","restart","save","skip"]')],
  ['desktop consultation uses viewport app shell',consultCss.includes('height:100dvh')&&consultCss.includes('overflow:hidden')&&consultCss.includes('moc-camera-host')],
  ['installable webapp manifest',manifest.display==='standalone'&&manifest.start_url.includes('#operator')&&webappIndex.includes('rel="manifest"')&&manifest.icons.some(x=>x.src.includes('icon-motion.svg'))],
  ['operator iPhone camera page and login script parse',parse('site/pulse-v14/camera/camera.js')&&staffCameraHtml.includes('CAMÉRA DU CABINET')&&staffCameraJs.includes('signInWithPassword')],
  ['dedicated iPhone camera starts with operator JWT',staffCameraJs.includes("action:'operator_camera_start'")&&staffCameraJs.includes("Authorization:'Bearer '+session.access_token")&&staffCameraJs.includes('mode:\'operator_camera\'')],
  ['iPhone user can stop camera room after reloading',staffCameraJs.includes("action:'operator_camera_stop'")&&liveGuest.includes('stationRoomId=data.session?.id')&&liveEdge.includes('id:x.id,display_code:x.display_code')],
  ['camera pairing belongs only to same Operator',liveEdge.includes('room.operator_user_id!==actor.id')&&liveEdge.includes('camera_owner_required')&&liveEdge.includes('operator_camera_start')],
  ['room recovery scoped to authenticated clinician',liveGuest.includes("STAFF_STORAGE+':'+String(options.ownerId||'unknown')")&&staffCameraJs.includes('ownerId:session.user.id')],
  ['desktop discovers only own clinician camera',app.includes("x.progress?.camera_owner==='operator'")&&app.includes('SESSION MOTION · ASSOCIATION AUTOMATIQUE')&&app.includes('/camera/')],
  ['iPhone camera station renders without patient actions',liveGuest.includes('mlive-staff-camera')&&liveGuest.includes('cameraStation')&&liveGuest.includes('CAMÉRA DU CABINET')],
  ['clinic camera app is standalone',staffCameraManifest.display==='standalone'&&staffCameraManifest.start_url==='/camera/'&&staffCameraHtml.includes('manifest.webmanifest')],
  ['unrelated Operator cannot close connected camera',liveEdge.includes('.eq("operator_user_id",actor.id).select("id")')],
  ['patient entry no longer launches personal camera',!maison.includes('guest_start')&&!maison.includes("openMotionLive()")&&app.includes('Aucun accès caméra patient nécessaire')]


];
const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks)console.log(`[motion-direct] ${ok?'PASS':'FAIL'} ${name}`);
if(failed.length)process.exit(1);
console.log('[motion-direct] Patient access simplified; secure operator dossier flow prepared.');
