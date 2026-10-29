// Integration-level contract checks for the Motion Online 49 € patient journey.
// Uses only fictitious values and an in-memory mocked Edge Function. No live patient access.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {INTAKE_GROUPS,intakeProgress,completeGroup,scoreIntake} from '../pulse-v14-src/online/session/intake-model.mjs';
import {intakeMarkup} from '../pulse-v14-src/online/session/intake-view.js';
import {completedTests,testStatus,testNavigatorMarkup,completedTestMarkup} from '../pulse-v14-src/online/session/test-navigation.js';
import {buildMotionPassport,priorityNarrative} from '../pulse-v14-src/online/session/motion-passport.mjs';
import {createDossierQueue} from '../pulse-v14-src/online/session/secure-dossier.js';
import {snapshotProgress} from '../pulse-v14-src/online/session/session-progress.mjs';

const tests=[
 {id:'sts',name:'Chaise',unit:'répétitions'},
 {id:'heels',name:'Talons',unit:'répétitions'},
 {id:'unipodal_left',name:'Unipodal gauche',unit:'secondes'},
 {id:'unipodal_right',name:'Unipodal droit',unit:'secondes'},
 {id:'arms',name:'Bras',unit:'répétitions'},
 {id:'posture',name:'Posture',unit:'%'}
];
const answers=Object.fromEntries(INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>[
 q.id,Array.isArray(q.options[0])?q.options[0][0]:'0'
])));
assert.equal(INTAKE_GROUPS.length,5);
assert.equal(intakeProgress({}).completed,0);
assert.equal(intakeProgress(answers).completed,22);
for(const group of INTAKE_GROUPS)assert.equal(completeGroup(group,answers),true);
assert.equal(scoreIntake(answers).profileIndex,100);
for(let i=0;i<INTAKE_GROUPS.length;i++){
 const html=intakeMarkup(answers,i);
 assert.ok(html.includes(INTAKE_GROUPS[i].title));
 assert.ok(html.includes('id="intake-next"')&&html.includes('id="intake-back"'));
}
const omitted={...answers}; delete omitted.walk10;
assert.equal(scoreIntake(omitted).complete,false);
assert.equal(scoreIntake(omitted).profileIndex,null);
const stopped={...answers,safety:'yes'};
const blockedPassport=buildMotionPassport(stopped,{},true);
assert.equal(blockedPassport.blocked,true);
assert.equal(blockedPassport.planStatus,'safety_hold');
assert.ok(priorityNarrative(blockedPassport).includes('avis professionnel'));

const records={
 sts:{status:'done',value:12,quality:91,source:'webcam'},
 heels:{status:'review',value:5,quality:40,source:'correction manuelle'},
 unipodal_left:{status:'skipped',value:0,source:'non réalisé'}
};
assert.equal(completedTests(tests,records),3);
assert.equal(testStatus(records.sts).code,'done');
assert.equal(testStatus(records.heels).code,'review');
assert.equal(testStatus(records.unipodal_left).code,'skipped');
assert.equal(testStatus(undefined).code,'todo');
const navigator=testNavigatorMarkup(tests,records,0);
assert.ok(navigator.includes('3 / 6 enregistrés'));
assert.ok(navigator.includes('status-done')&&navigator.includes('status-review')&&navigator.includes('status-skipped'));
assert.ok(completedTestMarkup(tests[0],records.sts).includes('Refaire ce test'));
assert.ok(completedTestMarkup(tests[1],records.heels).includes('À vérifier'));
assert.ok(completedTestMarkup(tests[2],records.unipodal_left).includes('Aucune mesure enregistrée'));

const state={
 page:4,questionStep:4,task:5,answers:{...answers,safety:'no'},
 checks:new Set(['chair','space','support','device']),results:records,program:null
};
const clean=snapshotProgress(state);
assert.equal(clean.page,4);
assert.deepEqual(Object.keys(clean.results).sort(),Object.keys(records).sort());
assert.equal(clean.results.sts.value,12);
assert.equal(clean.results.unipodal_left.status,'skipped');
assert.equal(JSON.stringify(clean).includes('rawFrame'),false);

const calls=[],messages=[];let offline=false;
async function fakeServer(url,init){
 assert.ok(url.endsWith('/functions/v1/motion-online-dossier'));
 assert.equal(init.method,'POST');
 assert.ok(init.headers.authorization.startsWith('Bearer '));
 const body=JSON.parse(init.body);
 assert.equal(body.appointmentId,'12345678');
 assert.equal(body.mode,'save');
 assert.equal(body.consentAccepted,true);
 assert.equal(body.consentVersion,'KOMO_MOTION_ONLINE_CONSENT_V1');
 assert.equal(JSON.stringify(body).includes('videoBlob'),false);
 calls.push(body);
 if(offline)throw Error('simulated offline');
 return {ok:true,json:async()=>({ok:true,updatedAt:'2026-10-29T17:00:00Z'})};
}
const queue=createDossierQueue({
 accessToken:'fixture.jwt.token',appointmentId:'12345678',
 onStatus:(status)=>messages.push(status),fetcher:fakeServer
});
assert.equal(await queue.firstSave(state),true);
assert.equal(calls.length,1);
assert.equal(queue.getStatus().written,true);
const updated={...state,results:{...records,arms:{status:'done',value:8,source:'webcam'}}};
queue.enqueue(updated);
assert.equal(await queue.flush(),true);
assert.equal(calls.length,2);
assert.equal(calls[1].snapshot.results.arms.value,8);
offline=true;
const final={...updated,results:{...updated.results,posture:{status:'skipped',value:0,source:'non réalisé'}}};
queue.enqueue(final);
assert.equal(await queue.flush(),false,'Network failure must be reported before PDF or exit');
assert.equal(queue.getStatus().failure,true);
offline=false;
queue.enqueue(final);
assert.equal(await queue.flush(),true,'Patient can retry without losing snapshot');
assert.equal(queue.getStatus().failure,false);
assert.ok(messages.some(m=>m.includes('Sauvegarde impossible')));
queue.destroy();

const app=readFileSync('pulse-v14-src/online/session/app.js','utf8');
const controller=readFileSync('pulse-v14-src/online/session/motion-controller.js','utf8');
const posture=readFileSync('pulse-v14-src/online/session/profile-photo.js','utf8');
const unipodal=readFileSync('pulse-v14-src/online/session/unipodal-controller.js','utf8');
assert.ok(app.includes("const PHASES = ['Bienvenue','Questionnaire','Sécurité','Tests guidés','Synthèse']"));
for(const t of tests)assert.ok(app.includes("id:'"+t.id+"'"));
assert.ok(app.includes('if(state.answers.safety')||app.includes("state.answers.safety==='yes'"));
assert.ok(app.includes("if(!paidConsentAccepted)"));
assert.ok(app.includes('root.addEventListener(\'change\',()=>persistProgress())'));
assert.ok(controller.includes("record.status='skipped'")&&controller.includes("record.status='review'"));
assert.ok(posture.includes("record.posture={valid:true")||posture.includes("record.posture={valid:true"));
assert.ok(unipodal.includes("status='skipped'")&&unipodal.includes("status='review'"));
console.log('[pulse-online49-endtoend-fixtures-qa] PASS · 22 answers, safety, six tests, retake/skips, snapshot, offline retry, paid storage gating');
