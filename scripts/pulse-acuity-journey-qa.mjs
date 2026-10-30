// Synthetic full-journey acceptance test. No real Acuity booking, payment or patient is created.
// Tests the SAME application modules and client wire contracts used in production.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {INTAKE_GROUPS,scoreIntake} from '../pulse-v14-src/online/session/intake-model.mjs';
import {verifyPaidSession,scopedProgressStorage} from '../pulse-v14-src/online/session/paid-access.js';
import {saveSecureDossier,loadSecureDossier} from '../pulse-v14-src/online/session/secure-dossier.js';
import {snapshotProgress,cleanProgram} from '../pulse-v14-src/online/session/session-progress.mjs';
import {buildMotionPassport,createDailyProgram,programProgress} from '../pulse-v14-src/online/session/motion-passport.mjs';
import {buildPdfReportData} from '../pulse-v14-src/online/session/pdf-report.js';
import {onlineHomeBlock,onlinePassportPage,onlinePlanPage} from '../pulse-v14-src/online-passport-dashboard.js';

const participant={id:'00000000-0000-4000-8000-000000000051',email:'pulse-audit@example.test',confirmed:true};
const appointment={id:'880029',email:participant.email,type:99940918,paid:true,active:true,price:49};
let verificationCalls=0,saveCalls=0,record=null,stage='no_booking';
const bookingVerifier=async(_url,options)=>{
 verificationCalls++;
 assert.equal(options.headers.authorization,'Bearer audit.jwt.token');
 assert.deepEqual(JSON.parse(options.body),{appointmentId:appointment.id});
 const eligible=appointment.paid&&appointment.active&&appointment.type===99940918&&appointment.email===participant.email;
 return {ok:eligible,status:eligible?200:403,json:async()=>eligible?{eligible:true,canStart:true,paid:true}:{error:'payment_not_confirmed'}};
};
const auth='audit.jwt.token';
let verify=await verifyPaidSession({accessToken:auth,appointmentId:appointment.id,fetcher:bookingVerifier});
assert.equal(verify.ok,true);
stage='paid_verified';
appointment.paid=false;
verify=await verifyPaidSession({accessToken:auth,appointmentId:appointment.id,fetcher:bookingVerifier});
assert.equal(verify.ok,false,'payment mismatch must fail closed');
appointment.paid=true;
appointment.email='impostor@example.test';
verify=await verifyPaidSession({accessToken:auth,appointmentId:appointment.id,fetcher:bookingVerifier});
assert.equal(verify.ok,false,'different booking owner cannot access');
appointment.email=participant.email;

const all=Object.fromEntries(INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>[
 q.id,Array.isArray(q.options[0])?q.options[0][0]:'0'
])));
all.safety='no';
// Deliberately non-ideal answers so the domain priorities are recognizable.
for(const key of ['stairs','chair','carry','obstacle','turn'])all[key]='2';
for(const key of ['sleep','stress'])all[key]='1';
const intake=scoreIntake(all);
assert.equal(intake.complete,true);
assert.ok(intake.profileIndex>0&&intake.profileIndex<100);
const results={
 sts:{status:'done',value:12,source:'webcam',quality:85},
 heels:{status:'done',value:15,source:'webcam',quality:88},
 unipodal_left:{status:'review',value:8.1,source:'webcam',quality:51},
 unipodal_right:{status:'done',value:13.2,source:'webcam',quality:81},
 arms:{status:'done',value:10,source:'webcam',quality:90},
 posture:{status:'review',value:7.5,source:'webcam',quality:56}
};
let program=createDailyProgram('2026-10-29');
program.entries['2026-10-29']={completed:['walk','recover'],effort:3,note:'essai synthétique'};
let state={page:4,questionStep:4,task:5,returnToSummary:false,
 answers:all,results,checks:new Set(['chair','space','support','device']),program};
const snapshot=snapshotProgress(state);
assert.equal(snapshot.page,4);
assert.equal(snapshot.results.posture.status,'review');
assert.equal(snapshot.rawFrames,undefined);
assert.equal(cleanProgram(snapshot.program).entries['2026-10-29'].completed.length,2);

const storage=new Map();
const browserStore={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const ownerStorage=scopedProgressStorage(browserStore,participant.id,appointment.id);
const differentOwner=scopedProgressStorage(browserStore,'another-user',appointment.id);
ownerStorage.setItem('audit-session','sentinel');
assert.equal(differentOwner.getItem('audit-session'),null);

const savedAt='2026-10-29T19:00:00.000Z';
const mockDossierApi=async(_url,options)=>{
 const body=JSON.parse(options.body);
 assert.equal(options.headers.authorization,'Bearer audit.jwt.token');
 if(body.mode==='save'){
  saveCalls++;
  assert.equal(body.appointmentId,appointment.id);
  assert.equal(body.consentAccepted,true);
  assert.equal(body.snapshot.answers.safety,'no');
  record={id:'00000000-0000-4000-8000-000000000052',
   appointment_id:appointment.id,user_id:participant.id,
   created_at:savedAt,updated_at:savedAt,status:'completed',snapshot:body.snapshot};
  return {ok:true,json:async()=>({ok:true,status:'completed',updatedAt:savedAt})};
 }
 assert.equal(body.mode,'load');
 return {ok:true,json:async()=>({ok:true,found:Boolean(record),snapshot:record?.snapshot??null,status:record?.status??null})};
};
const write=await saveSecureDossier(auth,appointment.id,state,mockDossierApi);
assert.equal(write.ok,true);
stage='completed_and_saved';
const reload=await loadSecureDossier(auth,appointment.id,mockDossierApi);
assert.equal(reload.found,true);
assert.equal(reload.snapshot.results.sts.value,12);
assert.equal(reload.snapshot.answers.stairs,'2');
const passport=buildMotionPassport(reload.snapshot.answers,reload.snapshot.results,false);
assert.equal(passport.measuredCount,6);
assert.equal(passport.flaggedCount,2);
assert.equal(passport.planStatus,'eligible');
assert.equal(passport.index,intake.profileIndex);
assert.ok(passport.focus.some(d=>d.id==='mobility'));
const pdf=buildPdfReportData(reload.snapshot.answers,reload.snapshot.results,null,false,new Date(savedAt),
 {mode:'PILOTE',program:reload.snapshot.program});
assert.equal(pdf.motion.score,null,'no fabricated validated score');
assert.equal(pdf.passport.index,intake.profileIndex);
assert.equal(pdf.questionnaire.groups.length,6);
assert.equal(pdf.observations.length,6);
assert.equal(pdf.program.progress.daysLogged,1);
stage='reopened_from_pulse';

const home=onlineHomeBlock([record]),page=onlinePassportPage([record]),plan=onlinePlanPage([record]);
assert.ok(home.includes('INDICE DE MOBILITÉ PERÇUE'));
assert.ok(home.includes('data-route-passport'));
assert.ok(page.includes('12 répétitions'));
assert.ok(page.includes('À vérifier'));
assert.ok(page.includes('data-passport-pdf'));
assert.ok(page.includes('/online/session/?appointment='+appointment.id),'reentry must pass owner-linked Acuity ID');
assert.ok(plan.includes('/online/session/?appointment='+appointment.id));
assert.ok(!page.includes('Motion Score : '+intake.profileIndex));
assert.ok(programProgress(program).daysLogged===1);

const reeval={...all,safety:'yes'};
const hold=buildMotionPassport(reeval,results,true);
assert.equal(hold.planStatus,'safety_hold');
const heldPage=onlinePassportPage([{...record,snapshot:{...snapshot,answers:reeval}}]);
assert.ok(heldPage.includes('SE FAIRE ACCOMPAGNER')&&!heldPage.includes('Reprendre mon bilan et Pulse Daily'));
stage='safety_scoped';

const app=readFileSync('pulse-v14-src/app.js','utf8');
const session=readFileSync('pulse-v14-src/online/session/app.js','utf8');
const activation=readFileSync('pulse-v14-src/online/activate/app.js','utf8');
const vercel=JSON.parse(readFileSync('vercel.json','utf8'));
assert.ok(app.includes(".select('id,appointment_id,status,snapshot,created_at,updated_at')"));
assert.ok(session.includes("'/?connexion=1'")===false&&session.includes("'/?connexion=1'")===false);
assert.ok(session.includes("'/#connexion'"),'correct existing login link after session redirect');
assert.ok(activation.includes('sb.auth.signInWithOtp')&&activation.includes('shouldCreateUser:true'));
assert.ok(activation.includes('verify-form')&&activation.includes('canStart===true'));
assert.ok(app.includes(".eq('user_id',S.user.id)"),'owner-scoped dashboard read');
assert.ok(app.includes("raw!==null&&raw!==undefined&&raw!==''"),'Missing released score cannot appear as 0/100');
assert.ok(app.includes("if(raw===null||raw===undefined||raw==='')continue"),'Missing domain cannot appear as 0/100');
assert.ok(Array.isArray(vercel.rewrites),'Vercel route config found');
const suite=[
 'pulse-online-payment-qa.mjs',
 'pulse-paid-session-access-qa.mjs',
 'pulse-online-dossier-qa.mjs',
 'pulse-intake-motion-score-qa.mjs',
 'pulse-passport-daily-qa.mjs',
 'pulse-online-passport-dashboard-qa.mjs',
 'pulse-pdf-report-qa.mjs',
 'pulse-test-navigation-qa.mjs',
 'pulse-profile-unipodal-qa.mjs',
 'pulse-profile-age-qa.mjs'
];
for(const test of suite){
 const v=spawnSync(process.execPath,['scripts/'+test],{encoding:'utf8',timeout:45000,maxBuffer:1024*1024*3});
 assert.equal(v.status,0,'Regression '+test+' failed: '+(v.stderr||v.stdout).slice(-1500));
}
console.log('[pulse-acuity-journey-qa] PASS · synthetic paid booking→magic link contract→questionnaires→6 webcam result contracts→secure save→passport→PDF payload→Pulse re-entry→28-day diary; 10 subsidiary QA suites; 0 real account, 0 real charges');
