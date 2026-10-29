// A single user-authorized camera stream and speech-recognition session for all
// Motion tests. Live video/audio never leave this module for storage or upload.
import {createVoiceControl} from './voice-control.js';
import {createAudioFeedback} from './audio-feedback.js';

let stream=null,voice=null,activeVoiceHandler=null,voiceStatus={text:'Microphone désactivé',mode:'off'};
let cameraAllowed=false,microphoneAllowed=false,speakerEnabled=true,cameraEpoch=0;
const beep= createAudioFeedback();
const readySignaled=new Set();
function availableCamera(){
 if(!stream)return false;
 const tracks=stream.getVideoTracks();
 if(!tracks.length||!tracks.some(t=>t.readyState==='live')){stopCamera();return false;}
 return true;
}
async function ensureCamera(){
 if(availableCamera())return stream;
 const requestEpoch=cameraEpoch;
 if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw Error('camera_unavailable');
 const opened=await navigator.mediaDevices.getUserMedia({
  audio:false,video:{facingMode:'user',width:{ideal:1280},height:{ideal:720},frameRate:{ideal:20,max:24}}
 });
 if(requestEpoch!==cameraEpoch){opened.getTracks().forEach(t=>t.stop());throw Error('camera_cancelled');}
 if(!opened.getVideoTracks().some(t=>t.readyState==='live')){
  opened.getTracks().forEach(t=>t.stop());throw Error('camera_unavailable');
 }
 stream=opened;cameraAllowed=true;beep.unlock();return stream;
}
function attachVideo(video){
 if(!availableCamera())return false;
 video.srcObject=stream;video.hidden=false;
 return true;
}
function detachVideo(video){
 if(!video)return;
 try{video.pause();video.srcObject=null;video.hidden=true;}catch{}
}
function stopCamera(){
 cameraEpoch++;
 if(stream)stream.getTracks().forEach(t=>t.stop());
 stream=null;cameraAllowed=false;readySignaled.clear();
}
function setSpeaker(enabled){speakerEnabled=Boolean(enabled);}
function isSpeakerOn(){return speakerEnabled;}
function readyBeep(taskId){
 if(!speakerEnabled||readySignaled.has(taskId))return false;
 readySignaled.add(taskId);beep.unlock();
 return beep.click();
}
function resetReady(taskId){readySignaled.delete(taskId);}
function getVoice(){
 if(!voice)voice=createVoiceControl({
  onCommand(command){activeVoiceHandler?.onCommand?.(command);},
  onStatus(text,mode){
   voiceStatus={text,mode};
   if(['off','error','unsupported'].includes(mode))microphoneAllowed=false;
   activeVoiceHandler?.onStatus?.(text,mode);
  }
 });
 return voice;
}
function attachVoice(handlers){
 const shared=getVoice();
 activeVoiceHandler=handlers;
 const status=voiceStatus.mode==='off'&&shared.isEnabled()
  ?{text:'Microphone actif · commandes vocales conservées',mode:'listening'}:voiceStatus;
 handlers.onStatus?.(status.text,status.mode);
 return {
  supported:shared.supported,
  enable(){const result=shared.enable();if(result)microphoneAllowed=true;return result;},
  disable(){microphoneAllowed=false;shared.disable();},
  suspend(){shared.suspend();},
  resume(){shared.resume();},
  isEnabled(){return shared.isEnabled();},
  destroy(){if(activeVoiceHandler===handlers)activeVoiceHandler=null;}
 };
}
function hasVoiceConsent(){return microphoneAllowed&&Boolean(voice?.isEnabled());}
function stopAll(){
 stopCamera();voice?.destroy();voice=null;activeVoiceHandler=null;
 microphoneAllowed=false;voiceStatus={text:'Microphone désactivé',mode:'off'};
 try{window.speechSynthesis?.cancel();}catch{}
}
export const sharedMotionMedia={
 ensureCamera,availableCamera,attachVideo,detachVideo,stopCamera,stopAll,
 getStream:()=>availableCamera()?stream:null,
 attachVoice,hasVoiceConsent,cameraConsent:()=>cameraAllowed,
 setSpeaker,isSpeakerOn,readyBeep,resetReady,unlockAudio:()=>beep.unlock()
};
