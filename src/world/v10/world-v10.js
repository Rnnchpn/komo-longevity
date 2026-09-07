import { TwinCore } from '../v04/twin-core.js';
import { buildDailyQuests, buildProgramState, exerciseTitle, programTitle } from './rehab-program.js';

const $=(s,r=document)=>r.querySelector(s);
const app=$('#app');
if(!app)throw new Error('KŌMØ World V0.10 could not attach');
const core=new TwinCore();
try{core.setTimeIndex(2,'v10')}catch{}
const snapshot=core.current?.()||core.snapshots?.at(-1)||{};
const lang=()=>document.documentElement.lang==='en'?'en':'fr';
const today=()=>new Date().toISOString().slice(0,10);
const EVENTS_KEY='komo_motion_camera_events_v1';
const ARENA_KEY='komo_arena_v081';
const PROGRESS_KEY='komo_world_progress_v10';

function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function events(){return readJSON(EVENTS_KEY,[]).filter(Boolean)}
function arena(){return readJSON(ARENA_KEY,{})}
let progress=readJSON(PROGRESS_KEY,{worldXp:0,rehabStreak:0,lastRehabDay:null,processed:[],rewardedStepDays:[]});
progress.processed=Array.isArray(progress.processed)?progress.processed:[];
progress.rewardedStepDays=Array.isArray(progress.rewardedStepDays)?progress.rewardedStepDays:[];
const saveProgress=()=>localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress));

const copy={
  fr:{today:'AUJOURD’HUI',yourDay:'Votre journée KŌMŌ',priority:'PRIORITÉ DU TWIN',approval:'Programme fonctionnel suggéré · toute progression de rééducation reste à valider avant modification du plan.',quests:'BOUCLE DU JOUR',week:'CETTE SEMAINE',history:'HISTORIQUE MOTION',worldXp:'WORLD XP',start:'COMMENCER',done:'FAIT',steps:'pas',gameGoal:'objectif de jeu, pas une prescription clinique',primary:'Séance principale',support:'Équilibre / support',empty:'Aucune séance caméra enregistrée.',quality:'qualité estimée',motionScore:'Les événements d’entraînement n’altèrent pas automatiquement le Motion Score clinique.',rehabTitle:'PROGRAMME FONCTIONNEL SUGGÉRÉ',openToday:'Voir ma journée',streak:'série Rehab',review:'Progression potentielle détectée : revue du niveau recommandée avant changement.',noReview:'Le niveau reste inchangé jusqu’à nouvelle revue ou nouvelle mesure.',remaining:'pas restants',camera:'CAMÉRA',arena:'ARENA',activity:'MOUVEMENT'},
  en:{today:'TODAY',yourDay:'Your KŌMŌ day',priority:'TWIN PRIORITY',approval:'Suggested functional program · any rehab progression remains subject to review before the plan changes.',quests:'TODAY LOOP',week:'THIS WEEK',history:'MOTION HISTORY',worldXp:'WORLD XP',start:'START',done:'DONE',steps:'steps',gameGoal:'game goal, not a clinical prescription',primary:'Primary session',support:'Balance / support',empty:'No camera session recorded yet.',quality:'estimated quality',motionScore:'Training events do not automatically alter the clinical Motion Score.',rehabTitle:'SUGGESTED FUNCTIONAL PROGRAM',openToday:'Open my day',streak:'Rehab streak',review:'Potential progression detected: review the level before changing the program.',noReview:'The level remains unchanged until review or new measurement.',remaining:'steps remaining',camera:'CAMERA',arena:'ARENA',activity:'MOVEMENT'}
};
const tx=k=>copy[lang()][k]||k;

const todayButton=document.createElement('button');
todayButton.id='today-open';todayButton.className='today-open';todayButton.innerHTML='<i></i><span>TODAY</span> · <b>0/3</b>';
const header=$('.hud');
header?.insertBefore(todayButton,$('#language-toggle'));

const panel=document.createElement('section');
panel.id='today-panel';panel.className='today-panel';panel.innerHTML=`
  <div class="today-head"><div><span id="today-kicker">AUJOURD’HUI</span><h2 id="today-title">Votre journée KŌMŌ</h2></div><button id="today-close" class="today-close">×</button></div>
  <div id="today-priority" class="today-priority"></div>
  <section class="today-section"><div class="today-section-title"><span id="today-quests-title">BOUCLE DU JOUR</span><b id="today-count">0 / 3</b></div><div id="quest-list" class="quest-list"></div></section>
  <section class="today-section"><div class="today-section-title"><span id="today-week-title">CETTE SEMAINE</span><b id="rehab-streak"></b></div><div id="week-bars" class="week-bars"></div><div id="progress-hint" class="progress-hint"></div></section>
  <section class="today-section"><div class="today-section-title"><span id="today-history-title">HISTORIQUE MOTION</span><b id="history-count"></b></div><div id="history-list" class="history-list"></div></section>
  <div class="world-xp"><span id="world-xp-label">WORLD XP</span><b id="world-xp">0</b></div>
  <p class="today-foot" id="today-foot"></p>`;
app.appendChild(panel);

$('#today-close').onclick=()=>panel.classList.remove('open');
todayButton.onclick=()=>panel.classList.toggle('open');

function formatDate(iso){try{return new Date(iso).toLocaleDateString(lang()==='fr'?'fr-FR':'en-GB',{day:'2-digit',month:'short'})}catch{return'—'}}
function titleForEvent(e){
  const ids={squat10:{fr:'Squat 10',en:'Squat 10'},pushup10:{fr:'Pompes 10',en:'Push-up 10'},sitstand10:{fr:'Assis-debout 10',en:'Sit-to-Stand 10'},balance30:{fr:'Équilibre 30 s',en:'Balance 30 s'}};
  return ids[e.exercise_id]?.[lang()]||e.exercise_id;
}
function getState(){const es=events(),ar=arena(),daily=buildDailyQuests(snapshot,es,ar),program=buildProgramState(snapshot,es);return{es,ar,daily,program}}

function launchExercise(exerciseId,mode){
  panel.classList.remove('open');
  if(window.KomoMotionCamera?.open)window.KomoMotionCamera.open(exerciseId,mode);
  else $('#toast')&&(($('#toast').textContent='Motion Camera loading…'),$('#toast').classList.add('show'));
}

function render(){
  const {es,daily,program}=getState(),L=lang();
  $('#today-kicker').textContent=tx('today');$('#today-title').textContent=tx('yourDay');
  $('#today-quests-title').textContent=tx('quests');$('#today-week-title').textContent=tx('week');$('#today-history-title').textContent=tx('history');$('#world-xp-label').textContent=tx('worldXp');$('#world-xp').textContent=progress.worldXp||0;$('#today-foot').textContent=tx('motionScore');
  const p=$('#today-priority');p.innerHTML=`<small>${tx('priority')}</small><h3>${programTitle(program,L)}</h3><p>${program.why[L]||program.why.en}</p><div class="approval">${tx('approval')}</div>`;
  const completed=daily.quests.filter(q=>q.done).length;$('#today-count').textContent=`${completed} / ${daily.quests.length}`;todayButton.querySelector('span').textContent=tx('today');todayButton.querySelector('b').textContent=`${completed}/${daily.quests.length}`;todayButton.classList.toggle('complete',completed===daily.quests.length);
  $('#quest-list').innerHTML=daily.quests.map(q=>{
    const type=q.kind==='rehab'?tx('camera'):q.kind==='game'?tx('arena'):tx('activity');
    let detail='';
    if(q.id==='rehab')detail=exerciseTitle(program.primaryExercise,L);
    else if(q.id==='arena')detail=exerciseTitle(program.gameExercise,L);
    else detail=`${Number(q.steps).toLocaleString(L==='fr'?'fr-FR':'en-US')} / ${Number(q.stepGoal).toLocaleString(L==='fr'?'fr-FR':'en-US')} ${tx('steps')} · ${tx('gameGoal')}`;
    const action=q.done?tx('done'):q.kind==='activity'?(L==='fr'?`${Math.max(0,q.stepGoal-q.steps).toLocaleString('fr-FR')} ${tx('remaining')}`:`${Math.max(0,q.stepGoal-q.steps).toLocaleString('en-US')} ${tx('remaining')}`):tx('start');
    return `<div class="daily-quest ${q.done?'done':''}" data-quest="${q.id}"><div class="quest-check">${q.done?'✓':type.slice(0,1)}</div><div class="quest-copy"><b>${q.title[L]||q.title.en}</b><small>${detail} · +${q.rewardXp} XP</small></div><button class="quest-action" ${q.done||q.kind==='activity'?'disabled':''}>${action}</button></div>`;
  }).join('');
  $('#quest-list').querySelector('[data-quest="rehab"] .quest-action:not([disabled])')?.addEventListener('click',()=>launchExercise(program.primary,'rehab'));
  $('#quest-list').querySelector('[data-quest="arena"] .quest-action:not([disabled])')?.addEventListener('click',()=>launchExercise(program.game,'game'));
  const pr=program.progress;$('#week-bars').innerHTML=`<div class="week-line"><span>${tx('primary')} · ${exerciseTitle(program.primaryExercise,L)}</span><div class="week-track"><div class="week-fill" style="width:${Math.min(100,pr.primary/Math.max(1,pr.primaryTarget)*100)}%"></div></div><b>${pr.primary}/${pr.primaryTarget}</b></div><div class="week-line"><span>${tx('support')} · ${exerciseTitle(program.supportExercise,L)}</span><div class="week-track"><div class="week-fill" style="width:${Math.min(100,pr.support/Math.max(1,pr.supportTarget)*100)}%"></div></div><b>${pr.support}/${pr.supportTarget}</b></div>`;
  const hint=$('#progress-hint');hint.textContent=program.readyForReview?tx('review'):tx('noReview');hint.classList.toggle('ready',program.readyForReview);$('#rehab-streak').textContent=`${progress.rehabStreak||0} · ${tx('streak')}`;
  const recent=es.slice().reverse().slice(0,6);$('#history-count').textContent=`${es.length}`;$('#history-list').innerHTML=recent.length?recent.map(e=>`<div class="history-row"><div><b>${titleForEvent(e)}</b><small>${formatDate(e.created_at)} · ${e.kind==='rehab'?'REHAB':'ARENA'} · ${e.completed?'complete':'partial'}</small></div><strong>${e.exercise_id==='balance30'?`${Number(e.time_seconds||0).toFixed(1)}s`:`${e.reps||0} reps`} · ${e.quality_estimate||0}%</strong></div>`).join(''):`<div class="history-empty">${tx('empty')}</div>`;
}

function processNewEvents(){
  const es=events();let changed=false;
  for(const e of es){
    if(!e?.event_id||progress.processed.includes(e.event_id))continue;
    progress.processed.push(e.event_id);changed=true;
    if(!e.completed)continue;
    const xp=e.kind==='rehab'?30:20;progress.worldXp=(progress.worldXp||0)+xp;
    if(e.kind==='rehab'){
      const day=String(e.created_at||'').slice(0,10);
      if(day&&progress.lastRehabDay!==day){progress.rehabStreak=(progress.rehabStreak||0)+1;progress.lastRehabDay=day}
    }
  }
  const q=buildDailyQuests(snapshot,es,arena()).quests.find(x=>x.id==='steps');
  const day=today();if(q?.done&&!progress.rewardedStepDays.includes(day)){progress.rewardedStepDays.push(day);progress.worldXp=(progress.worldXp||0)+(q.rewardXp||10);changed=true}
  progress.processed=progress.processed.slice(-150);progress.rewardedStepDays=progress.rewardedStepDays.slice(-60);
  if(changed){saveProgress();render();const toast=$('#toast');if(toast){toast.textContent=lang()==='fr'?`Progression mise à jour · ${progress.worldXp} World XP`:`Progress updated · ${progress.worldXp} World XP`;toast.classList.add('show');clearTimeout(processNewEvents.timer);processNewEvents.timer=setTimeout(()=>toast.classList.remove('show'),1700)}}
}

function injectRehabProgram(){
  const basePanel=$('#panel'),body=$('#panel-body');if(!basePanel?.classList.contains('open')||$('#panel-kicker')?.textContent?.trim()!=='REHAB'||!body)return;
  setTimeout(()=>{
    const {program}=getState(),L=lang();body.querySelector('#rehab-camera-launch')?.remove();body.querySelector('#rehab-program-v10')?.remove();
    const card=document.createElement('div');card.id='rehab-program-v10';card.className='rehab-program-card';card.innerHTML=`<span>${tx('rehabTitle')}</span><h3>${programTitle(program,L)}</h3><p>${program.why[L]||program.why.en}</p><div class="rehab-program-actions"><button class="rehab-start">${tx('start')} · ${exerciseTitle(program.primaryExercise,L)}</button><button class="rehab-today">${tx('openToday')}</button></div>`;body.appendChild(card);card.querySelector('.rehab-start').onclick=()=>launchExercise(program.primary,'rehab');card.querySelector('.rehab-today').onclick=()=>panel.classList.add('open');
  },40);
}
const basePanel=$('#panel');if(basePanel)new MutationObserver(injectRehabProgram).observe(basePanel,{attributes:true,attributeFilter:['class']});

$('#language-toggle')?.addEventListener('click',()=>requestAnimationFrame(()=>{render();injectRehabProgram()}));
const motionResult=$('#motion-result');if(motionResult)new MutationObserver(()=>{if(motionResult.classList.contains('open'))setTimeout(processNewEvents,120)}).observe(motionResult,{attributes:true,attributeFilter:['class']});
setInterval(processNewEvents,1200);
processNewEvents();render();
window.KomoWorldToday={open:()=>{render();panel.classList.add('open')},state:()=>getState(),progress:()=>({...progress})};
