import { readFile, writeFile } from 'node:fs/promises';

async function patch(path,replacements){
  let src=await readFile(path,'utf8');
  for(const [from,to] of replacements){
    if(!src.includes(from)){
      console.warn(`[pulse-mobile-guided-v2] optional fragment missing in ${path}: ${from.slice(0,90)}`);
      continue;
    }
    src=src.split(from).join(to);
  }
  await writeFile(path,src);
}

// Pulse Free is deliberately limited to the three tests used for the first reference.
await patch('pulse-app/tests-v1.js',[
  ["const STEP_KEYS = ['baseline','chair_stand','two_step','gait_4m','balance'];","const STEP_KEYS = ['baseline','chair_stand','two_step'];"],
  ["      ${testCard('gait_4m','04','Marche · 4 m','Chronométrez quatre mètres de marche à allure habituelle. Pulse calcule simplement la vitesse brute.','4 m · chronomètre')}\n",''],
  ["      ${testCard('balance','05','Équilibre','Chronométrez un appui unipodal de chaque côté, jusqu’à trente secondes maximum.','2 × 30 s · support à proximité')}\n",'']
]);

// Always load the mobile override last, after the production polish layers injected earlier in the pipeline.
let html=await readFile('pulse-app/index.html','utf8');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/mobile-guided-v2\.css" \/>/g,'');
html=html.replace(/\s*<script src="\.\/mobile-guided-v2\.js"><\/script>/g,'');
html=html.replace('</head>','  <link rel="stylesheet" href="./mobile-guided-v2.css" />\n</head>');
html=html.replace('</body>','  <script src="./mobile-guided-v2.js"></script>\n</body>');
await writeFile('pulse-app/index.html',html);

console.log('[pulse-mobile-guided-v2] four-tab patient navigation, contextual home and three-step Pulse Free wired');
