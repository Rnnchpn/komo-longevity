const $=(s,r=document)=>r.querySelector(s);
const app=$('#app');
if(!app)throw new Error('KŌMØ World V0.10.2 could not attach');
const arenaHud=$('#arena-hud');
const lang=()=>document.documentElement.lang==='en'?'en':'fr';

const copy={
  fr:{challenges:'Défis',ranking:'Classement',arena:'KŌMØ Arena',subtitle:'Jouez quand vous voulez.',daily:'DÉFI DU JOUR',dailyTitle:'Balance Hold · 60 s',dailyCopy:'Le défi quotidien reste un événement séparé. Il rapporte des points Arena et peut changer chaque jour.',playDaily:'Jouer le Daily',free:'DÉFIS LIBRES',freeCopy:'Choisissez un mouvement, puis un objectif fixe ou un mode maximum. Vous pouvez rejouer autant que vous voulez.',fixed:'Objectif',max:'Maximum 60 s',points:'Points',fixedPoints:'40 pts de complétion + répétitions + bonus qualité',maxPoints:'20 pts de départ + 6 pts / répétition + bonus qualité',balancePoints:'20 pts + durée + bonus stabilité',safe:'Les points récompensent uniquement la participation et la performance du mini-jeu. Ils ne modifient jamais le Motion Score et ne créent aucun classement de santé.',squat:'Squats',squatCopy:'Flexion-extension contrôlée. Cadrage 30–45° ou profil léger.',pushup:'Pompes',pushupCopy:'Pompes contrôlées, téléphone bas et de profil.',sitstand:'Assis-debout',sitstandCopy:'Levers de chaise. Peut être joué librement dans l’Arena ou utilisé séparément en Rehab.',balance:'Équilibre',balanceCopy:'Maintien face caméra avec stabilité estimée.',ten:'10 répétitions',twenty:'20 répétitions',thirtySec:'30 secondes',sixtySec:'60 secondes',board:'CLASSEMENT ARENA',boardCopy:'Scores de jeu uniquement · aucune donnée clinique.',close:'Fermer'},
  en:{challenges:'Challenges',ranking:'Leaderboard',arena:'KŌMŌ Arena',subtitle:'Play whenever you want.',daily:"TODAY'S CHALLENGE",dailyTitle:'Balance Hold · 60 s',dailyCopy:'The daily challenge remains a separate event. It earns Arena points and can change each day.',playDaily:'Play Daily',free:'FREE CHALLENGES',freeCopy:'Choose a movement, then a fixed goal or a maximum mode. Replay as often as you want.',fixed:'Goal',max:'Maximum · 60 s',points:'Points',fixedPoints:'40 completion pts + repetitions + quality bonus',maxPoints:'20 starting pts + 6 pts / repetition + quality bonus',balancePoints:'20 pts + duration + stability bonus',safe:'Points reward participation and mini-game performance only. They never modify Motion Score and never create a health leaderboard.',squat:'Squats',squatCopy:'Controlled squat. Use a 30–45° or slight side view.',pushup:'Push-ups',pushupCopy:'Controlled push-ups with the phone low and side-on.',sitstand:'Sit-to-Stand',sitstandCopy:'Chair rises. Play freely in Arena or use separately in Rehab.',balance:'Balance',balanceCopy:'Front-facing hold with estimated stability.',ten:'10 repetitions',twenty:'20 repetitions',thirtySec:'30 seconds',sixtySec:'60 seconds',board:'ARENA LEADERBOARD',boardCopy:'Game scores only · no clinical data.',close:'Close'}
};
const t=k=>copy[lang()][k]||k;

const quick=document.createElement('div');
quick.className='arena-quick';quick.id='arena-quick';
quick.innerHTML='<button class="primary" id="arena-open-challenges"></button><button id="arena-open-ranking"></button>';
app.appendChild(quick);

const sheet=document.createElement('section');
sheet.className='arena-sheet';sheet.id='arena-sheet';
sheet.innerHTML=`<div class="arena-sheet-card">
  <div class="arena-sheet-head"><div><span>KŌMØ ARENA · FREE PLAY</span><h2 id="arena-sheet-title"></h2></div><button class="arena-sheet-close" id="arena-sheet-close">×</button></div>
  <div class="arena-tabs"><button class="active" data-arena-tab="challenges"></button><button data-arena-tab="ranking"></button></div>
  <div class="arena-tab-panel active" data-arena-panel="challenges">
    <div class="daily-mini"><div><span id="v102-daily-label"></span><h3 id="v102-daily-title"></h3><p id="v102-daily-copy"></p></div><button id="v102-daily-play"></button></div>
    <div class="arena-sheet-head" style="border:0;padding:3px 0 11px"><div><span id="v102-free-label"></span><h2 id="v102-free-title" style="font-size:20px"></h2></div></div>
    <div class="challenge-catalog" id="challenge-catalog"></div>
    <p class="arena-safety" id="arena-safety"></p>
  </div>
  <div class="arena-tab-panel" data-arena-panel="ranking"><div class="arena-sheet-head" style="border:0;padding:4px 0 12px"><div><span id="v102-board-label"></span><h2 id="v102-board-title" style="font-size:20px"></h2></div></div><div class="compact-board" id="compact-board"></div></div>
</div>`;
app.appendChild(sheet);

const challengeDefs=[
  {id:'squat10',icon:'↕',name:'squat',copy:'squatCopy',modes:[{label:'ten',opts:{mode:'fixed',targetReps:10}},{label:'max',opts:{mode:'max',maxSeconds:60}}],points:['fixedPoints','maxPoints']},
  {id:'pushup10',icon:'—',name:'pushup',copy:'pushupCopy',modes:[{label:'ten',opts:{mode:'fixed',targetReps:10}},{label:'max',opts:{mode:'max',maxSeconds:60}}],points:['fixedPoints','maxPoints']},
  {id:'sitstand10',icon:'↟',name:'sitstand',copy:'sitstandCopy',modes:[{label:'ten',opts:{mode:'fixed',targetReps:10}},{label:'max',opts:{mode:'max',maxSeconds:60}}],points:['fixedPoints','maxPoints']},
  {id:'balance30',icon:'◎',name:'balance',copy:'balanceCopy',modes:[{label:'thirtySec',opts:{mode:'fixed',targetSeconds:30}},{label:'sixtySec',opts:{mode:'fixed',targetSeconds:60}}],points:['balancePoints','balancePoints']}
];

function renderCatalog(){
  const catalog=$('#challenge-catalog');
  catalog.innerHTML=challengeDefs.map(c=>`<article class="free-challenge"><div class="free-challenge-head"><div><h3>${t(c.name)}</h3><p>${t(c.copy)}</p></div><div class="challenge-icon">${c.icon}</div></div><div class="challenge-modes">${c.modes.map((m,i)=>`<button class="challenge-mode ${m.opts.mode==='max'?'max':''}" data-exercise="${c.id}" data-mode-index="${i}"><b>${m.opts.mode==='max'?t('max'):`${t('fixed')} · ${t(m.label)}`}</b><small>${t(c.points[i])}</small></button>`).join('')}</div><div class="challenge-points"><span>${t('points')}</span><b>${c.modes.some(m=>m.opts.mode==='max')?'REPLAY ∞':'FREE PLAY'}</b></div></article>`).join('');
  catalog.querySelectorAll('[data-exercise]').forEach(btn=>btn.onclick=()=>{
    const def=challengeDefs.find(x=>x.id===btn.dataset.exercise);const mode=def?.modes?.[Number(btn.dataset.modeIndex)];
    if(!def||!mode)return;
    closeSheet();
    window.KomoMotionCamera?.open(def.id,'game',mode.opts);
  });
}
function renderRanking(){const src=$('#leaderboard');$('#compact-board').innerHTML=src?.innerHTML||'<div class="history-empty">—</div>'}
function setTab(id){sheet.querySelectorAll('[data-arena-tab]').forEach(b=>b.classList.toggle('active',b.dataset.arenaTab===id));sheet.querySelectorAll('[data-arena-panel]').forEach(p=>p.classList.toggle('active',p.dataset.arenaPanel===id));if(id==='ranking')renderRanking()}
function openSheet(tab='challenges'){renderText();setTab(tab);sheet.classList.add('open')}
function closeSheet(){sheet.classList.remove('open')}

function renderText(){
  $('#arena-open-challenges').textContent=t('challenges');$('#arena-open-ranking').textContent=t('ranking');$('#arena-sheet-title').textContent=`${t('arena')} · ${t('subtitle')}`;
  sheet.querySelector('[data-arena-tab="challenges"]').textContent=t('challenges');sheet.querySelector('[data-arena-tab="ranking"]').textContent=t('ranking');
  $('#v102-daily-label').textContent=t('daily');$('#v102-daily-title').textContent=t('dailyTitle');$('#v102-daily-copy').textContent=t('dailyCopy');$('#v102-daily-play').textContent=t('playDaily');
  $('#v102-free-label').textContent=t('free');$('#v102-free-title').textContent=t('freeCopy');$('#arena-safety').textContent=t('safe');
  $('#v102-board-label').textContent=t('board');$('#v102-board-title').textContent=t('boardCopy');renderCatalog();
}

$('#arena-open-challenges').onclick=()=>openSheet('challenges');$('#arena-open-ranking').onclick=()=>openSheet('ranking');$('#arena-sheet-close').onclick=closeSheet;
sheet.addEventListener('click',e=>{if(e.target===sheet)closeSheet()});sheet.querySelectorAll('[data-arena-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.arenaTab));
$('#v102-daily-play').onclick=()=>{closeSheet();$('#challenge-start')?.click()};
$('#language-toggle')?.addEventListener('click',()=>requestAnimationFrame(renderText));

function syncArena(){const open=arenaHud?.classList.contains('open');const blocked=$('#motion-camera')?.classList.contains('open')||$('#challenge')?.classList.contains('open')||$('#result')?.classList.contains('open');quick.classList.toggle('open',!!open&&!blocked);if(!open)closeSheet()}
if(arenaHud)new MutationObserver(syncArena).observe(arenaHud,{attributes:true,attributeFilter:['class']});
['#motion-camera','#challenge','#result'].forEach(sel=>{const n=$(sel);if(n)new MutationObserver(syncArena).observe(n,{attributes:true,attributeFilter:['class']})});

renderText();syncArena();
window.KomoArenaFreePlay={openChallenges:()=>openSheet('challenges'),openRanking:()=>openSheet('ranking'),challenges:()=>challengeDefs.map(x=>({id:x.id,modes:x.modes}))};
