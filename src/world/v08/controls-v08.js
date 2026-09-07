const storageKey='komo_world_controls_v08';
const localeKey='komo_world_locale_v08';
const labels={forward:'Move Forward',backward:'Move Backward',left:'Move Left',right:'Move Right',sprint:'Sprint',interact:'Interact'};
const defaults={forward:'w',backward:'s',left:'a',right:'d',sprint:'shift',interact:'e'};
const keyName=(key)=>({arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',' ':'Space',escape:'Esc',shift:'Shift',control:'Ctrl',alt:'Alt'}[key]||(key&&key.length===1?key.toUpperCase():key));
const normalize=(event)=>event.key===' '?' ':event.key.toLowerCase();
function read(){try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return{}}}
function write(data){localStorage.setItem(storageKey,JSON.stringify(data))}

// -----------------------------------------------------------------------------
// FR / EN — one world, one runtime, two languages.
// -----------------------------------------------------------------------------
let locale=localStorage.getItem(localeKey)||((navigator.language||'').toLowerCase().startsWith('fr')?'fr':'en');
const dictionaries={
  fr:{
    'CORE ISLAND · SEASON 01':'ÎLE CENTRALE · SAISON 01',
    'Your body.':'Votre corps.', 'Your world.':'Votre monde.',
    "Start at the KŌMØ Desk, inspect your Functional Digital Twin, then enter the Arena for today's challenge.":"Commencez au KŌMØ Desk, explorez votre jumeau fonctionnel, puis entrez dans l’Arena pour le défi du jour.",
    '01 · Reach the KŌMØ Desk':'01 · Rejoindre le KŌMØ Desk',
    '02 · Inspect your Functional Digital Twin':'02 · Explorer votre jumeau fonctionnel',
    '03 · Enter KŌMØ Arena':'03 · Entrer dans la KŌMØ Arena',
    'Enter KŌMØ World':'Entrer dans KŌMØ World',
    'Interact':'Interagir','Approach a destination':'Approchez-vous d’un point d’intérêt',
    'Welcome':'Bienvenue','Good evening.':'Bonsoir.','Your next move':'Votre prochaine étape',
    'Overview':'Vue d’ensemble','Body':'Corps','Compare':'Comparer','Sources':'Sources','Leave Lab':'Quitter le Lab',
    'CURRENT PRIORITY':'PRIORITÉ ACTUELLE','Left quadriceps':'Quadriceps gauche','symmetry':'symétrie',
    'Residual asymmetry persists, with clear longitudinal improvement.':'Une asymétrie résiduelle persiste, avec une nette amélioration longitudinale.',
    'Compare with baseline':'Comparer à la baseline','Continue to Arena':'Continuer vers l’Arena',
    'FUNCTIONAL DOMAINS':'DOMAINES FONCTIONNELS','Current · Δ baseline':'Actuel · Δ baseline','KEY SIGNALS':'SIGNAUX CLÉS','Measured / derived':'Mesuré / dérivé',
    'LEFT QUADRICEPS':'QUADRICEPS GAUCHE','GAIT':'MARCHE','STRENGTH':'FORCE','LONGITUDINAL COMPARISON':'COMPARAISON LONGITUDINALE','Today':'Aujourd’hui','TODAY':'AUJOURD’HUI',
    'DATA PROVENANCE':'PROVENANCE DES DONNÉES','LONGITUDINAL TIME':'TEMPS LONGITUDINAL','Day 30':'J30',
    'Move. Compete. Progress.':'Bougez. Jouez. Progressez.','Daily best':'Meilleur du jour','Your streak':'Votre série','Leave Arena':'Quitter l’Arena',
    "TODAY'S CHALLENGE":'DÉFI DU JOUR','Balance Hold':'Balance Hold','Keep the marker inside the stability zone. Small corrections score better than large corrections.':'Gardez le point dans la zone de stabilité. Les petites corrections rapportent davantage.',
    'Target':'Objectif','Reward':'Récompense','Daily':'Quotidien','Start challenge':'Lancer le défi','DAILY LEADERBOARD':'CLASSEMENT DU JOUR',
    'Challenge score only · no health ranking':'Score du défi uniquement · aucun classement santé','YOUR BEST':'VOTRE RECORD','Unranked':'Non classé',
    'Stability':'Stabilité','Corrections':'Corrections','Live score':'Score live','Desktop: use your Left/Right bindings. Mobile: use the movement joystick.':'Desktop : utilisez vos commandes gauche/droite. Mobile : utilisez le joystick.',
    'End challenge':'Terminer le défi','DAILY CHALLENGE COMPLETE':'DÉFI TERMINÉ','New personal best.':'Nouveau record personnel.','Balance time':'Temps','Rank':'Rang','Back to Arena':'Retour à l’Arena',
    'PLAYER CONTROLS':'CONTRÔLES JOUEUR','Move your way.':'Déplacez-vous comme vous voulez.','Arrows':'Flèches','KEY BINDINGS':'TOUCHES','CAMERA':'CAMÉRA',
    'Horizontal sensitivity':'Sensibilité horizontale','Vertical sensitivity':'Sensibilité verticale','Camera distance':'Distance caméra','Invert vertical axis':'Inverser l’axe vertical',
    'Reset defaults':'Réinitialiser','Saved automatically on this device':'Sauvegardé sur cet appareil',
    'Move Forward':'Avancer','Move Backward':'Reculer','Move Left':'Aller à gauche','Move Right':'Aller à droite','Sprint':'Courir','Press key':'Appuyez sur une touche',
    'Tap a key to remap it. The world reloads once to apply your new controls.':'Cliquez sur une commande puis appuyez sur la touche souhaitée.',
    'Talk to KŌMØ Concierge':'Parler au concierge KŌMØ','Orientation · Twin · Arena':'Orientation · Twin · Arena','Enter Twin Lab':'Entrer dans le Twin Lab','Your body across time':'Votre corps à travers le temps',
    'Enter KŌMØ Arena':'Entrer dans la KŌMØ Arena','Daily Challenge · leaderboard':'Défi quotidien · classement','Enter Rehab':'Entrer dans Rehab','Coach Agent · next build':'Coach Agent · prochaine étape',
    'Enter Library':'Entrer dans la Library','Knowledge · planned':'Connaissance · à venir','Inspect Twin':'Explorer le Twin','Body · timeline · provenance':'Corps · timeline · provenance',
    'Motion Score 84. Motion Age 39. Your current private priority is the left quadriceps. Inspect the Twin, then try today’s Arena challenge.':'Motion Score 84. Motion Age 39. Votre priorité privée actuelle concerne le quadriceps gauche. Explorez le Twin, puis essayez le défi Arena du jour.',
    'Your current demo snapshot is stable. The strongest current priority is the left lower limb. Start with the Functional Digital Twin before entering Rehab.':'Votre snapshot actuel est stable. La priorité principale concerne le membre inférieur gauche. Commencez par le jumeau fonctionnel avant Rehab.',
    'Control saved · reloading':'Commande enregistrée · rechargement'
  }
};
const fr=dictionaries.fr;
function translateText(text){
  if(locale!=='fr'||!text)return text;
  const trimmed=text.trim();
  return fr[trimmed]||text;
}
function translateTextNode(child){
  if(!child||child.nodeType!==3||!child.nodeValue||!child.nodeValue.trim())return;
  if(!child.__komoOriginal)child.__komoOriginal=child.nodeValue;
  const original=child.__komoOriginal;
  const next=locale==='fr'?translateText(original):original;
  if(child.nodeValue!==next)child.nodeValue=next;
}
function translateElement(node){
  if(!node||node.nodeType!==1)return;
  if(['SCRIPT','STYLE','CANVAS','INPUT'].includes(node.tagName))return;
  Array.from(node.childNodes).forEach(translateTextNode);
  node.querySelectorAll?.('*').forEach(el=>{
    if(['SCRIPT','STYLE','CANVAS','INPUT'].includes(el.tagName))return;
    Array.from(el.childNodes).forEach(translateTextNode);
  });
}
function applyLocale(){
  document.documentElement.lang=locale;
  translateElement(document.body);
  const toggle=document.querySelector('#komo-language-toggle');
  if(toggle)toggle.textContent=locale.toUpperCase();
  renderBindings();
}

const languageButton=document.createElement('button');
languageButton.id='komo-language-toggle';languageButton.className='komo-language-toggle';languageButton.textContent=locale.toUpperCase();
languageButton.setAttribute('aria-label','FR / EN');
languageButton.addEventListener('click',()=>{locale=locale==='fr'?'en':'fr';localStorage.setItem(localeKey,locale);location.reload()});
const header=document.querySelector('.hud');if(header)header.appendChild(languageButton);

const localeObserver=new MutationObserver(mutations=>{
  for(const mutation of mutations){
    mutation.addedNodes.forEach(node=>{if(node.nodeType===1)translateElement(node)});
    if(mutation.type==='characterData'&&mutation.target.parentElement)translateElement(mutation.target.parentElement);
  }
});
localeObserver.observe(document.body,{subtree:true,childList:true,characterData:true});

// -----------------------------------------------------------------------------
// Runtime cleanup visible from the V0.8 review screenshot.
// -----------------------------------------------------------------------------
const cleanupStyle=document.createElement('style');
cleanupStyle.textContent=`
  .komo-language-toggle{position:absolute;right:62px;top:12px;z-index:80;height:34px;min-width:44px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(15,22,17,.58);backdrop-filter:blur(16px);color:#f2ecdf;font:600 9px/1 Arial;letter-spacing:.12em;cursor:pointer}
  .intro{transition:opacity .25s ease,transform .25s ease;max-width:340px!important}
  .intro.hidden{opacity:0!important;pointer-events:none!important;transform:translateY(-8px)!important}
  .panel{max-width:380px}
  .interaction{max-width:330px}
  @media(max-width:800px){.komo-language-toggle{right:50px;top:9px;height:30px;min-width:38px}.intro{max-width:calc(100vw - 20px)!important}}
`;
document.head.appendChild(cleanupStyle);

const intro=document.querySelector('#intro');
function dismissIntro(){if(intro&&!intro.classList.contains('hidden'))intro.classList.add('hidden')}
window.addEventListener('keydown',event=>{if(['w','a','s','d','z','q','arrowup','arrowdown','arrowleft','arrowright'].includes(event.key.toLowerCase()))dismissIntro()},{passive:true});
document.querySelector('#joystick-zone')?.addEventListener('pointerdown',dismissIntro,{passive:true});
document.querySelector('#intro-enter')?.addEventListener('click',dismissIntro);
const quest=document.querySelector('#quest-copy');
if(quest){new MutationObserver(()=>{if(!/01\s*[·.-]/.test(quest.textContent||''))dismissIntro()}).observe(quest,{subtree:true,childList:true,characterData:true})}

// Slightly more comfortable camera framing on first load, without overriding a deliberate user setting.
const savedControls=read();
if(!savedControls.__v081CameraMigrated){
  savedControls.camera={...(savedControls.camera||{}),distance:24};savedControls.__v081CameraMigrated=true;write(savedControls);
  const cameraDistance=document.querySelector('#camera-distance');
  if(cameraDistance){cameraDistance.value='24';cameraDistance.dispatchEvent(new Event('input',{bubbles:true}))}
}

// -----------------------------------------------------------------------------
// Fully remappable controls.
// -----------------------------------------------------------------------------
const scroll=document.querySelector('#settings .settings-scroll');
let list=null,listening=null;
function currentBindingLabels(){
  const en={forward:'Move Forward',backward:'Move Backward',left:'Move Left',right:'Move Right',sprint:'Sprint',interact:'Interact'};
  if(locale!=='fr')return en;
  return {forward:'Avancer',backward:'Reculer',left:'Aller à gauche',right:'Aller à droite',sprint:'Courir',interact:'Interagir'};
}
function renderBindings(){
  if(!list)return;
  const saved=read();const bindings={...defaults,...(saved.bindings||{})};const bindingLabels=currentBindingLabels();
  list.innerHTML=Object.entries(bindingLabels).map(([id,label])=>`<div class="binding-row"><span>${label}</span><button data-remap="${id}" class="${listening===id?'listening':''}">${listening===id?(locale==='fr'?'Appuyez sur une touche':'Press key'):keyName(bindings[id])}</button></div>`).join('');
  list.querySelectorAll('[data-remap]').forEach(button=>button.addEventListener('click',()=>{listening=button.dataset.remap;renderBindings()}));
}
if(scroll){
  const section=document.createElement('section');
  section.innerHTML=`<span class="group-title">${locale==='fr'?'TOUCHES':'KEY BINDINGS'}</span><div id="binding-list-v08" class="bindings"></div><small class="binding-note-v08">${locale==='fr'?'Cliquez sur une commande puis appuyez sur la touche souhaitée.':'Tap a key to remap it. The world reloads once to apply your new controls.'}</small>`;
  scroll.prepend(section);list=section.querySelector('#binding-list-v08');renderBindings();
  window.addEventListener('keydown',event=>{
    if(!listening)return;
    event.preventDefault();event.stopImmediatePropagation();
    const saved=read();saved.preset='custom';saved.bindings={...defaults,...(saved.bindings||{}),[listening]:normalize(event)};write(saved);listening=null;renderBindings();
    const toast=document.querySelector('#toast');if(toast){toast.textContent=locale==='fr'?'Commande enregistrée · rechargement':'Control saved · reloading';toast.classList.add('show')}
    setTimeout(()=>location.reload(),420);
  },true);
}

applyLocale();
