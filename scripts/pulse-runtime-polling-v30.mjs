import{readFile,writeFile}from'node:fs/promises';

const root='site/pulse-v12/';
const contracts={
  'center-patient-links.js':'setInterval(schedule,900);',
  'first-test-entry-v1.js':"setInterval(()=>{if(route()==='home')patchHome(false)},1200);",
  'my-komo-economy-v1.js':"setInterval(()=>{if(route()==='mykomo')hydrate()},12000);",
  'my-komo-wallet-home-v2.js':"setInterval(()=>{if(['home','mykomo'].includes(route()))run(true)},15000);"
};

for(const [file,target]of Object.entries(contracts)){
  const path=root+file;
  let source=await readFile(path,'utf8');
  const before=(source.match(/setInterval\s*\(/g)||[]).length;
  if(before===0){console.log(`[pulse-polling-v30] already retired in ${file}`);continue}
  if(before!==1)throw new Error(`[pulse-polling-v30] expected zero or one interval in ${file}, found ${before}`);
  if(!source.includes(target))throw new Error(`[pulse-polling-v30] polling contract changed in ${file}`);
  source=source.replace(target,'');
  if(source.includes('setInterval('))throw new Error(`[pulse-polling-v30] polling remains in ${file}`);
  await writeFile(path,source,'utf8');
}

console.log('[pulse-polling-v30] persistent polling loops retired · already-event-driven modules accepted');
await import('./pulse-runtime-results-consolidation-v31.mjs');