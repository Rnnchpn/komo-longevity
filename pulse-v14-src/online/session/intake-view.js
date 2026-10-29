import {INTAKE_GROUPS,intakeProgress,completeGroup} from './intake-model.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function optionList(q){
 return q.options.map((item,i)=>{
  const [value,label]=Array.isArray(item)?item:[String(i),item];
  return '<label class="intake-option"><input type="radio" name="'+esc(q.id)+'" value="'+esc(value)+'"><span>'+esc(label)+'</span></label>';
 }).join('');
}
export function intakeMarkup(answers={},step=0){
 const g=INTAKE_GROUPS[step];
 const p=intakeProgress(answers);
 return '<section class="paper intake-paper"><div class="intake-bar-top"><span class="overline">QUESTIONNAIRES KŌMØ · '+(step+1)+' / '+INTAKE_GROUPS.length+'</span>'+
 '<span class="intake-completed">'+p.completed+' / '+p.total+' réponses</span></div>'+
 '<div class="intake-track" role="progressbar" aria-valuenow="'+p.percent+'" aria-valuemin="0" aria-valuemax="100" aria-label="Questionnaires remplis"><span style="width:'+p.percent+'%"></span></div>'+
 '<h1>'+esc(g.title)+'<em>.</em></h1><p class="intake-subtitle">'+esc(g.subtitle)+'</p>'+
 '<div class="intake-group-tabs">'+INTAKE_GROUPS.map((item,i)=>'<span class="'+(i===step?'active':i<step?'done':'')+'">'+(i+1)+' · '+esc(item.title)+'</span>').join('')+'</div>'+
 '<div class="intake-question-list">'+g.questions.map((item,i)=>'<fieldset class="intake-question"><legend><span>'+(i+1)+'.</span> '+esc(item.label)+'</legend><div class="intake-choices">'+optionList(item)+'</div></fieldset>').join('')+'</div>'+
 '<p class="intake-disclaimer">'+esc(g.note)+'</p>'+
 '<div class="intake-bottom"><button type="button" class="action secondary" id="intake-back">← '+(step===0?'Accueil':'Précédent')+'</button>'+
 '<button type="button" class="action" id="intake-next">'+(step===INTAKE_GROUPS.length-1?'Vérifier ma sécurité →':'Continuer →')+'</button></div>'+
 '<p class="message" id="intake-error" role="status"></p></section>';
}
export function bindIntake(root,answers,step,{next,back,rerender}){
 const group=INTAKE_GROUPS[step];
 for(const question of group.questions){
  const choices=[...root.querySelectorAll('input[name="'+question.id+'"]')];
  const current=answers[question.id];
  const selected=choices.find(el=>el.value===String(current));
  if(selected)selected.checked=true;
  for(const el of choices)el.onchange=()=>{
   answers[question.id]=el.value;
   const completed=root.querySelector('.intake-completed');
   if(completed){
    const p=intakeProgress(answers);
    completed.textContent=p.completed+' / '+p.total+' réponses';
    root.querySelector('.intake-track').setAttribute('aria-valuenow',String(p.percent));
    root.querySelector('.intake-track span').style.width=p.percent+'%';
   }
   const error=root.querySelector('#intake-error');
   if(error)error.textContent='';
  };
 }
 root.querySelector('#intake-back').onclick=back;
 root.querySelector('#intake-next').onclick=()=>{
  if(!completeGroup(group,answers)){
   root.querySelector('#intake-error').textContent='Répondez aux '+group.questions.length+' questions de cette section avant de continuer.';
   const missing=group.questions.find(q=>!Object.hasOwn(answers,q.id));
   if(missing)root.querySelector('input[name="'+missing.id+'"]')?.focus();
   return;
  }
  next();
 };
}
