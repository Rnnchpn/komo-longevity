import assert from 'node:assert/strict';
import {observeFrontalPosture,createPostureRecorder} from '../pulse-v14-src/online/session/posture-metrics.mjs';
import {createAudioFeedback} from '../pulse-v14-src/online/session/audio-feedback.js';
const pose=()=>{
 const p=Array.from({length:33},()=>({x:.5,y:.5,visibility:.1}));
 const vals={0:[.51,.10],11:[.34,.29],12:[.66,.29],23:[.41,.56],24:[.59,.56],25:[.41,.74],26:[.59,.74],27:[.41,.93],28:[.59,.93]};
 for(const [index,xy] of Object.entries(vals))p[Number(index)]={x:xy[0],y:xy[1],visibility:.97};
 return p;
};
const good=pose();
assert.equal(observeFrontalPosture(good).valid,true);
assert.equal(observeFrontalPosture(null).valid,false);
const mirrored=good.map(v=>({...v,x:1-v.x}));
assert.equal(observeFrontalPosture(mirrored).valid,true,'mirrored webcam should keep absolute line tilt');
const tilted=pose();tilted[12].y+=.020;tilted[24].y+=.015;
const measured=observeFrontalPosture(tilted);
assert.ok(measured.shoulderTilt>3&&measured.shoulderTilt<5);
assert.ok(measured.hipTilt>4&&measured.hipTilt<6);
const recorder=createPostureRecorder();
for(let i=0;i<28;i++)recorder.observe(tilted);
const summary=recorder.summary();
assert.equal(summary.valid,true);
assert.ok(summary.goodFrames>=15);
assert.ok(Number.isFinite(summary.headOffset));
recorder.reset();
for(let i=0;i<5;i++)recorder.observe(tilted);
assert.equal(recorder.summary().valid,false,'insufficient frames are not reported as measurements');
const missing=pose();missing[11].visibility=.01;
assert.equal(observeFrontalPosture(missing).valid,false);
const cropped=pose();cropped[0].y=.001;
assert.equal(observeFrontalPosture(cropped).valid,false);
const previousWindow=globalThis.window;
let calls=0,stops=0;
class FakeAudioContext{
 constructor(){this.state='running';this.currentTime=0;this.destination={};}
 createOscillator(){return{type:'sine',frequency:{setValueAtTime(){}},connect(){return this;},start(){calls++},stop(){stops++}}}
 createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;}}}
 close(){return Promise.resolve();}
}
globalThis.window={AudioContext:FakeAudioContext};
const speaker=createAudioFeedback();
speaker.unlock();
assert.equal(speaker.click(),true,'local repetition click is generated without external audio files');
assert.equal(calls,1);
assert.equal(stops,1);
speaker.cancel();speaker.destroy();
globalThis.window=previousWindow;
console.log('[pulse-audio-posture-qa] frontal alignment, mirroring, sample confidence and local click synthesis passed');
