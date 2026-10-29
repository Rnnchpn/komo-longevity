// One-leg pose recognition only; not a clinically validated balance score.
// "Stance" leg stays visually lower while the OTHER ankle is lifted.
const good=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??1)>=.60;
export function oneLegFrame(points,stance='left'){
 if(!Array.isArray(points)||points.length<33)return {valid:false,lifted:false,message:'Corps non détecté.'};
 const indices=[11,12,23,24,25,26,27,28];
 if(!indices.every(i=>good(points[i])))return {valid:false,lifted:false,message:'Gardez épaules, bassin, genoux et chevilles visibles.'};
 const stanceAnkle=points[stance==='left'?27:28],otherAnkle=points[stance==='left'?28:27];
 const hip=points[stance==='left'?23:24];
 const shoulder=points[stance==='left'?11:12];
 const length=stanceAnkle.y-shoulder.y;
 if(length<.40)return {valid:false,lifted:false,message:'Reculez pour cadrer le corps entier.'};
 if(indices.some(i=>points[i].x<.03||points[i].x>.97||points[i].y<.02||points[i].y>.98))
  return {valid:false,lifted:false,message:'Cadrez les deux pieds et le haut du corps.'};
 const footRise=(stanceAnkle.y-otherAnkle.y)/length;
 const lifted=footRise>.105&&otherAnkle.y<stanceAnkle.y-.046;
 return {valid:true,lifted,footRise,message:lifted?'Un pied soulevé · restez près de votre appui.':
  'Soulevez doucement le pied opposé à la jambe d’appui.',height:length};
}
export function createOneLegObserver(stance='left',maxMs=20000){
 let raisedSince=null,lostSince=null,startedAt=null,stoppedAt=null,validFrames=0,allFrames=0,maxElapsed=0;
 return {
  observe(points,at){
   const f=oneLegFrame(points,stance);
   allFrames++;
   if(!Number.isFinite(at))return {...f,started:false,stopped:false,seconds:0};
   if(stoppedAt!==null)return {...f,started:false,stopped:true,seconds:Math.round(maxElapsed*10)/10};
   if(!f.valid){
    if(startedAt!==null){lostSince??=at;if(at-lostSince>450){stoppedAt=at;maxElapsed=Math.min(maxMs,at-startedAt)/1000;}}
    return {...f,started:false,stopped:stoppedAt!==null,seconds:Math.round(maxElapsed*10)/10};
   }
   validFrames++;
   if(f.lifted){
    lostSince=null;
    if(raisedSince===null)raisedSince=at;
    if(startedAt===null&&at-raisedSince>=850)startedAt=at; // start once foot held up
    if(startedAt!==null)maxElapsed=Math.min(maxMs,at-startedAt)/1000;
   }else{
    raisedSince=null;
    if(startedAt!==null){lostSince??=at;if(at-lostSince>450){stoppedAt=at;maxElapsed=Math.min(maxMs,at-startedAt)/1000;}}
   }
   if(maxElapsed>=maxMs/1000)stoppedAt=at;
   return {...f,started:startedAt!==null,stopped:stoppedAt!==null,seconds:Math.round(maxElapsed*10)/10,
    quality:allFrames?validFrames/allFrames:0};
  },
  summary(){return {seconds:Math.round(maxElapsed*10)/10,started:startedAt!==null,
    completed:stoppedAt!==null,quality:allFrames?Math.round(100*validFrames/allFrames):0};},
  reset(){raisedSince=null;lostSince=null;startedAt=null;stoppedAt=null;validFrames=0;allFrames=0;maxElapsed=0;}
 };
}
