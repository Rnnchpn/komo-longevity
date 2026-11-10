import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildClinicPassport} from '../pulse-v14-src/motion-live-clinic-passport-v2.mjs';
import {buildClinicActionPlan,clinicRadarMarkup} from '../pulse-v14-src/motion-live-clinic-action-plan-v1.mjs';
import {CLINIC_PASSPORT_EXPORTS,downloadClinicPassport} from '../pulse-v14-src/motion-live-clinic-passport-pdf-v2.js';
import {INTAKE_GROUPS} from '../pulse-v14-src/online/session/intake-model.mjs';

const answers={ageBand:'60-69',goal:'strength',walk10:'0',stairs:'1',chair:'0',
 carry:'1',bend:'2',obstacle:'0',turn:'0',stand:'0',pain:'2',fatigue:'1',
 fear:'0',avoid:'1',sleep:'2',stress:'2',recovered:'2',qol:'1',
 walkingDays:'1',strengthDays:'3',outdoors:'1',breaks:'2'};
const results={sts:{status:'done',value:15,source:'operator_manual_observation'},
 heels:{status:'done',value:11,source:'operator_manual_observation'},
 unipodal_left:{status:'done',value:28.9,source:'operator_confirmed_video_estimate',
 camera_quality:100,stop_reason:'ambiguous_contact'},
 unipodal_right:{status:'done',value:30,source:'operator_manual_observation'},
 arms:{status:'done',value:16,source:'operator_manual_observation'},
 posture:{status:'done',observation:'neutral',source:'operator_visual_observation'}};
const passport=buildClinicPassport(answers,results,{simulated:true,subject:'Dossier fictif',
 date:new Date('2026-11-10T14:30:00Z')});
assert.equal(passport.actionPlan.version,'KOMO_CLINIC_HOME_PLAN_V1');
assert.equal(passport.actionPlan.axis.length,4);
assert.deepEqual(passport.actionPlan.axis.map(x=>x.value),[87.5,75,56.3,56.3]);
assert.equal(passport.actionPlan.timeline.length,3);
assert.equal(passport.actionPlan.exercises.length,5);
assert.ok(passport.actionPlan.exercises.some(x=>x.key==='hinge'));
assert.ok(passport.actionPlan.exercises.some(x=>x.key==='chair'));
assert.ok(passport.actionPlan.supplements.every(x=>x.guard?.length>25));
assert.ok(passport.actionPlan.supplements.find(x=>x.id==='vitd').guard.includes('systématiques')||
 passport.actionPlan.supplements.find(x=>x.id==='vitd').guard.includes('systématique'));
assert.ok(passport.actionPlan.review.includes('valider'));
assert.ok(passport.actionPlan.highlights.some(x=>x.value.includes('renforcement')));
const radar=clinicRadarMarkup(passport.actionPlan);
assert.ok(radar.includes('role="img"')&&radar.includes('<polygon'));
assert.ok(radar.includes('87.5')&&radar.includes('56.3'));
const blank=buildClinicPassport({},results);
assert.ok(clinicRadarMarkup(blank.actionPlan).includes('Diagramme disponible'));
assert.equal(blank.actionPlan.emphasis.length,0);
assert.equal(blank.outcomes.motionScore,null);
assert.equal(blank.outcomes.motionAge,null);
assert.ok(blank.actionPlan.supplements.some(x=>x.status.includes('Non prioritaire')),'without intake avoid recommending creatine');
const noBalance=buildClinicActionPlan(answers,passport.measures,null,passport.questionnaire);
assert.ok(noBalance.exercises.find(x=>x.key==='balance').relevance.includes('référence'));
const categories=['all','synthese','tests','exercices','nutrition','suivi'];
assert.deepEqual(CLINIC_PASSPORT_EXPORTS.map(x=>x.value),categories);
assert.equal(typeof downloadClinicPassport,'function');
const read=path=>readFile(join(process.cwd(),path),'utf8');
const ui=await read('site/pulse-v14/motion-live-operator-consult-v1.js');
const pdf=await read('site/pulse-v14/motion-live-clinic-passport-pdf-v2.js');
const extras=await read('site/pulse-v14/motion-live-clinic-extras-v1.js');
const css=await read('site/pulse-v14/motion-live-operator-consult-v1.css');
assert.ok(ui.includes('mocExportCategory')&&ui.includes('mocDownloadChapter'));
assert.ok(ui.includes('exportPdf("all",button)'));
assert.ok(ui.includes('clinicRadar(plan)'));
for(const category of categories)assert.ok(pdf.includes(category));
assert.ok(pdf.includes('pdf.save(name)')&&pdf.includes('const chapters=category==='));
assert.ok(pdf.includes('function nutrition()')&&pdf.includes('function exercises()'));
assert.ok(extras.includes("options.category||'all'"));
assert.ok(css.includes('.moc-category-export')&&css.includes('.moc-radar-svg'));
for(const f of ['motion-live-clinic-action-plan-v1.mjs','motion-live-clinic-passport-v2.mjs',
 'motion-live-clinic-passport-pdf-v2.js','motion-live-clinic-extras-v1.js',
 'motion-live-operator-consult-v1.js']){
 const path=join(process.cwd(),'site/pulse-v14',f);
 const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});
 assert.equal(result.status,0,f+': '+result.stderr);
}
console.log('[pulse-category-export-qa] PASS 5 independent PDF categories, 4-axis radar, home exercises, safe supplements, missing-data fallback and no invented Motion Score');
