// KŌMØ — sagittal profile PHOTO geometry (surface projection only).
// Neither C7 nor S1 is directly observable in a webcam pose model.
const visible=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??1)>=.58;
const mean=(a,b)=>(a+b)/2;
export function sideProfileFrame(points){
 if(!Array.isArray(points)||points.length<33)return {valid:false,message:'Silhouette absente. Placez-vous de profil, corps entier.'};
 const left=[11,23,25,27].every(i=>visible(points[i]));
 const right=[12,24,26,28].every(i=>visible(points[i]));
 if(!left&&!right)return {valid:false,message:'Montrez l’épaule, le bassin, le genou et la cheville de profil.'};
 const a=left?[11,23,25,27]:[12,24,26,28];
 const shoulder=points[a[0]],hip=points[a[1]],knee=points[a[2]],ankle=points[a[3]];
 if(visible(points[11])&&visible(points[12])&&Math.abs(points[11].x-points[12].x)>.13)return {valid:false,message:'Tournez-vous plus franchement de profil (90°).'};
 if(visible(points[23])&&visible(points[24])&&Math.abs(points[23].x-points[24].x)>.12)return {valid:false,message:'Bassin trop tourné : placez-vous vraiment de profil.'};
 const height=ankle.y-shoulder.y;
 if(height<.37)return {valid:false,message:'Reculez la caméra pour voir tout le corps.'};
 if([shoulder,hip,knee,ankle].some(p=>p.x<.04||p.x>.96||p.y<.03||p.y>.97))return {valid:false,message:'Le corps est coupé. Ajustez le cadrage.'};
 if(Math.abs(hip.y-shoulder.y)<.085)return {valid:false,message:'Restez debout, dans une position naturelle.'};
 const neck={x:shoulder.x,y:Math.max(.025,shoulder.y-.022)};
 const pelvis={x:hip.x,y:Math.min(.975,hip.y+.010)};
 return {valid:true,message:'Profil détecté · restez immobile pour la photo.',shoulder,hip,ankle,
   height,neck,pelvis,orientation:visible(points[0])?(points[0].x>shoulder.x?'droite':'gauche'):'indéterminée'};
}
export function surfaceSagittalIndex(neck,pelvis,height){
 if(!neck||!pelvis||!Number.isFinite(neck.x)||!Number.isFinite(pelvis.x)||!Number.isFinite(height)||height<=.2)return null;
 // Relative photographic horizontal offset. NOT SVA / NOT mm.
 return Math.round(Math.abs(neck.x-pelvis.x)/height*10000)/100;
}
export function createSideProfileStability(requiredMs=2300){
 let since=null,last=null,frames=0;
 return {
  observe(points,time){
   const f=sideProfileFrame(points);
   if(!f.valid||!Number.isFinite(time)){since=null;last=null;frames=0;return {...f,stableMs:0,ready:false};}
   const pos=[f.shoulder.x,f.shoulder.y,f.hip.x,f.hip.y];
   const moved=last&&pos.some((v,i)=>Math.abs(last[i]-v)>.007);
   if(since===null||moved){since=time;frames=0;}
   last=pos;frames++;
   const stableMs=Math.max(0,time-since);
   return {...f,stableMs,ready:stableMs>=requiredMs&&frames>=14};
  },
  reset(){since=null;last=null;frames=0;}
 };
}
