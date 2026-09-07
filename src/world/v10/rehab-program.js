import { EXERCISES } from '../v09/exercise-library.js';

const todayKey=()=>new Date().toISOString().slice(0,10);
const ageDays=(iso)=>Math.max(0,(Date.now()-new Date(iso).getTime())/86400000);
const completedRecent=(events,exerciseId,days=7)=>events.filter(e=>e?.completed&&e.exercise_id===exerciseId&&ageDays(e.created_at)<=days);
const avg=(xs)=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;

const PROGRAMS={
  left_quad:{
    id:'left_quad',
    title:{fr:'Force fonctionnelle · membre inférieur',en:'Functional strength · lower limb'},
    why:{fr:'La symétrie du quadriceps reste sous le seuil de surveillance du Twin. Le programme privilégie une tâche fonctionnelle simple et observable avant une progression plus exigeante.',en:'Quadriceps symmetry remains below the Twin watch threshold. The program prioritizes a simple observable functional task before a harder progression.'},
    primary:'sitstand10',support:'balance30',game:'squat10',weeklyPrimary:2,weeklySupport:2,
    progression:{fr:'Après plusieurs séances complètes de bonne qualité, proposer une progression vers squat contrôlé ou tempo lent — à valider avant modification du programme.',en:'After several complete good-quality sessions, suggest progression toward controlled squats or slower tempo — validate before changing the program.'}
  },
  balance:{
    id:'balance',
    title:{fr:'Stabilité · contrôle postural',en:'Stability · postural control'},
    why:{fr:'Le domaine équilibre est prioritaire. Le Twin propose des expositions courtes et répétées à une tâche stable avant toute augmentation de difficulté.',en:'Balance is the priority domain. The Twin suggests short repeated exposures to a stable task before increasing difficulty.'},
    primary:'balance30',support:'sitstand10',game:'squat10',weeklyPrimary:3,weeklySupport:2,
    progression:{fr:'Si les séances restent stables, proposer ensuite semi-tandem / tandem ou une durée plus longue, avec validation du niveau adapté.',en:'If sessions remain stable, next suggest semi-tandem / tandem or a longer duration, with validation of the appropriate level.'}
  },
  strength:{
    id:'strength',
    title:{fr:'Force · capacité fonctionnelle',en:'Strength · functional capacity'},
    why:{fr:'La force fonctionnelle est la priorité actuelle. Le programme commence par l’assis-debout, facile à répéter et à analyser à la caméra.',en:'Functional strength is the current priority. The program starts with sit-to-stand, which is easy to repeat and observe with the camera.'},
    primary:'sitstand10',support:'balance30',game:'squat10',weeklyPrimary:2,weeklySupport:2,
    progression:{fr:'Lorsque le volume est bien toléré et la qualité stable, proposer une progression de difficulté ou de tempo.',en:'When volume is well tolerated and quality is stable, suggest a difficulty or tempo progression.'}
  },
  gait:{
    id:'gait',
    title:{fr:'Base locomotrice · marche',en:'Locomotor base · gait'},
    why:{fr:'La capacité de marche nécessite d’abord une base de force et de stabilité. Le plan privilégie assis-debout + équilibre, puis réévalue la locomotion.',en:'Gait capacity first needs a base of strength and stability. The plan prioritizes sit-to-stand plus balance, then reassesses locomotion.'},
    primary:'sitstand10',support:'balance30',game:'squat10',weeklyPrimary:2,weeklySupport:3,
    progression:{fr:'Réévaluer la marche avant d’augmenter la complexité locomotrice.',en:'Reassess gait before increasing locomotor complexity.'}
  },
  general:{
    id:'general',
    title:{fr:'Maintien fonctionnel · mouvement général',en:'Functional maintenance · general movement'},
    why:{fr:'Aucun déficit dominant n’impose ici un programme spécifique. Le Twin propose une combinaison ludique de force, équilibre et activité quotidienne.',en:'No dominant deficit requires a specific program here. The Twin suggests a playful mix of strength, balance and daily activity.'},
    primary:'squat10',support:'balance30',game:'pushup10',weeklyPrimary:2,weeklySupport:2,
    progression:{fr:'Varier les défis tout en conservant une exposition régulière au renforcement et à l’équilibre.',en:'Vary challenges while keeping regular exposure to strengthening and balance.'}
  }
};

export function chooseProgram(snapshot){
  const symmetry=Number(snapshot?.metrics?.quadriceps_symmetry);
  const balance=Number(snapshot?.domains?.balance);
  const muscle=Number(snapshot?.domains?.muscle);
  const strength=Number(snapshot?.metrics?.strength_index);
  const gait=Number(snapshot?.metrics?.gait_speed);
  if(Number.isFinite(symmetry)&&symmetry<90)return PROGRAMS.left_quad;
  if(Number.isFinite(balance)&&balance<72)return PROGRAMS.balance;
  if((Number.isFinite(muscle)&&muscle<78)||(Number.isFinite(strength)&&strength<78))return PROGRAMS.strength;
  if(Number.isFinite(gait)&&gait<1.1)return PROGRAMS.gait;
  return PROGRAMS.general;
}

export function buildProgramState(snapshot,events=[]){
  const p=chooseProgram(snapshot);
  const primary=completedRecent(events,p.primary,7),support=completedRecent(events,p.support,7);
  const recent=completedRecent(events,p.primary,21).slice(-3);
  const recentQuality=avg(recent.map(e=>Number(e.quality_estimate)||0));
  const readyForReview=recent.length>=3&&recentQuality>=78;
  return{
    ...p,
    primaryExercise:EXERCISES[p.primary],
    supportExercise:EXERCISES[p.support],
    gameExercise:EXERCISES[p.game],
    progress:{primary:primary.length,primaryTarget:p.weeklyPrimary,support:support.length,supportTarget:p.weeklySupport},
    readyForReview,recentQuality:Math.round(recentQuality),
    status:'suggested_not_prescribed',
    requiresProfessionalApproval:true
  };
}

export function buildDailyQuests(snapshot,events=[],arenaData={}){
  const program=buildProgramState(snapshot,events),today=todayKey();
  const rehabDone=events.some(e=>e?.completed&&e.kind==='rehab'&&String(e.created_at||'').slice(0,10)===today);
  const arenaDone=arenaData?.lastDay===today||events.some(e=>e?.completed&&e.kind==='game'&&String(e.created_at||'').slice(0,10)===today);
  const steps=Math.max(0,Number(snapshot?.metrics?.steps)||0);
  const stepGoal=Math.max(4000,Math.ceil(Math.max(steps,3500)/1000)*1000);
  return{
    program,
    quests:[
      {id:'rehab',kind:'rehab',title:{fr:'Séance Twin',en:'Twin session'},exerciseId:program.primary,done:rehabDone,rewardXp:30},
      {id:'arena',kind:'game',title:{fr:'Défi Arena',en:'Arena challenge'},exerciseId:program.game,done:arenaDone,rewardXp:20},
      {id:'steps',kind:'activity',title:{fr:'Quête mouvement',en:'Movement quest'},steps,stepGoal,done:steps>=stepGoal,rewardXp:10,gameGoal:true}
    ]
  };
}

export function exerciseTitle(ex,lang='fr'){return ex?.title?.[lang]||ex?.title?.en||ex?.id||'Exercise';}
export function programTitle(program,lang='fr'){return program?.title?.[lang]||program?.title?.en||'Program';}
