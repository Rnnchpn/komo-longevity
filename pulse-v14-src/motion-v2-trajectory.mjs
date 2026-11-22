// KŌMØ Motion — trajectoire J0 → S6 → S12 (20 novembre 2026).
// Compare les consultations TERMINÉES d'un même patient, métrique par métrique.
// Descriptif uniquement : pas de score composite, pas d'âge, pas de diagnostic.
// Reproductibilité (22/11/2026) : un écart n'est qualifié (progrès / recul, point ●) que s'il dépasse
// la marge d'erreur de la mesure (changement minimal détectable publié, ou marge de prudence quand
// aucune valeur n'existe pour nos appareils). En dessous, la mesure est « stable ».
// mdc : en unité de la mesure · mdcPct : en % de la valeur de départ · cross : seuil dont le franchissement compte.
// mdcBySex : marge propre au sexe (options.sex), mdc sinon.
import {stsPowerOf} from './motion-protocol.mjs?v=20261122-sanscamera-v1';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const round=(x,d=1)=>Math.round(x*10**d)/10**d;
const maxOf=(a,b)=>finite(a)&&finite(b)?Math.max(a,b):finite(a)?a:finite(b)?b:null;
const minOf=(a,b)=>finite(a)&&finite(b)?Math.min(a,b):null;
const F=(r,step,key)=>r?.[step]?.status==='done'?r[step]?.fields?.[key]:undefined;
const D=(r,step,key)=>r?.[step]?.status==='done'?r[step]?.derived?.[key]:undefined;
const V=(r,step)=>r?.[step]?.status==='done'?r[step]?.value:undefined;

// better: 'higher' | 'lower' | 'neutral'. threshold: changement pertinent publié (même unité).
export const TRAJECTORY_METRICS=[
 // 0,1 m/s : changement important (Perera 2006), dans la fourchette des MDC publiés (0,08 à 0,2 m/s).
 {id:'gait_speed',label:'Vitesse de marche (4 m)',unit:'m/s',decimals:2,better:'higher',mdc:0.1,
  get:r=>D(r,'gait_4m','gait_speed_ms')},
 // ≈ 2 levers : différence minimale détectable du lever de chaise.
 {id:'sts_30s',label:'Levers de chaise en 30 s',unit:'levers',decimals:0,better:'higher',mdc:2,
  get:r=>V(r,'sts')},
 // Puissance relative estimée (Alcazar) : changement cliniquement important 0,42 W/kg (homme), 0,33 (femme).
 {id:'sts_power',label:'Puissance des jambes (estimée)',unit:'W/kg',decimals:2,better:'higher',mdc:0.42,
  mdcBySex:{male:0.42,female:0.33},get:r=>stsPowerOf(r||{})},
 // 25 cm : changement minimal détectable du Two-Step chez l'adulte âgé (Sawaya 2025 : 25 à 30 cm).
 {id:'two_step',label:'Two-Step (meilleur essai)',unit:'cm',decimals:0,better:'higher',mdc:25,
  get:r=>V(r,'two_step')},
 // Appui unipodal : MDC publié ≈ 23 à 26 s, inutilisable en secondes ; seul le franchissement des 10 s compte.
 {id:'balance_min',label:'Équilibre unipodal · côté le plus faible',unit:'s',decimals:1,better:'higher',mdc:24,cross:10,
  get:r=>minOf(V(r,'unipodal_left'),V(r,'unipodal_right'))},
 {id:'qs_velocity',label:'Quiet Stand · vitesse du centre de pression',unit:'mm/s',decimals:1,better:'lower',mdcPct:20,
  get:r=>F(r,'fd_quiet_stand','fd_qs_velocity_mms')},
 {id:'qs_ec_velocity',label:'Quiet Stand yeux fermés · vitesse du centre de pression',unit:'mm/s',decimals:1,better:'lower',mdcPct:20,
  get:r=>F(r,'fd_quiet_stand_ec','fd_qsec_velocity_mms')},
 // Appui sur un pied, plateforme : seulement pour un essai tenu 30 s ; on suit le côté le plus instable.
 {id:'sls_velocity',label:'Appui sur un pied · vitesse du centre de pression (côté le plus instable)',unit:'mm/s',decimals:1,better:'lower',mdcPct:20,
  get:r=>maxOf(F(r,'unipodal_left','sls_left_velocity_mms'),F(r,'unipodal_right','sls_right_velocity_mms'))},
 {id:'qs_asym',label:'Quiet Stand · asymétrie de charge',unit:'%',decimals:1,better:'lower',mdc:10,
  get:r=>F(r,'fd_quiet_stand','fd_qs_asym_pct')},
 {id:'fd_sts_time',label:'Lever sur plateformes · temps pour se lever',unit:'s',decimals:2,better:'lower',mdcPct:20,
  get:r=>F(r,'fd_sts','fd_sts_time_to_stand_s')},
 // Saut vertical : test très reproductible chez l'adulte âgé (erreur de l'ordre de 5 %) → marge de prudence 10 %.
 {id:'cmj_power',label:'Saut vertical · puissance maximale',unit:'W/kg',decimals:1,better:'higher',mdcPct:10,
  get:r=>F(r,'fd_cmj','cmj_peak_power_wkg')},
 {id:'cmj_height',label:'Saut vertical · hauteur',unit:'cm',decimals:1,better:'higher',mdcPct:10,
  get:r=>F(r,'fd_cmj','cmj_height_cm')},
 {id:'fd_sts_asym',label:'Lever sur plateformes · asymétrie',unit:'%',decimals:1,better:'lower',mdc:10,
  get:r=>F(r,'fd_sts','fd_sts_asym_pct')},
 // ≈ 5 kg (50 N) : différence minimale chez l'adulte âgé (4,7 à 6 kg selon les études).
 {id:'grip_best',label:'Préhension · meilleur côté',unit:'N',decimals:0,better:'higher',mdc:50,
  get:r=>maxOf(F(r,'dynamo_grip','grip_left_n'),F(r,'dynamo_grip','grip_right_n'))},
 {id:'grip_lsi',label:'Préhension · symétrie',unit:'%',decimals:0,better:'higher',mdc:10,
  get:r=>D(r,'dynamo_grip','lsi_pct')},
 // Dynamomètre à main, membres inférieurs : erreur de 18 % et plus selon les études → marge de 20 %.
 {id:'knee_best',label:'Extension de genou · meilleur côté',unit:'N',decimals:0,better:'higher',mdcPct:20,
  get:r=>maxOf(F(r,'dynamo_knee_ext','knee_ext_left_n'),F(r,'dynamo_knee_ext','knee_ext_right_n'))},
 {id:'knee_lsi',label:'Extension de genou · symétrie',unit:'%',decimals:0,better:'higher',mdc:10,
  get:r=>D(r,'dynamo_knee_ext','lsi_pct')},
 {id:'knee_flex_best',label:'Flexion de genou · meilleur côté',unit:'N',decimals:0,better:'higher',mdcPct:20,
  get:r=>maxOf(F(r,'dynamo_knee_flex','knee_flex_left_n'),F(r,'dynamo_knee_flex','knee_flex_right_n'))},
 {id:'knee_flex_lsi',label:'Flexion de genou · symétrie',unit:'%',decimals:0,better:'higher',mdc:10,
  get:r=>D(r,'dynamo_knee_flex','lsi_pct')},
 {id:'hip_flex_best',label:'Flexion de hanche · meilleur côté',unit:'N',decimals:0,better:'higher',mdcPct:20,
  get:r=>maxOf(F(r,'dynamo_hip_flex','hip_flex_left_n'),F(r,'dynamo_hip_flex','hip_flex_right_n'))},
 {id:'hip_flex_lsi',label:'Flexion de hanche · symétrie',unit:'%',decimals:0,better:'higher',mdc:10,
  get:r=>D(r,'dynamo_hip_flex','lsi_pct')},
 {id:'hip_best',label:'Abduction de hanche · meilleur côté',unit:'N',decimals:0,better:'higher',mdcPct:20,
  get:r=>maxOf(F(r,'dynamo_hip_abd','hip_abd_left_n'),F(r,'dynamo_hip_abd','hip_abd_right_n'))},
 {id:'hip_lsi',label:'Abduction de hanche · symétrie',unit:'%',decimals:0,better:'higher',mdc:10,
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
 // Marche : départ lancé (avant v2.3) et départ arrêté (SPPB) diffèrent de 0,1 à 0,2 m/s.
 const gaitMethods=done.map(x=>x.results?.gait_4m?.status==='done'?(x.results.gait_4m.method||'GAIT_4M_DYNAMIC_START_MEAN'):null).filter(Boolean);
 if(new Set(gaitMethods).size>1)
  warnings.push('Marche : départ lancé (ancien protocole) et départ arrêté mélangés ; l’écart attendu (0,1 à 0,2 m/s) empêche de comparer les vitesses.');
 const hipMethods=done.map(x=>x.results?.dynamo_hip_abd?.status==='done'?(x.results.dynamo_hip_abd.method||'HIP_ABD_SUPINE'):null).filter(Boolean);
 if(new Set(hipMethods).size>1)
  warnings.push('Abduction de hanche : mesure allongée (ancien protocole) et mesure assise mélangées ; les forces ne sont pas comparables.');
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
   // Changement réel : au-delà de la marge d'erreur, ou franchissement du seuil de la mesure (10 s d'appui).
   const mdc=m.mdcBySex&&finite(m.mdcBySex[options.sex])?m.mdcBySex[options.sex]:m.mdc;
   const margin=finite(mdc)?mdc:finite(m.mdcPct)&&values[firstIdx]?Math.abs(values[firstIdx])*m.mdcPct/100:null;
   const crossed=finite(m.cross)&&(values[firstIdx]<m.cross)!==(values[lastIdx]<m.cross);
   notable=direction!=='flat'&&((finite(margin)&&Math.abs(delta)>=margin-1e-9)||crossed);
   if(m.better==='neutral'||direction==='flat'||!notable)verdict='stable';
   else verdict=(direction==='up')===(m.better==='higher')?'favorable':'defavorable';
  }
  return {id:m.id,label:m.label,unit:m.unit,decimals:m.decimals,better:m.better,threshold:m.mdc??null,
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
 const fav=t.rows.filter(r=>r.verdict==='favorable'),def=t.rows.filter(r=>r.verdict==='defavorable');
 const stable=t.rows.filter(r=>r.verdict==='stable'&&r.better!=='neutral').length;
 const span=t.points[0].label+' → '+t.points[t.points.length-1].label;
 return span+' : '+(fav.length?'progrès réel sur '+fav.map(r=>r.label.toLowerCase()).join(', '):'aucun progrès au-delà de la marge d’erreur')+
  (def.length?' · recul réel sur '+def.map(r=>r.label.toLowerCase()).join(', '):'')+
  ' · '+stable+' mesure'+(stable>1?'s':'')+' stable'+(stable>1?'s':'')+' (écart dans la marge d’erreur).';
}
export function frDate(iso){
 const d=new Date(iso+'T12:00:00Z');
 return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Paris'}).format(d);
}
