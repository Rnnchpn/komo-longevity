/* KŌMØ Pulse — Connected v3 · daily signals + trajectory */
(()=>{
'use strict';
const V='4.0.0-premium-connected';
let cache=null,cacheAt=0,busy=false,timer=0,period=7;
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const client=()=>window.KomoRuntime?.client||null;
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const dayKey=d=>{const x=new Date(d),y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),dd=String(x.getDate()).padStart(2,'0');return`${y}-${m}-${dd}`};
const dayDate=k=>new Date(`${k}T12:00:00`);
const shiftDay=(k,n)=>{const d=dayDate(k);d.setDate(d.getDate()+n);return dayKey(d)};
const fmtDate=v=>{if(!v)return'—';const d=dayDate(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(d).replace('.','')};
const fmtLongDate=v=>{if(!v)return'—';const d=dayDate(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(d)};
const fmtInt=v=>v===null?'—':Math.round(v).toLocaleString('fr-FR');
const fmtHours=v=>v===null?'—':`${Math.floor(v/60)}h ${String(Math.round(v%60)).padStart(2,'0')}`;
const fmtBpm=v=>v===null?'—':`${Math.round(v)} bpm`;
const sliceCalendar=(rows,end,days)=>{const start=shiftDay(end,-days+1);return rows.filter(r=>r.metric_date>=start&&r.metric_date<=end)};
const previousCalendar=(rows,end,days)=>{const prevEnd=shiftDay(end,-days),start=shiftDay(prevEnd,-days+1);return rows.filter(r=>r.metric_date>=start&&r.metric_date<=prevEnd)};
function provisionalEstimate(row,key){const e=row?.raw_payload?.motion_today_estimate;if(!e||e.validation!=='provisional')return null;if(key==='sleep_minutes')return num(e.in_bed_minutes);if(key==='resting_hr')return num(e.nocturnal_hr_p10);return null}
function valueFor(row,key){const canonical=num(row?.[key]);if(canonical!==null)return canonical;return provisionalEstimate(row,key)}
function isProvisional(row,key){return num(row?.[key])===null&&provisionalEstimate(row,key)!==null}
function meanMetric(rows,key){const vals=rows.map(r=>valueFor(r,key)).filter(v=>v!==null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null}
function validMetricCount(rows,key){return rows.map(r=>valueFor(r,key)).filter(v=>v!==null).length}
function deltaPct(current,usual,inverse=false){if(current===null||usual===null||usual===0)return null;const d=(current-usual)/usual*100;return inverse?-d:d}
function scoreFromDelta(delta,sensitivity=2){return delta===null?null:Math.round(clamp(70+delta*sensitivity))}
function tone(score){if(score===null)return'neutral';if(score>=80)return'good';if(score>=65)return'stable';return'low'}
function scoreLabel(score){if(score===null)return'Données à compléter';if(score>=90)return'Très bon signal';if(score>=80)return'Vous êtes bien aujourd’hui';if(score>=65)return'Dans votre zone habituelle';return'En dessous de votre habituel'}
function trendText(delta){if(delta===null)return'Référence insuffisante';const sign=delta>0?'+':'';return`${sign}${Math.round(delta)}% vs habituel`}
function style(){
  if(document.querySelector('#connectedV4Style'))return;
  document.querySelector('#connectedV3Style')?.remove();
  const s=document.createElement('style');
  s.id='connectedV4Style';
  s.textContent=`
body.connected-v3 .main-shell,body.connected-v3 #viewRoot{background:#f4f7f5!important;color:#17251d!important}
body.connected-v3 #viewRoot{min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:none!important}
body.connected-v3 #viewRoot::-webkit-scrollbar{display:none!important}
.kcn4{
  --bg:#f4f7f5;--panel:#fff;--soft:#f8faf9;--ink:#17251d;--muted:#6e7d74;--line:#dce6df;
  --green:#2f8b60;--blue:#647cf1;--amber:#b98328;
  width:min(1280px,100%);margin:0 auto;padding:10px clamp(18px,3vw,42px) 96px;
  display:grid;gap:10px;color:var(--ink);font-family:"DM Sans",system-ui,sans-serif;box-sizing:border-box
}
.kcn4 *{box-sizing:border-box}
.kcn4-card{border:1px solid var(--line);border-radius:22px;background:#fff;box-shadow:0 13px 34px rgba(38,67,50,.06)}
.kcn4-eyebrow{margin:0;color:#668073;font:600 8px/1 "DM Sans",sans-serif;letter-spacing:.11em;text-transform:uppercase}
.kcn4-top{min-height:58px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center}
.kcn4-top h1{margin:5px 0 0;color:#18382a;font:600 clamp(26px,2.7vw,38px)/1 Manrope,"DM Sans",sans-serif;letter-spacing:-.048em}
.kcn4-top p{margin:6px 0 0;color:var(--muted);font:400 10px/1.35 "DM Sans",sans-serif}
.kcn4-status{display:inline-flex;align-items:center;gap:7px;min-height:30px;padding:0 11px;border:1px solid #d7e5dc;border-radius:999px;background:#eef6f1;color:#376c4f;font:600 8px/1 "DM Sans",sans-serif}
.kcn4-status:before{content:"";width:6px;height:6px;border-radius:50%;background:#45a977}
.kcn4-hero{
  min-height:255px;padding:22px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;
  background:radial-gradient(560px 260px at 100% 0%,rgba(100,124,241,.08),transparent 70%),radial-gradient(560px 280px at 0% 100%,rgba(69,169,119,.12),transparent 70%),#fff
}
.kcn4-metric{min-width:0;padding:20px;border:1px solid #e0e9e4;border-radius:18px;background:rgba(255,255,255,.88);display:flex;flex-direction:column;justify-content:space-between}
.kcn4-metric .label{color:#72847a;font:600 8px/1 "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase}
.kcn4-metric strong{display:block;margin-top:14px;color:#214d36;font:600 clamp(38px,4.1vw,58px)/.92 Manrope,"DM Sans",sans-serif;letter-spacing:-.06em}
.kcn4-metric strong small{margin-left:4px;color:#73837a;font:500 11px/1 "DM Sans",sans-serif;letter-spacing:0}
.kcn4-metric p{margin:12px 0 0;color:#718078;font:400 9px/1.4 "DM Sans",sans-serif}
.kcn4-metric.good{background:#f0faf4;border-color:#d8ebdf}.kcn4-metric.watch{background:#fff9ec;border-color:#eadfbd}
.kcn4-insight{min-height:82px;padding:15px 18px;display:grid;grid-template-columns:150px minmax(0,1fr) auto;gap:18px;align-items:center}
.kcn4-insight h3{margin:0;color:#274636;font:600 clamp(17px,1.55vw,22px)/1.08 Manrope,"DM Sans",sans-serif;letter-spacing:-.03em}
.kcn4-insight p{margin:7px 0 0;color:#718078;font:400 9px/1.35 "DM Sans",sans-serif}
.kcn4-score{min-width:104px;text-align:right}.kcn4-score span{display:block;color:#85918a;font:500 7px/1 "DM Sans",sans-serif;text-transform:uppercase;letter-spacing:.07em}
.kcn4-score strong{display:block;margin-top:6px;color:#315642;font:600 24px/1 Manrope,"DM Sans",sans-serif}
.kcn4-section{padding:18px}.kcn4-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:14px}
.kcn4-head h3{margin:5px 0 0;color:#294938;font:600 22px/1 Manrope,"DM Sans",sans-serif;letter-spacing:-.035em}
.kcn4-head p{max-width:520px;margin:0;color:#7a8981;font:400 8px/1.4 "DM Sans",sans-serif;text-align:right}
.kcn4-periods{display:flex;padding:3px;border:1px solid #dce6df;border-radius:999px;background:#eef3f0}
.kcn4-periods button{border:0;border-radius:999px;background:transparent;color:#74837b;padding:7px 11px;font:600 8px/1 "DM Sans",sans-serif;cursor:pointer}
.kcn4-periods button.active{background:#fff;color:#2b6649;box-shadow:0 4px 12px rgba(39,70,51,.08)}
.kcn4-trend{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(300px,.55fr);gap:10px}
.kcn4-chart{padding:16px;border:1px solid #e1e9e5;border-radius:16px;background:#fafcfb}
.kcn4-charttop{display:flex;justify-content:space-between;gap:14px}.kcn4-charttop strong{display:block;color:#294938;font:600 28px/1 Manrope,"DM Sans",sans-serif}.kcn4-charttop span{display:block;margin-top:5px;color:#7d8a82;font:400 8px/1.25 "DM Sans",sans-serif}
.kcn4-bars{height:130px;margin-top:16px;display:flex;align-items:flex-end;gap:5px;border-bottom:1px solid #e1e8e4}.kcn4-barwrap{height:100%;min-width:0;flex:1;display:flex;align-items:flex-end;position:relative}.kcn4-bar{width:100%;min-height:2px;border-radius:5px 5px 1px 1px;background:#b8c7bf}.kcn4-bar.current{background:#3ca56f}.kcn4-axis{display:flex;justify-content:space-between;margin-top:6px;color:#87938c;font:400 7px/1 "DM Sans",sans-serif}
.kcn4-periodstats{display:grid;gap:7px}.kcn4-periodstat{padding:13px;border:1px solid #e1e9e5;border-radius:14px;background:#f8faf9}.kcn4-periodstat span{display:block;color:#7d8981;font:600 7px/1 "DM Sans",sans-serif;text-transform:uppercase;letter-spacing:.08em}.kcn4-periodstat strong{display:block;margin-top:6px;color:#294838;font:600 18px/1 Manrope,"DM Sans",sans-serif}.kcn4-periodstat small{display:block;margin-top:5px;color:#7b8981;font:400 7.5px/1.25 "DM Sans",sans-serif}
.kcn4-more{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.kcn4-mini{padding:13px;border:1px solid #e1e9e5;border-radius:14px;background:#f8faf9}.kcn4-mini span{display:block;color:#7a8981;font:600 7px/1 "DM Sans",sans-serif;text-transform:uppercase;letter-spacing:.08em}.kcn4-mini strong{display:block;margin-top:7px;color:#294838;font:600 18px/1 Manrope,"DM Sans",sans-serif}.kcn4-mini small{display:block;margin-top:5px;color:#7b8981;font:400 7px/1.25 "DM Sans",sans-serif}
.kcn4-foot{padding:13px 16px;display:flex;justify-content:space-between;gap:14px;align-items:center}.kcn4-foot p{margin:0;color:#7a8981;font:400 8px/1.4 "DM Sans",sans-serif}.kcn4-btn{min-height:34px;padding:0 11px;border:1px solid #d7e4dc;border-radius:999px;background:#fff;color:#355443;font:600 8px/1 "DM Sans",sans-serif;cursor:pointer}.kcn4-btn.primary{border-color:transparent;background:#2f8059;color:#fff}
.kcn4-empty{padding:22px;border:1px solid var(--line);border-radius:18px;background:#fff;color:#75857c;font:400 10px/1.55 "DM Sans",sans-serif}
body.connected-v3 #komoAssistantRail{width:48px!important;min-width:48px!important;height:48px!important;min-height:48px!important;right:11px!important;bottom:86px!important;padding:0!important;border:1px solid #dce6df!important;border-radius:16px!important;background:rgba(255,255,255,.94)!important;color:#244c37!important;box-shadow:0 12px 30px rgba(31,57,42,.12)!important;writing-mode:horizontal-tb!important;transform:none!important}
body.connected-v3 #komoAssistantRail .ka2-rail-copy{display:none!important}
html[data-adaptive-shell][data-adaptive-mode="patient"] body.connected-v3 #kamRoleRow{display:none!important}
@media(max-width:900px){.kcn4-trend{grid-template-columns:1fr}.kcn4-periodstats{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:700px){
  body.connected-v3 .topbar{min-height:52px!important;height:52px!important;padding:7px 12px!important;display:flex!important;align-items:center!important}
  body.connected-v3 #pageEyebrow{display:none!important}
  body.connected-v3 #pageTitle{margin:0!important;font:600 18px/1 Manrope,"DM Sans",sans-serif!important;letter-spacing:-.035em!important}
  body.connected-v3 #komoWorldTopEntry{min-height:30px!important;padding:0 9px!important;font-size:6px!important}
  body.connected-v3 #refreshButton{width:30px!important;min-width:30px!important;height:30px!important}
  body.connected-v3 #viewRoot{padding-top:0!important}
  .kcn4{padding:6px 8px calc(76px + env(safe-area-inset-bottom));gap:7px}
  .kcn4-card{border-radius:16px}
  .kcn4-top{min-height:50px;gap:8px}.kcn4-top h1{font-size:23px}.kcn4-top p{font-size:8px}.kcn4-status{min-height:26px;padding:0 8px;font-size:6px}
  .kcn4-hero{min-height:0;padding:8px;gap:5px;grid-template-columns:repeat(3,minmax(0,1fr))}
  .kcn4-metric{min-height:128px;padding:10px;border-radius:13px}.kcn4-metric .label{font-size:6px}.kcn4-metric strong{margin-top:10px;font-size:26px}.kcn4-metric strong small{display:block;margin:4px 0 0;font-size:7px}.kcn4-metric p{font-size:6px;line-height:1.25}
  .kcn4-insight{min-height:0;padding:11px;grid-template-columns:1fr auto;gap:8px}.kcn4-insight>.kcn4-eyebrow{grid-column:1/-1}.kcn4-insight h3{font-size:14px}.kcn4-insight p{font-size:7px}.kcn4-score{min-width:76px}.kcn4-score span{font-size:5.5px}.kcn4-score strong{font-size:18px}
  .kcn4-section{padding:12px}.kcn4-head{display:block;margin-bottom:10px}.kcn4-head h3{font-size:16px}.kcn4-head p{margin-top:5px;text-align:left;font-size:6.5px}.kcn4-periods{width:max-content;margin-top:9px}.kcn4-periods button{padding:6px 9px;font-size:6.5px}
  .kcn4-trend{gap:6px}.kcn4-chart{padding:10px}.kcn4-charttop strong{font-size:20px}.kcn4-charttop span{font-size:6px}.kcn4-bars{height:90px;margin-top:10px}.kcn4-periodstats{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}.kcn4-periodstat{padding:8px}.kcn4-periodstat span{font-size:5.5px}.kcn4-periodstat strong{font-size:13px}.kcn4-periodstat small{font-size:5.5px}
  .kcn4-more{grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}.kcn4-mini{padding:8px}.kcn4-mini span{font-size:5.5px}.kcn4-mini strong{font-size:13px}.kcn4-mini small{font-size:5.5px}
  .kcn4-foot{padding:10px;gap:8px}.kcn4-foot p{font-size:6px}.kcn4-btn{min-height:30px;font-size:6.5px}
}
`;
  document.head.appendChild(s);
}
async function load(force=false){if(!force&&cache&&Date.now()-cacheAt<15000)return cache;const c=client();if(!c)return null;const session=window.KomoRuntime?.getContext?.()?.session||(await c.auth.getSession()).data?.session;if(!session?.user)return null;const from=new Date();from.setDate(from.getDate()-100);const [d,co]=await Promise.all([c.from('wearable_daily_metrics').select('metric_date,steps,distance_m,active_minutes,sedentary_minutes,resting_hr,avg_hr,hrv_ms,spo2_avg,sleep_minutes,deep_sleep_minutes,rem_sleep_minutes,wear_minutes,source,source_quality,day_wear_mode,night_worn,raw_payload').eq('user_id',session.user.id).gte('metric_date',dayKey(from)).order('metric_date',{ascending:false}).limit(100),c.from('wearable_consents').select('*').eq('user_id',session.user.id).eq('purpose','connected_followup').order('accepted_at',{ascending:false}).limit(1)]);if(d.error)throw d.error;if(co.error)throw co.error;cache={session,rows:d.data||[],consent:(co.data||[])[0]||null};cacheAt=Date.now();return cache}
const consentActive=d=>d?.consent?.status==='active';
function latestWith(rows,key){return rows.find(r=>valueFor(r,key)!==null)||null}
function baselineFor(rows,latestDate,key,days=28){const all=sliceCalendar(rows,shiftDay(latestDate,-1),days);return{value:meanMetric(all,key),count:validMetricCount(all,key)}}
function dailySignals(rows){const latest=rows[0]||null;if(!latest)return null;const stepRow=latestWith(rows,'steps'),sleepRow=latestWith(rows,'sleep_minutes'),heartRow=latestWith(rows,'resting_hr');const build=(row,key,inverse=false,sensitivity=2)=>{if(!row)return{row:null,value:null,usual:null,delta:null,score:null,count:0,provisional:false};const b=baselineFor(rows,row.metric_date,key);const value=valueFor(row,key),delta=b.count>=2?deltaPct(value,b.value,inverse):null,score=b.count>=2?scoreFromDelta(delta,sensitivity):null;return{row,value,usual:b.value,delta,score,count:b.count,provisional:isProvisional(row,key)}};const move=build(stepRow,'steps',false,2),sleep=build(sleepRow,'sleep_minutes',false,2),heart=build(heartRow,'resting_hr',true,2.5);const parts=[['move',move,.40],['sleep',sleep,.35],['heart',heart,.25]].filter(([,x])=>x.score!==null);const totalWeight=parts.reduce((a,p)=>a+p[2],0);const composite=parts.length===3?Math.round(parts.reduce((a,p)=>a+p[1].score*p[2],0)/totalWeight):null;const provisional=[move,sleep,heart].some(x=>x.provisional);return{latest,move,sleep,heart,composite,parts:parts.length,provisional}}
function periodStats(rows,days){const end=rows[0]?.metric_date||dayKey(new Date()),current=sliceCalendar(rows,end,days),previous=previousCalendar(rows,end,days);const metric=(key,inverse=false)=>{const cur=meanMetric(current,key),prev=meanMetric(previous,key),delta=validMetricCount(previous,key)>=Math.min(2,days)?deltaPct(cur,prev,inverse):null;return{cur,prev,delta,count:validMetricCount(current,key)}};return{end,current,previous,steps:metric('steps'),sleep:metric('sleep_minutes'),rhr:metric('resting_hr',true),active:metric('active_minutes'),distance:metric('distance_m'),hrv:metric('hrv_ms'),spo2:metric('spo2_avg'),coverage:Math.round(new Set(current.map(r=>r.metric_date)).size/days*100)}}
function bars(rows,days){const end=rows[0]?.metric_date||dayKey(new Date()),start=shiftDay(end,-days+1),map=new Map(rows.map(r=>[r.metric_date,valueFor(r,'steps')]));const vals=[];for(let i=0;i<days;i++){const k=shiftDay(start,i);vals.push({k,v:map.get(k)??null})}const max=Math.max(1,...vals.map(x=>x.v||0));return vals.map((x,i)=>`<div class="kcn3-barwrap" data-tip="${esc(fmtDate(x.k))} · ${x.v===null?'—':fmtInt(x.v)+' pas'}"><i class="kcn3-bar ${i===vals.length-1?'current':''}" style="height:${x.v===null?2:Math.max(4,Math.round(x.v/max*100))}%"></i></div>`).join('')}
function signalCard(label,data,formatter,goodCopy){const t=tone(data.score),source=data.provisional?' · provisoire Mi Fitness':'';return`<article class="kcn3-signal ${t==='good'?'good':''}"><div><span class="label">${esc(label)}</span><strong>${formatter(data.value)}</strong><small>${data.usual===null?'Habituel en construction':`${trendText(data.delta)} · habituel ${formatter(data.usual)}`}${source}</small></div><div class="kcn3-subscore ${t==='good'?'good':''}">${data.score===null?'—':data.score}<em>${data.score===null?'score en attente':goodCopy}</em></div></article>`}
function periodComparison(label,m,formatter){return`<article class="kcn3-periodstat"><span>${esc(label)}</span><strong>${formatter(m.cur)}</strong><small>${m.count} jour${m.count>1?'s':''} · ${m.delta===null?'comparaison en attente':trendText(m.delta)}</small></article>`}
function metricTone(data){const t=tone(data.score);return t==='good'?'good':t==='low'?'watch':''}
function metricCopy(data,formatter){
  if(data.value===null)return'Donnée en attente de synchronisation';
  if(data.usual===null)return'Habituel en construction';
  return `${trendText(data.delta)} · habituel ${formatter(data.usual)}${data.provisional?' · provisoire':''}`;
}
function insightCopy(sig){
  const parts=[['mouvement',sig.move],['sommeil',sig.sleep],['FC repos',sig.heart]].filter(([,x])=>x.delta!==null);
  if(!parts.length)return'Connected construit votre référence personnelle au fil des jours.';
  const best=[...parts].sort((a,b)=>(b[1].score??-1)-(a[1].score??-1))[0];
  const low=[...parts].sort((a,b)=>(a[1].score??101)-(b[1].score??101))[0];
  if((low?.[1]?.score??100)<65)return`Votre ${low[0]} est aujourd’hui en dessous de votre niveau habituel. Les autres signaux restent suivis dans le temps.`;
  if((best?.[1]?.score??0)>=80)return`Votre ${best[0]} est aujourd’hui le signal le plus favorable par rapport à votre référence habituelle.`;
  return'Vos principaux signaux restent proches de votre zone habituelle.';
}
function barsV4(rows,days){const end=rows[0]?.metric_date||dayKey(new Date()),start=shiftDay(end,-days+1),map=new Map(rows.map(r=>[r.metric_date,valueFor(r,'steps')]));const vals=[];for(let i=0;i<days;i++){const k=shiftDay(start,i);vals.push({k,v:map.get(k)??null})}const max=Math.max(1,...vals.map(x=>x.v||0));return vals.map((x,i)=>`<div class="kcn4-barwrap" title="${esc(fmtDate(x.k))} · ${x.v===null?'—':fmtInt(x.v)+' pas'}"><i class="kcn4-bar ${i===vals.length-1?'current':''}" style="height:${x.v===null?2:Math.max(4,Math.round(x.v/max*100))}%"></i></div>`).join('')}
function periodComparisonV4(label,m,formatter){return`<article class="kcn4-periodstat"><span>${esc(label)}</span><strong>${formatter(m.cur)}</strong><small>${m.count} jour${m.count>1?'s':''} · ${m.delta===null?'comparaison en attente':trendText(m.delta)}</small></article>`}
function html(data){
  const rows=data.rows||[],sig=dailySignals(rows),on=consentActive(data),demo=rows.some(r=>r?.raw_payload?.synthetic===true||!!r?.raw_payload?.demo_seed);
  if(!sig)return`<section class="kcn4"><header class="kcn4-top"><div><p class="kcn4-eyebrow">KŌMØ PULSE · CONNECTED</p><h1>Votre quotidien.</h1><p>Mouvement, sommeil et cœur dans le temps.</p></div></header><div class="kcn4-empty">Aucune donnée Connected n’est encore disponible. Dès qu’un dispositif compatible synchronise ses données, vos tendances apparaîtront ici.</div></section>`;
  const ps=periodStats(rows,period),latest=sig.latest,latestActive=latestWith(rows,'active_minutes'),latestHrv=latestWith(rows,'hrv_ms'),latestSpo2=latestWith(rows,'spo2_avg'),latestDistance=latestWith(rows,'distance_m'),composite=sig.composite;
  return`<section class="kcn4" data-connected-v4>
<header class="kcn4-top"><div><p class="kcn4-eyebrow">KŌMØ PULSE · CONNECTED</p><h1>Votre quotidien.</h1><p>Mouvement, sommeil et cœur comparés à votre propre niveau habituel.</p></div><span class="kcn4-status">${demo?'Données de démonstration':on?'Synchronisation active':'Collecte inactive'}</span></header>
<article class="kcn4-card kcn4-hero">
  <div class="kcn4-metric ${metricTone(sig.move)}"><div><span class="label">PAS</span><strong>${sig.move.value===null?'—':fmtInt(sig.move.value)}</strong></div><p>${esc(metricCopy(sig.move,v=>v===null?'—':fmtInt(v)+' pas'))}</p></div>
  <div class="kcn4-metric ${metricTone(sig.sleep)}"><div><span class="label">SOMMEIL</span><strong>${fmtHours(sig.sleep.value)}<small>cette nuit</small></strong></div><p>${esc(metricCopy(sig.sleep,fmtHours))}</p></div>
  <div class="kcn4-metric ${metricTone(sig.heart)}"><div><span class="label">FC REPOS</span><strong>${sig.heart.value===null?'—':Math.round(sig.heart.value)}<small>bpm</small></strong></div><p>${esc(metricCopy(sig.heart,fmtBpm))}</p></div>
</article>
<article class="kcn4-card kcn4-insight">
  <p class="kcn4-eyebrow">SIGNAL DU JOUR</p>
  <div><h3>${esc(insightCopy(sig))}</h3><p>${esc(fmtLongDate(latest.metric_date))} · signal quotidien non clinique · votre bilan Motion reste votre référence instrumentée.</p></div>
  <div class="kcn4-score"><span>CONNECTED</span><strong>${composite===null?'—':composite+'/100'}</strong></div>
</article>
<article class="kcn4-card kcn4-section">
  <div class="kcn4-head"><div><p class="kcn4-eyebrow">TENDANCE</p><h3>Vos ${period} derniers jours.</h3></div><div><p>Évolution réelle de vos pas, avec comparaison à la période précédente.</p><div class="kcn4-periods"><button type="button" data-kcn-period="7" class="${period===7?'active':''}">7 jours</button><button type="button" data-kcn-period="30" class="${period===30?'active':''}">30 jours</button></div></div></div>
  <div class="kcn4-trend">
    <div class="kcn4-chart"><div class="kcn4-charttop"><div><span>PAS MOYENS · ${period} JOURS</span><strong>${ps.steps.cur===null?'—':fmtInt(ps.steps.cur)}</strong><span>${ps.steps.delta===null?'Comparaison en attente':trendText(ps.steps.delta)} · couverture ${ps.coverage}%</span></div><span>${fmtDate(shiftDay(ps.end,-period+1))} → ${fmtDate(ps.end)}</span></div><div class="kcn4-bars">${barsV4(rows,period)}</div><div class="kcn4-axis"><span>${fmtDate(shiftDay(ps.end,-period+1))}</span><span>${fmtDate(ps.end)}</span></div></div>
    <div class="kcn4-periodstats">${periodComparisonV4('Pas / jour',ps.steps,v=>v===null?'—':fmtInt(v))}${periodComparisonV4('Sommeil / nuit',ps.sleep,fmtHours)}${periodComparisonV4('FC repos',ps.rhr,fmtBpm)}</div>
  </div>
</article>
<article class="kcn4-card kcn4-section"><div class="kcn4-head"><div><p class="kcn4-eyebrow">AUTRES SIGNAUX</p><h3>Ce qui complète votre lecture.</h3></div><p>Repères secondaires, sans remplacer l’interprétation de votre bilan Motion.</p></div><div class="kcn4-more">
  <article class="kcn4-mini"><span>Temps actif</span><strong>${latestActive&&valueFor(latestActive,'active_minutes')!==null?Math.round(valueFor(latestActive,'active_minutes'))+' min':'—'}</strong><small>${latestActive?'dernière mesure':'en attente'}</small></article>
  <article class="kcn4-mini"><span>Distance</span><strong>${latestDistance&&valueFor(latestDistance,'distance_m')!==null?(valueFor(latestDistance,'distance_m')/1000).toLocaleString('fr-FR',{maximumFractionDigits:1})+' km':'—'}</strong><small>${latestDistance?'dernière mesure':'en attente'}</small></article>
  <article class="kcn4-mini"><span>HRV</span><strong>${latestHrv&&valueFor(latestHrv,'hrv_ms')!==null?Math.round(valueFor(latestHrv,'hrv_ms'))+' ms':'—'}</strong><small>${latestHrv?'dernière mesure':'en attente'}</small></article>
  <article class="kcn4-mini"><span>SpO₂</span><strong>${latestSpo2&&valueFor(latestSpo2,'spo2_avg')!==null?valueFor(latestSpo2,'spo2_avg').toLocaleString('fr-FR',{maximumFractionDigits:1})+' %':'—'}</strong><small>${latestSpo2?'dernière mesure':'en attente'}</small></article>
</div></article>
<article class="kcn4-card kcn4-foot"><p>${on?'Connected collecte uniquement les catégories que vous avez autorisées.':'La collecte Connected est inactive.'} ${demo?'Les données affichées sur ce compte sont synthétiques pour la démonstration.':''}</p><button class="kcn4-btn ${on?'':'primary'}" type="button" data-connected-consent>${on?'Gérer la collecte':'Activer Connected'}</button></article>
</section>`;
}
function setChrome(){const eyebrow=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');if(eyebrow)eyebrow.textContent='KŌMØ PULSE · CONNECTED';if(title)title.textContent='Connected.'}
async function toggleConsent(){if(busy)return;busy=true;try{const d=await load(true),c=client();if(!d||!c)return;if(consentActive(d)){if(!confirm('Arrêter la collecte KŌMØ Connected ? Les données déjà enregistrées restent dans votre historique tant qu’elles ne sont pas supprimées.'))return;const r=await c.from('wearable_consents').update({status:'withdrawn',withdrawn_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',d.consent.id);if(r.error)throw r.error}else{const r=await c.from('wearable_consents').insert({user_id:d.session.user.id,purpose:'connected_followup',consent_version:'2026-09-03-connected-v3',status:'active',data_categories:['movement','sleep','heart_rate','spo2']});if(r.error)throw r.error}cache=null;window.dispatchEvent(new CustomEvent('komo:wearable-data-updated'));await render(true)}catch(e){console.error('[connected-v3]',e);alert(e.message||'Action impossible.')}finally{busy=false}}
function bind(root){root.querySelector('[data-connected-consent]')?.addEventListener('click',toggleConsent);root.querySelectorAll('[data-kcn-period]').forEach(b=>b.addEventListener('click',()=>{period=Number(b.dataset.kcnPeriod)||7;render(false)}))}
async function render(force=false){if(route()!=='key')return;style();document.body.classList.add('connected-v2','connected-v3');const root=document.querySelector('#viewRoot');if(!root)return;setChrome();try{const d=await load(force);if(route()!=='key')return;if(!d){root.innerHTML='<section class="kcn3"><div class="kcn3-empty">Session indisponible. Reconnectez-vous pour accéder à KŌMØ Connected.</div></section>';return}root.innerHTML=html(d);bind(root)}catch(e){console.error('[connected-v3]',e);root.innerHTML='<section class="kcn3"><div class="kcn3-empty">KŌMØ Connected est momentanément indisponible. Les autres espaces Pulse restent accessibles.</div></section>'}}
function enter(force=false){if(route()!=='key'){document.body.classList.remove('connected-v2','connected-v3');return}clearTimeout(timer);timer=setTimeout(()=>render(force),25)}
window.addEventListener('hashchange',()=>enter(false));window.addEventListener('pageshow',()=>enter(false));window.addEventListener('komo:session-ready',()=>enter(false));window.addEventListener('komo:wearable-data-updated',()=>{cache=null;enter(true)});document.addEventListener('DOMContentLoaded',()=>enter(false));setTimeout(()=>enter(false),300);window.KomoKeyHubV1={version:V,refresh:()=>render(true)};
})();
