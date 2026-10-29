import assert from 'node:assert/strict';
import handler from '../api/pulse-online-verify.js';

// No real payment, API credentials or email is used by these contract tests.
const previousFetch=globalThis.fetch;
const previousId=process.env.ACUITY_USER_ID;
const previousKey=process.env.ACUITY_API_KEY;
const previousFlag=process.env.PULSE_ONLINE_PAID_SESSION_ENABLED;
delete process.env.PULSE_ONLINE_PAID_SESSION_ENABLED;
process.env.ACUITY_USER_ID='demo-user';
process.env.ACUITY_API_KEY='demo-server-secret';
let identity={id:'demo-auth-uid',email:'booker@example.test',email_confirmed_at:'2026-10-29T12:00:00Z'};
let appointment={id:123456,appointmentTypeID:99940918,email:'booker@example.test',price:'49.00',amountDue:'0',canceled:false,noShow:false,datetime:'2026-11-06T14:00:00+0100',duration:30,location:'https://us02web.zoom.us/j/123456?pwd=only-for-payer'};
let payments=[{transactionID:'pi_demo',processor:'stripe',amount:'49.00'}];
let fetchCalls=[];
globalThis.fetch=async(url,options)=>{
 fetchCalls.push(String(url));
 if(String(url).includes('/auth/v1/user'))return{ok:true,status:200,json:async()=>identity};
 if(String(url).endsWith('/payments'))return{ok:true,status:200,json:async()=>payments};
 if(String(url).includes('/api/v1/appointments/'))return{ok:true,status:200,json:async()=>appointment};
 throw Error('unexpected external URL');
};
function response(){
 return {statusCode:200,body:null,headers:{},setHeader(k,v){this.headers[k]=v;return this;},status(n){this.statusCode=n;return this;},json(o){this.body=o;return this;}};
}
const request=(id='123456',token='valid.jwt.token')=>({method:'POST',headers:{origin:'https://pulse.komolongevity.com',authorization:'Bearer '+token},body:{appointmentId:id}});
async function check(req,expected){const res=response();await handler(req,res);assert.equal(res.statusCode,expected);return res;}
try{
 let r=await check(request(),200);
 assert.equal(r.body.eligible,true);
 assert.equal(r.body.paid,true);
 assert.equal(r.body.appointmentAt,'2026-11-06T14:00:00+0100');
 assert.equal(r.body.appointmentMinutes,30);
 assert.equal(r.body.meetingJoinUrl,'https://us02web.zoom.us/j/123456?pwd=only-for-payer');
 assert.equal(JSON.stringify(r.body).includes('booker@example'),false);
 assert.equal(r.body.canStart,false,'commercial access must default to disabled');
 process.env.PULSE_ONLINE_PAID_SESSION_ENABLED='true';
 r=await check(request(),200);
 assert.equal(r.body.canStart,true,'server enables paid entry when explicitly configured');
 delete process.env.PULSE_ONLINE_PAID_SESSION_ENABLED;
 assert.equal(JSON.stringify(r.body).includes('booker@example'),false);
 appointment={...appointment,datetime:'2026-11-06T14:00:00'};
 const timezoneUnknown=await check(request(),200);
 assert.equal(timezoneUnknown.body.appointmentAt,null,'Do not guess timezone for offset-free dates');
 appointment={...appointment,datetime:'2026-11-06T14:00:00+0100'};
 appointment={...appointment,location:'https://attacker.invalid/meeting'};
 const unsafeUrl=await check(request(),200);
 assert.equal(unsafeUrl.body.meetingJoinUrl,null,'Only known video providers may be surfaced');
 appointment={...appointment,location:'https://us02web.zoom.us/j/123456?pwd=only-for-payer'};
 assert.ok(fetchCalls.some(u=>u.endsWith('/payments')));

 r=await check({method:'GET',headers:{},body:{}},405);
 r=await check({method:'POST',headers:{},body:{appointmentId:'123456'}},401);
 r=await check(request('bad'),400);

 payments=[];
 r=await check(request(),403);
 assert.equal(r.body.error,'payment_not_confirmed');

 payments=[{transactionID:'pi_demo',processor:'stripe',amount:'49.00'}];
 appointment={...appointment,email:'another@example.test'};
 r=await check(request(),403);
 assert.equal(r.body.error,'booking_not_eligible');

 appointment={...appointment,email:'booker@example.test',canceled:true};
 r=await check(request(),403);
 assert.equal(r.body.error,'booking_not_eligible');

 appointment={...appointment,canceled:false,appointmentTypeID:123};
 r=await check(request(),403);
 assert.equal(r.body.error,'booking_not_eligible');

 appointment={...appointment,appointmentTypeID:99940918,price:'0.00'};
 r=await check(request(),403);
 assert.equal(r.body.error,'payment_not_confirmed');

 appointment={...appointment,price:'49.00'};
 identity={...identity,email_confirmed_at:null};
 r=await check(request(),403);
 assert.equal(r.body.error,'email_not_verified');

 identity={...identity,email_confirmed_at:'2026-10-29T12:00:00Z'};
 r=await check({method:'POST',headers:{origin:'https://malicious.invalid',authorization:'Bearer valid.jwt.token'},body:{appointmentId:'123456'}},403);
 assert.equal(r.body.error,'origin_not_allowed');
 console.log('[pulse-online-payment-qa] 10 server contract checks passed');
}finally{
 globalThis.fetch=previousFetch;
 if(previousId===undefined)delete process.env.ACUITY_USER_ID;else process.env.ACUITY_USER_ID=previousId;
 if(previousKey===undefined)delete process.env.ACUITY_API_KEY;else process.env.ACUITY_API_KEY=previousKey;
 if(previousFlag===undefined)delete process.env.PULSE_ONLINE_PAID_SESSION_ENABLED;else process.env.PULSE_ONLINE_PAID_SESSION_ENABLED=previousFlag;
}
