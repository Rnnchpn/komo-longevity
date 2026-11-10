// Reuse the existing Motion Online questionnaires and PDF engine for supervised clinic demos.
// The physician/operator edits all fields on the desktop; nothing is collected on the iPhone.
// This module has no access to camera frames, audio or WebRTC signaling.
import {INTAKE_GROUPS, QUESTION_COUNT, intakeProgress, scoreIntake, validAnswer} from './online/session/intake-model.mjs';
import {buildPdfReportData,downloadMotionPdf} from './online/session/pdf-report.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const questionnaireGroups=INTAKE_GROUPS;
export const questionnaireCount=QUESTION_COUNT;
export function questionnaireState(answers={}){
 return {progress:intakeProgress(answers),score:scoreIntake(answers)};
}
export function renderClinicQuestionnaire(root,answers={},page=0,{onChange,onNext,onPrevious,onTests}={}){
 const index=Math.max(0,Math.min(INTAKE_GROUPS.length-1,Number(page)||0));
 const group=INTAKE_GROUPS[index];
 const progress=intakeProgress(answers);
 root.innerHTML='<section class="moc-test moc-questionnaire">'+
  '<div class="moc-question-head"><span class="moc-kicker">QUESTIONNAIRES KŌMØ · '+(index+1)+' / '+INTAKE_GROUPS.length+'</span>'+
  '<span id="mocIntakeProgress">'+progress.completed+' / '+progress.total+' réponses</span></div>'+
  '<h3>'+esc(group.title)+'</h3><p class="moc-help">'+esc(group.subtitle)+'</p>'+
  '<div class="moc-question-list">'+group.questions.map((question,n)=>{
   const options=question.options.map((item,i)=>{
    const value=Array.isArray(item)?item[0]:String(i);
    const label=Array.isArray(item)?item[1]:item;
    const checked=String(answers[question.id]??'')===String(value)?' checked':'';
    return '<label class="moc-question-choice"><input type="radio" name="'+esc(question.id)+'" value="'+esc(value)+'"'+checked+'><span>'+esc(label)+'</span></label>';
   }).join('');
   return '<fieldset class="moc-question"><legend>'+(n+1)+'. '+esc(question.label)+'</legend><div class="moc-question-choices">'+options+'</div></fieldset>';
  }).join('')+'</div><p class="moc-help">'+esc(group.note)+'</p>'+
  '<p id="mocIntakeState" class="moc-status" role="status" aria-live="polite">Réponses enregistrées automatiquement dans la séance de démonstration.</p>'+
  '<div class="moc-buttons"><button type="button" id="mocIntakePrev" class="moc-button secondary">'+(index?'← Précédent':'← Tests')+'</button>'+
  '<button type="button" id="mocIntakeNext" class="moc-button primary">'+(index===INTAKE_GROUPS.length-1?'Terminer les questionnaires':'Section suivante →')+'</button></div>'+
  '</section>';
 for(const question of group.questions){
  for(const input of root.querySelectorAll('input[name="'+question.id+'"]')){
   input.onchange=()=>{
    if(!validAnswer(question,input.value))return;
    answers[question.id]=input.value;
    root.querySelector('#mocIntakeProgress').textContent=
     intakeProgress(answers).completed+' / '+QUESTION_COUNT+' réponses';
    const note=root.querySelector('#mocIntakeState');if(note)note.textContent='Enregistrement des réponses…';
    onChange?.(answers);
   };
  }
 }
 root.querySelector('#mocIntakePrev').onclick=()=>index===0?onTests?.():onPrevious?.();
 root.querySelector('#mocIntakeNext').onclick=()=>{
  // Partial groups can be revisited. Report will explicitly label unanswered items.
  if(index===INTAKE_GROUPS.length-1)onTests?.();
  else onNext?.();
 };
}
export function clinicReportSummary(answers={},results={}){
 const {progress,score}=questionnaireState(answers);
 const ids=['sts','heels','unipodal_left','unipodal_right','arms','posture'];
 const done=ids.filter(id=>results[id]?.status==='done').length;
 const skipped=ids.filter(id=>results[id]?.status==='skipped').length;
 return {answered:progress.completed,total:progress.total,complete:score.complete,profileIndex:score.profileIndex,
  recorded:done,skipped,totalTests:ids.length};
}
export async function downloadClinicReport(answers={},results={},generatedAt=new Date()){
 const mapped={...results};
 // A surface posture observation is qualitative; never turn it into a false SVA value.
 if(mapped.posture?.status==='done'&&!Number.isFinite(mapped.posture?.value)){
  mapped.posture={...mapped.posture};
 }
 const data=buildPdfReportData(answers,mapped,null,false,generatedAt,{mode:'CABINET'});
 return downloadMotionPdf(data);
}
