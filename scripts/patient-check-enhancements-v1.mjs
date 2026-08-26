import {readFile,writeFile} from 'node:fs/promises';

const testsPath='pulse-app/tests-v1.js';
const indexPath='pulse-app/index.html';
let src=await readFile(testsPath,'utf8');

src=src.replace("const STEP_KEYS = ['baseline','chair_stand','two_step','gait_4m','balance'];","const STEP_KEYS = ['baseline','chair_stand','two_step'];");
src=src.replace('<h2>Mesurez ce que vous pouvez.<br><em>Le reste se fait ensemble.</em></h2>','<h2>Première étape de votre parcours KŌMØ.<br><em>Établissez votre point de départ.</em></h2>');
src=src.replace('<p>Pulse vous guide dans les mesures réalisables seul. Les mesures instrumentées et l’interprétation clinique restent réalisées avec votre professionnel.</p>','<p>Commencez ici par votre KŌMØ Check, puis réalisez deux tests simples à domicile. Ces premières données préparent votre rendez-vous : KŌMØ Motion et, si nécessaire, KŌMØ Clinical complètent ensuite l’évaluation avec votre professionnel.</p>');
src=src.replace('<section class="tests-v1-section-head"><div><p class="eyebrow">À FAIRE DANS PULSE</p><h3>Votre mesure personnelle.</h3></div><p>Aucune interprétation médicale n’est produite ici. Pulse enregistre d’abord vos données brutes pour construire une trajectoire fiable.</p></section>','<section class="tests-v1-section-head"><div><p class="eyebrow">ÉTAPE 1 · À FAIRE DANS PULSE</p><h3>Commencez par trois étapes simples.</h3></div><p>Pulse vous indique quand démarrer et comment réaliser chaque étape. Vous obtenez d’abord un repère de mobilité auto-déclarée, puis deux mesures fonctionnelles simples.</p></section>');
src=src.replace("${testCard('baseline','01','KŌMØ Check','Votre contexte du jour, vos objectifs et les informations utiles avant les tests physiques.','3–5 min · chez vous')}\n      ${testCard('chair_stand','02','Chair Stand · 30 s','Comptez le nombre de levers complets réalisés en trente secondes avec une chaise stable.','30 s · chaise stable')}\n      ${testCard('two_step','03','Two-Step','Mesurez la distance parcourue en deux grands pas, puis Pulse calcule le ratio en fonction de votre taille.','2 pas · mètre ruban')}\n      ${testCard('gait_4m','04','Marche · 4 m','Chronométrez quatre mètres de marche à allure habituelle. Pulse calcule simplement la vitesse brute.','4 m · chronomètre')}\n      ${testCard('balance','05','Équilibre','Chronométrez un appui unipodal de chaque côté, jusqu’à trente secondes maximum.','2 × 30 s · support à proximité')}","${testCard('baseline','01','KŌMØ Check','Répondez au questionnaire et décrivez votre situation du jour. Vous obtenez votre premier repère de mobilité KŌMØ.','5–7 min · commencez ici')}\n      ${testCard('chair_stand','02','Chair Stand · 30 s','Après le KŌMØ Check, installez une chaise stable contre un mur. Pulse lance pour vous le minuteur de 30 secondes.','30 s · minuteur intégré')}\n      ${testCard('two_step','03','Two-Step','Après le Chair Stand, préparez un espace plat et un mètre ruban. Faites deux grands pas puis saisissez la distance.','2 pas · mètre ruban')}");
src=src.replace("if (key === 'baseline') return 'Profil enregistré';","if (key === 'baseline') { const score=Number(value.questionnaire?.mobility_score_0_100); return Number.isFinite(score)?'Premier score KŌMØ Check · '+Math.round(score)+'/100':'KŌMØ Check enregistré'; }");

if(!src.includes('const KOMO_MOBILITY_ITEMS = [')){
  const marker="function checked(value){ return value ? 'checked' : ''; }";
  const helper=[
    marker,
    '',
    'const KOMO_MOBILITY_ITEMS = [',
    "  'Vous relever après être resté assis un moment.',",
    "  'Vous relever d’une chaise basse sans vous aider des bras.',",
    "  'Vous retourner ou changer de position dans votre lit.',",
    "  'Vous habiller au niveau des jambes et du bassin.',",
    "  'Mettre ou retirer vos chaussures et chaussettes.',",
    "  'Rester debout environ dix minutes.',",
    "  'Vous déplacer facilement à l’intérieur de votre logement.',",
    "  'Marcher dehors sur un terrain plat.',",
    "  'Parcourir environ 500 mètres sans devoir vous arrêter.',",
    "  'Monter un étage par les escaliers.',",
    "  'Descendre un étage par les escaliers.',",
    "  'Franchir une marche ou un trottoir.',",
    "  'Marcher sur un sol irrégulier.',",
    "  'Changer rapidement de direction pendant la marche.',",
    "  'Maintenir votre équilibre lors de vos déplacements quotidiens.',",
    "  'Porter un petit sac de courses sur quelques mètres.',",
    "  'Vous pencher pour ramasser un objet au sol.',",
    "  'Vous accroupir puis vous relever.',",
    "  'Entrer dans une voiture et en sortir.',",
    "  'Utiliser les transports en commun lorsque nécessaire.',",
    "  'Réaliser vos tâches domestiques habituelles.',",
    "  'Rester actif pendant plus de trente minutes.',",
    "  'Poursuivre une activité malgré une fatigue des jambes ou du dos.',",
    "  'Sortir seul avec confiance dans votre environnement habituel.',",
    "  'Maintenir vos activités habituelles sans devoir les limiter pour votre mobilité.'",
    '];',
    "function kmqOption(value,label,current){return '<option value=\"'+value+'\" '+(Number(current)===value?'selected':'')+'>'+label+'</option>'}",
    'function komoQuestionnaireMarkup(existing={}){',
    '  const items=existing.items||{};',
    "  const rows=KOMO_MOBILITY_ITEMS.map((text,i)=>{const key='kmq_'+String(i+1).padStart(2,'0'),current=items[key];return '<label class=\"kmq-v1-item\"><span><b>'+String(i+1).padStart(2,'0')+'</b>'+text+'</span><select name=\"'+key+'\" data-kmq-item required><option value=\"\">Choisir</option>'+kmqOption(0,'Aucune difficulté',current)+kmqOption(1,'Difficulté légère',current)+kmqOption(2,'Difficulté modérée',current)+kmqOption(3,'Difficulté importante',current)+kmqOption(4,'Très difficile ou impossible',current)+'</select></label>'}).join('');",
    "  const score=Number.isFinite(Number(existing.mobility_score_0_100))?Math.round(Number(existing.mobility_score_0_100)):'—';",
    "  return '<section class=\"kmq-v1\"><div class=\"kmq-v1-head\"><div><p class=\"eyebrow\">QUESTIONNAIRE DE MOBILITÉ · KŌMØ CHECK</p><h3>Comment votre mobilité se traduit-elle au quotidien ?</h3><p>Pour chaque situation, choisissez la réponse qui correspond le mieux à votre expérience récente. Répondez aux 25 questions pour obtenir votre premier score KŌMØ Check.</p></div><div class=\"kmq-v1-score\"><span>Premier score</span><strong id=\"kmqScore\">'+score+'/100</strong></div></div><div class=\"kmq-v1-list\">'+rows+'</div><p class=\"kmq-v1-note\"><strong>Lecture simple :</strong> 100 correspond à une mobilité auto-déclarée sans difficulté sur ces situations. Ce repère prépare la suite du bilan et n’est pas une interprétation clinique.</p></section>';",
    '}',
    'function readKomoQuestionnaire(formEl){',
    '  const fd=new FormData(formEl),items={};let total=0,answered=0;',
    "  KOMO_MOBILITY_ITEMS.forEach((_,i)=>{const key='kmq_'+String(i+1).padStart(2,'0'),raw=fd.get(key),n=raw===''||raw==null?null:Number(raw);if(Number.isFinite(n)){items[key]=n;total+=n;answered++}});",
    "  return{version:'komo-mobility-questionnaire-v1',items,answered,difficulty_total:answered===25?total:null,mobility_score_0_100:answered===25?100-total:null,source:'patient'};",
    '}',
    'function bindKomoQuestionnaire(formEl){',
    "  if(!formEl)return;const score=formEl.querySelector('#kmqScore');",
    "  const refresh=()=>{const q=readKomoQuestionnaire(formEl);if(score){score.textContent=q.mobility_score_0_100==null?q.answered+'/25':Math.round(q.mobility_score_0_100)+'/100';score.classList.toggle('kmq-v1-incomplete',q.answered<25)}};",
    "  formEl.querySelectorAll('[data-kmq-item]').forEach(x=>x.addEventListener('change',refresh));refresh();",
    '}'
  ].join('\n');
  if(!src.includes(marker))throw new Error('[patient-check-enhancements] helper marker missing');
  src=src.replace(marker,helper);
}

const safetyMarker='      <fieldset class="safety-fieldset"><legend>Avant les tests physiques</legend>';
if(!src.includes('${komoQuestionnaireMarkup(b.questionnaire || {})}')){
  if(!src.includes(safetyMarker))throw new Error('[patient-check-enhancements] baseline safety marker missing');
  src=src.replace(safetyMarker,"      ${komoQuestionnaireMarkup(b.questionnaire || {})}\n"+safetyMarker);
}

src=src.replace("    body.querySelector('#baselineTestForm')?.addEventListener('submit', event => {","    const baselineEl=body.querySelector('#baselineTestForm');\n    bindKomoQuestionnaire(baselineEl);\n    baselineEl?.addEventListener('submit', event => {");
src=src.replace("        unusual_symptoms: form.get('unusual_symptoms') === 'yes',\n        safety:","        unusual_symptoms: form.get('unusual_symptoms') === 'yes',\n        questionnaire: readKomoQuestionnaire(event.currentTarget),\n        safety:");

await writeFile(testsPath,src);

let html=await readFile(indexPath,'utf8');
for(const css of ['./komo-questionnaire-v1.css','./chair-timer-v1.css'])if(!html.includes(css))html=html.replace('</head>',`  <link rel="stylesheet" href="${css}" />\n</head>`);
if(!html.includes('./chair-timer-v1.js'))html=html.replace('</body>','  <script src="./chair-timer-v1.js"></script>\n</body>');
await writeFile(indexPath,html);
console.log('[patient-check-enhancements-v1] first-stage copy, 25-item KŌMØ questionnaire, first score and Chair Stand timer wired');
