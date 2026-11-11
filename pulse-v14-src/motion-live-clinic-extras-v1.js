// Reuse the existing Motion Online questionnaires and PDF engine for supervised clinic demos.
// The physician/operator edits all fields on the desktop; nothing is collected on the iPhone.
// This module has no access to camera frames, audio or WebRTC signaling.
import {INTAKE_GROUPS, QUESTION_COUNT, intakeProgress, scoreIntake, validAnswer} from './online/session/intake-model.mjs';
import {buildClinicPassport} from './motion-live-clinic-passport-v2.mjs?v=20261111-two-step-pdf-v2';
import {downloadClinicPassport} from './motion-live-clinic-passport-pdf-v2.js?v=20261111-two-step-pdf-v2';
import {clinicRadarMarkup} from './motion-live-clinic-action-plan-v1.mjs?v=20261111-two-step-pdf-v2';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const questionnaireGroups=INTAKE_GROUPS;
export const questionnaireCount=QUESTION_COUNT;
export function questionnaireState(answers={}){
 return {progress:intakeProgress(answers),score:scoreIntake(answers)};
}
export function questionnairePointsMarkup(answers={}){
 const {progress,score}=questionnaireState(answers);
 const headline=score.complete?
  score.rawPoints+' / '+score.maxPoints+' points de difficulté · indice '+score.profileIndex+' / 100':
  'Indice en attente · '+progress.completed+' / '+progress.total+' réponses';
 const detail=score.complete?
  '0 point = sans difficulté ; 4 = limitation maximale. Indice pondéré : 100 = profil le plus favorable.':
  '20 réponses notées de 0 à 4, plus âge et objectif descriptifs. Le score final exige les 22 réponses.';
 const domains=score.complete?INTAKE_GROUPS.filter(g=>g.scored!==false).map(g=>
  '<span>'+esc(g.title)+' : <b>'+score.domainPoints[g.id].points+
  '/'+score.domainPoints[g.id].maximum+' pts</b> · '+score.domains[g.id]+'/100</span>').join(''):'';
 return '<div class="moc-points-head"><strong>'+headline+'</strong><small>'+detail+
  '</small></div>'+(domains?'<div class="moc-point-domains">'+domains+'</div>':'');
}
export function renderClinicQuestionnaire(root,answers={},page=0,{onChange,onNext,onPrevious,onComplete,onTests,onSave}={}){
 // A single clearly numbered form: all 22 items must remain discoverable.
 const progress=intakeProgress(answers);
 let index=0;
 const sections=INTAKE_GROUPS.map(group=>{
  const questions=group.questions.map(question=>{
   index+=1;
   const choices=question.options.map((item,i)=>{
    const value=Array.isArray(item)?item[0]:String(i);
    const label=Array.isArray(item)?item[1]:item;
    return '<label class="moc-question-choice"><input type="radio" name="'+esc(question.id)+
     '" value="'+esc(value)+'"'+(String(answers[question.id]??'')===String(value)?' checked':'')+
     '><span>'+esc(label)+'</span>'+
     (group.scored===false?'':'<small class="moc-answer-points">'+i+' pt</small>')+'</label>';
   }).join('');
   return '<fieldset class="moc-question" id="mocQuestion-'+esc(question.id)+'"><legend>'+
    String(index).padStart(2,'0')+'. '+esc(question.label)+'</legend>'+
    '<div class="moc-question-choices">'+choices+'</div></fieldset>';
  }).join('');
  return '<section class="moc-question-group" id="mocGroup-'+esc(group.id)+'">'+
   '<h4>'+esc(group.title)+'</h4><p class="moc-help">'+esc(group.subtitle)+'</p>'+
   '<div class="moc-question-list">'+questions+'</div>'+
   '<p class="moc-help">'+esc(group.note)+'</p></section>';
 }).join('');
 root.innerHTML='<section class="moc-test moc-questionnaire moc-questionnaire-all">'+
  '<div class="moc-question-head"><span class="moc-kicker">QUESTIONNAIRE KŌMØ · 22 QUESTIONS SUR UNE PAGE</span>'+
  '<strong id="mocIntakeProgress">'+progress.completed+' / '+QUESTION_COUNT+' réponses</strong></div>'+
  '<h3>Vos 22 réponses</h3><p class="moc-help">Les cinq catégories sont accessibles ci-dessous. Répondez à chaque item puis vérifiez l’enregistrement avant l’export PDF.</p>'+
  '<div class="moc-points-summary" id="mocScoreSummary" aria-live="polite">'+questionnairePointsMarkup(answers)+'</div>'+
  '<nav class="moc-question-jumps" aria-label="Accéder à une catégorie">'+
   INTAKE_GROUPS.map((g,i)=>'<a href="#mocGroup-'+esc(g.id)+'" data-group="'+esc(g.id)+'">'+
    (i+1)+'. '+esc(g.title)+'</a>').join('')+'</nav>'+
  sections+
  '<p id="mocIntakeState" class="moc-status" role="status" aria-live="polite">Les réponses se sauvegardent automatiquement. Attendez la confirmation du serveur.</p>'+
  '<div class="moc-buttons moc-questionnaire-actions">'+
  '<button type="button" id="mocIntakeSave" class="moc-button secondary">Enregistrer les réponses</button>'+
  '<button type="button" id="mocIntakePrev" class="moc-button secondary">Retour aux tests</button>'+
  '<button type="button" id="mocIntakeNext" class="moc-button primary">Enregistrer et voir le rapport →</button>'+
  '</div></section>';
 for(const group of INTAKE_GROUPS)for(const question of group.questions){
  root.querySelectorAll('input[name="'+question.id+'"]').forEach(input=>{
   input.onchange=()=>{
    if(!validAnswer(question,input.value))return;
    answers[question.id]=input.value;
    root.querySelector('#mocIntakeProgress').textContent=
     intakeProgress(answers).completed+' / '+QUESTION_COUNT+' réponses';
    root.querySelector('#mocScoreSummary').innerHTML=questionnairePointsMarkup(answers);
    const note=root.querySelector('#mocIntakeState');
    if(note)note.textContent='Enregistrement sur le serveur…';
    onChange?.(answers);
   };
  });
 }
 root.querySelectorAll('.moc-question-jumps a').forEach(link=>{
  link.onclick=event=>{
   event.preventDefault();
   const target=root.querySelector('#mocGroup-'+link.dataset.group);
   target?.scrollIntoView({behavior:'smooth',block:'start'});
  };
 });
 root.querySelector('#mocIntakePrev').onclick=()=>onTests?.();
 root.querySelector('#mocIntakeSave').onclick=()=>onSave?.();
 root.querySelector('#mocIntakeNext').onclick=()=>onComplete?.();
}
export function clinicReportSummary(answers={},results={}){
 const {progress,score}=questionnaireState(answers);
 const ids=['sts',results.two_step?'two_step':'heels','unipodal_left','unipodal_right','arms','posture'];
 const done=ids.filter(id=>results[id]?.status==='done').length;
 const skipped=ids.filter(id=>results[id]?.status==='skipped').length;
 return {answered:progress.completed,total:progress.total,complete:score.complete,profileIndex:score.profileIndex,
  rawPoints:score.rawPoints,maxPoints:score.maxPoints,domainPoints:score.domainPoints,
  recorded:done,skipped,totalTests:ids.length};
}
export function clinicPassport(answers={},results={},date=new Date(),options={}){
 return buildClinicPassport(answers,results,{date,subject:options.subject||'Dossier fictif',
  simulated:options.simulated===true});
}
export async function downloadClinicReport(answers={},results={},generatedAt=new Date(),options={}){
 const passport=clinicPassport(answers,results,generatedAt,options);
 return downloadClinicPassport(passport,options.category||'all');
}

export function clinicRadar(plan){return clinicRadarMarkup(plan)}
