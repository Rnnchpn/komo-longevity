// Contract tests: server-side Acuity payment gate, identity matching and cancelled bookings.
// All Acuity requests are mocked; never call real patient or payment APIs.
import assert from 'node:assert/strict';
import handler from '../api/pulse-online-verify.js';
const originalFetch=globalThis.fetch;
const oldEnv={user:process.env.ACUITY_USER_ID,key:process.env.ACUITY_API_KEY,flag:process.env.PULSE_ONLINE_PAID_SESSION_ENABLED};
process.env.ACUITY_USER_ID='fixture-acuity-id';
process.env.ACUITY_API_KEY='fixture-private-key';
const baseAppointment={appointmentTypeID:99940918,email:'patient.test@example.invalid',canceled:false,noShow:false,price:49,amountDue:0,paid:true};
const baseTransactions=[{transactionID:'fixture-charge',processor:'stripe',amount:49}];
const user={id:'fixture-user',email:'patient.test@example.invalid',email_confirmed_at:'2026-10-29T10:00:00Z',is_anonymous:false};
function mockResponse(data,code=200){return {ok:code>=200&&code<300,status:code,json:async()=>data};}
async function invoke({appt=baseAppointment,payments=baseTransactions,account=user,origin='https://pulse.komolongevity.com',id='1234567',token='fixture.jwt.token',flag='true',method='POST',acuityConfigured=true}={}){
 process.env.PULSE_ONLINE_PAID_SESSION_ENABLED=flag;
 if(!acuityConfigured)delete process.env.ACUITY_API_KEY;
 else process.env.ACUITY_API_KEY='fixture-private-key';
 const requests=[];
 globalThis.fetch=async(url)=>{
  requests.push(url);
  if(url.endsWith('/auth/v1/user'))return mockResponse(account);
  if(url.endsWith('/appointments/'+id))return mockResponse(appt);
  if(url.endsWith('/appointments/'+id+'/payments'))return mockResponse(payments);
  throw Error('No network access expected: '+url);
 };
 const req={method,headers:{origin,authorization:'Bearer '+token},body:{appointmentId:id}};
 const res={code:200,headers:{},payload:null,
  setHeader(k,v){this.headers[k]=v;return this;},
  status(code){this.code=code;return this;},
  json(body){this.payload=body;return this;}
 };
 try{await handler(req,res);return {status:res.code,body:res.payload,requests,headers:res.headers};}
 finally{globalThis.fetch=originalFetch;}
}
try{
 let r=await invoke();
 assert.equal(r.status,200);
 assert.equal(r.body.eligible,true);
 assert.equal(r.body.paid,true);
 assert.equal(r.body.canStart,true);
 assert.equal(r.requests.length,3,'Three validated server requests: Auth user, Acuity booking, Acuity transactions');
 assert.equal(r.headers['Cache-Control'],'no-store, private, max-age=0');
 r=await invoke({flag:'false'});
 assert.equal(r.status,200);
 assert.equal(r.body.canStart,false,'Fail closed until the operational release flag is enabled');
 r=await invoke({appt:{...baseAppointment,email:'someone.else@example.invalid'}});
 assert.equal(r.status,403);
 assert.equal(r.body.error,'booking_not_eligible');
 assert.equal(r.requests.length,2,'Email mismatch must never query or expose payment details');
 r=await invoke({appt:{...baseAppointment,appointmentTypeID:111111}});
 assert.equal(r.status,403);
 r=await invoke({appt:{...baseAppointment,canceled:true}});
 assert.equal(r.status,403);
 r=await invoke({appt:{...baseAppointment,noShow:true}});
 assert.equal(r.status,403);
 r=await invoke({payments:[]});
 assert.equal(r.status,403);
 assert.equal(r.body.error,'payment_not_confirmed');
 r=await invoke({payments:[{transactionID:'manual-not-processor',processor:'cash',amount:49}]});
 assert.equal(r.status,403);
 r=await invoke({payments:[{transactionID:'fixture-partial',processor:'stripe',amount:30}]});
 assert.equal(r.status,403);
 r=await invoke({appt:{...baseAppointment,amountDue:19}});
 assert.equal(r.status,403);
 r=await invoke({appt:{...baseAppointment,price:40}});
 assert.equal(r.status,403);
 r=await invoke({account:{...user,email_confirmed_at:null}});
 assert.equal(r.status,403);
 r=await invoke({account:{...user,is_anonymous:true}});
 assert.equal(r.status,403);
 r=await invoke({origin:'https://malicious.example.invalid'});
 assert.equal(r.status,403);
 assert.equal(r.body.error,'origin_not_allowed');
 r=await invoke({acuityConfigured:false});
 assert.equal(r.status,503);
 assert.equal(r.body.error,'booking_verification_not_configured');
 r=await invoke({method:'GET'});
 assert.equal(r.status,405);
 r=await invoke({id:'bad-id'});
 assert.equal(r.status,400);
 console.log('[pulse-online49-security-qa] PASS · payment, type, owner, cancelled, unpaid, release flag, CORS, no secret exposure (fixtures only)');
}finally{
 globalThis.fetch=originalFetch;
 if(oldEnv.user===undefined)delete process.env.ACUITY_USER_ID;else process.env.ACUITY_USER_ID=oldEnv.user;
 if(oldEnv.key===undefined)delete process.env.ACUITY_API_KEY;else process.env.ACUITY_API_KEY=oldEnv.key;
 if(oldEnv.flag===undefined)delete process.env.PULSE_ONLINE_PAID_SESSION_ENABLED;else process.env.PULSE_ONLINE_PAID_SESSION_ENABLED=oldEnv.flag;
}
