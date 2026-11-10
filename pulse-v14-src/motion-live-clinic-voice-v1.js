// Speech controls reused from Motion Online, on the CLINICIAN DESKTOP ONLY.
// Browser speech recognition may be provided by the browser vendor; no audio or
// transcripts are transmitted to KŌMØ Pulse or stored in its database.
import {createVoiceControl} from './online/session/voice-control.js';
import {createAudioFeedback} from './online/session/audio-feedback.js';

export function createClinicVoice({onAction,onStatus}={}){
 let disposed=false,voice=null,sequence=0;
 const audio=createAudioFeedback({
  onSpeechStart:()=>{if(!disposed)voice?.suspend()},
  onSpeechEnd:()=>{if(!disposed)voice?.resume()}
 });
 voice=createVoiceControl({
  onCommand:action=>{if(!disposed)onAction?.(action)},
  onStatus:(message,state)=>{if(!disposed)onStatus?.(message,state)}
 });
 function toggle(){
  if(disposed)return false;
  if(voice.isEnabled()){voice.disable();return false}
  audio.unlock();return voice.enable();
 }
 async function countdown(onTop,onStep=()=>{}){
  if(disposed)return false;
  sequence++;const id=sequence;
  audio.unlock();
  const outcome=await audio.countdown(value=>{if(id===sequence&&!disposed)onStep(value)},
   ()=>{if(id===sequence&&!disposed)onTop()},{audible:true});
  return outcome&&id===sequence&&!disposed;
 }
 function abortCountdown(){sequence++;audio.cancel()}
 function milestone(seconds){
  if(!disposed&&[20,10,5,3,2,1].includes(seconds))void audio.milestone(seconds);
 }
 function complete(){
  if(disposed)return;
  audio.chime();
  void audio.say("Temps écoulé.",{rate:1.12,timeout:1800});
 }
 function destroy(){
  disposed=true;sequence++;voice?.destroy();audio.destroy();voice=null;
 }
 return {toggle,countdown,abortCountdown,milestone,complete,destroy,
  supported:voice.supported,isEnabled:()=>Boolean(voice?.isEnabled())};
}
