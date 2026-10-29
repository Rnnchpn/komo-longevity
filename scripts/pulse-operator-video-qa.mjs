// No Acuity credentials, real patient data or real video join URLs are used.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {extractVideoUrl,safeAcuityDate} from '../api/_acuity-video.js';
import schedule from '../api/pulse-online-operator-schedule.js';
import {restitutionMarkup} from '../pulse-v14-src/online/session/restitution.mjs';
import {INTAKE_GROUPS} from '../pulse-v14-src/online/session/intake-model.mjs';
import {onlineHomeBlock} from '../pulse-v14-src/online-passport-dashboard.js';

assert.equal(extractVideoUrl('Zoom: https://us02web.zoom.us/j/123456?pwd=abc'),'https://us02web.zoom.us/j/123456?pwd=abc');
assert.equal(extractVideoUrl('https://meet.google.com/abc-defg-hij'),'https://meet.google.com/abc-defg-hij');
assert.equal(extractVideoUrl('https://teams.microsoft.com/l/meetup-join/abc'),'https://teams.microsoft.com/l/meetup-join/abc');
assert.equal(extractVideoUrl('https://evil-zoom.us/j/12'),null);
assert.equal(extractVideoUrl('http://zoom.us/j/123'),null);
assert.equal(extractVideoUrl('https://attacker.invalid/j/abc'),null);
assert.equal(extractVideoUrl('<img src=x onerror=alert(1)>'),null);
assert.equal(safeAcuityDate('2026-11-06T15:00:00+0100'),'2026-11-06T15:00:00+0100');
assert.equal(safeAcuityDate('2026-11-06T15:00:00'),null,'timezone must not be guessed');
const meeting='https://us02web.zoom.us/j/123?pwd=abc';
const linkHtml=restitutionMarkup({appointmentId:'123456',appointmentAt:'2026-11-06T15:00:00+0100',meetingJoinUrl:meeting});
assert.ok(linkHtml.includes('Rejoindre ma visioconférence'));
assert.ok(linkHtml.includes('data-restitution-appointment="123456"'));
assert.ok(!restitutionMarkup({appointmentId:'123456',meetingJoinUrl:'https://bad.invalid'}).includes('Rejoindre ma visioconférence'));
const answers=Object.fromEntries(INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>[q.id,Array.isArray(q.options[0])?q.options[0][0]:'0'])));
const row={id:'a',appointment_id:'123456',status:'completed',snapshot:{page:4,answers,results:{}}};
assert.ok(onlineHomeBlock([row]).includes('data-restitution-appointment="123456"'));
const app=readFileSync('pulse-v14-src/app.js','utf8');
const dashboard=readFileSync('pulse-v14-src/online-passport-dashboard.js','utf8');
assert.ok(dashboard.includes('void hydrateRestitution(root,getToken)'), 'live data refresh from secure endpoint');
assert.ok(app.includes("S.role==='admin'"),'operator entry admin only');
assert.ok(app.includes('/online/restitutions/'),'operator entry visible');

const initialFetch=globalThis.fetch,uid=process.env.ACUITY_USER_ID,secret=process.env.ACUITY_API_KEY;
process.env.ACUITY_USER_ID='test-id';process.env.ACUITY_API_KEY='test-secret';
let isAdmin=false,called=[];
const appointment={id:123456,appointmentTypeID:99940918,email:'test@example.test',
 firstName:'Test',lastName:'User',datetime:'2026-11-06T15:00:00+0100',duration:20,
 location:meeting,canceled:false,noShow:false};
globalThis.fetch=async(url)=>{
 const uri=String(url);called.push(uri);
 if(uri.includes('/auth/v1/user'))return {ok:true,json:async()=>({id:'operator-1',email_confirmed_at:'2026-10-29T12:00:00Z'})};
 if(uri.includes('/rest/v1/account_roles'))return {ok:true,json:async()=>[{role:isAdmin?'admin':'member'}]};
 if(uri.startsWith('https://acuityscheduling.com/api/v1/appointments/'))return {ok:true,json:async()=>appointment};
 if(uri.startsWith('https://acuityscheduling.com/api/v1/appointments?'))return {ok:true,json:async()=>[appointment]};
 throw Error('unexpected URL '+uri);
};
const makeRes=()=>({statusCode:200,body:null,headers:{},setHeader(k,v){this.headers[k]=v;return this;},status(n){this.statusCode=n;return this;},json(x){this.body=x;return this;}});
const req=(action='list')=>({method:'GET',headers:{origin:'https://pulse.komolongevity.com',authorization:'Bearer test.jwt'},
 query:action==='detail'?{action,appointmentId:'123456'}:{minDate:'2026-10-29',maxDate:'2026-11-06'}});
try{
 let r=makeRes();await schedule(req(),r);assert.equal(r.statusCode,403);
 assert.ok(!called.some(x=>x.includes('acuityscheduling.com')),'non-admin cannot list bookings');
 isAdmin=true;
 r=makeRes();await schedule(req(),r);assert.equal(r.statusCode,200);
 assert.equal(r.body.appointments.length,1);assert.equal(r.body.appointments[0].meetingJoinUrl,meeting);
 assert.ok(!JSON.stringify(r.body).includes('test-secret'));
 r=makeRes();await schedule(req('detail'),r);assert.equal(r.statusCode,200);
 assert.equal(r.body.appointment.id,'123456');
 r=makeRes();await schedule({...req(),query:{minDate:'2026-01-01',maxDate:'2026-11-30'}},r);
 assert.equal(r.statusCode,400,'server limits date range');
 r=makeRes();await schedule({...req(),headers:{origin:'https://attacker.invalid',authorization:'Bearer test.jwt'}},r);
 assert.equal(r.statusCode,403);
}finally{
 globalThis.fetch=initialFetch;
 if(uid===undefined)delete process.env.ACUITY_USER_ID;else process.env.ACUITY_USER_ID=uid;
 if(secret===undefined)delete process.env.ACUITY_API_KEY;else process.env.ACUITY_API_KEY=secret;
}
const source=readFileSync('supabase/functions/motion-online-operator/index.ts','utf8');
const env={SUPABASE_URL:'https://supabase.test',SUPABASE_SERVICE_ROLE_KEY:'service-test-secret'};
let edge,role='member',privateReads=0,audits=0,auditAvailable=true;
const privateRow={appointment_id:'123456',status:'completed',consent_version:'KOMO_MOTION_ONLINE_CONSENT_V1',
 updated_at:'2026-10-29T18:00:00Z',
 snapshot:{page:4,answers,results:{sts:{status:'done',value:14,quality:80}}}};
async function edgeFetch(url,opts={}){
 const uri=String(url);
 if(uri.endsWith('/auth/v1/user'))return new Response(JSON.stringify({id:'operator-1',email_confirmed_at:'2026-10-29T12:00:00Z'}),{status:200});
 if(uri.includes('/rest/v1/account_roles'))return new Response(JSON.stringify([{role}]),{status:200});
 if(uri.includes('/rest/v1/motion_online_sessions')){privateReads++;return new Response(JSON.stringify([privateRow]),{status:200})}
 if(uri.includes('/rest/v1/motion_online_operator_audit')){audits++;return new Response('{}',{status:auditAvailable?201:500})}
 throw Error('unknown edge URL: '+uri);
}
new Function('Deno','fetch','AbortSignal','TextEncoder',source)(
 {env:{get:key=>env[key]},serve:fn=>edge=fn},edgeFetch,AbortSignal,TextEncoder);
const invoke=async body=>{
 const req=new Request('https://supabase.test/functions/v1/motion-online-operator',{
 method:'POST',headers:{authorization:'Bearer test.jwt',origin:'https://pulse.komolongevity.com','content-type':'application/json'},
 body:JSON.stringify(body)});
 const res=await edge(req);return {status:res.status,body:await res.json()};
};
let e=await invoke({mode:'load',appointmentId:'123456'});
assert.equal(e.status,403);assert.equal(privateReads,0,'member cannot trigger sensitive DB query');
role='admin';
e=await invoke({mode:'load',appointmentId:'123456'});
assert.equal(e.status,200);assert.equal(e.body.dossier.results.sts.value,14);assert.equal(audits,1);
const views=await invoke({mode:'status',appointmentIds:['123456']});
assert.equal(views.status,200);assert.ok(!JSON.stringify(views.body).includes('"answers"'),'status must not leak questionnaires');
auditAvailable=false;
e=await invoke({mode:'load',appointmentId:'123456'});
assert.equal(e.status,503,'no dossier if access logging fails');
assert.equal(e.body.dossier,undefined);
e=await invoke({mode:'load',appointmentId:'<script>'});
assert.equal(e.status,400);
for(const file of ['api/_acuity-video.js','api/pulse-online-operator-schedule.js','pulse-v14-src/online/restitutions/app.js',
 'pulse-v14-src/online/session/restitution.mjs','pulse-v14-src/online-passport-dashboard.js']){
 const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(r.status,0,file+': '+r.stderr);
}
console.log('[pulse-operator-video-qa] PASS · admin gates, audit fail-closed, Acuity schedule, meeting URL allowlist, live patient slot and privacy');
