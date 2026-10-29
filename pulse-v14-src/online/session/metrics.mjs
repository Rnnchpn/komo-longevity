// KŌMØ Motion Online — exploratory motion counters, entirely local.
// NOT a diagnostic tool; no Motion Score, ROM in degrees or clinically validated thresholds.
const LEFT={shoulder:11,hip:23,knee:25,ankle:27,heel:29,wrist:15};
const RIGHT={shoulder:12,hip:24,knee:26,ankle:28,heel:30,wrist:16};
const good=(point)=>Boolean(point&&Number.isFinite(point.x)&&Number.isFinite(point.y)&&(point.visibility??1)>=0.58);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function jointAngle(a,b,c){
 if(!a||!b||!c)return null;
 const u={x:a.x-b.x,y:a.y-b.y},v={x:c.x-b.x,y:c.y-b.y};
 const d=Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y);
 if(d<0.000001)return null;
 return Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/d)))*180/Math.PI;
}
function sidePoints(points,map,names){
 const result=names.map(name=>points?.[map[name]]);
 return result.every(good)?result:null;
}
export function frameInfo(points,task='sts'){
 if(!Array.isArray(points)||points.length<33)return {valid:false,message:'Aucune silhouette détectée.'};
 const left=sidePoints(points,LEFT,['shoulder','hip','knee','ankle']);
 const right=sidePoints(points,RIGHT,['shoulder','hip','knee','ankle']);
 const four=['shoulder','hip','knee','ankle'];
 const usable=left||right;
 if(!usable)return {valid:false,message:'Montrez épaules, bassin, genoux et chevilles dans le cadre.'};
 // Shoulder-to-ankle span guards against a person being too small in the image.
 const span=Math.max(...usable.map(p=>p.y))-Math.min(...usable.map(p=>p.y));
 if(span<.35)return {valid:false,message:'Reculez la caméra et montrez votre corps entier.'};
 if(usable.some(p=>p.x<.015||p.x>.985||p.y<.018||p.y>.982))return {valid:false,message:'Recadrez : les articulations sont coupées.'};
 const sides=[LEFT,RIGHT].map(m=>sidePoints(points,m,['hip','knee','ankle'])).filter(Boolean);
 const kneeAngle=sides.length?sides.map(s=>jointAngle(...s)).filter(Number.isFinite).sort((a,b)=>a-b)[0]:null;
 if(task==='sts'&&!Number.isFinite(kneeAngle))return {valid:false,message:'Mettez-vous légèrement de profil pour voir genou et cheville.'};
 const shoulder=usable[0],hip=usable[1],knee=usable[2],ankle=usable[3];
 const wrists=sidePoints(points,LEFT,['shoulder','wrist'])&&sidePoints(points,RIGHT,['shoulder','wrist']);
 if(task==='arms'&&!wrists)return {valid:false,message:'Montrez vos épaules et vos deux mains.'};
 const foot=sidePoints(points,LEFT,['hip','heel'])||sidePoints(points,RIGHT,['hip','heel']);
 if(task==='heels'&&!foot)return {valid:false,message:'Montrez les chevilles et les talons.'};
 return {valid:true,message:'Corps détecté',kneeAngle,hipY:hip.y,ankleY:ankle.y,scale:span,
    wrists:wrists?{left:points[LEFT.wrist],right:points[RIGHT.wrist],leftShoulder:points[LEFT.shoulder],rightShoulder:points[RIGHT.shoulder]}:null,
    heelY:foot?.[1]?.y??null,side:usable===left?'left':'right'};
}
export function createMovementTracker(task){
 const s={count:0,phase:'initial',candidate:null,candidateAt:0,lastCountAt:-Infinity,lastAt:0,
   samples:0,usable:0,baseline:null,lastValidAt:0};
 function transition(next,at,stableMs=200){
   if(s.candidate!==next){s.candidate=next;s.candidateAt=at;return false;}
   return at-s.candidateAt>=stableMs;
 }
 function observe(points,at){
   if(!Number.isFinite(at)||at<s.lastAt)return {valid:false,count:s.count,message:'Image irrégulière'};
   s.lastAt=at;s.samples++;
   const f=frameInfo(points,task);
   if(!f.valid){s.candidate=null;return {...f,count:s.count,phase:s.phase};}
   s.usable++;s.lastValidAt=at;
   let message=f.message;
   if(task==='sts'){
     // Record one complete seated -> standing transition, ignore camera jitter.
     const pose=f.kneeAngle<=120?'seated':f.kneeAngle>=154?'standing':'transition';
     if(pose==='seated'&&transition('seated',at,230)){s.phase='seated';message='Assis détecté · relevez-vous';}
     else if(pose==='standing'&&transition('standing',at,230)){
       if(s.phase==='seated'&&at-s.lastCountAt>950){s.count++;s.lastCountAt=at;message='Lever compté · asseyez-vous';}
       s.phase='standing';
     }else if(pose==='transition'){s.candidate=null;message='Mouvement suivi';}
     if(s.phase==='initial')message='Asseyez-vous, de profil, pour initialiser';
   }else if(task==='arms'){
     const w=f.wrists;
     const up=w.left.y<w.leftShoulder.y-.055&&w.right.y<w.rightShoulder.y-.055;
     const down=w.left.y>w.leftShoulder.y+.08&&w.right.y>w.rightShoulder.y+.08;
     if(down&&transition('arms_down',at,200)){s.phase='down';message='Bras en bas · levez-les';}
     else if(up&&transition('arms_up',at,220)){
       if(s.phase==='down'&&at-s.lastCountAt>950){s.count++;s.lastCountAt=at;}
       s.phase='up';message='Bras levés · redescendez doucement';
     }else if(!down&&!up)s.candidate=null;
     if(s.phase==='initial')message='Placez les bras le long du corps';
   }else if(task==='heels'){
     // Non-validated proxy: hip elevation relative to initial standing baseline.
     // Camera must be stationary; any move outside frame is rejected upstream.
     if(s.baseline===null){s.baseline=f.hipY;s.phase='down';}
     const displacement=(s.baseline-f.hipY)/Math.max(.35,f.scale);
     if(displacement>=.035&&transition('raised',at,240)){
       if(s.phase==='down'&&at-s.lastCountAt>800){s.count++;s.lastCountAt=at;}
       s.phase='up';message='Élévation probable · redescendez';
     }else if(displacement<=.014&&transition('lowered',at,240)){
       s.phase='down';s.baseline=s.baseline*.95+f.hipY*.05;message='Position initiale';
     }else if(displacement>.014&&displacement<.035)s.candidate=null;
   }else if(task==='balance'){
      s.phase='visible';message='Corps suivi · durée de visibilité uniquement';
   }
   return {...f,count:s.count,phase:s.phase,message,usable:s.usable,samples:s.samples};
 }
 return {observe,summary:()=>({count:s.count,usable:s.usable,samples:s.samples,visibilityRatio:s.samples?s.usable/s.samples:0}),reset:()=>{s.count=0;s.phase='initial';s.candidate=null;s.candidateAt=0;s.lastCountAt=-Infinity;s.lastAt=0;s.samples=0;s.usable=0;s.baseline=null;s.lastValidAt=0;}};
}
