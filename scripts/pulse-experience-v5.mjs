import { readFile, writeFile } from 'node:fs/promises';

async function patch(path,replacements){let src=await readFile(path,'utf8');for(const [from,to] of replacements){if(!src.includes(from)){console.warn(`[pulse-experience-v5] optional fragment missing in ${path}: ${from.slice(0,80)}`);continue}src=src.split(from).join(to)}await writeFile(path,src)}

await patch('pulse-app/app.js',[
  ['ÉTAT DU PARCOURS','VOTRE PROGRESSION'],
  ['ÉTAT DU PROGRAMME','VOTRE PROGRESSION'],
  ["metricCard('Parcours',statusLabel(status)","metricCard('Progression',statusLabel(status)"],
  ["adherence:'Étape du programme'","adherence:'Étape du suivi'"]
]);

await patch('pulse-app/experience-v3.js',[
  ["navButton('plan', 'Mon plan', planIcon)","navButton('plan', 'Mes priorités', planIcon)"],
  ["navButton('plan','Mon plan',planIcon)","navButton('plan','Mes priorités',planIcon)"],
  ["el.textContent = 'Voir mon plan';","el.textContent = 'Voir mes priorités';"],
  ["<p class=\"eyebrow\">PLAN PERSONNALISÉ</p>","<p class=\"eyebrow\">MES PRIORITÉS</p>"],
  ['Votre plan transforme les résultats de l’évaluation en priorités simples à suivre entre deux consultations.','Vos priorités transforment les résultats de l’évaluation en actions simples à suivre entre deux consultations.'],
  ["<p class=\"eyebrow\">VOTRE PLAN</p>","<p class=\"eyebrow\">VOS PRIORITÉS</p>"],
  ['Une fois vos résultats relus, Pulse affichera ici les priorités retenues, les actions à suivre et les points à réévaluer lors de la prochaine consultation.','Une fois vos résultats relus, Pulse affichera ici les priorités retenues, les actions à suivre et les points à réévaluer lors de la prochaine consultation.'],
  ['Cette page accueillera progressivement l’adhérence au programme, les objectifs intermédiaires et les ajustements décidés avec votre professionnel.','Cette page accueillera progressivement le suivi de vos priorités, les objectifs intermédiaires et les ajustements décidés avec votre professionnel.'],
  ["setPage('MON PLAN', 'Votre plan personnalisé.', renderPlan())","setPage('MES PRIORITÉS', 'Vos priorités actuelles.', renderPlan())"]
]);

await patch('pulse-app/patient-v4.js',[
  ["const TARGETS=new Set(['path','plan','documents']);","const TARGETS=new Set(['path','plan']);"],
  ['MON PLAN','MES PRIORITÉS'],
  ['Votre plan personnalisé.','Vos priorités actuelles.'],
  ['Votre plan traduit l’évaluation en priorités compréhensibles entre deux consultations. Pulse n’affiche ici que les éléments validés pour vous.','Vos priorités traduisent l’évaluation en actions compréhensibles entre deux consultations. Pulse n’affiche ici que les éléments validés pour vous.'],
  ['Votre plan personnalisé apparaîtra après validation de vos priorités par votre professionnel.','Vos priorités apparaîtront ici après validation par votre professionnel.']
]);

await patch('pulse-app/care-messaging-v1.js',[
  ["if(isPro()){ensureProTab()}else{await loadMemberRecords();injectMember()}","if(isPro()){ensureProTab()}"],
  ["if(location.hash.replace(/^#/,'')==='documents'&&!isPro())injectMember()",""]
]);

let html=await readFile('pulse-app/index.html','utf8');
html=html.split('programme KŌMØ').join('parcours KŌMØ');
if(!html.includes('./bottom-dock-v1.css'))html=html.replace('</head>','  <link rel="stylesheet" href="./bottom-dock-v1.css" />\n</head>');
if(!html.includes('./care-messaging-v2.js'))html=html.replace('</body>','  <script type="module" src="./care-messaging-v2.js"></script>\n  <script type="module" src="./admin-patient-routing-v2.js"></script>\n</body>');
await writeFile('pulse-app/index.html',html);
console.log('[pulse-experience-v5] bottom dock, patient priorities, dedicated booking and messaging wired');
