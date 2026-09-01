import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pulse=path.join(root,'site','pulse-v12');
const stableSrc=path.join(root,'pulse-app','motion-journey-stable-v1.js');
const homeStableSrc=path.join(root,'pulse-app','home-summary-stable-v1.js');
const motionDst=path.join(pulse,'motion-journey-v1.js');
const progressionPath=path.join(pulse,'progression-v2.js');
const resultsPath=path.join(pulse,'results-motion-journey-v1.js');
const homeSummaryPath=path.join(pulse,'home-summary-v1.js');
const indexPath=path.join(pulse,'index.html');

const required=[stableSrc,homeStableSrc,motionDst,progressionPath,resultsPath,homeSummaryPath,indexPath];
for(const f of required){if(!fs.existsSync(f)){console.error(`[pulse-stability] missing ${path.relative(root,f)}`);process.exit(1)}}

// 1. One owner for the Progression route. Motion Journey is now only an
// adjunct for Documents and Clinical, never a second renderer for #path.
fs.copyFileSync(stableSrc,motionDst);

// 2. Home uses the exact same canonical Motion journey as Results/RDV instead
// of selecting the last-created patient record from an arbitrary centre.
fs.copyFileSync(homeStableSrc,homeSummaryPath);

// 3. All journey consumers reuse the canonical KomoRuntime Supabase client.
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

// 4. Hard QA: fail the build instead of shipping known ownership/auth regressions.
const motion=fs.readFileSync(motionDst,'utf8');
const home=fs.readFileSync(homeSummaryPath,'utf8');
const index=fs.readFileSync(indexPath,'utf8');
const wrongKey='sb_publishable_3sUsinfJ_nMFI44OXozkQ_jmGG8w7n';
const exactScriptCount=(file)=>(index.match(new RegExp(`<script[^>]+src=["']\\./${file.replaceAll('.','\\.')}(?:\\?[^"']*)?["'][^>]*>`,`g`))||[]).length;
const resultsUsesSharedRuntime=results.includes('window.KomoRuntime?.client')||(
  results.includes("getCanonicalClient } from './canonical-result-runtime.js'")&&results.includes('getCanonicalClient()')
);
const checks=[
  ['stable Motion Journey uses shared runtime',motion.includes('window.KomoRuntime?.client')],
  ['Motion Journey does not own Progression',!motion.includes("r==='path'")&&!motion.includes("'documents','path','clinical'")],
  ['Progression does not listen to Motion Journey render event',!progression.includes('komo:motion-journey-ready')],
  ['Progression uses shared runtime',progression.includes('window.KomoRuntime?.client')],
  ['Results uses shared runtime',resultsUsesSharedRuntime],
  ['Home uses canonical Motion journey',home.includes("functions.invoke('motion-journey-status'")&&!home.includes("order('created_at',{ascending:false}).limit(1).maybeSingle()")],
  ['wrong Supabase key absent from critical journey output',![motion,progression,results,home].some(x=>x.includes(wrongKey))],
  ['Motion Journey script unique',exactScriptCount('motion-journey-v1.js')===1],
  ['Progression script unique',exactScriptCount('progression-v2.js')===1],
  ['Results journey script unique',exactScriptCount('results-motion-journey-v1.js')===1],
  ['Home summary script unique',exactScriptCount('home-summary-v1.js')===1]
];
for(const [label,ok] of checks){console.log(`[pulse-stability] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exit(1)}

const critical=[motionDst,progressionPath,resultsPath,homeSummaryPath];
for(const f of critical){const txt=fs.readFileSync(f,'utf8');const observers=(txt.match(/new MutationObserver/g)||[]).length;console.log(`[pulse-stability] ${path.basename(f)} · MutationObserver=${observers}`)}
console.log('[pulse-stability] critical route ownership stabilized');
