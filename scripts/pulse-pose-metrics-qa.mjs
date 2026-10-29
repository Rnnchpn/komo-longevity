import assert from 'node:assert/strict';
import {createMovementTracker,frameInfo,jointAngle} from '../pulse-v14-src/online/session/metrics.mjs';
const empty=()=>Array.from({length:33},()=>({x:.4,y:.5,visibility:.1}));
function person(mode='seated'){
 const p=empty();
 const seated=mode==='seated';
 for(const x of [0,.05]){
  const indexes=x===0?[11,23,25,27,29,15]:[12,24,26,28,30,16];
  const coords=seated?[[.4,.23],[.40,.53],[.62,.56],[.62,.88],[.62,.94],[.43,.67]]:
    [[.42,.19],[.42,.46],[.42,.68],[.42,.88],[.42,.95],[.43,.7]];
  indexes.forEach((i,j)=>{p[i]={x:coords[j][0]+x,y:coords[j][1],visibility:.96};});
 }
 return p;
}
function observeFor(tracker,mode,start,count=5,step=130){
 for(let i=0;i<count;i++)tracker.observe(mode===null?null:person(mode),start+i*step);
}
const angle=jointAngle({x:0,y:0},{x:0,y:1},{x:1,y:1});
assert.ok(angle>80&&angle<100);
assert.equal(frameInfo(null).valid,false);
assert.equal(frameInfo(person('seated'),'sts').valid,true);
assert.equal(frameInfo(person('standing'),'sts').valid,true);
{
 const tracker=createMovementTracker('sts');
 observeFor(tracker,'seated',100,5);
 observeFor(tracker,'standing',800,5);
 assert.equal(tracker.summary().count,1,'one complete stand counts once');
 observeFor(tracker,'standing',1500,5);
 assert.equal(tracker.summary().count,1,'no double count while still standing');
 observeFor(tracker,'seated',2300,5);
 observeFor(tracker,'standing',3000,5);
 assert.equal(tracker.summary().count,2,'two distinct cycles count twice');
 const before=tracker.summary().count;
 observeFor(tracker,null,4000,5);
 assert.equal(tracker.summary().count,before,'lost person never counts');
 tracker.reset();assert.equal(tracker.summary().count,0);
}
{
 const tracker=createMovementTracker('arms');
 const up=person('standing'),down=person('standing');
 for(const k of [15,16]){up[k]={...up[k],y:.07};down[k]={...down[k],y:.6};}
 for(let i=0;i<5;i++)tracker.observe(down,100+i*130);
 for(let i=0;i<5;i++)tracker.observe(up,850+i*130);
 assert.equal(tracker.summary().count,1,'bilateral arm raise counts');
}
{
 const tracker=createMovementTracker('heels');
 const down=person('standing'),raised=person('standing');
 for(const k of [23,24])raised[k]={...raised[k],y:.40};
 for(let i=0;i<5;i++)tracker.observe(down,100+i*130);
 for(let i=0;i<5;i++)tracker.observe(raised,850+i*130);
 assert.equal(tracker.summary().count,1,'exploratory heel-rise proxy counts');
}
{
 const tracker=createMovementTracker('balance');
 for(let i=0;i<6;i++)tracker.observe(person('standing'),100+i*130);
 for(let i=0;i<4;i++)tracker.observe(null,1000+i*130);
 assert.ok(tracker.summary().visibilityRatio<1,'missing landmarks reduce quality');
 assert.equal(tracker.summary().count,0,'do not invent a balance score');
}
console.log('[pulse-pose-metrics-qa] pose visibility, knee transitions, repetition de-bounce and safety gates passed');
