import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildClinicPassport,CLINIC_PASSPORT_VERSION} from '../pulse-v14-src/motion-live-clinic-passport-v2.mjs';
import {clinicPassport,downloadClinicReport,clinicReportSummary} from '../pulse-v14-src/motion-live-clinic-extras-v1.js';
import {INTAKE_GROUPS} from '../pulse-v14-src/online/session/intake-model.mjs';

const results={
 sts:{status:'done',value:15,unit:'repetitions',source:'operator_confirmed_video_estimate'},
 heels:{status:'done',value:11,unit:'repetitions',source:'operator_manual_observation'},
 unipodal_left:{status:'done',value:28.9,unit:'seconds',source:'operator_confirmed_video_estimate',camera_quality:91,stop_reason:'foot_contact'},
 unipodal_right:{status:'done',value:30,unit:'seconds',source:'operator_confirmed_video_estimate',camera_quality:95,stop_reason:'limit'},
 arms:{status:'done',value:16,unit:'movements',source:'operator_confirmed_video_estimate'},
 posture:{status:'done',observation:'neutral',source:'operator_visual_observation'}
};
const date=new Date('2026-11-10T14:30:00Z');
const report=buildClinicPassport({},results,{date,subject:'Dossier fictif'});
assert.equal(report.version,CLINIC_PASSPORT_VERSION);
assert.equal(report.measured,6);
assert.equal(report.questionnaire.answered,0);
assert.equal(report.questionnaire.complete,false);
assert.equal(report.questionnaire.index,null);
assert.equal(report.outcomes.motionScore,null);
assert.equal(report.outcomes.motionAge,null);
assert.equal(report.outcomes.lifeExpectancy,null);
assert.equal(report.measures[0].display,'15 levers / 30 s');
assert.equal(report.measures[1].display,'11 répétitions');
assert.equal(report.measures[2].display,'28,9 s / 30 s');
assert.equal(report.measures[3].display,'30 s / 30 s');
assert.equal(report.measures[5].display,'Alignement apparent neutre');
assert.equal(report.balance.delta,1.1);
assert.equal(report.balance.tenSecondBoth,true);
assert.equal(report.balance.ceilingRight,true);
assert.ok(report.balance.interpretation.includes('plafond'));
assert.ok(report.findings.some(x=>x.includes('0/22')));
assert.ok(report.priorities.some(x=>x.title.includes('dimension vécue')));
assert.ok(report.evidence.some(x=>x.url.includes('cdc.gov')));
const clone=clinicPassport({},results,date,{subject:'Fictif'});
assert.equal(clone.measured,6);
assert.equal(clone.date,'2026-11-10');
assert.equal(clinicReportSummary({},results).recorded,6);
const low={
 ...results,
 unipodal_left:{status:'done',value:5.3,source:'operator_confirmed_video_estimate',camera_quality:41,stop_reason:'camera_lost'},
 unipodal_right:{status:'done',value:16.2,source:'operator_manual_observation'}
};
const q=buildClinicPassport({},low);
assert.equal(q.flagged,1);
assert.equal(q.balance.tenSecondBoth,false);
assert.ok(q.priorities.some(x=>x.title.includes('fiabilité')));
assert.ok(q.priorities.some(x=>x.title.includes('stabilité')));
assert.ok(q.measures[3].source.includes('manuelle'));
assert.equal(q.measures[2].review,true);
const missing=buildClinicPassport({},{...results,arms:{status:'skipped'}});
assert.equal(missing.measured,5);
assert.equal(missing.skipped,1);
assert.equal(missing.measures[4].display,'Non réalisé');
const full=Object.fromEntries(INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>[
 q.id,Array.isArray(q.options[0])?q.options[0][0]:'0'
])));
const complete=buildClinicPassport(full,results);
assert.equal(complete.questionnaire.answered,22);
assert.equal(complete.questionnaire.complete,true);
assert.equal(complete.questionnaire.index,100);
assert.equal(complete.questionnaire.groups.length,5);
assert.equal(complete.questionnaire.groups.reduce((n,g)=>n+g.items.length,0),22);
const paths=['site/pulse-v14/motion-live-clinic-passport-v2.mjs',
 'site/pulse-v14/motion-live-clinic-passport-pdf-v2.js',
 'site/pulse-v14/motion-live-clinic-extras-v1.js',
 'site/pulse-v14/motion-live-operator-consult-v1.js'];
for(const p of paths){
 const result=spawnSync(process.execPath,['--check',join(process.cwd(),p)],{encoding:'utf8'});
 assert.equal(result.status,0,p+' : '+result.stderr);
}
const pdf=await readFile(join(process.cwd(),paths[1]),'utf8');
const ui=await readFile(join(process.cwd(),paths[3]),'utf8');
const css=await readFile(join(process.cwd(),'site/pulse-v14/motion-live-operator-consult-v1.css'),'utf8');
assert.ok(pdf.includes('pdf.save(filename)'));
assert.ok(pdf.includes('report.evidence')&&pdf.includes('report.limitations'));
assert.ok(pdf.includes('report.questionnaire.answered===0'));
assert.ok(pdf.includes('Aucun score global'));
assert.ok(ui.includes('extras.clinicPassport(')&&ui.includes('extras.downloadClinicReport('));
assert.ok(ui.includes('mocPassportAside')&&ui.includes('moc-show-passport'));
assert.ok(ui.includes('Télécharger mon passeport PDF'));
assert.ok(css.includes('.moc-passport-visual')&&css.includes('.moc-show-passport'));
assert.equal(typeof downloadClinicReport,'function');
console.log('[pulse-clinic-passport-v2-qa] PASS factual 6 tests, censored 30-s balance, 0/22, 22/22, measured provenance, premium PDF and auto-open UX');
