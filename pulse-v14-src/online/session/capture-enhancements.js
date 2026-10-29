import {createAudioFeedback} from './audio-feedback.js';
import {createPostureRecorder,observeFrontalPosture} from './posture-metrics.mjs';

// Presentation-only feedback: the voice and camera never persist data in Pulse.
export function createCaptureEnhancements({root,task,voice,state,record}){
 const q=s=>root.querySelector(s);
 let destroyed=false,lastCount=0,lastReminder=null,lastPosture=null;
 const enabled=()=>Boolean(q('#sound-enabled')?.checked);
 const audio=createAudioFeedback({
  onSpeechStart:()=>{if(voice.isEnabled())voice.suspend();},
  onSpeechEnd:()=>{if(!state.countdownActive&&voice.isEnabled())voice.resume();}
 });
 const posture=task.id==='posture'?createPostureRecorder():null;
 const countdownCover=q('#countdown-cover'),number=q('#countdown-value');
 function reset(){
  lastCount=0;lastReminder=null;lastPosture=null;posture?.reset();
 }
 function detect(points){
  if(!posture)return null;
  const data=state.sessionActive?posture.observe(points):observeFrontalPosture(points);
  lastPosture=data;
  if(state.sessionActive&&data.valid){
    const r=posture.summary();
    const el=q('#pose-quality');
    if(el)el.textContent='Posture : '+r.goodFrames+' images observées';
  }
  return data;
 }
 async function begin(onTop,onCancel){
  if(destroyed)return false;
  reset();
  state.countdownActive=true;
  if(countdownCover)countdownCover.hidden=false;
  if(number)number.textContent='3';
  const run=await audio.countdown(value=>{
   if(destroyed||!state.countdownActive)return;
   if(number)number.textContent=String(value);
  },()=>{
   if(destroyed||!state.countdownActive)return;
   state.countdownActive=false;
   if(countdownCover)countdownCover.hidden=true;
   onTop();
  },{audible:enabled()});
  if(!run&&state.countdownActive){state.countdownActive=false;if(countdownCover)countdownCover.hidden=true;onCancel?.();}
  return run;
 }
 function stopCountdown(){
  state.countdownActive=false;
  if(countdownCover)countdownCover.hidden=true;
  audio.cancel();
 }
 function onCount(n){
  if(!state.sessionActive||!enabled()||destroyed||task.id==='balance'||task.id==='posture')return;
  const current=Math.floor(Number(n)||0);
  if(current<=lastCount)return;
  // One short synthetic click for each validated, newly detected repetition.
  for(let i=lastCount;i<Math.min(current,lastCount+4);i++)audio.click();
  lastCount=current;
  // Spoken milestone without a long voice prompt at every movement.
  if(current>0&&current%5===0)void audio.say(String(current),{rate:1.25,timeout:850});
 }
 function onRemaining(value){
  const seconds=Math.ceil(Number(value));
  if(!state.sessionActive||!enabled()||!Number.isFinite(seconds)||seconds===lastReminder)return;
  lastReminder=seconds;
  if([20,10,5,3,2,1].includes(seconds))void audio.milestone(seconds);
 }
 function completed(interrupted=false){
  audio.cancel();
  if(enabled()){
   audio.chime();
   void audio.say(interrupted?'Test arrêté. Résultat à vérifier.':'Test terminé.',{rate:1.08,timeout:1350});
  }
 }
 function postureSummary(){
  if(!posture)return null;
  return posture.summary();
 }
 function renderPosture(metrics){
  if(!posture)return;
  const panel=q('#posture-results'),target=q('#posture-data');
  if(!panel||!target)return;
  panel.hidden=false;
  if(!metrics?.valid){
   target.textContent='Capture insuffisante. Replacez-vous face à la caméra et recommencez le test.';
   return;
  }
  const data=[
   ['Ligne des épaules',metrics.shoulderTilt+'°'],
   ['Ligne du bassin',metrics.hipTilt+'°'],
   ['Décalage apparent tête–bassin',metrics.headOffset+' %'],
   ['Décalage apparent tronc–bassin',metrics.torsoOffset+' %']
  ];
  target.replaceChildren();
  for(const [name,value] of data){
   const cell=document.createElement('div'),title=document.createElement('span'),measure=document.createElement('strong');
   title.textContent=name;measure.textContent=value;cell.append(title,measure);target.append(cell);
  }
 }
 function destroy(){
  if(destroyed)return;
  destroyed=true;stopCountdown();audio.destroy();
 }
 return {audio,unlock:()=>audio.unlock(),reset,begin,stopCountdown,detect,onCount,onRemaining,completed,postureSummary,renderPosture,destroy};
}
