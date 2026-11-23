// KŌMØ Motion — du résultat à l'action (21/11/2026).
// Chaque capacité est située par rapport à un repère publié quand il existe, sinon suivie dans le temps.
// Les zones ne sont pas des diagnostics : elles hiérarchisent le programme maison, que le praticien valide.
// Sources des repères : EWGSOP2 (préhension, marche), AWGS 2019 (marche 1,0 m/s), Rikli & Jones / CDC STEADI
// (lever de chaise 30 s), Araujo BJSM 2022 (appui unipodal 10 s), JOA (Two-Step), VALD (asymétrie > 10 %),
// Alcazar 2020–2021 (puissance relative au lever de chaise : équation, seuils 2,6 / 2,1 W/kg, MCID).
import {stsRelativePower,stsRepsForPower,STS_POWER_LOW,STS_POWER_MCID} from './motion-protocol.mjs?v=20261123-envoi-v1';
export const LONGEVITY_PLAN_VERSION='KOMO_LONGEVITY_PLAN_V1';
export const ZONES={
 priority:{label:'Priorité',rank:3},
 consolidate:{label:'À consolider',rank:2},
 solid:{label:'Solide',rank:1},
 follow:{label:'Suivi',rank:0},
 missing:{label:'Non mesuré',rank:-1}
};
const KGF=9.80665;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const fr=(x,d=1)=>finite(x)?(Math.round(x*10**d)/10**d).toFixed(d).replace('.',','):'—';
const done=(r,id)=>r?.[id]?.status==='done'?r[id]:null;
const F=(r,id,key)=>{const x=done(r,id)?.fields?.[key];return finite(x)?x:null};
const D=(r,id,key)=>{const x=done(r,id)?.derived?.[key];return finite(x)?x:null};
const V=(r,id)=>{const x=done(r,id)?.value;return finite(x)?x:null};
const maxOrNull=(a,b)=>a===null&&b===null?null:Math.max(a??0,b??0);
const worst=(...zones)=>zones.filter(Boolean).sort((a,b)=>ZONES[b].rank-ZONES[a].rank)[0]||'missing';

// Lever de chaise 30 s — sous la moyenne (CDC STEADI, Rikli & Jones) et standard d'autonomie (Rikli & Jones 2013).
// Tranches 60–64, 65–69, 70–74, 75–79, 80–84, 85–89, 90–94 ans.
const CHAIR_BELOW={female:[12,11,10,10,9,8,4],male:[14,12,12,11,10,8,7]};
const CHAIR_STANDARD={female:[15,15,14,13,12,11,9],male:[17,16,15,14,13,11,9]};
const CHAIR_BANDS=['60–64','65–69','70–74','75–79','80–84','85–89','90–94'];
const bandIndex=age=>!finite(age)||age<65?0:age<70?1:age<75?2:age<80?3:age<85?4:age<90?5:6;
// Préhension : force basse EWGSOP2 (kg).
const GRIP_LOW={female:16,male:27};

export function profileFrom(patient={},date=new Date()){
 const year=Number(String(patient?.birth_date||patient?.birthYear||'').slice(0,4));
 const age=Number.isInteger(year)&&year>1900?date.getFullYear()-year:null;
 const sex=patient?.sex_at_birth==='male'||patient?.sex==='male'?'male':
  patient?.sex_at_birth==='female'||patient?.sex==='female'?'female':null;
 return {age,sex};
}

function measure(label,value,unit,zone,reference){return {label,value,unit,zone,reference}}

export function assessCapacities(results={},profile={}){
 const sex=profile.sex||null,age=finite(profile.age)?profile.age:null;
 const sexNote=sex?'':' (sexe non précisé : repère le plus prudent)';
 // Marche
 const speed=D(results,'gait_4m','gait_speed_ms');
 const speedZone=speed===null?'missing':speed<0.8?'priority':speed<1.0?'consolidate':'solid';
 const two=done(results,'two_step'),twoIdx=finite(two?.two_step_index)?two.two_step_index:null;
 const twoZone=twoIdx===null?(two?'follow':'missing'):twoIdx<1.1?'priority':twoIdx<1.3?'consolidate':'solid';
 // Force des jambes
 const chair=V(results,'sts');
 const bi=bandIndex(age),chairSex=sex||'female';
 const below=CHAIR_BELOW[chairSex][bi],standard=CHAIR_STANDARD[chairSex][bi];
 const chairZone=chair===null?'missing':chair<below?'priority':chair<standard?'consolidate':'solid';
 const tts=F(results,'fd_sts','fd_sts_time_to_stand_s');
 // Puissance relative estimée : taille + levers (équation d'Alcazar), seuil selon le sexe.
 const height=F(results,'anthropometry','height_cm');
 const power=chair===null||height===null?null:stsRelativePower(height,chair);
 const powerLow=STS_POWER_LOW[sex||'female'],powerMcid=STS_POWER_MCID[sex||'female'];
 const powerZone=power===null?'missing':power<powerLow?'priority':power<powerLow+powerMcid?'consolidate':'solid';
 const powerRepsLow=power!==null&&power<powerLow?stsRepsForPower(height,powerLow):null;
 // Saut vertical (CMJ) : puissance mesurée par les plateformes, suivie dans le temps (pas de repère validé ici).
 const cmjPower=F(results,'fd_cmj','cmj_peak_power_wkg'),cmjHeight=F(results,'fd_cmj','cmj_height_cm');
 // Équilibre
 const bl=V(results,'unipodal_left'),br=V(results,'unipodal_right');
 const weak=bl!==null&&br!==null?Math.min(bl,br):bl??br;
 const balZone=weak===null?'missing':weak<10?'priority':(bl!==null&&br!==null&&bl>=29.95&&br>=29.95)?'solid':'consolidate';
 const qsAsym=F(results,'fd_quiet_stand','fd_qs_asym_pct'),qsVel=F(results,'fd_quiet_stand','fd_qs_velocity_mms');
 // Yeux fermés / yeux ouverts (quotient de Romberg) : part de la vue dans l'équilibre, suivi personnel.
 const qsEcVel=F(results,'fd_quiet_stand_ec','fd_qsec_velocity_mms');
 const romberg=qsVel!==null&&qsEcVel!==null&&qsVel>0?qsEcVel/qsVel:null;
 const slsVel=maxOrNull(F(results,'unipodal_left','sls_left_velocity_mms'),F(results,'unipodal_right','sls_right_velocity_mms'));
 const qsZone=qsAsym===null?(qsVel===null?'missing':'follow'):qsAsym>10?'consolidate':'solid';
 // Répartition du poids, plus parlante pour le patient : ForceDecks calcule l'asymétrie sur la jambe la plus chargée
 // ((fort − faible) / fort), donc la part de la jambe la plus chargée vaut 1 / (2 − asymétrie).
 const qsSide=done(results,'fd_quiet_stand')?.fields?.fd_qs_asym_side;
 const qsShare=qsAsym!==null&&qsAsym>0&&(qsSide==='left'||qsSide==='right')?
  Math.round(100/(2-qsAsym/100))+' % du poids sur la jambe '+(qsSide==='left'?'gauche':'droite'):null;
 // Force (préhension = repère publié ; genou et hanche = suivi)
 const gl=F(results,'dynamo_grip','grip_left_n'),gr=F(results,'dynamo_grip','grip_right_n');
 const gripN=gl!==null&&gr!==null?Math.max(gl,gr):gl??gr,gripKg=gripN===null?null:gripN/KGF;
 const low=GRIP_LOW[sex||'female'];
 const gripZone=gripKg===null?'missing':gripKg<low?'priority':gripKg<low+5?'consolidate':'solid';
 const kl=F(results,'dynamo_knee_ext','knee_ext_left_n'),kr=F(results,'dynamo_knee_ext','knee_ext_right_n');
 const hl=F(results,'dynamo_hip_abd','hip_abd_left_n'),hr=F(results,'dynamo_hip_abd','hip_abd_right_n');
 const fl=F(results,'dynamo_hip_flex','hip_flex_left_n'),fr2=F(results,'dynamo_hip_flex','hip_flex_right_n');
 const kfl=F(results,'dynamo_knee_flex','knee_flex_left_n'),kfr=F(results,'dynamo_knee_flex','knee_flex_right_n');
 // Symétrie et posture
 const lsis=[['Préhension',D(results,'dynamo_grip','lsi_pct')],['Extension de genou',D(results,'dynamo_knee_ext','lsi_pct')],['Flexion de genou',D(results,'dynamo_knee_flex','lsi_pct')],
  ['Flexion de hanche',D(results,'dynamo_hip_flex','lsi_pct')],['Abduction de hanche',D(results,'dynamo_hip_abd','lsi_pct')]].filter(([,v])=>v!==null);
 const asyms=[['Charge debout',qsAsym],['Lever sur plateformes',F(results,'fd_sts','fd_sts_asym_pct')],['Saut vertical',F(results,'fd_cmj','cmj_asym_pct')]].filter(([,v])=>v!==null);
 const posture=done(results,'posture')?.observation||null;
 const symZones=[...lsis.map(([,v])=>v<80?'priority':v<90?'consolidate':'solid'),
  ...asyms.map(([,v])=>v>20?'priority':v>10?'consolidate':'solid'),
  ...(posture?[posture==='apparent_offset'?'consolidate':'solid']:[])];
 const weakestLsi=lsis.slice().sort((a,b)=>a[1]-b[1])[0]||null;
 const largestAsym=asyms.slice().sort((a,b)=>b[1]-a[1])[0]||null;
 const arms=V(results,'arms');

 const capacities=[
  {id:'walk',name:'Marche',zone:worst(speedZone,twoZone),
   why:'Chaque 0,1 m/s de vitesse de marche en plus est associé à 12 % de risque de décès en moins (34 485 personnes suivies). Elle progresse avec la marche rapide et la force des jambes.',
   measures:[measure('Vitesse de marche',speed===null?null:fr(speed,2),'m/s',speedZone,'repère : 0,8 et 1,0 m/s'),
    ...(two?[measure('Two-Step (indice)',twoIdx===null?null:fr(twoIdx,2),'',twoZone,'repère : 1,1 et 1,3')]:[])]},
  {id:'legs',name:'Force des jambes',zone:worst(chairZone,powerZone==='missing'?null:powerZone),
   why:'Se lever, monter un escalier, se relever : c’est la puissance des jambes qui garde autonome. Une puissance basse au lever de chaise est associée à un risque de décès plus que doublé sur 9 ans ; elle progresse en quelques semaines.',
   measures:[measure('Levers de chaise en 30 s',chair,'levers',chairZone,'repère '+CHAIR_BANDS[bi]+' ans'+(age!==null&&age<60?' (le plus proche)':'')+' : '+below+' et '+standard+sexNote),
    measure('Puissance des jambes (estimée)',power===null?null:fr(power,1),'W/kg',powerZone,'repère : '+fr(powerLow,1)+' W/kg'+sexNote+' · calculée avec la taille'),
    measure('Temps pour se lever (plateformes)',tts===null?null:fr(tts,2),'s',tts===null?'missing':'follow','suivi personnel'),
    measure('Saut vertical · puissance',cmjPower===null?null:fr(cmjPower,1),'W/kg',cmjPower===null?'missing':'follow',
     (cmjHeight===null?'':'hauteur '+fr(cmjHeight,1)+' cm · ')+'mesurée par les plateformes · suivi personnel')]},
  {id:'balance',name:'Équilibre',zone:worst(balZone,qsZone==='consolidate'?'consolidate':null)||balZone,
   why:'Ne pas tenir 10 s sur un pied est associé à un risque de décès 1,8 fois plus élevé sur 7 ans (1 702 personnes suivies). L’équilibre s’entraîne : un quart de chutes en moins.',
   measures:[measure('Appui sur un pied (côté faible)',weak===null?null:fr(weak,1),'s',balZone,'repère : 10 s, maximum 30 s'),
    measure('Oscillations debout',qsVel===null?null:fr(qsVel,1),'mm/s',qsVel===null?'missing':'follow','suivi personnel'),
    measure('Yeux fermés / yeux ouverts',romberg===null?null:fr(romberg,1),'×',romberg===null?'missing':'follow','part de la vue · suivi personnel'),
    measure('Oscillations sur un pied (côté le plus instable)',slsVel===null?null:fr(slsVel,1),'mm/s',slsVel===null?'missing':'follow','essai tenu 30 s · suivi personnel'),
    measure('Asymétrie de charge debout',qsAsym===null?null:fr(qsAsym,1),'%',qsZone,'repère : 10 %'+(qsShare?' · '+qsShare:''))]},
  {id:'strength',name:'Force musculaire',zone:gripZone,
   why:'Chaque 5 kg de force de main en moins est associé à 16 % de mortalité en plus (139 691 personnes suivies). La force se regagne à tout âge.',
   measures:[measure('Préhension (meilleur côté)',gripKg===null?null:fr(gripKg,1),'kg',gripZone,'repère : '+low+' kg'+sexNote),
    measure('Extension de genou (meilleur côté)',kl===null&&kr===null?null:fr(Math.max(kl??0,kr??0),0),'N','follow','suivi personnel'),
    measure('Flexion de genou (meilleur côté)',kfl===null&&kfr===null?null:fr(Math.max(kfl??0,kfr??0),0),'N','follow','suivi personnel'),
    measure('Flexion de hanche (meilleur côté)',fl===null&&fr2===null?null:fr(Math.max(fl??0,fr2??0),0),'N','follow','suivi personnel'),
    measure('Abduction de hanche assise (meilleur côté)',hl===null&&hr===null?null:fr(Math.max(hl??0,hr??0),0),'N','follow','suivi personnel')]},
  {id:'symmetry',name:'Symétrie',zone:symZones.length?worst(...symZones):'missing',
   why:'Un côté plus faible concentre les contraintes et expose aux chutes de côté. L’écart se réduit en travaillant le côté faible en premier.',
   measures:[measure('Côté faible / côté fort',weakestLsi?fr(weakestLsi[1],0):null,'%',weakestLsi?(weakestLsi[1]<80?'priority':weakestLsi[1]<90?'consolidate':'solid'):'missing',
     weakestLsi?weakestLsi[0]+' · repère : 90 %':'repère : 90 %'),
    measure('Plus grande asymétrie d’appui',largestAsym?fr(largestAsym[1],1):null,'%',largestAsym?(largestAsym[1]>20?'priority':largestAsym[1]>10?'consolidate':'solid'):'missing',
     largestAsym?largestAsym[0]+' · repère : 10 %':'repère : 10 %'),
    // Anciens tests caméra (avant v2.4) : affichés seulement s'ils ont été mesurés.
    ...(posture?[measure('Posture de profil',posture==='apparent_offset'?'décalage apparent':posture==='neutral'?'alignement neutre':'non interprétable','',
     posture==='apparent_offset'?'consolidate':'solid','observation')]:[]),
    ...(arms!==null?[measure('Élévation des bras 30 s',arms,'mouvements','follow','suivi personnel')]:[])]}
 ];
 const context={speed,twoIdx,two:two?.value??null,chair,below,standard,power,powerLow,powerRepsLow,weak,bl,br,gripKg,low,weakestLsi,largestAsym,posture,qsAsym};
 return {capacities,context};
}

// Bibliothèque d'exercices maison (chaise, mur, plan de travail, deux sacs). Dose selon la zone.
const EX={
 chair:z=>({key:'chair',capacity:'legs',title:'Lever de chaise lent',purpose:'Force des jambes',
  dose:z==='priority'?'2 × 8':z==='consolidate'?'3 × 10':'3 × 12',frequency:'3 fois par semaine',
  instructions:'Chaise calée contre le mur. Se lever sans élan, se rasseoir en 3 secondes'+(z==='priority'?', mains sur les cuisses si besoin.':', bras croisés.'),
  progression:'+2 répétitions par semaine, puis un sac à dos chargé.',caution:'Arrêter en cas de douleur de genou ou de vertige.'}),
 calf:z=>({key:'calf',capacity:'legs',title:'Montées sur la pointe des pieds',purpose:'Poussée de la marche',
  dose:z==='priority'?'2 × 10':'3 × 15',frequency:'3 fois par semaine',
  instructions:'Face au plan de travail, mains posées, monter sur la pointe des pieds et redescendre lentement.',
  progression:'Une seule main, puis un pied à la fois.',caution:'Garder l’appui des mains au début.'}),
 brisk:z=>({key:'brisk',capacity:'walk',title:'Marche rapide fractionnée',purpose:'Vitesse de marche',
  dose:z==='priority'?'4 × (1 min vite + 2 min normal)':'5 × (3 min vite + 2 min normal)',frequency:'3 fois par semaine',
  instructions:'Dehors ou dans un couloir sûr : accélérer jusqu’à être légèrement essoufflé, sans courir, puis récupérer.',
  progression:'Allonger les phases rapides d’une minute toutes les deux semaines.',caution:'Chaussures fermées, terrain plat ; arrêter si douleur thoracique ou malaise.'}),
 lunge:z=>({key:'lunge',capacity:'walk',title:'Grands pas avec appui',purpose:'Longueur de pas (Two-Step)',
  dose:z==='priority'?'2 × 6 par jambe':'3 × 8 par jambe',frequency:'3 fois par semaine',
  instructions:'Une main sur le plan de travail, faire un grand pas en avant, plier légèrement les genoux, revenir.',
  progression:'Pas plus long, puis sans appui.',caution:'Pas de fente profonde en cas de douleur de genou.'}),
 stand:z=>({key:'stand',capacity:'balance',title:'Équilibre sur un pied',purpose:'Équilibre',
  dose:z==='priority'?'3 × 10 s par côté':'3 × 30 s par côté',frequency:'tous les jours',
  instructions:'Devant le plan de travail, mains au-dessus du plan prêtes à se poser. Lever un pied et tenir.',
  progression:'Lâcher l’appui, puis tourner la tête lentement, puis sur un coussin.',caution:'Toujours près d’un appui ; ne jamais fermer les yeux seul.'}),
 tandem:z=>({key:'tandem',capacity:'balance',title:'Marche talon-pointe',purpose:'Équilibre en mouvement',
  dose:'2 × 10 pas',frequency:'tous les jours',
  instructions:'Le long d’un mur ou du plan de travail, poser le talon juste devant les orteils de l’autre pied.',
  progression:'Sans toucher le mur, puis à reculons.',caution:'Le long d’un appui, sol dégagé.'}),
 grip:z=>({key:'grip',capacity:'strength',title:'Serrer et porter',purpose:'Force de la main',
  dose:z==='priority'?'3 × 10 serrages de 5 s':'3 × 10 serrages + 3 × 30 m portés',frequency:'3 fois par semaine',
  instructions:'Serrer fort une balle souple ou une serviette roulée, puis marcher en portant deux sacs chargés.',
  progression:'Sacs plus lourds (bouteilles d’eau), trajets plus longs.',caution:'Pas de port lourd en cas de douleur de dos ou d’épaule.'}),
 knee:z=>({key:'knee',capacity:'strength',title:'Extension de genou assis',purpose:'Force du quadriceps',
  dose:'3 × 10 par jambe',frequency:'3 fois par semaine',
  instructions:'Assis au fond d’une chaise, tendre la jambe, tenir 2 s, redescendre lentement.',
  progression:'Bracelet lesté ou élastique à la cheville.',caution:'Amplitude sans douleur.'}),
 hip:z=>({key:'hip',capacity:'symmetry',title:'Écart de jambe sur le côté',purpose:'Hanches et équilibre latéral',
  dose:'3 × 12 par côté, côté faible en premier',frequency:'3 fois par semaine',
  instructions:'Debout face au plan de travail, écarter une jambe tendue sur le côté sans pencher le buste, revenir lentement.',
  progression:'Élastique autour des chevilles.',caution:'Garder le bassin droit, appui des mains.'}),
 posture:z=>({key:'posture',capacity:'symmetry',title:'Redressement contre le mur',purpose:'Posture',
  dose:'2 × 10',frequency:'tous les jours',
  instructions:'Dos au mur, rentrer le menton, coller la tête et les épaules au mur, glisser les bras vers le haut.',
  progression:'Tenir 5 s en haut.',caution:'Sans forcer la nuque.'}),
 walk:()=>({key:'walk',capacity:'walk',title:'Marche quotidienne',purpose:'Activité de fond',
  dose:'20 à 30 min',frequency:'tous les jours',
  instructions:'À une allure qui permet de parler, idéalement en une ou deux fois.',
  progression:'+5 min par semaine jusqu’à 30–45 min.',caution:'Adapter à la fatigue et aux symptômes.'})
};
const BY_CAPACITY={walk:['brisk','lunge'],legs:['chair','calf'],balance:['stand','tandem'],strength:['grip','knee'],symmetry:['hip','posture']};
const RELEVANCE=['walk','legs','balance','strength','symmetry'];

// Objectifs calés sur la reproductibilité (22/11/2026) : un objectif plus petit que la marge d'erreur
// de la mesure ne pourrait pas être distingué du hasard au contrôle. Marche 0,1 m/s, chaise 2 levers,
// Two-Step et équilibre en franchissement de repère, préhension 5 kg (visée à 12 semaines).
function objective(c,ctx){
 if(c.id==='walk'){
  if(ctx.speed!==null&&ctx.speed<1.0)return 'Vitesse de marche ≥ '+fr(ctx.speed+0.1,2)+' m/s';
  if(ctx.twoIdx!==null&&ctx.twoIdx<1.3)return 'Two-Step : indice ≥ '+(ctx.twoIdx<1.1?'1,1':'1,3');
  return ctx.speed!==null?'Vitesse de marche maintenue ≥ '+fr(ctx.speed,2)+' m/s':'Mesurer la vitesse de marche';
 }
 if(c.id==='legs'){
  if(ctx.chair===null)return 'Mesurer le lever de chaise';
  // Sous le seuil de puissance : on vise d'abord +2 levers (6 semaines), puis le nombre qui le franchit.
  const next=ctx.chair+2;
  return 'Au moins '+next+' levers en 30 s'+(ctx.powerRepsLow!==null&&ctx.powerRepsLow>next?
   ', puis '+ctx.powerRepsLow+' (seuil de puissance, visé à 12 semaines)':'');
 }
 if(c.id==='balance'){
  if(ctx.weak===null)return 'Mesurer l’appui sur un pied';
  return ctx.weak<10?'10 s sur chaque pied':ctx.weak<30?'30 s sur chaque pied':'Garder 30 s de chaque côté';
 }
 if(c.id==='strength'){
  if(ctx.gripKg===null)return 'Mesurer la préhension';
  return ctx.gripKg<ctx.low?'Préhension ≥ '+ctx.low+' kg':'Préhension : +5 kg, visé à 12 semaines';
 }
 if(c.id==='symmetry'){
  if(ctx.weakestLsi&&ctx.weakestLsi[1]<90)return ctx.weakestLsi[0]+' : côté faible ≥ 90 % du côté fort';
  if(ctx.largestAsym&&ctx.largestAsym[1]>10)return ctx.largestAsym[0]+' : asymétrie ≤ 10 %';
  return ctx.posture==='apparent_offset'?'Posture de profil : redressement visible':'Garder l’équilibre gauche-droite';
 }
 return '';
}

export function buildLongevityPlan(results={},profile={}){
 const {capacities,context}=assessCapacities(results,profile);
 const ranked=capacities.filter(c=>ZONES[c.zone].rank>=2)
  .sort((a,b)=>ZONES[b.zone].rank-ZONES[a.zone].rank||RELEVANCE.indexOf(a.id)-RELEVANCE.indexOf(b.id));
 const priorities=ranked.slice(0,3).map(c=>({id:c.id,name:c.name,zone:c.zone,why:c.why,objective:objective(c,context),
  basis:c.measures.filter(m=>m.value!==null&&['priority','consolidate'].includes(m.zone)).map(m=>m.label+' : '+m.value+(m.unit?' '+m.unit:'')+' ('+m.reference+')').join(' · ')}));
 // Programme : 4 exercices ciblés (2 pour la 1re priorité, 1 par priorité suivante), complété par l'entretien.
 const picks=[];
 const add=(key,zone)=>{if(key&&!picks.some(p=>p.key===key)&&picks.length<4)picks.push(EX[key](zone))};
 // Le lever de chaise est le socle : il reste dans le programme quel que soit le profil.
 const order=id=>{const [a,b]=BY_CAPACITY[id];
  if(id!=='symmetry')return [a,b];
  const offsetOnly=context.posture==='apparent_offset'&&!(context.weakestLsi&&context.weakestLsi[1]<90)&&!(context.largestAsym&&context.largestAsym[1]>10);
  return offsetOnly?[b,a]:[a,b]};
 const legsZone=capacities.find(c=>c.id==='legs')?.zone;
 priorities.forEach((p,i)=>{const [a,b]=order(p.id);add(a,p.zone);if(i===0&&priorities.length<3)add(b,p.zone);});
 add('chair',ZONES[legsZone]?.rank>=2?legsZone:'solid');
 for(const id of ['legs','balance','strength','symmetry','walk']){
  const zone=capacities.find(c=>c.id===id)?.zone||'solid';
  add(order(id)[0],ZONES[zone]?.rank>=2?zone:'solid');
 }
 const exercises=[...picks,EX.walk()].map(e=>({...e,
  relevance:e.key==='walk'?'Tous les jours : activité de fond':
   (priorities.find(p=>p.id===e.capacity)?'Priorité : ':e.key==='chair'?'Socle : ':'Entretien : ')+
   (capacities.find(c=>c.id===e.capacity)?.name||'activité').toLowerCase()}));
 const measured=capacities.filter(c=>c.zone!=='missing').length;
 const headline=priorities.length?'Vos priorités : '+priorities.map(p=>p.name.toLowerCase()).join(', ')+'.':
  measured?'Vos capacités sont solides : programme d’entretien pour les garder.':
  'Mesures incomplètes : programme d’entretien général, à préciser au prochain bilan.';
 return {version:LONGEVITY_PLAN_VERSION,profile:{age:profile.age??null,sex:profile.sex??null},
  capacities,priorities,exercises,headline,measured,
  schedule:'3 séances de 20 minutes par semaine (par exemple lundi, mercredi, vendredi), équilibre et marche tous les jours.',
  recheck:'Contrôle à 6 semaines : mêmes tests, mêmes conditions.',
  objectives:priorities.length?priorities.map(p=>({name:p.name,target:p.objective})):
   capacities.filter(c=>c.zone!=='missing').slice(0,3).map(c=>({name:c.name,target:objective(c,context)})),
  safeguards:'Programme proposé et validé par votre praticien. Arrêter en cas de douleur, malaise, essoufflement anormal ou chute, et en parler avant de reprendre.'};
}
