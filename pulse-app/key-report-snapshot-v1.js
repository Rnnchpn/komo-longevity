import { getCanonicalClient } from './canonical-result-runtime.js';

const VERSION='1.0.0';
const cache=new Map();
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const block=v=>({
  days_observed:n(v?.days_observed),coverage_pct:n(v?.coverage_pct),steps_avg:n(v?.steps_avg),distance_m_avg:n(v?.distance_m_avg),
  active_minutes_avg:n(v?.active_minutes_avg),sleep_minutes_avg:n(v?.sleep_minutes_avg),resting_hr_avg:n(v?.resting_hr_avg),
  avg_hr_avg:n(v?.avg_hr_avg),hrv_ms_avg:n(v?.hrv_ms_avg),spo2_avg:n(v?.spo2_avg),wear_minutes_avg:n(v?.wear_minutes_avg)
});
const changes=v=>({
  steps_pct:n(v?.steps_pct),distance_pct:n(v?.distance_pct),active_minutes_pct:n(v?.active_minutes_pct),sleep_minutes_delta:n(v?.sleep_minutes_delta),
  resting_hr_delta_bpm:n(v?.resting_hr_delta_bpm),hrv_pct:n(v?.hrv_pct),spo2_delta_points:n(v?.spo2_delta_points),coverage_delta_points:n(v?.coverage_delta_points)
});
function normalize(raw){
  const r=raw&&typeof raw==='object'?raw:{};
  return{
    report_format:'mobility-report-key-v1',method_version:String(r.method_version||'key-report-v1'),available:r.available===true,reason:r.reason||null,
    latest_date:r.latest_date||null,period:r.period||null,comparison_reliable:r.comparison_reliable===true,
    current7:block(r.current7),previous7:block(r.previous7),current30:block(r.current30),changes:changes(r.changes),
    daily14:Array.isArray(r.daily14)?r.daily14.slice(-14).map(x=>({
      date:x?.date||null,steps:n(x?.steps),distance_m:n(x?.distance_m),active_minutes:n(x?.active_minutes),sleep_minutes:n(x?.sleep_minutes),
      resting_hr:n(x?.resting_hr),avg_hr:n(x?.avg_hr),hrv_ms:n(x?.hrv_ms),spo2_avg:n(x?.spo2_avg),wear_minutes:n(x?.wear_minutes),
      day_wear_mode:x?.day_wear_mode||null,source:x?.source||null,source_quality:x?.source_quality||null
    })):[],
    sources:Array.isArray(r.sources)?r.sources.filter(Boolean).slice(0,8):[],source_quality:Array.isArray(r.source_quality)?r.source_quality.filter(Boolean).slice(0,8):[],
    method:{average_basis:r.method?.average_basis||'observed_days_only',window_anchor:r.method?.window_anchor||'latest_available_metric_date',clinical_score_effect:'none',interpretation:'descriptive_longitudinal'}
  };
}
export async function loadKeyReportSnapshot(patientId,{force=false}={}){
  if(!patientId)return normalize({available:false,reason:'patient_missing'});
  const cached=cache.get(patientId);if(!force&&cached&&Date.now()-cached.at<30000)return cached.value;
  try{
    const client=getCanonicalClient();
    const q=await client.rpc('komo_key_report_snapshot',{p_patient_id:patientId});
    if(q.error){console.warn('[key-report-snapshot]',q.error);const out=normalize({available:false,reason:'snapshot_unavailable'});cache.set(patientId,{at:Date.now(),value:out});return out}
    const out=normalize(q.data);cache.set(patientId,{at:Date.now(),value:out});return out;
  }catch(e){console.warn('[key-report-snapshot]',e);return normalize({available:false,reason:'snapshot_unavailable'})}
}
export function clearKeyReportSnapshot(patientId=''){if(patientId)cache.delete(patientId);else cache.clear()}
if(typeof window!=='undefined')window.KomoKeyReportSnapshot={version:VERSION,load:loadKeyReportSnapshot,clear:clearKeyReportSnapshot};
