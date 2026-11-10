import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {buildClinicPassport} from '../pulse-v14-src/motion-live-clinic-passport-v2.mjs';
import {scoreIntake,intakeProgress} from '../pulse-v14-src/online/session/intake-model.mjs';
const answers={
 ageBand:'60-69',goal:'strength',
 walk10:'0',stairs:'1',chair:'0',carry:'1',bend:'2',obstacle:'0',turn:'0',stand:'0',
 pain:'2',fatigue:'1',fear:'0',avoid:'1',
 sleep:'2',stress:'2',recovered:'2',qol:'1',
 walkingDays:'1',strengthDays:'3',outdoors:'1',breaks:'2'
};
const results={
 sts:{status:'done',value:15,source:'operator_manual_observation'},
 heels:{status:'done',value:11,source:'operator_confirmed_video_estimate'},
 unipodal_left:{status:'done',value:28.9,source:'operator_confirmed_video_estimate',
  camera_quality:100,stop_reason:'ambiguous_contact'},
 unipodal_right:{status:'done',value:30,source:'operator_manual_observation'},
 arms:{status:'done',value:16,source:'operator_manual_observation'},
 posture:{status:'done',observation:'neutral',source:'operator_visual_observation'}
};
assert.equal(intakeProgress(answers).completed,22);
assert.equal(scoreIntake(answers).profileIndex,75);
assert.equal(scoreIntake(answers).domains.mobility,87.5);
assert.equal(scoreIntake(answers).domains.comfort,75);
assert.equal(scoreIntake(answers).domains.recovery,56.3);
assert.equal(scoreIntake(answers).domains.activity,56.3);
const report=buildClinicPassport(answers,results,{simulated:true,subject:'Dossier de demonstration',
 date:new Date('2026-11-10T15:00:00.000Z')});
assert.equal(report.measured,6);
assert.equal(report.questionnaire.answered,22);
assert.equal(report.questionnaire.simulated,true);
assert.equal(report.simulated,true);
assert.equal(report.questionnaire.index,75);
assert.equal(report.balance.delta,1.1);
assert.equal(report.flagged,1);
assert.ok(report.findings.some(x=>x.includes('inventées')));
assert.ok(report.findings.some(x=>x.includes('flexion du tronc')));
assert.ok(report.findings.some(x=>x.includes('renforcement')));
assert.ok(report.findings.some(x=>x.includes('Sommeil')));
assert.ok(report.priorities.some(x=>x.title==='Instaurer un renforcement régulier'));
assert.ok(report.priorities.some(x=>x.title.includes('Explorer la flexion')));
assert.ok(report.priorities.some(x=>x.title==='Standardiser le prochain contrôle'));
assert.equal(report.outcomes.motionScore,null);
assert.equal(report.outcomes.motionAge,null);
assert.ok(report.limitations.some(x=>x.includes('artificiellement')));
const edge=await readFile(join(process.cwd(),'supabase/functions/motion-live-test/index.ts'),'utf8');
assert.ok(edge.includes('operator_demo_seed')===false,'only DB seeded; no hard-coded answers');
assert.ok(edge.includes('previouslySimulated')&&edge.includes('simulated:previouslySimulated'));
assert.ok(edge.includes('.eq("operator_user_id",actor.id).eq("status","completed")'));
assert.ok(edge.includes('30*86400000'));
const ui=await readFile(join(process.cwd(),'site/pulse-v14/motion-live-operator-consult-v1.js'),'utf8');
const pdf=await readFile(join(process.cwd(),'site/pulse-v14/motion-live-clinic-passport-pdf-v2.js'),'utf8');
assert.ok(ui.includes('moc-demo-warning')&&ui.includes('questionnaire?.simulated===true'));
assert.ok(ui.includes('moc-radar-svg')===false&&ui.includes('clinicRadar(plan)')&&ui.includes('simulated}'));
assert.ok(pdf.includes('22 REPONSES FICTIVES')&&pdf.includes('CATEGORIE'));
console.log('[pulse-passport-simulation-qa] PASS saved 22 fictitious answers, 75/100 declared index, test/subjective cross-analysis, 30-day report history and provenance');
