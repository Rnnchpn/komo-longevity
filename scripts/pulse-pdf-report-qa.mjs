import assert from 'node:assert/strict';
import {buildPdfReportData,PDF_REPORT_VERSION} from '../pulse-v14-src/online/session/pdf-report.js';
import {INTAKE_GROUPS,scoreIntake} from '../pulse-v14-src/online/session/intake-model.mjs';
import {calculateMotionScore} from '../pulse-v14-src/online/session/motion-score.mjs';
import {reportMarkup} from '../pulse-v14-src/online/session/intake-report.js';
const answers=Object.fromEntries(INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>[
 q.id,Array.isArray(q.options[0])?q.options[0][0]:'0'
])));
const results={sts:{value:14,status:'done',quality:94,source:'webcam'},unipodal_left:{value:9.8,status:'review',quality:67},
 posture:{value:6.2,status:'done',source:'photo locale',posture:{valid:true,surfaceIndexPct:6.2}}};
const motion=calculateMotionScore({
 sts30:14,tug3m:9,sppbBalance:3,stsP10:8,stsP90:20,tugP10:7,tugP90:13,
 normsSource:'Reference normative documentee pour demonstration',operatorVerified:true,stsVerified:true
});
assert.equal(motion.complete,true);
const doc=buildPdfReportData(answers,results,motion,false,new Date('2026-10-29T09:30:00Z'));
assert.equal(doc.version,PDF_REPORT_VERSION);
assert.equal(doc.date,'2026-10-29');
assert.equal(doc.mode,'DEMONSTRATION');
assert.equal(doc.questionnaire.index,100);
assert.equal(doc.questionnaire.groups.length,6);
assert.equal(doc.questionnaire.groups.reduce((s,g)=>s+g.answers.length,0),26);
assert.equal(doc.questionnaire.answered,22);
assert.equal(doc.questionnaire.domains.length,4);
assert.equal(doc.motion.complete,true);
assert.equal(doc.motion.score,62);
assert.equal(doc.motion.source,motion.source);
assert.equal(doc.observations.length,6);
assert.ok(doc.observations.find(x=>x.id==='posture').commentary.includes('SVA'));
assert.equal(doc.observations.find(x=>x.id==='unipodal_left').status,'review');
assert.ok(doc.limitations.some(x=>x.includes('C7-S1')));
const incomplete=buildPdfReportData(answers,results,null,false);
assert.equal(incomplete.motion.complete,false);
assert.equal(incomplete.motion.score,null);
assert.ok(incomplete.motion.missing.length>0);
const blocked=buildPdfReportData(answers,results,motion,true);
assert.equal(blocked.motion.complete,false,'safety suspension blocks Motion Score in PDF');
const partial={...answers};delete partial.chair;
const partialDoc=buildPdfReportData(partial,results,motion,false);
assert.equal(partialDoc.questionnaire.complete,false);
assert.equal(partialDoc.questionnaire.index,null);
assert.equal(partialDoc.motion.complete,false);
assert.equal(partialDoc.questionnaire.answered,21);
const markup=reportMarkup(answers,results,false);
assert.ok(markup.includes('id="download-pdf"'),'PDF download must be visible in final summary');
assert.ok(markup.includes('Création')===false,'download button should be idle');
assert.ok(markup.includes('Motion Score indisponible'),'incomplete score is still appropriately labeled');
const missing=buildPdfReportData({}, {},null,false);
assert.equal(missing.questionnaire.index,null);
assert.equal(missing.motion.score,null);
assert.equal(missing.observations.filter(x=>x.value!==null).length,0);
console.log('[pulse-pdf-report-qa] report data, full answers, safety gate, missing score, privacy and downloadable CTA passed');
