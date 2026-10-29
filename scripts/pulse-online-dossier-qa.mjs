import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {saveSecureDossier,loadSecureDossier,createDossierQueue,CONSENT_VERSION} from '../pulse-v14-src/online/session/secure-dossier.js';
const code=readFileSync('supabase/functions/motion-online-dossier/index.ts','utf8');
const env={SUPABASE_URL:'https://supabase.test',SUPABASE_SERVICE_ROLE_KEY:'server-only-test-key'};
let user={id:'user-A',email_confirmed_at:'2026-10-29T17:00:00Z'},paid=true,canStart=true,row=null,dbWrites=0,verificationCalls=0;
const calls=[];
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
async function mockFetch(url,options={}){
 const u=String(url);calls.push({url:u,method:options.method||'GET'});
 if(u.endsWith('/auth/v1/user'))return json(user);
 if(u.endsWith('/api/pulse-online-verify')){verificationCalls++;return json({eligible:paid,paid,canStart},paid?200:403);}
 if(u.includes('/rest/v1/motion_online_sessions')){
  if((options.method||'GET')==='GET')return json(row?[row]:[]);
  if(options.method==='POST'){
   dbWrites++;const item=JSON.parse(options.body);row={...item,id:'session-test',updated_at:'2026-10-29T17:00:00Z'};return json([row],201);
  }
  if(options.method==='PATCH'){
   dbWrites++;row={...row,...JSON.parse(options.body)};return json([row]);
  }
 }
 throw Error('unexpected request: '+u);
}
let edge;
new Function('Deno','fetch','AbortSignal','TextEncoder',code)(
 {env:{get:key=>env[key]},serve:fn=>{edge=fn}},mockFetch,AbortSignal,TextEncoder
);
assert.equal(typeof edge,'function');
const baseHeaders={origin:'https://pulse.komolongevity.com',authorization:'Bearer good.jwt.token','content-type':'application/json'};
const call=async(input,{headers=baseHeaders,method='POST'}={})=>{
 const req=new Request('https://supabase.test/functions/v1/motion-online-dossier',{
  method,headers,body:method==='POST'?JSON.stringify(input):undefined
 });
 const res=await edge(req);
 return {code:res.status,body:res.status===204?null:await res.json()};
};
const snapshot={page:3,task:2,questionStep:4,returnToSummary:false,
 answers:{ageBand:'60-69',goal:'walk',walk10:'2',safety:'no',stairs:'1'},
 checks:['chair','space','support','device'],results:{sts:{value:14,status:'done',quality:95,source:'webcam'}}};
const booking='123456';
let r=await call({mode:'load',appointmentId:booking});
assert.equal(r.code,200);assert.equal(r.body.found,false);
r=await call({mode:'save',appointmentId:booking,snapshot,consentAccepted:true,consentVersion:CONSENT_VERSION});
assert.equal(r.code,200);assert.equal(r.body.ok,true);
assert.equal(dbWrites,1);assert.equal(row.user_id,'user-A');assert.equal(row.appointment_id,booking);
assert.equal(row.consent_version,CONSENT_VERSION);assert.equal(row.snapshot.results.sts.value,14);
r=await call({mode:'load',appointmentId:booking});
assert.equal(r.body.found,true);assert.equal(r.body.snapshot.answers.walk10,'2');
const updated={...snapshot,page:4,results:{...snapshot.results,posture:{status:'review',value:5.3,
 source:'webcam',posture:{valid:true,surfaceIndexPct:5.3,rawPhoto:'NOT_FOR_DATABASE'}}}};
r=await call({mode:'save',appointmentId:booking,snapshot:updated,consentAccepted:true,consentVersion:CONSENT_VERSION});
assert.equal(r.code,200);assert.equal(row.status,'completed');
assert.equal(row.snapshot.results.posture.posture.rawPhoto,undefined,'raw photo must not be persisted');
assert.equal(dbWrites,2);
const withProgram={...snapshot,program:{version:'KOMO_PULSE_DAILY_V1',startedAt:'2026-10-29',entries:{
 '2026-10-29':{completed:['walk','chair'],effort:3,note:'Effort confortable'}
}}};
r=await call({mode:'save',appointmentId:booking,snapshot:withProgram,
 consentAccepted:true,consentVersion:CONSENT_VERSION});
assert.equal(r.code,200,'valid daily journal must be stored');
assert.equal(row.snapshot.program.entries['2026-10-29'].completed.length,2);
r=await call({mode:'save',appointmentId:booking,snapshot:{...withProgram,
 program:{...withProgram.program,entries:{'2026-10-29':{completed:['upload_video'],effort:4,note:''}}}},
 consentAccepted:true,consentVersion:CONSENT_VERSION});
assert.equal(r.code,422,'unknown program/media tasks must be blocked');
const ownerWrites=dbWrites;
user={...user,id:'user-B'};
r=await call({mode:'load',appointmentId:booking});
assert.equal(r.code,403,'patient B cannot see patient A');
r=await call({mode:'save',appointmentId:booking,snapshot,consentAccepted:true,consentVersion:CONSENT_VERSION});
assert.equal(r.code,409,'patient B cannot overwrite patient A');
assert.equal(dbWrites,ownerWrites);
user={...user,id:'user-A'};
paid=false;
r=await call({mode:'load',appointmentId:booking});
assert.equal(r.code,403,'cancelled/unpaid booking must not load data');
assert.equal(dbWrites,ownerWrites);
paid=true;canStart=false;
r=await call({mode:'save',appointmentId:booking,snapshot,consentAccepted:true,consentVersion:CONSENT_VERSION});
assert.equal(r.code,403,'launch flag OFF prevents private writes');
canStart=true;
r=await call({mode:'save',appointmentId:booking,snapshot,consentAccepted:false,consentVersion:CONSENT_VERSION});
assert.equal(r.code,422,'consent required');
r=await call({mode:'save',appointmentId:booking,snapshot,consentAccepted:true,consentVersion:'invalid'});
assert.equal(r.code,422,'consent version required');
const malformed={...snapshot,results:{...snapshot.results,posture:{status:'done',value:1,posture:{valid:true,surfaceIndexPct:'invalid'}}}};
r=await call({mode:'save',appointmentId:booking,snapshot:malformed,consentAccepted:true,consentVersion:CONSENT_VERSION});
assert.equal(r.code,422,'reject malformed measurements');
r=await call({mode:'save',appointmentId:booking,snapshot:{...snapshot,answers:{...snapshot.answers,rawVideo:'BASE64VIDEO'}},consentAccepted:true,consentVersion:CONSENT_VERSION});
assert.equal(r.code,422,'reject unknown raw media in patient answers');
r=await call({mode:'save',appointmentId:booking,snapshot,consentAccepted:true,consentVersion:CONSENT_VERSION},{
 headers:{...baseHeaders,origin:'https://attacker.example'}});
assert.equal(r.code,403,'cross origin rejected');
r=await call({mode:'load',appointmentId:booking},{headers:{origin:baseHeaders.origin}});
assert.equal(r.code,401,'bearer required');
r=await call({mode:'load',appointmentId:booking},{method:'OPTIONS',headers:{origin:baseHeaders.origin}});
assert.equal(r.code,204,'CORS preflight');
assert.equal(dbWrites,ownerWrites,'denied requests never wrote data');

// Client adapter: server gets only a session snapshot, never media devices or raw photos.
const state={...snapshot,stream:{secret:'VIDEO'},engine:{name:'model'},rawAudio:'AUDIO',
 results:{sts:{status:'done',value:14,source:'webcam',rawVideo:'NEVER_SAVE'}}};
let sent;
const fakeClient=async(url,options)=>{
 sent={url,body:JSON.parse(options.body),headers:options.headers};
 return {ok:true,json:async()=>({ok:true,found:false,updatedAt:'2026-10-29'})};
};
await saveSecureDossier('jwt','123456',state,fakeClient);
assert.equal(sent.body.snapshot.stream,undefined);
assert.equal(sent.body.snapshot.rawAudio,undefined);
assert.equal(sent.body.snapshot.results.sts.rawVideo,undefined);
assert.equal(sent.headers.authorization,'Bearer jwt');
assert.equal(sent.body.consentVersion,CONSENT_VERSION);
await loadSecureDossier('jwt','123456',fakeClient);
assert.equal(sent.body.mode,'load');
const statuses=[];
const queue=createDossierQueue({accessToken:'jwt',appointmentId:'123456',fetcher:fakeClient,onStatus:(s)=>statuses.push(s)});
assert.equal(await queue.firstSave(state),true);
queue.enqueue({...state,page:4});
assert.equal(await queue.flush(),true);
assert.ok(statuses.some(s=>s.includes('enregistrée')||s.includes('créé')));
queue.destroy();
assert.ok(verificationCalls>=5);
console.log('[pulse-online-dossier-qa] payment gate, owner isolation, consent, input limits and private persistence passed');
