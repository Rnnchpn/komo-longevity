import { TwinCore } from '../v04/twin-core.js';
import { buildProgramState, programTitle } from '../v10/rehab-program.js';

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const app=$('#app');
if(!app)throw new Error('KŌMØ World V0.11.2 could not attach');
app.dataset.visualPolish='v112';

const EVENTS_KEY='komo_motion_camera_events_v1';
const PROGRESS_KEY='komo_world_progress_v10';
const lang=()=>document.documentElement.lang==='en'?'en':'fr';
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}};
const events=()=>read(EVENTS_KEY,[]).filter(Boolean);
const progress=()=>read(PROGRESS_KEY,{worldXp:0,rehabStreak:0});
const core=new TwinCore();
try{core.setTimeIndex(2,'v112')}catch{}
const snapshot=core.current?.()||core.snapshots?.at(-1)||{};
let decorating=false;

const copy={
  fr:{fitnessEyebrow:'KŌMØ FITNESS FLOOR · ENTRAÎNEMENT LIBRE',fitnessTitle:'Bougez. Battez vos records.',fitnessCopy:'Choisissez une station, posez le téléphone et transformez chaque mouvement validé en progression de jeu.',fitnessMetric:'WORLD XP',fitnessMetricSub:'entraînement & défis',stations:'STATIONS DE MOUVEMENT',rehabEyebrow:'KŌMØ REHAB LAB · GUIDÉ PAR LE TWIN',rehabTitle:'Travaillez ce qui compte maintenant.',rehabCopy:'Votre programme est construit autour de la priorité fonctionnelle actuelle, puis suivi dans le temps sans modifier artificiellement vos mesures cliniques.',rehabMetric:'PRIORITÉ',rehabMetricSub:'programme actuel',program:'PROGRAMME & PROGRESSION'},
  en:{fitnessEyebrow:'KŌMŌ FITNESS FLOOR · FREE TRAINING',fitnessTitle:'Move. Beat your records.',fitnessCopy:'Choose a station, place your phone and turn every validated movement into game progression.',fitnessMetric:'WORLD XP',fitnessMetricSub:'training & challenges',stations:'MOVEMENT STATIONS',rehabEyebrow:'KŌMŌ REHAB LAB · TWIN-GUIDED',rehabTitle:'Train what matters now.',rehabCopy:'Your program is built around the current functional priority, then followed over time without artificially changing clinical measurements.',rehabMetric:'PRIORITY',rehabMetricSub:'current program',program:'PROGRAM & PROGRESSION'}
};
const t=k=>copy[lang()][k]||k;

function completed(kind){return events().filter(e=>e?.completed&&e.kind===kind)}
function currentProgram(){return buildProgramState(snapshot,events())}

function hero(type){
  const n=document.createElement('section');n.className=`v112-room-hero ${type}`;n.dataset.v112Hero='1';
  if(type==='fitness'){
    const xp=Number(progress().worldXp||0);
    n.innerHTML=`<div><span class="eyebrow">${t('fitnessEyebrow')}</span><h3>${t('fitnessTitle')}</h3><p>${t('fitnessCopy')}</p></div><div class="v112-hero-metric"><span>${t('fitnessMetric')}</span><strong>${xp}</strong><small>${t('fitnessMetricSub')}</small></div>`;
  }else{
    const p=currentProgram();
    const title=programTitle(p,lang());
    n.innerHTML=`<div><span class="eyebrow">${t('rehabEyebrow')}</span><h3>${t('rehabTitle')}</h3><p>${t('rehabCopy')}</p></div><div class="v112-hero-metric"><span>${t('rehabMetric')}</span><strong style="font-size:20px;line-height:1.05">${title}</strong><small>${t('rehabMetricSub')}</small></div>`;
  }
  return n;
}

function sectionLabel(text){const n=document.createElement('div');n.className='v112-section-label';n.innerHTML=`<span>${text}</span><i></i>`;return n}

function decorateFitness(){
  const body=$('#fitness-room-body');if(!body||decorating)return;
  decorating=true;
  try{
    if(!body.querySelector('[data-v112-hero]'))body.insertBefore(hero('fitness'),body.firstChild);
    const grid=$('.station-grid',body);
    if(grid&&!grid.previousElementSibling?.classList.contains('v112-section-label'))grid.parentNode.insertBefore(sectionLabel(t('stations')),grid);
    $$('.station',body).forEach((st,i)=>{st.dataset.stationIndex=String(i+1);const h=$('h3',st);if(h&&!h.dataset.v112Index){h.dataset.v112Index='1';h.insertAdjacentHTML('beforebegin',`<small style="display:block;margin-bottom:3px;color:rgba(244,239,229,.34);font:700 6px Arial;letter-spacing:.16em">STATION 0${i+1}</small>`)}});
  }finally{decorating=false}
}

function decorateRehab(){
  const body=$('#rehab-room-body');if(!body||decorating)return;
  decorating=true;
  try{
    if(!body.querySelector('[data-v112-hero]'))body.insertBefore(hero('rehab'),body.firstChild);
    const layout=$('.rehab-layout',body);
    if(layout&&!layout.previousElementSibling?.classList.contains('v112-section-label'))layout.parentNode.insertBefore(sectionLabel(t('program')),layout);
  }finally{decorating=false}
}

function decorateHub(){
  const hub=$('#center-hub');if(!hub)return;
  const title=$('#hub-title');if(title)title.style.maxWidth='520px';
  $$('.center-choice',hub).forEach((choice,i)=>{if(choice.dataset.v112Marked)return;choice.dataset.v112Marked='1';choice.insertAdjacentHTML('afterbegin',`<span style="position:absolute;right:20px;bottom:18px;font:400 40px Georgia,serif;color:rgba(244,239,229,.07);pointer-events:none">0${i+1}</span>`)})
}

function refresh(){decorateHub();decorateFitness();decorateRehab()}

['#fitness-room-body','#rehab-room-body'].forEach(sel=>{
  const body=$(sel);if(!body)return;
  new MutationObserver(()=>{if(decorating)return;requestAnimationFrame(refresh)}).observe(body,{childList:true});
});

$('#language-toggle')?.addEventListener('click',()=>setTimeout(()=>{['#fitness-room-body','#rehab-room-body'].forEach(sel=>{const b=$(sel);b?.querySelector('[data-v112-hero]')?.remove();b?.querySelectorAll('.v112-section-label').forEach(n=>n.remove())});refresh()},30));

const center=$('#center-hub'),fitness=$('#fitness-room'),rehab=$('#rehab-room');
[center,fitness,rehab].filter(Boolean).forEach(n=>new MutationObserver(()=>{if(n.classList.contains('open'))requestAnimationFrame(refresh)}).observe(n,{attributes:true,attributeFilter:['class']}));

refresh();
window.KomoVisualPolish={...(window.KomoVisualPolish||{}),version:'0.11.2',refresh};
