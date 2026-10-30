import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {sideProfileFrame} from '../pulse-v14-src/online/session/profile-photo-metrics.mjs';
import {classifyPostureOffset,sagittalJointObservations,postureDisplay} from '../pulse-v14-src/online/session/posture-interpretation.mjs';
import {INTAKE_GROUPS,QUESTION_COUNT,scoreIntake} from '../pulse-v14-src/online/session/intake-model.mjs';
import {snapshotProgress} from '../pulse-v14-src/online/session/session-progress.mjs';
import {reportMarkup} from '../pulse-v14-src/online/session/intake-report.js';
import {buildPdfReportData} from '../pulse-v14-src/online/session/pdf-report.js';
import {onlinePassportPage} from '../pulse-v14-src/online-passport-dashboard.js';

assert.equal(classifyPostureOffset(1).label,'Bon');
assert.equal(classifyPostureOffset(3).label,'Bon');
assert.equal(classifyPostureOffset(4).label,'Moyen');
assert.equal(classifyPostureOffset(7).label,'Moyen');
assert.equal(classifyPostureOffset(8).label,'Mauvais');
assert.equal(classifyPostureOffset(null).label,'Non disponible');
assert.equal(classifyPostureOffset(-1).label,'Non disponible');
assert.equal(classifyPostureOffset(NaN).label,'Non disponible');
const pts=Array.from({length:33},()=>({x:.45,y:.5,visibility:.05}));
for(const [id,x,y]of [[11,.42,.20],[12,.43,.20],[23,.43,.50],[24,.44,.51],[25,.43,.70],[27,.43,.90],[29,.42,.91],[31,.60,.90]])pts[id]={x,y,visibility:.98};
const frame=sideProfileFrame(pts);
assert.equal(frame.valid,true);
assert.ok(Array.isArray(frame.ix),'Side selector should return the visible leg indexes');
const leg=sagittalJointObservations(pts,1.4,frame);
assert.equal(leg.kneeFlexionDeg,0);
assert.ok(leg.ankleDeviationDeg<=1);
assert.equal(leg.compensation,'not_observed');
const hidden=pts.map(p=>({...p}));hidden[25].visibility=.05;hidden[31].visibility=.05;
const noLeg=sagittalJointObservations(hidden,1.4,sideProfileFrame(hidden));
assert.equal(noLeg.kneeFlexionDeg,null);
assert.equal(noLeg.ankleDeviationDeg,null);
assert.equal(noLeg.compensation,'unavailable');
const crooked=pts.map(p=>({...p}));crooked[25].x=.5;crooked[31].x=.60;
const bent=sagittalJointObservations(crooked,1.4,sideProfileFrame(crooked));
assert.ok(bent.kneeFlexionDeg>10,'flexed knee recognized as apparent angle');
const savedRecord={status:'done',value:5.5,posture:{valid:true,surfaceIndexPct:5.5,manualCapture:false,...leg}};
const reading=postureDisplay(savedRecord);
assert.equal(reading.label,'Moyen');
assert.equal(reading.kneeFlexionDeg,0);
assert.equal(postureDisplay({...savedRecord,status:'review'}).label,'À vérifier');
assert.equal(postureDisplay({...savedRecord,posture:{...savedRecord.posture,manualCapture:true}}).label,'À vérifier');
assert.equal(postureDisplay({status:'skipped'}).label,'Non mesuré');
const groups=INTAKE_GROUPS;
assert.equal(groups.length,6);
assert.equal(QUESTION_COUNT,22);
assert.equal(groups[5].scored,false);
assert.equal(groups[5].optional,true);
const answers=Object.fromEntries(groups.filter(g=>!g.optional).flatMap(g=>g.questions.map(q=>[q.id,Array.isArray(q.options[0])?q.options[0][0]:'0'])));
answers.safety='no';
const before=scoreIntake(answers).profileIndex;
answers.fall12='2';answers.nearFall='1';answers.painNow='2';answers.activeTime='3';
assert.equal(scoreIntake(answers).profileIndex,before);
const stored=snapshotProgress({page:4,questionStep:5,task:5,answers,checks:new Set(),
 results:{posture:savedRecord}});
assert.equal(stored.questionStep,5);
assert.equal(stored.results.posture.posture.kneeFlexionDeg,0);
assert.equal(stored.results.posture.posture.ankleDeviationDeg,0);
assert.equal(stored.results.posture.posture.compensation,'not_observed');
assert.equal(stored.answers.fall12,'2');
const report=reportMarkup(answers,{posture:savedRecord},false);
assert.ok(report.includes('Moyen'));
assert.ok(report.includes('Genou'));
assert.ok(report.includes('Cheville'));
const pdf=buildPdfReportData(answers,{posture:savedRecord},null,false,new Date('2026-10-30'));
assert.equal(pdf.observations.find(x=>x.id==='posture').posture.label,'Moyen');
assert.ok(pdf.questionnaire.groups.some(g=>g.id==='context'&&g.answers.length===4));
const dashboard=onlinePassportPage([{id:'10000000-0000-4000-8000-000000000002',status:'completed',
 appointment_id:'123456',created_at:'2026-10-30T10:00:00Z',
 snapshot:{answers,results:{posture:savedRecord},page:4}}]);
assert.ok(dashboard.includes('Moyen'));
assert.ok(dashboard.includes('Genou'));
const profile=readFileSync('pulse-v14-src/online/session/profile-photo.js','utf8');
assert.ok(profile.includes('sagittalJointObservations(points,video.videoWidth/video.videoHeight,f)'),'joint calculation must use image aspect and captured pose');
assert.ok(profile.includes('manualCapture:manualCaptured'),'manual postures are identifiable');
const sql=readFileSync('supabase/functions/motion-online-dossier/index.ts','utf8');
for(const id of ['fall12','nearFall','painNow','activeTime','kneeFlexionDeg','ankleDeviationDeg']){
 assert.ok(sql.includes(id),'server must permit and bound the new field '+id);
}
const model=readFileSync('pulse-v14-src/online/session/intake-model.mjs','utf8');
assert.ok(!/GLFS.?25|GLS.?25/i.test(model),'no mislabeled external questionnaire brand should appear');
const app=readFileSync('pulse-v14-src/online/session/app.js','utf8');
assert.ok(!app.includes("id:'visibility'"),'obsolete 10 second visibility module must stay deleted');
assert.ok(app.includes("id:'posture'"));
for(const file of ['pulse-v14-src/online/session/intake-model.mjs','pulse-v14-src/online/session/posture-interpretation.mjs',
 'pulse-v14-src/online/session/profile-photo.js','pulse-v14-src/online/session/intake-report.js','pulse-v14-src/online/session/pdf-report.js']){
 const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(check.status,0,'syntax '+file+' '+check.stderr);
}
console.log('[pulse-commercial-posture-qa] PASS · remove 10s visibility, original KŌMØ only, optional context, apparent knee/ankle, safe grades and report/dashboard/PDF');
