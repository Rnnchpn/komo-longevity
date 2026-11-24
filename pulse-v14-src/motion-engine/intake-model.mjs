// KŌMØ Motion — original, non-validated self-report intake.
// NOT the GLFS-25 or a licensed reproduction. No diagnosis or medical score.
export const QUESTIONNAIRE_VERSION='KOMO_MOTION_SELF_REPORT_V1';
const ease=['Aucune difficulté','Une légère difficulté','Une difficulté modérée','Une grande difficulté','Impossible ou évité'];
const interference=['Jamais','Rarement','Parfois','Souvent','Presque toujours'];
const frequency=['5 jours ou plus / semaine','3 à 4 jours / semaine','1 à 2 jours / semaine','Moins d’un jour / semaine','Jamais'];
const EVA_OPTIONS=Array.from({length:11},(_,i)=>[String(i),String(i)]);
const ODI_OPTIONS=Array.from({length:6},(_,i)=>[String(i),String(i)]);
export const EVA_IDS=['evaBack','evaLeg','evaGeneral'];
export const ODI_IDS=Array.from({length:10},(_,i)=>'odi'+(i+1));
export const INTAKE_GROUPS=[
 {id:'profile',title:'Votre profil',subtitle:'Quelques repères pour comprendre vos attentes.',note:'Les réponses ne sont pas utilisées comme diagnostic.',scored:false,questions:[
   {id:'ageBand',label:'Votre tranche d’âge',options:[['under40','Moins de 40 ans'],['40-49','40 à 49 ans'],['50-59','50 à 59 ans'],['60-69','60 à 69 ans'],['70-79','70 à 79 ans'],['80plus','80 ans ou plus'],['undisclosed','Je préfère ne pas répondre']]},
   {id:'goal',label:'Quel est votre objectif prioritaire ?',options:[['independence','Préserver mon autonomie'],['walk','Améliorer mon aisance à la marche'],['strength','Entretenir ma force'],['confidence','Me sentir plus sûr de mes mouvements'],['general','Mieux comprendre ma mobilité']]},
 ]},
 {id:'mobility',title:'Votre mobilité au quotidien',subtitle:'Indiquez votre difficulté habituelle, pas votre meilleure performance.',note:'8 questions originales KŌMØ sur la mobilité perçue ; ce n’est pas le GLFS-25 validé.',weight:.45,questions:[
  {id:'walk10',label:'Marcher dehors pendant 10 minutes',options:ease},
  {id:'stairs',label:'Monter un étage d’escalier',options:ease},
  {id:'chair',label:'Vous relever d’une chaise sans vous précipiter',options:ease},
  {id:'carry',label:'Transporter un sac de courses léger',options:ease},
  {id:'bend',label:'Vous pencher pour ramasser un objet',options:ease},
  {id:'obstacle',label:'Franchir une petite marche ou un trottoir',options:ease},
  {id:'turn',label:'Faire demi-tour en marchant',options:ease},
  {id:'stand',label:'Rester debout quelques minutes',options:ease}
 ]},
 {id:'comfort',title:'Douleur, fatigue et confiance',subtitle:'Comment ces éléments influencent-ils vos mouvements ces derniers jours ?',note:'Questions de ressenti, pas un dépistage médical.',weight:.25,questions:[
  {id:'pain',label:'Une douleur ou gêne vous a limité dans vos mouvements',options:interference},
  {id:'fatigue',label:'La fatigue vous a fait interrompre une activité',options:interference},
  {id:'fear',label:'La crainte de perdre l’équilibre vous a retenu',options:interference},
  {id:'avoid',label:'Vous avez évité une activité à cause d’une gêne ou d’un manque de confiance',options:interference}
 ]},
 {id:'recovery',title:'Récupération et bien-être',subtitle:'Votre ressenti sur les sept derniers jours.',note:'Le sommeil, le stress et la qualité de vie sont présentés séparément des tests physiques.',weight:.15,questions:[
  {id:'sleep',label:'Un sommeil insuffisant a gêné vos journées',options:interference},
  {id:'stress',label:'Le stress a diminué votre disponibilité physique',options:interference},
  {id:'recovered',label:'Vous avez eu du mal à récupérer après l’effort',options:interference},
  {id:'qol',label:'Votre mobilité a diminué votre qualité de vie',options:interference}
 ]},
 {id:'activity',title:'Vos habitudes de mouvement',subtitle:'Choisissez la réponse correspondant le mieux à votre dernière semaine.',note:'Fréquence auto-déclarée, sans estimation de dépense énergétique.',weight:.15,questions:[
  {id:'walkingDays',label:'Jours avec au moins 20 minutes de marche ou d’activité douce',options:frequency},
  {id:'strengthDays',label:'Jours avec un exercice de renforcement adapté',options:['3 jours ou plus','2 jours','1 jour','Moins d’un jour','Jamais']},
  {id:'outdoors',label:'Sorties actives ou déplacements à pied',options:frequency},
  {id:'breaks',label:'Jours où vous avez interrompu une longue période assise pour bouger',options:frequency}
 ]},
 // 22/11/2026 : 5 questions FACULTATIVES, descriptives (sans points ni indice), parmi les repères de longévité
 // les plus documentés : chute récente, activité physique hebdomadaire, temps assis, tabac, nombre de médicaments.
 // Elles ne comptent ni dans les 22 réponses attendues ni dans l'indice déclaré.
 {id:'health',title:'Santé et longévité',subtitle:'Facultatif : cinq repères qui aident à préciser votre programme.',note:'Réponses descriptives, sans score ; elles ne servent pas de diagnostic.',scored:false,optional:true,questions:[
  {id:'falls12',label:'Chutes au cours des 12 derniers mois',options:[['0','Aucune'],['1','Une'],['2plus','Deux ou plus']]},
  {id:'activityMinutes',label:'Activité d’intensité modérée (marche rapide, vélo, natation) par semaine',options:[['lt60','Moins d’1 heure'],['60to149','D’1 heure à 2 h 30'],['150plus','2 h 30 ou plus']]},
  {id:'sittingHours',label:'Temps passé assis par jour, hors sommeil',options:[['lt6','Moins de 6 heures'],['6to8','De 6 à 8 heures'],['gt8','Plus de 8 heures']]},
  {id:'smoking',label:'Tabac',options:[['never','Je n’ai jamais fumé'],['former','J’ai arrêté'],['current','Je fume']]},
  {id:'medications',label:'Médicaments pris chaque jour, sur ordonnance',options:[['0to2','0 à 2'],['3to4','3 à 4'],['5plus','5 ou plus']]}
 ]},
 // 24/11/2026 : douleur (EVA de 0 à 10) et ODI. FACULTATIFS : hors des 22 réponses attendues et hors de l'indice.
 // EVA : douleur moyenne des 7 derniers jours ; changement réel ≥ 2 points (Ostelo 2008).
 {id:'pain',title:'Vos douleurs',subtitle:'Facultatif : votre douleur moyenne ces 7 derniers jours, de 0 (aucune douleur) à 10 (douleur maximale imaginable).',note:'Échelles visuelles analogiques (EVA) de 0 à 10. Un écart de 2 points ou plus entre deux bilans compte comme un changement réel.',scored:false,optional:true,eva:true,questions:[
  {id:'evaBack',label:'Douleur lombaire (bas du dos)',options:EVA_OPTIONS,eva:true},
  {id:'evaLeg',label:'Douleur du membre inférieur (hanche, cuisse, genou, jambe, pied)',options:EVA_OPTIONS,eva:true},
  {id:'evaGeneral',label:'Douleur générale',options:EVA_OPTIONS,eva:true}
 ]},
 // ODI (Oswestry Disability Index) : 10 rubriques notées de 0 à 5, saisies par le praticien d'après le formulaire
 // officiel (version française validée, Vogler 2008 ; licence Mapi Research Trust). Le texte des réponses n'est
 // pas reproduit ici. Score = total / (5 × rubriques renseignées) × 100, calculé à partir de 8 rubriques.
 {id:'odi',title:'Oswestry (ODI)',subtitle:'Retentissement d’une douleur du dos ou de la jambe : 10 rubriques notées de 0 à 5, d’après le formulaire officiel rempli par le patient.',note:'Formulaire ODI officiel, version française validée (licence Mapi Research Trust). Score en % : 0–20 incapacité minime, 21–40 modérée, 41–60 sévère, au-delà de 60 très sévère. Changement réel : 10 points.',scored:false,optional:true,practitionerOnly:true,odi:true,
  questions:['Intensité de la douleur','Soins personnels (se laver, s’habiller)','Soulever des charges','Marche','Position assise','Position debout','Sommeil','Vie sexuelle','Vie sociale','Déplacements et voyages']
   .map((label,i)=>({id:'odi'+(i+1),label,options:ODI_OPTIONS}))}
];
// Questions attendues (les groupes facultatifs n'entrent ni dans la complétude ni dans l'indice).
export const REQUIRED_GROUPS=INTAKE_GROUPS.filter(g=>!g.optional);
export const OPTIONAL_GROUPS=INTAKE_GROUPS.filter(g=>g.optional);
export const SCORING_GROUPS=INTAKE_GROUPS.filter(g=>g.scored!==false);
export const QUESTION_COUNT=REQUIRED_GROUPS.reduce((s,g)=>s+g.questions.length,0);
export const QUESTIONNAIRE_POINTS_VERSION='KOMO_MOTION_SELF_REPORT_POINTS_V1';
// Two contextual answers (age band and goal) have no severity points.
export const SCORED_QUESTION_COUNT=SCORING_GROUPS.reduce((sum,g)=>sum+g.questions.length,0);
export const MAX_QUESTIONNAIRE_POINTS=4*SCORED_QUESTION_COUNT;
export function questionPoints(question,answer){
 if(!question||!Array.isArray(question.options)||typeof question.options[0]!=='string'||
  !validAnswer(question,answer))return null;
 return Number(answer); // 0 = least difficulty, 4 = most difficulty / least activity.
}
export function completeGroup(group,answers){
 return group.questions.every(q=>Object.hasOwn(answers,q.id)&&validAnswer(q,answers[q.id]));
}
export function validAnswer(q,answer){
 if(Array.isArray(q.options)&&typeof q.options[0]==='string')return Number.isInteger(Number(answer))&&String(Number(answer))===String(answer)&&Number(answer)>=0&&Number(answer)<q.options.length;
 return q.options.some(item=>item[0]===answer);
}
export function intakeProgress(answers={}){
 const questions=REQUIRED_GROUPS.flatMap(g=>g.questions);
 const completed=questions.filter(q=>Object.hasOwn(answers,q.id)&&validAnswer(q,answers[q.id])).length;
 return {completed,total:questions.length,percent:Math.round(completed/questions.length*100)};
}
const round=x=>Math.round(x*10)/10;
export function scoreIntake(answers={}){
 const missing=REQUIRED_GROUPS.flatMap(g=>g.questions.filter(q=>
  !Object.hasOwn(answers,q.id)||!validAnswer(q,answers[q.id])).map(q=>q.id));
 const domains={},domainPoints={};
 for(const g of SCORING_GROUPS){
  const answered=g.questions.filter(q=>questionPoints(q,answers[q.id])!==null).length;
  const maximum=4*g.questions.length;
  const points=answered===g.questions.length?
   g.questions.reduce((sum,q)=>sum+questionPoints(q,answers[q.id]),0):null;
  domainPoints[g.id]={points,maximum,answered,total:g.questions.length,weight:g.weight};
  domains[g.id]=points===null?null:round(100*(1-points/maximum));
 }
 // Do not publish a partial composite score: all 22 responses must be valid.
 const complete=missing.length===0;
 const rawPoints=complete?
  SCORING_GROUPS.reduce((sum,g)=>sum+domainPoints[g.id].points,0):null;
 const profileIndex=complete?round(SCORING_GROUPS.reduce(
  (sum,g)=>sum+g.weight*domains[g.id],0)):null;
 return {version:QUESTIONNAIRE_VERSION,scoringVersion:QUESTIONNAIRE_POINTS_VERSION,
  complete,missing,domains,domainPoints,rawPoints,maxPoints:MAX_QUESTIONNAIRE_POINTS,
  scoredQuestions:SCORED_QUESTION_COUNT,descriptiveQuestions:QUESTION_COUNT-SCORED_QUESTION_COUNT,
  profileIndex,label:'Indice fonctionnel déclaré KŌMØ — exploratoire',isValidated:false};
}
export function questionnaireFocus(answers){
 const s=scoreIntake(answers);
 if(!s.complete)return [];
 return [...SCORING_GROUPS].sort((a,b)=>s.domains[a.id]-s.domains[b.id]).slice(0,2)
 .map(g=>({domain:g.id,label:g.title,value:s.domains[g.id]}));
}

// ODI en % (Fairbank 2000) : total / (5 × rubriques renseignées) × 100 ; non calculé sous 8 rubriques.
export function odiScore(answers={}){
 const vals=ODI_IDS.map(id=>answers[id]).filter(v=>typeof v==='string'&&/^[0-5]$/.test(v)).map(Number);
 if(vals.length<8)return {score:null,answered:vals.length,total:10};
 const score=Math.round(vals.reduce((a,b)=>a+b,0)/(5*vals.length)*100);
 const level=score<=20?'incapacité minime':score<=40?'incapacité modérée':score<=60?'incapacité sévère':'incapacité très sévère';
 return {score,answered:vals.length,total:10,level};
}
// EVA (0–10) : valeur entière ou null.
export const evaValue=(answers,id)=>typeof answers?.[id]==='string'&&/^(10|[0-9])$/.test(answers[id])?Number(answers[id]):null;
