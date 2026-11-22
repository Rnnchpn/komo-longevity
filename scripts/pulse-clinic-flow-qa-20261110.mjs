import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {INTAKE_GROUPS,scoreIntake,intakeProgress} from '../pulse-v14-src/motion-engine/intake-model.mjs';
import {clinicReportSummary,questionnaireState} from '../pulse-v14-src/motion-live-clinic-extras-v1.js';
import {parseVoiceCommand} from '../pulse-v14-src/motion-engine/voice-commands.mjs';
import {createMovementTracker} from '../pulse-v14-src/motion-engine/metrics.mjs';
const root=process.cwd();
const read=path=>readFile(join(root,path),'utf8');
const consult=await read('site/pulse-v14/motion-live-operator-consult-v1.js');
const extras=await read('site/pulse-v14/motion-live-clinic-extras-v1.js');
const voice=await read('site/pulse-v14/motion-live-clinic-voice-v1.js');
const edge=await read('supabase/functions/motion-live-test/index.ts');
const css=await read('site/pulse-v14/motion-live-operator-consult-v1.css');
const parses=path=>spawnSync(process.execPath,['--check',join(root,path)],{encoding:'utf8'});
for(const name of ['motion-live-clinic-extras-v1.js','motion-live-clinic-voice-v1.js','motion-live-operator-consult-v1.js']){
 const result=parses('site/pulse-v14/'+name);
 assert.equal(result.status,0,name+' syntax: '+result.stderr);
}
assert.ok(extras.includes('INTAKE_GROUPS')&&extras.includes('downloadClinicPassport')&&extras.includes('buildClinicPassport'));
assert.ok(voice.includes('createVoiceControl')&&voice.includes('createAudioFeedback'));
assert.ok(consult.includes('mocVoice')&&consult.includes('handleVoiceAction')&&consult.includes('startWithCountdown'));
assert.ok(consult.includes('mocTabQuestionnaire')&&consult.includes('mocTabReport')&&consult.includes('saveQuestionnaire'));
assert.ok(consult.includes('operator_questionnaire_save')&&edge.includes('operator_questionnaire_save'));
assert.ok(edge.includes('room.operator_user_id!==actor.id')&&edge.includes('synthetic_patient_required'));
assert.ok(edge.includes('questionnaire_conflict_retry')&&edge.includes('unknown_question'));
assert.ok(edge.includes('["waiting","ready","active","completed"].includes(room.status)'));
assert.ok(edge.includes('questionnaire_stale_snapshot'));
assert.ok(consult.includes('Object.assign(questionnaireAnswers,serverAnswers)'));
assert.ok(consult.includes('room.status==="completed"')&&consult.includes('downloadClinicReport'));
assert.ok(css.includes('moc-question-choices')&&css.includes('moc-mode-tab'));
const commands={
 "C'est parti":'start',
 'Arrête le test':'stop',
 'Recommence':'redo',
 'Suivant':'next'
};
for(const [phrase,command] of Object.entries(commands))assert.equal(parseVoiceCommand(phrase),command);
const answers=Object.fromEntries(INTAKE_GROUPS.filter(g=>!g.optional).flatMap(g=>g.questions.map(q=>[
 q.id,Array.isArray(q.options[0])?q.options[0][0]:'0'
])));
assert.equal(Object.keys(answers).length,22);
// 22/11/2026 : 5 questions facultatives « Santé et longévité », hors complétude et hors indice.
const healthGroup=INTAKE_GROUPS.find(g=>g.id==='health');
assert.ok(healthGroup?.optional&&healthGroup.scored===false&&healthGroup.questions.length===5);
assert.equal(intakeProgress({...answers,falls12:'1'}).completed,22,'les questions facultatives ne changent pas le compte');
assert.equal(intakeProgress(answers).completed,22);
assert.equal(questionnaireState(answers).score.complete,true);
const missing={...answers};delete missing.sleep;
assert.equal(intakeProgress(missing).completed,21);
assert.equal(scoreIntake(missing).complete,false);
const results={
 sts:{status:'done',value:13,unit:'repetitions',source:'operator_confirmed_video_estimate'},
 heels:{status:'done',value:8,unit:'repetitions',source:'operator_manual_observation'},
 unipodal_left:{status:'done',value:8.4,unit:'seconds'},
 unipodal_right:{status:'skipped'},
 arms:{status:'done',value:11,unit:'movements'},
 posture:{status:'done',observation:'apparent_offset',source:'operator_visual_observation'}
};
const summary=clinicReportSummary(answers,results);
assert.equal(summary.recorded,5);
assert.equal(summary.skipped,1);
assert.equal(summary.answered,22);
// Rapport de cabinet : passeport clinique (le moteur PDF de l'ancienne offre à distance est retiré).
const {buildClinicPassport}=await import('../pulse-v14-src/motion-live-clinic-passport-v2.mjs');
const report=buildClinicPassport(answers,results,{date:new Date('2026-11-10T10:00:00Z'),subject:'HIRO-261110-01',real:true});
assert.equal(report.mode,'CABINET');
assert.equal(report.questionnaire.answered,22);
assert.equal(report.outcomes.motionScore,null,'must not synthesize a Motion Score');
assert.equal(report.measures.find(x=>x.id==='sts').value,13);
assert.ok(report.measures.find(x=>x.id==='posture').display.startsWith('Décalage'));
const partial=buildClinicPassport(missing,results,{date:new Date()});
assert.equal(partial.questionnaire.complete,false);
// A seated-to-standing series with valid landmarks increments once, never
// on stationary standing or when the person leaves the field of view.
const empty=()=>Array.from({length:33},()=>({x:.4,y:.5,visibility:.1}));
function person(seated){
 const p=empty();
 const coords=seated?
  [[.4,.23],[.40,.53],[.62,.56],[.62,.88]]:
  [[.42,.19],[.42,.46],[.42,.68],[.42,.88]];
 for(const [side,offset] of [[0,0],[1,.05]]){
  const ids=side?[12,24,26,28]:[11,23,25,27];
  ids.forEach((id,i)=>p[id]={x:coords[i][0]+offset,y:coords[i][1],visibility:.96});
 }
 return p;
}
const counter=createMovementTracker('sts');
for(let i=0;i<5;i++)counter.observe(person(true),100+i*130);
for(let i=0;i<5;i++)counter.observe(person(false),800+i*130);
assert.equal(counter.summary().count,1);
for(let i=0;i<6;i++)counter.observe(person(false),1700+i*130);
assert.equal(counter.summary().count,1);
for(let i=0;i<6;i++)counter.observe(null,2600+i*130);
assert.equal(counter.summary().count,1);
console.log('[pulse-clinic-flow-qa] PASS voice commands, 22 questionnaire answers, owner validation, STS count, clinic PDF and no invented Motion Score');
