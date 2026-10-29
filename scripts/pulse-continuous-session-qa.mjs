import assert from 'node:assert/strict';
import {saveProgress,loadProgress,clearProgress,PROGRESS_KEY} from '../pulse-v14-src/online/session/session-progress.mjs';
const data=new Map();
const storage={setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k)||null,removeItem:k=>data.delete(k)};
const state={page:3,questionStep:4,task:5,returnToSummary:false,
 answers:{ageBand:'50-59',goal:'walk',walk10:'2',pain:'1',safety:'no',secret:'DROP'},
 checks:new Set(['chair','space','support','device','secret']),
 results:{sts:{status:'done',value:12,quality:87,source:'webcam',
  mediaStream:'SHOULD NOT STORE',rawVideo:'CAMERA FRAMES'},
 posture:{status:'done',value:8.5,posture:{valid:true,surfaceIndexPct:8.5,
  baseImage:'SECRET_IMAGE',neck:{x:.5}}},secret:{status:'done',value:99}},
 stream:{tracks:['VIDEO_BINARY']},engine:'MediaPipe',voice:'audio'};
assert.equal(saveProgress(storage,state,1_000),true);
const raw=data.get(PROGRESS_KEY);
for(const token of ['SHOULD NOT STORE','CAMERA FRAMES','SECRET_IMAGE','VIDEO_BINARY','SECRET','MediaPipe']){
 assert.ok(!raw.includes(token),'raw media/unknown content must not persist: '+token);
}
const restored=loadProgress(storage,1_001);
assert.equal(restored.page,3);
assert.equal(restored.task,5);
assert.equal(restored.questionStep,4);
assert.equal(restored.results.sts.value,12);
assert.equal(restored.results.posture.posture.surfaceIndexPct,8.5);
assert.equal(restored.results.sts.rawVideo,undefined);
assert.equal(restored.checks.length,4);
assert.equal(restored.answers.walk10,'2');
assert.equal(restored.stream,undefined);
assert.equal(restored.voice,undefined);
assert.equal(loadProgress(storage,1_000+4*60*60*1000+1),null,'expires after 4h');
assert.equal(data.has(PROGRESS_KEY),false);
saveProgress(storage,{...state,answers:{...state.answers,safety:'yes'}},1_000);
assert.equal(loadProgress(storage,1_001).page,2,'safety interruption returns user to safety step');
clearProgress(storage);assert.equal(loadProgress(storage),null);

let opens=0,stops=0,speechStarts=0,speechStops=0;
const track={readyState:'live',stop(){stops++;this.readyState='ended'}};
const mediaStream={getVideoTracks(){return[track]},getTracks(){return[track]}};
class FakeRecognition{
 start(){speechStarts++;this.onstart?.();}
 abort(){speechStops++;this.onend?.();}
}
globalThis.window={
 isSecureContext:true,
 mediaDevices:{getUserMedia:async opts=>{assert.equal(opts.audio,false);opens++;return mediaStream;}},
 SpeechRecognition:FakeRecognition,
 speechSynthesis:{cancel(){}}
};
globalThis.document={hidden:false};
const {sharedMotionMedia}=await import('../pulse-v14-src/online/session/shared-media.js');
const first=await sharedMotionMedia.ensureCamera();
const second=await sharedMotionMedia.ensureCamera();
assert.equal(first,second);
assert.equal(opens,1,'camera must only be requested once');
const video={srcObject:null,hidden:true,pause(){this.paused=true}};
assert.equal(sharedMotionMedia.attachVideo(video),true);
assert.equal(video.srcObject,first);
sharedMotionMedia.detachVideo(video);
assert.equal(video.srcObject,null);
assert.equal(track.readyState,'live','detaching between tests must not stop media track');
assert.equal(sharedMotionMedia.attachVideo(video),true,'same live track reattached to next test');
const v1=sharedMotionMedia.attachVoice({onCommand(){}});
assert.equal(v1.supported,true);
v1.enable();
assert.equal(v1.isEnabled(),true);
v1.destroy(); // detach test 1 handlers, do not stop microphone
const v2=sharedMotionMedia.attachVoice({onCommand(){}});
assert.equal(v2.isEnabled(),true,'voice recognition persists between tests');
assert.equal(speechStarts,1,'single microphone recognition session');
v2.destroy();
sharedMotionMedia.stopAll();
assert.equal(stops,1,'video track stops upon leaving consultation');
assert.equal(speechStops,1,'microphone stops upon leaving consultation');
assert.equal(sharedMotionMedia.getStream(),null);
console.log('[pulse-continuous-session-qa] 4h progress, no raw media, single shared camera, voice handoff and cleanup passed');
