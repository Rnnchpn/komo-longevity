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
  "R.session=R.session||null;R.role=R.role||'member';R.userId=R.userId||null;R.ready=!!R.session;",
  "R.session=R.session||null;R.role=R.role||'member';R.userId=R.userId||null;R.ready=!!R.session;R.roleResolved=R.roleResolved===true;",
  'runtime roleResolved state'
);
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
    R.role='member';R.roleResolved=false;R.ready=true;
    if(previous)window.dispatchEvent(new CustomEvent('komo:session-cleared'));
    return R;
  }
  if(previous&&previous!==R.userId){R.role='member';R.roleResolved=false}
  if(forcedRole){R.role=forcedRole;R.roleResolved=true}
  R.ready=true;
  window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session:R.session,role:R.role,roleResolved:R.roleResolved}}));
  return R;
}`;
perf=replaceRequired(perf,hydrateFrom,hydrateTo,'deadlock-free hydrate');
perf=replaceRequired(
  perf,
  "R.getContext=()=>({client:R.client,session:R.session,role:R.role,ready:R.ready});",
  "R.getContext=()=>({client:R.client,session:R.session,role:R.role,roleResolved:R.roleResolved,ready:R.ready});",
  'runtime roleResolved context'
);
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
// The app-router is the sole login owner. Signup, recovery and logout are owned by
// patient-onboarding/auth-gateway, runtime.js and logout-hardening respectively.
const authBindFrom="els.loginForm.addEventListener('submit',login);els.signupButton.addEventListener('click',signup);els.forgotPasswordButton.addEventListener('click',resetPassword);";
if(router.includes(authBindFrom))router=router.replace(authBindFrom,"els.loginForm.addEventListener('submit',login);");
const logoutBindFrom="els.logoutButton.addEventListener('click',logout);els.refreshButton.addEventListener('click',async()=>{await loadAppData();renderRoute(currentRoute());toast('Données actualisées.')});";
if(router.includes(logoutBindFrom))router=router.replace(logoutBindFrom,"els.refreshButton.addEventListener('click',async()=>{await loadAppData();renderRoute(currentRoute());toast('Données actualisées.')});");
if(router.includes("signupButton.addEventListener('click',signup)")||router.includes("forgotPasswordButton.addEventListener('click',resetPassword)")||router.includes("logoutButton.addEventListener('click',logout)"))throw new Error('[pulse-runtime-final-v2] duplicate app-router auth action owner survived');
await write('app-router-v2.js',router);

// Retire the capture-phase REST login owner while retaining the visual/bootstrap
// code in auth-login-canonical.js.
let canonical=await read('auth-login-canonical.js');
const canonicalOwner="document.addEventListener('submit',canonicalLogin,true);";
if(canonical.includes(canonicalOwner))canonical=canonical.replace(canonicalOwner,"// login owned by app-router-v2");
canonical=canonical.replace("window.KomoCanonicalLogin={version:'1',authKey:AUTH_KEY};","window.KomoCanonicalLogin={version:'retired',owner:'app-router-v2',authKey:AUTH_KEY};");
if(canonical.includes(canonicalOwner))throw new Error('[pulse-runtime-final-v2] duplicate canonical login owner survived');
await write('auth-login-canonical.js',canonical);

// 3) Clinical must never demote a global admin to professional.
// It also consumes the role already resolved by app-router.
let clinical=await read('clinical-cockpit-v1.js');
clinical=replaceRequired(
  clinical,
  "const rr=await c.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();const accountRole=rr.data?.role||'member';s.role=route()==='clinical'&&accountRole==='admin'?'professional':accountRole;",
  "const rt=window.KomoRuntime;let accountRole=rt?.role||'member';if(!rt?.roleResolved){const rr=await c.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();accountRole=rr.data?.role||'member';if(rt){rt.role=accountRole;rt.roleResolved=true}}s.role=accountRole;",
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
  "if(checkedFor!==session.user.id){checkedFor=session.user.id;const rt=window.KomoRuntime;if(rt?.roleResolved)role=rt.role||'member';else{const r=await sb.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();role=r.data?.role||'member';if(rt){rt.role=role;rt.roleResolved=true}}}",
  'Pro role fallback'
);
await write('pro-access-v1.js',pro);

let scope=await read('professional-scope-v1.js');
scope=replaceRequired(
  scope,
  "const rr=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();role=rr.data?.role||'member';if(role==='admin'){scope='clinical';return}",
  "const rt=window.KomoRuntime;if(rt?.roleResolved)role=rt.role||'member';else{const rr=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();role=rr.data?.role||'member';if(rt){rt.role=role;rt.roleResolved=true}}if(role==='admin'){scope='clinical';return}",
  'professional scope shared role'
);
await write('professional-scope-v1.js',scope);

let booking=await read('booking-layer-v1.js');
booking=replaceRequired(
  booking,
  "async function base(){const {data:{session}}=await sb().auth.getSession();S.session=session;if(!session?.user)return false;const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';return true}",
  "async function base(){const {data:{session}}=await sb().auth.getSession();S.session=session;if(!session?.user)return false;const rt=window.KomoRuntime;if(rt?.roleResolved)S.role=rt.role||'member';else{const r=await sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();S.role=r.data?.role||'member';if(rt){rt.role=S.role;rt.roleResolved=true}}return true}",
  'booking shared role'
);
await write('booking-layer-v1.js',booking);

// 5) Patient intake completeness must match the backend contract.
// Sex at birth can remain unstated at onboarding and must not block Motion preparation.
let intake=await read('patient-intake-v1.js');
intake=replaceRequired(
  intake,
  "return{ok:!!(x?.first_name&&x?.last_name&&x?.birth_date&&x?.sex_at_birth),profile:x||{}};",
  "return{ok:!!(x?.first_name&&x?.last_name&&x?.birth_date),profile:x||{}};",
  'patient intake profile completeness'
);
intake=intake.replace(
  'Prénom, nom, date de naissance et sexe de référence sont requis pour préparer Motion.',
  'Prénom, nom et date de naissance sont requis pour préparer Motion.'
);
await write('patient-intake-v1.js',intake);

let adaptive=await read('adaptive-shell-v4.js');
if(!adaptive.includes('async function verifyRole')||!adaptive.includes('komo:role-ready'))throw new Error('[pulse-runtime-final-v2] adaptive role verifier missing');
const patientNavFrom=`    const r=route();
    return navItem('patient:home','Accueil',I.home,r==='home')+navItem('patient:key','KEY',I.follow,r==='key')+navItem('patient:results','Résultats',I.tests,r==='results')+navItem('patient:trajectory','Trajectoire',I.results,r==='trajectory')+navItem('more','Plus',I.more,false);`;
const patientNavTo=`    const r=route();
    if(allowedAdmin())return navItem('patient:home','Accueil',I.home,r==='home')+navItem('patient:results','Résultats',I.tests,r==='results')+navItem('pro:dashboard','Pro',I.center,false)+navItem('admin','Admin',I.admin,false)+navItem('more','Plus',I.more,false);
    if(allowedPro())return navItem('patient:home','Accueil',I.home,r==='home')+navItem('patient:results','Résultats',I.tests,r==='results')+navItem('patient:trajectory','Trajectoire',I.results,r==='trajectory')+navItem('pro:dashboard','Pro',I.center,false)+navItem('more','Plus',I.more,false);
    return navItem('patient:home','Accueil',I.home,r==='home')+navItem('patient:key','KEY',I.follow,r==='key')+navItem('patient:results','Résultats',I.tests,r==='results')+navItem('patient:trajectory','Trajectoire',I.results,r==='trajectory')+navItem('more','Plus',I.more,false);`;
if(adaptive.includes(patientNavFrom))adaptive=adaptive.replace(patientNavFrom,patientNavTo);
if(!adaptive.includes("navItem('admin','Admin',I.admin,false)"))throw new Error('[pulse-runtime-final-v2] explicit mobile Admin entry missing');
await write('adaptive-shell-v4.js',adaptive);

// 6) Load the session owner before the app router; both are modules, so source order is deterministic.
let html=await read('index.html');
const routerTag=html.match(/\s*<script type="module" src="\.\/app-router-v2\.js[^"]*"><\/script>/)?.[0]||'';
const perfTag=html.match(/\s*<script type="module" src="\.\/performance-runtime-v1\.js[^"]*"><\/script>/)?.[0]||'';
if(!routerTag||!perfTag)throw new Error('[pulse-runtime-final-v2] runtime script tags missing');
html=html.replace(routerTag,'').replace(perfTag,'');
const runtimeAnchor=html.match(/\s*<script src="\.\/komo-avatar-v1\.js[^"]*"><\/script>/)?.[0];
if(!runtimeAnchor)throw new Error('[pulse-runtime-final-v2] avatar anchor missing');
html=html.replace(runtimeAnchor,runtimeAnchor+perfTag+routerTag);
await write('index.html',html);

console.log('[pulse-runtime-final-v2] PASS · one session owner · resolved role contract · adaptive Pro/Admin verifier · admin preserved · consultation org fixed');
