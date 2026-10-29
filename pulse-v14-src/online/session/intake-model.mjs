// KŌMØ Motion Online — original, non-validated self-report intake.
// NOT the GLFS-25 or a licensed reproduction. No diagnosis or medical score.
export const QUESTIONNAIRE_VERSION='KOMO_MOTION_SELF_REPORT_V1';
const ease=['Aucune difficulté','Une légère difficulté','Une difficulté modérée','Une grande difficulté','Impossible ou évité'];
const interference=['Jamais','Rarement','Parfois','Souvent','Presque toujours'];
const frequency=['5 jours ou plus / semaine','3 à 4 jours / semaine','1 à 2 jours / semaine','Moins d’un jour / semaine','Jamais'];
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
 ]}
];
export const SCORING_GROUPS=INTAKE_GROUPS.filter(g=>g.scored!==false);
export const QUESTION_COUNT=INTAKE_GROUPS.reduce((s,g)=>s+g.questions.length,0);
export function completeGroup(group,answers){
 return group.questions.every(q=>Object.hasOwn(answers,q.id)&&validAnswer(q,answers[q.id]));
}
export function validAnswer(q,answer){
 if(Array.isArray(q.options)&&typeof q.options[0]==='string')return Number.isInteger(Number(answer))&&String(Number(answer))===String(answer)&&Number(answer)>=0&&Number(answer)<q.options.length;
 return q.options.some(item=>item[0]===answer);
}
export function intakeProgress(answers={}){
 const questions=INTAKE_GROUPS.flatMap(g=>g.questions);
 const completed=questions.filter(q=>Object.hasOwn(answers,q.id)&&validAnswer(q,answers[q.id])).length;
 return {completed,total:questions.length,percent:Math.round(completed/questions.length*100)};
}
const round=x=>Math.round(x*10)/10;
export function scoreIntake(answers={}){
 const missing=INTAKE_GROUPS.flatMap(g=>g.questions.filter(q=>!Object.hasOwn(answers,q.id)||!validAnswer(q,answers[q.id])).map(q=>q.id));
 const domains={};
 for(const g of SCORING_GROUPS){
  if(!completeGroup(g,answers)){domains[g.id]=null;continue;}
  const total=g.questions.reduce((s,q)=>s+Number(answers[q.id]),0);
  domains[g.id]=round(100*(1-total/(4*g.questions.length)));
 }
 const complete=missing.length===0;
 const profileIndex=complete?round(SCORING_GROUPS.reduce((s,g)=>s+g.weight*domains[g.id],0)):null;
 return {version:QUESTIONNAIRE_VERSION,complete,missing,domains,profileIndex,
   label:'Indice de profil déclaré — exploratoire',isValidated:false};
}
export function questionnaireFocus(answers){
 const s=scoreIntake(answers);
 if(!s.complete)return [];
 return [...SCORING_GROUPS].sort((a,b)=>s.domains[a.id]-s.domains[b.id]).slice(0,2)
 .map(g=>({domain:g.id,label:g.title,value:s.domains[g.id]}));
}
