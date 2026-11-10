// KŌMØ Motion — exploratory monocular one-leg stance detector.
// Protocol: firm floor, eyes open, stable camera; no touching support; capped at 30 s.
// Detect from the *opposite foot's lift* and return to support. This is 2D video
// inference, NOT a validated clinical balance measure or a proxy for force-plate CoP.
const good=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??1)>=.60;
const rounded=s=>Math.round(Math.max(0,s)*10)/10;
export function oneLegFrame(points,stance='left'){
 if(!Array.isArray(points)||points.length<33)return {valid:false,lifted:false,grounded:false,message:'Corps non détecté.'};
 const indices=[11,12,23,24,25,26,27,28];
 if(!indices.every(i=>good(points[i])))
  return {valid:false,lifted:false,grounded:false,message:'Montrez les épaules, le bassin, les genoux et les deux chevilles.'};
 const onLeft=stance==='left';
 const support=points[onLeft?27:28],free=points[onLeft?28:27];
 const shoulder=points[onLeft?11:12];
 const height=support.y-shoulder.y;
 if(height<.28)return {valid:false,lifted:false,grounded:false,message:'Rapprochez le trépied sans couper les pieds ni la tête.'};
 if(indices.some(i=>points[i].x<.018||points[i].x>.982||points[i].y<.018||points[i].y>.982))
  return {valid:false,lifted:false,grounded:false,message:'Recadrez : une articulation est coupée.'};
 const rise=(support.y-free.y)/height;
 // Hysteresis leaves a neutral region between confirmed lift and confirmed contact.
 // A small absolute 2D ankle difference alone is insufficient to trigger a lift.
 const lifted=rise>.072&&(support.y-free.y)>.034;
 const grounded=rise<.033||(support.y-free.y)<.014;
 return {valid:true,lifted,grounded,footRise:rise,height,
   message:lifted?'Appui sur '+(onLeft?'la jambe gauche':'la jambe droite')+' détecté.':
     grounded?'Deux pieds au sol · soulevez le pied opposé.':
     'Position intermédiaire · stabilisez l’appui.'};
}
export function createOneLegObserver(stance='left',maxMs=30000){
 if(stance!=='left'&&stance!=='right')throw Error('invalid_stance_leg');
 const limit=Math.max(1000,Math.min(30000,Number(maxMs)||30000));
 let state='waiting',liftSince=null,contactSince=null,lostSince=null,startedAt=null,stoppedAt=null;
 let lastAt=null,seconds=0,reason='',validFrames=0,allFrames=0,attemptFrames=0,attemptValid=0;
 const summary=()=>({seconds:rounded(seconds),started:startedAt!==null,completed:state==='completed',
  state,reason,maxSeconds:limit/1000,
  quality:attemptFrames?Math.round(100*attemptValid/attemptFrames):0,
  validFrames,allFrames,startedAt,stoppedAt});
 const done=(at,why)=>{
  if(state==='completed')return;
  state='completed';stoppedAt=at;reason=why;
  seconds=Math.min(limit,Math.max(0,at-startedAt))/1000;
 };
 const sample=(f,at)=>({...f,...summary(),stopped:state==='completed',lifted:f.lifted});
 const observe=(points,at)=>{
  const f=oneLegFrame(points,stance);
  if(!Number.isFinite(at)||lastAt!==null&&at<lastAt)
   return {...f,...summary(),message:'Image irrégulière · mesure à vérifier.'};
  lastAt=at;allFrames++;
  if(state==='completed')return sample(f,at);
  if(state==='running')attemptFrames++;
  if(!f.valid){
   if(state==='candidate'){state='waiting';liftSince=null}
   if(state==='running'){
    if(lostSince===null)lostSince=at;
    if(at-lostSince>=500)done(lostSince,'camera_lost');
   }
   return sample(f,at);
  }
  validFrames++;
  if(state==='running')attemptValid++;
  if(state==='waiting'){
   if(f.lifted){state='candidate';liftSince=at}
  }else if(state==='candidate'){
   if(!f.lifted){state='waiting';liftSince=null}
   else if(liftSince!==null&&at-liftSince>=500){
    // Debounce to prevent false starts. Count from the first confirmed lift frame.
    state='running';startedAt=liftSince;contactSince=null;lostSince=null;
    attemptFrames=1;attemptValid=1;
   }
  }else if(state==='running'){
   if(f.lifted){contactSince=null;lostSince=null}
   else if(f.grounded){
    if(contactSince===null)contactSince=at;
    if(at-contactSince>=180)done(contactSince,'foot_contact');
   }else{
    if(contactSince===null)contactSince=at;
    if(at-contactSince>=450)done(contactSince,'ambiguous_contact');
   }
   if(state==='running'){
    // Gaps under 500 ms are tolerated; do not add them when tracking is lost.
    const until=lostSince!==null?lostSince:at;
    seconds=Math.min(limit,Math.max(0,until-startedAt))/1000;
    if(seconds>=limit/1000)done(startedAt+limit,'limit');
   }
  }
  const out=sample(f,at);
  if(out.state==='candidate')out.message='Pied levé · confirmation de l’appui…';
  if(out.state==='running')out.message='Appui unipodal en cours · '+rounded(out.seconds).toFixed(1)+' s';
  if(out.state==='completed'){
   out.message=reason==='limit'?'30 s atteintes · essai terminé.':
    reason==='foot_contact'?'Pied reposé · essai arrêté.':
    reason==='camera_lost'?'Perte des repères · durée à vérifier.':
    'Appui incertain · durée à vérifier.';
  }
  return out;
 };
 return {observe,summary,reset:()=>{
  state='waiting';liftSince=null;contactSince=null;lostSince=null;startedAt=null;stoppedAt=null;
  lastAt=null;seconds=0;reason='';validFrames=0;allFrames=0;attemptFrames=0;attemptValid=0;
 }};
}
