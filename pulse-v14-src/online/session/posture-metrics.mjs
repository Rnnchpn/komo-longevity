// Experimental 2D frontal alignment observation. Camera-frame metrics ONLY.
// Tilts and offsets are sensitive to lens, camera roll and person orientation.
// Do not diagnose kyphosis, scoliosis, pelvic obliquity or pathology.
const GOOD=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??1)>=.65;
const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
function absoluteLineTilt(a,b){
 const dx=b.x-a.x,dy=b.y-a.y;
 if(Math.abs(dx)<.035)return null;
 return Math.abs(Math.atan2(dy,Math.abs(dx))*180/Math.PI);
}
function median(list){
 if(!list.length)return null;
 const sorted=[...list].sort((a,b)=>a-b);
 const mid=Math.floor(sorted.length/2);
 return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
}
export function observeFrontalPosture(points){
 if(!Array.isArray(points)||points.length<33)return {valid:false,message:'Aucune silhouette détectée'};
 const indices=[0,11,12,23,24,25,26,27,28];
 if(!indices.every(i=>GOOD(points[i])))return {valid:false,message:'Placez-vous face à la caméra, tête, épaules, bassin et pieds visibles.'};
 const [leftShoulder,rightShoulder,leftHip,rightHip]=[11,12,23,24].map(i=>points[i]);
 const shouldersWidth=Math.abs(leftShoulder.x-rightShoulder.x);
 const hipsWidth=Math.abs(leftHip.x-rightHip.x);
 const bodyHeight=Math.abs((points[27].y+points[28].y)/2-points[0].y);
 if(shouldersWidth<.12||hipsWidth<.075||bodyHeight<.55)return {valid:false,message:'Reculez et tenez-vous face à la caméra, sans vous tourner.'};
 if(indices.some(i=>points[i].x<.025||points[i].x>.975||points[i].y<.018||points[i].y>.982))return {valid:false,message:'Recadrez le corps entier, sans couper la tête ou les pieds.'};
 const shoulderTilt=absoluteLineTilt(leftShoulder,rightShoulder);
 const hipTilt=absoluteLineTilt(leftHip,rightHip);
 if(shoulderTilt===null||hipTilt===null||shoulderTilt>32||hipTilt>32)return {valid:false,message:'Caméra inclinée ou corps non aligné : recommencez face à l’objectif.'};
 const shoulderCenter=(leftShoulder.x+rightShoulder.x)/2;
 const hipCenter=(leftHip.x+rightHip.x)/2;
 const headOffset=Math.abs(points[0].x-hipCenter)/shouldersWidth*100;
 const torsoOffset=Math.abs(shoulderCenter-hipCenter)/shouldersWidth*100;
 return {valid:true,message:'Vue frontale exploitable · maintenez la position',shoulderTilt,hipTilt,headOffset,torsoOffset};
}
export function createPostureRecorder(){
 let samples=[],count=0;
 return {
  observe(points){
   const frame=observeFrontalPosture(points);
   count++;
   if(frame.valid)samples.push(frame);
   if(samples.length>120)samples.shift();
   return {...frame,goodFrames:samples.length,totalFrames:count};
  },
  summary(){
   const validRatio=count?samples.length/Math.min(count,120):0;
   const credible=samples.length>=15&&validRatio>=.65;
   const metric=name=>credible?Math.round(median(samples.map(x=>x[name]))*10)/10:null;
   return {valid:credible,goodFrames:samples.length,totalFrames:count,validRatio:Math.round(validRatio*100),
    shoulderTilt:metric('shoulderTilt'),hipTilt:metric('hipTilt'),
    headOffset:metric('headOffset'),torsoOffset:metric('torsoOffset')};
  },
  reset(){samples=[];count=0;}
 };
}
