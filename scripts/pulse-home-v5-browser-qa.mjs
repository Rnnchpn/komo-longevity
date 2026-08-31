import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const base=process.env.PULSE_HOME_QA_BASE||'http://127.0.0.1:4173';
const pulse=join(process.cwd(),'site','pulse-v12');
const out=join(process.cwd(),'artifacts','pulse-home-v5');
await mkdir(out,{recursive:true});

const finalHtml=await readFile(join(pulse,'index.html'),'utf8');
const styles=[...finalHtml.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
const uniqueStyles=[...new Set(styles)];
const links=uniqueStyles.map(href=>`<link rel="stylesheet" href="${href}">`).join('\n');

const fixture=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Pulse Home V5 QA</title>${links}</head><body>
<div id="appShell"><header class="topbar"><span id="pageEyebrow"></span><h1 id="pageTitle"></h1><button class="avatar-button" type="button">A</button></header><main id="viewRoot" class="view-root"><div data-my-komo-home data-home-owner="patient-home-command-v1"></div></main></div>
<script>
(() => {
  const overview={records:[{motion:{status:'completed',updated_at:'2026-08-28T10:00:00Z'},score:{motion_score:78,motion_age:44,release_status:'released',calculated_at:'2026-08-28T10:00:00Z'},next_appointment:{scheduled_start:'2026-09-02T09:30:00+02:00',appointment_type:'Bilan Motion',center_name:'KŌMØ Riviera'}}],summary:{}};
  const walk={connected:true,steps_today:6234,active_minutes_today:42,steps_avg_7d:5500,coverage_7d:.93,k_points_week:180,walk_club:{rank:7}};
  const history=[{overall_score:78,motion_age:44,status:'released',computed_at:'2026-08-28T10:00:00Z'},{overall_score:76,motion_age:45,status:'released',computed_at:'2026-06-20T10:00:00Z'}];
  const fakeClient={
    auth:{getSession:async()=>({data:{session:{user:{id:'qa-user'}}}})},
    functions:{invoke:async(name,{body}={})=>({data:body?.action==='overview'?overview:{role:'member',reply:{headline:'QA',answer:'QA',suggested_actions:[]}},error:null})},
    rpc:async(name)=>({data:name==='komo_walk_summary'?walk:null,error:null}),
    from:()=>{const chain={select(){return chain},eq(){return chain},order(){return chain},limit(){return Promise.resolve({data:history,error:null})}};return chain;}
  };
  window.KomoRuntime={client:fakeClient,role:'member',getContext:()=>({role:'member',profile:{first_name:'Alex'},client:fakeClient})};
  window.KomoPatientNavigation={route:()=> 'home',go:r=>{window.__qaNavigation=r}};
})();
</script>
<script type="module" src="./patient-home-command-v1.js"></script></body></html>`;
await writeFile(join(pulse,'__home-v5-qa.html'),fixture,'utf8');

const viewports=[
  {name:'desktop',width:1440,height:1000,isMobile:false,hasTouch:false},
  {name:'ipad',width:1024,height:1366,isMobile:false,hasTouch:true},
  {name:'mobile',width:390,height:844,isMobile:true,hasTouch:true}
];

const browser=await chromium.launch({headless:true});
let failures=0;
const report=[];

function near(a,b,tolerance=3){return Math.abs(a-b)<=tolerance}
function luminance([r,g,b]){return .2126*r+.7152*g+.0722*b}
function rgb(value){const m=String(value).match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);return m?[+m[1],+m[2],+m[3]]:[0,0,0]}

async function runViewport(vp){
  const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,hasTouch:vp.hasTouch,deviceScaleFactor:1});
  const page=await context.newPage();
  const consoleErrors=[];const pageErrors=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(`${base}/pulse-v12/__home-v5-qa.html`,{waitUntil:'networkidle'});
  await page.waitForSelector('[data-khome-v5]:not(.is-loading)',{timeout:10000});
  await page.waitForTimeout(780);

  const state=await page.evaluate((name)=>{
    const q=s=>document.querySelector(s);const r=s=>q(s)?.getBoundingClientRect();
    const visible=s=>{const el=q(s);if(!el)return false;const cs=getComputedStyle(el),box=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&box.width>0&&box.height>0};
    const signals=[...document.querySelectorAll('.kh5-signals .kh5-signal')];
    const fontSizes=[...document.querySelectorAll('.kh5 *')].filter(el=>{const box=el.getBoundingClientRect();return box.width>0&&box.height>0}).map(el=>parseFloat(getComputedStyle(el).fontSize)).filter(Number.isFinite);
    return {
      name,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      bodyBg:getComputedStyle(document.body).backgroundColor,
      shellBg:getComputedStyle(q('#appShell')).backgroundColor,
      motionBg:getComputedStyle(q('.kh5-motion')).backgroundColor,
      komoBg:getComputedStyle(q('.kh5-komo')).backgroundColor,
      owner:q('[data-my-komo-home]')?.dataset.khomeOwner||'',
      visible:{home:visible('.kh5'),motion:visible('.kh5-motion'),komo:visible('.kh5-komo'),signals:visible('.kh5-signals'),key:visible('.kh5-signal-key'),score:visible('.kh5-score'),cta:visible('.kh5-komo>button')},
      motion:r('.kh5-motion'),komo:r('.kh5-komo'),signals:r('.kh5-signals'),key:r('.kh5-signal-key'),cta:r('.kh5-komo>button'),
      signalCount:signals.length,firstSignal:signals[0]?.className||'',
      minFont:fontSizes.length?Math.min(...fontSizes):0,
      topbarDisplay:getComputedStyle(q('.topbar')).display,
      motionScore:q('[data-kh5-score]')?.textContent?.trim()||'',
      motionAge:q('.kh5-age strong')?.textContent?.trim()||'',
      interpretation:q('.kh5-interpretation')?.textContent?.trim()||''
    };
  },vp.name);

  const stableA=await page.locator('.kh5-signal-key').boundingBox();
  await page.waitForTimeout(1100);
  const stableB=await page.locator('.kh5-signal-key').boundingBox();
  const errors=[];
  if(state.scrollWidth>state.width+1)errors.push(`horizontal overflow ${state.scrollWidth}>${state.width}`);
  for(const [key,ok] of Object.entries(state.visible))if(!ok)errors.push(`${key} not visible`);
  if(state.owner!=='patient-home-command-v1@5')errors.push(`owner=${state.owner}`);
  if(state.signalCount!==3)errors.push(`signal count=${state.signalCount}`);
  if(!state.firstSignal.includes('kh5-signal-key'))errors.push('KEY is not first monitoring signal');
  if(state.motionScore!=='78')errors.push(`Motion Score=${state.motionScore}`);
  if(state.motionAge!=='44 ans')errors.push(`Motion Age=${state.motionAge}`);
  if(!state.interpretation.includes('progressé'))errors.push('trajectory interpretation missing');
  if(luminance(rgb(state.bodyBg))<165&&luminance(rgb(state.shellBg))<165)errors.push(`Home canvas remained dark: ${state.bodyBg}/${state.shellBg}`);
  if(luminance(rgb(state.motionBg))<150)errors.push(`Motion surface is not light premium: ${state.motionBg}`);
  if(luminance(rgb(state.komoBg))>120)errors.push(`Komo priority surface lost forest contrast: ${state.komoBg}`);
  if(stableA&&stableB&&(!near(stableA.x,stableB.x)||!near(stableA.y,stableB.y)))errors.push(`KEY moved after render (${Math.round(stableA.x)},${Math.round(stableA.y)}) -> (${Math.round(stableB.x)},${Math.round(stableB.y)})`);

  if(vp.name==='desktop'||vp.name==='ipad'){
    if(!(state.motion&&state.komo&&state.motion.left<state.komo.left&&near(state.motion.top,state.komo.top,6)))errors.push('desktop/iPad hero is not a stable two-column composition');
  }
  if(vp.name==='mobile'){
    if(!(state.motion&&state.komo&&state.komo.top>state.motion.bottom-2))errors.push('mobile hero is not vertically composed');
    if(state.cta?.height<44)errors.push(`mobile primary CTA ${Math.round(state.cta?.height||0)}px`);
    if(state.minFont<6)errors.push(`unexpected microscopic text ${state.minFont}px`);
  }
  if(consoleErrors.length)errors.push(`console: ${consoleErrors.join(' | ')}`);
  if(pageErrors.length)errors.push(`page: ${pageErrors.join(' | ')}`);

  await page.screenshot({path:join(out,`pulse-home-v5-${vp.name}.png`),fullPage:true});
  console.log(`[pulse-home-v5-browser] ${errors.length?'FAIL':'PASS'} · ${vp.name} ${vp.width}x${vp.height} · owner=${state.owner} · signals=${state.signalCount} · overflow=${state.scrollWidth}/${state.width}`);
  for(const e of errors)console.error(`[pulse-home-v5-browser] ${vp.name} · ${e}`);
  failures+=errors.length;report.push({viewport:vp.name,state,errors});
  await context.close();
}

for(const vp of viewports)await runViewport(vp);

const reduced=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const rp=await reduced.newPage();
await rp.goto(`${base}/pulse-v12/__home-v5-qa.html`,{waitUntil:'networkidle'});
await rp.waitForSelector('[data-khome-v5]:not(.is-loading)');
const reducedState=await rp.evaluate(()=>({enter:getComputedStyle(document.querySelector('.kh5-enter')).animationName,meter:getComputedStyle(document.querySelector('.kh5-meter i')).animationName,score:document.querySelector('[data-kh5-score]')?.textContent?.trim()}));
if(reducedState.enter!=='none'||reducedState.meter!=='none'||reducedState.score!=='78'){
  failures++;console.error(`[pulse-home-v5-browser] reduced motion FAIL · ${JSON.stringify(reducedState)}`);
}else console.log('[pulse-home-v5-browser] PASS · reduced motion removes entry/meter animation and keeps score final');
await reduced.close();
await browser.close();
await writeFile(join(out,'report.json'),JSON.stringify({generated_at:new Date().toISOString(),stylesheets:uniqueStyles.length,report},null,2));
if(failures){console.error(`[pulse-home-v5-browser] FAIL · ${failures} assertion(s)`);process.exit(1)}
console.log(`[pulse-home-v5-browser] PASS · desktop + iPad + mobile + reduced motion · ${uniqueStyles.length} final stylesheet layers tested`);