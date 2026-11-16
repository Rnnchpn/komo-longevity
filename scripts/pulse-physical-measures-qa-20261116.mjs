import assert from 'node:assert/strict';
import {createMovementTracker} from '../pulse-v14-src/online/session/metrics.mjs';

// Synthetic frames test state-machine safeguards, not clinical measurement accuracy.
const empty=()=>Array.from({length:33},()=>({x:.5,y:.5,visibility:.08}));
function pose(kind){
 const p=empty();
 const profiles={
  seated:[[.40,.23],[.40,.53],[.62,.56],[.62,.88]],
  standing:[[.42,.19],[.42,.46],[.42,.68],[.42,.88]],
  // A straight knee without rising from the chair must not count as a full stand.
  knee_only:[[.42,.23],[.42,.53],[.42,.68],[.42,.88]]
 };
 for(const [side,ids] of [[0,[11,23,25,27]],[.05,[12,24,26,28]]]){
  profiles[kind].forEach(([x,y],i)=>{p[ids[i]]={x:x+side,y,visibility:.97};});
 }
 return p;
}
function hold(counter,kind,from,to,step=100){
 for(let at=from;at<=to;at+=step)counter.observe(pose(kind),at);
}
const normal=createMovementTracker('sts');
hold(normal,'seated',100,500);
hold(normal,'standing',700,1200);
assert.equal(normal.summary().count,1,'one complete seated-to-standing rise counts once');
hold(normal,'standing',1300,2100);
assert.equal(normal.summary().count,1,'standing still cannot double-count');
hold(normal,'seated',2300,2900);
hold(normal,'standing',3100,3700);
assert.equal(normal.summary().count,2,'a second complete rise after sitting counts once');

const falseRise=createMovementTracker('sts');
hold(falseRise,'seated',100,600);
hold(falseRise,'knee_only',800,1400);
assert.equal(falseRise.summary().count,0,'knee extension alone must not count');
hold(falseRise,'standing',1600,2100);
assert.equal(falseRise.summary().count,1,'full pelvis elevation can complete the same attempt');

const dropped=createMovementTracker('sts');
hold(dropped,'seated',100,600);
hold(dropped,'standing',1900,2500);
assert.equal(dropped.summary().count,0,'unseen >650 ms gap cannot produce a repetition');

const irregular=createMovementTracker('sts');
hold(irregular,'seated',100,500);
irregular.observe(null,600);
hold(irregular,'standing',700,1200);
assert.equal(irregular.summary().count,1,'short, recovered occlusion preserves legitimate transitions');

normal.reset();
assert.equal(normal.summary().count,0,'redo restores an empty measurement');
console.log('[pulse-physical-measures-qa] PASS: full rise, non-rise rejection, repeated rises, frozen video, brief occlusion, redo');
