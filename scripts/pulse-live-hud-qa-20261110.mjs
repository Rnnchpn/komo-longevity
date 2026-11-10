import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createMovementTracker,frameInfo} from '../pulse-v14-src/online/session/metrics.mjs';
const root=process.cwd();
const [ui,css,pose]=await Promise.all([
 'site/pulse-v14/motion-live-operator-consult-v1.js',
 'site/pulse-v14/motion-live-operator-consult-v1.css',
 'site/pulse-v14/motion-live-remote-pose-v1.js'
].map(p=>readFile(join(root,p),'utf8')));
assert.ok(ui.includes('id="mocLiveCount"'),'large real-time count visible');
assert.ok(ui.includes('moc-clock-figure')&&ui.includes('moc-rep-figure'),'dual HUD');
assert.ok(ui.includes('detected>previous')&&ui.includes('tile.textContent!==String(detected)'),'updates only when real repetitions increase');
assert.ok(ui.includes('if(input&&!manualEdited)input.value=String(detected)'),'manual entry never overwritten');
assert.ok(ui.includes('moc-count-verified'),'detection state visible');
assert.ok(css.includes('grid-template-columns:minmax(390px,.84fr) minmax(420px,1.16fr)'),'camera gets majority of desktop width');
assert.ok(css.includes('font-size:clamp(60px,5.4vw,84px)')||css.includes('clamp(60px,5.4vw,84px)'),'large stopwatch');
assert.ok(css.includes('moc-rep-figure strong')&&css.includes('moc-live-hud'),'large live count');
assert.ok(pose.includes('repetition.summary().count')&&pose.includes('even if an individual frame is'));
assert.ok(!pose.includes('getUserMedia'),'counts on iPhone stream, not laptop webcam');
// Synthetic full-body standing/seated pose. The new portrait crop margin
// tolerates 30% body height without weakening knee-angle and visibility guards.
const empty=()=>Array.from({length:33},()=>({x:.4,y:.5,visibility:.1}));
function person(seated){
 const p=empty();
 const coords=seated?[[.40,.25],[.40,.42],[.62,.45],[.62,.58]]:
  [[.42,.24],[.42,.40],[.42,.49],[.42,.58]];
 for(const offset of [0,.05]){
  const ids=offset?[12,24,26,28]:[11,23,25,27];
  ids.forEach((id,i)=>p[id]={x:coords[i][0]+offset,y:coords[i][1],visibility:.97});
 }
 return p;
}
assert.equal(frameInfo(person(true),'sts').valid,true,'slightly smaller full-body seated pose visible');
assert.equal(frameInfo(person(false),'sts').valid,true,'slightly smaller full-body standing pose visible');
const counter=createMovementTracker('sts');
for(let i=0;i<6;i++)counter.observe(person(true),100+i*100);
for(let i=0;i<6;i++)counter.observe(person(false),800+i*100);
assert.equal(counter.summary().count,1,'first stand counted once');
for(let i=0;i<6;i++)counter.observe(null,1600+i*100);
assert.equal(counter.summary().count,1,'occlusion does not reset count');
for(let i=0;i<6;i++)counter.observe(person(true),2400+i*100);
for(let i=0;i<6;i++)counter.observe(person(false),3300+i*100);
assert.equal(counter.summary().count,2,'second stand counted, no bounce');
console.log('[pulse-live-hud-qa] PASS large timer, majority-width camera, live repetition counter and occlusion persistence');
