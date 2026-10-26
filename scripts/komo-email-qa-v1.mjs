// KŌMØ transactional invitation QA: entirely mocked, no real mail or patient records.
import {createHmac} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {renderPulseInvitation,sendPulseInvitation} from '../lib/komo-pulse-invitation.mjs';
import webhook from '../api/acuity-booking-webhook.js';
const template=renderPulseInvitation({firstName:'Alice'});
const hostile=renderPulseInvitation({firstName:'<script>alert(1)</script>'});
const checks=[
 ['exact sender',template.from==='KŌMØ Longevity <contact@komolongevity.com>'],
 ['replies to same mailbox',template.reply_to==='contact@komolongevity.com'],
 ['French premium layout',template.html.includes('VOTRE PARCOURS EN TROIS ÉTAPES')&&template.html.includes('KŌMØ')],
 ['correct link',template.html.includes('https://pulse.komolongevity.com/#inscription')],
 ['HTML escaping',!hostile.html.includes('<script>alert(1)</script>')],
 ['text version',template.text.includes('contact@komolongevity.com')],
 ['no sensitive report in HTML',!template.html.includes('Motion Score')&&!template.html.includes('Diagnostic')]
];
let called=0,seen;
const fakeFetch=async(url,options)=>{called++;seen={url,options};return {ok:true,json:async()=>({id:'mail_0001'})}};
const sent=await sendPulseInvitation({email:'alice@example.invalid',firstName:'Alice',bookingId:123,apiKey:'test-only',fetchImpl:fakeFetch});
checks.push(
 ['provider simulated',sent.ok&&sent.id==='mail_0001'&&called===1],
 ['Resend domain',seen?.url==='https://api.resend.com/emails'],
 ['correct from payload',JSON.parse(seen.options.body).from===template.from],
 ['idempotency header',seen.options.headers['Idempotency-Key']==='komo-pulse-welcome-v1-123'],
 ['no API key returned',!JSON.stringify(sent).includes('test-only')]
);
const unsigned=await sendPulseInvitation({email:'alice@example.invalid',firstName:'Alice',bookingId:123,apiKey:null,fetchImpl:fakeFetch});
checks.push(['no sender key = no send',unsigned.code==='sender_not_configured'&&called===1]);
const oldFetch=globalThis.fetch;
const keys=['ACUITY_USER_ID','ACUITY_API_KEY','ACUITY_PARIS_CALENDAR_ID','ACUITY_CANNES_CALENDAR_ID','SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY'];
const previous=Object.fromEntries(keys.map(x=>[x,process.env[x]]));
Object.assign(process.env,{ACUITY_USER_ID:'123',ACUITY_API_KEY:'test-webhook-key',ACUITY_PARIS_CALENDAR_ID:'42',SUPABASE_SERVICE_ROLE_KEY:'service-key-test',RESEND_API_KEY:'resend-key-test'});
let hits=[];
function mockResponse(json,status=200){return {ok:status>=200&&status<300,status,json:async()=>json}}
globalThis.fetch=async(url,opts={})=>{
 const path=String(url);hits.push(path);
 if(path.includes('acuityscheduling.com/api/v1/appointments/'))return mockResponse({id:666,email:'alice@example.invalid',firstName:'Alice',lastName:'Client',calendarID:42,type:'Motion Initial',datetime:'2026-10-28T10:00:00+01:00',canceled:false});
 if(path.includes('komo_commercial_contacts?select='))return mockResponse([]);
 if(path.includes('/rpc/reserve_komo_pulse_invitation'))return mockResponse(true);
 if(path.includes('/rpc/complete_komo_pulse_invitation'))return mockResponse(true);
 if(path.includes('/rest/v1/komo_commercial_contacts?on_conflict='))return mockResponse(null,204);
 if(path.includes('api.resend.com/emails'))return mockResponse({id:'mail_mock_confirmed'});
 throw new Error('Unexpected outgoing URL '+path);
};
function fakeReq(action='changed'){
 const raw=Buffer.from('action='+encodeURIComponent(action)+'&id=666');
 return {method:'POST',headers:{'x-acuity-signature':createHmac('sha256','test-webhook-key').update(raw).digest('base64')},async *[Symbol.asyncIterator](){yield raw}};
}
function fakeRes(){return {statusCode:200,payload:null,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(c){this.statusCode=c;return this},json(v){this.payload=v;return this}}}
try{
 const success=fakeRes();
 await webhook(fakeReq('changed'),success);
 checks.push(
  ['signed event accepted',success.statusCode===200&&success.payload?.status==='booking_recorded_invitation_sent'],
  ['email only after booking persisted',hits.findIndex(x=>x.includes('komo_commercial_contacts?on_conflict='))<hits.findIndex(x=>x.includes('api.resend.com/emails'))],
  ['atomic claim before send',hits.findIndex(x=>x.includes('/rpc/reserve_komo'))<hits.findIndex(x=>x.includes('api.resend.com/emails'))],
  ['sent marker after send',hits.findIndex(x=>x.includes('/rpc/complete_komo'))>hits.findIndex(x=>x.includes('api.resend.com/emails'))]
 );
 hits=[];
 const canceled=fakeRes();
 await webhook(fakeReq('canceled'),canceled);
 checks.push(['cancel never emails',canceled.statusCode===200&&!hits.some(x=>x.includes('api.resend.com/emails'))]);
}finally{
 globalThis.fetch=oldFetch;
 for(const k of keys){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k]}
}
const sql=await readFile(join(process.cwd(),'supabase','migrations','20261026150000_komo_pulse_invitation_delivery.sql'),'utf8');
checks.push(['only service role may reserve',sql.includes('grant execute on function public.reserve_komo_pulse_invitation(bigint) to service_role')&&sql.includes('revoke all on function public.reserve_komo_pulse_invitation(bigint) from public,anon,authenticated')]);
const fail=checks.filter(x=>!x[1]).map(x=>x[0]);
if(fail.length){console.error('[komo-email-qa] FAIL: '+fail.join(', '));process.exit(1)}
console.log('[komo-email-qa] '+checks.length+' checks passed (no real mail sent)');
