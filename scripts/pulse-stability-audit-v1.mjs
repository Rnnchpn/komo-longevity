import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pulse=path.join(root,'site','pulse-v12');
const stableSrc=path.join(root,'pulse-app','motion-journey-stable-v1.js');
const motionDst=path.join(pulse,'motion-journey-v1.js');
const progressionPath=path.join(pulse,'progression-v2.js');
const resultsPath=path.join(pulse,'results-motion-journey-v1.js');
const homeSummaryPath=path.join(pulse,'home-summary-v1.js');
const indexPath=path.join(pulse,'index.html');

const required=[stableSrc,motionDst,progressionPath,resultsPath,indexPath];
for(const f of required){if(!fs.existsSync(f)){console.error(`[pulse-stability] missing ${path.relative(root,f)}`);process.exit(1)}}

// 1. One owner for the Progression route. Motion Journey is now only an
// adjunct for Documents and Clinical, never a second renderer for #path.
fs.copyFileSync(stableSrc,motionDst);

// 2. All journey consumers reuse the canonical KomoRuntime Supabase client.
const oldSb="function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}";
const sharedSb="function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}";

let progression=fs.readFileSync(progressionPath,'utf8');
if(progression.includes(oldSb)) progression=progression.replace(oldSb,sharedSb);
progression=progression.replace("window.addEventListener('komo:motion-journey-ready',schedule);",'');
progression=progression.replaceAll('MyoCare','Analyse musculaire');
fs.writeFileSync(progressionPath,progression);

let results=fs.readFileSync(resultsPath,'utf8');
if(results.includes(oldSb)) results=results.replace(oldSb,sharedSb);
results=results.replaceAll('Import MyoCare','Intégration des données musculaires');
results=results.replaceAll('données MyoCare','données musculaires');
fs.writeFileSync(resultsPath,results);

// 3. Remove stale patient wording from the home summary while preserving its
// current display role. Canonical journey resolution is handled separately.
if(fs.existsSync(homeSummaryPath)){
  let home=fs.readFileSync(homeSummaryPath,'utf8');
  home=home.replaceAll('Mobilité préservée','Résultat favorable');
  home=home.replaceAll("+' rép.'","+' répétitions'");
  home=home.replaceAll('Mesure Myodev / MyoCare et analyse fonctionnelle.','Acquisition Myodev et analyse musculaire.');
  fs.writeFileSync(homeSummaryPath,home);
}

// 4. Hard QA: fail the build instead of shipping known ownership/auth regressions.
const motion=fs.readFileSync(motionDst,'utf8');
const index=fs.readFileSync(indexPath,'utf8');
const wrongKey='sb_publishable_3sUsinfJ_nMFI44OXozkQ_jmGG8w7n';
const checks=[
  ['stable Motion Journey uses shared runtime',motion.includes('window.KomoRuntime?.client')],
  ['Motion Journey does not own Progression',!motion.includes("r==='path'")&&!motion.includes("'documents','path','clinical'")],
  ['Progression does not listen to Motion Journey render event',!progression.includes("komo:motion-journey-ready")],
  ['Progression uses shared runtime',progression.includes('window.KomoRuntime?.client')],
  ['Results uses shared runtime',results.includes('window.KomoRuntime?.client')],
  ['wrong Supabase key absent from critical journey output',![motion,progression,results].some(x=>x.includes(wrongKey))],
  ['Motion Journey script unique',(index.match(/motion-journey-v1\.js/g)||[]).length===1],
  ['Progression script unique',(index.match(/progression-v2\.js/g)||[]).length===1],
  ['Results journey script unique',(index.match(/results-motion-journey-v1\.js/g)||[]).length===1]
];
for(const [label,ok] of checks){console.log(`[pulse-stability] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exit(1)}

const critical=[motionDst,progressionPath,resultsPath,homeSummaryPath].filter(fs.existsSync);
for(const f of critical){const txt=fs.readFileSync(f,'utf8');const observers=(txt.match(/new MutationObserver/g)||[]).length;console.log(`[pulse-stability] ${path.basename(f)} · MutationObserver=${observers}`)}
console.log('[pulse-stability] critical route ownership stabilized');
