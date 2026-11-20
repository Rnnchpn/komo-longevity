// KŌMØ — sagittal profile PHOTO geometry (surface projection only).
// Neither C7 nor S1 is directly observable in a webcam pose model.
const visible=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??1)>=.58;
const mean=(a,b)=>(a+b)/2;
export function sideProfileFrame(points){
 if(!Array.isArray(points)||points.length<33)
  return {valid:false,reason:'missing',message:'Pas de silhouette détectée : éloignez-vous et améliorez la lumière.'};
 // Side views often hide the far knee/ankle: require one visible shoulder,
 // hip and ankle, while allowing an occluded knee.
 const candidates=[[11,23,27],[12,24,28]].map(ix=>{
  const score=ix.reduce((s,i)=>s+(Number(points[i]?.visibility)||0),0);
  return {ix,score,valid:ix.every(i=>visible(points[i]))};
 });
 const chosen=candidates.filter(x=>x.valid).sort((a,b)=>b.score-a.score)[0];
 if(!chosen)return {valid:false,reason:'missing',message:'Montrez votre épaule, hanche et cheville. Éloignez-vous si nécessaire.'};
 const [shoulderIndex,hipIndex,ankleIndex]=chosen.ix;
 const shoulder=points[shoulderIndex],hip=points[hipIndex],ankle=points[ankleIndex];
 // The two shoulders can overlap in profile, but often not perfectly.
 if(visible(points[11])&&visible(points[12])&&Math.abs(points[11].x-points[12].x)>.24)
  return {valid:false,reason:'turn',message:'Tournez-vous de profil : votre épaule gauche et droite doivent se superposer à l’écran.'};
 if(visible(points[23])&&visible(points[24])&&Math.abs(points[23].x-points[24].x)>.22)
  return {valid:false,reason:'turn',message:'Tournez encore légèrement le bassin pour être de profil.'};
 const height=ankle.y-shoulder.y;
 if(height<.31)return {valid:false,reason:'distance',message:'Reculez et vérifiez que l’épaule, le bassin et les pieds sont visibles.'};
 if([shoulder,hip,ankle].some(p=>p.x<.02||p.x>.98||p.y<.02||p.y>.98))
  return {valid:false,reason:'crop',message:'Une partie du corps sort de l’image : recentrez-vous.'};
 const neck={x:shoulder.x,y:Math.max(.02,shoulder.y-.022)};
 const pelvis={x:hip.x,y:Math.min(.98,hip.y+.010)};
 return {valid:true,reason:'ok',message:'Bien placé ! Ne bougez plus, la photo arrive.',shoulder,hip,ankle,
   height,neck,pelvis,orientation:visible(points[0])?(points[0].x>shoulder.x?'droite':'gauche'):'indéterminée'};
}
export function surfaceSagittalIndex(neck,pelvis,height){
 if(!neck||!pelvis||!Number.isFinite(neck.x)||!Number.isFinite(pelvis.x)||!Number.isFinite(height)||height<=.2)return null;
 // Relative photographic horizontal offset. NOT SVA / NOT mm.
 return Math.round(Math.abs(neck.x-pelvis.x)/height*10000)/100;
}
export function createSideProfileStability(requiredMs=900){
 let since=null,last=null,frames=0;
 return {
  observe(points,time){
   const f=sideProfileFrame(points);
   if(!f.valid||!Number.isFinite(time)){since=null;last=null;frames=0;return {...f,stableMs:0,ready:false};}
   const pos=[f.shoulder.x,f.shoulder.y,f.hip.x,f.hip.y];
   const moved=last&&pos.some((v,i)=>Math.abs(last[i]-v)>.028);
   if(since===null||moved){since=time;frames=0;}
   last=pos;frames++;
   const stableMs=Math.max(0,time-since);
   return {...f,stableMs,ready:stableMs>=requiredMs&&frames>=6};
  },
  reset(){since=null;last=null;frames=0;}
 };
}
