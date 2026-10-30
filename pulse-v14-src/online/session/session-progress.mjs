// The demo's progress is kept ONLY in this browser tab, never in Supabase.
// Do not persist camera frames, photographs, recordings, authentication details,
// normative-reference inputs, raw MediaPipe landmarks or PDF files.
import {INTAKE_GROUPS} from './intake-model.mjs';
import {PROGRAM_VERSION,isValidDay} from './motion-passport.mjs';
export const PROGRESS_KEY='komo_motion_online_demo_v8';
export const PROGRESS_VERSION=9;
const TTL=4*60*60*1000; // four hours, then expire even if tab remains open
const answerIds=new Set([...INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>q.id)),'safety']);
const testIds=new Set(['sts','heels','unipodal_left','unipodal_right','arms','posture']);
const statuses=new Set(['pending','done','review','skipped']);
const cleanNumber=(n)=>Number.isFinite(n)&&Math.abs(n)<=10000?n:null;
const exerciseIds=new Set(['walk','chair','balance','mobility','recover']);
export function cleanProgram(program){
 if(!program||program.version!==PROGRAM_VERSION||!isValidDay(program.startedAt)||
  !program.entries||typeof program.entries!=='object'||Array.isArray(program.entries))return null;
 const entries={},days=Object.entries(program.entries);
 if(days.length>28)return null;
 for(const [date,raw] of days){
  if(!isValidDay(date)||!raw||typeof raw!=='object'||!Array.isArray(raw.completed)||raw.completed.length>5)return null;
  const dayDiff=(Date.parse(date+'T12:00:00Z')-Date.parse(program.startedAt+'T12:00:00Z'))/86400000;
  if(dayDiff<0||dayDiff>=28||raw.completed.some(x=>!exerciseIds.has(x)))return null;
  const effort=raw.effort===null||raw.effort===undefined?null:raw.effort;
  if(effort!==null&&(!Number.isInteger(effort)||effort<0||effort>10))return null;
  const note=typeof raw.note==='string'?raw.note.trim():'';
  if(note.length>160||/[\u0000-\u001f]/.test(note))return null;
  entries[date]={completed:[...new Set(raw.completed)],effort,note};
 }
 return {version:PROGRAM_VERSION,startedAt:program.startedAt,entries};
}
export function snapshotProgress(state){
 const answers={};
 for(const [key,value] of Object.entries(state.answers||{})){
  if(answerIds.has(key)&&typeof value==='string'&&value.length<128)answers[key]=value;
 }
 const results={};
 for(const [id,r] of Object.entries(state.results||{})){
  if(!testIds.has(id)||!r||!statuses.has(r.status))continue;
  const record={status:r.status,value:cleanNumber(r.value),quality:cleanNumber(r.quality),
   source:typeof r.source==='string'?r.source.slice(0,80):'webcam'};
  if(id==='sts'&&r.normative&&typeof r.normative==='object'){
   const v=r.normative;
   record.normative={
    exactAge:Number.isInteger(v.exactAge)&&v.exactAge>=60&&v.exactAge<=94?v.exactAge:null,
    cohort:['men','women'].includes(v.cohort)?v.cohort:'',
    protocolConfirmed:v.protocolConfirmed===true
   };
  }
  if(id==='posture'&&r.posture?.valid&&Number.isFinite(r.posture.surfaceIndexPct)){
   record.posture={valid:true,surfaceIndexPct:r.posture.surfaceIndexPct,
    method:'photo sagittale 2D',manualCapture:Boolean(r.posture.manualCapture),
    kneeFlexionDeg:cleanNumber(r.posture.kneeFlexionDeg),
    ankleDeviationDeg:cleanNumber(r.posture.ankleDeviationDeg),
    compensation:['possible','not_observed'].includes(r.posture.compensation)?r.posture.compensation:'unavailable'};
  }
  results[id]=record;
 }
 return {page:Number.isInteger(state.page)?Math.max(0,Math.min(4,state.page)):0,
  questionStep:Number.isInteger(state.questionStep)?Math.max(0,Math.min(INTAKE_GROUPS.length-1,state.questionStep)):0,
  task:Number.isInteger(state.task)?Math.max(0,Math.min(5,state.task)):0,
  answers,results,checks:[...(state.checks||[])].filter(s=>['chair','space','support','device'].includes(s)),
  returnToSummary:Boolean(state.returnToSummary),program:cleanProgram(state.program)};
}
export function saveProgress(storage,state,now=Date.now()){
 if(!storage)return false;
 try{
  storage.setItem(PROGRESS_KEY,JSON.stringify({version:PROGRESS_VERSION,expiresAt:now+TTL,
    data:snapshotProgress(state)}));
  return true;
 }catch{return false;}
}
export function loadProgress(storage,now=Date.now()){
 if(!storage)return null;
 try{
  const raw=storage.getItem(PROGRESS_KEY);
  if(!raw)return null;
  const item=JSON.parse(raw);
  if(![8,PROGRESS_VERSION].includes(item?.version)||!Number.isFinite(item.expiresAt)||item.expiresAt<=now){
   clearProgress(storage);return null;
  }
  if(!item.data||typeof item.data!=='object')return null;
  // Sanitize even previously stored or manually modified data.
  // Migrate V8 progress (which included the removed 10-second visibility test).
  const v8Task=Number(item.data.task);
  const migrating=item.version===8;
  const task=migrating&&Number.isInteger(v8Task)?
   (v8Task>=3?v8Task-1:v8Task===2?2:v8Task):item.data.task;
  const sanitized=snapshotProgress({...item.data,task,checks:new Set(item.data.checks)});
  if(migrating)saveProgress(storage,{...sanitized,checks:new Set(sanitized.checks)},now);
  if(sanitized.page===3&&sanitized.answers.safety!=='no')sanitized.page=2;
  if(sanitized.page===4&&sanitized.answers.safety!=='no'&&sanitized.answers.safety!=='yes')
   sanitized.page=2;
  return sanitized;
 }catch{clearProgress(storage);return null;}
}
export function clearProgress(storage){
 try{storage?.removeItem(PROGRESS_KEY)}catch{}
}
