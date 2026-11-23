// Clinical-style *descriptive* passport for supervised KŌMØ Motion demos.
// No medical diagnosis, validated score, biological age or survival estimate.
import {INTAKE_GROUPS,intakeProgress,scoreIntake,validAnswer,questionPoints} from './motion-engine/intake-model.mjs?v=20261123-identite-v1';
import {buildClinicActionPlan} from './motion-live-clinic-action-plan-v1.mjs?v=20261123-identite-v1';
import {instrumentedRows,acquisitionConditions,MOTION_PROTOCOL_VERSION,PROTOCOL,stepById,POSTURE_OPTIONS,skippedText,STEP_IDS} from './motion-protocol.mjs?v=20261123-identite-v1';
import {buildLongevityPlan,profileFrom,ZONES} from './motion-longevity-plan.mjs?v=20261123-identite-v1';
export const CLINIC_PASSPORT_VERSION='KOMO_MOTION_CLINIC_PASSPORT_V2';
const T=[
 {id:'sts',name:stepById('sts').title,short:'Force fonctionnelle',unit:'levers / 30 s',
  method:'30 secondes, chaise stable de 43 cm, bras croisés si possible. Compter les levers complets. La puissance des jambes (W/kg) en est calculée avec la taille (équation d’Alcazar).',
  caveat:'Valeur de suivi ; comparaison normative uniquement avec âge exact, groupe de référence et protocole confirmé. La puissance est une estimation, pas une mesure directe.'},
 {id:'two_step',name:stepById('two_step')?.title||'Two-Step · deux grands pas',short:'Deux grands pas',unit:'cm',
  method:'Deux essais manuels des deux plus grands pas sans saut, pieds joints à l’arrêt. Retenir la meilleure distance mesurée au sol.',
  caveat:'Indice = meilleure distance / taille (cm), uniquement si la taille est renseignée. Les seuils cliniques exigent un protocole standardisé et une interprétation contextualisée.'},
 {id:'unipodal_left',name:stepById('unipodal_left').title,short:'Stabilité gauche',unit:'s / 30 s',
  method:'Appui unipodal yeux ouverts sur plateforme ForceDecks, chronométré par l’opérateur du lever du pied droit jusqu’au pied posé, maximum 30 secondes, meilleur de deux essais.',
  caveat:'Mesure plafonnée à 30 s ; les oscillations de la plateforme ne sont relevées que pour un essai tenu 30 s.'},
 {id:'unipodal_right',name:stepById('unipodal_right').title,short:'Stabilité droite',unit:'s / 30 s',
  method:'Appui unipodal yeux ouverts sur plateforme ForceDecks, chronométré par l’opérateur du lever du pied gauche jusqu’au pied posé, maximum 30 secondes, meilleur de deux essais.',
  caveat:'Mesure plafonnée à 30 s ; un pied qui touche le sol ou l’autre jambe, ou une main qui se pose, arrête le chrono.'},
 {id:'arms',name:stepById('arms')?.title||'Élévation des bras 30 s (ancien protocole)',short:'Contrôle proximal',unit:'mouvements',
  method:'Élévations bilatérales suivies par caméra, sans goniométrie ni force instrumentée.',
  caveat:'Le nombre de répétitions ne quantifie pas une amplitude articulaire ni une puissance musculaire.'},
 {id:'posture',name:stepById('posture')?.title||'Posture de profil (ancien protocole)',short:'Alignement de surface',unit:'',
  method:'Observation visuelle de profil, à partir d’une image 2D non calibrée.',
  caveat:'Aucune mesure de SVA C7–S1 radiographique, d’angle pelvien ou de déformation rachidienne.'}
];
// v2.4 (sans caméra) : seuls les tests du protocole actuel sont listés ; un ancien test (Two-Step, bras,
// posture, pointes) n'apparaît que s'il a un résultat dans la consultation (dossiers antérieurs).
export function passportTestIds(results={}){
 const legacy=id=>!!results?.[id];
 return T.map(t=>t.id==='two_step'&&!STEP_IDS.includes('two_step')&&!results?.two_step&&results?.heels?'heels':t.id)
  .filter(id=>STEP_IDS.includes(id)||legacy(id));
}
const LEGACY_HEELS={id:'heels',name:'Élévation sur les pointes (ancien protocole)',short:'Endurance distale',unit:'répétitions',
 method:'Ancien test de mollets, non assimilable au Two-Step Test.',
 caveat:'Mesure historique conservée pour traçabilité ; ne pas la comparer au Two-Step Test.'};
const names=Object.fromEntries(POSTURE_OPTIONS);
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
  value===null?(status==='skipped'?skippedText(row?.reason):'Non documenté'):
   n(value)+' '+test.unit+(timedCount?' / '+durationSeconds+' s':'');
 const source=row?.source==='operator_confirmed_video_estimate'?'Estimation vidéo confirmée par l’opérateur':
   row?.source==='operator_manual_observation'?'Saisie manuelle par l’opérateur':
   row?.source==='operator_visual_observation'?'Observation de l’opérateur':
   row?.source==='operator_manual_entry'?'Saisie de l’opérateur (appareil ou chrono PULSE)':
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
 const when=options.date instanceof Date&&!Number.isNaN(options.date.getTime())?options.date:new Date();
 const date=when.toISOString().slice(0,10);
 // Du résultat à l'action : zones par capacité, 3 priorités, programme maison, objectifs à 6 semaines.
 const longevity=buildLongevityPlan(results,profileFrom(options.patient||{},when));
 const stepsDone=STEP_IDS.filter(id=>results[id]?.status==='done').length,stepsTotal=STEP_IDS.length;
 const subject=safe(options.subject||'Dossier de démonstration').slice(0,100);
 const real=options.real===true;
 const simulated=options.simulated===true;
 const profile={ageBand:answers.ageBand||null,goal:answers.goal||null};
 const rating=key=>Object.hasOwn(answers,key)&&/^[0-4]$/.test(String(answers[key]))?Number(answers[key]):null;
 const ids=passportTestIds(results);
 const measures=ids.map(id=>id==='heels'?objective(results.heels,LEGACY_HEELS):objective(results[id],T.find(t=>t.id===id)));
 const measured=measures.filter(x=>x.measured).length,skipped=measures.filter(x=>x.status==='skipped').length;
 const flagged=measures.filter(x=>x.review);
 const bL=measures.find(m=>m.id==='unipodal_left'),bR=measures.find(m=>m.id==='unipodal_right');
 const both=finite(bL?.value)&&finite(bR?.value);
 const balance=both?{
  left:bL.value,right:bR.value,min:Math.min(bL.value,bR.value),
  delta:round1(Math.abs(bL.value-bR.value)),ceilingLeft:bL.ceiling,ceilingRight:bR.ceiling,
  tenSecondBoth:bL.value>=10&&bR.value>=10,
  // If either value is at the 30 s ceiling, difference is censored.
  interpretation:bL.ceiling||bR.ceiling?
   'Au moins un côté atteint le plafond de 30 s : l’écart est descriptif et ne permet pas de quantifier une véritable asymétrie.':
   'Écart inter-latéral descriptif, sans seuil pathologique validé : seul le repère des 10 secondes est utilisé.'
 }:null;
 const progress=intakeProgress(answers),questionnaire=scoreIntake(answers);
 // Groupe facultatif (« Santé et longévité ») : présent seulement si au moins une réponse a été donnée.
 const answeredIn=g=>g.questions.some(q=>Object.hasOwn(answers,q.id)&&validAnswer(q,answers[q.id]));
 const groups=INTAKE_GROUPS.filter(g=>!g.optional||answeredIn(g)).map(g=>({
  id:g.id,label:g.title,optional:!!g.optional,
  score:questionnaire.domains[g.id]??null,
  points:questionnaire.domainPoints[g.id]?.points??null,
  maxPoints:questionnaire.domainPoints[g.id]?.maximum??null,
  weight:questionnaire.domainPoints[g.id]?.weight??null,
  items:g.questions.map(q=>({
   id:q.id,question:q.label,
   points:g.scored===false?null:questionPoints(q,answers[q.id]),
   maxPoints:g.scored===false?null:4,
   answer:Object.hasOwn(answers,q.id)&&validAnswer(q,answers[q.id])?
    (Array.isArray(q.options[0])?q.options.find(([key])=>key===answers[q.id])?.[1]:
     q.options[Number(answers[q.id])]):'Non renseigné'
  }))
 }));
 const messages=[];
 messages.push(stepsDone+' étapes sur '+stepsTotal+' disposent d’un résultat'+(stepsDone===stepsTotal?
  ' : ce bilan est le point de départ du contrôle à 6 semaines.':' ; les tests non réalisés restent signalés.'));
 messages.push(longevity.headline);
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
 // Repères déclaratifs de longévité (facultatifs) : associations décrites, jamais un diagnostic.
 if(answers.falls12==='1'||answers.falls12==='2plus')
  messages.push('Chute déclarée au cours des 12 derniers mois : une chute récente est associée à un risque plus élevé de nouvelle chute ; l’équilibre et la force des jambes sont à travailler en priorité.');
 if(answers.activityMinutes==='lt60'||answers.activityMinutes==='60to149')
  messages.push('Activité modérée déclarée sous les 150 minutes par semaine recommandées par l’OMS : l’augmenter progressivement est l’un des leviers les plus associés à la longévité.');
 if(answers.sittingHours==='gt8')
  messages.push('Plus de 8 heures assis par jour déclarées : interrompre les longues périodes assises par quelques minutes de marche est conseillé.');
 if(!questionnaire.complete)messages.push(
  'Le questionnaire est incomplet ('+progress.completed+'/22) ; aucune conclusion sur le ressenti, les habitudes ou un indice locomoteur déclaré n’est calculée.'
 );
 else messages.push('Les réponses déclaratives complètent les tests physiques ; leurs indices KŌMØ sont exploratoires et non diagnostiques.');
 if(simulated)messages.unshift('Simulation pédagogique : les 22 réponses déclaratives ont été inventées et ne proviennent pas d’un patient interrogé.');
 if(questionnaire.complete){
  const chairMeasure=measures.find(m=>m.id==='sts');
  if(rating('chair')===0&&finite(chairMeasure?.value))
   messages.push('Le transfert assis-debout est objectivé par '+n(chairMeasure.value)+' levers, tandis que la difficulté de lever de chaise déclarée est nulle : concordance descriptive, sans comparaison normative.');
  if(rating('bend')>=2&&rating('pain')>=1)
   messages.push('L’autonomie globale déclarée est plutôt préservée, mais la flexion du tronc est décrite comme difficile et une gêne intervient parfois : cette discordance mérite une observation fonctionnelle ciblée.');
  if(rating('strengthDays')>=3)
   messages.push('L’habitude de renforcement apparaît faible malgré une capacité de mouvement documentée : les objectifs doivent porter sur la régularité et non sur un âge locomoteur inféré.');
  if([rating('sleep'),rating('stress'),rating('recovered')].some(v=>v!==null&&v>=2))
   messages.push('Sommeil, stress et récupération sont décrits comme perturbateurs intermittents ; ces facteurs rapportés sont à suivre séparément des résultats instrumentaux.');
 }
 const priorities=[];
 const measuredPriorities=longevity.priorities.map(p=>({id:p.id,zone:p.zone,objective:p.objective,
  title:p.name+' · '+ZONES[p.zone].label.toLowerCase(),
  detail:p.why+' Objectif à 6 semaines : '+p.objective+'.',
  basis:p.basis||'Mesures du bilan'}));
 if(!questionnaire.complete)priorities.push({
  title:'Compléter la dimension vécue',
  detail:'Renseigner les '+(progress.total-progress.completed)+' réponses manquantes pour documenter difficultés, douleur, confiance, récupération et activité.',
  basis:'Questionnaires '+progress.completed+'/'+progress.total
 });
 if(flagged.length)priorities.push({
  title:'Contrôler la fiabilité des captures',
  detail:'Revoir le compte rendu opérateur des épreuves '+flagged.map(x=>x.name.toLowerCase()).join(', ')+'. Une qualité insuffisante ne doit pas être présentée comme une performance certaine.',
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
  detail:'Refaire les mêmes tests à 6 semaines, dans les mêmes conditions (chaise, chaussures, moment de la journée) : c’est la comparaison qui montre le progrès.',
  basis:'Même protocole '+PROTOCOL.code+' '+PROTOCOL.version
 });
 const recheck=priorities.find(x=>x.title==='Standardiser le prochain contrôle');
 const reliability=priorities.find(x=>x.title==='Contrôler la fiabilité des captures');
 const others=priorities.filter(x=>x!==recheck&&x!==reliability);
 const selected=[...(reliability?[reliability]:[]),...measuredPriorities,
  ...others.slice(0,Math.max(0,3-measuredPriorities.length)),...(recheck?[recheck]:[])];
 const evidence=[
  {name:'Studenski et al. JAMA 2011 — Vitesse de marche et survie',url:'https://pubmed.ncbi.nlm.nih.gov/21205966/',
   meaning:'Chaque 0,1 m/s de plus est associé à un risque de décès plus faible ; association de cohorte, pas un pronostic individuel.'},
  {name:'EWGSOP2 — Force basse et performance physique',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9219260/',
   meaning:'Repères de préhension (< 27 kg homme, < 16 kg femme) et de vitesse de marche (≤ 0,8 m/s).'},
  {name:'PURE, Lancet 2015 — Force de préhension',url:'https://pubmed.ncbi.nlm.nih.gov/25982160/',
   meaning:'Chaque 5 kg de moins est associé à une mortalité plus élevée, toutes causes.'},
  {name:'Cochrane 2019 — Exercice et prévention des chutes',url:'https://pubmed.ncbi.nlm.nih.gov/30703272/',
   meaning:'Les programmes d’équilibre et de renforcement réduisent le nombre de chutes d’environ un quart.'},
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
   meaning:'Meilleur de trois essais jusqu’à 45 s, non comparable directement à un essai plafonné à 30 s.'},
  {name:'Alcazar et al. Sci Rep 2020 — Puissance au lever de chaise 30 s',
   url:'https://pubmed.ncbi.nlm.nih.gov/33004970/',
   meaning:'Équation validée contre la presse de jambes : puissance estimée à partir de la taille, de la hauteur de chaise et du nombre de levers.'},
  {name:'Alcazar et al. J Cachexia Sarcopenia Muscle 2021 — Puissance relative',
   url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC8350203/',
   meaning:'Puissance basse sous 2,6 W/kg (homme) et 2,1 W/kg (femme), associée aux limitations de mobilité ; changement important à partir de 0,42 et 0,33 W/kg.'}
 ];
 const actionPlan=buildClinicActionPlan(answers,measures,balance,{
   complete:questionnaire.complete,groups
 },{simulated});
 // Le programme maison découle des mesures ; le questionnaire garde la nutrition et le ressenti.
 const strong=longevity.capacities.filter(c=>c.zone==='solid').map(c=>c.name);
 actionPlan.headline=longevity.headline;
 actionPlan.exercises=longevity.exercises;
 actionPlan.highlights=[
  {label:'Vos priorités',value:longevity.priorities.length?longevity.priorities.map(p=>p.name).join(' · '):'Entretien de vos capacités'},
  {label:'Vos atouts',value:strong.length?strong.join(' · '):'À construire pendant les 6 semaines'},
  {label:'Objectifs à 6 semaines',value:longevity.objectives.map(o=>o.target).join(' · ')||'Fixés au prochain bilan'}
 ];
 actionPlan.timeline=[
  {weeks:'Semaines 1–2',title:'Apprendre',focus:'Les gestes justes, avec appui',
   tasks:['3 séances de 20 min : les 4 exercices du programme','Marche quotidienne de 20 min','Noter chaque séance et toute gêne']},
  {weeks:'Semaines 3–4',title:'Progresser',focus:'Augmenter quand c’est facile',
   tasks:['+2 répétitions ou une série de plus si l’exercice est aisé','Équilibre : réduire l’appui des mains','Allonger les phases de marche rapide']},
  {weeks:'Semaines 5–6',title:'Consolider',focus:'Installer la routine',
   tasks:['Garder 3 séances par semaine','Marche jusqu’à 30 min si bien tolérée','Contrôle : mêmes tests, mêmes conditions']}
 ];
 actionPlan.monitoring=longevity.objectives.map(o=>({name:o.name,value:o.target,unit:''}));
 actionPlan.schedule=longevity.schedule;
 actionPlan.review='Programme proposé à partir des mesures, à valider et adapter par le praticien selon les symptômes, les traitements et le risque de chute.';
 const report={
  version:CLINIC_PASSPORT_VERSION,
  date,subject,mode:real?'CABINET':'CABINET_DEMO',real,profile,simulated,
  measures,measured,skipped,flagged:flagged.length,steps:{done:stepsDone,total:stepsTotal},longevity,
  protocol:MOTION_PROTOCOL_VERSION,protocolVersion:PROTOCOL.version,conditions:acquisitionConditions(results),
  instrumented:instrumentedRows(results),
  trajectory:options.trajectory&&Array.isArray(options.trajectory.points)?options.trajectory:null,
  questionnaire:{answered:progress.completed,total:progress.total,complete:questionnaire.complete,
   simulated,index:questionnaire.complete?questionnaire.profileIndex:null,
   rawPoints:questionnaire.rawPoints,maxPoints:questionnaire.maxPoints,
   scoringVersion:questionnaire.scoringVersion,
   scoredQuestions:questionnaire.scoredQuestions,descriptiveQuestions:questionnaire.descriptiveQuestions,
   groups},
  balance,findings:messages,priorities:selected,evidence,actionPlan,
  outcomes:{motionScore:null,motionAge:null,lifeExpectancy:null},
  recheck:'6 semaines',
  limitations:[
   ...(simulated?['Les réponses au questionnaire ont été générées artificiellement pour une démonstration : elles ne constituent aucune déclaration patient.']:[]),
   real?'Évaluation fonctionnelle descriptive réalisée en cabinet, sur dossier pseudonymisé, selon le protocole '+PROTOCOL.code+' '+PROTOCOL.version+'.':
    'Évaluation fonctionnelle exploratoire réalisée dans un environnement de démonstration sur dossier fictif.',
   'Les questionnaires propriétaires KŌMØ n’ont pas été validés comme outils diagnostiques ; les mesures proviennent des plateformes ForceDecks, du DynaMo et du chrono, sans caméra.',
   'La puissance des jambes est estimée par une équation publiée à partir du lever de chaise et de la taille ; ce n’est pas une mesure directe.',
   'Aucun score composite ni « âge du mouvement » : chaque capacité est située par rapport à son propre repère publié, ou suivie dans le temps.',
   'Les repères (EWGSOP2, AWGS, Rikli & Jones, Araújo, JOA, Alcazar) sont des seuils de population : ils hiérarchisent le programme, ils ne posent pas de diagnostic.',
   'Les durées d’équilibre sont plafonnées à 30 s. Une valeur de 30 s n’est pas une mesure au-delà de ce plafond.',
   'Le Two-Step Test est mesuré manuellement ; son indice n’est calculé que si la taille est renseignée, sans inférence diagnostique automatique.',
   'Une photo de profil 2D ne constitue pas une mesure radiographique de l’équilibre sagittal (SVA).',
   'Le rapport ne prédit ni chute, ni maladie, ni espérance de vie ; toute interprétation exige le contexte clinique.'
  ]
 };
 return report;
}
