// Patient-facing no-login CHECK-IN with a clinician-issued, one-time token.
// The patient does not use this device as a camera. DEMO alias only.
const API='https://uqlolefsiktbznnymriy.supabase.co/functions/v1/motion-live-test';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const root=document.getElementById('checkinApp');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const token=new URLSearchParams(location.search).get('invitation')||'';
const text=(message)=>{const e=document.getElementById('checkinFeedback');if(e)e.textContent=message};
let interval=null,active=false;
async function api(action,data={}){
 const res=await fetch(API,{method:'POST',cache:'no-store',referrerPolicy:'no-referrer',
 headers:{'Content-Type':'application/json',apikey:KEY},body:JSON.stringify({action,guest_token:token,...data})});
 let result={};try{result=await res.json()}catch{throw Error('Réponse du centre indisponible')}
 if(!res.ok||result.error)throw Error({session_expired:'Le lien a expiré. Demandez-en un nouveau au praticien.',
 invalid_guest_token:'Ce lien est invalide.',
 session_not_found:'Ce lien est introuvable.',
 already_submitted:'Ce formulaire a déjà été envoyé.',
 invalid_demo_details:'Complétez les champs avec des informations fictives.'}[result.error]||'Connexion au centre indisponible.');
 return result;
}
function form(){
 root.innerHTML='<span class="overline">ÉTAPE 1 / 2 · PRÉPARATION</span><h1>Votre bilan commence ici.</h1>'+
 '<p>Renseignez quelques éléments pour préparer une séance Motion. Aucun compte, aucun mot de passe, aucune caméra demandée sur cet appareil.</p>'+
 '<div class="checkin-notice"><strong>Mode démonstration :</strong> utilisez uniquement un pseudonyme et un profil fictif. Ne saisissez ni nom réel, ni information médicale.</div>'+
 '<form id="checkinForm">'+
 '<label>Pseudonyme fictif<input name="alias" type="text" placeholder="Ex. Camille Démo" maxlength="32" autocomplete="off" required></label>'+
 '<label>Tranche d’âge fictive<select name="age_band" required><option value="">Sélectionner</option>'+
 '<option value="under40">Moins de 40 ans</option><option value="40-49">40–49 ans</option>'+
 '<option value="50-59">50–59 ans</option><option value="60-69">60–69 ans</option>'+
 '<option value="70-79">70–79 ans</option><option value="80plus">80 ans et plus</option></select></label>'+
 '<label>Objectif du bilan<select name="goal" required><option value="">Choisir un objectif</option>'+
 '<option value="independence">Préserver mon autonomie</option>'+
 '<option value="walk">Améliorer la marche</option><option value="strength">Entretenir ma force</option>'+
 '<option value="confidence">Améliorer mon équilibre</option>'+
 '<option value="general">Faire un bilan de mouvement</option></select></label>'+
 '<label class="checkin-consent"><input type="checkbox" name="synthetic" required>'+
 '<span>Je confirme que toutes les informations ci-dessus sont fictives et destinées exclusivement à tester KŌMØ Pulse.</span></label>'+
 '<button type="submit" id="checkinSubmit">Je suis prêt pour ma consultation →</button>'+
 '<p class="checkin-error" id="checkinFeedback" role="alert"></p></form>';
 const formEl=document.getElementById('checkinForm');
 formEl.onsubmit=async event=>{
  event.preventDefault();if(active||!formEl.reportValidity())return;
  active=true;const button=document.getElementById('checkinSubmit');button.disabled=true;
  const d=new FormData(formEl);
  try{
   const res=await api('patient_checkin_submit',{
    alias:String(d.get('alias')||'').trim(),
    age_band:String(d.get('age_band')||''),
    goal:String(d.get('goal')||''),
    synthetic_attested:d.get('synthetic')==='on'
   });
   ready(res.code,false);
  }catch(error){text(error.message||'Impossible de transmettre la préparation');button.disabled=false}
  finally{active=false}
 };
}
function ready(code,accepted){
 root.innerHTML='<span class="overline">ÉTAPE 2 / 2 · PRÊT POUR LE BILAN</span>'+
 '<h1>'+ (accepted?'Votre dossier est prêt.':'Tout est prêt.') +'</h1>'+
 '<p>'+ (accepted?'Le praticien a ouvert votre dossier. La consultation Motion est pilotée depuis son ordinateur.':
 'Votre préparation est transmise à l’équipe. Indiquez ce code au praticien si nécessaire :') +'</p>'+
 '<div class="ready-code"><small>Code de votre séance</small><strong>'+esc(code||'———')+'</strong></div>'+
 '<p><span class="status-dot"></span><span id="checkinFeedback">'+(accepted?'Dossier préparé · Bonne consultation.':'En attente du praticien…')+'</span></p>'+
 '<p>La caméra utilisée pour mesurer les mouvements est celle du centre, sur le trépied. Votre téléphone ne filme rien.</p>';
}
async function poll(){
 try{const d=await api('patient_checkin_status');
  if(d.state==='invited'&&!document.getElementById('checkinForm'))form();
  else if(d.state==='ready'){if(!document.querySelector('.ready-code'))ready(d.code,false)}
  else if(d.state==='accepted'){ready(d.code,true);clearInterval(interval);interval=null}
 }catch(error){
  if(!document.querySelector('.ready-code')){
   root.innerHTML='<span class="overline">PRÉPARATION INDISPONIBLE</span><h1>Lien non disponible.</h1>'+
    '<p>'+esc(error.message||'Demandez un nouveau lien à l’équipe.')+'</p>';
  }else text('Connexion perdue · Présentez simplement votre code au praticien.');
  if(interval){clearInterval(interval);interval=null}
 }
}
if(!/^[A-Za-z0-9_-]{43}$/.test(token)){
 root.innerHTML='<span class="overline">INVITATION REQUISE</span><h1>Votre bilan en un geste.</h1>'+
  '<p>Demandez au praticien son lien de préparation. Il vous permettra de commencer sans créer de compte.</p>';
}else{void poll().then(()=>{interval=setInterval(poll,3500)})}
