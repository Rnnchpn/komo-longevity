import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const indexPath=join(target,'index.html');
const html=await readFile(indexPath,'utf8');
const entries=await readdir(target,{withFileTypes:true});
const rootFiles=entries.filter(x=>x.isFile()).map(x=>x.name);
const jsFiles=rootFiles.filter(x=>x.endsWith('.js'));
const textByFile=new Map();
for(const file of jsFiles)textByFile.set(file,await readFile(join(target,file),'utf8'));

const scripts=[...html.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)].map(x=>x[1]);
const scriptCounts=new Map();for(const s of scripts)scriptCounts.set(s,(scriptCounts.get(s)||0)+1);
const duplicateScriptTags=[...scriptCounts.entries()].filter(([,n])=>n>1);

const reachable=new Set();const queue=[];
for(const s of scripts){if(textByFile.has(s)&&!reachable.has(s)){reachable.add(s);queue.push(s)}}
while(queue.length){const file=queue.shift(),text=textByFile.get(file)||'';const deps=[];for(const m of text.matchAll(/(?:from\s*|import\s*)["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']/g))deps.push(m[1]);for(const m of text.matchAll(/import\s*\(\s*["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']\s*\)/g))deps.push(m[1]);for(const dep of deps){if(textByFile.has(dep)&&!reachable.has(dep)){reachable.add(dep);queue.push(dep)}}}

const metrics=[];
for(const file of [...reachable].sort()){
  const text=textByFile.get(file)||'';
  const st=await stat(join(target,file));
  const routeWrites=(text.match(/location\.hash\s*=|history\.(?:pushState|replaceState)\s*\(/g)||[]).length;
  const observers=(text.match(/new\s+MutationObserver\s*\(/g)||[]).length;
  const intervals=(text.match(/setInterval\s*\(/g)||[]).length;
  const timeouts=(text.match(/setTimeout\s*\(/g)||[]).length;
  const createClients=(text.match(/createClient\s*\(/g)||[]).length;
  const sharedRuntime=text.includes('KomoRuntime');
  const viewWrites=(text.match(/(?:#viewRoot|querySelector\(['\"]#viewRoot['\"]\)|getElementById\(['\"]viewRoot['\"]\))[\s\S]{0,220}(?:innerHTML|replaceChildren|appendChild|append\()/g)||[]).length;
  const bodyObservers=/observe\(document\.body\s*,\s*\{[^}]*subtree\s*:\s*true/i.test(text)?1:0;
  const globals=[...text.matchAll(/window\.([A-Z][A-Za-z0-9_]+)\s*=/g)].map(m=>m[1]);
  metrics.push({file,bytes:st.size,observers,bodyObservers,intervals,timeouts,createClients,sharedRuntime,routeWrites,viewWrites,globals});
}

const owners={
  home:['patient-home-command-v1.js','my-komo-home-v1.js','home-summary-v1.js'],
  results:['patient-canonical-results.js','results-motion-journey-v1.js','results-polish-v1.js'],
  trajectory:['trajectory-v3.js','progression-v2.js'],
  documents:['agenda-hub-v4.js','booking-layer-v1.js','patient-motion-booking-v2.js','agenda-premium-map-v1.js'],
  mykomo:['my-komo-stable-v5.js','my-komo-dashboard-v2.js','my-komo-key-home-v1.js','my-komo-home-v1.js'],
  auth:['auth-login-canonical.js','auth-gateway-v2.js','auth-premium-v3.js','auth-stability-v1.js','auth-web-v1.js'],
  navigation:['patient-navigation-core-v1.js','adaptive-shell-v4.js','pulse-bottom-nav-v6.js','mobile-v1.js','mobile-guided-v2.js','mobile-vertical-app-v1.js','patient-route-runtime-v2.js']
};

function score(m){return m.observers*8+m.bodyObservers*12+m.intervals*10+m.routeWrites*5+m.viewWrites*6+(m.createClients&&!m.sharedRuntime?8:m.createClients?2:0)+Math.min(8,Math.floor(m.timeouts/4));}
const ranked=metrics.map(m=>({...m,risk:score(m)})).sort((a,b)=>b.risk-a.risk||b.bytes-a.bytes);
const directClients=metrics.filter(x=>x.createClients>0);
const isolatedClients=directClients.filter(x=>!x.sharedRuntime);
const routeWriters=metrics.filter(x=>x.routeWrites>0);
const wholeBody=metrics.filter(x=>x.bodyObservers>0);
const viewOwners=metrics.filter(x=>x.viewWrites>0);
const loadedBytes=metrics.reduce((a,b)=>a+b.bytes,0);
const observerCount=metrics.reduce((a,b)=>a+b.observers,0);

console.log(`[pulse-runtime-debt-v1] direct scripts=${scripts.length} · unique=${scriptCounts.size} · reachable=${reachable.size}/${jsFiles.length}`);
console.log(`[pulse-runtime-debt-v1] loaded bytes=${loadedBytes} · MutationObserver=${observerCount} · whole-body observers=${wholeBody.length} · intervals=${metrics.reduce((a,b)=>a+b.intervals,0)} · createClient=${directClients.length} modules (${isolatedClients.length} isolated from KomoRuntime) · route writers=${routeWriters.length} · view writers=${viewOwners.length}`);
if(duplicateScriptTags.length)console.log('[pulse-runtime-debt-v1] duplicate tags',duplicateScriptTags);
console.log('[pulse-runtime-debt-v1] top risk modules');
for(const m of ranked.slice(0,20))console.log(`  ${String(m.risk).padStart(3)} · ${m.file} · obs=${m.observers}/${m.bodyObservers} int=${m.intervals} timeout=${m.timeouts} sb=${m.createClients}${m.createClients?(m.sharedRuntime?'/shared':'/isolated'):''} route=${m.routeWrites} view=${m.viewWrites} bytes=${m.bytes}`);
console.log('[pulse-runtime-debt-v1] isolated Supabase clients',isolatedClients.map(x=>x.file).join(', ')||'none');
console.log('[pulse-runtime-debt-v1] whole-body observers',wholeBody.map(x=>x.file).join(', ')||'none');
console.log('[pulse-runtime-debt-v1] route writers',routeWriters.map(x=>x.file).join(', ')||'none');
console.log('[pulse-runtime-debt-v1] view writers',viewOwners.map(x=>x.file).join(', ')||'none');
for(const [surface,candidates] of Object.entries(owners)){
  const loaded=candidates.filter(x=>reachable.has(x));
  console.log(`[pulse-runtime-debt-v1] surface ${surface}: ${loaded.length} candidates · ${loaded.join(', ')||'none'}`);
}

const report={generated_at:new Date().toISOString(),direct_scripts:scripts.length,unique_script_tags:scriptCounts.size,reachable_modules:reachable.size,total_js_modules:jsFiles.length,loaded_bytes:loadedBytes,mutation_observers:observerCount,whole_body_observers:wholeBody.map(x=>x.file),interval_modules:metrics.filter(x=>x.intervals>0).map(x=>({file:x.file,count:x.intervals})),direct_supabase_clients:directClients.map(x=>x.file),isolated_supabase_clients:isolatedClients.map(x=>x.file),route_writers:routeWriters.map(x=>x.file),view_writers:viewOwners.map(x=>x.file),duplicate_script_tags:duplicateScriptTags,top_risk:ranked.slice(0,30),surface_candidates:Object.fromEntries(Object.entries(owners).map(([k,v])=>[k,v.filter(x=>reachable.has(x))]))};
console.log('[pulse-runtime-debt-v1] REPORT_JSON '+JSON.stringify(report));

// Baseline from production commit 049c150. These ceilings may only move down.
const BASELINE={scripts:131,bytes:1340976,observers:79,wholeBody:51,directClients:64,routeWriters:48,viewWriters:11};
const regressions=[];
if(scripts.length>BASELINE.scripts)regressions.push(`direct scripts ${scripts.length}>${BASELINE.scripts}`);
if(loadedBytes>BASELINE.bytes)regressions.push(`loaded bytes ${loadedBytes}>${BASELINE.bytes}`);
if(observerCount>BASELINE.observers)regressions.push(`MutationObserver ${observerCount}>${BASELINE.observers}`);
if(wholeBody.length>BASELINE.wholeBody)regressions.push(`whole-body observers ${wholeBody.length}>${BASELINE.wholeBody}`);
if(directClients.length>BASELINE.directClients)regressions.push(`createClient modules ${directClients.length}>${BASELINE.directClients}`);
if(routeWriters.length>BASELINE.routeWriters)regressions.push(`route writers ${routeWriters.length}>${BASELINE.routeWriters}`);
if(viewOwners.length>BASELINE.viewWriters)regressions.push(`view writers ${viewOwners.length}>${BASELINE.viewWriters}`);
if(duplicateScriptTags.length)regressions.push('duplicate direct script tags detected');
if(regressions.length){console.error('[pulse-runtime-debt-v1] FAILED · '+regressions.join(' | '));process.exit(1)}
console.log('[pulse-runtime-debt-v1] PASS · production debt baseline locked; no deletion performed');