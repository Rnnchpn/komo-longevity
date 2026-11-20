// KŌMØ Motion — trajectoire J0 → S6 → S12 (20 novembre 2026).
// Compare les consultations TERMINÉES d'un même patient, métrique par métrique.
// Descriptif uniquement : pas de score composite, pas d'âge, pas de diagnostic.
// Un « changement net » n'est signalé que pour les métriques disposant d'un repère publié
// de changement cliniquement pertinent ; sinon l'écart est affiché sans qualificatif.
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const round=(x,d=1)=>Math.round(x*10**d)/10**d;
const maxOf=(a,b)=>finite(a)&&finite(b)?Math.max(a,b):finite(a)?a:finite(b)?b:null;
const minOf=(a,b)=>finite(a)&&finite(b)?Math.min(a,b):null;
const F=(r,step,key)=>r?.[step]?.status==='done'?r[step]?.fields?.[key]:undefined;
const D=(r,step,key)=>r?.[step]?.status==='done'?r[step]?.derived?.[key]:undefined;
const V=(r,step)=>r?.[step]?.status==='done'?r[step]?.value:undefined;

// better: 'higher' | 'lower' | 'neutral'. threshold: changement pertinent publié (même unité).
export const TRAJECTORY_METRICS=[
 {id:'gait_speed',label:'Vitesse de marche (4 m)',unit:'m/s',decimals:2,better:'higher',threshold:0.1,
  get:r=>D(r,'gait_4m','gait_speed_ms')},
 {id:'sts_30s',label:'Levers de chaise en 30 s',unit:'levers',decimals:0,better:'higher',threshold:2,
  get:r=>V(r,'sts')},
 {id:'two_step',label:'Two-Step (meilleur essai)',unit:'cm',decimals:0,better:'higher',
  get:r=>V(r,'two_step')},
 {id:'balance_min',label:'Équilibre unipodal · côté le plus faible',unit:'s',decimals:1,better:'higher',
  get:r=>minOf(V(r,'unipodal_left'),V(r,'unipodal_right'))},
 {id:'qs_ellipse',label:'Quiet Stand · aire de l’ellipse',unit:'mm²',decimals:0,better:'lower',
  get:r=>F(r,'fd_quiet_stand','fd_qs_ellipse_mm2')},
 {id:'fd_sts_asym',label:'Lever sur plateformes · asymétrie',unit:'%',decimals:1,better:'lower',
  get:r=>F(r,'fd_sts','fd_sts_asym_pct')},
 {id:'grip_best',label:'Préhension · meilleur côté',unit:'N',decimals:0,better:'higher',threshold:50,
  get:r=>maxOf(F(r,'dynamo_grip','grip_left_n'),F(r,'dynamo_grip','grip_right_n'))},
 {id:'grip_lsi',label:'Préhension · symétrie',unit:'%',decimals:0,better:'higher',
  get:r=>D(r,'dynamo_grip','lsi_pct')},
 {id:'knee_best',label:'Extension de genou · meilleur côté',unit:'N',decimals:0,better:'higher',
  get:r=>maxOf(F(r,'dynamo_knee_ext','knee_ext_left_n'),F(r,'dynamo_knee_ext','knee_ext_right_n'))},
 {id:'knee_lsi',label:'Extension de genou · symétrie',unit:'%',decimals:0,better:'higher',
  get:r=>D(r,'dynamo_knee_ext','lsi_pct')},
 {id:'hip_best',label:'Abduction de hanche · meilleur côté',unit:'N',decimals:0,better:'higher',
  get:r=>maxOf(F(r,'dynamo_hip_abd','hip_abd_left_n'),F(r,'dynamo_hip_abd','hip_abd_right_n'))},
 {id:'hip_lsi',label:'Abduction de hanche · symétrie',unit:'%',decimals:0,better:'higher',
  get:r=>D(r,'dynamo_hip_abd','lsi_pct')},
 {id:'body_mass',label:'Masse',unit:'kg',decimals:1,better:'neutral',
  get:r=>F(r,'anthropometry','body_mass_kg')}
];

// J0 = première consultation terminée. S6 ≈ 6 semaines (35–56 j), S12 ≈ 12 semaines (70–100 j).
export function timepointLabel(days){
 if(!finite(days)||days<3)return 'J0';
 if(days>=35&&days<=56)return 'S6';
 if(days>=70&&days<=100)return 'S12';
 if(days>=150&&days<=210)return 'M6';
 return 'J+'+Math.round(days);
}
const fmt=(x,d)=>finite(x)?round(x,d).toFixed(d).replace('.',','):'—';
const signed=(x,d)=>finite(x)?(x>0?'+':x<0?'−':'±')+fmt(Math.abs(x),d):'—';

export function buildTrajectory(sessions=[],options={}){
 const done=(Array.isArray(sessions)?sessions:[])
  .filter(x=>x&&x.status==='completed'&&x.progress?.results&&typeof x.progress.results==='object')
  .map(x=>({id:x.id,code:x.display_code||'',date:new Date(x.completed_at||x.updated_at||x.created_at),
   results:x.progress.results,protocol:x.progress.protocol?.version||null}))
  .filter(x=>!Number.isNaN(x.date.getTime()))
  .sort((a,b)=>a.date-b.date)
  .slice(-(options.max||4));
 if(!done.length)return {points:[],rows:[],nextControl:null,comparable:true,warnings:[]};
 const t0=done[0].date.getTime();
 const points=done.map((x,i)=>{
  const days=(x.date.getTime()-t0)/86400000;
  return {id:x.id,code:x.code,date:x.date.toISOString().slice(0,10),days:round(days,0),
   label:i===0?'J0':timepointLabel(days)};
 });
 const warnings=[];
 // Comparabilité : même position du pad tibial pour l'extension de genou.
 const pads=done.map(x=>F(x.results,'dynamo_knee_ext','knee_pad_distance_cm')).filter(finite);
 if(pads.length>1&&Math.max(...pads)-Math.min(...pads)>1)
  warnings.push('Extension de genou : position du pad différente entre les séances (écart > 1 cm) ; comparaison des forces à prendre avec prudence.');
 // Conditions standardisées : chaussage et version du protocole identiques à chaque séance.
 const footwear=done.map(x=>F(x.results,'anthropometry','footwear')).filter(Boolean);
 if(new Set(footwear).size>1)
  warnings.push('Chaussage différent entre les séances : marche, équilibre et plateformes à comparer avec prudence.');
 const versions=done.map(x=>x.protocol).filter(Boolean);
 if(new Set(versions).size>1)
  warnings.push('Version du protocole différente entre les séances ('+[...new Set(versions)].join(', ')+').');
 const sources=done.map(x=>x.results?.sts?.source).filter(Boolean);
 if(new Set(sources).size>1)
  warnings.push('Lever de chaise : comptage vidéo et comptage manuel mélangés selon les séances.');
 const rows=TRAJECTORY_METRICS.map(m=>{
  const values=done.map(x=>{const v=m.get(x.results);return finite(v)?v:null;});
  const firstIdx=values.findIndex(finite);
  let lastIdx=-1;for(let i=values.length-1;i>=0;i--)if(finite(values[i])){lastIdx=i;break;}
  const available=values.filter(finite).length;
  let delta=null,deltaPct=null,direction='flat',notable=false,verdict='';
  if(available>=2&&firstIdx!==lastIdx){
   delta=values[lastIdx]-values[firstIdx];
   deltaPct=values[firstIdx]!==0?100*delta/Math.abs(values[firstIdx]):null;
   const eps=10**-(m.decimals)/2;
   direction=Math.abs(delta)<eps?'flat':delta>0?'up':'down';
   notable=finite(m.threshold)&&Math.abs(delta)>=m.threshold;
   if(m.better==='neutral'||direction==='flat')verdict='stable';
   else verdict=(direction==='up')===(m.better==='higher')?'favorable':'defavorable';
  }
  return {id:m.id,label:m.label,unit:m.unit,decimals:m.decimals,better:m.better,threshold:m.threshold??null,
   values,display:values.map(v=>fmt(v,m.decimals)),delta,deltaPct:finite(deltaPct)?round(deltaPct,0):null,
   deltaDisplay:signed(delta,m.decimals),direction,notable,verdict,available};
 }).filter(r=>r.available>0);
 const last=done[done.length-1].date;
 const nextDays=points.length===1?42:points[points.length-1].label==='S6'?42:null;
 const nextControl=nextDays?new Date(last.getTime()+nextDays*86400000).toISOString().slice(0,10):null;
 return {points,rows,nextControl,comparable:warnings.length===0,warnings};
}

// Synthèse en une phrase, lisible par le patient.
export function trajectoryHeadline(t){
 if(!t?.points?.length)return 'Aucune consultation terminée.';
 if(t.points.length===1)return 'Consultation de départ (J0) enregistrée'+(t.nextControl?' · contrôle conseillé vers le '+frDate(t.nextControl):'')+'.';
 const fav=t.rows.filter(r=>r.verdict==='favorable').length,def=t.rows.filter(r=>r.verdict==='defavorable').length;
 const span=t.points[0].label+' → '+t.points[t.points.length-1].label;
 return span+' : '+fav+' indicateur'+(fav>1?'s':'')+' en progrès, '+def+' en recul'+
  (t.rows.some(r=>r.notable)?' · changement net sur '+t.rows.filter(r=>r.notable).map(r=>r.label.toLowerCase()).join(', '):'')+'.';
}
export function frDate(iso){
 const d=new Date(iso+'T12:00:00Z');
 return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Paris'}).format(d);
}
