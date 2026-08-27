import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pulse=path.join(root,'site','pulse-v12');
const indexPath=path.join(pulse,'index.html');
const cockpitPath=path.join(pulse,'clinical-cockpit-v1.js');
const importerPath=path.join(pulse,'myocare-import-v1.js');
const assetSrc=path.join(root,'pulse-app','muscle-analysis-v1.js');
const assetDst=path.join(pulse,'muscle-analysis-v1.js');

if(!fs.existsSync(indexPath)||!fs.existsSync(cockpitPath)||!fs.existsSync(assetSrc)){
  console.error('[muscle-analysis-ui] required Pulse build files are missing');
  process.exit(1);
}

fs.copyFileSync(assetSrc,assetDst);

let cockpit=fs.readFileSync(cockpitPath,'utf8');
cockpit=cockpit.replace("['myocare','MyoCare']","['myocare','Analyse musculaire']");
cockpit=cockpit.replace('<strong>MyoCare</strong><span>provenance + QC</span>','<strong>Analyse musculaire</strong><span>activation · symétrie · QC</span>');
cockpit=cockpit.replace(/import\$\{pi>1\?'s':''\} MyoCare à approuver/g,"acquisition${pi>1?'s':''} musculaire${pi>1?'s':''} à contrôler");
fs.writeFileSync(cockpitPath,cockpit);

if(fs.existsSync(importerPath)){
  let importer=fs.readFileSync(importerPath,'utf8');
  importer=importer.replace('Déposer un export MyoCare','Importer les données musculaires');
  importer=importer.replace('Les valeurs sont converties vers le contrat canonique avant insertion.','Export Myodev / MyoCare. Les valeurs sont normalisées avant intégration dans le bilan Motion.');
  importer=importer.replace('Importer dans Motion','Intégrer à l’analyse musculaire');
  fs.writeFileSync(importerPath,importer);
}

let html=fs.readFileSync(indexPath,'utf8');
if(!html.includes('muscle-analysis-v1.js')){
  const anchor='<script src="./clinical-cockpit-bridge-v1.js"></script>';
  const tag='\n  <script type="module" src="./muscle-analysis-v1.js"></script>';
  if(html.includes(anchor)) html=html.replace(anchor,anchor+tag);
  else html=html.replace('</body>',`  <script type="module" src="./muscle-analysis-v1.js"></script>\n</body>`);
}
fs.writeFileSync(indexPath,html);

const checks=[
  ['tab label',cockpit.includes("['myocare','Analyse musculaire']")],
  ['asset',fs.existsSync(assetDst)],
  ['index',html.includes('muscle-analysis-v1.js')]
];
for(const [name,ok] of checks){if(!ok){console.error(`[muscle-analysis-ui] missing ${name}`);process.exit(1)}}
console.log('[muscle-analysis-ui] Analyse musculaire wired into Pulse');
