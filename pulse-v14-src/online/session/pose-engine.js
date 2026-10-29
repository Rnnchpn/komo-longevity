// Browser-only landmark overlay; MediaPipe runs locally on device.
// No video frames, landmarks, images or measurements are uploaded or saved.
const MEDIAPIPE_VERSION='0.10.21';
const LIB='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+MEDIAPIPE_VERSION+'/vision_bundle.mjs';
const WASM='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+MEDIAPIPE_VERSION+'/wasm';
const MODEL='https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const EDGES=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[27,29],[28,30],[27,31],[28,32]];
const show=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??1)>=.55;
let modelPromise=null;
async function model(){
 if(modelPromise)return modelPromise;
 modelPromise=(async()=>{
   const {PoseLandmarker,FilesetResolver}=await import(LIB);
   const wasm=await FilesetResolver.forVisionTasks(WASM);
   let landmarker;
   try{
     landmarker=await PoseLandmarker.createFromOptions(wasm,{baseOptions:{modelAssetPath:MODEL,delegate:'GPU'},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.55,minPosePresenceConfidence:.55,minTrackingConfidence:.5});
   }catch{
     landmarker=await PoseLandmarker.createFromOptions(wasm,{baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.55,minPosePresenceConfidence:.55,minTrackingConfidence:.5});
   }
   return landmarker;
 })();
 try{return await modelPromise}catch(error){modelPromise=null;throw error;}
}
function overlay(canvas,points){
 const c=canvas.getContext('2d',{alpha:true});
 if(!c)return;
 const w=canvas.width,h=canvas.height;
 c.clearRect(0,0,w,h);
 if(!Array.isArray(points))return;
 c.lineWidth=Math.max(2,w/285);c.strokeStyle='rgba(221,207,164,.94)';c.shadowColor='rgba(18,46,30,.75)';c.shadowBlur=8;
 for(const [a,b] of EDGES){
   if(!show(points[a])||!show(points[b]))continue;
   c.beginPath();c.moveTo((1-points[a].x)*w,points[a].y*h);c.lineTo((1-points[b].x)*w,points[b].y*h);c.stroke();
 }
 c.shadowBlur=0;
 for(let i=0;i<points.length;i++){
   if(!show(points[i]))continue;
   const x=(1-points[i].x)*w,y=points[i].y*h;
   c.beginPath();c.arc(x,y,Math.max(2.4,w/180),0,Math.PI*2);
   c.fillStyle='#c9f1c4';c.fill();c.strokeStyle='#193b2c';c.lineWidth=1.25;c.stroke();
 }
}
export async function createPoseEngine(video,canvas,onFrame,onFailure){
 const landmarker=await model();
 let running=true,raf=0,lastTimestamp=-1,lastSample=0,errors=0;
 const tick=()=>{
   if(!running)return;
   raf=requestAnimationFrame(tick);
   if(document.hidden||video.readyState<2||!video.videoWidth)return;
   const now=performance.now();
   if(now-lastSample<95||video.currentTime===lastTimestamp)return;
   lastSample=now;lastTimestamp=video.currentTime;
   if(canvas.width!==video.videoWidth||canvas.height!==video.videoHeight){
     canvas.width=video.videoWidth;canvas.height=video.videoHeight;
   }
   try{
     const result=landmarker.detectForVideo(video,now);
     const points=result.landmarks?.[0]||null;
     overlay(canvas,points);
     onFrame(points,now);
     errors=0;
   }catch(e){
     errors++;
     if(errors>=3){running=false;cancelAnimationFrame(raf);onFailure?.(e);}
   }
 };
 raf=requestAnimationFrame(tick);
 return {
  stop(){running=false;cancelAnimationFrame(raf);const c=canvas.getContext('2d');c?.clearRect(0,0,canvas.width,canvas.height);}
 };
}
