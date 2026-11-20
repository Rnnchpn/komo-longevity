import assert from 'node:assert/strict';
import {createAudioFeedback} from '../pulse-v14-src/motion-engine/audio-feedback.js';
// La posture frontale de l'ancienne offre à distance est retirée ; la posture de profil est testée par pulse-profile-unipodal-qa.
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
console.log('[pulse-audio-posture-qa] local click synthesis and spoken cues passed');
