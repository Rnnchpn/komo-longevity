// Published external reference values, not diagnoses.
// STS: Rikli & Jones (1999) age/sex 25th–75th percentiles:
// https://www.sralab.org/rehabilitation-measures/30-second-sit-stand-test
// One leg: Springer et al (2007) best of 3 up to 45 s:
// https://www.sralab.org/rehabilitation-measures/single-leg-stance-or-one-legged-stance-test
export const NORM_VERSION='KOMO_AGE_REFERENCE_V1';
export const SOURCES={
 sts:{label:'Rikli & Jones, 1999 — 30 s Chair Stand (P25–P75)',url:'https://www.sralab.org/rehabilitation-measures/30-second-sit-stand-test'},
 unipodal:{label:'Springer et al., 2007 — unipodal yeux ouverts, meilleur de 3 essais (45 s)',url:'https://www.sralab.org/rehabilitation-measures/single-leg-stance-or-one-legged-stance-test'}
};
const STS=[
 [60,64,14,19,12,17],[65,69,12,18,11,16],[70,74,12,17,10,15],
 [75,79,11,17,10,15],[80,84,10,15,9,14],[85,89,8,14,8,13],[90,94,7,12,4,11]
];
const ONELEG=[
 [18,39,44.7],[40,49,41.9],[50,59,41.2],[60,69,32.1],[70,79,21.5],[80,99,9.4]
];
export const ageRanges={
 under40:[0,39],'40-49':[40,49],'50-59':[50,59],
 '60-69':[60,69],'70-79':[70,79],80plus:[80,120],
 undisclosed:null
};
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const n=x=>x===null||x===''||x===undefined?null:Number.isInteger(Number(x))?Number(x):null;
function matchingAge(band,age){
 const range=ageRanges[band]??null;
 return range&&Number.isInteger(age)&&age>=Math.max(18,range[0])&&age<=Math.min(120,range[1]);
}
export function stsReference({ageBand,exactAge=null,cohort='',protocolConfirmed=false,record=null}={}){
 const group=cohort==='men'||cohort==='women'?cohort:null;
 const age=n(exactAge);
 const validAge=matchingAge(ageBand,age);
 const row=validAge?STS.find(r=>age>=r[0]&&age<=r[1]):null;
 const validResult=record?.status==='done'&&Number.isInteger(record.value)&&record.value>=0;
 if(!group||!row)return {status:'unavailable',comparison:null,reference:null,source:SOURCES.sts,
  reason:!group?'Choisir le groupe de référence hommes ou femmes (facultatif).':
  !validAge?'Préciser l’âge exact dans la tranche déclarée pour une comparaison appropriée.':
  'Références STS disponibles de 60 à 94 ans uniquement.'};
 const lo=group==='men'?row[2]:row[4],hi=group==='men'?row[3]:row[5];
 const reference={age:row[0]+'–'+row[1],lower:lo,upper:hi,unit:'levers/30 s',cohort:group};
 if(!validResult||!protocolConfirmed)return {status:'reference_only',comparison:null,reference,source:SOURCES.sts,
  reason:!validResult?'Mesure webcam non finalisée ou à vérifier.':
  'Comparer uniquement si chaise ≈43 cm, bras croisés et aucune poussée des mains (protocole Rikli/Jones).'};
 const count=record.value;
 const label=count<lo?'En dessous de la plage centrale de référence':
  count>hi?'Au-dessus de la plage centrale de référence':'Dans la plage centrale de référence';
 return {status:count<lo?'below':count>hi?'above':'within',comparison:label,reference,source:SOURCES.sts,
  reason:'Comparaison indicative P25–P75, webcam non étalonnée ; pas une évaluation clinique du risque de chute.'};
}
export function oneLegReference(ageBand,record){
 const range=ageRanges[ageBand]??null;
 // Under-40 questionnaire band includes ages <18, so do not assume the 18–39 cohort.
 const row=range?ONELEG.find(r=>range[0]>=r[0]&&range[1]<=r[1]):null;
 const valid=record?.status==='done'&&finite(record.value)&&record.value>=0;
 return {status:row?'descriptive':'unavailable',comparison:null,
  observed:valid?record.value:null,
  expected:row?row[2]:null,age:row?row[0]+'–'+row[1]:null,source:SOURCES.unipodal,
  reason:row?'Référence du meilleur de 3 essais jusqu’à 45 s. Pulse mesure un seul essai plafonné à 20 s : aucune classification « normal/anormal » n’est possible.':
    'Groupe d’âge non comparable au protocole publié ou âge non renseigné.'};
}
export function normativeSummary(answers={},results={},options={}){
 const sts=stsReference({ageBand:answers.ageBand,exactAge:options.exactAge??null,
  cohort:options.cohort??'',protocolConfirmed:options.protocolConfirmed===true,
  record:results.sts});
 const unipodal=['unipodal_left','unipodal_right'].map(id=>({id,...oneLegReference(answers.ageBand,results[id])}));
 const uncalibrated=[
 {id:'heels',label:'Élévation des talons',reason:'Compteur webcam exploratoire : aucun seuil d’âge transférable à ce protocole.'},
 {id:'arms',label:'Élévation des bras',reason:'Compteur webcam exploratoire : aucune amplitude ou norme clinique équivalente mesurée.'},
 {id:'posture',label:'Photo de profil',reason:'Repères de surface 2D, pas SVA C7–S1 : aucun seuil radiographique applicable.'}
 ];
 return {version:NORM_VERSION,sts,unipodal,uncalibrated};
}
