import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createOneLegObserver,oneLegFrame} from '../pulse-v14-src/motion-engine/unipodal-metrics.mjs';
import {buildClinicPassport} from '../pulse-v14-src/motion-live-clinic-passport-v2.mjs';
const pts=()=>Array.from({length:33},()=>({x:.5,y:.5,visibility:.1}));
function pose({raised='none',occluded=false,small=false}={}){
 const p=pts();
 const top=small?.29:.18;
 const stanceAnkle=small?.63:.90;
 const liftedAnkle=small?.55:.73;
 const coords=[[11,.41,top],[12,.59,top],[23,.44,.46],[24,.56,.46],
  [25,.44,.65],[26,.56,.65],[27,.44,raised==='left'?liftedAnkle:stanceAnkle],
  [28,.56,raised==='right'?liftedAnkle:stanceAnkle]];
 for(const [id,x,y] of coords)p[id]={x,y,visibility:occluded&&id===28?.05:.96};
 return p;
}
assert.equal(oneLegFrame(pose(),'left').lifted,false);
assert.equal(oneLegFrame(pose({raised:'right'}),'left').lifted,true);
assert.equal(oneLegFrame(pose({raised:'left'}),'right').lifted,true);
const meter=createOneLegObserver('left',30000);
let r;
for(let i=0;i<500;i++)r=meter.observe(pose(),i*100);
assert.equal(meter.summary().state,'waiting','not started after 50 seconds with both feet down');
assert.equal(meter.summary().seconds,0,'no time accumulated until the opposite foot rises');
r=meter.observe(pose({raised:'right'}),50000);
assert.equal(r.state,'candidate','first raised frame alone does not trigger clock');
for(let i=1;i<=6;i++)r=meter.observe(pose({raised:'right'}),50000+i*100);
assert.equal(r.state,'running','stable lifted foot arms automatic timer');
assert.ok(r.seconds>=.5&&r.seconds<=.7,'back-date to first confirmed lift frame');
for(let i=7;i<55;i++)r=meter.observe(pose({raised:'right'}),50000+i*100);
assert.ok(r.seconds>5,'time follows sustained unipodal stance');
for(let i=55;i<59;i++)r=meter.observe(pose(),50000+i*100);
assert.equal(r.state,'completed','return of foot to ground stops automatically');
assert.equal(r.reason,'foot_contact');
const seconds=r.seconds;
for(let i=59;i<180;i++)r=meter.observe(pose({raised:'right'}),50000+i*100);
assert.equal(r.seconds,seconds,'do not extend once foot has returned');
meter.reset();
for(let i=0;i<7;i++)meter.observe(pose({raised:'right'}),i*100);
for(let i=7;i<310;i++)r=meter.observe(pose({raised:'right'}),i*100);
assert.equal(r.state,'completed','30 seconds is the maximum');
assert.equal(r.reason,'limit');
assert.equal(r.seconds,30);
meter.reset();
for(let i=0;i<7;i++)meter.observe(pose({raised:'right'}),i*100);
for(let i=7;i<21;i++)r=meter.observe(pose({raised:'right'}),i*100);
for(let i=21;i<29;i++)r=meter.observe(null,i*100);
assert.equal(r.state,'completed','camera loss stops instead of faking duration');
assert.equal(r.reason,'camera_lost');
assert.ok(r.seconds<3,'no extra time added by tracking-loss debounce');
meter.reset();
r=meter.observe(pose({raised:'right'}),0);
r=meter.observe(pose(),100);
assert.equal(meter.summary().started,false,'one-frame false lift ignored');
const right=createOneLegObserver('right');
for(let i=0;i<7;i++)right.observe(pose({raised:'left'}),i*100);
assert.equal(right.summary().started,true,'right-foot stance independently detected');
assert.equal(oneLegFrame(pose({occluded:true}),'left').valid,false,'occluded free ankle is invalid');
assert.equal(oneLegFrame(pose({small:true,raised:'right'}),'left').valid,true,'portrait-sized body remains detectable');
const [ui,remote,edge,protocol]=await Promise.all([
 'site/pulse-v14/motion-live-operator-consult-v1.js',
 'site/pulse-v14/motion-live-remote-pose-v1.js',
 'supabase/functions/motion-live-test/index.ts',
 'site/pulse-v14/motion-protocol.mjs'
].map(p=>readFile(join(process.cwd(),p),'utf8')));
assert.ok(protocol.includes("kind:'balance'")&&protocol.includes("duration:30,unit:'seconds'")&&ui.includes('balance:"balance"'));
assert.ok(ui.includes('isBalance(currentTest())')&&ui.includes('await submit(action)'));
assert.ok(ui.includes('Le chrono ne démarre pas avant la détection')||ui.includes('le chrono ne démarre'));
assert.ok(ui.includes('balanceElapsed')&&ui.includes('mocLiveBalance'));
assert.ok(ui.includes('payload.measurement_quality'));
assert.ok(remote.includes('createOneLegObserver(step==="unipodal_left"?"left":"right",30000)'));
assert.ok(remote.includes('balance.observe(points,at)')&&remote.includes('balanceState'));
assert.ok(protocol.includes("id:'unipodal_left'")&&protocol.includes("max:30,integer:false")&&edge.includes('SPEC.steps.filter((x:any)=>["count","balance"].includes(x.kind))'));
assert.ok(edge.includes('SOLEO_EYES_OPEN_30S_OPERATOR_SUPERVISED_V1'));
const results={
 unipodal_left:{status:'done',value:30,unit:'seconds',source:'operator_confirmed_video_estimate',
 protocol:'SOLEO_EYES_OPEN_30S_OPERATOR_SUPERVISED_V1'},
 unipodal_right:{status:'done',value:8.2,unit:'seconds',source:'operator_manual_observation',
 protocol:'SOLEO_EYES_OPEN_30S_OPERATOR_SUPERVISED_V1'}
};
const report=buildClinicPassport({ageBand:'70-79'},results,{date:new Date('2026-11-10'),real:true});
assert.equal(report.measures.find(x=>x.id==='unipodal_left').value,30);
assert.equal(report.measures.find(x=>x.id==='unipodal_left').ceiling,true,'30 s = plafond du protocole');
assert.equal(report.measures.find(x=>x.id==='unipodal_right').value,8.2);
assert.equal(report.outcomes.motionScore,null,'no invented clinical longevity score');
console.log('[pulse-balance-30-qa] PASS: lift triggered 30s, foot-down stop, camera-loss stop, false-lift rejection, side specificity, backend and PDF');
