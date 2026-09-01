import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const base=process.env.PULSE_RESULTS_QA_BASE||'http://127.0.0.1:4173';
const pulse=join(process.cwd(),'site','pulse-v12');
const out=join(process.cwd(),'artifacts','pulse-results-v3');
await mkdir(out,{recursive:true});

const finalHtml=await readFile(join(pulse,'index.html'),'utf8');
const styles=[...finalHtml.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
const links=[...new Set(styles)].map(href=>`<link rel="stylesheet" href="${href}">`).join('\n');

const dossier={
  patient:{id:'qa-patient',patient_user_id:'qa-user',birth_date:'1986-01-01',sex_at_birth:'male'},
  motion:{id:'qa-assessment',status:'released',completed_at:'2026-08-30T10:00:00Z',released_at:'2026-08-30T12:00:00Z'},
  score:{id:'qa-score',motion_score:82,domain_scores:{mobility:82,myocare_symmetry:92},muscle_signature:{},confidence:0.94,confidence_label:'high',completeness:94,status:'released',release_status:'released',algorithm_version:'motion-score-v1',reference_version:'qa',calculated_at:'2026-08-30T11:00:00Z',released_at:'2026-08-30T12:00:00Z'},
  questionnaires:[],measurements:[],appointments:[],myocare_imports:[],
  myodev_metrics:[
    {assessment_id:'qa-assessment',muscle_code:'VL',side:'left',metric_code:'activation_pctMVC',value:48,unit:'%MVC',qc_status:'valid'},
    {assessment_id:'qa-assessment',muscle_code:'VL',side:'right',metric_code:'activation_pctMVC',value:52,unit:'%MVC',qc_status:'valid'},
    {assessment_id:'qa-assessment',muscle_code:'BF',side:'left',metric_code:'activation_pctMVC',value:39,unit:'%MVC',qc_status:'valid'},
    {assessment_id:'qa-assessment',muscle_code:'BF',side:'right',metric_code:'activation_pctMVC',value:41,unit:'%MVC',qc_status:'valid'},
    {assessment_id:'qa-assessment',muscle_code:'GM',side:'bilateral',metric_code:'fatigue_drift_pct',value:8,unit:'%',qc_status:'valid'}
  ]
};
const wearables=[
  {metric_date:'2026-09-01',steps:7432,sleep_minutes:462,resting_hr:56,source:'xiaomi',source_quality:'good',day_wear_mode:'continuous',night_worn:true},
  {metric_date:'2026-08-31',steps:6850,sleep_minutes:438,resting_hr:59,source:'xiaomi'},
  {metric_date:'2026-08-30',steps:7000,sleep_minutes:440,resting_hr:58,source:'xiaomi'}
];
const clinical={id:'qa-clinical',status:'completed',scheduled_at:'2026-08-28T09:00:00Z',completed_at:'2026-08-28T10:00:00Z',site_name:'KŌMØ Centre',notes_status:'signed'};

const fixture=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Pulse Results V3 QA</title>${links}</head><body class="kpulse-app-mode">
<div id="appShell" class="app-shell"><main class="main-shell"><header class="topbar"><div><p id="pageEyebrow"></p><h1 id="pageTitle"></h1></div></header><section id="viewRoot" class="view-root"></section></main></div>
<script>
(() => {
  const dossier=${JSON.stringify(dossier)},wearables=${JSON.stringify(wearables)},clinical=${JSON.stringify(clinical)};
  function chain(data){const c={select(){return c},eq(){return c},gte(){return c},order(){return c},limit(){return c},maybeSingle(){return Promise.resolve({data:Array.isArray(data)?(data[0]||null):data,error:null})},then(resolve,reject){return Promise.resolve({data,error:null}).then(resolve,reject)}};return c}
  const fakeClient={
    auth:{getSession:async()=>({data:{session:{user:{id:'qa-user'}}}})},
    rpc:async(name)=>name==='komo_result_snapshot'?{data:{motion:{currentAssessmentId:'qa-assessment'}},error:null}:name==='komo_professional_patient_dossier'?{data:dossier,error:null}:{data:null,error:null},
    from:table=>table==='assessments'?chain([{patient_id:'qa-patient'}]):table==='wearable_daily_metrics'?chain(wearables):table==='pulse_clinical_sessions'?chain(clinical):chain([])
  };
  window.KomoRuntime={client:fakeClient,role:'member',getContext:()=>({role:'member',client:fakeClient})};
  window.KomoPatientNavigation={go:r=>{window.__qaNavigation=r}};
})();
</script>
<script type="module" src="./results-motion-journey-v1.js"></script></body></html>`;
await writeFile(join(pulse,'__results-v3-qa.html'),fixture,'utf8');

const viewports=[
  {name:'desktop',width:1440,height:1000,isMobile:false,hasTouch:false},
  {name:'ipad',width:1024,height:1366,isMobile:false,hasTouch:true},
  {name:'mobile',width:390,height:844,isMobile:true,hasTouch:true}
];
const browser=await chromium.launch({headless:true});
let failures=0;const report=[];
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const rgb=v=>{const m=String(v).match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);return m?[+m[1],+m[2],+m[3]]:[0,0,0]};
const lum=([r,g,b])=>.2126*r+.7152*g+.0722*b;

for(const vp of viewports){
  const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,hasTouch:vp.hasTouch,deviceScaleFactor:1});
  const page=await context.newPage();const consoleErrors=[],pageErrors=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(`${base}/pulse-v12/__results-v3-qa.html#results`,{waitUntil:'networkidle'});
  await page.waitForSelector('[data-kresults-v1] .kr3-card.daily[open]',{timeout:10000});
  await page.waitForTimeout(180);
  const state=await page.evaluate(()=>{
    const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],visible=s=>{const el=q(s);if(!el)return false;const cs=getComputedStyle(el),b=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&b.width>0&&b.height>0};
    const cards=qa('.kr3-card').map(el=>({kind:el.querySelector('.kr3-kicker')?.textContent?.trim(),open:el.open,rect:el.getBoundingClientRect().toJSON(),text:el.innerText.replace(/\s+/g,' ').trim()}));
    const daily=qa('.kr3-card.daily .kr3-dm strong').map(x=>x.textContent.trim());
    const root=q('[data-kresults-v1]')?.getBoundingClientRect();
    return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,bodyBg:getComputedStyle(document.body).backgroundColor,grid:getComputedStyle(q('.kr3-grid')).gridTemplateColumns,title:q('.kr3-head h2')?.textContent?.trim(),cards,daily,root:root?.toJSON(),text:norm(q('[data-kresults-v1]')?.innerText),visible:{root:visible('[data-kresults-v1]'),daily:visible('.kr3-card.daily'),komo:visible('.kr3-komo')},legacyHero:!!q('.krv-hero'),scoreHero:!!q('.krv-score-value')};
  });
  const errors=[];
  if(state.scrollWidth>state.width+1)errors.push(`horizontal overflow ${state.scrollWidth}>${state.width}`);
  if(state.title!=='Results')errors.push(`title=${state.title}`);
  for(const [k,v] of Object.entries(state.visible))if(!v)errors.push(`${k} not visible`);
  const order=state.cards.map(c=>c.kind).join('>');if(order!=='DAILY>MUSCLE>POSTURE>FUNCTIONAL>CLINICAL')errors.push(`section order=${order}`);
  if(!state.cards[0]?.open)errors.push('Daily is not open by default');
  if(state.legacyHero||state.scoreHero)errors.push('legacy Motion Score hero still visible');
  const text=state.text;
  for(const expected of ['Steps','Sleep','Resting HR','Quadriceps','Ischio-jambiers','Mollets','Clinical'])if(!text.includes(expected))errors.push(`missing ${expected}`);
  if(!state.daily.some(v=>v.replace(/\D/g,'')==='7432'))errors.push(`steps=${state.daily.join('|')}`);
  if(!state.daily.some(v=>norm(v).includes('7 h 42')))errors.push(`sleep=${state.daily.join('|')}`);
  if(!state.daily.some(v=>v.includes('56 bpm')))errors.push(`rhr=${state.daily.join('|')}`);
  if(/biology|imaging|medical_conclusion/i.test(text))errors.push('private clinical context leaked');
  if(lum(rgb(state.bodyBg))<180)errors.push(`canvas not light premium ${state.bodyBg}`);
  if(state.root&&(state.root.left<0||state.root.right>state.width+1))errors.push('Results root escapes viewport');
  const colCount=state.grid.split(' ').filter(Boolean).length;
  if(vp.name==='mobile'&&colCount!==1)errors.push(`mobile columns=${colCount}`);
  if(vp.name!=='mobile'&&colCount!==2)errors.push(`${vp.name} columns=${colCount}`);
  if(consoleErrors.length)errors.push(`console: ${consoleErrors.join(' | ')}`);if(pageErrors.length)errors.push(`page: ${pageErrors.join(' | ')}`);
  const muscle=page.locator('.kr3-card').filter({hasText:'MUSCLE'}).first();await muscle.locator('summary').click();if(!(await muscle.evaluate(el=>el.open)))errors.push('Muscle detail does not open');
  await page.screenshot({path:join(out,`pulse-results-v3-${vp.name}.png`),fullPage:true});
  console.log(`[pulse-results-v3-browser] ${errors.length?'FAIL':'PASS'} · ${vp.name} ${vp.width}x${vp.height} · cards=${state.cards.length} · columns=${colCount} · overflow=${state.scrollWidth}/${state.width}`);
  for(const e of errors)console.error(`[pulse-results-v3-browser] ${vp.name} · ${e}`);failures+=errors.length;report.push({viewport:vp.name,state,errors});await context.close();
}
await browser.close();await writeFile(join(out,'report.json'),JSON.stringify({generated_at:new Date().toISOString(),report},null,2));
if(failures){console.error(`[pulse-results-v3-browser] FAIL · ${failures} assertion(s)`);process.exit(1)}
console.log('[pulse-results-v3-browser] PASS · desktop + iPad + mobile · Daily/Muscle/Posture/Functional/Clinical');
