// KŌMØ Pulse — « Mon bilan » sur le téléphone du patient (22/11/2026).
// Ouvert par le QR remis en consultation : le patient remplit le questionnaire pendant les tests,
// puis retrouve ses résultats et son passeport PDF à la fin du bilan. Pas de compte, pas de nom :
// le lien porte un jeton personnel de 256 bits (30 jours), retiré de la barre d'adresse dès l'ouverture.
import {INTAKE_GROUPS,intakeProgress,validAnswer,QUESTION_COUNT} from '../motion-engine/intake-model.mjs?v=20261123-passeport-v5';
import {STEPS} from '../motion-protocol.mjs?v=20261123-passeport-v5';
const EDGE="https://uqlolefsiktbznnymriy.supabase.co/functions/v1/motion-live-test";
const KEY="sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n";
const STORE="komo_mon_bilan_v1";
const app=document.getElementById("mbApp"),codeEl=document.getElementById("mbCode");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let token=(location.hash.match(/[#&]t=([A-Za-z0-9_-]{43})/)||[])[1]||"";
if(token){try{localStorage.setItem(STORE,token)}catch{}history.replaceState(null,"",location.pathname)}
else{try{token=localStorage.getItem(STORE)||""}catch{}}
let view=null,answers={},dirty=false,saving=false,saveTimer=null,poll=null,shownState="",extras=null;

async function call(body){
 const r=await fetch(EDGE,{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json",apikey:KEY},
  body:JSON.stringify({...body,patient_token:token})});
 let json={};try{json=await r.json()}catch{}
 if(!r.ok||json.error){const e=Error(json.error||"network_error");e.code=json.error;e.status=r.status;e.data=json;throw e}
 return json;
}
const answeredRequired=()=>intakeProgress(answers).completed;
function setSave(text,state="ok"){const el=document.getElementById("mbSave");if(el){el.textContent=text;el.dataset.state=state}}
function saveLabel(){const n=answeredRequired();
 return n>=QUESTION_COUNT?"✓ Questionnaire complet · vos réponses sont chez votre praticien":"✓ Enregistré · "+n+" / "+QUESTION_COUNT+" réponses"}

function questionMarkup(q,optional){
 const opts=(Array.isArray(q.options[0])?q.options:q.options.map((l,i)=>[String(i),l]));
 const has=Object.hasOwn(answers,q.id)&&validAnswer(q,answers[q.id]);
 return '<fieldset class="mb-q'+(has?" is-done":"")+'" data-q="'+esc(q.id)+'"><legend>'+esc(q.label)+(optional?' <span class="mb-muted">· facultatif</span>':'')+'</legend><div class="mb-opts">'+
  opts.map(([k,l])=>'<label><input type="radio" name="q-'+esc(q.id)+'" value="'+esc(k)+'"'+(answers[q.id]===k?" checked":"")+'><span>'+esc(l)+'</span></label>').join("")+'</div></fieldset>';
}
function questionnaireMarkup(){
 return INTAKE_GROUPS.map(g=>'<section class="mb-group" id="mbGroup-'+esc(g.id)+'"><h3>'+esc(g.title)+'</h3><p class="mb-sub">'+esc(g.subtitle||"")+'</p>'+
  g.questions.map(q=>questionMarkup(q,!!g.optional)).join("")+'</section>').join("");
}
function bindQuestions(){
 app.querySelectorAll('fieldset.mb-q input[type=radio]').forEach(input=>input.addEventListener("change",()=>{
  const id=input.closest("fieldset").dataset.q;answers[id]=input.value;
  input.closest("fieldset").classList.add("is-done");dirty=true;
  clearTimeout(saveTimer);setSave("Enregistrement…");saveTimer=setTimeout(save,450);
  updateProgressOnly();
 }));
}
function updateProgressOnly(){
 const n=answeredRequired(),bar=document.getElementById("mbQBar");
 if(bar)bar.style.width=Math.round(n/QUESTION_COUNT*100)+"%";
 const t=document.getElementById("mbQCount");if(t)t.textContent=n+" / "+QUESTION_COUNT;
}
async function save(){
 if(saving){clearTimeout(saveTimer);saveTimer=setTimeout(save,400);return}
 saving=true;const sent={...answers};
 try{
  const r=await call({action:"patient_questionnaire_save",answers:sent});
  view=r;if(JSON.stringify(sent)===JSON.stringify(answers))dirty=false;
  setSave(saveLabel());
 }catch(e){
  if(e.code==="questionnaire_stale_snapshot"&&e.data?.questionnaire){
   // Le praticien a enregistré une réponse entre-temps : on la garde, puis on renvoie l'ensemble.
   answers={...e.data.questionnaire.answers,...answers};clearTimeout(saveTimer);saveTimer=setTimeout(save,150);
  }else if(["patient_link_expired","patient_link_not_found","patient_link_closed"].includes(e.code)){showInvalid();}
  else{setSave("Connexion perdue · nouvel essai dans quelques secondes…","error");clearTimeout(saveTimer);saveTimer=setTimeout(save,3000)}
 }finally{saving=false}
}

function statusCard(){
 const done=view.tests_done||0,total=(view.steps||STEPS).length;
 return '<div class="mb-card"><span class="mb-over">CONSULTATION EN COURS</span><h1>Votre bilan KŌMØ Motion</h1>'+
  '<div class="mb-steps"><span>Tests réalisés</span><span id="mbTests">'+done+' / '+total+'</span></div>'+
  '<div class="mb-progress"><i id="mbTestsBar" style="width:'+Math.round(done/total*100)+'%"></i></div>'+
  '<p>Pendant les tests, répondez au questionnaire ci-dessous : '+QUESTION_COUNT+' questions, environ 5 minutes. Vos réponses arrivent directement chez votre praticien.</p>'+
  '<p class="mb-muted">Vos résultats et votre passeport apparaîtront sur cette page après la relecture de votre praticien. Gardez-la ouverte ou rouvrez-la plus tard depuis ce téléphone.</p></div>';
}
function questionnaireCard(collapsed){
 const n=answeredRequired();
 const inner='<div class="mb-steps"><span>Questionnaire</span><span id="mbQCount">'+n+' / '+QUESTION_COUNT+'</span></div>'+
  '<div class="mb-progress"><i id="mbQBar" style="width:'+Math.round(n/QUESTION_COUNT*100)+'%"></i></div>'+
  '<p class="mb-muted">Répondez selon votre ressenti habituel. Il n’y a pas de bonne ou de mauvaise réponse.</p>'+questionnaireMarkup();
 return collapsed?'<details class="mb-card"><summary><b>Vos réponses au questionnaire</b> · '+n+' / '+QUESTION_COUNT+'</summary>'+inner+'</details>':
  '<div class="mb-card">'+inner+'</div>';
}
function reviewCard(){
 const done=view.tests_done||0,total=(view.steps||STEPS).length;
 return '<div class="mb-card"><span class="mb-over">BILAN TERMINÉ</span><h1>Vos résultats sont en relecture</h1>'+
  '<div class="mb-steps"><span>Tests réalisés</span><span>'+done+' / '+total+'</span></div>'+
  '<div class="mb-progress"><i style="width:100%"></i></div>'+
  '<p>Votre praticien relit vos mesures avant de vous les remettre. Elles apparaîtront ici, avec votre programme et votre passeport PDF, dès qu’il les aura validées.</p>'+
  '<p class="mb-muted">Vous pouvez fermer cette page et la rouvrir plus tard depuis ce téléphone.</p></div>';
}
async function resultsCard(){
 extras=extras||await import("../motion-live-clinic-extras-v1.js?v=20261123-passeport-v5");
 const passport=extras.clinicPassport(answers,view.results||{},new Date(view.completed_at||Date.now()),
  {subject:view.name||view.code||"Mon bilan KŌMØ",real:!!view.patient?.real,patient:view.patient});
 const lp=passport.longevity,zones={priority:"Priorité",consolidate:"À consolider",solid:"Solide",follow:"Suivi",missing:"Non mesuré"};
 const caps=lp.capacities.map(c=>{
  const m=c.measures.find(x=>x.value!==null&&x.value!==undefined);
  return '<div class="mb-cap"><strong>'+esc(c.name)+'</strong><span class="mb-zone" data-zone="'+esc(c.zone)+'">'+esc(zones[c.zone]||c.zone)+'</span>'+
   (m?'<small>'+esc(m.label)+' : <b>'+esc(m.value)+(m.unit?" "+esc(m.unit):"")+'</b> · '+esc(m.reference)+'</small>':'<small>Non mesuré lors de ce bilan</small>')+'</div>';
 }).join("");
 const prios=lp.priorities.length?lp.priorities.map(p=>'<div class="mb-prio"><b>'+esc(p.name)+'</b><span>Objectif à 6 semaines : '+esc(p.objective)+'</span></div>').join(""):
  '<p>Vos capacités sont solides : le programme vise à les garder.</p>';
 const ex=(passport.actionPlan?.exercises||[]).map(e=>'<div class="mb-prio"><b>'+esc(e.title)+'</b><span>'+esc(e.dose)+' · '+esc(e.frequency)+'</span></div>').join("");
 return '<div class="mb-card"><span class="mb-over">BILAN TERMINÉ</span><h1>'+(view.first_name?'Vos résultats, '+esc(view.first_name):'Vos résultats')+'</h1><p>'+esc(lp.headline)+'</p>'+caps+'</div>'+
  '<div class="mb-card"><h2>Vos priorités</h2>'+prios+'</div>'+
  (ex?'<div class="mb-card"><h2>Votre programme maison</h2><p class="mb-muted">Proposé par votre praticien, à adapter avec lui. Arrêtez en cas de douleur ou de malaise.</p>'+ex+'</div>':'')+
  '<div class="mb-card"><h2>Votre passeport</h2><p>Le document complet : mesures, repères, programme et suivi.</p>'+
  '<button type="button" class="mb-btn" id="mbPdf">Télécharger mon passeport (PDF)</button>'+
  '<p class="mb-muted" id="mbPdfStatus">Contrôle conseillé à 6 semaines : mêmes tests, mêmes conditions, pour mesurer vos progrès réels.</p></div>';
}
async function render(){
 if(!view)return;
 codeEl.textContent=view.name||view.code||"";
 // Résultats visibles seulement après validation du praticien (view.released).
 const state=view.status!=="completed"?"active":view.released?"completed":"review";
 if(state===shownState&&state==="review")return;
 if(state===shownState&&state==="active"){
  // Mise à jour légère : ne pas redessiner le questionnaire pendant la saisie.
  const done=view.tests_done||0,total=(view.steps||STEPS).length;
  const t=document.getElementById("mbTests");if(t)t.textContent=done+" / "+total;
  const b=document.getElementById("mbTestsBar");if(b)b.style.width=Math.round(done/total*100)+"%";
  return;
 }
 shownState=state;
 if(state==="completed"){
  const complete=answeredRequired()>=QUESTION_COUNT;
  app.innerHTML=await resultsCard()+questionnaireCard(complete)+'<div class="mb-save" id="mbSave" role="status"></div>';
  setSave(complete?saveLabel():"Complétez le questionnaire pour un passeport complet · "+answeredRequired()+" / "+QUESTION_COUNT);
  document.getElementById("mbPdf").onclick=async e=>{
   const b=e.currentTarget,st=document.getElementById("mbPdfStatus");b.disabled=true;b.textContent="Préparation du PDF…";
   try{await extras.downloadClinicReport(answers,view.results||{},new Date(),{subject:view.name||view.code||"Mon bilan KŌMØ",real:!!view.patient?.real,patient:view.patient,category:"all"});
    st.textContent="✓ Passeport prêt. Sur iPhone : « Partager » pour l’enregistrer dans Fichiers ou l’imprimer.";}
   catch(err){st.textContent="Le PDF n’a pas pu être préparé : réessayez dans un instant."}
   finally{b.disabled=false;b.textContent="Télécharger mon passeport (PDF)"}
  };
 }else if(state==="review"){
  const complete=answeredRequired()>=QUESTION_COUNT;
  app.innerHTML=reviewCard()+questionnaireCard(complete)+'<div class="mb-save" id="mbSave" role="status"></div>';
  setSave(complete?saveLabel():"Vous pouvez encore compléter le questionnaire · "+answeredRequired()+" / "+QUESTION_COUNT);
 }else{
  app.innerHTML=statusCard()+questionnaireCard(false)+'<div class="mb-save" id="mbSave" role="status"></div>';
  setSave(answeredRequired()?saveLabel():"Vos réponses s’enregistrent automatiquement.");
 }
 bindQuestions();
}
function showInvalid(){
 clearInterval(poll);try{localStorage.removeItem(STORE)}catch{}
 app.innerHTML='<div class="mb-card"><span class="mb-over">LIEN INDISPONIBLE</span><h1>Ce lien n’est plus valide.</h1>'+
  '<p>Il a peut-être été renouvelé ou a dépassé 30 jours. Utilisez le lien reçu par e-mail, ou demandez-en un nouveau à votre praticien.</p></div>';
}
async function refresh(){
 try{
  const r=await call({action:"patient_link_status"});
  view=r;
  if(!dirty&&!saving){
   const before=JSON.stringify(answers);
   answers={...answers,...(r.questionnaire?.answers||{})};
   // Réponse ajoutée ou corrigée par le praticien : on redessine le questionnaire (hors saisie en cours).
   if(before!==JSON.stringify(answers)&&shownState!=="completed")shownState="";
  }
  await render();
  if(r.status==="completed"&&r.released){clearInterval(poll);poll=null}
 }catch(e){
  if(["patient_link_expired","patient_link_not_found","patient_link_closed","invalid_patient_link"].includes(e.code))showInvalid();
  else if(!view)app.innerHTML='<div class="mb-card"><h2>Connexion impossible</h2><p>Vérifiez votre connexion Internet : la page réessaie toute seule.</p></div>';
 }
}
if(!token){
 app.innerHTML='<div class="mb-card"><span class="mb-over">MON BILAN KŌMØ</span><h1>Scannez le QR code de votre consultation.</h1><p>Votre praticien vous le montre au début du bilan. Il ouvre cette page avec votre questionnaire, puis vos résultats.</p></div>';
}else{
 await refresh();
 poll=setInterval(()=>{if(!document.hidden)refresh()},5000);
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")refresh()});
}
