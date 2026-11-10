import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
const root=process.cwd(),read=path=>readFile(join(root,path),'utf8');
const [app,checkin,checkinHtml,camera,edge,styles,html]=await Promise.all([
 'site/pulse-v14/app.js','site/pulse-v14/commencer/checkin.js',
 'site/pulse-v14/commencer/index.html','site/pulse-v14/camera/camera.js',
 'supabase/functions/motion-live-test/index.ts','site/pulse-v14/pulse-consultation-flow-v1.css',
 'site/pulse-v14/index.html'
].map(read));
for(const p of ['site/pulse-v14/app.js','site/pulse-v14/commencer/checkin.js',
 'site/pulse-v14/camera/camera.js']){
 const res=spawnSync(process.execPath,['--check',join(root,p)],{encoding:'utf8'});
 assert.equal(res.status,0,p+' syntax: '+res.stderr);
}
assert.ok(checkinHtml.includes('referrer" content="no-referrer"'));
assert.ok(checkinHtml.includes('noindex,nofollow'));
assert.ok(checkin.includes('action,guest_token:token')&&checkin.includes('patient_checkin_submit'));
assert.ok(checkin.includes("patient_checkin_status"));
assert.ok(checkin.includes("['")===false,'no secret hard-coded array in client');
assert.ok(!checkin.includes('getUserMedia')&&!checkin.includes('MediaRecorder'));
assert.ok(!checkin.includes("sb.from('patients')")&&!checkin.includes("sessionStorage.setItem('guest')"));
assert.ok(checkin.includes('Choisir un personnage de démonstration'));
assert.ok(checkin.includes("if(d.state==='invited'&&!document.getElementById('checkinForm'))form()"),
 'polling must never clear a partially edited form');
assert.ok(edge.includes('if(action==="operator_checkin_invite")'));
assert.ok(edge.includes('if(action==="patient_checkin_submit")')||edge.includes('action==="patient_checkin_submit"'));
assert.ok(edge.includes('if(action==="operator_checkin_claim")'));
assert.ok(edge.includes('room.operator_user_id!==actor.id')&&edge.includes('op.operator_user_id!==actor.id'));
assert.ok(edge.includes('new Uint8Array(32)')&&edge.includes('guest_token_hash:await hash(token)'));
assert.ok(edge.includes('["Camille","Alex","Morgan","Sacha","Noa"].includes(alias)'));
assert.ok(edge.includes('synthetic_attested')&&edge.includes('patient.data_classification!=="synthetic"'));
assert.ok(edge.includes('checkin.progress?.patient_checkin?.state!=="accepted"'));
assert.ok(edge.includes('camera_owner:"operator"')&&edge.includes('camera_owner:"operator"'));
assert.ok(edge.includes('initialProgress')&&edge.includes('checkin_id'));
assert.ok(edge.includes('operator_camera_start')&&edge.includes('operator_attach'));
assert.ok(edge.includes('contains("progress",{camera_owner:"operator"})'));
assert.ok(app.includes("['live','Nouvelle consultation']"));
assert.ok(app.includes("action:'operator_checkin_invite'"));
assert.ok(app.includes("action:'operator_checkin_claim'"));
assert.ok(app.includes("sb.functions.invoke('professional-patient'"));
assert.ok(app.includes("start_pulse_operator_session_v1"));
assert.ok(app.includes("checkin_id:checkinId"));
assert.ok(app.includes('ready.length===1'),'only auto-connect when exactly one camera is available');
assert.ok(app.includes("sessionStorage.setItem('komo_pending_motion_checkin'"));
assert.ok(app.includes("localStorage.setItem('komo_v14_patient',patientId)"));
assert.ok(app.includes("operator_list")&&app.includes('opCheckinQueue'));
assert.ok(app.includes('/camera/')&&camera.includes("action:'operator_camera_start'"));
assert.ok(styles.includes('.op-live-checklist')&&styles.includes('.op-checkin-invitation'));
assert.ok(html.includes('pulse-consultation-flow-v1.css')&&html.includes('checkin-v1'));
console.log('[pulse-simple-consultation-qa] PASS invitation token, fictitious form, 3-step operator queue, unique iPhone pairing, security and no patient-camera requests');
