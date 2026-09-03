import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const roots=['pulse-app',join('site','pulse-v12')];
const LIBRARY_ORIGIN='https://komolongevity.com';
const articles=[
  ['test-two-step','Two-Step Test : que mesure réellement le test des deux pas ?'],
  ['test-stand-up','Stand-Up Test : pourquoi la hauteur de siège change tout'],
  ['test-lever-chaise','Le test de lever de chaise'],
  ['test-vitesse-marche-10-metres','Comment mesurer sa vitesse de marche sur 10 mètres ?'],
  ['cadence-marche-normale','Cadence de marche : que signifie le nombre de pas par minute ?'],
  ['double-appui-marche','Double appui : pourquoi gardons-nous parfois les deux pieds au sol plus longtemps ?'],
  ['pas-plus-courts','Pourquoi mes pas deviennent-ils plus courts ?'],
  ['equilibre-vieillissement','Équilibre : un système multisensoriel'],
  ['puissance-cheville-vieillissement','Propulsion de cheville : ce qui pousse réellement le corps vers l’avant'],
  ['puissance-musculaire-vieillissement','Puissance musculaire : pourquoi la vitesse compte'],
  ['moins-force-jambes','Pourquoi ai-je moins de force dans les jambes ?'],
  ['cone-of-economy','Cone of Economy'],
  ['locomotive-syndrome','Locomotive Syndrome'],
  ['walking-is-data','Walking is data'],
  ['bilan-mobilite-complet','Que mesure réellement un bilan de mobilité complet ?']
];

for(const [slug] of articles){
  await access(join('site','assets','media',slug,'index.html'));
}

const injection=`
const KOMO_LIBRARY_TRAJECTORY=[
  {keys:['two-step','two step','m-fun-03'],href:'https://komolongevity.com/media/test-two-step',title:'Two-Step Test : que mesure réellement le test des deux pas ?'},
  {keys:['stand-up','stand up'],href:'https://komolongevity.com/media/test-stand-up',title:'Stand-Up Test : pourquoi la hauteur de siège change tout'},
  {keys:['chair stand','lever de chaise','m-fun-04'],href:'https://komolongevity.com/media/test-lever-chaise',title:'Le test de lever de chaise'},
  {keys:['vitesse de marche','gait speed','m-fun-05'],href:'https://komolongevity.com/media/test-vitesse-marche-10-metres',title:'Comment mesurer sa vitesse de marche sur 10 mètres ?'},
  {keys:['cadence'],href:'https://komolongevity.com/media/cadence-marche-normale',title:'Cadence de marche : que signifie le nombre de pas par minute ?'},
  {keys:['double appui','double support'],href:'https://komolongevity.com/media/double-appui-marche',title:'Double appui : pourquoi gardons-nous parfois les deux pieds au sol plus longtemps ?'},
  {keys:['longueur de pas','step length','stride length'],href:'https://komolongevity.com/media/pas-plus-courts',title:'Pourquoi mes pas deviennent-ils plus courts ?'},
  {keys:['equilibre','équilibre','appui unipodal','single leg','chute','fall'],href:'https://komolongevity.com/media/equilibre-vieillissement',title:'Équilibre : un système multisensoriel'},
  {keys:['gastroc','mollet','cheville','propulsion','push off'],href:'https://komolongevity.com/media/puissance-cheville-vieillissement',title:'Propulsion de cheville : ce qui pousse réellement le corps vers l’avant'},
  {keys:['puissance','fatigabilite','fatigabilité','fatigue'],href:'https://komolongevity.com/media/puissance-musculaire-vieillissement',title:'Puissance musculaire : pourquoi la vitesse compte'},
  {keys:['quadriceps','ischio','biceps femoral','biceps fémoral','force','activation','coactivation','symetrie neuromusculaire','symétrie neuromusculaire','lsi','muscle'],href:'https://komolongevity.com/media/moins-force-jambes',title:'Pourquoi ai-je moins de force dans les jambes ?'},
  {keys:['posture','sva','alignement','cone of economy'],href:'https://komolongevity.com/media/cone-of-economy',title:'Cone of Economy'},
  {keys:['glfs','locomotive syndrome','locomotive'],href:'https://komolongevity.com/media/locomotive-syndrome',title:'Locomotive Syndrome'},
  {keys:['marche','gait','temps d appui','temps d’appui','pas'],href:'https://komolongevity.com/media/walking-is-data',title:'Walking is data'},
  {keys:['mobilite','mobilité','fonction','motion score','motion'],href:'https://komolongevity.com/media/bilan-mobilite-complet',title:'Que mesure réellement un bilan de mobilité complet ?'}
];
function normalizeLibraryText(v=''){return String(v||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function trajectoryArticleFor(text=''){
  const hay=normalizeLibraryText(text);
  for(const a of KOMO_LIBRARY_TRAJECTORY){if(a.keys.some(k=>hay.includes(normalizeLibraryText(k))))return a}
  return {href:'https://komolongevity.com/media/bilan-mobilite-complet',title:'Que mesure réellement un bilan de mobilité complet ?'};
}
function trajectoryLink(article,compact=false){
  if(!article?.href)return'';
  return \`<a class="kr4-correct\${compact?' compact':''}" href="\${article.href}" target="_blank" rel="noopener" aria-label="Corriger ma trajectoire — lire \${esc(article.title)}">Corriger ma trajectoire →</a>\`;
}
function installTrajectoryLinks(root){
  if(!root)return;
  const add=(host,text,compact=false)=>{if(!host||host.querySelector(':scope > .kr4-correct'))return;host.insertAdjacentHTML('beforeend',trajectoryLink(trajectoryArticleFor(text),compact))};
  const hero=root.querySelector('.kr4-hero .kr4-actions');
  if(hero&&!hero.querySelector('[data-library-trajectory]')){
    const a=trajectoryArticleFor('motion score bilan mobilite');
    hero.insertAdjacentHTML('beforeend',\`<a class="kr4-btn" data-library-trajectory href="\${a.href}" target="_blank" rel="noopener">Corriger ma trajectoire →</a>\`);
  }
  root.querySelectorAll('.kr4-signal').forEach(x=>add(x,x.textContent));
  root.querySelectorAll('.kr4-muscle-card').forEach(x=>add(x,x.textContent));
  root.querySelectorAll('.kr4-row').forEach(x=>add(x,x.textContent,true));
  root.querySelectorAll('.kr4-table tbody tr').forEach(row=>{const cell=row.lastElementChild;if(cell&&!cell.querySelector('.kr4-correct'))cell.insertAdjacentHTML('beforeend',trajectoryLink(trajectoryArticleFor(row.textContent),true))});
  root.querySelectorAll('.kr4-q').forEach(q=>{const body=q.querySelector('.kr4-q-body');add(body,q.textContent,true)});
}
`;

function patch(src){
  if(!src.includes("const VERSION='4.0.0-motion-report'"))throw new Error('[pulse-results-library] Results V4 owner missing');
  if(!src.includes('KOMO_LIBRARY_TRAJECTORY')){
    const marker="const valueText=v=>{if(v===null||v===undefined||v==='')return'—';if(typeof v==='boolean')return v?'Oui':'Non';if(Array.isArray(v))return v.map(valueText).join(', ');if(typeof v==='object'){try{return JSON.stringify(v)}catch{return String(v)}}return String(v).replaceAll('_',' ')};";
    if(!src.includes(marker))throw new Error('[pulse-results-library] value helper contract changed');
    src=src.replace(marker,marker+injection);
  }
  if(!src.includes('.kr4-correct{')){
    const marker='.kr4-note{margin-top:10px;color:#748078;font-size:7.5px;line-height:1.45}';
    if(!src.includes(marker))throw new Error('[pulse-results-library] Results CSS contract changed');
    src=src.replace(marker,marker+`.kr4-correct{display:inline-flex;align-items:center;width:max-content;max-width:100%;margin-top:11px;padding:7px 0 3px;color:#a9cbb2;text-decoration:none;border-bottom:1px solid rgba(169,203,178,.28);font:700 8px/1.15 DM Sans,sans-serif;letter-spacing:.01em;transition:color .16s ease,border-color .16s ease}.kr4-correct:hover,.kr4-correct:focus-visible{color:#eef5f0;border-color:#a9cbb2}.kr4-correct.compact{font-size:7.3px;margin-top:7px}.kr4-row>.kr4-correct{grid-column:1/-1}.kr4-table td .kr4-correct{white-space:nowrap}.kr4-q-body>.kr4-correct{margin-top:12px}@media(max-width:700px){.kr4-correct{min-height:30px;align-items:center}}`);
  }
  const old='function bindResults(root){root.querySelector(\'[data-scroll-clinical]\')?.addEventListener(\'click\',()=>root.querySelector(\'#clinicalResults\')?.scrollIntoView({behavior:\'smooth\',block:\'start\'}));root.querySelectorAll(\'details[data-lazy-key]\').forEach(d=>d.addEventListener(\'toggle\',()=>{if(!d.open||d.dataset.loaded)return;d.dataset.loaded=\'1\';const key=d.dataset.lazyKey,rows=lazyStores.get(key)||[],body=d.querySelector(\'.kr4-detail-body\');if(body)body.innerHTML=key===\'sensor\'?lazySensorRows(rows):lazyMeasurementRows(rows)}));bindRoutes(root)}';
  const next='function bindResults(root){root.querySelector(\'[data-scroll-clinical]\')?.addEventListener(\'click\',()=>root.querySelector(\'#clinicalResults\')?.scrollIntoView({behavior:\'smooth\',block:\'start\'}));root.querySelectorAll(\'details[data-lazy-key]\').forEach(d=>d.addEventListener(\'toggle\',()=>{if(!d.open||d.dataset.loaded)return;d.dataset.loaded=\'1\';const key=d.dataset.lazyKey,rows=lazyStores.get(key)||[],body=d.querySelector(\'.kr4-detail-body\');if(body)body.innerHTML=key===\'sensor\'?lazySensorRows(rows):lazyMeasurementRows(rows)}));bindRoutes(root);installTrajectoryLinks(root)}';
  if(src.includes(old))src=src.replace(old,next);
  else if(!src.includes('bindRoutes(root);installTrajectoryLinks(root)'))throw new Error('[pulse-results-library] bindResults contract changed');
  return src;
}

for(const root of roots){
  const path=join(root,'patient-canonical-results.js');
  const src=await readFile(path,'utf8');
  await writeFile(path,patch(src),'utf8');
}

const final=await readFile(join('site','pulse-v12','patient-canonical-results.js'),'utf8');
const checks=[
  ['Results keeps one V4 owner',final.includes("4.0.0-motion-report")&&final.includes('data-kresults-v4')],
  ['trajectory CTA is wired',final.includes('Corriger ma trajectoire →')&&final.includes('installTrajectoryLinks(root)')],
  ['Library mapping is contextual',final.includes(`${LIBRARY_ORIGIN}/media/test-two-step`)&&final.includes(`${LIBRARY_ORIGIN}/media/cadence-marche-normale`)&&final.includes(`${LIBRARY_ORIGIN}/media/equilibre-vieillissement`)&&final.includes(`${LIBRARY_ORIGIN}/media/moins-force-jambes`)],
  ['Library links leave Pulse for the public host',!final.includes("href:'/media/")&&final.includes('https://komolongevity.com/media/')],
  ['raw technical markers are not spammed with CTAs',!final.includes("querySelectorAll('.kr4-tech-row')")]
];
for(const [label,ok] of checks){console.log(`[pulse-results-library] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('[pulse-results-library] QA failed');
console.log(`[pulse-results-library] PASS · ${articles.length} existing KŌMØ Library articles verified · contextual trajectory correction wired into Results`);
