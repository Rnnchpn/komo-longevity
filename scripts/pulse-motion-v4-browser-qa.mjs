import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const base=process.env.PULSE_MOTION_QA_BASE||'http://127.0.0.1:4173';
const pulse=join(process.cwd(),'site','pulse-v12');
const out=join(process.cwd(),'artifacts','pulse-motion-v4');
await mkdir(out,{recursive:true});

const finalHtml=await readFile(join(pulse,'index.html'),'utf8');
const finalApp=await readFile(join(pulse,'app.js'),'utf8');
const motionV4Count=(finalHtml.match(/motion-hub-v4\.js/g)||[]).length;
const motionV3Count=(finalHtml.match(/motion-hub-v3\.js/g)||[]).length;
if(motionV4Count!==1)throw new Error(`Expected exactly one Motion V4 runtime, found ${motionV4Count}`);
if(motionV3Count!==0)throw new Error(`Legacy Motion V3 is still loaded (${motionV3Count})`);
const currentRouteBlock=finalApp.match(/function\s+currentRoute\s*\(\)\s*\{[\s\S]*?\n\}/)?.[0]||'';
if(!/["']motion["']/.test(currentRouteBlock)||!/\.includes\(route\)\s*\?\s*route\s*:/.test(currentRouteBlock))throw new Error('Base router does not recognize #motion explicitly');
if(!finalApp.includes('data-motion-host-v4'))throw new Error('Base router Motion host is missing');

const styles=[...finalHtml.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
const links=[...new Set(styles)].map(href=>`<link rel="stylesheet" href="${href}">`).join('\n');

function dossier(releaseStatus='released'){
  return {
    patient:{id:'qa-patient',patient_user_id:'qa-user',birth_date:'1986-01-01',sex_at_birth:'male'},
    motion:{id:'qa-assessment',status:releaseStatus==='released'?'released':'review',completed_at:'2026-08-30T10:00:00Z',released_at:releaseStatus==='released'?'2026-08-30T12:00:00Z':null},
    score:{id:'qa-score',motion_score:82,domain_scores:{mobility:82,myocare_symmetry:92},muscle_signature:{},confidence:0.94,confidence_label:'high',completeness:94,status:releaseStatus,release_status:releaseStatus,algorithm_version:'motion-score-v1',reference_version:'qa',calculated_at:'2026-08-30T11:00:00Z',released_at:releaseStatus==='released'?'2026-08-30T12:00:00Z':null},
    questionnaires:[],measurements:[],appointments:[],myocare_imports:[],myodev_metrics:[]
  };
}

function fixture(data,name){return`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Motion V4 ${name}</title>${links}</head><body class="kpulse-app-mode">
<div id="appShell" class="app-shell"><main class="main-shell"><header class="topbar"><div><p id="pageEyebrow"></p><h1 id="pageTitle"></h1></div></header><section id="viewRoot" class="view-root"><div data-motion-host-v4></div></section></main></div>
<script>
(() => {
  const dossier=${JSON.stringify(data)};
  function chain(data){const c={select(){return c},eq(){return c},order(){return c},limit(){return c},maybeSingle(){return Promise.resolve({data:Array.isArray(data)?(data[0]||null):data,error:null})},then(resolve,reject){return Promise.resolve({data,error:null}).then(resolve,reject)}};return c}
  const fakeClient={
    auth:{getSession:async()=>({data:{session:{user:{id:'qa-user'}}}})},
    rpc:async(name)=>name==='komo_result_snapshot'?{data:{motion:{currentAssessmentId:'qa-assessment'}},error:null}:name==='komo_professional_patient_dossier'?{data:dossier,error:null}:{data:null,error:null},
    from:table=>table==='assessments'?chain([{patient_id:'qa-patient'}]):table==='patients'?chain([{id:'qa-patient'}]):chain([])
  };
  window.KomoRuntime={client:fakeClient,role:'member',getContext:()=>({role:'member',client:fakeClient})};
  window.KomoPatientNavigation={route:()=>location.hash.replace(/^#/,'').split('?')[0]||'home',go:r=>{window.__qaNavigation=r}};
})();
</script>
<script src="./motion-route-guard-v4.js"></script>
<script type="module" src="./motion-hub-v4.js"></script></body></html>`}

await writeFile(join(pulse,'__motion-v4-qa-released.html'),fixture(dossier('released'),'released'),'utf8');
await writeFile(join(pulse,'__motion-v4-qa-draft.html'),fixture(dossier('draft'),'draft'),'utf8');

const viewports=[
  {name:'desktop',width:1440,height:1000,isMobile:false,hasTouch:false},
  {name:'ipad',width:1024,height:1366,isMobile:false,hasTouch:true},
  {name:'mobile',width:390,height:844,isMobile:true,hasTouch:true}
];
const browser=await chromium.launch({headless:true});
let failures=0;const report=[];
const rgb=v=>{const m=String(v).match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);return m?[+m[1],+m[2],+m[3]]:[0,0,0]};
const lum=([r,g,b])=>.2126*r+.7152*g+.0722*b;

for(const vp of viewports){
  const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,hasTouch:vp.hasTouch,deviceScaleFactor:1});
  const page=await context.newPage();const consoleErrors=[],pageErrors=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(`${base}/pulse-v12/__motion-v4-qa-released.html#motion`,{waitUntil:'networkidle'});
  await page.waitForSelector('[data-motion-hub-v4] .km4-score',{timeout:10000});
  await page.waitForTimeout(180);
  const state=await page.evaluate(()=>{
    const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
    const root=q('[data-motion-hub-v4]')?.getBoundingClientRect();
    const text=(q('[data-motion-hub-v4]')?.innerText||'').replace(/\s+/g,' ').trim();
    return {
      width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,
      bodyBg:getComputedStyle(document.body).backgroundColor,
      root:root?.toJSON(),text,
      score:q('.km4-big')?.textContent?.replace(/\s+/g,' ').trim(),
      age:q('.km4-age strong')?.textContent?.trim()||'',
      domains:qa('.km4-domain h3').map(x=>x.textContent.trim()),
      domainGrid:getComputedStyle(q('.km4-domains')).gridTemplateColumns,
      heroGrid:getComputedStyle(q('.km4-hero')).gridTemplateColumns,
      komo:(q('.km4-komo')?.innerText||'').trim(),
      focus:(q('.km4-focus')?.innerText||'').trim(),
      v3:!!q('[data-motion-hub-v3]'),home:!!q('[data-my-komo-home]'),legacyQuestionnaire:!!q('[data-komo-motion-hub="legacy"]')||!!q('.kmh-test-grid'),
      pending:document.body.classList.contains('kmotion-route-pending')
    };
  });
  const errors=[];
  if(state.scrollWidth>state.width+1)errors.push(`horizontal overflow ${state.scrollWidth}>${state.width}`);
  if(!state.score?.startsWith('82'))errors.push(`released score missing: ${state.score}`);
  if(state.age&&state.age!=='—')errors.push(`Motion Age fabricated when not calculable: ${state.age}`);
  if(state.domains.join('>')!=='Fonction>Muscle>Posture')errors.push(`domain order=${state.domains.join('>')}`);
  if(!state.komo.includes('KOMO'))errors.push('Komo interpretation missing');
  if(!state.focus)errors.push('current priority/focus missing');
  if(state.v3)errors.push('legacy Motion V3 visible');
  if(state.home)errors.push('Home fallback rendered on Motion');
  if(state.legacyQuestionnaire)errors.push('legacy questionnaire hub visible as Motion owner');
  if(state.pending)errors.push('Motion route guard never released');
  for(const forbidden of ['Steps','Sleep','Resting HR','7,432'])if(state.text.includes(forbidden))errors.push(`Daily data leaked into Motion: ${forbidden}`);
  if(!state.text.includes('Voir mon plan')||!state.text.includes('Préparer le prochain bilan'))errors.push('next actions incomplete');
  if(lum(rgb(state.bodyBg))<180)errors.push(`canvas not light premium: ${state.bodyBg}`);
  if(state.root&&(state.root.left<0||state.root.right>state.width+1))errors.push('Motion root escapes viewport');
  const cols=state.domainGrid.split(' ').filter(Boolean).length;
  if(vp.name==='mobile'&&cols!==1)errors.push(`mobile domain columns=${cols}`);
  if(vp.name!=='mobile'&&cols!==3)errors.push(`${vp.name} domain columns=${cols}`);
  const heroCols=state.heroGrid.split(' ').filter(Boolean).length;
  if(vp.name==='mobile'&&heroCols!==1)errors.push(`mobile hero columns=${heroCols}`);
  if(vp.name!=='mobile'&&heroCols!==2)errors.push(`${vp.name} hero columns=${heroCols}`);
  if(consoleErrors.length)errors.push(`console: ${consoleErrors.join(' | ')}`);
  if(pageErrors.length)errors.push(`page: ${pageErrors.join(' | ')}`);
  await page.locator('[data-km4-route="results"]').first().click();
  const nav=await page.evaluate(()=>window.__qaNavigation||'');
  if(nav!=='results')errors.push(`Results CTA routes to ${nav||'nothing'}`);
  await page.screenshot({path:join(out,`pulse-motion-v4-${vp.name}.png`),fullPage:true});
  console.log(`[pulse-motion-v4-browser] ${errors.length?'FAIL':'PASS'} · ${vp.name} ${vp.width}x${vp.height} · domains=${cols} · hero=${heroCols} · overflow=${state.scrollWidth}/${state.width}`);
  for(const e of errors)console.error(`[pulse-motion-v4-browser] ${vp.name} · ${e}`);
  failures+=errors.length;report.push({viewport:vp.name,state,errors});await context.close();
}

// Fail-closed publication test: a draft score must never be shown as final.
{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(`${base}/pulse-v12/__motion-v4-qa-draft.html#motion`,{waitUntil:'networkidle'});
  await page.waitForSelector('[data-motion-hub-v4] .km4-empty',{timeout:10000});
  const state=await page.evaluate(()=>({text:(document.querySelector('[data-motion-hub-v4]')?.innerText||'').replace(/\s+/g,' ').trim(),scoreVisible:!!document.querySelector('.km4-big'),domainsVisible:!!document.querySelector('.km4-domains'),pending:document.body.classList.contains('kmotion-route-pending')}));
  const errors=[];
  if(state.scoreVisible||/82\s*\/\s*100/.test(state.text))errors.push('draft score exposed as final');
  if(state.domainsVisible)errors.push('final domain interpretation exposed before publication');
  if(!state.text.includes('Bilan en validation.'))errors.push('validation state copy missing');
  if(state.pending)errors.push('route guard remains pending in draft state');
  if(pageErrors.length)errors.push(`page: ${pageErrors.join(' | ')}`);
  console.log(`[pulse-motion-v4-browser] ${errors.length?'FAIL':'PASS'} · unpublished fail-closed`);
  for(const e of errors)console.error(`[pulse-motion-v4-browser] unpublished · ${e}`);
  failures+=errors.length;report.push({viewport:'unpublished-mobile',state,errors});await context.close();
}

await browser.close();
await writeFile(join(out,'report.json'),JSON.stringify({generated_at:new Date().toISOString(),motionV4Count,motionV3Count,report},null,2));
if(failures){console.error(`[pulse-motion-v4-browser] FAIL · ${failures} assertion(s)`);process.exit(1)}
console.log('[pulse-motion-v4-browser] PASS · desktop + iPad + mobile · released + fail-closed unpublished state');