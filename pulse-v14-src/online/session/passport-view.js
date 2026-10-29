import {buildMotionPassport,priorityNarrative,DAILY_EXERCISES,planTargets,dayIndex,weekForDay,programProgress,createDailyProgram} from './motion-passport.mjs';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>Number.isFinite(x)?Math.round(x*10)/10+'':'—';
const today=()=>{
 const d=new Date(),pad=n=>String(n).padStart(2,'0');
 return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
};
export function passportMarkup(answers,results,blocked){
 const p=buildMotionPassport(answers,results,blocked);
 return '<section class="passport-hero" aria-label="Votre passeport Motion">'+
 '<div class="passport-top"><span class="overline">KŌMØ / MOTION PASSPORT</span><span class="passport-stamp">BILAN DE DÉPART · NON MÉDICAL</span></div>'+
 '<div class="passport-columns"><div class="passport-score"><small>INDICE DE MOBILITÉ PERÇUE</small>'+
 '<div class="passport-big">'+(p.index===null?'—':fmt(p.index))+'<span>/100</span></div>'+
 '<p>Issu des questionnaires, non d’un calcul d’espérance de vie.</p></div>'+
 '<div class="passport-lead"><h2>Votre longévité locomotrice commence par le mouvement.</h2>'+
 '<p>'+e(p.interpretation)+'</p>'+
 '<p class="passport-caveat">'+e(p.message)+'</p>'+
 '<div class="passport-observed"><strong>'+p.measuredCount+' / 6</strong><span>tests avec observation</span>'+
 '<strong>'+p.flaggedCount+'</strong><span>mesures à vérifier</span></div></div></div>'+
 '<div class="passport-bars">'+p.domains.map(d=>
  '<div class="passport-bar"><div><strong>'+e(d.title)+'</strong><span>'+e(d.label)+'</span></div>'+
  '<div class="passport-bar-track"><i style="width:'+(d.value??0)+'%"></i></div>'+
  '<small>'+(d.value===null?'—':fmt(d.value))+'/100</small></div>'
 ).join('')+'</div>'+
 '<div class="passport-footnote">Les catégories « à développer / à entretenir » sont des repères éditoriaux de suivi, pas des normes cliniques validées.</div>'+
 '</section>';
}
export function roadmapMarkup(answers,results,blocked){
 const p=buildMotionPassport(answers,results,blocked);
 return '<section class="roadmap" aria-label="Priorités et prochaines étapes">'+
 '<div class="roadmap-heading"><span class="overline">INTERPRÉTATION PERSONNALISÉE</span><h2>Ce que vos résultats invitent à travailler</h2>'+
 '<p>Des observations pour construire une trajectoire, sans comparer artificiellement vos réponses à une espérance de vie.</p></div>'+
 '<div class="roadmap-domains">'+p.domains.map(d=>
  '<article class="roadmap-domain"><div class="roadmap-domain-head"><strong>'+e(d.title)+'</strong>'+
  '<span class="roadmap-domain-tag '+e(d.tone)+'">'+e(d.label)+'</span></div>'+
  '<p>'+e(d.caption)+'.</p><p>'+e(d.why)+'</p>'+
  '<p class="roadmap-step"><b>Piste d’action :</b> '+e(d.action)+'</p></article>'
 ).join('')+'</div>'+
 '<div class="roadmap-priorities"><strong>Vos deux axes prioritaires</strong>'+
 '<p>'+e(priorityNarrative(p))+'</p></div>'+
 '<div class="roadmap-next"><h2>À partir d’ici, deux chemins possibles</h2>'+
 '<div class="roadmap-choices"><article><span>01 / APPROFONDIR</span><h3>Bilan Motion complémentaire</h3>'+
 '<p>À Paris ou Cannes : analyse instrumentée de la force, des amplitudes et de la marche, puis échange individualisé.</p>'+
 '<a class="roadmap-btn" target="_blank" rel="noopener noreferrer" href="https://app.acuityscheduling.com/schedule.php?owner=40696577">Voir les consultations disponibles</a></article>'+
 '<article><span>02 / PROGRESSER</span><h3>Pulse Daily · 4 semaines</h3>'+
 '<p>Une routine douce, un journal quotidien à remplir, des étapes progressives et un point de contrôle à 4–6 semaines.</p>'+
 '<a class="roadmap-btn secondary" href="#pulse-daily">Découvrir mon programme ↓</a></article></div></div></section>';
}
const itemsHtml=(program,day,week)=>{
 const date=today(),entry=program?.entries?.[date]||{completed:[],effort:null,note:''};
 const weekPlan=planTargets(week);
 const doses={
  walk:weekPlan.walkMinutes+' min accessibles',
  chair:weekPlan.chairRepeats+' levers si confortables',
  balance:weekPlan.balanceSeconds+' s avec appui',
  mobility:weekPlan.mobilityMinutes+' min',
  recover:'2 min de pause attentive'
 };
 return '<div class="daily-week"><strong>Semaine '+week+' / 4 · Jour '+day+' / 28</strong>'+
 '<p>Progression indicative : rester à une semaine antérieure si la séance semble difficile. Aucun exercice ne doit déclencher de douleur inhabituelle.</p></div>'+
 '<fieldset class="daily-checklist"><legend>Mes activités du jour · '+e(date)+'</legend>'+
 DAILY_EXERCISES.map(ex=>'<label class="daily-task"><input type="checkbox" data-daily-exercise="'+ex.id+'" '+
 (entry.completed?.includes(ex.id)?'checked':'')+'>'+
 '<span><strong>'+e(ex.title)+'</strong><small>'+e(doses[ex.id])+'</small>'+
 '<em>'+e(ex.instruction)+'</em></span></label>').join('')+'</fieldset>'+
 '<div class="daily-checkin"><label>Mon effort ressenti après la séance <small>(0 = très facile, 10 = maximal)</small>'+
 '<select id="daily-effort"><option value="">Choisir</option>'+
 Array.from({length:11},(_,i)=>'<option value="'+i+'" '+(entry.effort===i?'selected':'')+'>'+i+' / 10</option>').join('')+'</select></label>'+
 '<label>Ce que je remarque aujourd’hui <small>(facultatif · 160 caractères)</small>'+
 '<textarea id="daily-note" rows="2" maxlength="160" placeholder="Marche plus aisée, fatigue, stabilité, difficulté…">'+e(entry.note||'')+'</textarea></label></div>'+
 '<p class="daily-save-feedback" id="daily-save-feedback" role="status"></p>'+
 '<button type="button" class="action" id="daily-save">Enregistrer ma journée</button>';
};
export function dailyProgramMarkup(answers,results,blocked,program=null){
 const passport=buildMotionPassport(answers,results,blocked);
 const canStart=passport.planStatus==='eligible';
 const record=program?.version==='KOMO_PULSE_DAILY_V1'?program:null;
 const date=today(),day=record?dayIndex(record.startedAt,date):1,week=weekForDay(day);
 const progress=programProgress(record);
 return '<section id="pulse-daily" class="pulse-daily">'+
 '<div class="daily-heading"><span class="overline">PULSE · DAILY</span><h2>Un petit mouvement, chaque jour.</h2>'+
 '<p>Votre premier cycle guidé de 28 jours. La séance est auto-déclarée : elle n’évalue ni une guérison, ni une efficacité clinique.</p></div>'+
 (canStart?(!record?
 '<div class="daily-welcome"><strong>Démarrer votre cycle 4 semaines</strong><p>Marche, levers adaptés, équilibre avec appui, mobilité douce et récupération. Commencez à votre rythme, dans un environnement sécurisé.</p>'+
 '<button type="button" class="action" id="start-pulse-daily">Activer mon journal Pulse Daily</button></div>':
 '<div class="daily-live"><div class="daily-progress"><strong>'+progress.daysLogged+' / 28</strong><span>jours avec une activité cochée</span>'+
 '<div class="daily-track"><i style="width:'+progress.percent+'%"></i></div></div>'+
 itemsHtml(record,day,week)+'</div>'):
 '<div class="daily-hold"><strong>Programme autonome non proposé pour l’instant</strong>'+
 '<p>'+e(priorityNarrative(passport))+'</p>'+
 '<p>Un échange en consultation permet d’adapter les exercices à votre situation.</p></div>')+
 '<p class="daily-disclaimer">Arrêtez en cas de douleur inhabituelle, malaise, essoufflement disproportionné ou perte d’équilibre. Les exercices ne remplacent ni une consultation ni une rééducation prescrite.</p></section>';
}
export function bindDailyProgram(root,answers,results,blocked,getProgram,onUpdate){
 const holder=root.querySelector('#pulse-daily');if(!holder)return;
 const rerender=()=>{
  holder.outerHTML=dailyProgramMarkup(answers,results,blocked,getProgram());
  wire();
 };
 function wire(){
  const start=root.querySelector('#start-pulse-daily');
  if(start)start.onclick=()=>{
   const passport=buildMotionPassport(answers,results,blocked);
   if(passport.planStatus!=='eligible')return;
   onUpdate(createDailyProgram(today()));rerender();
  };
  const save=root.querySelector('#daily-save');if(!save)return;
  save.onclick=()=>{
   const program=getProgram();
   if(!program||program.version!=='KOMO_PULSE_DAILY_V1')return;
   const date=today();
   const completed=[...root.querySelectorAll('[data-daily-exercise]:checked')]
    .map(x=>x.dataset.dailyExercise).filter(x=>DAILY_EXERCISES.some(e=>e.id===x));
   const effortRaw=root.querySelector('#daily-effort')?.value||'';
   const effort=effortRaw===''?null:Number(effortRaw);
   if(effort!==null&&(!Number.isInteger(effort)||effort<0||effort>10))return;
   const note=(root.querySelector('#daily-note')?.value||'').trim().slice(0,160);
   const next={...program,entries:{...program.entries,
    [date]:{completed,effort,note}}};
   onUpdate(next);rerender();
   const status=root.querySelector('#daily-save-feedback');
   if(status)status.textContent='Journée enregistrée. Votre progression pourra être revue au prochain bilan.';
  };
 }
 wire();
}
