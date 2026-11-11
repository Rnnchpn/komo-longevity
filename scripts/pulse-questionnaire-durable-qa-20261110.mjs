import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {buildClinicPassport} from '../pulse-v14-src/motion-live-clinic-passport-v2.mjs';
import {INTAKE_GROUPS,intakeProgress,scoreIntake,questionPoints,
 MAX_QUESTIONNAIRE_POINTS,SCORED_QUESTION_COUNT} from '../pulse-v14-src/online/session/intake-model.mjs';
import {CLINIC_PASSPORT_EXPORTS} from '../pulse-v14-src/motion-live-clinic-passport-pdf-v2.js';
import {questionnairePointsMarkup} from '../pulse-v14-src/motion-live-clinic-extras-v1.js';
import {buildPdfReportData} from '../pulse-v14-src/online/session/pdf-report.js';
const read=path=>readFile(join(process.cwd(),path),'utf8');
const files=[
 'site/pulse-v14/motion-live-operator-consult-v1.js',
 'site/pulse-v14/motion-live-clinic-extras-v1.js',
 'site/pulse-v14/motion-live-clinic-passport-v2.mjs',
 'site/pulse-v14/motion-live-clinic-passport-pdf-v2.js',
 'site/pulse-v14/motion-live-guest-v1.js',
 'site/pulse-v14/camera/camera.js',
 'site/pulse-v14/app.js'];
for(const path of files){
 const check=spawnSync(process.execPath,['--check',join(process.cwd(),path)],{encoding:'utf8'});
 assert.equal(check.status,0,path+' '+check.stderr);
}
const [ui,extras,model,pdf,iphone,edge,app]=await Promise.all([
 ...[files[0],files[1],files[2],files[3],files[4]].map(read),
 read('supabase/functions/motion-live-test/index.ts'),read(files[6])
]);
const answers={ageBand:'60-69',goal:'strength',walk10:'0',stairs:'1',chair:'0',carry:'1',
 bend:'2',obstacle:'0',turn:'0',stand:'0',pain:'2',fatigue:'1',fear:'0',avoid:'1',
 sleep:'2',stress:'2',recovered:'2',qol:'1',walkingDays:'1',strengthDays:'3',
 outdoors:'1',breaks:'2'};
assert.equal(intakeProgress(answers).completed,22);
assert.equal(INTAKE_GROUPS.length,5);
assert.equal(SCORED_QUESTION_COUNT,20);
assert.equal(MAX_QUESTIONNAIRE_POINTS,80);
assert.equal(intakeProgress(answers).completed,22);
const scores=scoreIntake(answers);
assert.equal(scores.complete,true);
assert.equal(scores.rawPoints,22);
assert.equal(scores.maxPoints,80);
assert.equal(scores.profileIndex,75);
assert.equal(scores.domainPoints.mobility.points,4);
assert.equal(scores.domainPoints.comfort.points,4);
assert.equal(scores.domainPoints.recovery.points,7);
assert.equal(scores.domainPoints.activity.points,7);
assert.equal(questionPoints(INTAKE_GROUPS[0].questions[0],answers.ageBand),null);
assert.equal(questionPoints(INTAKE_GROUPS[1].questions[0],answers.walk10),0);
assert.equal(questionPoints(INTAKE_GROUPS[1].questions[1],answers.stairs),1);
const favorable=Object.fromEntries(INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>
 [q.id,Array.isArray(q.options[0])?q.options[0][0]:'0'])));
const mostLimited=Object.fromEntries(INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>
 [q.id,Array.isArray(q.options[0])?q.options[0][0]:'4'])));
assert.equal(scoreIntake(favorable).rawPoints,0);
assert.equal(scoreIntake(favorable).profileIndex,100);
assert.equal(scoreIntake(mostLimited).rawPoints,80);
assert.equal(scoreIntake(mostLimited).profileIndex,0);
const incomplete={...answers};delete incomplete.stairs;
assert.equal(scoreIntake(incomplete).complete,false);
assert.equal(scoreIntake(incomplete).rawPoints,null);
assert.equal(scoreIntake(incomplete).profileIndex,null);
assert.equal(scoreIntake(incomplete).domainPoints.mobility.points,null);
assert.equal(scoreIntake({...answers,stairs:'999'}).rawPoints,null);
assert.ok(questionnairePointsMarkup(answers).includes('22 / 80 points de difficulté'));
assert.ok(questionnairePointsMarkup(incomplete).includes('Indice en attente'));
const oldResults={
 sts:{status:'done',value:15,source:'operator_manual_observation'},
 heels:{status:'done',value:11,source:'operator_confirmed_video_estimate'},
 unipodal_left:{status:'done',value:28.9,source:'operator_manual_observation'},
 unipodal_right:{status:'done',value:30,source:'operator_manual_observation'},
 arms:{status:'done',value:16,source:'operator_manual_observation'},
 posture:{status:'done',observation:'neutral',source:'operator_visual_observation'}
};
const old=buildClinicPassport(answers,oldResults,{simulated:true,date:new Date('2026-11-10')});
assert.equal(old.measured,6);
assert.equal(old.questionnaire.answered,22);
assert.equal(old.questionnaire.groups.reduce((n,g)=>n+g.items.length,0),22);
assert.equal(old.questionnaire.rawPoints,22);
assert.equal(old.questionnaire.maxPoints,80);
assert.equal(old.questionnaire.index,75);
assert.equal(old.questionnaire.groups[0].items[0].points,null);
assert.equal(old.questionnaire.groups[0].items[1].points,null);
assert.equal(old.questionnaire.groups[1].items.find(x=>x.id==='stairs').points,1);
assert.equal(old.questionnaire.groups[1].points,4);
assert.equal(old.questionnaire.groups[1].maxPoints,32);
const online=buildPdfReportData(answers,oldResults);
assert.equal(online.questionnaire.rawPoints,22);
assert.equal(online.questionnaire.maxPoints,80);
assert.equal(online.questionnaire.groups.reduce((n,g)=>n+g.answers.length,0),22);
assert.equal(online.questionnaire.groups[0].answers[0].points,null);
assert.equal(online.questionnaire.groups[1].answers[1].points,1);
assert.equal(old.measures[1].durationSeconds,20);
assert.equal(old.measures[4].durationSeconds,20);
assert.ok(old.measures[1].display.includes('/ 20 s'));
assert.ok(old.actionPlan.exercises.length>=5);
assert.ok(old.actionPlan.supplements.some(x=>x.id==='creatine'&&x.guard.length>20));
const newResults={...oldResults,heels:{...oldResults.heels,duration_seconds:30},
 arms:{...oldResults.arms,duration_seconds:30}};
const updated=buildClinicPassport(answers,newResults,{simulated:true});
assert.ok(updated.measures[1].display.includes('/ 30 s'));
assert.ok(updated.measures[4].display.includes('/ 30 s'));
assert.equal(updated.questionnaire.index,75);
assert.equal(updated.actionPlan.timeline.length,3);
assert.deepEqual(CLINIC_PASSPORT_EXPORTS.map(x=>x.value),
 ['all','synthese','tests','exercices','nutrition','suivi','questionnaire']);
assert.ok(pdf.includes('function questionnaire()')&&pdf.includes('plan.supplements.forEach'));
assert.ok(pdf.includes('a.guard')&&pdf.includes('report.questionnaire.groups'));
assert.ok(pdf.includes('item.points')&&pdf.includes('g.points'));
assert.ok(pdf.includes('report.questionnaire.rawPoints'));
assert.ok(extras.includes('mocScoreSummary')&&extras.includes('moc-answer-points'));
assert.ok(ui.includes('pointGroups')&&ui.includes('passport.questionnaire.rawPoints'));
const onlinePdf=await read('site/pulse-v14/online/session/pdf-report.js');
assert.ok(onlinePdf.includes('item.points')&&onlinePdf.includes('data.questionnaire.rawPoints'));
assert.ok(pdf.includes('printGroups(groups.slice(0,2),1)')&&pdf.includes('printGroups(groups.slice(2),2)'));
assert.ok(pdf.includes('const chapters=category===')&&pdf.includes("'questionnaire'"));
assert.ok(ui.includes('await saveQuestionnaire()'));
assert.ok(ui.includes('Object.entries(JSON.parse(snapshot))'));
assert.ok(ui.includes('questionnairePersistedAt')&&ui.includes('serverTime>=questionnairePersistedAt'));
assert.ok(ui.includes('Object.assign(questionnaireAnswers,serverAnswers)'));
assert.ok(!ui.includes('questionnaireAnswers={...(stored?.answers||{})}'));
assert.ok(ui.includes('Vérification des réponses enregistrées sur le serveur'));
assert.ok(ui.includes('persisted.progress?.questionnaire?.answers'));
assert.ok(ui.includes('PDF généré à partir de'));
assert.ok(ui.includes('mocIntakeSaveStatus'));
assert.ok(extras.includes('onComplete?.()')&&extras.includes('mocIntakeSave'));
assert.ok(ui.includes('onComplete:()=>switchPanel("report")'));
assert.ok(ui.includes('duration:30')&&ui.includes('payload.duration_seconds=t.duration'));
assert.ok(iphone.includes('durant 30 secondes')&&iphone.includes('pendant 30 secondes'));
assert.ok(app.includes("['heels','30 s'")&&app.includes("['arms','30 s'"));
assert.ok(edge.includes('for(let attempt=0;attempt<6;attempt++)'));
assert.ok(edge.includes('const nextProgress={...prior,questionnaire:'));
assert.ok(edge.includes('answered_count:Object.keys(cleaned).length'));
assert.ok(edge.includes('const progress={...old,step_status:"pending"'));
assert.ok(edge.includes('test_duration_seconds')&&edge.includes('duration_seconds:old.test_duration_seconds'));
assert.ok(edge.includes('.eq("updated_at",latest.updated_at)'));
assert.ok(edge.includes('synthetic_patient_required'));
assert.ok(!pdf.includes('age biologique calcule'));
console.log('[pulse-questionnaire-durable-qa] PASS: all 22 response texts, 20 scored items, bounds 0/80 and 100/100, profile context excluded, missing-data safety, autosave and clinic/online PDF scoring');
