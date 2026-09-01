import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const base=process.env.PULSE_HOME_QA_BASE||'http://127.0.0.1:4173';
const pulse=join(process.cwd(),'site','pulse-v12');
const out=join(process.cwd(),'artifacts','pulse-home-v6');
await mkdir(out,{recursive:true});

const finalHtml=await readFile(join(pulse,'index.html'),'utf8');
const styles=[...finalHtml.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
const uniqueStyles=[...new Set(styles)];
const links=uniqueStyles.map(href=>`<link rel="stylesheet" href="${href}">`).join('\n');

const motionToday={
  connected:true,ready:true,date:'2026-09-01',score:84,status:'strong',message:'You’re moving well',
  steps:{value:7432,usual:6850,delta_pct:8,baseline_days:28,score:84.25},
  sleep:{value_minutes:462,usual_minutes:438,delta_minutes:24,baseline_days:28,score:83.60},
  resting_hr:{value:56,usual:59,delta:-3,baseline_days:28,score:84.50},
  weights:{steps:.40,sleep:.35,resting_hr:.25},baseline_window_days:28,minimum_baseline_days:14,algorithm_version:'motion-today-v1.0'
};

const fixture=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Pulse Home V6 QA</title>${links}</head><body class="kpulse-app-mode">
<div id="appShell" class="app-shell"><header class="topbar"><span id="pageEyebrow"></span><h1 id="pageTitle"></h1><button class="avatar-button" type="button">A</button></header><main id="viewRoot" class="view-root"><div data-my-komo-home data-home-owner="patient-home-command-v1"></div></main></div>
<script>
(() => {
  const motion=${JSON.stringify(motionToday)};
  const fakeClient={
    auth:{getSession:async()=>({data:{session:{user:{id:'qa-user'}}}})},
    functions:{invoke:async()=>({data:{role:'member',reply:{headline:'QA',answer:'QA',suggested_actions:[]}},error:null})},
    rpc:async(name)=>({data:name==='komo_motion_today_v1'?motion:null,error:null}),
    from:()=>{const chain={select(){return chain},eq(){return chain},order(){return chain},limit(){return Promise.resolve({data:[],error:null})}};return chain;}
  };
  window.KomoRuntime={client:fakeClient,role:'member',getContext:()=>({role:'member',profile:{first_name:'Alex'},client:fakeClient})};
  window.KomoPatientNavigation={route:()=> 'home',go:r=>{window.__qaNavigation=r}};
})();
</script>
<script type="module" src="./patient-home-command-v1.js"></script></body></html>`;
await writeFile(join(pulse,'__home-v6-qa.html'),fixture,'utf8');

const viewports=[
  {name:'desktop',width:1440,height:1000,isMobile:false,hasTouch:false},
  {name:'ipad',width:1024,height:1366,isMobile:false,hasTouch:true},
  {name:'mobile',width:390,height:844,isMobile:true,hasTouch:true}
];

const browser=await chromium.launch({headless:true});
let failures=0;
const report=[];
const normalize=s=>String(s||'').replace(/\s+/g,' ').trim();
function luminance([r,g,b]){return .2126*r+.7152*g+.0722*b}
function rgb(value){const m=String(value).match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);return m?[+m[1],+m[2],+m[3]]:[0,0,0]}

async function runViewport(vp){
  const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,hasTouch:vp.hasTouch,deviceScaleFactor:1});
  const page=await context.newPage();
  const consoleErrors=[];const pageErrors=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(`${base}/pulse-v12/__home-v6-qa.html`,{waitUntil:'networkidle'});
  await page.waitForSelector('[data-khome-v6]:not(.is-loading)',{timeout:10000});
  await page.waitForTimeout(180);

  const state=await page.evaluate((name)=>{
    const q=s=>document.querySelector(s);const qa=s=>[...document.querySelectorAll(s)];
    const visible=s=>{const el=q(s);if(!el)return false;const cs=getComputedStyle(el),b=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&b.width>0&&b.height>0};
    const metrics=qa('.kh6-metric').map(el=>({type:el.dataset.metric,text:el.innerText.replace(/\s+/g,' ').trim(),rect:el.getBoundingClientRect().toJSON()}));
    const root=q('.kh6')?.getBoundingClientRect();
    const score=q('.kh6-score')?.getBoundingClientRect();
    return {
      name,width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
      overflowX:getComputedStyle(document.body).overflowX,overflowY:getComputedStyle(document.body).overflowY,
      bodyBg:getComputedStyle(document.body).backgroundColor,
      owner:q('[data-my-komo-home]')?.dataset.khomeOwner||'',
      state:q('[data-khome-v6]')?.dataset.motionState||'',
      score:q('.kh6-score')?.textContent?.trim()||'',label:q('.kh6-label')?.textContent?.trim()||'',message:q('.kh6-message')?.textContent?.trim()||'',
      metricCount:metrics.length,metrics,root:root?.toJSON(),scoreRect:score?.toJSON(),
      visible:{home:visible('.kh6'),score:visible('.kh6-score'),metrics:visible('.kh6-metrics')},
      grid:getComputedStyle(q('.kh6-metrics')).gridTemplateColumns,
      topbar:getComputedStyle(q('.topbar')).display
    };
  },vp.name);

  const errors=[];
  if(state.scrollWidth>state.width+1)errors.push(`horizontal overflow ${state.scrollWidth}>${state.width}`);
  if(state.overflowX!=='hidden'&&state.overflowY!=='hidden')errors.push(`Home canvas overflow not locked (${state.overflowX}/${state.overflowY})`);
  for(const [key,ok] of Object.entries(state.visible))if(!ok)errors.push(`${key} not visible`);
  if(state.owner!=='patient-home-command-v1@6')errors.push(`owner=${state.owner}`);
  if(state.state!=='strong')errors.push(`motion state=${state.state}`);
  if(state.score!=='84')errors.push(`score=${state.score}`);
  if(state.label!=='MOTION TODAY')errors.push(`label=${state.label}`);
  if(state.message!=="You’re moving well")errors.push(`message=${state.message}`);
  if(state.metricCount!==3)errors.push(`metric count=${state.metricCount}`);
  const expected={
    steps:['7,432','Steps','Usual 6,850','+8%'],
    sleep:['7h 42','Sleep','Usual 7h 18','+24 min'],
    resting_hr:['56 bpm','Resting HR','Usual 59 bpm','−3 bpm']
  };
  for(const [type,parts] of Object.entries(expected)){
    const metric=state.metrics.find(x=>x.type===type);if(!metric){errors.push(`${type} missing`);continue}
    for(const part of parts)if(!normalize(metric.text).includes(part))errors.push(`${type} missing “${part}” in ${normalize(metric.text)}`);
  }
  if(luminance(rgb(state.bodyBg))<180)errors.push(`Home canvas is not light premium: ${state.bodyBg}`);
  if(state.root&&(state.root.left<0||state.root.right>state.width+1))errors.push('Home root escapes viewport');
  if(state.scoreRect&&(state.scoreRect.top<0||state.scoreRect.bottom>state.height))errors.push('score outside viewport');
  if(vp.name==='mobile'&&state.metrics.some(x=>x.rect.width<90))errors.push('mobile metric columns too narrow');
  if(consoleErrors.length)errors.push(`console: ${consoleErrors.join(' | ')}`);
  if(pageErrors.length)errors.push(`page: ${pageErrors.join(' | ')}`);

  await page.screenshot({path:join(out,`pulse-home-v6-${vp.name}.png`),fullPage:true});
  console.log(`[pulse-home-v6-browser] ${errors.length?'FAIL':'PASS'} · ${vp.name} ${vp.width}x${vp.height} · owner=${state.owner} · score=${state.score} · metrics=${state.metricCount} · overflow=${state.scrollWidth}/${state.width}`);
  for(const e of errors)console.error(`[pulse-home-v6-browser] ${vp.name} · ${e}`);
  failures+=errors.length;report.push({viewport:vp.name,state,errors});
  await context.close();
}

for(const vp of viewports)await runViewport(vp);
await browser.close();
await writeFile(join(out,'report.json'),JSON.stringify({generated_at:new Date().toISOString(),stylesheets:uniqueStyles.length,reference:motionToday,report},null,2));
if(failures){console.error(`[pulse-home-v6-browser] FAIL · ${failures} assertion(s)`);process.exit(1)}
console.log(`[pulse-home-v6-browser] PASS · desktop + iPad + mobile · reference Motion Today 84 · ${uniqueStyles.length} stylesheet layers tested`);
