import {loadCanonicalResult,getCanonicalClient} from './canonical-result-runtime.js';

const VERSION='1.0.0-komo-os';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const n=v=>Number.isFinite(Number(v))?Number(v):null;
const fmtDate=v=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(d)};
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const go=r=>window.KomoPatientNavigation?.go?.(r);
let busy=false,timer=0,lastKey='';

function memberMode(){const b=document.querySelector('#modeSwitch [data-mode="member"]');return !b||b.classList.contains('active')}
function style(){
 if($('#kpulseOsStyle'))return;
 const s=document.createElement('style');s.id='kpulseOsStyle';s.textContent=`
 body.kpulse-os-home{--kbg:#f1ede4;--ksurface:#faf8f3;--ksand:#ded3c3;--ktext:#282824;--kmuted:#756f66;--kline:rgba(39,37,32,.1);--kaccent:#b39a77;background:var(--kbg)!important}
 body.kpulse-os-home #appShell,body.kpulse-os-home .main-shell{background:linear-gradient(145deg,#eee9df,#f8f5ee)!important;color:var(--ktext)!important}
 body.kpulse-os-home .topbar{background:rgba(246,242,234,.82)!important;border-bottom:1px solid var(--kline)!important;backdrop-filter:blur(20px)}
 body.kpulse-os-home #viewRoot{width:min(calc(100% - 44px),1240px)!important;max-width:1240px!important;margin:0 auto!important;padding:26px 0 118px!important;background:transparent!important}
 body.kpulse-os-home #viewRoot>:not([data-kpulse-os-home]){display:none!important}
 .kpo{display:grid;gap:12px;font-family:Inter,'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;color:var(--ktext)}
 .kpo-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding:12px 2px 18px}.kpo-head .ey{font-size:8px;font-weight:850;letter-spacing:.18em;color:#7a736a}.kpo-head h2{margin:8px 0 0;font:500 clamp(36px,5vw,64px)/.9 Georgia,serif;letter-spacing:-.055em}.kpo-head p{margin:8px 0 0;color:var(--kmuted);font-size:11px}.kpo-world{height:42px;border:1px solid var(--kline);border-radius:13px;background:#fff;padding:0 13px;font-size:8px;font-weight:850;letter-spacing:.08em}
 .kpo-hero{display:grid;grid-template-columns:1.15fr .85fr;gap:10px}.kpo-score{min-height:280px;padding:28px;border-radius:28px;background:linear-gradient(145deg,#26352c,#455b4b);color:#fff;display:grid;grid-template-columns:1fr auto;align-items:end}.kpo-score .ey{font-size:8px;font-weight:850;letter-spacing:.16em;color:#c2cec4}.kpo-score strong{display:block;margin-top:24px;font:500 clamp(88px,10vw,126px)/.78 Inter,sans-serif;letter-spacing:-.09em}.kpo-score strong small{font-size:15px;font-weight:500;letter-spacing:0;opacity:.6}.kpo-score p{grid-column:1/-1;margin:18px 0 0;max-width:620px;color:#c6d0c8;font-size:10px;line-height:1.6}.kpo-score .date{align-self:start;text-align:right;font-size:8px;color:#b8c3ba}.kpo-age{min-height:280px;padding:28px;border-radius:28px;background:linear-gradient(145deg,#e1d6c6,#f5f0e8);display:flex;flex-direction:column;justify-content:space-between}.kpo-age .ey{font-size:8px;font-weight:850;letter-spacing:.16em;color:#746d63}.kpo-age strong{font:500 75px/1 Georgia,serif}.kpo-age p{margin:0;color:#6f685f;font-size:10px;line-height:1.55}
 .kpo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.kpo-card{min-height:160px;padding:18px;border:1px solid var(--kline);border-radius:21px;background:rgba(250,248,243,.92);text-align:left;position:relative;overflow:hidden}.kpo-card .ey{font-size:7px;font-weight:850;letter-spacing:.14em;color:#7c756b}.kpo-card h3{margin:11px 0 0;font-size:15px;letter-spacing:-.025em}.kpo-card .metric{display:block;margin-top:17px;font-size:24px;font-weight:650;letter-spacing:-.04em}.kpo-card p{margin:8px 0 0;color:#756f66;font-size:9px;line-height:1.5}.kpo-card button{position:absolute;left:18px;bottom:16px;border:0;background:transparent;padding:0;font-size:8px;font-weight:850;color:#383833}
 .kpo-trajectory{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;border:1px solid var(--kline);border-radius:24px;overflow:hidden;background:var(--kline)}.kpo-trajectory article{padding:22px;background:#f8f5ef}.kpo-trajectory .ey{font-size:7px;font-weight:850;letter-spacing:.14em;color:#7d756b}.kpo-trajectory b{display:block;margin-top:9px;font-size:13px}.kpo-trajectory p{margin:7px 0 0;color:#736c63;font-size:9px;line-height:1.45}
 .kpo-privacy{padding:15px 17px;border-radius:17px;background:#e8e1d6;color:#6c655d;font-size:9px;line-height:1.55}.kpo-privacy b{color:#35342f}
 .kpo-os-top{position:fixed;z-index:500;top:12px;right:170px;display:flex;gap:7px}.kpo-os-top a{height:31px;display:grid;place-items:center;padding:0 9px;border:1px solid rgba(46,43,38,.08);border-radius:10px;background:rgba(250,248,243,.84);text-decoration:none;color:#69635b;font-size:7px;font-weight:850;letter-spacing:.07em;backdrop-filter:blur(16px)}
 .kpo-os-nav{display:none}
 @media(max-width:900px){.kpo-hero{grid-template-columns:1fr}.kpo-grid{grid-template-columns:1fr 1fr}.kpo-trajectory{grid-template-columns:1fr}.kpo-score,.kpo-age{min-height:240px}}
 @media(max-width:760px){
  body.kpulse-os-home #viewRoot{width:100%!important;padding:12px 12px calc(88px + env(safe-area-inset-bottom))!important}
  .kpo-head{display:grid;gap:13px}.kpo-head h2{font-size:40px}.kpo-world{justify-self:start}.kpo-score,.kpo-age{padding:22px;border-radius:24px}.kpo-score strong{font-size:88px}.kpo-grid{grid-template-columns:1fr 1fr;gap:7px}.kpo-card{min-height:153px;padding:15px}.kpo-card button{left:15px}.kpo-os-top{display:none}
  .kpo-os-nav{display:grid;position:fixed;z-index:1000;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));height:58px;padding:5px;grid-template-columns:repeat(5,1fr);border:1px solid rgba(255,255,255,.8);border-radius:20px;background:rgba(248,245,238,.96);backdrop-filter:blur(24px);box-shadow:0 -5px 24px rgba(55,47,38,.09)}
  .kpo-os-nav a,.kpo-os-nav button{border:0;border-radius:14px;background:transparent;display:grid;place-items:center;text-decoration:none;color:#6a655e;font-size:7px;font-weight:800;letter-spacing:.05em}.kpo-os-nav .active{background:#302f2c;color:#fff}
 }
 @media(max-width:480px){.kpo-grid{grid-template-columns:1fr}.kpo-card{min-height:138px}}
 `;document.head.appendChild(s)
}
function ensureNav(){
 if(!$('#kpoOsTop')){const d=document.createElement('nav');d.id='kpoOsTop';d.className='kpo-os-top';d.innerHTML='<a href="https://komolongevity.com/home/">KŌMØ</a><a href="https://komolongevity.com/world/">WORLD</a><a href="https://komolongevity.com/world/?view=moments">MOMENTS</a><a href="https://komolongevity.com/life/">LIFE</a>';document.body.appendChild(d)}
 if(!$('#kpoOsNav')){const d=document.createElement('nav');d.id='kpoOsNav';d.className='kpo-os-nav';d.innerHTML='<a href="https://komolongevity.com/world/">WORLD</a><a href="https://komolongevity.com/world/?view=moments">MOMENTS</a><a href="https://komolongevity.com/life/">LIFE</a><button class="active" data-kpo-pulse>PULSE</button><a href="https://komolongevity.com/home/?you=1">YOU</a>';document.body.appendChild(d);d.querySelector('[data-kpo-pulse]').onclick=()=>go('home')}
}
async function analytics(event_name,entity_type=null,entity_id=null,metadata={}){
 try{const c=getCanonicalClient();const {data:{session}}=await c.auth.getSession();let anon=localStorage.getItem('komo_anon_v1');if(!anon){anon=crypto.randomUUID();localStorage.setItem('komo_anon_v1',anon)}await c.from('komo_product_analytics').insert({user_id:session?.user?.id||null,anonymous_id:anon,event_name,surface:'pulse',entity_type,entity_id,metadata})}catch{}
}
async function context(result){
 const c=getCanonicalClient(),patientId=result?.patientId,assessmentId=result?.identity?.assessmentId;
 let appointment=null,reports=[],journey=null;
 try{const r=await c.functions.invoke('motion-journey-status',{body:{}});journey=r.error?null:r.data?.journey||null;appointment=journey?.appointment||null}catch{}
 if(patientId&&!appointment){const a=await c.from('organization_appointments').select('id,appointment_type,scheduled_start,status,location_mode,service_code').eq('patient_id',patientId).gte('scheduled_start',new Date().toISOString()).order('scheduled_start',{ascending:true}).limit(1);if(!a.error)appointment=a.data?.[0]||null}
 if(assessmentId){const r=await c.from('reports').select('id,report_type,status,released_at,created_at').eq('assessment_id',assessmentId).eq('status','released').order('released_at',{ascending:false});if(!r.error)reports=r.data||[]}
 return{appointment,reports,journey};
}
function priorityText(result,ctx){
 const j=ctx?.journey||{};if(j.priority)return String(j.priority);
 const i=result?.interpretation||{};const p=i?.summary?.priorityFindings?.[0]||i?.carePlan?.priorities?.[0];
 return typeof p==='string'?p:(p?.title||p?.label||'Keep your trajectory active until the next checkpoint.');
}
function scoreValue(result){return n(result?.score?.motion_score??result?.score?.overall_score)}
function releasedDate(result){return result?.score?.released_at||result?.score?.calculated_at||result?.dossier?.motion?.completed_at||null}
function domainValue(result,key){
 const raw=result?.score?.domain_scores||{};const v=raw?.[key];return n(typeof v==='object'&&v!==null?(v.score??v.value):v)
}
function markup(result,ctx){
 const score=scoreValue(result),age=result?.locomotorAge?.status==='available'?n(result.locomotorAge.age):null,appt=ctx.appointment;
 const next=appt?.scheduled_start?fmtDate(appt.scheduled_start):'To plan';
 const priority=priorityText(result,ctx);
 const refs=[['MOBILITY','mobility'],['STRENGTH','strength'],['BALANCE','balance'],['ENDURANCE','endurance']].map(([label,key])=>[label,domainValue(result,key)]);
 return '<section class="kpo" data-kpulse-os-home>'+
  '<header class="kpo-head"><div><span class="ey">KŌMØ PULSE</span><h2>Your health.<br>In motion.</h2><p>Where am I? What matters? What do I do now? When do we reassess?</p></div><button class="kpo-world" data-kpo-world>EXPLORE WORLD →</button></header>'+
  '<section class="kpo-hero"><article class="kpo-score"><div><span class="ey">MOTION SCORE</span><strong>'+(score===null?'—':Math.round(score))+'<small>/100</small></strong></div><span class="date">LAST ASSESSMENT<br>'+esc(fmtDate(releasedDate(result)))+'</span><p>'+(score===null?'No released Motion Score is available for this account yet.':'Your latest released KŌMØ Motion reference. The existing scoring engine remains the source of truth.')+'</p></article>'+
  '<article class="kpo-age"><span class="ey">MOTION AGE</span><strong>'+(age===null?'—':Math.round(age))+'</strong><p>'+(age===null?'Model under validation. KŌMØ does not display an estimated Motion Age until the sensor-derived model is validated.':'Current validated functional age estimate.')+'</p></article></section>'+
  '<section class="kpo-grid">'+
   '<article class="kpo-card"><span class="ey">TRAJECTORY</span><h3>Your trajectory</h3><span class="metric">'+esc(priority)+'</span><p>One priority, one next action, one checkpoint.</p><button data-kpo-route="trajectory">OPEN TRAJECTORY →</button></article>'+
   '<article class="kpo-card"><span class="ey">ANALYSES</span><h3>Biomarkers</h3><span class="metric">—</span><p>No structured patient-visible biomarker series is connected in this V1. No values are invented.</p><button data-kpo-analysis>ANALYSES STATUS →</button></article>'+
   '<article class="kpo-card"><span class="ey">REPORTS</span><h3>Reports</h3><span class="metric">'+ctx.reports.length+'</span><p>Released reports linked to the latest assessment.</p><button data-kpo-route="documents">OPEN REPORTS →</button></article>'+
   '<article class="kpo-card"><span class="ey">APPOINTMENTS</span><h3>Next checkpoint</h3><span class="metric">'+esc(next)+'</span><p>'+(appt?esc(appt.appointment_type||'KŌMØ appointment'):'No future appointment found.')+'</p><button data-kpo-route="documents">MANAGE →</button></article>'+
  '</section>'+
  '<section class="kpo-trajectory">'+refs.map(([label,v])=>'<article><span class="ey">'+label+'</span><b>'+(v===null?'—':Math.round(v)+'/100')+'</b><p>'+(v===null?'No validated subscore is available in the current canonical result.':'From the current released Motion result.')+'</p></article>').join('')+'<article><span class="ey">NEXT CHECKPOINT</span><b>'+esc(next)+'</b><p>Reassessment stays inside the Pulse clinical pathway.</p></article></section>'+
  '<div class="kpo-privacy"><b>Health privacy.</b> World, Life and Card never receive raw biomarkers, diagnoses, reports or medical history from this screen. Pulse remains the health environment.</div>'+
 '</section>';
}
function emptyMarkup(message){
 return '<section class="kpo" data-kpulse-os-home><header class="kpo-head"><div><span class="ey">KŌMØ PULSE</span><h2>Your health.<br>In motion.</h2><p>Your first validated KŌMØ assessment will create the health reference shown here.</p></div><button class="kpo-world" data-kpo-world>EXPLORE WORLD →</button></header><div class="kpo-privacy"><b>No released patient result yet.</b> '+esc(message||'Pulse will show real data only when it is available and authorised.')+'</div></section>';
}
function bind(host){
 host.querySelectorAll('[data-kpo-route]').forEach(b=>b.onclick=()=>{const target=b.dataset.kpoRoute;analytics(target==='trajectory'?'trajectory_viewed':'report_downloaded',target);go(target)});
 host.querySelector('[data-kpo-world]')?.addEventListener('click',()=>location.href='https://komolongevity.com/world/');
 host.querySelector('[data-kpo-analysis]')?.addEventListener('click',()=>{analytics('analysis_viewed');alert('KŌMØ Analyses V1\n\nNo structured patient-visible biomarker series is currently connected to this account. Pulse will not generate or infer laboratory values.');});
}
function tune(){
 document.body.classList.add('kpulse-os-home');ensureNav();const e=$('#pageEyebrow'),t=$('#pageTitle');if(e)e.textContent='KŌMØ PULSE';if(t)t.textContent='Your health. In motion.';
}
function untune(){document.body.classList.remove('kpulse-os-home')}
async function mount(force=false){
 if(route()!=='home'||!memberMode()){untune();return}if(busy)return;const root=$('#viewRoot');if(!root)return;busy=true;
 try{
  style();tune();let result=null,ctx={appointment:null,reports:[],journey:null};
  try{result=await loadCanonicalResult({force});ctx=await context(result)}catch(e){console.info('[pulse-os-home] canonical result unavailable',e?.message||e)}
  const key=result?String(result.identity?.scoreId||result.identity?.assessmentId||'result')+':'+ctx.reports.length+':'+(ctx.appointment?.id||''):'empty';
  if(key===lastKey&&root.querySelector('[data-kpulse-os-home]'))return;
  root.querySelector('[data-kpulse-os-home]')?.remove();const host=document.createElement('div');host.innerHTML=result?markup(result,ctx):emptyMarkup();const node=host.firstElementChild;root.prepend(node);bind(node);lastKey=key;analytics('pulse_opened');
 }finally{busy=false}
}
function schedule(force=false,ms=140){clearTimeout(timer);timer=setTimeout(()=>mount(force),ms)}
['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:canonical-result-ready','komo:session-ready'].forEach(x=>window.addEventListener(x,()=>schedule(x==='komo:data-ready',120)));
document.addEventListener('DOMContentLoaded',()=>schedule(true,800));setTimeout(()=>schedule(true,80),1500);
window.KomoPulseOsHome={version:VERSION,refresh:()=>schedule(true,40)};
