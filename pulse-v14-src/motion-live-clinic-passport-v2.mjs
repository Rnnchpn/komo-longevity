// Clinical-style *descriptive* passport for supervised KŌMØ Motion demos.
// No medical diagnosis, validated score, biological age or survival estimate.
import {INTAKE_GROUPS,intakeProgress,scoreIntake,validAnswer} from './online/session/intake-model.mjs';
import {buildClinicActionPlan} from './motion-live-clinic-action-plan-v1.mjs';
export const CLINIC_PASSPORT_VERSION='KOMO_MOTION_CLINIC_PASSPORT_V2';
const T=[
 {id:'sts',name:'Lever de chaise',short:'Force fonctionnelle',unit:'levers / 30 s',
  method:'30 secondes, chaise stable, bras croisés si possible. Compter les levers complets.',
  caveat:'Valeur de suivi ; comparaison normative uniquement avec âge exact, groupe de référence et protocole confirmé.'},
 {id:'two_step',name:'Two-Step Test',short:'Deux grands pas',unit:'cm',
  method:'Deux essais manuels des deux plus grands pas sans saut, pieds joints à l’arrêt. Retenir la meilleure distance mesurée au sol.',
  caveat:'Indice = meilleure distance / taille (cm), uniquement si la taille est renseignée. Les seuils cliniques exigent un protocole standardisé et une interprétation contextualisée.'},
 {id:'unipodal_left',name:'Équilibre · jambe gauche',short:'Stabilité gauche',unit:'s / 30 s',
  method:'Appui unipodal yeux ouverts, début au lever du pied droit, maximum 30 secondes.',
  caveat:'Mesure plafonnée à 30 s, avec détection vidéo 2D et contrôle visuel de l’opérateur.'},
 {id:'unipodal_right',name:'Équilibre · jambe droite',short:'Stabilité droite',unit:'s / 30 s',
  method:'Appui unipodal yeux ouverts, début au lever du pied gauche, maximum 30 secondes.',
  caveat:'Une perte de repères ou prise d’appui non détectée impose une vérification manuelle.'},
 {id:'arms',name:'Mobilité des bras',short:'Contrôle proximal',unit:'mouvements',
  method:'Élévations bilatérales suivies par caméra, sans goniométrie ni force instrumentée.',
  caveat:'Le nombre de répétitions ne quantifie pas une amplitude articulaire ni une puissance musculaire.'},
 {id:'posture',name:'Posture sagittale',short:'Alignement de surface',unit:'',
  method:'Observation visuelle de profil, à partir d’une image 2D non calibrée.',
  caveat:'Aucune mesure de SVA C7–S1 radiographique, d’angle pelvien ou de déformation rachidienne.'}
];
const LEGACY_HEELS={id:'heels',name:'Élévation sur les pointes (ancien protocole)',short:'Endurance distale',unit:'répétitions',
 method:'Ancien test de mollets, non assimilable au Two-Step Test.',
 caveat:'Mesure historique conservée pour traçabilité ; ne pas la comparer au Two-Step Test.'};
const names={neutral:'Alignement apparent neutre',apparent_offset:'Décalage apparent',not_interpretable:'Non interprétable'};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const round1=x=>Math.round(x*10)/10;
const n=x=>finite(x)?x.toFixed(Number.isInteger(x)?0:1).replace('.',','):'—';
const safe=s=>typeof s==='string'?s.slice(0,320):'';
const safeNumber=x=>finite(x)&&x>=0?x:null;
function objective(row={},test){
 const status=row?.status||'missing';
 const value=status==='done'||status==='review'?safeNumber(row.value):null;
 const observation=test.id==='posture'&&['done','review'].includes(status)?
  (names[row.observation]||'Observation à vérifier'):null;
 const timedCount=(test.id==='heels'||test.id==='arms')&&finite(value);
 const durationSeconds=timedCount?(row?.duration_seconds===30?30:20):
  test.id==='sts'?30:test.id.startsWith('unipodal')?30:null;
 const display=test.id==='posture'?(observation||'Non documenté'):
  value===null?(status==='skipped'?'Non réalisé':'Non documenté'):
   n(value)+' '+test.unit+(timedCount?' / '+durationSeconds+' s':'');
 const source=row?.source==='operator_confirmed_video_estimate'?'Estimation vidéo confirmée par l’opérateur':
   row?.source==='operator_manual_observation'?'Saisie manuelle par l’opérateur':
   row?.source==='operator_visual_observation'?'Observation de l’opérateur':
   'Origine non précisée';
 const quality=Number.isInteger(row?.camera_quality)&&row.camera_quality>=0&&row.camera_quality<=100?
  row.camera_quality:null;
 const incident=['camera_lost','ambiguous_contact'].includes(row?.stop_reason);
 const review=status==='review'||(quality!==null&&quality<65)||incident||observation==='Non interprétable';
 const note=safe(row?.note);
 const twoStepIndex=test.id==='two_step'&&finite(row?.two_step_index)?row.two_step_index:null;
 const attemptsCm=test.id==='two_step'&&Array.isArray(row?.attempts_cm)?row.attempts_cm.slice(0,2):null;
 return {...test,status,value,observation,display,durationSeconds,source,quality,review,twoStepIndex,attemptsCm,
  stopReason:typeof row?.stop_reason==='string'?row.stop_reason:null,
  note,measured:status==='done'||status==='review',
  ceiling:finite(value)&&test.id.startsWith('unipodal')&&value>=29.95};
}
export function buildClinicPassport(answers={},results={},options={}){
 const date=options.date instanceof Date&&!Number.isNaN(options.date.getTime())?
  options.date.toISOString().slice(0,10):new Date().toISOString().slice(0,10);
 const subject=safe(options.subject||'Dossier de démonstration').slice(0,100);
 const simulated=options.simulated===true;
 const profile={ageBand:answers.ageBand||null,goal:answers.goal||null};
 const rating=key=>Object.hasOwn(answers,key)&&/^[0-4]$/.test(String(answers[key]))?Number(answers[key]):null;
 const measures=T.map(t=>t.id==='two_step'&&!results.two_step&&results.heels?
  objective(results.heels,LEGACY_HEELS):objective(results[t.id],t));
 const measured=measures.filter(x=>x.measured).length,skipped=measures.filter(x=>x.status==='skipped').length;
 const flagged=measures.filter(x=>x.review);
 const bL=measures[2],bR=measures[3];
 const both=finite(bL.value)&&finite(bR.value);
 const balance=both?{
  left:bL.value,right:bR.value,min:Math.min(bL.value,bR.value),
  delta:round1(Math.abs(bL.value-bR.value)),ceilingLeft:bL.ceiling,ceilingRight:bR.ceiling,
  tenSecondBoth:bL.value>=10&&bR.value>=10,
  // If either value is at the 30 s ceiling, difference is censored.
  interpretation:bL.ceiling||bR.ceiling?
   'Au moins un côté atteint le plafond de 30 s : l’écart est descriptif et ne permet pas de quantifier une véritable asymétrie.':
   'Écart inter-latéral descriptif, sans seuil pathologique validé pour cette méthode vidéo.'
 }:null;
 const progress=intakeProgress(answers),questionnaire=scoreIntake(answers);
 const groups=INTAKE_GROUPS.map(g=>({
  id:g.id,label:g.title,
  score:questionnaire.domains[g.id]??null,
  items:g.questions.map(q=>({
   question:q.label,
   answer:Object.hasOwn(answers,q.id)&&validAnswer(q,answers[q.id])?
    (Array.isArray(q.options[0])?q.options.find(([key])=>key===answers[q.id])?.[1]:
     q.options[Number(answers[q.id])]):'Non renseigné'
  }))
 }));
 const messages=[];
 if(measured===6)messages.push('Les six épreuves ont été enregistrées ; ce bilan constitue un point de départ fonctionnel pour les contrôles ultérieurs.');
 else messages.push(measured+' des six épreuves disposent d’un résultat ; les tests non réalisés restent signalés.');
 const twoStep=measures.find(m=>m.id==='two_step');
 if(twoStep?.measured){
  messages.push('Two-Step Test : meilleure distance manuelle '+n(twoStep.value)+' cm'+
   (twoStep.twoStepIndex!==null?' ; indice distance/taille = '+n(twoStep.twoStepIndex)+'.':
    ' ; indice non calculé faute de taille renseignée.')+
   ' Résultat descriptif, à contextualiser selon protocole et population de référence.');
 }
 if(balance){
  messages.push(balance.tenSecondBoth?
   'Le repère descriptif des 10 secondes est atteint sur les deux appuis, dans les conditions de cette séance.':
   'Le repère descriptif des 10 secondes n’est pas atteint sur au moins un côté, à confirmer avec un protocole standardisé.');
  messages.push(balance.interpretation);
 }else messages.push('Le profil d’équilibre bilatéral ne peut pas encore être interprété : une durée est manquante.');
 if(!questionnaire.complete)messages.push(
  'Le questionnaire est incomplet ('+progress.completed+'/22) ; aucune conclusion sur le ressenti, les habitudes ou un indice locomoteur déclaré n’est calculée.'
 );
 else messages.push('Les réponses déclaratives complètent les tests physiques ; leurs indices KŌMØ sont exploratoires et non diagnostiques.');
 if(simulated)messages.unshift('Simulation pédagogique : les 22 réponses déclaratives ont été inventées et ne proviennent pas d’un patient interrogé.');
 if(questionnaire.complete){
  if(rating('chair')===0&&finite(measures[0].value))
   messages.push('Le transfert assis-debout est objectivé par '+n(measures[0].value)+' levers, tandis que la difficulté de lever de chaise déclarée est nulle : concordance descriptive, sans comparaison normative.');
  if(rating('bend')>=2&&rating('pain')>=1)
   messages.push('L’autonomie globale déclarée est plutôt préservée, mais la flexion du tronc est décrite comme difficile et une gêne intervient parfois : cette discordance mérite une observation fonctionnelle ciblée.');
  if(rating('strengthDays')>=3)
   messages.push('L’habitude de renforcement apparaît faible malgré une capacité de mouvement documentée : les objectifs doivent porter sur la régularité et non sur un âge locomoteur inféré.');
  if([rating('sleep'),rating('stress'),rating('recovered')].some(v=>v!==null&&v>=2))
   messages.push('Sommeil, stress et récupération sont décrits comme perturbateurs intermittents ; ces facteurs rapportés sont à suivre séparément des résultats instrumentaux.');
 }
 const priorities=[];
 if(!questionnaire.complete)priorities.push({
  title:'Compléter la dimension vécue',
  detail:'Renseigner les '+(progress.total-progress.completed)+' réponses manquantes pour documenter difficultés, douleur, confiance, récupération et activité.',
  basis:'Questionnaires '+progress.completed+'/'+progress.total
 });
 if(flagged.length)priorities.push({
  title:'Contrôler la fiabilité des captures',
  detail:'Revoir la vidéo ou le compte rendu opérateur des épreuves '+flagged.map(x=>x.name.toLowerCase()).join(', ')+'. Une qualité insuffisante ne doit pas être présentée comme une performance certaine.',
  basis:flagged.length+' mesure(s) à vérifier'
 });
 if(questionnaire.complete){
  if(rating('strengthDays')!==null&&rating('strengthDays')>=2){
   priorities.push({title:'Instaurer un renforcement régulier',
    detail:'Discuter d’un renforcement progressif adapté, idéalement sur au moins deux jours distincts par semaine selon les recommandations d’activité physique. Suivre la fréquence réelle et la tolérance.',
    basis:'Objectif : '+(profile.goal==='strength'?'entretenir la force':'mobilité')+' · renforcement déclaré : '+(rating('strengthDays')===3?'moins d’un jour':'rare')+' par semaine'});
  }
  if(rating('bend')!==null&&rating('bend')>=2&&rating('pain')!==null&&rating('pain')>=1){
   priorities.push({title:'Explorer la flexion et les gênes associées',
    detail:'Observer la flexion, le ramassage d’objet et les compensations, et discuter du contexte de la gêne. Aucun diagnostic rachidien ne découle de cette réponse ni de la photo de profil.',
    basis:'Flexion déclarée difficile · gêne intermittente'});
  }
  if([rating('sleep'),rating('stress'),rating('recovered')].some(v=>v!==null&&v>=2)){
   priorities.push({title:'Documenter la récupération',
    detail:'Suivre sommeil, stress perçu et récupération après effort avec des observations simples. Adapter la progression de l’activité aux possibilités sans attribuer ces plaintes aux mesures vidéo.',
    basis:'Sommeil / stress / récupération : parfois limitants'});
  }
  if(rating('breaks')!==null&&rating('breaks')>=2){
   priorities.push({title:'Rendre les interruptions de sédentarité régulières',
    detail:'Introduire des pauses actives réalisables dans la journée, puis vérifier leur fréquence lors du prochain bilan.',
    basis:'Pauses actives déclarées : seulement 1–2 jours par semaine'});
  }
 }
 if(balance&&!balance.tenSecondBoth)priorities.push({
  title:'Recontrôler la stabilité',
  detail:'Reprendre l’appui unipodal avec sécurité et appui disponible. Si la difficulté se confirme, envisager un examen fonctionnel standardisé par un professionnel.',
  basis:'Appui gauche '+n(balance.left)+' s / droit '+n(balance.right)+' s'
 });
 else if(balance&&(balance.ceilingLeft||balance.ceilingRight))priorities.push({
  title:'Suivre l’équilibre sans effet plafond',
  detail:'Les mesures proches de 30 secondes sont plafonnées : ne pas interpréter une différence minime comme une anomalie. Ajouter si nécessaire un outil validé complémentaire.',
  basis:'Plafond du protocole atteint'
 });
 if(questionnaire.complete){
  const domains=Object.entries(questionnaire.domains).filter(([,v])=>finite(v)).sort((a,b)=>a[1]-b[1]);
  if(domains.length){
   const weakest=groups.find(g=>g.id===domains[0][0]);
   priorities.push({
    title:'Discuter du domaine déclaré le moins favorable',
    detail:'Explorer avec le participant le domaine « '+weakest.label+' » et choisir des objectifs réalistes selon ses difficultés déclarées. Score purement interne, non validé.',
    basis:weakest.label+' · '+n(domains[0][1])+'/100 (autoévaluation)'
   });
  }
 }
 priorities.push({
  title:'Standardiser le prochain contrôle',
  detail:'Répéter les mêmes épreuves et conditions à 4–6 semaines. Si l’objectif est un bilan locomoteur complet, ajouter vitesse de marche, force de préhension et une évaluation standardisée de l’équilibre.',
  basis:'Comparaison longitudinale à protocole constant'
 });
 const recheck=priorities.find(x=>x.title==='Standardiser le prochain contrôle');
 const selected=[...priorities.filter(x=>x!==recheck).slice(0,3),...(recheck?[recheck]:[])];
 const evidence=[
  {name:'Japanese Orthopaedic Association — Two-Step Test',url:'https://locomo-joa.jp/en',
   meaning:'Deux essais de deux pas maximaux sans déséquilibre, meilleure distance en cm divisée par la taille en cm.'},
  {name:'30-second Chair Stand — CDC STEADI',url:'https://www.cdc.gov/steadi/media/pdfs/STEADI-Assessment-30Sec-508.pdf',
   meaning:'Référence de protocole ; aucune comparaison d’âge sans âge exact, groupe de référence et hauteur de chaise conformes.'},
  {name:'Rikli & Jones — 30 s STS, normes synthétisées par SRAlab',
   url:'https://www.sralab.org/rehabilitation-measures/30-second-sit-stand-test',
   meaning:'Les valeurs de référence dépendent notamment de l’âge, du sexe et des conditions de test.'},
  {name:'Araújo et al. BJSM 2022 — Appui unipodal 10 s',
   url:'https://bjsm.bmj.com/content/56/17/975',
   meaning:'Association observée en cohorte, non transposable en pronostic individuel.'},
  {name:'OMS — Activité physique et renforcement',
   url:'https://www.who.int/initiatives/behealthy/physical-activity/',
   meaning:'Le renforcement musculaire deux fois ou plus par semaine est une recommandation générale ; adapter la progression au contexte.'},
  {name:'Springer et al. — Single leg stance, SRAlab',
   url:'https://www.sralab.org/rehabilitation-measures/single-leg-stance-or-one-legged-stance-test',
   meaning:'Meilleur de trois essais jusqu’à 45 s, non comparable directement à un essai vidéo plafonné à 30 s.'}
 ];
 const actionPlan=buildClinicActionPlan(answers,measures,balance,{
   complete:questionnaire.complete,groups
 },{simulated});
 const report={
  version:CLINIC_PASSPORT_VERSION,
  date,subject,mode:'CABINET_DEMO',profile,simulated,
  measures,measured,skipped,flagged:flagged.length,
  questionnaire:{answered:progress.completed,total:progress.total,complete:questionnaire.complete,
   simulated,index:questionnaire.complete?questionnaire.profileIndex:null,groups},
  balance,findings:messages,priorities:selected,evidence,actionPlan,
  outcomes:{motionScore:null,motionAge:null,lifeExpectancy:null},
  recheck:'4 à 6 semaines',
  limitations:[
   ...(simulated?['Les réponses au questionnaire ont été générées artificiellement pour une démonstration : elles ne constituent aucune déclaration patient.']:[]),
   'Évaluation fonctionnelle exploratoire réalisée dans un environnement de démonstration sur dossier fictif.',
   'Les valeurs vidéo et les questionnaires propriétaires KŌMØ n’ont pas été validés comme outils diagnostiques.',
   'Aucun Motion Score ou Motion Age : vitesse de marche, TUG, SPPB, normes et conditions instrumentales nécessaires manquantes.',
   'Les durées d’équilibre sont plafonnées à 30 s. Une valeur de 30 s n’est pas une mesure au-delà de ce plafond.',
   'Le Two-Step Test est mesuré manuellement ; son indice n’est calculé que si la taille est renseignée, sans inférence diagnostique automatique.',
   'Une photo de profil 2D ne constitue pas une mesure radiographique de l’équilibre sagittal (SVA).',
   'Le rapport ne prédit ni chute, ni maladie, ni espérance de vie ; toute interprétation exige le contexte clinique.'
  ]
 };
 return report;
}
