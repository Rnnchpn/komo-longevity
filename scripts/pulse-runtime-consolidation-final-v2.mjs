import { readFile, writeFile } from 'node:fs/promises';

const root='site/pulse-v12/';
const read=name=>readFile(root+name,'utf8');
const write=(name,src)=>writeFile(root+name,src,'utf8');

function replaceRequired(src,from,to,label){
  if(src.includes(to))return src;
  if(!src.includes(from))throw new Error('[pulse-runtime-final-v2] missing '+label);
  return src.replace(from,to);
}

// 1) Shared auth runtime: NEVER perform a Supabase query inside onAuthStateChange.
// Supabase documents a possible deadlock when async client API calls are made there.
let perf=await read('performance-runtime-v1.js');
perf=replaceRequired(
  perf,
  "let rolePromise=null,authSubscription=null,syncPromise=null,lastSyncAt=0;",
  "let authSubscription=null,syncPromise=null,lastSyncAt=0;",
  'performance runtime state'
);
const hydrateFrom=`async function hydrate(session,forcedRole=null){
  const previous=R.userId;
  R.session=session||null;R.userId=session?.user?.id||null;
  if(!session?.user){
    R.role='member';R.ready=true;
    if(previous)window.dispatchEvent(new CustomEvent('komo:session-cleared'));
    return R;
  }
  if(forcedRole){R.role=forcedRole;R.ready=true;window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session:R.session,role:R.role}}));return R}
  if(!rolePromise)rolePromise=R.client.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle().then(x=>x.data?.role||'member').catch(()=> 'member').finally(()=>{rolePromise=null});
  R.role=await rolePromise;R.ready=true;window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session:R.session,role:R.role}}));return R;
}`;
const hydrateTo=`async function hydrate(session,forcedRole=null){
  const previous=R.userId;
  R.session=session||null;R.userId=session?.user?.id||null;
  if(!session?.user){
    R.role='member';R.ready=true;
    if(previous)window.dispatchEvent(new CustomEvent('komo:session-cleared'));
    return R;
  }
  if(forcedRole)R.role=forcedRole;
  R.ready=true;
  window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session:R.session,role:R.role,roleResolved:!!forcedRole}}));
  return R;
}`;
perf=replaceRequired(perf,hydrateFrom,hydrateTo,'deadlock-free hydrate');
if(/onAuthStateChange[\s\S]{0,500}account_roles/.test(perf))throw new Error('[pulse-runtime-final-v2] account_roles query remains in auth callback');
await write('performance-runtime-v1.js',perf);

// 2) app-router is the single owner of account role resolution.
// Reuse the shared runtime client instead of constructing/adopting another client.
let router=await read('app-router-v2.js');
router=replaceRequired(
  router,
  "function syncClient() { state.client = makeClient(selectedStorage()); window.KomoRuntime=window.KomoRuntime||{}; if(window.KomoRuntime.adoptClient)window.KomoRuntime.adoptClient(state.client);else window.KomoRuntime.client=state.client; return state.client; }",
  "function syncClient() { window.KomoRuntime=window.KomoRuntime||{}; state.client=window.KomoRuntime.client||makeClient(selectedStorage()); if(!window.KomoRuntime.client){if(window.KomoRuntime.adoptClient)window.KomoRuntime.adoptClient(state.client);else window.KomoRuntime.client=state.client} return state.client; }",
  'shared app-router client'
);
router=replaceRequired(
  router,
  "const [profileRes,roleRes]=await Promise.all([state.client.from('profiles').select('*').eq('id',userId).maybeSingle(),state.client.from('account_roles').select('role').eq('user_id',userId).maybeSingle()]);\n  state.profile=profileRes.data||{display_name:state.user.user_metadata?.display_name||'',city:null,country:null};state.role=roleRes.data?.role||'member';window.KomoRuntime?.setContext?.(state.session,state.role);",
  "let [profileRes,roleRes]=await Promise.all([state.client.from('profiles').select('*').eq('id',userId).maybeSingle(),state.client.from('account_roles').select('role').eq('user_id',userId).maybeSingle()]);\n  if(roleRes.error){await new Promise(resolve=>setTimeout(resolve,120));roleRes=await state.client.from('account_roles').select('role').eq('user_id',userId).maybeSingle()}\n  state.profile=profileRes.data||{display_name:state.user.user_metadata?.display_name||'',city:null,country:null};const sharedRole=window.KomoRuntime?.role;state.role=roleRes.data?.role||(['admin','professional'].includes(sharedRole)?sharedRole:'member');window.KomoRuntime?.setContext?.(state.session,state.role);",
  'resilient role resolution'
);
await write('app-router-v2.js',router);

// 3) Clinical must never demote a global admin to professional.
// It also consumes the role already resolved by app-router.
let clinical=await read('clinical-cockpit-v1.js');
clinical=replaceRequired(
  clinical,
  "const rr=await c.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();const accountRole=rr.data?.role||'member';s.role=route()==='clinical'&&accountRole==='admin'?'professional':accountRole;",
  "let accountRole=window.KomoRuntime?.role||'member';if(!['admin','professional'].includes(accountRole)){const rr=await c.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();accountRole=rr.data?.role||'member'}s.role=accountRole;",
  'clinical admin preservation'
);
clinical=replaceRequired(
  clinical,
  "async function createAppointment(e){e.preventDefault();if(!s.patient||!s.org)return;const f=new FormData(e.currentTarget),start=new Date(String(f.get('start'))),duration=Number(f.get('duration')||60);if(Number.isNaN(start.getTime()))return toast('Date invalide.');const row={organization_id:s.org.id,patient_id:s.patient.id,assigned_user_id:s.session.user.id,appointment_type:String(f.get('appointment_type')),scheduled_start:start.toISOString(),scheduled_end:new Date(start.getTime()+duration*60000).toISOString(),status:'scheduled',location_mode:String(f.get('location_mode')),created_by:s.session.user.id};",
  "async function createAppointment(e){e.preventDefault();if(!s.patient)return;const organizationId=s.patient.organization_id||s.org?.id;if(!organizationId)return toast('Centre patient introuvable.');const f=new FormData(e.currentTarget),start=new Date(String(f.get('start'))),duration=Number(f.get('duration')||60);if(Number.isNaN(start.getTime()))return toast('Date invalide.');const row={organization_id:organizationId,patient_id:s.patient.id,assigned_user_id:s.session.user.id,appointment_type:String(f.get('appointment_type')),scheduled_start:start.toISOString(),scheduled_end:new Date(start.getTime()+duration*60000).toISOString(),status:'scheduled',location_mode:String(f.get('location_mode')),created_by:s.session.user.id};",
  'admin appointment organization'
);
if(clinical.includes("accountRole==='admin'?'professional'"))throw new Error('[pulse-runtime-final-v2] admin demotion survived');
await write('clinical-cockpit-v1.js',clinical);

// 4) Peripheral Pro surfaces consume shared role first and query only as fallback.
let pro=await read('pro-access-v1.js');
pro=replaceRequired(
  pro,
  "if(checkedFor!==session.user.id){checkedFor=session.user.id;const r=await sb.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();role=r.data?.role||'member'}",
  "if(checkedFor!==session.user.id){checkedFor=session.user.id;const shared=window.KomoRuntime?.role;if(['admin','professional'].includes(shared))role=shared;else{const r=await sb.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();role=r.data?.role||'member'}}",
  'Pro role fallback'
);
await write('pro-access-v1.js',pro);

let scope=await read('professional-scope-v1.js');
scope=replaceRequired(
  scope,
  "const rr=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();role=rr.data?.role||'member';if(role==='admin'){scope='clinical';return}",
  "const shared=window.KomoRuntime?.role;if(['admin','professional'].includes(shared))role=shared;else{const rr=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();role=rr.data?.role||'member'}if(role==='admin'){scope='clinical';return}",
  'professional scope shared role'
);
await write('professional-scope-v1.js',scope);

let booking=await read('booking-layer-v1.js');
booking=replaceRequired(
  booking,
  "async function base(){const {data:{session}}=await sb().auth.getSession();S.session=session;if(!session?.user)return false;const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';return true}",
  "async function base(){const {data:{session}}=await sb().auth.getSession();S.session=session;if(!session?.user)return false;const shared=window.KomoRuntime?.role;if(['admin','professional'].includes(shared))S.role=shared;else{const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member'}return true}",
  'booking shared role'
);
await write('booking-layer-v1.js',booking);

// 5) Load the session owner before the app router; both are modules, so source order is deterministic.
let html=await read('index.html');
const routerTag=html.match(/\s*<script type="module" src="\.\/app-router-v2\.js[^"]*"><\/script>/)?.[0]||'';
const perfTag=html.match(/\s*<script type="module" src="\.\/performance-runtime-v1\.js[^"]*"><\/script>/)?.[0]||'';
if(!routerTag||!perfTag)throw new Error('[pulse-runtime-final-v2] runtime script tags missing');
html=html.replace(routerTag,'').replace(perfTag,'');
const runtimeAnchor=html.match(/\s*<script src="\.\/komo-avatar-v1\.js[^"]*"><\/script>/)?.[0];
if(!runtimeAnchor)throw new Error('[pulse-runtime-final-v2] avatar anchor missing');
html=html.replace(runtimeAnchor,runtimeAnchor+perfTag+routerTag);
await write('index.html',html);

console.log('[pulse-runtime-final-v2] PASS · one session owner · app-router role owner · admin preserved · consultation org fixed');
