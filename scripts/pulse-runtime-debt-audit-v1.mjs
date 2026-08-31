import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const indexPath=join(target,'index.html');
const baselinePath=join(root,'scripts','pulse-runtime-debt-baseline-v1.json');
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

const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function exactViewRootMutations(text){
  const aliases=new Set();
  const selector=String.raw`(?:document\.)?(?:querySelector\(\s*['"]#viewRoot['"]\s*\)|getElementById\(\s*['"]viewRoot['"]\s*\))`;
  const direct=new RegExp(String.raw`\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*${selector}`,'g');
  const fallback=new RegExp(String.raw`\b([A-Za-z_$][\w$]*)\s*=\s*(?:document\.)?querySelector\([^;\n)]*\)\s*\|\|\s*${selector}`,'g');
  for(const m of text.matchAll(direct))aliases.add(m[1]);
  for(const m of text.matchAll(fallback))aliases.add(m[1]);

  const code=text;
  let replace=0,insert=0;
  for(const alias of aliases){
    const a=reEsc(alias);
    replace+=(code.match(new RegExp(String.raw`\b${a}\.(?:innerHTML|outerHTML|textContent|innerText)\s*(?:\+?=)`,'g'))||[]).length;
    replace+=(code.match(new RegExp(String.raw`\b${a}\.(?:replaceChildren|replaceWith|remove)\s*\(`,'g'))||[]).length;
    insert+=(code.match(new RegExp(String.raw`\b${a}\.(?:appendChild|append|prepend|insertBefore|insertAdjacentElement|insertAdjacentHTML|insertAdjacentText|before|after)\s*\(`,'g'))||[]).length;
  }
  const directTarget=String.raw`(?:document\.)?(?:querySelector\(\s*['"]#viewRoot['"]\s*\)|getElementById\(\s*['"]viewRoot['"]\s*\))`;
  replace+=(text.match(new RegExp(String.raw`${directTarget}\s*\.(?:innerHTML|outerHTML|textContent|innerText)\s*(?:\+?=)`,'g'))||[]).length;
  replace+=(text.match(new RegExp(String.raw`${directTarget}\s*\.(?:replaceChildren|replaceWith|remove)\s*\(`,'g'))||[]).length;
  insert+=(text.match(new RegExp(String.raw`${directTarget}\s*\.(?:appendChild|append|prepend|insertBefore|insertAdjacentElement|insertAdjacentHTML|insertAdjacentText|before|after)\s*\(`,'g'))||[]).length;
  return{aliases:[...aliases].sort(),replace,insert,total:replace+insert};
}

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
  const viewWritesLegacy=(text.match(/(?:#viewRoot|querySelector\(['"]#viewRoot['"]\)|getElementById\(['"]viewRoot['"]\))[\s\S]{0,220}(?:innerHTML|replaceChildren|appendChild|append\()/g)||[]).length;
  const exactView=exactViewRootMutations(text);
  const bodyObservers=/observe\(document\.body\s*,\s*\{[^}]*subtree\s*:\s*true/i.test(text)?1:0;
  const globals=[...text.matchAll(/window\.([A-Z][A-Za-z0-9_]+)\s*=/g)].map(m=>m[1]);
  metrics.push({file,bytes:st.size,observers,bodyObservers,intervals,timeouts,createClients,sharedRuntime,routeWrites,viewWritesLegacy,viewReplaceWrites:exactView.replace,viewInsertWrites:exactView.insert,viewWritesExact:exactView.total,viewRootAliases:exactView.aliases,globals});
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

function score(m){return m.observers*8+m.bodyObservers*12+m.intervals*10+m.routeWrites*5+m.viewWritesExact*6+(m.createClients&&!m.sharedRuntime?8:m.createClients?2:0)+Math.min(8,Math.floor(m.timeouts/4));}
const ranked=metrics.map(m=>({...m,risk:score(m)})).sort((a,b)=>b.risk-a.risk||b.bytes-a.bytes);
const directClients=metrics.filter(x=>x.createClients>0);
const isolatedClients=directClients.filter(x=>!x.sharedRuntime);
const routeWriters=metrics.filter(x=>x.routeWrites>0);
const wholeBody=metrics.filter(x=>x.bodyObservers>0);
const legacyViewOwners=metrics.filter(x=>x.viewWritesLegacy>0);
const exactViewMutators=metrics.filter(x=>x.viewWritesExact>0);
const exactViewReplacers=metrics.filter(x=>x.viewReplaceWrites>0);
const exactViewInserters=metrics.filter(x=>x.viewInsertWrites>0);
const legacyViewFalsePositives=legacyViewOwners.filter(x=>x.viewWritesExact===0);
const loadedBytes=metrics.reduce((a,b)=>a+b.bytes,0);
const observerCount=metrics.reduce((a,b)=>a+b.observers,0);
const intervalCount=metrics.reduce((a,b)=>a+b.intervals,0);

console.log(`[pulse-runtime-debt-v1] direct scripts=${scripts.length} · unique=${scriptCounts.size} · reachable=${reachable.size}/${jsFiles.length}`);
console.log(`[pulse-runtime-debt-v1] loaded bytes=${loadedBytes} · MutationObserver=${observerCount} · whole-body observers=${wholeBody.length} · intervals=${intervalCount} · createClient=${directClients.length} modules (${isolatedClients.length} isolated from KomoRuntime) · route writers=${routeWriters.length} · view proxy=${legacyViewOwners.length} · exact view mutators=${exactViewMutators.length} (${exactViewReplacers.length} replace / ${exactViewInserters.length} insert)`);
if(duplicateScriptTags.length)console.log('[pulse-runtime-debt-v1] duplicate tags',duplicateScriptTags);
console.log('[pulse-runtime-debt-v1] top risk modules');
for(const m of ranked.slice(0,20))console.log(`  ${String(m.risk).padStart(3)} · ${m.file} · obs=${m.observers}/${m.bodyObservers} int=${m.intervals} timeout=${m.timeouts} sb=${m.createClients}${m.createClients?(m.sharedRuntime?'/shared':'/isolated'):''} route=${m.routeWrites} view=${m.viewWritesExact}[${m.viewReplaceWrites}r/${m.viewInsertWrites}i] bytes=${m.bytes}`);
console.log('[pulse-runtime-debt-v1] isolated Supabase clients',isolatedClients.map(x=>x.file).join(', ')||'none');
console.log('[pulse-runtime-debt-v1] whole-body observers',wholeBody.map(x=>x.file).join(', ')||'none');
console.log('[pulse-runtime-debt-v1] route writers',routeWriters.map(x=>x.file).join(', ')||'none');
console.log('[pulse-runtime-debt-v1] view proxy legacy',legacyViewOwners.map(x=>x.file).join(', ')||'none');
console.log('[pulse-runtime-debt-v1] exact view mutators',exactViewMutators.map(x=>x.file).join(', ')||'none');
console.log('[pulse-runtime-debt-v1] exact view replacers',exactViewReplacers.map(x=>x.file).join(', ')||'none');
console.log('[pulse-runtime-debt-v1] exact view inserters',exactViewInserters.map(x=>x.file).join(', ')||'none');
console.log('[pulse-runtime-debt-v1] view proxy false positives',legacyViewFalsePositives.map(x=>x.file).join(', ')||'none');
if(legacyViewFalsePositives.length)console.log(`[pulse-runtime-debt-v1] INFO · legacy view proxy is diagnostic only; ${legacyViewFalsePositives.length} false positive(s) excluded from build gating`);
for(const [surface,candidates] of Object.entries(owners)){
  const loaded=candidates.filter(x=>reachable.has(x));
  console.log(`[pulse-runtime-debt-v1] surface ${surface}: ${loaded.length} candidates · ${loaded.join(', ')||'none'}`);
}

const report={generated_at:new Date().toISOString(),direct_scripts:scripts.length,unique_script_tags:scriptCounts.size,reachable_modules:reachable.size,total_js_modules:jsFiles.length,loaded_bytes:loadedBytes,mutation_observers:observerCount,interval_count:intervalCount,whole_body_observers:wholeBody.map(x=>x.file),interval_modules:metrics.filter(x=>x.intervals>0).map(x=>({file:x.file,count:x.intervals})),direct_supabase_clients:directClients.map(x=>x.file),isolated_supabase_clients:isolatedClients.map(x=>x.file),route_writers:routeWriters.map(x=>x.file),view_writers_legacy_proxy:legacyViewOwners.map(x=>x.file),view_mutators_exact:exactViewMutators.map(x=>x.file),view_replacers_exact:exactViewReplacers.map(x=>x.file),view_inserters_exact:exactViewInserters.map(x=>x.file),view_proxy_false_positives:legacyViewFalsePositives.map(x=>x.file),duplicate_script_tags:duplicateScriptTags,top_risk:ranked.slice(0,30),surface_candidates:Object.fromEntries(Object.entries(owners).map(([k,v])=>[k,v.filter(x=>reachable.has(x))]))};
console.log('[pulse-runtime-debt-v1] REPORT_JSON '+JSON.stringify(report));

const BASELINE=JSON.parse(await readFile(baselinePath,'utf8'));
const regressions=[];
if(scripts.length>BASELINE.scripts)regressions.push(`direct scripts ${scripts.length}>${BASELINE.scripts}`);
if(loadedBytes>BASELINE.bytes)regressions.push(`loaded bytes ${loadedBytes}>${BASELINE.bytes}`);
if(observerCount>BASELINE.observers)regressions.push(`MutationObserver ${observerCount}>${BASELINE.observers}`);
if(intervalCount>BASELINE.intervals)regressions.push(`setInterval occurrences ${intervalCount}>${BASELINE.intervals}`);
if(wholeBody.length>BASELINE.wholeBody)regressions.push(`whole-body observers ${wholeBody.length}>${BASELINE.wholeBody}`);
if(directClients.length>BASELINE.directClients)regressions.push(`createClient modules ${directClients.length}>${BASELINE.directClients}`);
if(isolatedClients.length>BASELINE.isolatedClients)regressions.push(`isolated Supabase clients ${isolatedClients.length}>${BASELINE.isolatedClients}`);
if(routeWriters.length>BASELINE.routeWriters)regressions.push(`route writers ${routeWriters.length}>${BASELINE.routeWriters}`);
// The legacy proximity scanner is intentionally diagnostic only. It is known
// to count files that mention #viewRoot near unrelated writes. Exact mutation
// metrics below are the build gate and remain locked to their baseline.
if(exactViewMutators.length>BASELINE.viewMutatorsExact)regressions.push(`exact view mutators ${exactViewMutators.length}>${BASELINE.viewMutatorsExact}`);
if(exactViewReplacers.length>BASELINE.viewReplacersExact)regressions.push(`exact view replacers ${exactViewReplacers.length}>${BASELINE.viewReplacersExact}`);
if(exactViewInserters.length>BASELINE.viewInsertersExact)regressions.push(`exact view inserters ${exactViewInserters.length}>${BASELINE.viewInsertersExact}`);
if(duplicateScriptTags.length)regressions.push('duplicate direct script tags detected');
if(regressions.length){console.error('[pulse-runtime-debt-v1] FAILED · '+regressions.join(' | '));process.exit(1)}
console.log('[pulse-runtime-debt-v1] PASS · versioned runtime debt baseline locked; exact view ownership and interval budget measured separately');