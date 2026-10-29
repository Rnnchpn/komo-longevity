// KŌMØ Motion Online — spoken countdown, timed prompts and short local click.
// This code synthesizes sound without loading or storing recordings.
export function createAudioFeedback({onSpeechStart=()=>{},onSpeechEnd=()=>{}}={}){
 const w=typeof window!=='undefined'?window:{};
 let context=null,disposed=false,sequence=0,activeUtterance=null;
 const timers=new Set();
 const supportsSpeech=Boolean(w.speechSynthesis&&w.SpeechSynthesisUtterance);
 function unlock(){
  if(disposed)return;
  try{
   const AudioContextCtor=w.AudioContext||w.webkitAudioContext;
   if(!AudioContextCtor)return;
   if(!context)context=new AudioContextCtor();
   if(context.state==='suspended')context.resume().catch(()=>{});
  }catch{}
 }
 function tone(frequency=880,duration=.05,gain=.065){
  if(disposed)return false;
  unlock();
  if(!context||context.state!=='running')return false;
  try{
   const oscillator=context.createOscillator(),volume=context.createGain(),at=context.currentTime;
   oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,at);
   volume.gain.setValueAtTime(.001,at);
   volume.gain.exponentialRampToValueAtTime(Math.max(.001,gain),at+.006);
   volume.gain.exponentialRampToValueAtTime(.001,at+duration);
   oscillator.connect(volume).connect(context.destination);
   oscillator.start(at);oscillator.stop(at+duration+.01);
   return true;
  }catch{return false;}
 }
 function click(){return tone(1030,.047,.075);}
 function chime(){tone(740,.10,.06);const t=setTimeout(()=>{timers.delete(t);tone(1010,.18,.055);},125);timers.add(t);}
 function wait(ms,token){
  return new Promise(resolve=>{
   if(disposed||token!==sequence){resolve(false);return;}
   const t=setTimeout(()=>{timers.delete(t);resolve(!disposed&&token===sequence);},ms);
   timers.add(t);
  });
 }
 function say(text,{rate=1.18,timeout=1600}={}){
  const token=sequence;
  return new Promise(resolve=>{
   if(disposed||token!==sequence||!supportsSpeech){resolve(false);return;}
   let settled=false;
   const finish=ok=>{
    if(settled)return;
    settled=true;clearTimeout(timeoutId);timers.delete(timeoutId);
    activeUtterance=null;onSpeechEnd();resolve(ok&&!disposed&&sequence===token);
   };
   let utterance;
   try{
    utterance=new w.SpeechSynthesisUtterance(text);
    utterance.lang='fr-FR';utterance.rate=rate;utterance.volume=1;
    utterance.onend=()=>finish(true);
    utterance.onerror=()=>finish(false);
    const timeoutIdUnused=undefined;
   }catch{resolve(false);return;}
   activeUtterance=utterance;
   const timeoutId=setTimeout(()=>{try{w.speechSynthesis.cancel()}catch{}finish(false);},timeout);
   timers.add(timeoutId);
   onSpeechStart();
   try{w.speechSynthesis.speak(utterance);}catch{finish(false);}
  });
 }
 async function countdown(onStep,onTop){
  // Every start cancels earlier countdowns; no delayed countdown can restart a stopped test.
  cancel();
  unlock();
  const token=sequence;
  for(const [value,word] of [[3,'Trois'],[2,'Deux'],[1,'Un']]){
   if(disposed||token!==sequence)return false;
   onStep(value);
   const begun=performance.now();
   const spoken=await say(word,{rate:1.24,timeout:830});
   if(disposed||token!==sequence)return false;
   if(!spoken)tone(value*170+340,.09,.055);
   const left=950-(performance.now()-begun);
   if(left>0&&!(await wait(left,token)))return false;
  }
  if(disposed||token!==sequence)return false;
  onStep('TOP !');
  chime();
  // Start measurement on the visual TOP, not after the TTS completes.
  onTop();
  // Speak Top with no dependency on completion.
  void say('Top !',{rate:1.35,timeout:750});
  return true;
 }
 function cancel(){
  sequence++;
  try{w.speechSynthesis?.cancel()}catch{}
  for(const t of timers)clearTimeout(t);
  timers.clear();
  activeUtterance=null;
  onSpeechEnd();
 }
 async function milestone(seconds){
  if(disposed)return;
  if([20,10,5].includes(seconds))await say('Encore '+seconds+' secondes.',{rate:1.18,timeout:1150});
  else if(seconds===3)tone(620,.075,.04);
  else if(seconds===2)tone(670,.075,.04);
  else if(seconds===1)tone(720,.075,.04);
 }
 function destroy(){if(disposed)return;cancel();disposed=true;context?.close?.().catch?.(()=>{});context=null;}
 return {unlock,click,chime,say,countdown,milestone,cancel,destroy,supportsSpeech};
}
