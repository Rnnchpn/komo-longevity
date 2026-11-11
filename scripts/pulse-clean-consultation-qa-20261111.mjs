import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
const read=p=>readFile(join(process.cwd(),p),'utf8');
const [ui,iphone,edge,html,cameraHtml,styles,videoStation,consult]=await Promise.all([
 'site/pulse-v14/app.js','site/pulse-v14/camera/camera.js',
 'supabase/functions/motion-live-test/index.ts',
 'site/pulse-v14/index.html','site/pulse-v14/camera/index.html',
 'site/pulse-v14/pulse-consultation-flow-v1.css',
 'site/pulse-v14/motion-live-guest-v1.js',
 'site/pulse-v14/motion-live-operator-consult-v1.js'
].map(read));
for(const file of ['site/pulse-v14/app.js','site/pulse-v14/camera/camera.js']){
 const result=spawnSync(process.execPath,['--check',join(process.cwd(),file)],{encoding:'utf8'});
 assert.equal(result.status,0,file+' syntax error: '+result.stderr);
}
// One Operator-owned test-only consultation starts ON THE COMPUTER.
assert.ok(ui.includes('id="opLivePatientChoice"')&&ui.includes('id="opLiveBegin"'));
assert.ok(ui.includes("action:'operator_consultation_prepare'"));
assert.ok(ui.includes("start_pulse_operator_session_v1"));
assert.ok(ui.includes("data_classification==='synthetic'"));
assert.ok(ui.includes("localStorage.setItem('komo_v14_patient',patientId)"));
assert.ok(edge.includes('if(action==="operator_consultation_prepare")'));
assert.ok(edge.includes('if(!patient||patient.status!=="active"||patient.data_classification!=="synthetic")'));
assert.ok(edge.includes('op.operator_user_id!==actor.id'));
assert.ok(edge.includes('guest_token_hash:await hash(token)'));
assert.ok(edge.includes('status:"waiting",stage_code:STEPS[0]'));
assert.ok(edge.includes('kind:"physical_consultation"'));
assert.ok(edge.includes('consultation_already_pending'));
assert.ok(edge.includes('reused:true'));
// The iPhone must reuse exactly this session; it must NOT insert a second one.
const cameraStart=edge.slice(edge.indexOf('if(action==="operator_camera_start"){'),
 edge.indexOf('if(action==="operator_camera_stop"){'));
assert.ok(cameraStart.includes('.contains("progress",{kind:"physical_consultation"})'));
assert.ok(cameraStart.includes('if(rows.length!==1)'));
assert.ok(cameraStart.includes('if(!rows?.length)'));
assert.ok(cameraStart.includes('room.patient_id')&&cameraStart.includes('room.operator_session_id'));
assert.ok(cameraStart.includes('guest_token_hash:await hash(guestToken)'));
assert.ok(cameraStart.includes('.update({'));
assert.ok(!cameraStart.includes('.insert('),'iPhone must never create a second room');
assert.ok(cameraStart.includes('paired_automatically:true'));
assert.ok(iphone.includes("action:'operator_camera_start'"));
assert.ok(videoStation.includes('stale_staff_camera_session'));
assert.ok(videoStation.includes('data.session?.progress?.kind!=="physical_consultation"'));
assert.ok(iphone.includes('20261111-clean-consultation-v2'));
assert.ok(iphone.includes('consultation_not_prepared'));
assert.ok(iphone.includes('sans code'));
// Camera reconnect must not wipe the current test or questionnaire.
const cameraStop=edge.slice(edge.indexOf('if(action==="operator_camera_stop"){'),
 edge.indexOf('if(action==="operator_signal_pull"'));
assert.ok(cameraStop.includes('camera_state:"offline"'));
assert.ok(cameraStop.includes('...room.progress'));
assert.ok(cameraStop.includes('consultation_preserved:isPrepared'));
assert.ok(cameraStop.includes('guest_token_hash:await hash(randomToken())'));
assert.ok(!cameraStop.includes('.delete().eq("id",id)'));
// Operator reset deletes only their own in-progress synthetic rooms,
// while completed consultation reports remain in history.
const reset=edge.slice(edge.indexOf('if(action==="operator_reset_demo_sessions"){'),
 edge.indexOf('if(action==="operator_camera_start"){'));
assert.ok(reset.includes('.eq("operator_user_id",actor.id)'));
assert.ok(reset.includes('data_classification!=="synthetic"'));
assert.ok(reset.includes('.in("status",["waiting","ready","active","closed"])'));
assert.ok(reset.includes('completed_preserved:true'));
assert.ok(!reset.includes('"completed"')&&!reset.includes("'completed'"));
assert.ok(ui.includes("action:'operator_reset_demo_sessions'"));
assert.ok(ui.includes('id="opLiveReset"'));
assert.ok(ui.includes("['waiting','ready','active'].includes(x.status)"));
// The Operator can complete the questionnaire before the iPhone pairs.
assert.ok(ui.includes('Remplir le questionnaire →'));
assert.ok(ui.includes('komo_motion_consult_room_'));
assert.ok(edge.includes('"waiting","ready","active","completed"'));
// Polling may update saved answers without detaching form handlers from their
// questionnaireAnswers object; every subsequent change must reach autosave.
assert.ok(consult.includes('Object.assign(questionnaireAnswers,serverAnswers)'));
assert.ok(!consult.includes('questionnaireAnswers={...(stored?.answers||{})}'));
assert.ok(consult.includes('scheduleQuestionnaireSave()'));
assert.ok(ui.includes('SESSION MOTION · ASSOCIATION AUTOMATIQUE'));
assert.ok(ui.includes("action:'operator_checkin_invite'"),'optional fictitious check-in retained');
assert.ok(styles.includes('.op-start-panel'));
assert.ok(html.includes('20261111-clean-consultation-v1'));
assert.ok(cameraHtml.includes('20261111-clean-consultation-v2'));
console.log('[pulse-clean-consultation-qa] PASS desktop-owned single synthetic session, zero duplicate phone room, automatic camera pairing, reconnect, reset and protected completed history');
