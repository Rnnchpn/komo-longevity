// Test booking entitlement and fail-closed Acuity ingestion. No real emails are sent.
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import webhook from '../api/acuity-booking-webhook.js';
const root=process.cwd();
const app=await readFile(join(root,'site','pulse-v14','app.js'),'utf8');
const sql=await readFile(join(root,'supabase','migrations','20261026140000_commercial_booking_account_claim_v1.sql'),'utf8');
const webhookSource=await readFile(join(root,'api','acuity-booking-webhook.js'),'utf8');
const checks=[
 ['magic link sign in',app.includes('signInWithOtp')&&app.includes('shouldCreateUser:true')],
 ['booking email needed',app.includes('la même adresse e-mail')||app.includes('la même adresse e-mail que')],
 ['booking claim',app.includes("rpc('claim_my_komo_booking')")],
 ['only private bookings selected',app.includes(".eq('pulse_user_id',S.user.id).eq('booking_source','acuity')")],
 ['standalone patient booking view',app.includes('function bookedPortal()')&&app.includes('Mes consultations')],
 ['no health score for new booking-only accounts',app.includes('await loadBookedAccount();bookedPortal();return')],
 ['no auto clinical role assignment',!webhookSource.includes('account_roles')&&!webhookSource.includes('/rest/v1/patients')],
 ['webhook raw HMAC',webhookSource.includes('timingSafeEqual')&&webhookSource.includes("createHmac('sha256'")&&webhookSource.includes('bodyParser:false')],
 ['calendar allowlist',webhookSource.includes('ACUITY_PARIS_CALENDAR_ID')&&webhookSource.includes('ACUITY_CANNES_CALENDAR_ID')],
 ['backend requires service role',webhookSource.includes('SUPABASE_SERVICE_ROLE_KEY')],
 ['upsert idempotent',webhookSource.includes('on_conflict=acuity_appointment_id')],
 ['idempotent invitation',webhookSource.includes('reserve_komo_pulse_invitation')&&webhookSource.includes('complete_komo_pulse_invitation')],
 ['RPC verifies email and signup',sql.includes('email_confirmed_at is not null')&&sql.includes('is_anonymous=false')],
 ['deny group email crossover',sql.includes('if v_names>1')],
 ['clinical table unchanged',!sql.includes('alter table public.patients')],
 ['no public claim',sql.includes('grant execute on function public.claim_my_komo_booking() to authenticated')],
 ['strict new patient row scope',sql.includes("pulse_user_id = (select auth.uid()) and booking_source='acuity'")],
 ['no patient medical info in webhook',!webhookSource.includes('assessment_id')&&!webhookSource.includes('medical_history')]
];
const failure=checks.filter(x=>!x[1]).map(x=>x[0]);
function fakeRes(){
 return {code:null,payload:null,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(k){this.code=k;return this},json(x){this.payload=x;return this}};
}
const old=Object.fromEntries(['SUPABASE_SERVICE_ROLE_KEY','ACUITY_PARIS_CALENDAR_ID'].map(k=>[k,process.env[k]]));
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.ACUITY_PARIS_CALENDAR_ID;
const noConfig=fakeRes();await webhook({method:'POST',headers:{}},noConfig);
if(noConfig.code!==503||noConfig.payload?.status!=='configuration_pending')failure.push('webhook fail closed');
const wrongMethod=fakeRes();await webhook({method:'GET',headers:{}},wrongMethod);
if(wrongMethod.code!==405)failure.push('no GET on webhook');
for(const k of Object.keys(old)){if(old[k]!==undefined)process.env[k]=old[k]}
const clean=app.replace(/^import .*?;\n/gm,'');
new Function(clean.slice(0,clean.indexOf("window.addEventListener('hashchange'")));
if(failure.length){console.error('[booking-invite-qa] FAILED: '+failure.join(', '));process.exit(1)}
console.log('[booking-invite-qa] '+(checks.length+2)+' security and patient-journey checks passed');
