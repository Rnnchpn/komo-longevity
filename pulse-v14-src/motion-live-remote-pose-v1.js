// KŌMØ Pulse — experimental 2D body landmarks, computed ONLY on the Operator browser.
// The paired iPhone provides an encrypted WebRTC stream. No raw video, skeleton or frame is uploaded.
import {createPoseEngine} from './online/session/pose-engine.js';
import {createMovementTracker,frameInfo} from './online/session/metrics.mjs?v=20261110-live-hud-v1';
import {createOneLegObserver,oneLegFrame} from './online/session/unipodal-metrics.mjs';
import {createSideProfileStability,sideProfileFrame,surfaceSagittalIndex} from './online/session/profile-photo-metrics.mjs';

const REPETITIONS=new Set(["sts","heels","arms"]);
const UNIPODAL=new Set(["unipodal_left","unipodal_right"]);
const VALID_TESTS=new Set(["sts","heels","unipodal_left","unipodal_right","arms","posture"]);
const round1=value=>Math.round(value*10)/10;

export function createRemoteMotionTracker({onUpdate,onError}={}){
 let video=null,canvas=null,engine=null,disposed=false,generation=0;
 let step="",runKey="",running=false,startedAt=0,duration=0;
 let repetition=null,balance=null,profile=null,frames=0,validFrames=0,latest=null;
 let lastPublish=0,modelLoading=false,operatorStopped=false;
 const publish=data=>{
  latest=data;
  try{onUpdate?.(data)}catch(error){console.warn("[Motion pose update]",error)}
 };
 const resetCounters=()=>{
  frames=0;validFrames=0;latest=null;operatorStopped=false;
  repetition=REPETITIONS.has(step)?createMovementTracker(step):null;
  balance=UNIPODAL.has(step)?createOneLegObserver(step==="unipodal_left"?"left":"right",20000):null;
  profile=step==="posture"?createSideProfileStability(900):null;
 };
 const frame=(points,at)=>{
  if(disposed)return;
  frames++;
  const info=step==="posture"?sideProfileFrame(points):
   UNIPODAL.has(step)?oneLegFrame(points,step==="unipodal_left"?"left":"right"):
   frameInfo(points,step||"sts");
  if(info.valid)validFrames++;
  let measurement=null,started=false,finished=false,postureIndex=null,stable=false,phase="initial";
  const elapsed=startedAt?Date.now()-startedAt:0;
  // A finished stopwatch must never continue accumulating movements.
  const withinWindow=running&&!operatorStopped&&(!duration||elapsed<=duration*1000+250);
  if(REPETITIONS.has(step)&&repetition){
   // Keep the last confirmed repetition count even if an individual frame is
   // obstructed, the pose is momentarily lost or the countdown has finished.
   // Only ACCEPT a new repetition while inside the active timed window.
   if(withinWindow){
    const result=repetition.observe(points,at);
    phase=result.phase||"initial";
   }
   if(repetition.summary().usable>=5)measurement=repetition.summary().count;
  }else if(withinWindow&&UNIPODAL.has(step)&&balance){
   const result=balance.observe(points,at);
   const summary=balance.summary();
   started=summary.started;finished=summary.completed;
   if(started&&summary.quality>=40)measurement=Math.min(20,round1(summary.seconds));
  }else if(step==="posture"&&profile&&info.valid){
   const result=profile.observe(points,at);
   stable=result.ready;
   if(running&&result.ready){
    postureIndex=surfaceSagittalIndex(result.neck,result.pelvis,result.height);
   }
  }else if(step==="posture"&&profile){profile.observe(points,at)}
  // Never send frame coordinates or video pixels to the database.
  if(at-lastPublish>=160||finished){
   lastPublish=at;
   publish({
    step,runKey,valid:!!info.valid,message:info.message||"Silhouette non exploitable",
    quality:Math.round(validFrames/Math.max(frames,1)*100),frames,validFrames,
    running,measurement,phase,started,finished,stable,postureIndex
   });
  }
 };
 async function attach(nextVideo){
  if(disposed||!nextVideo)return false;
  if(video===nextVideo&&engine)return true;
  const current=++generation;
  engine?.stop();engine=null;
  if(canvas)canvas.remove();canvas=null;
  video=nextVideo;
  const parent=video.closest(".mopv-screen");
  if(!parent)throw Error("Cadre vidéo introuvable.");
  canvas=document.createElement("canvas");
  canvas.className="moc-pose-overlay";canvas.setAttribute("aria-hidden","true");
  parent.append(canvas);
  modelLoading=true;
  try{
   const instance=await createPoseEngine(video,canvas,frame,error=>{
    if(current!==generation||disposed)return;
    engine=null;
    onError?.("Suivi interrompu : vérifiez le flux caméra puis reconnectez. "+(error?.message||""));
   },{mirror:false});
   if(current!==generation||disposed||video!==nextVideo){
    instance.stop();return false;
   }
   engine=instance;
   onError?.("");
   return true;
  }catch(error){
   if(current===generation&&!disposed)onError?.("Marqueurs indisponibles : "+(error?.message||"chargement MediaPipe impossible")+". Vérifiez Internet puis relancez la vidéo.");
   if(current===generation&&canvas){canvas.remove();canvas=null}
   return false;
  }finally{modelLoading=false}
 }
 function setTest(testId,sessionStartedAt,isActive,maxSeconds){
  const target=VALID_TESTS.has(testId)?testId:"";
  const run=target+"|"+(isActive?(sessionStartedAt||"running"):"idle");
  if(run!==runKey){
   step=target;runKey=run;resetCounters();
   lastPublish=0;
  }
  running=!!isActive;
  startedAt=Date.parse(sessionStartedAt||"")||0;
  duration=Number(maxSeconds)||0;
 }
 function stopMeasurement(){operatorStopped=true}
 function detach(){
  ++generation;engine?.stop();engine=null;video=null;
  if(canvas){canvas.remove();canvas=null}
  lastPublish=0;
  publish({step,runKey,valid:false,message:"Caméra déconnectée",measurement:null,running:false});
 }
 function dispose(){disposed=true;detach();onUpdate=null;onError=null}
 return {attach,detach,dispose,setTest,stopMeasurement,getLatest:()=>latest,isAttached:()=>!!engine,loading:()=>modelLoading};
}
