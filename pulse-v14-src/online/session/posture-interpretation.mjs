// KŌMØ Motion Online — experimental *screen-space* sagittal posture.
 // The ranges below are editorial display bands, NOT clinical norms, diagnosis,
 // disease severity or measured spinopelvic compensation.
const round=v=>Math.round(v*10)/10;
const enough=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??0)>=.72;
const rad=180/Math.PI;
function planarAngle(a,b,c,aspect){
 if(!enough(a)||!enough(b)||!enough(c)||!Number.isFinite(aspect)||aspect<.5||aspect>3.5)return null;
 // MediaPipe coordinates are [0,1]; restore image aspect ratio before geometry.
 const v1=[(a.x-b.x)*aspect,a.y-b.y],v2=[(c.x-b.x)*aspect,c.y-b.y];
 const n1=Math.hypot(...v1),n2=Math.hypot(...v2);
 if(n1<.025||n2<.025)return null;
 const cos=(v1[0]*v2[0]+v1[1]*v2[1])/(n1*n2);
 return Math.acos(Math.max(-1,Math.min(1,cos)))*rad;
}
export function classifyPostureOffset(pct){
 if(typeof pct!=='number'||!Number.isFinite(pct)||pct<0)return {label:'Non disponible',tone:'neutral',band:'unavailable'};
 // These thresholds classify the camera illustration only; no normative claim.
 if(pct<=3)return {label:'Bon',tone:'good',band:'low'};
 if(pct<=7)return {label:'Moyen',tone:'medium',band:'middle'};
 return {label:'Mauvais',tone:'high',band:'high'};
}
export function sagittalJointObservations(points,aspect=1,frame=null){
 if(!Array.isArray(points)||!frame?.valid||!Array.isArray(frame.ix))return {kneeFlexionDeg:null,ankleDeviationDeg:null,compensation:'unavailable',side:null};
 const chosen=frame.ix[0]===11?{hip:23,knee:25,ankle:27,foot:31,side:'gauche'}:{hip:24,knee:26,ankle:28,foot:32,side:'droite'};
 const knee=planarAngle(points[chosen.hip],points[chosen.knee],points[chosen.ankle],aspect);
 const ankle=planarAngle(points[chosen.knee],points[chosen.ankle],points[chosen.foot],aspect);
 const kneeFlexionDeg=knee===null||knee<70||knee>180?null:round(180-knee);
 const ankleDeviationDeg=ankle===null||ankle<30||ankle>150?null:round(Math.abs(90-ankle));
 // Conservative triage flag: *potential* visual adaptation, not a diagnosis.
 const compensation=kneeFlexionDeg===null||ankleDeviationDeg===null?'unavailable':
  kneeFlexionDeg>12&&ankleDeviationDeg>12?'possible':'not_observed';
 return {kneeFlexionDeg,ankleDeviationDeg,compensation,side:chosen.side};
}
export function postureDisplay(result){
 const r=result?.posture||null;
 if(!['done','review'].includes(result?.status)||!r?.valid)return {label:'Non mesuré',tone:'neutral',detail:'Reprendre la photo si souhaité.'};
 const pct=typeof r.surfaceIndexPct==='number'&&Number.isFinite(r.surfaceIndexPct)?r.surfaceIndexPct:null;
 if(pct===null)return {label:'Non mesuré',tone:'neutral',detail:'Position du profil indisponible.'};
 const graded=classifyPostureOffset(pct);
 const reliable=result.status==='done'&&!r.manualCapture;
 return {label:reliable?graded.label:'À vérifier',tone:reliable?graded.tone:'neutral',band:graded.band,
  offsetPct:round(pct),kneeFlexionDeg:typeof r.kneeFlexionDeg==='number'?r.kneeFlexionDeg:null,
  ankleDeviationDeg:typeof r.ankleDeviationDeg==='number'?r.ankleDeviationDeg:null,
  compensation:r.compensation==='possible'?'possible':r.compensation==='not_observed'?'not_observed':'unavailable',
  detail:'Zones de lecture internes à KŌMØ (0–3 %, 3–7 %, plus de 7 %) : indicatives et non validées médicalement.'};
}
