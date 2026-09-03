import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const pulse=path.join(process.cwd(),'site','pulse-v12');
const appPath=path.join(pulse,'app-router-v2.js');
const bookingPath=path.join(pulse,'booking-layer-v1.js');
const indexPath=path.join(pulse,'index.html');
for(const file of [appPath,bookingPath,indexPath])if(!fs.existsSync(file))throw new Error('[consultation-load-v1] missing '+file);

function replaceBetween(src,start,end,replacement,label){
  const a=src.indexOf(start);
  const b=a<0?-1:src.indexOf(end,a+start.length);
  if(a<0||b<0)throw new Error('[consultation-load-v1] marker missing: '+label);
  return src.slice(0,a)+replacement+src.slice(b);
}

let booking=fs.readFileSync(bookingPath,'utf8');

const patientLoad=`const PATIENT_CACHE='komo_consultations_cache_v1';
let patientLoadPromise=null;
function patientMode(){const active=document.querySelector('#modeSwitch button.active[data-mode]');return !active||active.dataset.mode!=='clinical'}
function patientCacheKey(userId){return PATIENT_CACHE+':'+userId}
function readPatientCache(userId){try{const raw=sessionStorage.getItem(patientCacheKey(userId));if(!raw)return null;const cached=JSON.parse(raw);if(!cached||!Array.isArray(cached.data)||Date.now()-Number(cached.savedAt||0)>1800000)return null;return cached.data}catch{return null}}
function writePatientCache(userId,data){try{sessionStorage.setItem(patientCacheKey(userId),JSON.stringify({savedAt:Date.now(),data:Array.isArray(data)?data:[]}))}catch{}}
async function loadPatient(){
  if(patientLoadPromise)return patientLoadPromise;
  patientLoadPromise=(async()=>{
    S.patientError='';
    const session=S.session||(await sb().auth.getSession()).data.session;
    S.session=session||null;
    if(!session?.user){S.patientLoading=false;return}
    if(!S.patientAppointments.length){const cached=readPatientCache(session.user.id);if(cached)S.patientAppointments=cached}
    S.patientLoading=true;renderPatient();
    try{
      const [roleRes,q]=await Promise.all([
        sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle(),
        sb().rpc('komo_my_motion_consultations')
      ]);
      S.role=roleRes.data?.role||S.role||'member';
      if(q.error)throw q.error;
      S.patientAppointments=Array.isArray(q.data)?q.data:[];
      writePatientCache(session.user.id,S.patientAppointments)
    }catch(e){console.error(e);S.patientError='Vos consultations sont momentanément indisponibles.'}
    finally{S.patientLoading=false;renderPatient()}
  })().finally(()=>{patientLoadPromise=null});
  return patientLoadPromise
}
`;
booking=replaceBetween(booking,'async function loadPatient(){','function patientUpcoming()',patientLoad,'patient cached parallel loader');

const patientRender=`function renderPatient(){
  if(location.hash.replace(/^#/,'')!=='documents'||!patientMode())return;
  const root=document.querySelector('#viewRoot');if(!root)return;
  const up=patientUpcoming(),cur=assignedCurrent();
  document.querySelector('#pageEyebrow').textContent='CONSULTATIONS';
  document.querySelector('#pageTitle').textContent='Votre bilan commence ici.';
  const sync=S.patientLoading?'<div class="kbook-sync" role="status"><span class="kbook-sync-dot" aria-hidden="true"></span><span>Synchronisation</span></div>':'';
  const content=S.patientError&&!up.length?\`<div class="kbook-alert">\${esc(S.patientError)}</div>\`:up.length?\`<section class="kbook-upcoming"><div class="kbook-section-title"><div><p class="eyebrow">MON PARCOURS</p><h3>Consultations attribuées.</h3></div></div><div class="kbook-upcoming-list">\${up.map(x=>assignedCard(x,cur?.appointment_id)).join('')}</div></section>\`:S.patientLoading?'<div class="kbook-sync kbook-sync-empty" role="status"><span class="kbook-sync-dot" aria-hidden="true"></span><span>Synchronisation de vos consultations…</span></div>':'<div class="kbook-empty">Aucune consultation Motion attribuée pour le moment.</div>';
  root.innerHTML=\`<div class="kbook patient" data-kbook-patient><section class="kbook-hero"><div><p class="eyebrow">KŌMØ PULSE · CONSULTATION</p><h2>Votre consultation Motion.</h2><p>Votre centre attribue la consultation. Vous commencez ensuite votre pré-bilan dans Pulse avant les mesures.</p></div><div class="kbook-next"><span>Attribuée\${up.length>1?'s':''}</span><strong>\${up.length}</strong><small>consultation\${up.length>1?'s':''}</small></div></section>\${sync}\${content}</div>\`;
  bindPatient()
}
`;
booking=replaceBetween(booking,'function renderPatient(){','function bindPatient(){',patientRender,'patient instant renderer');

const refresh=`async function refresh(){try{if(location.hash.replace(/^#/,'')!=='documents'||!patientMode())return;await loadPatient()}catch(e){console.error(e)}}
`;
booking=replaceBetween(booking,'async function refresh(){','window.KomoBooking=',refresh,'patient refresh');

const schedule=`function schedulePatientRefresh(){if(location.hash.replace(/^#/,'')!=='documents'||!patientMode())return;queueMicrotask(()=>refresh().catch(console.error))}
window.addEventListener('hashchange',schedulePatientRefresh);
document.addEventListener('DOMContentLoaded',schedulePatientRefresh);
window.addEventListener('komo:session-ready',schedulePatientRefresh);
window.addEventListener('komo:route-ready',schedulePatientRefresh);
schedulePatientRefresh();

`;
booking=replaceBetween(booking,"window.addEventListener('hashchange',()=>setTimeout(refresh,120));",'async function ensureBookingRealtime()',schedule,'patient zero-delay boot');

const realtime=`async function ensureBookingRealtime(){
  if(bookingRealtimeChannel)return;
  const session=S.session||(await sb().auth.getSession()).data.session;
  if(!session?.user)return;
  S.session=session;
  bookingRealtimeChannel=sb().channel('komo-appointments-live-'+session.user.id).on('postgres_changes',{event:'*',schema:'public',table:'organization_appointments'},()=>{
    clearTimeout(bookingRealtimeTimer);
    bookingRealtimeTimer=setTimeout(()=>{if(location.hash.replace(/^#/,'')==='documents'&&patientMode())loadPatient().catch(console.error)},180)
  }).subscribe()
}
`;
booking=replaceBetween(booking,'async function ensureBookingRealtime(){',"window.addEventListener('komo:session-ready',()=>ensureBookingRealtime()",realtime,'realtime session reuse');
const realtimeBootStart=booking.indexOf("window.addEventListener('komo:session-ready',()=>ensureBookingRealtime()");
if(realtimeBootStart<0)throw new Error('[consultation-load-v1] realtime boot marker missing');
booking=booking.slice(0,realtimeBootStart)+`window.addEventListener('komo:session-ready',()=>ensureBookingRealtime().catch(console.error));
document.addEventListener('DOMContentLoaded',()=>ensureBookingRealtime().catch(console.error));
ensureBookingRealtime().catch(()=>{});\n`;
fs.writeFileSync(bookingPath,booking);

let app=fs.readFileSync(appPath,'utf8');
const enterApp=`async function enterApp(session){
  state.session=session;state.user=session?.user||null;state.profile=null;window.KomoRuntime?.setContext?.(session);
  if(!location.hash)history.replaceState(null,'','#home');
  const requested=location.hash.replace(/^#/,'')||'home';
  const instant=['home','documents','motion','mykomo','club','key','trajectory','messages'].includes(requested);
  if(instant){
    renderAccount();renderNavigation();renderRoute(currentRoute());
    els.authScreen.hidden=true;els.appShell.hidden=false;
    window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{route:requested}}))
  }
  document.body.classList.add('komo-hydrating');
  try{await loadAppData()}finally{document.body.classList.remove('komo-hydrating')}
  renderAccount();renderNavigation();renderRoute(currentRoute());
  els.authScreen.hidden=true;els.appShell.hidden=false;
  if(!instant)window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{route:currentRoute()}}));
  window.dispatchEvent(new CustomEvent('komo:data-ready'))
}

`;
app=replaceBetween(app,'async function enterApp(session){','async function loadAppData()',enterApp,'instant authenticated shell');
app=app.replace("documents:['AGENDA ET RÉSEAU','Vos consultations et le réseau KŌMØ.']","documents:['CONSULTATIONS','Votre bilan commence ici.']");
const loaderNeedle='els.viewRoot.innerHTML=`<div class="komo-route-loading" data-route-loading="${route}" role="status">Chargement de votre espace…</div>`;';
if(!app.includes(loaderNeedle))throw new Error('[consultation-load-v1] generic route loader marker missing');
app=app.replace(loaderNeedle,`if(route==='documents'){
      els.pageEyebrow.textContent='CONSULTATIONS';els.pageTitle.textContent='Votre bilan commence ici.';
      els.viewRoot.innerHTML=\`<section class="kbook-prime" data-kbook-prime aria-live="polite"><div><p class="eyebrow">KŌMØ PULSE · CONSULTATION</p><h2>Votre consultation Motion.</h2><p>Retrouvez votre prochaine consultation et préparez votre pré-bilan.</p></div><div class="kbook-sync" role="status"><span class="kbook-sync-dot" aria-hidden="true"></span><span>Synchronisation</span></div></section>\`;
      window.dispatchEvent(new CustomEvent('komo:route-ready',{detail:{route:'documents',source:'instant-consultation-shell'}}));
      window.KomoBooking?.refreshPatient?.()
    }else{
      els.viewRoot.innerHTML=\`<div class="komo-route-loading" data-route-loading="\${route}" role="status">Chargement de votre espace…</div>\`
    }`);
fs.writeFileSync(appPath,app);

let html=fs.readFileSync(indexPath,'utf8');
const style=`<style id="kpConsultationLoadV1">
  #viewRoot .kbook-prime{display:flex;align-items:flex-end;justify-content:space-between;gap:32px;min-height:150px;padding:26px 4px 18px;background:transparent!important;border:0!important;box-shadow:none!important;color:#f3f5f2}
  #viewRoot .kbook-prime .eyebrow{margin:0 0 10px;color:#82988a;font-size:10px;letter-spacing:.16em;text-transform:uppercase}
  #viewRoot .kbook-prime h2{margin:0;color:#f3f5f2;font-size:clamp(26px,3vw,42px);letter-spacing:-.045em;font-weight:500}
  #viewRoot .kbook-prime p:not(.eyebrow){margin:10px 0 0;color:#8f9992;font-size:13px;line-height:1.55}
  #viewRoot .kbook-sync{display:inline-flex;align-items:center;gap:9px;width:max-content;min-height:26px;padding:4px 0;background:transparent!important;border:0!important;color:#89958d;font-size:11px;letter-spacing:.01em;box-shadow:none!important}
  #viewRoot .kbook-sync-empty{margin-top:10px}
  #viewRoot .kbook-sync-dot{width:6px;height:6px;border-radius:50%;background:#8fb39a;box-shadow:0 0 0 0 rgba(143,179,154,.35);animation:kbookPulse 1.35s ease-out infinite}
  @keyframes kbookPulse{0%{box-shadow:0 0 0 0 rgba(143,179,154,.35)}70%{box-shadow:0 0 0 7px rgba(143,179,154,0)}100%{box-shadow:0 0 0 0 rgba(143,179,154,0)}}
  @media(max-width:720px){#viewRoot .kbook-prime{min-height:110px;padding:18px 2px 10px;align-items:flex-start;flex-direction:column;gap:14px}#viewRoot .kbook-prime p:not(.eyebrow){font-size:12px}}
  @media(prefers-reduced-motion:reduce){#viewRoot .kbook-sync-dot{animation:none}}
</style>`;
if(!html.includes('id="kpConsultationLoadV1"'))html=html.replace('</head>',style+'\n</head>');
fs.writeFileSync(indexPath,html);

for(const file of [bookingPath,appPath]){
  const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(check.status!==0)throw new Error('[consultation-load-v1] invalid '+path.basename(file)+': '+(check.stderr||check.stdout));
}

const finalBooking=fs.readFileSync(bookingPath,'utf8');
const finalApp=fs.readFileSync(appPath,'utf8');
const checks=[
  ['patient/admin mode uses active workspace mode',finalBooking.includes('function patientMode()')],
  ['consultation cache present',finalBooking.includes("PATIENT_CACHE='komo_consultations_cache_v1'")],
  ['single in-flight consultation request',finalBooking.includes('patientLoadPromise')],
  ['role and consultation load parallel',finalBooking.includes('const [roleRes,q]=await Promise.all')],
  ['no 900ms route boot delay',!finalBooking.includes('setTimeout(refresh,900)')],
  ['no 1400ms route boot delay',!finalBooking.includes('setTimeout(refresh,1400)')],
  ['instant documents shell',finalApp.includes('data-kbook-prime')],
  ['authenticated shell can render before full app data',finalApp.includes("const instant=['home','documents'"))
];
for(const [label,ok] of checks)if(!ok)throw new Error('[consultation-load-v1] failed: '+label);
console.log('[consultation-load-v1] PASS · instant shell · patient mode aware · cached-first · parallel consultation sync · blocking grey loader retired');
