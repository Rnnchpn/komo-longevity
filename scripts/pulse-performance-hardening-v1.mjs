import {readFile,writeFile} from 'node:fs/promises';

const indexPath='pulse-app/index.html';
const appPath='pulse-app/app.js';

function replaceRequired(src,from,to,label){if(src.includes(from))return src.replace(from,to);if(src.includes(to)){console.log(`[pulse-performance] already applied ${label}`);return src}throw new Error(`[pulse-performance] missing ${label}`)}
function stripBodyObserver(src,label){const before=src;src=src.replace(/(?:let scheduled=false;)?const obs=new MutationObserver\([\s\S]*?obs\.observe\(document\.body,\{[^;]*?\}\);/,'');if(src===before)console.warn(`[pulse-performance] no body observer found in ${label}`);return src}

let html=await readFile(indexPath,'utf8');
if(!html.includes('./performance-runtime-v1.js'))html=html.replace('<script type="module" src="./app.js"></script>','<script type="module" src="./app.js"></script>\n  <script type="module" src="./performance-runtime-v1.js"></script>');
await writeFile(indexPath,html);

let app=await readFile(appPath,'utf8');
app=replaceRequired(app,'function syncClient() { state.client = makeClient(selectedStorage()); return state.client; }',"function syncClient() { state.client = makeClient(selectedStorage()); window.KomoRuntime=window.KomoRuntime||{}; window.KomoRuntime.client=state.client; return state.client; }",'shared app client');
app=replaceRequired(app,"function showAuth(){els.authScreen.hidden=false;els.appShell.hidden=true}","function showAuth(){els.authScreen.hidden=false;els.appShell.hidden=true;window.KomoRuntime?.setContext?.(null,'member')}",'auth context clear');
app=replaceRequired(app,"state.role=roleRes.data?.role||'member';state.mode=state.role==='professional'||state.role==='admin'?state.mode:'member';", "state.role=roleRes.data?.role||'member';window.KomoRuntime?.setContext?.(state.session,state.role);state.mode=state.role==='professional'||state.role==='admin'?state.mode:'member';",'runtime role context');
await writeFile(appPath,app);

const sClientOld="function sb(){if(!S.client)S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return S.client}";
const sClientNew="function sb(){return window.KomoRuntime?.client||(S.client||(S.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}";
const cClientOld="function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}";
const cClientNew="function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}";

const configs=[
 ['pulse-app/auth-gateway-v2.js',cClientOld,cClientNew,"window.addEventListener('komo:session-ready',()=>setTimeout(schedule,30));window.addEventListener('komo:route-ready',()=>{if(authVisible())setTimeout(schedule,30)});"],
 ['pulse-app/patient-onboarding-v1.js',cClientOld,cClientNew,"window.addEventListener('komo:session-ready',()=>setTimeout(maybeHandoff,40));"],
 ['pulse-app/pro-signup-identity-v1.js',cClientOld,cClientNew,"document.addEventListener('click',e=>{if(e.target.closest?.('[data-open-pro-create]'))setTimeout(patch,0)},true);window.addEventListener('komo:route-ready',()=>setTimeout(patch,30));"],
 ['pulse-app/pro-architecture-v2.js',sClientOld,sClientNew,"window.addEventListener('komo:session-ready',e=>{S.role=e.detail?.role||window.KomoRuntime?.role||'member';S.ready=true;ensureProNav();applyMode()});window.addEventListener('komo:route-ready',()=>{ensureProNav();applyMode();if(location.hash==='#clinical')[80,260,650].forEach(ms=>setTimeout(polishCockpit,ms))});"],
 ['pulse-app/booking-layer-v1.js',sClientOld,sClientNew,"window.addEventListener('komo:session-ready',()=>setTimeout(refresh,40));window.addEventListener('komo:route-ready',()=>setTimeout(refresh,80));"],
 ['pulse-app/care-messaging-v1.js',sClientOld,sClientNew,"window.addEventListener('komo:session-ready',()=>setTimeout(refresh,40));window.addEventListener('komo:route-ready',()=>{setTimeout(refresh,80);if(location.hash==='#clinical')[80,250,600].forEach(ms=>setTimeout(ensureProTab,ms))});"],
 ['pulse-app/pro-followup-v1.js',sClientOld,sClientNew,"window.addEventListener('komo:session-ready',()=>setTimeout(refresh,40));window.addEventListener('komo:route-ready',()=>{setTimeout(refresh,80);if(location.hash==='#clinical')[80,250,600].forEach(ms=>setTimeout(ensureTab,ms))});"],
 ['pulse-app/professional-scope-v1.js',cClientOld,cClientNew,"window.addEventListener('komo:session-ready',()=>setTimeout(refresh,40));window.addEventListener('komo:route-ready',()=>{[80,300].forEach(ms=>setTimeout(refresh,ms))});"],
 ['pulse-app/admin-shortcut-v1.js',cClientOld,cClientNew,"window.addEventListener('komo:session-ready',()=>setTimeout(schedule,30));window.addEventListener('komo:route-ready',()=>setTimeout(schedule,50));"],
];
for(const [path,from,to,extra] of configs){let src=await readFile(path,'utf8');src=replaceRequired(src,from,to,`${path} shared client`);src=stripBodyObserver(src,path);src+='\n'+extra+'\n';await writeFile(path,src)}

let proAccess=await readFile('pulse-app/pro-access-v1.js','utf8');
proAccess=replaceRequired(proAccess,"function client(){return createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}","function client(){return window.KomoRuntime?.client||createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}",'pro-access shared client');
proAccess=stripBodyObserver(proAccess,'pro-access-v1.js');
proAccess+="\nwindow.addEventListener('komo:session-ready',e=>{role=e.detail?.role||window.KomoRuntime?.role||role;checkedFor=e.detail?.session?.user?.id||checkedFor;setTimeout(refresh,30)});window.addEventListener('komo:route-ready',()=>setTimeout(refresh,50));\n";
await writeFile('pulse-app/pro-access-v1.js',proAccess);

let proIdentity=await readFile('pulse-app/pro-signup-identity-v1.js','utf8');
await writeFile('pulse-app/pro-signup-identity-v1.js',proIdentity);

let adminUx=await readFile('pulse-app/admin-ux-v2.js','utf8');adminUx=stripBodyObserver(adminUx,'admin-ux-v2.js');adminUx+="\ndocument.addEventListener('click',e=>{if(location.hash==='#admin'&&e.target.closest?.('[data-pro-select],[data-admin-tab],[data-admin-professionals]'))setTimeout(schedule,100)},true);window.addEventListener('komo:admin-open',()=>setTimeout(schedule,120));window.addEventListener('komo:route-ready',()=>{if(location.hash==='#admin')setTimeout(schedule,120)});\n";await writeFile('pulse-app/admin-ux-v2.js',adminUx);

let adminPros=await readFile('pulse-app/admin-professionals-v1.js','utf8');adminPros=stripBodyObserver(adminPros,'admin-professionals-v1.js');adminPros=adminPros.replace("window.addEventListener('hashchange',()=>{if(location.hash!=='#admin')state.active=false;else setTimeout(injectTab,80)});","window.addEventListener('hashchange',()=>{if(location.hash!=='#admin')state.active=false;else setTimeout(injectTab,80)});document.addEventListener('click',e=>{if(location.hash==='#admin'&&e.target.closest?.('[data-admin-tab],[data-admin-refresh]'))setTimeout(injectTab,120)},true);");await writeFile('pulse-app/admin-professionals-v1.js',adminPros);

console.log('[pulse-performance-hardening-v1] shared client + event-driven UI applied');
