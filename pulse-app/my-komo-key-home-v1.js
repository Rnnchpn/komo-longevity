/* KŌMØ KEY — premium home panel · essential wearable state only */
(()=>{
'use strict';
const V='2.0.2';
let timer=0;
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const client=()=>window.KomoRuntime?.client||null;
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const avg=(rows,key)=>{const values=rows.map(x=>num(x[key])).filter(v=>v!==null);return values.length?values.reduce((a,b)=>a+b,0)/values.length:null};
const fmt=(v,d=0)=>v===null||v===undefined?'—':Number(v).toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:d});
const dayKey=d=>{const x=new Date(d),m=String(x.getMonth()+1).padStart(2,'0'),day=String(x.getDate()).padStart(2,'0');return`${x.getFullYear()}-${m}-${day}`};
const prettyDate=v=>{if(!v)return'Données en attente';const d=new Date(`${v}T12:00:00`);return new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'2-digit',month:'short'}).format(d).replace('.','')};
async function readState(){
 const sb=client();
 if(!sb)return{ready:false,active:false,rows:[]};
 try{
  const session=window.KomoRuntime?.getContext?.()?.session||(await sb.auth.getSession()).data?.session;
  if(!session?.user)return{ready:true,active:false,rows:[]};
  const from=new Date();from.setDate(from.getDate()-14);
  const [consent,data]=await Promise.all([
   sb.from('wearable_consents').select('status,consented_at').eq('user_id',session.user.id).eq('purpose','connected_followup').order('consented_at',{ascending:false}).limit(1).maybeSingle(),
   sb.from('wearable_daily_metrics').select('metric_date,steps,active_minutes,sleep_minutes,resting_hr').eq('user_id',session.user.id).gte('metric_date',dayKey(from)).order('metric_date',{ascending:false})
  ]);
  return{ready:true,active:!consent.error&&consent.data?.status==='active',rows:data.error?[]:(data.data||[])};
 }catch(e){console.error('[key-home-v2 data]',e);return{ready:true,active:false,rows:[],error:true}}
}
function metric(label,value,unit,sub,accent=''){
 return`<article class="mkh-metric ${accent}"><small>${label}</small><div class="mkh-metric-value"><strong>${value}</strong>${unit?`<span>${unit}</span>`:''}</div><p>${sub}</p></article>`
}
function spark(rows){
 const chron=[...rows].slice(0,7).reverse(),values=chron.map(r=>num(r.steps)||0),max=Math.max(...values,1);
 const bars=chron.length?chron.map((r,i)=>`<i style="--h:${Math.max(12,Math.round((values[i]/max)*100))}%" title="${fmt(values[i])} pas"></i>`).join(''):'<i style="--h:22%"></i><i style="--h:38%"></i><i style="--h:31%"></i><i style="--h:52%"></i><i style="--h:46%"></i><i style="--h:68%"></i><i style="--h:58%"></i>';
 return`<div class="mkh-spark" aria-label="Tendance des pas sur 7 jours">${bars}</div>`
}
function panel(s){
 const r=s.rows.slice(0,7),latest=r[0]||null,has=!!latest,steps=num(latest?.steps),active=num(latest?.active_minutes),sleep=num(latest?.sleep_minutes),rhr=num(latest?.resting_hr),avgSteps=avg(r,'steps'),coverage=Math.min(100,Math.round(new Set(r.map(x=>x.metric_date)).size/7*100));
 const status=!s.ready?'Connexion Pulse…':s.active?(has?'KEY connecté':'KEY connecté · premières données attendues'):'KEY prêt à être activé';
 const date=has?prettyDate(latest.metric_date):'Suivi longitudinal';
 return`<section class="mykomo-key-home ${has?'has-data':''}" data-key-home>
  <div class="mkh-orbit" aria-hidden="true"><span>K</span><i></i><i></i><i></i></div>
  <header class="mkh-copy">
   <div class="mkh-kicker"><i></i>KŌMØ KEY <span>${s.active?'LIVE':'CONTINUOUS'}</span></div>
   <h3>Votre mouvement.<br><em>Entre deux bilans.</em></h3>
   <p>Les signaux essentiels de votre quotidien, lisibles en un regard. KEY suit votre continuité sans modifier votre Motion Score.</p>
   <div class="mkh-actions"><button class="mkh-action" type="button" data-key-open>Ouvrir KŌMØ KEY <b>→</b></button><span class="mkh-status">${status}</span></div>
  </header>
  <section class="mkh-live">
   <div class="mkh-live-head"><div><small>${has?'DERNIÈRE JOURNÉE':'APERÇU KEY'}</small><strong>${date}</strong></div><span class="mkh-live-pill ${s.active?'on':''}"><i></i>${s.active?'Connecté':'Disponible'}</span></div>
   <div class="mkh-metrics">
    ${metric('PAS',steps===null?'—':fmt(steps),'',avgSteps===null?'Mouvement quotidien':`${fmt(avgSteps)} / j · moyenne 7 j`,'primary')}
    ${metric('ACTIF',active===null?'—':fmt(active),'min','Temps actif enregistré')}
    ${metric('SOMMEIL',sleep===null?'—':fmt(sleep/60,1),'h','Dernière nuit disponible')}
    ${metric('FC REPOS',rhr===null?'—':fmt(rhr),'bpm','Dernière valeur disponible')}
   </div>
   <footer class="mkh-trend"><div><small>CONTINUITÉ · 7 JOURS</small><strong>${has?`${coverage}% de couverture`:'Baseline en construction'}</strong></div>${spark(r)}<span>7 · 30 · 90 j</span></footer>
  </section>
 </section>`
}
async function run(){
 if(route()!=='home')return;
 const host=document.querySelector('[data-my-komo-home]');if(!host)return;
 const current=host.querySelector('[data-key-home]');
 const s=await readState();
 const wrap=document.createElement('div');wrap.innerHTML=panel(s);const fresh=wrap.firstElementChild;
 if(current)current.replaceWith(fresh);else{const engagement=host.querySelector('.mykomo-engagement');engagement?.insertAdjacentElement('beforebegin',fresh)||host.appendChild(fresh)}
 fresh.querySelector('[data-key-open]')?.addEventListener('click',()=>{if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go('key');else location.hash='key'})
}
function schedule(ms=120){clearTimeout(timer);timer=setTimeout(run,ms)}
['hashchange','komo:route-ready','komo:data-ready','komo:wearable-data-updated'].forEach(e=>addEventListener(e,()=>schedule()));
document.addEventListener('DOMContentLoaded',()=>schedule(900));setTimeout(run,1500);
window.KomoKeyHome={refresh:run,version:V};
})();