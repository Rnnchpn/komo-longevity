// KŌMØ Motion Passport V1 - descriptive interpretation, NOT prediction of lifespan.
// It must never infer biological age, survival, diagnosis or a clinical grade.
import {scoreIntake,SCORING_GROUPS} from './intake-model.mjs';
export const PASSPORT_VERSION='KOMO_MOTION_PASSPORT_V1';
export const PROGRAM_VERSION='KOMO_PULSE_DAILY_V1';
export const DOMAINS={
 mobility:{title:'Mobilité',caption:'Se déplacer, se relever et changer de direction',why:'La capacité à se déplacer est une composante de l’autonomie fonctionnelle.',action:'Bouger régulièrement, observer la marche et les transferts.'},
 comfort:{title:'Confort et confiance',caption:'Gêne, fatigue et assurance dans le mouvement',why:'La gêne et la peur du mouvement peuvent modifier la participation aux activités.',action:'Repérer les activités limitées, adapter la difficulté et discuter des gênes.'},
 recovery:{title:'Récupération',caption:'Sommeil, stress et ressenti après l’effort',why:'Le ressenti de récupération aide à moduler une progression réaliste.',action:'Alterner activité accessible, repos et régularité des horaires.'},
 activity:{title:'Habitudes actives',caption:'Régularité du mouvement au quotidien',why:'L’activité habituelle peut être progressivement accrue selon les capacités.',action:'Construire un rythme soutenable plutôt qu’un effort exceptionnel.'}
};
const num=x=>typeof x==='number'&&Number.isFinite(x);
const safe=(x,defaultText='À préciser')=>typeof x==='string'&&x.trim()?x.trim():defaultText;
function qualitative(v){
 if(!num(v))return {label:'À documenter',tone:'neutral'};
 // Product navigation thresholds only: not published norms or cut-offs.
 if(v<50)return {label:'Priorité de discussion',tone:'attention'};
 if(v<75)return {label:'À développer',tone:'growth'};
 return {label:'À entretenir',tone:'maintain'};
}
export function buildMotionPassport(answers={},results={},blocked=false){
 const intake=scoreIntake(answers);
 const domains=SCORING_GROUPS.map(g=>{
  const value=intake.domains[g.id];
  return {id:g.id,...DOMAINS[g.id],value,weight:g.weight,...qualitative(value)};
 });
 const available=domains.filter(d=>num(d.value)).sort((a,b)=>a.value-b.value);
 const focus=intake.complete?available.slice(0,2):[];
 const safety=blocked||answers.safety==='yes';
 const highDiscomfort=Number(answers.pain)>=3||Number(answers.fear)>=3||Number(answers.avoid)>=3;
 const planStatus=safety?'safety_hold':highDiscomfort?'professional_review':!intake.complete?'questionnaire_incomplete':'eligible';
 const measured=['sts','heels','unipodal_left','unipodal_right','arms','posture'].filter(id=>['done','review'].includes(results?.[id]?.status));
 const unverified=['sts','heels','unipodal_left','unipodal_right','arms','posture'].filter(id=>results?.[id]?.status==='review');
 const statement=safety?'La séance de mouvement a été interrompue pour sécurité.':
  !intake.complete?'Votre profil reste à compléter pour définir des priorités.':
  focus.length?'Vos réponses suggèrent de commencer par '+focus.map(d=>d.title.toLowerCase()).join(' et ')+'.':
  'Votre mobilité peut être suivie dans le temps, domaine par domaine.';
 return {
  version:PASSPORT_VERSION,
  index:intake.complete?intake.profileIndex:null,
  indexName:'Indice de profil locomoteur déclaré',
  indexStatus:intake.complete?'exploratory':'incomplete',
  domains,focus,planStatus,blocked:safety,
  measuredCount:measured.length,totalTests:6,
  flaggedCount:unverified.length,
  interpretation:statement,
  message:'Première photographie de votre mobilité perçue, pas une estimation de longévité biologique, de survie ou d’âge locomoteur.',
  checkpoint:'Revoir votre évolution après 4 à 6 semaines, sur les mêmes questions et tests comparables.',
  nextActions:[
   {id:'lab',title:'Compléter en consultation Motion',description:'Mesures instrumentées de force, amplitude et marche à Paris ou Cannes, avec restitution individualisée.'},
   {id:'pulse',title:'Commencer Pulse Daily',description:'Activités douces guidées, journal quotidien, progression adaptée et nouveau bilan comparatif.'}
  ]
 };
}
export const DAILY_EXERCISES=[
 {id:'walk',title:'Marche adaptée',category:'Mobilité',instruction:'Marchez à une allure confortable, sur une surface sûre. Vous devez pouvoir parler. Fractionnez si besoin.',safety:'Choisissez un trajet plat et accessible ; arrêtez-vous si malaise ou douleur inhabituelle.'},
 {id:'chair',title:'Se relever de la chaise',category:'Force fonctionnelle',instruction:'Depuis une chaise stable contre un mur, levez-vous lentement puis rasseyez-vous avec contrôle. Utilisez les accoudoirs si nécessaire.',safety:'Si vous vous sentez instable ou avez mal, ne forcez pas et demandez conseil.'},
 {id:'balance',title:'Stabilité avec appui',category:'Équilibre sécurisé',instruction:'Debout près d’un plan de travail fixe, déplacez doucement le poids d’un pied à l’autre, en gardant un appui disponible.',safety:'Jamais les yeux fermés ni sans support si vous avez des doutes sur votre stabilité.'},
 {id:'mobility',title:'Mobilité douce',category:'Souplesse et coordination',instruction:'Mobilisez lentement épaules et chevilles dans une amplitude confortable, sans chercher à atteindre une limite.',safety:'Évitez tout mouvement douloureux ou inhabituel.'},
 {id:'recover',title:'Pause récupération',category:'Récupération',instruction:'Faites une pause calme et notez votre ressenti, votre sommeil et votre disponibilité du jour.',safety:'Cet exercice de bien-être ne remplace pas un avis professionnel.'}
];
const planForWeek=week=>{
 const w=Math.max(1,Math.min(4,Math.floor(week)));
 return {week:w,walkMinutes:[8,10,12,15][w-1],
  chairRepeats:[5,6,8,10][w-1],balanceSeconds:[20,25,30,35][w-1],
  mobilityMinutes:[3,4,5,5][w-1],
  progression:'Progression indicative uniquement. Restez au niveau précédent si la séance est difficile.'};
};
export function weekForDay(day){
 return Math.max(1,Math.min(4,Math.floor((day-1)/7)+1));
}
export function planTargets(week){return planForWeek(week);}
export function createDailyProgram(now='2026-10-29'){
 return {version:PROGRAM_VERSION,startedAt:now,entries:{}};
}
export function isValidDay(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'));}
export function dayIndex(start,today){
 if(!isValidDay(start)||!isValidDay(today))return 1;
 const diff=(Date.parse(today+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000;
 return Math.max(1,Math.min(28,Math.floor(diff)+1));
}
export function programProgress(program){
 const entries=program?.entries||{};
 const days=Object.keys(entries).filter(k=>isValidDay(k));
 const completed=days.filter(d=>Array.isArray(entries[d]?.completed)&&entries[d].completed.length>0);
 return {daysLogged:completed.length,targetDays:28,percent:Math.round(Math.min(28,completed.length)/28*100)};
}
export function priorityNarrative(passport){
 if(passport.blocked)return 'Par sécurité, demandez un avis professionnel avant de pratiquer des exercices autonomes.';
 if(passport.planStatus==='professional_review')return 'Une gêne ou une peur importante a été signalée : privilégiez un échange individualisé avant un programme autonome.';
 if(passport.planStatus==='questionnaire_incomplete')return 'Terminez vos réponses pour construire un accompagnement adapté.';
 return passport.focus.map((d,i)=>(i+1)+'. '+d.title+' — '+d.action).join(' ');
}
