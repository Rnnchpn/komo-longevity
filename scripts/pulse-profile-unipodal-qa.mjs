import assert from 'node:assert/strict';
import {sideProfileFrame,surfaceSagittalIndex,createSideProfileStability} from '../pulse-v14-src/online/session/profile-photo-metrics.mjs';
import {oneLegFrame,createOneLegObserver} from '../pulse-v14-src/online/session/unipodal-metrics.mjs';
const pts=()=>Array.from({length:33},()=>({x:.5,y:.5,visibility:0.12}));
function side(){
 const p=pts();
 for(const [i,x,y] of [[0,.56,.10],[11,.50,.24],[12,.51,.25],[23,.47,.52],[24,.48,.52],
  [25,.49,.7],[26,.5,.7],[27,.49,.91],[28,.5,.91]])p[i]={x,y,visibility:.95};
 return p;
}
{
 const p=side();const f=sideProfileFrame(p);
 assert.equal(f.valid,true,'side silhouette recognized');
 assert.ok(f.height>.35);
 const ratio=surfaceSagittalIndex({x:.53,y:.2},{x:.46,y:.55},.65);
 assert.ok(ratio>10&&ratio<11);
 assert.equal(surfaceSagittalIndex(null,{x:.46},.65),null);
 const facing=side();facing[12].x=.85;facing[24].x=.82;
 assert.equal(sideProfileFrame(facing).valid,false,'front is rejected');
 const stable=createSideProfileStability();
 let frame;
 for(let i=0;i<27;i++)frame=stable.observe(side(),i*105);
 assert.equal(frame.ready,true,'stable side auto-photo triggers after ~2.3 s');
 stable.reset();
 for(let i=0;i<10;i++)stable.observe(side(),i*100);
 const move=side();move[11].x+=.07;move[12].x+=.07;
 frame=stable.observe(move,1050);
 assert.equal(frame.ready,false,'movement resets photo stability');
 const cropped=side();cropped[27].x=.99;
 assert.equal(sideProfileFrame(cropped).valid,false);
}
function frontal(rightRaised=false,leftRaised=false){
 const p=pts();
 for(const [i,x,y] of [[11,.40,.19],[12,.6,.19],[23,.43,.46],[24,.57,.46],
  [25,.43,.65],[26,.57,.65],[27,.43,leftRaised ? .72 : .91],[28,.57,rightRaised ? .72 : .91]]){
  p[i]={x,y,visibility:.96};
 }
 return p;
}
{
 assert.equal(oneLegFrame(frontal(), 'left').lifted,false);
 assert.equal(oneLegFrame(frontal(true,false),'left').lifted,true);
 assert.equal(oneLegFrame(frontal(false,true),'right').lifted,true);
 const record=createOneLegObserver('left');
 let result;
 for(let i=0;i<14;i++)result=record.observe(frontal(true,false),i*100);
 assert.equal(result.started,true,'timer auto starts after raised foot stable');
 for(let i=14;i<42;i++)result=record.observe(frontal(true,false),i*100);
 assert.ok(result.seconds>=2,'time increases while foot raised');
 for(let i=42;i<50;i++)result=record.observe(frontal(),i*100);
 assert.equal(result.stopped,true,'timer ends when foot lowered');
 assert.ok(record.summary().seconds>=2);
 const side=frontal(true,false);side[28].visibility=.01;
 assert.equal(oneLegFrame(side,'left').valid,false,'occluded ankle rejects balance measurement');
 record.reset();
 assert.equal(record.summary().seconds,0);
}
console.log('[pulse-profile-unipodal-qa] side quality, stable photo, ratio, two stance sides, auto start/stop passed');
