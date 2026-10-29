// KŌMØ Motion Score — agreed LINEAR V1 algorithm.
// Only operator-verified standardized STS 30 s + TUG 3 m + SPPB balance 0–4.
// Questionnaire domain scores NEVER alter the KMS weights.
export const MOTION_ALGORITHM_VERSION='KOMO_MOTION_ONLINE_LINEAR_V1';
export const REQUIRED_MEASURES=['sts30','tug3m','sppbBalance'];
const clamp=v=>Math.min(1,Math.max(0,v));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function calculateMotionScore({sts30,tug3m,sppbBalance,stsP10,stsP90,tugP10,tugP90,
 normsSource,operatorVerified=false,stsVerified=false}={}){
 const missing=[];
 if(!finite(sts30)||sts30<0||!Number.isInteger(sts30))missing.push('Sit-to-Stand 30 s validé');
 if(!finite(tug3m)||tug3m<=0||tug3m>180)missing.push('TUG standardisé sur 3 m');
 if(!Number.isInteger(sppbBalance)||sppbBalance<0||sppbBalance>4)missing.push('Équilibre SPPB noté de 0 à 4');
 if(!finite(stsP10)||!finite(stsP90)||stsP10<0||stsP90<=stsP10)missing.push('Références normatives STS P10/P90');
 if(!finite(tugP10)||!finite(tugP90)||tugP10<=0||tugP90<=tugP10)missing.push('Références normatives TUG P10/P90');
 if(typeof normsSource!=='string'||normsSource.trim().length<8)missing.push('Source documentée des normes');
 if(!operatorVerified||!stsVerified)missing.push('Validation des protocoles et mesures');
 if(missing.length)return {version:MOTION_ALGORITHM_VERSION,complete:false,score:null,missing,
  subscores:null,validated:false};
 const F=clamp((sts30-stsP10)/(stsP90-stsP10));
 const M=clamp((tugP90-tug3m)/(tugP90-tugP10));
 const B=sppbBalance;
 const result=Math.round(40*F+35*M+6.25*B);
 return {version:MOTION_ALGORITHM_VERSION,complete:true,score:result,missing:[],
  subscores:{strength:Math.round(F*1000)/10,mobility:Math.round(M*1000)/10,balance:25*B},
  validated:false,source:normsSource.trim(),
  formula:'ARRONDI(40×F + 35×M + 6,25×B)',weights:{sts:.40,tug:.35,sppb:.25}};
}
