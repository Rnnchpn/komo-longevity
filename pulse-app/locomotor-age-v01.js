const VERSION='komo-locomotor-age-v0.1.0';
const REFERENCE='Hall et al. 2017 · Physical Performance Across the Adult Life Span';
const REFERENCE_URL='https://academic.oup.com/biomedgerontology/article/72/4/572/2629941';

const REF={
  male:[
    {min:30,max:39,mid:35,gait:{mean:1.4,sd:0.3},chair:{mean:19.1,sd:5.1},sls:{mean:58.8,sd:7.0}},
    {min:40,max:49,mid:45,gait:{mean:1.4,sd:0.2},chair:{mean:20.0,sd:6.1},sls:{mean:55.5,sd:14.0}},
    {min:50,max:59,mid:55,gait:{mean:1.4,sd:0.3},chair:{mean:17.4,sd:4.5},sls:{mean:42.2,sd:20.3}},
    {min:60,max:69,mid:65,gait:{mean:1.3,sd:0.2},chair:{mean:16.4,sd:4.4},sls:{mean:40.4,sd:20.2}},
    {min:70,max:79,mid:75,gait:{mean:1.2,sd:0.3},chair:{mean:14.9,sd:4.9},sls:{mean:27.2,sd:19.8}},
    {min:80,max:99,mid:85,gait:{mean:1.1,sd:0.2},chair:{mean:11.8,sd:4.4},sls:{mean:13.6,sd:17.2}}
  ],
  female:[
    {min:30,max:39,mid:35,gait:{mean:1.4,sd:0.3},chair:{mean:19.8,sd:5.8},sls:{mean:56.4,sd:10.1}},
    {min:40,max:49,mid:45,gait:{mean:1.3,sd:0.2},chair:{mean:18.8,sd:5.2},sls:{mean:54.7,sd:13.8}},
    {min:50,max:59,mid:55,gait:{mean:1.3,sd:0.3},chair:{mean:16.9,sd:4.7},sls:{mean:47.6,sd:18.3}},
    {min:60,max:69,mid:65,gait:{mean:1.3,sd:0.3},chair:{mean:15.2,sd:4.6},sls:{mean:37.9,sd:21.0}},
    {min:70,max:79,mid:75,gait:{mean:1.1,sd:0.2},chair:{mean:13.3,sd:4.7},sls:{mean:25.6,sd:19.9}},
    {min:80,max:99,mid:85,gait:{mean:1.0,sd:0.2},chair:{mean:10.4,sd:4.9},sls:{mean:11.3,sd:10.7}}
  ],
  total:[
    {min:30,max:39,mid:35,gait:{mean:1.4,sd:0.3},chair:{mean:19.5,sd:5.5},sls:{mean:57.4,sd:9.0}},
    {min:40,max:49,mid:45,gait:{mean:1.4,sd:0.2},chair:{mean:19.4,sd:5.7},sls:{mean:55.1,sd:13.8}},
    {min:50,max:59,mid:55,gait:{mean:1.4,sd:0.3},chair:{mean:17.2,sd:4.6},sls:{mean:44.8,sd:19.4}},
    {min:60,max:69,mid:65,gait:{mean:1.3,sd:0.3},chair:{mean:15.8,sd:4.5},sls:{mean:39.2,sd:20.6}},
    {min:70,max:79,mid:75,gait:{mean:1.2,sd:0.2},chair:{mean:14.1,sd:4.9},sls:{mean:26.4,sd:19.8}},
    {min:80,max:99,mid:85,gait:{mean:1.1,sd:0.2},chair:{mean:10.9,sd:4.8},sls:{mean:12.1,sd:13.2}}
  ]
};

function num(v){if(v===null||v===undefined||v==='')return null;const x=Number(v);return Number.isFinite(x)?x:null}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function median(xs){const a=[...xs].sort((x,y)=>x-y);if(!a.length)return null;const i=Math.floor(a.length/2);return a.length%2?a[i]:(a[i-1]+a[i])/2}
function ageYears(birth){if(!birth)return null;const d=new Date(`${birth}T00:00:00Z`);if(Number.isNaN(d.getTime()))return null;const now=new Date();let a=now.getUTCFullYear()-d.getUTCFullYear();const m=now.getUTCMonth()-d.getUTCMonth();if(m<0||(m===0&&now.getUTCDate()<d.getUTCDate()))a--;return a}
function sexKey(v){const s=String(v||'').toLowerCase();if(['m','male','man','homme','masculin'].includes(s))return'male';if(['f','female','woman','femme','féminin','feminin'].includes(s))return'female';return'total'}
function measurement(d,code){return(d?.measurements||[]).filter(x=>x.indicator_code===code&&x.qc_status==='valid').sort((a,b)=>new Date(b.recorded_at||0)-new Date(a.recorded_at||0))[0]||null}
function patientBirth(p){return p?.birth_date||p?.date_of_birth||p?.dob||null}
function patientSex(p){return p?.sex_at_birth||p?.sex||p?.gender||p?.biological_sex||null}
function equivalentAge(value,key,table){let best=null;for(const row of table){const ref=row[key];if(!ref||!ref.sd)continue;const z=Math.abs(value-ref.mean)/ref.sd;if(!best||z<best.z)best={age:row.mid,band:[row.min,row.max],mean:ref.mean,sd:ref.sd,z}}return best}
function confidenceFrom(spread,count,sexSpecific){let score=count===3?0.82:0.68;if(spread<=10)score+=0.12;else if(spread<=20)score+=0.04;else if(spread>25)score-=0.16;if(!sexSpecific)score-=0.08;return clamp(score,0.25,0.95)}
function labelConfidence(s){return s>=0.82?'high':s>=0.65?'moderate':'low'}
function notCalculable(reason,extra={}){return{version:VERSION,status:'not_calculable',age:null,ageBand:null,interval:null,deltaYears:null,confidence:0,confidenceLabel:'none',experimental:true,reason,source:{title:REFERENCE,url:REFERENCE_URL},...extra}}

export function computeLocomotorAge(dossier,interpretation={}){
  const p=dossier?.patient||{},chronologicalAge=ageYears(patientBirth(p)),sex=sexKey(patientSex(p)),table=REF[sex]||REF.total;
  if(chronologicalAge===null)return notCalculable('Date de naissance nécessaire.',{chronologicalAge,sex});
  if(chronologicalAge<30||chronologicalAge>99)return notCalculable('Référence v0.1 limitée aux adultes de 30 à 99 ans.',{chronologicalAge,sex});
  if((interpretation?.consistencyIssues||[]).length)return notCalculable('Données fonctionnelles discordantes : revue professionnelle requise avant estimation.',{chronologicalAge,sex,blockingIssues:interpretation.consistencyIssues});
  if(interpretation?.carePlan?.status==='review_required')return notCalculable('Le dossier nécessite une revue clinique avant estimation.',{chronologicalAge,sex});

  const gait=num(measurement(dossier,'M-FUN-05')?.numeric_value),chair=num(measurement(dossier,'M-FUN-04')?.numeric_value),slsL=num(measurement(dossier,'M-FUN-06')?.numeric_value),slsR=num(measurement(dossier,'M-FUN-07')?.numeric_value),sls=(slsL!==null&&slsR!==null)?(slsL+slsR)/2:(slsL??slsR);
  const reasons=[],values=[];
  if(gait!==null&&gait>=0.3&&gait<=2.2)values.push({id:'gait_speed',label:'Vitesse de marche habituelle 4 m',value:gait,unit:'m/s',weight:0.36,...equivalentAge(gait,'gait',table)});else reasons.push('Vitesse de marche habituelle 4 m manquante ou hors plage plausible.');
  if(chair!==null&&chair>=1&&chair<=45)values.push({id:'chair_stand_30s',label:'Chair Stand 30 s',value:chair,unit:'répétitions',weight:0.34,...equivalentAge(chair,'chair',table)});else reasons.push('Chair Stand 30 s manquant ou hors plage plausible.');
  if(sls!==null&&sls>=0&&sls<=60)values.push({id:'single_leg_stance',label:'Appui unipodal yeux ouverts',value:Math.round(sls*10)/10,unit:'s',weight:0.30,...equivalentAge(sls,'sls',table)});else reasons.push('Appui unipodal yeux ouverts manquant ou hors plage plausible.');
  if(values.length<2)return notCalculable('Au moins deux des trois tests standardisés sont nécessaires : marche 4 m, Chair Stand 30 s, appui unipodal.',{chronologicalAge,sex,inputs:values,reasons});

  const ages=values.map(v=>v.age),spread=Math.max(...ages)-Math.min(...ages);
  if(spread>30)return notCalculable('Les âges équivalents des tests sont trop discordants (>30 ans). Refaire ou vérifier les tests avant interprétation.',{chronologicalAge,sex,inputs:values,spreadYears:spread,reasons});

  const totalWeight=values.reduce((s,v)=>s+v.weight,0),weighted=values.reduce((s,v)=>s+v.age*v.weight,0)/totalWeight,med=median(ages),age=Math.round(weighted*0.65+med*0.35),confidence=confidenceFrom(spread,values.length,sex!=='total'),half=confidence>=0.82?7:confidence>=0.65?10:15,interval=[clamp(age-half,30,99),clamp(age+half,30,99)],deltaYears=age-chronologicalAge,band=table.find(x=>age>=x.min&&age<=x.max)||table[table.length-1];
  return{version:VERSION,status:'available',experimental:true,age,ageBand:[band.min,band.max],interval,chronologicalAge,deltaYears,confidence:Math.round(confidence*100)/100,confidenceLabel:labelConfidence(confidence),sexReference:sex,spreadYears:spread,inputs:values,reasons,interpretation:deltaYears<=-8?'Performance locomotrice globalement plus jeune que l’âge chronologique.':deltaYears>=8?'Performance locomotrice globalement plus âgée que l’âge chronologique.':'Performance locomotrice globalement proche de l’âge chronologique.',disclaimer:'Estimation expérimentale de performance fonctionnelle, non validée comme biomarqueur d’âge biologique et non destinée à poser un diagnostic.',source:{title:REFERENCE,url:REFERENCE_URL,cohort:'775 adultes, 30–90+ ans',protocol:'marche habituelle 4 m; Chair Stand 30 s; appui unipodal yeux ouverts ≤60 s, moyenne des meilleurs essais D/G',metrics:['vitesse de marche habituelle','Chair Stand 30 s','appui unipodal']}};
}

export const LOCOMOTOR_AGE_VERSION=VERSION;
export const LOCOMOTOR_AGE_REFERENCE={title:REFERENCE,url:REFERENCE_URL};
