const SCHEMA_VERSION='komo-motion-report-payload-v2';
const MATRIX_VERSION='motion-sensor-v0.6-final-2026-09';
const ALG='motion-sensor-index-v0.6.0';

const QUESTIONNAIRE_LABELS={
  KOMO_BASELINE_CORE:'Votre situation',
  KOMO_MOBILITY_25:'Mobilité au quotidien',
  KOMO_SLEEP_RECOVERY:'Sommeil & récupération',
  KOMO_WELLBEING:'Énergie & bien-être',
  KOMO_LIFESTYLE:'Mode de vie',
  KOMO_HEALTH_HISTORY:'Antécédents & santé',
  KOMO_FALL_CONTEXT:'Contexte de chute',
  KOMO_MUSCLE_RESERVE:'Réserve musculaire',
  KOMO_BACK_CONTEXT:'Contexte rachis lombaire',
  KOMO_NECK_CONTEXT:'Contexte rachis cervical',
  KOMO_OLDER_WELLBEING:'Bien-être senior'
};

function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function round(v,d=1){const x=n(v);if(x===null)return null;const p=10**d;return Math.round(x*p)/p}
function clean(v){return v===null||v===undefined?'':String(v).trim()}
function ageYears(birth,at=new Date()){if(!birth)return null;const d=new Date(`${birth}T00:00:00Z`);if(Number.isNaN(d.getTime()))return null;let a=at.getUTCFullYear()-d.getUTCFullYear();const m=at.getUTCMonth()-d.getUTCMonth();if(m<0||(m===0&&at.getUTCDate()<d.getUTCDate()))a--;return a}
function patientName(p){return`${p?.preferred_name||p?.first_name||''} ${p?.last_name||''}`.trim()||p?.email||'Patient KŌMØ'}
function assessmentDate(d,s){return s?.released_at||d?.motion?.released_at||d?.motion?.completed_at||d?.motion?.validated_at||d?.motion?.created_at||new Date().toISOString()}
function confidencePct(v){const x=n(v);if(x===null)return null;return round(x<=1?x*100:x,0)}
function side(v){const x=String(v||'').toLowerCase();if(['l','left','gauche'].includes(x))return'left';if(['r','right','droite'].includes(x))return'right';if(['bilateral','bilat'].includes(x))return'bilateral';return'na'}
function muscleLabel(v){return({VL:'Quadriceps',BF:'Ischio-jambiers',GM:'Mollets'})[v]||v||'Muscle'}
function rawText(v){if(v===null||v===undefined)return'';if(typeof v==='string')return v;try{return JSON.stringify(v)}catch{return String(v)}}
function allMetrics(d){return(d?.myodev_metrics||[]).filter(x=>n(x.value)!==null)}
function validMetrics(d){return allMetrics(d).filter(x=>String(x.qc_status||'').toLowerCase()==='valid')}
function rows(d,code,muscle='',targetSide=''){return validMetrics(d).filter(x=>x.metric_code===code&&(!muscle||x.muscle_code===muscle)&&(!targetSide||side(x.side)===targetSide))}
function mean(xs){const a=(xs||[]).map(x=>n(x.value)).filter(x=>x!==null);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null}
function metric(d,code,muscle='',targetSide=''){return round(mean(rows(d,code,muscle,targetSide)),3)}
function latestAcceptedImport(d){const a=[...(d?.myocare_imports||d?.myodev_imports||[])].filter(x=>x.status==='accepted').sort((x,y)=>new Date(y.created_at||y.recorded_at||0)-new Date(x.created_at||x.recorded_at||0));return a[0]||null}
function sessionIds(d,imp){const manifest=imp?.payload_manifest||{};const fromManifest=manifest.externalSessionIds||manifest.external_session_ids||manifest.sessions||[];const ids=Array.isArray(fromManifest)?fromManifest.map(clean).filter(Boolean):[];if(ids.length)return[...new Set(ids)];return[...new Set(allMetrics(d).map(x=>clean(x.external_session_id)).filter(Boolean))]}
function findingList(result,key){return(result?.interpretation?.summary?.[key]||[]).slice(0,3).map(f=>({id:f.id||null,title:f.title||'Mesure',status:f.status||'descriptive',displayValue:f.displayValue||'',message:f.patientMessage||f.referenceLabel||''}))}
function priorities(result){const care=result?.interpretation?.carePlan?.priorities||[];return care.slice(0,3).map((p,i)=>({rank:i+1,title:p.goal||p.domain||`Priorité ${i+1}`,domain:p.domain||'',actions:Array.isArray(p.actions)?p.actions:[],firstAction:Array.isArray(p.actions)&&p.actions.length?p.actions[0]:'À définir avec votre professionnel.',recheck:p.recheck||'Lors de la prochaine mesure'}))}
function lsiRows(d){return['VL','BF','GM'].map(m=>({muscle:m,label:muscleLabel(m),value:round(metric(d,'LSI_pct',m),1),unit:'%',source:'Myodev'}))}
function activationRows(d){return['VL','BF','GM'].map(m=>{const left=round(metric(d,'activation_pctMVC',m,'left'),1),right=round(metric(d,'activation_pctMVC',m,'right'),1);return{muscle:m,label:muscleLabel(m),left,right,difference:left!==null&&right!==null?round(Math.abs(left-right),1):null,unit:'%MVC',source:'Myodev'}})}
function gaitDetailed(d){
  const globals=[
    ['gait_speed_m_s','Vitesse de marche','m/s',2],
    ['cadence_spm','Cadence','pas/min',0],
    ['double_support_pct','Double appui','%',1],
    ['gait_stance_symmetry_pct','Symétrie temps d’appui','%',1],
    ['gait_step_length_symmetry_pct','Symétrie longueur de pas','%',1]
  ].map(([id,label,unit,digits])=>({id,label,value:round(metric(d,id),digits),unit,status:'descriptive'}));
  const bilateral=[
    ['step_count','Nombre de pas','count',0],
    ['stance_time_s','Temps d’appui','s',3],
    ['swing_time_s','Temps d’oscillation','s',3],
    ['step_time_s','Temps de pas','s',3],
    ['step_length_m','Longueur de pas','m',3]
  ].map(([id,label,unit,digits])=>({id,label,left:round(metric(d,id,'','left'),digits),right:round(metric(d,id,'','right'),digits),unit,status:'descriptive'}));
  const present=globals.filter(x=>x.value!==null).length+bilateral.reduce((a,x)=>a+(x.left!==null?1:0)+(x.right!==null?1:0),0);
  return{globals,bilateral,scalarCountPresent:present,scalarCountExpected:15,complete:present===15};
}
function otherSensorMetrics(d){const skip=new Set(['LSI_pct','activation_pctMVC','gait_speed_m_s','cadence_spm','double_support_pct','gait_stance_symmetry_pct','gait_step_length_symmetry_pct','step_count','stance_time_s','swing_time_s','step_time_s','step_length_m']);const grouped=new Map();for(const x of validMetrics(d)){if(skip.has(x.metric_code))continue;const k=x.metric_code;if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(x)}return[...grouped.entries()].slice(0,16).map(([id,xs])=>({id,label:id.replaceAll('_',' '),value:round(mean(xs),2),unit:clean(xs[0]?.unit),status:'descriptive'}))}
function questionnaireSessions(d){return(d?.questionnaires||[]).map(q=>({instrumentCode:q.instrument_code||'',instrumentVersion:q.instrument_version||'',label:QUESTIONNAIRE_LABELS[q.instrument_code]||q.instrument_code||'Questionnaire',status:q.status||'not_started',score:n(q.score),scoreStatus:q.score_status||'not_scored',completeness:n(q.completeness),startedAt:q.started_at||null,completedAt:q.completed_at||null,responseCount:Array.isArray(q.responses)?q.responses.length:0,numericContribution:0,responses:(q.responses||[]).map(r=>({itemCode:r.item_code||'',responseCode:r.response_code||'',rawValue:r.raw_value??null,rawText:rawText(r.raw_value),normalizedValue:r.normalized_value??null,normalizedText:rawText(r.normalized_value),source:r.source||'',clinicianVerified:!!r.clinician_verified,completedAt:r.completed_at||null}))}))}
function preassessment(qs){const q=qs.find(x=>x.instrumentCode==='KOMO_MOBILITY_25')||null;return{instrument:'GLFS-25 / KŌMØ Mobility',completed:!!q&&q.status==='completed'&&Number(q.completeness||0)>=100,completeness:q?q.completeness:null,score:q?q.score:null,scoreStatus:q?q.scoreStatus:'not_scored',numericContribution:0,role:'preassessment_context_only'} }
function postureSummary(d){const ms=(d?.measurements||[]).filter(x=>x.indicator_code==='M-POS-02'&&n(x.numeric_value??x.raw_value)!==null).sort((a,b)=>new Date(b.recorded_at||0)-new Date(a.recorded_at||0));const m=ms[0]||null;return{svaMm:m?round(n(m.numeric_value??m.raw_value),1):null,unit:m?.unit||'mm',source:m?.source||'',protocolVersion:m?.protocol_version||'',qcStatus:m?.qc_status||'',recordedAt:m?.recorded_at||null,available:!!m,numericContribution:0}}
function rawMetricRows(d){return allMetrics(d).map(x=>({taskCode:x.task_code||'',trialIndex:x.trial_index??null,muscleCode:x.muscle_code||'',muscleLabel:muscleLabel(x.muscle_code),side:side(x.side),phaseWindow:x.phase_window||'',metricCode:x.metric_code||'',value:n(x.value),unit:x.unit||'',directionality:x.directionality||'',qcStatus:x.qc_status||'',qcReason:x.qc_reason||'',protocolVersion:x.protocol_version||'',calibrationId:x.calibration_id||'',recordedAt:x.recorded_at||x.created_at||null,myodevImportId:x.myodev_import_id||''})).sort((a,b)=>`${a.taskCode}|${a.muscleCode}|${a.side}|${a.metricCode}|${a.trialIndex??''}`.localeCompare(`${b.taskCode}|${b.muscleCode}|${b.side}|${b.metricCode}|${b.trialIndex??''}`))}
function rawMeasurementRows(d){return(d?.measurements||[]).map(x=>({indicatorCode:x.indicator_code||'',productStatus:x.product_status||'',rawText:rawText(x.raw_value),numericValue:n(x.numeric_value),textValue:x.text_value||'',unit:x.unit||'',source:x.source||'',taskCode:x.task_code||'',muscleCode:x.muscle_code||'',side:side(x.side),protocolVersion:x.protocol_version||'',qcStatus:x.qc_status||'',qcReason:x.qc_reason||'',recordedAt:x.recorded_at||null,sourceReference:x.source_reference||''})).sort((a,b)=>`${a.indicatorCode}|${a.recordedAt||''}`.localeCompare(`${b.indicatorCode}|${b.recordedAt||''}`))}
function summarySentence(result,score){const p=result?.interpretation?.summary?.priorities?.[0],s=result?.interpretation?.summary?.strengths?.[0];if(p)return`Le Motion Score synthétise la symétrie neuromusculaire mesurée par Myodev. Le principal axe à discuter est ${String(p.title||'la priorité identifiée').toLowerCase()}.`;if(s)return`Le Motion Score synthétise la symétrie neuromusculaire mesurée par Myodev. ${s.title||'Un point favorable'} ressort parmi les données disponibles.`;return score===null?'Le Motion Score reste en attente de données capteurs complètes.':'Ce résultat constitue votre référence capteur pour les prochaines mesures KŌMØ Motion.'}

export function buildReportPayload(result,{practitionerName='',centerName='',reportVersion=null,reportStatus=null}={}){
  const d=result?.dossier||{},s=result?.score||{},p=d.patient||{},score=n(s.motion_score),assessedAt=assessmentDate(d,s),imp=latestAcceptedImport(d),sessions=sessionIds(d,imp),valid=validMetrics(d),all=allMetrics(d),lsi=lsiRows(d),activation=activationRows(d),gait=gaitDetailed(d),other=otherSensorMetrics(d),symmetry=n(s.domain_scores?.neuromuscular_symmetry??score),age=ageYears(p.birth_date,new Date(assessedAt)),questionnaires=questionnaireSessions(d),posture=postureSummary(d),rawSensor=rawMetricRows(d),rawMeasurements=rawMeasurementRows(d);
  const questionnaireResponses=questionnaires.flatMap(q=>q.responses.map(r=>({instrumentCode:q.instrumentCode,instrumentVersion:q.instrumentVersion,instrumentLabel:q.label,status:q.status,completeness:q.completeness,...r})));
  const payload={
    schemaVersion:SCHEMA_VERSION,matrixVersion:MATRIX_VERSION,generatedAt:new Date().toISOString(),
    identity:{patientId:result?.identity?.patientId||p.id||null,assessmentId:result?.identity?.assessmentId||d.motion?.id||null,scoreId:result?.identity?.scoreId||s.id||null,algorithmVersion:result?.identity?.algorithmVersion||s.algorithm_version||null,engineVersion:result?.interpretation?.engineVersion||result?.identity?.engineVersion||null,referenceVersion:result?.interpretation?.referenceVersion||result?.identity?.referenceVersion||null},
    report:{version:reportVersion,status:reportStatus||s.release_status||'draft',assessmentDate:assessedAt,centerName:centerName||p.organization_name||d.organization?.name||'KŌMØ',practitionerName:practitionerName||'Professionnel KŌMØ',dataClassification:p.data_classification||'clinical',title:'KŌMØ Motion Report',language:'fr-FR',technicalAppendix:true},
    patient:{firstName:p.first_name||'',lastName:p.last_name||'',preferredName:p.preferred_name||'',displayName:patientName(p),birthDate:p.birth_date||null,age,email:p.email||'',externalReference:p.external_reference||''},
    summary:{score,symmetry:round(symmetry,1),confidence:confidencePct(s.confidence),completeness:round(s.completeness,0),status:s.status||'unknown',releaseStatus:s.release_status||'draft',sentence:summarySentence(result,score),strengths:findingList(result,'strengths'),priorityFindings:findingList(result,'priorities')},
    sensor:{lsi,activation,gait,other,validMetricCount:valid.length,totalMetricCount:all.length,sessionCount:sessions.length,sessionIds:sessions,sourceFile:imp?.source_file_name||'',sourceVersion:imp?.source_version||'',contractVersion:imp?.contract_version||'',sourceFormat:imp?.source_format||'',importHash:imp?.import_hash||'',importedAt:imp?.created_at||imp?.recorded_at||null,deviceSetId:imp?.device_set_id||'',warnings:imp?.warnings||[]},
    posture,
    context:{preassessment:preassessment(questionnaires),questionnaires:questionnaires.map(({responses,...q})=>q),questionnaireCount:questionnaires.length,completedQuestionnaireCount:questionnaires.filter(q=>q.status==='completed'&&Number(q.completeness||0)>=100).length,note:'Le pré-bilan et les questionnaires décrivent le contexte du patient. Ils ne modifient pas le Motion Score.'},
    priorities:priorities(result),
    methodology:{scorePolicy:'sensor_only',algorithm:ALG,scoreDefinition:'Moyenne des LSI musculaires moyens valides pour les trois groupes mesurés (quadriceps, ischio-jambiers, mollets).',requirements:'Import Myodev accepté, LSI valides sur trois groupes musculaires et contexte publiable.',questionnaireContribution:0,postureContribution:0,gaitContribution:0,retiredManualTests:['Two-Step','Chair Stand 30 s','marche 4 m manuelle','appui unipodal','Stand-Up'],disclaimer:'Le Motion Score synthétise des mesures fonctionnelles instrumentées. Il ne constitue pas à lui seul un diagnostic médical.'},
    provenance:{source:'Myodev / MyoCare',assessmentProtocol:d.motion?.protocol_version||'',scoreCalculatedAt:s.calculated_at||null,scoreReleasedAt:s.released_at||null,assessmentStatus:d.motion?.status||'',assessmentCreatedAt:d.motion?.created_at||null},
    appendix:{questionnaireResponses,sensorMetrics:rawSensor,measurements:rawMeasurements}
  };
  payload.qc={ready:!!payload.identity.patientId&&!!payload.identity.assessmentId&&!!payload.identity.scoreId&&score!==null&&payload.identity.algorithmVersion===ALG,blocking:[],warnings:[]};
  if(!payload.identity.patientId)payload.qc.blocking.push('patient_id_missing');
  if(!payload.identity.assessmentId)payload.qc.blocking.push('assessment_id_missing');
  if(!payload.identity.scoreId)payload.qc.blocking.push('score_id_missing');
  if(score===null)payload.qc.blocking.push('motion_score_missing');
  if(payload.identity.algorithmVersion!==ALG)payload.qc.blocking.push('sensor_algorithm_required');
  if(lsi.filter(x=>x.value!==null).length<3)payload.qc.warnings.push('three_lsi_groups_not_present_in_payload');
  if(gait.scalarCountPresent<gait.scalarCountExpected)payload.qc.warnings.push(`gait_spatiotemporal_${gait.scalarCountPresent}_of_${gait.scalarCountExpected}`);
  if(questionnaires.some(q=>q.status!=='completed'||Number(q.completeness||0)<100))payload.qc.warnings.push('questionnaire_context_incomplete');
  payload.qc.ready=payload.qc.blocking.length===0;
  return payload;
}

export function validateReportPayload(payload,{forRelease=false}={}){const errors=[],warnings=[];if(!payload||payload.schemaVersion!==SCHEMA_VERSION)errors.push('schema_version_invalid');const id=payload?.identity||{};if(!id.patientId)errors.push('patient_id_missing');if(!id.assessmentId)errors.push('assessment_id_missing');if(!id.scoreId)errors.push('score_id_missing');if(id.algorithmVersion!==ALG)errors.push('sensor_algorithm_required');if(n(payload?.summary?.score)===null)errors.push('motion_score_missing');if(!clean(payload?.patient?.displayName))errors.push('patient_name_missing');if(!clean(payload?.report?.assessmentDate))errors.push('assessment_date_missing');if((payload?.sensor?.lsi||[]).filter(x=>n(x.value)!==null).length<3)warnings.push('lsi_groups_incomplete');if((payload?.sensor?.gait?.scalarCountPresent||0)<15)warnings.push('gait_spatiotemporal_incomplete');if(forRelease&&!clean(payload?.report?.practitionerName))errors.push('practitioner_name_missing');return{ok:errors.length===0,errors,warnings}}

export function hydrateCanonicalLikeResult(payload){const s=payload?.summary||{};return{patientId:payload?.identity?.patientId||null,snapshot:{report:{payload}},dossier:{patient:{id:payload?.identity?.patientId,first_name:payload?.patient?.firstName,last_name:payload?.patient?.lastName,preferred_name:payload?.patient?.preferredName,birth_date:payload?.patient?.birthDate,email:payload?.patient?.email,external_reference:payload?.patient?.externalReference,data_classification:payload?.report?.dataClassification},motion:{id:payload?.identity?.assessmentId,released_at:payload?.provenance?.scoreReleasedAt},score:{id:payload?.identity?.scoreId,motion_score:s.score,domain_scores:{neuromuscular_symmetry:s.symmetry},algorithm_version:payload?.identity?.algorithmVersion,reference_version:payload?.identity?.referenceVersion,release_status:'released'}},score:{id:payload?.identity?.scoreId,motion_score:s.score,domain_scores:{neuromuscular_symmetry:s.symmetry},algorithm_version:payload?.identity?.algorithmVersion,reference_version:payload?.identity?.referenceVersion,release_status:'released'},interpretation:{engineVersion:payload?.identity?.engineVersion,referenceVersion:payload?.identity?.referenceVersion,summary:{strengths:s.strengths||[],priorities:s.priorityFindings||[],descriptive:[]},findings:[],carePlan:{status:'sensor_report',label:'Plan KŌMØ',safetyGate:'Validation professionnelle requise selon le contexte.',priorities:payload?.priorities||[]},consistencyIssues:[],sources:[{title:'Myodev / MyoCare'}]},locomotorAge:{status:'retired',reason:'Ancien modèle manuel retiré du Motion Score.'},identity:payload?.identity||{}}}

export {SCHEMA_VERSION,MATRIX_VERSION,ALG};
if(typeof window!=='undefined')window.KomoReportPayload={version:SCHEMA_VERSION,build:buildReportPayload,validate:validateReportPayload,hydrate:hydrateCanonicalLikeResult};
