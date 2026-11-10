import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const sb=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const recoveryLinkDetected=/\btype=recovery\b/.test(location.href)&&/\b(?:access_token|token_hash|code)=/.test(location.href);
let recoveryActive=recoveryLinkDetected;

const PATIENT_NAV=[['home','Mon espace']];
const PRO_NAV=[['live','En direct'],['operator','Consultation Motion'],['patients','Patients'],['appointments','Rendez-vous']];
const OP_STEPS=[
 ['sts','30 s','Se relever de la chaise','Motion Online'],
 ['heels','20 s','Élévations sur les pointes','Motion Online'],
 ['unipodal_left','20 s','Équilibre · pied gauche','Motion Online'],
 ['unipodal_right','20 s','Équilibre · pied droit','Motion Online'],
 ['arms','20 s','Mobilité des bras','Motion Online'],
 ['posture','Observation','Posture de profil','Motion Online']
];

const S={user:null,role:'member',profile:null,profilePhotoUrl:'',mode:'patient',org:null,membership:null,patient:null,ownPatient:null,ownPatients:[],patients:[],assessment:null,questionnaires:[],scores:[],measurements:[],programs:[],trajectory:[],appointments:[],bio:[],gates:[],checkpoints:[],opSession:null,opSteps:[],onlineSessions:[],schema:{bio:false,operator:false},route:'home',loading:false};

const $=s=>document.querySelector(s);
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fmt=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d)};
const fmtShort=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(d)};
const safe=async q=>{try{const r=await q;return r.error?{data:null,error:r.error}:{data:r.data,error:null}}catch(error){return{data:null,error}}};
const toast=m=>{const e=$('#toast');if(!e)return;e.textContent=m;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,3300)};
const hasPro=()=>['professional','admin'].includes(S.role);
const isOnlineTester=()=>S.user?.id==='eef2c1ed-3872-47a7-84da-0f70b975c96f'&&Boolean(S.user?.email_confirmed_at)&&S.role==='admin';
const patientName=()=>S.patient?([S.patient.preferred_name||S.patient.first_name,S.patient.last_name].filter(Boolean).join(' ')||S.profile?.display_name||''):(S.profile?.display_name||'');
const firstName=()=>patientName().split(' ')[0]||'Bonjour';
const route=()=>location.hash.replace(/^#/,'')||((hasPro()&&S.mode==='pro')?'operator':'home');
const score=()=>S.scores[0]||null;
const subs=()=>score()?.subscores||{};
const qdone=()=>S.questionnaires.filter(x=>x.status==='completed'||Number(x.completeness||0)>=100).length;
const bioReady=()=>S.bio.some(x=>['reviewed','released'].includes(x.status));
const motionReady=()=>S.measurements.length>0;
const releasedScore=()=>score()?.overall_score!==null&&score()?.overall_score!==undefined&&score()?.overall_score!==''&&Number.isFinite(Number(score()?.overall_score))&&Number(score()?.overall_score)>=0&&Number(score()?.overall_score)<=100;
const visibleGates=()=>S.gates.filter(g=>['open','review_required','referred'].includes(g.status));
const domainVal=(...keys)=>{for(const k of keys){const raw=subs()[k];if(raw===null||raw===undefined||raw==='')continue;const v=Number(raw);if(Number.isFinite(v)&&v>=0&&v<=100)return v}return null};
const futureAppointments=()=>S.appointments.filter(a=>new Date(a.scheduled_start||0).getTime()>=Date.now()).sort((a,b)=>new Date(a.scheduled_start)-new Date(b.scheduled_start));
const friendlyAppointmentType=v=>({motion:'Bilan de mouvement',clinical:'Consultation médicale',follow_up:'Suivi',baseline:'Bilan KŌMØ'}[v]||'Rendez-vous KŌMØ');
const friendlyMode=v=>({onsite:'Sur place',in_person:'Au centre',clinic:'En centre',home:'À domicile',yacht:'À bord',villa:'En villa',teleconsultation:'En visioconférence',remote:'À distance'}[v]||'Avec votre équipe KŌMØ');
const statusLabel=v=>({scheduled:'Confirmé',confirmed:'Confirmé',pending:'En attente',completed:'Terminé',cancelled:'Annulé',review:'En revue',collecting:'En cours',draft:'À démarrer',running:'En cours',ready:'Prêt'}[v]||'En cours');

function patientProgress(){
  const steps=[
    {id:'questions',label:'Questions',done:qdone()>=1,detail:qdone()?qdone()+' questionnaire(s) terminé(s)':'Quelques minutes pour comprendre votre quotidien'},
    {id:'biology',label:'Prise de sang',done:bioReady(),detail:bioReady()?'Résultats reçus':'À organiser avec l’équipe'},
    {id:'motion',label:'Mesures',done:motionReady(),detail:motionReady()?'Mesures enregistrées':'Votre séance de mouvement'},
    {id:'results',label:'Résultats',done:releasedScore(),detail:releasedScore()?'Disponibles':'Après validation de votre bilan'}
  ];
  const firstPending=steps.find(x=>!x.done)?.id||'results';
  const completed=steps.filter(x=>x.done).length;
  return {steps,firstPending,completed,percent:Math.round(completed/steps.length*100)};
}
function nextAction(){
  const p=patientProgress();
  if(!S.assessment)return {title:'Découvrir votre bilan KŌMØ',text:'Votre équipe préparera votre baseline. Vous pouvez déjà voir comment le parcours se déroule.',label:'Voir mon bilan',route:'baseline'};
  if(p.firstPending==='questions')return {title:'Compléter votre pré-bilan',text:'Quelques questions nous permettent de personnaliser la suite sans ajouter de tests inutiles.',label:'Continuer mon bilan',route:'baseline'};
  if(p.firstPending==='biology')return {title:'Organiser votre prise de sang',text:'Cette étape apporte le contexte biologique utile à l’interprétation globale.',label:'Voir cette étape',route:'baseline'};
  if(p.firstPending==='motion')return {title:'Réaliser vos mesures de mouvement',text:'Une séance guidée mesure votre force, votre équilibre, votre mobilité et votre locomotion.',label:'Voir mon rendez-vous',route:'appointments'};
  if(p.firstPending==='results')return {title:'Vos résultats sont en validation',text:'Votre équipe vérifie la qualité des mesures avant leur publication dans Pulse.',label:'Comprendre mes résultats',route:'results'};
  return {title:'Votre bilan est prêt',text:'Découvrez vos points forts, votre priorité et le plan proposé pour les prochaines semaines.',label:'Voir mes résultats',route:'results'};
}
function band(v){if(!Number.isFinite(v))return{label:'En attente',class:'neutral'};if(v>=80)return{label:'Solide',class:'good'};if(v>=65)return{label:'Bon niveau',class:'good'};if(v>=50)return{label:'À renforcer',class:'mid'};return{label:'Priorité',class:'warn'}}
function domains(){return[
  ['Locomotion','Votre efficacité à vous déplacer',domainVal('locomotion','gait')],
  ['Force','Votre capacité à produire de la force',domainVal('strength')],
  ['Fonction','Votre capacité à vous relever et produire de la puissance',domainVal('function','power_function','power')],
  ['Équilibre','Votre stabilité',domainVal('balance')],
  ['Mobilité','Votre amplitude et qualité de mouvement',domainVal('mobility','movement_quality')]
]}


function passwordRecoveryView(message=''){
  recoveryActive=true;
  $('#app').innerHTML=`<main class="login-page"><section class="login-story"><div class="brand light">KŌMØ<small>PULSE</small></div><div><span class="overline light">ACCÈS SÉCURISÉ</span><h1>Votre espace.<br><em>Votre mot de passe.</em></h1><p>Choisissez un nouveau mot de passe pour continuer votre parcours KŌMØ Pulse.</p></div><div class="login-foot">Vos données restent privées.</div></section><section class="login-panel"><form id="passwordRecovery" class="login-card"><span class="overline">KŌMØ PULSE · SÉCURITÉ</span><h2>Définissez votre mot de passe</h2><p>Votre lien de récupération a été reconnu. Choisissez un nouveau mot de passe de 12 caractères minimum.</p><label><span>Nouveau mot de passe</span><input name="new_password" type="password" autocomplete="new-password" minlength="12" required></label><label><span>Confirmez le mot de passe</span><input name="confirm_password" type="password" autocomplete="new-password" minlength="12" required></label><button class="button primary wide" type="submit">Enregistrer mon nouveau mot de passe</button><p id="recoveryFeedback" role="status" aria-live="polite">${esc(message)}</p></form></section></main>`;
  $('#passwordRecovery').onsubmit=async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    const password=form.elements.new_password.value;
    const confirm=form.elements.confirm_password.value;
    const feedback=$('#recoveryFeedback');
    if(password.length<12){feedback.textContent='Choisissez au moins 12 caractères.';return}
    if(password!==confirm){feedback.textContent='Les deux mots de passe ne correspondent pas.';return}
    const button=form.querySelector('button[type="submit"]');
    button.disabled=true;feedback.textContent='Mise à jour sécurisée en cours…';
    try{
      const {data:session}=await sb.auth.getSession();
      if(!session?.session){feedback.textContent='Le lien a expiré. Retournez à la connexion et demandez un nouvel e-mail.';button.disabled=false;return}
      const {error}=await sb.auth.updateUser({password});
      if(error)throw error;
      recoveryActive=false;
      history.replaceState(null,'',location.pathname+location.search+'#home');
      await boot();
      toast('Votre nouveau mot de passe a été enregistré.');
    }catch(error){feedback.textContent='Impossible d’enregistrer le mot de passe. Réessayez avec un nouveau lien si nécessaire.';button.disabled=false}
  };
}
function passwordResetEmailView(){
  const panel=document.querySelector('.login-panel'),login=document.querySelector('#login');
  if(!panel||!login)return;
  const entry=panel.querySelector('.pulse-entry-panel');
  if(entry)entry.hidden=true;
  login.hidden=true;
  panel.querySelector('#resetEmailForm')?.remove();
  const form=document.createElement('form');
  form.id='resetEmailForm';form.className='login-card maison-login';
  form.innerHTML=`<button type="button" class="text-button" id="resetBack">← Revenir à la connexion</button><span class="overline">KŌMØ PULSE · ACCÈS</span><h2>Retrouvez votre compte.</h2><p>Nous vous enverrons un lien sécurisé pour choisir un nouveau mot de passe.</p><label><span>Votre adresse e-mail</span><input name="email" type="email" autocomplete="email" required></label><button type="submit" class="button primary wide">Recevoir un lien de réinitialisation</button><p id="resetFeedback" role="status" aria-live="polite"></p>`;
  panel.append(form);
  form.elements.email.value=login.elements.email?.value||'';
  form.querySelector('#resetBack').onclick=()=>{form.remove();login.hidden=false;login.querySelector('input[name="email"]')?.focus()};
  form.onsubmit=async e=>{
    e.preventDefault();
    const email=form.elements.email.value.trim().toLowerCase();
    const button=form.querySelector('button[type="submit"]'),feedback=form.querySelector('#resetFeedback');
    if(!email)return;
    button.disabled=true;feedback.textContent='Demande en cours…';
    try{
      const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin});
      if(error)throw error;
      feedback.textContent='Demande envoyée. Si cette adresse correspond à un compte, consultez votre boîte e-mail (et les indésirables) puis cliquez sur le lien reçu. Vous pourrez choisir un nouveau mot de passe.';
    }catch(error){feedback.textContent='La demande n’a pas abouti. Réessayez après quelques instants.'}
    finally{button.disabled=false}
  };
}

async function authView(message=''){
  $('#app').innerHTML=`<main class="login-page"><section class="login-story"><div class="brand light">KŌMØ<small>PULSE</small></div><div><span class="overline light">VOTRE SANTÉ EN MOUVEMENT</span><h1>Comprendre votre corps.<br><em>Simplement.</em></h1><p>Votre bilan, vos résultats et votre plan KŌMØ réunis au même endroit — sans jargon, étape par étape.</p></div><div class="login-foot">Données de santé privées · Accès sécurisé</div></section><section class="login-panel"><form id="login" class="login-card"><span class="overline">KŌMØ PULSE</span><h2>Bienvenue</h2><p>Connectez-vous pour reprendre votre parcours là où vous l’avez laissé.</p><label><span>E-mail</span><input name="email" type="email" autocomplete="email" required></label><label><span>Mot de passe</span><input name="password" type="password" autocomplete="current-password" required minlength="6"></label><button class="button primary wide">Se connecter</button><button class="text-button" type="button" id="reset">Mot de passe oublié ?</button>${message?`<div class="form-error">${esc(message)}</div>`:''}</form></section></main>`;
  $('#login').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const r=await sb.auth.signInWithPassword({email:String(f.get('email')),password:String(f.get('password'))});if(r.error)return authView('Impossible de vous connecter. Vérifiez votre e-mail et votre mot de passe.');await boot()};
  $('#reset').onclick=passwordResetEmailView;

  installPulseBookingEntry();
}

function installPulseBookingEntry(){
  // Pulse is a private entry point. All commercial decisions belong on the public site.
  const onlineOfferUrl='https://komolongevity.com/bilan-en-ligne/';
  const cannesOfferUrl='https://komolongevity.com/fr/reserver-motion-cannes/';
  const story=document.querySelector('.login-story');
  const panel=document.querySelector('.login-panel');
  const form=document.querySelector('#login');
  if(!story||!panel||!form)return;
  const offers=[
    {n:'01',kind:'EN LIGNE',title:'Motion Online',detail:'Un bilan fonctionnel guidé, réalisable à votre rythme depuis chez vous.',meta:'39 € · paiement unique · découvrir le parcours',href:onlineOfferUrl,tone:'online'},
    {n:'02',kind:'À CANNES',title:'Motion Présentiel',detail:'Une heure de mesures de la marche, de l’équilibre et de la mobilité.',meta:'60 min · 200 € · demander un créneau',href:cannesOfferUrl,tone:'motion'}
  ];
  story.innerHTML=`
    <div class="pulse-entry-kinetic" aria-hidden="true"><svg viewBox="0 0 600 600" role="presentation" focusable="false"><defs><radialGradient id="pulseSculpture" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e7d4a6" stop-opacity=".18"/><stop offset="100%" stop-color="#e7d4a6" stop-opacity="0"/></radialGradient></defs><circle cx="300" cy="300" r="285" fill="url(#pulseSculpture)"/><g fill="none" stroke="#d5c49c"><ellipse cx="300" cy="300" rx="215" ry="85" transform="rotate(-38 300 300)" stroke-opacity=".25" stroke-width="1.25"/><ellipse cx="300" cy="300" rx="240" ry="117" transform="rotate(-38 300 300)" stroke-opacity=".15"/><ellipse cx="300" cy="300" rx="265" ry="147" transform="rotate(-38 300 300)" stroke-opacity=".10"/><ellipse cx="300" cy="300" rx="190" ry="67" transform="rotate(36 300 300)" stroke-opacity=".17"/><path d="M125 346C220 205 365 204 472 300" stroke-opacity=".19" stroke-width="2"/></g><circle cx="470" cy="300" r="4" fill="#e1c990"/></svg></div>
    <div class="pulse-entry-brand"><a class="brand light" href="https://komolongevity.com/fr/" aria-label="Retour au site KŌMØ">KŌMØ<small>PULSE · LONGEVITY IN MOTION</small></a><span class="pulse-entry-brand-caption">VOTRE ESPACE PERSONNEL</span></div>
    <div class="pulse-entry-story">
      <span class="overline light pulse-entry-kicker"><i aria-hidden="true"></i> KŌMØ · L'ART DE BOUGER</span>
      <h1>Le mouvement,<br><em>autrement.</em></h1>
      <p class="pulse-entry-lead">Deux parcours pour mieux comprendre votre mouvement. Un espace privé pour accéder à votre suivi et retrouver vos résultats.</p>
      <nav class="pulse-offer-list" aria-label="Les deux bilans KŌMØ">
        ${offers.map(o=>`<a class="pulse-offer pulse-offer--${o.tone}" href="${o.href}" target="_blank" rel="noopener noreferrer" aria-label="Découvrir ${o.title} sur le site KŌMØ">
          <span class="pulse-offer-number">${o.n}</span><span class="pulse-offer-art" aria-hidden="true"><span class="pulse-offer-art-ring"></span><span class="pulse-offer-art-path"></span><span class="pulse-offer-art-core"></span></span><span class="pulse-offer-content"><small>${o.kind}</small><strong>${o.title}</strong><span>${o.detail}</span><em>${o.meta}</em></span><span class="pulse-offer-arrow" aria-hidden="true">↗</span>
        </a>`).join('')}
      </nav>
    </div>
    <div class="pulse-entry-story-footer"><span class="pulse-entry-foot-mark">✧</span><span>Un bilan non médical · une progression suivie</span><a href="https://komolongevity.com/fr/" target="_blank" rel="noopener noreferrer">Découvrir KŌMØ ↗</a></div>`;
  const entry=document.createElement('section');
  entry.className='pulse-entry-panel';
  entry.setAttribute('aria-labelledby','pulseCreateTitle');
  entry.innerHTML=`
    <div class="pulse-entry-panel-header"><span class="pulse-entry-wordmark">KŌMØ <b>Pulse</b></span><span class="pulse-entry-secure">ACCÈS PRIVÉ · SÉCURISÉ</span></div>
    <div class="pulse-entry-monogram" aria-hidden="true"><span class="pulse-entry-monogram-halo"></span><span class="pulse-entry-monogram-letter">K</span><small>LONGEVITY IN MOTION</small></div>
    <span class="overline pulse-entry-onboarding-kicker">BIENVENUE CHEZ KŌMØ</span>
    <h2 id="pulseCreateTitle">Votre espace.<br><em>Votre trajectoire.</em></h2>
    <p class="pulse-entry-panel-intro">Découvrez les expériences KŌMØ sur le site officiel puis retrouvez votre parcours dans votre espace privé Pulse.</p>
    <ol class="pulse-entry-steps">
      <li><span>01</span><div><strong>Choisissez votre expérience</strong><small>Motion Online à 39 € ou bilan présentiel à Cannes, 60 minutes à 200 €.</small></div></li>
      <li><span>02</span><div><strong>Suivez le parcours correspondant</strong><small>En ligne : un paiement unique. Cannes : demande de créneau, puis confirmation individuelle.</small></div></li>
      <li><span>03</span><div><strong>Retrouvez votre espace Pulse</strong><small>Connectez-vous avec votre compte autorisé pour consulter votre parcours et vos résultats disponibles.</small></div></li>
    </ol>
    <a id="pulseAcuityEntry" class="button primary wide pulse-booking-button" href="${onlineOfferUrl}" target="_blank" rel="noopener noreferrer">Découvrir Motion Online · 39 € <span aria-hidden="true">↗</span></a>
    <a class="pulse-entry-online-shortcut" href="${cannesOfferUrl}" target="_blank" rel="noopener noreferrer" aria-label="Découvrir le bilan Motion à Cannes : 60 minutes à 200 euros, demande de créneau">Motion à Cannes <strong>200 € · 60 min</strong> <span aria-hidden="true">↗</span></a>
    <a class="pulse-entry-activation-link" href="./online/activate/" aria-label="Activer ou retrouver mon accès Pulse">Déjà client ? Activer ou retrouver mon compte Pulse <span aria-hidden="true">→</span></a>
    <p class="pulse-entry-assurance"><span aria-hidden="true">◇</span> La demande de créneau à Cannes ne vaut pas réservation. Aucun compte Pulse n’est créé automatiquement par ce formulaire.</p>
    <div class="pulse-entry-login-bridge"><span>Vous avez déjà un compte ?</span><button type="button" class="pulse-login-link" id="pulseShowLogin">Se connecter →</button></div>
    <div class="pulse-entry-legal"><a href="https://komolongevity.com/fr/confidentialite/" target="_blank" rel="noopener noreferrer">Confidentialité</a><a href="https://komolongevity.com/fr/mentions-legales/" target="_blank" rel="noopener noreferrer">Mentions légales</a></div>`;
  panel.prepend(entry);
  // Mobile only: shortcut to the public online offer, not to the retired Acuity flow.
  const mobileBooking=document.createElement('a');
  mobileBooking.className='pulse-mobile-booking-bar';
  mobileBooking.href=onlineOfferUrl;
  mobileBooking.target='_blank';
  mobileBooking.rel='noopener noreferrer';
  mobileBooking.setAttribute('aria-label','Découvrir le bilan Motion Online KŌMØ à 39 euros');
  mobileBooking.innerHTML='<span class="pulse-mobile-booking-copy"><small>MOTION ONLINE</small><strong>39 €</strong></span><span class="pulse-mobile-booking-action">Découvrir <span aria-hidden="true">↗</span></span>';
  document.querySelector('.login-page')?.append(mobileBooking);
  const finePointer=window.matchMedia?.('(hover:hover) and (pointer:fine)');
  if(finePointer?.matches){
    story.querySelectorAll('.pulse-offer').forEach(card=>{
      card.addEventListener('pointermove',event=>{
        const bounds=card.getBoundingClientRect();
        card.style.setProperty('--pulse-pointer-x',(event.clientX-bounds.left)+'px');
        card.style.setProperty('--pulse-pointer-y',(event.clientY-bounds.top)+'px');
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        card.style.removeProperty('--pulse-pointer-x');
        card.style.removeProperty('--pulse-pointer-y');
      });
    });
  }
  form.classList.add('pulse-existing-login');
  const back=document.createElement('button');
  back.type='button';
  back.className='pulse-login-back';
  back.textContent='← Retour aux bilans';
  form.prepend(back);
  const setLogin=visible=>{
    entry.hidden=visible;
    form.hidden=!visible;
    if(visible)form.querySelector('input[name="email"]')?.focus();
  };
  entry.querySelector('#pulseShowLogin')?.addEventListener('click',()=>{
    if(location.hash!=='#connexion')location.hash='connexion';
    setLogin(true);
  });
  back.addEventListener('click',()=>{
    if(location.hash==='#connexion')history.replaceState(null,'',location.pathname+location.search);
    setLogin(false);
  });
  setLogin(location.hash==='#connexion');
}
async function loadIdentity(){
  const u=await sb.auth.getUser();S.user=u.data.user||null;if(!S.user)return false;
  S.profile=(await safe(sb.from('profiles').select('*').eq('id',S.user.id).maybeSingle())).data||{};
  // Private profile photo, read only for the authenticated account.
  S.profilePhotoUrl='';
  if(S.profile.avatar_config?.mode==='photo'&&S.profile.avatar_path){
    const path=String(S.profile.avatar_path).trim().replace(/^profile-avatars\//,'').replace(/^\/+/, '');
    if(path&&!path.includes('..')&&!/^https?:/i.test(path)&&path.length<250){
      const signed=await safe(sb.storage.from('profile-avatars').createSignedUrl(path,3600));
      S.profilePhotoUrl=signed.data?.signedUrl||'';
    }
  }
  const role=(await safe(sb.from('account_roles').select('role').eq('user_id',S.user.id).maybeSingle())).data;S.role=role?.role||'member';
  // A single authenticated user may have several linked patient records.
  // Never use maybeSingle() here: duplicates would incorrectly disable patient mode.
  const own=(await safe(sb.from('patients').select('*').eq('patient_user_id',S.user.id).eq('status','active').order('created_at',{ascending:false}).limit(50))).data||[];
  S.ownPatients=own.filter(p=>p.patient_user_id===S.user.id);
  if(hasPro()){
    const mr=(await safe(sb.from('organization_members').select('*,organizations(*)').eq('user_id',S.user.id).eq('status','active'))).data||[];
    S.membership=mr.find(item=>item.organizations?.name==='KŌMØ Cannes')||mr[0]||null;S.org=S.membership?.organizations||null;
  }else{S.membership=null;S.org=null;}
  const savedOwnId=localStorage.getItem('komo_v14_self_patient');
  S.ownPatient=S.ownPatients.find(p=>p.id===savedOwnId)
    ||S.ownPatients.find(p=>S.org?.id&&p.organization_id===S.org.id)
    ||S.ownPatients.find(p=>!/(?:^|[-_])DEMO(?:[-_]|$)/i.test(String(p.external_reference||'')))
    ||S.ownPatients[0]||null;
  // This is always the logged-in user's own record; pro-selected dossiers never become it.
  S.patient=S.ownPatient;
  if(hasPro()){
    const saved=localStorage.getItem('komo_v14_mode');
    S.mode=saved==='patient'&&Boolean(S.ownPatient)?'patient':'pro';
  }else S.mode='patient';
  return true;
}
async function loadPatientContext(patient){
  if(!patient){Object.assign(S,{assessment:null,questionnaires:[],scores:[],measurements:[],programs:[],trajectory:[],appointments:[],bio:[],gates:[],checkpoints:[]});return}
  S.patient=patient;
  const ar=await safe(sb.from('assessments').select('*').eq('patient_id',patient.id).eq('product_mode','motion').eq('protocol_version','motion-v1.0').order('created_at',{ascending:false}).limit(1));S.assessment=ar.data?.[0]||null;
  S.questionnaires=S.assessment?((await safe(sb.from('questionnaire_sessions').select('*').eq('assessment_id',S.assessment.id).order('created_at',{ascending:false}))).data||[]):[];
  const uid=patient.patient_user_id;
  S.scores=uid?((await safe(sb.from('pulse_score_runs').select('*').eq('user_id',uid).eq('status','released').eq('algorithm_version','motion-score-v1.0').order('released_at',{ascending:false}).limit(5))).data||[]):[];
  S.measurements=uid?((await safe(sb.from('pulse_measurement_sets').select('*').eq('user_id',uid).eq('protocol_version','motion-v1.0').order('captured_at',{ascending:false}).limit(20))).data||[]):[];
  S.programs=uid?((await safe(sb.from('pulse_programs').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(5))).data||[]):[];
  S.trajectory=(await safe(sb.from('trajectory_events').select('*').eq('patient_id',patient.id).order('event_date',{ascending:false}).limit(20))).data||[];
  S.appointments=(await safe(sb.from('organization_appointments').select('*').eq('patient_id',patient.id).order('scheduled_start',{ascending:false}).limit(30))).data||[];
  const br=await safe(sb.from('pulse_biological_panels').select('*').eq('patient_id',patient.id).order('created_at',{ascending:false}).limit(5));S.schema.bio=!br.error;S.bio=br.data||[];
  const gr=await safe(sb.from('pulse_clinical_gates').select('*').eq('patient_id',patient.id).order('created_at',{ascending:false}).limit(20));S.gates=gr.data||[];
  const cr=await safe(sb.from('pulse_checkpoints').select('*').eq('patient_id',patient.id).order('scheduled_at',{ascending:true}).limit(20));S.checkpoints=cr.data||[];
}
async function loadPro(){
  if(!S.org)return;
  S.patients=(await safe(sb.from('patients').select('*').eq('organization_id',S.org.id).eq('status','active').order('last_name',{ascending:true}))).data||[];
  const saved=localStorage.getItem('komo_v14_patient');const p=S.patients.find(x=>x.id===saved)||S.patients[0]||null;if(p)localStorage.setItem('komo_v14_patient',p.id);
  await loadPatientContext(p);
  const os=await safe(sb.from('pulse_operator_sessions').select('*').eq('patient_id',p?.id||'00000000-0000-0000-0000-000000000000').in('status',['draft','running','paused','review']).order('created_at',{ascending:false}).limit(1));
  S.schema.operator=!os.error;S.opSession=os.data?.[0]||null;S.opSteps=S.opSession?((await safe(sb.from('pulse_operator_steps').select('*').eq('operator_session_id',S.opSession.id).order('sequence_order',{ascending:true}))).data||[]):[];
}
async function loadAll(){
  if(S.mode==='pro'&&hasPro()){S.onlineSessions=[];await loadPro();return}
  await loadPatientContext(S.ownPatient);
  // Only metadata for sessions owned by auth.uid(); RLS checks ownership server-side.
  const ownSessions=await safe(sb.from('motion_online_sessions').select('id,appointment_id,status,created_at,updated_at').eq('user_id',S.user.id).order('created_at',{ascending:false}).limit(15));
  S.onlineSessions=(ownSessions.data||[]).filter(x=>x&&typeof x.id==='string');
}

function navItems(){return S.mode==='pro'?PRO_NAV:PATIENT_NAV}
function shell(){
  if(S.mode==='patient'){
    const name=esc(firstName()||'');
    const avatar=esc((firstName()||S.user?.email||'K').slice(0,1).toUpperCase());
    const avatarMarkup=S.profilePhotoUrl?`<img class="p-account-avatar" src="${esc(S.profilePhotoUrl)}" alt="" decoding="async">`:avatar;
    $('#app').innerHTML=`<div class="p-editorial" data-pulse-view="home">
      <header class="p-topbar"><div class="p-topbar-inner">
        <div aria-label="KŌMØ Pulse"><div class="p-wordmark">KŌMØ</div><div class="p-wordmark-sub">PULSE</div></div>
        <div class="p-header-actions"><div class="p-mode"><span class="p-mode-dot"></span>Espace patient</div>
        ${hasPro()?'<button type="button" class="p-team-link" id="p-team-link">Équipe</button>':''}
        <details class="p-account"><summary aria-label="Options du compte">${avatarMarkup}</summary><div class="p-account-popover">
        <span class="p-account-caption">${esc(S.user?.email||name)}</span>
        <button type="button" id="p-logout">Se déconnecter</button></div></details></div>
      </div></header>
      <main class="p-main"><div id="view"></div></main>
      <button type="button" class="pulse-mobile-start-motion" id="pulse-mobile-start-motion">Bilan Motion au centre <span aria-hidden="true">→</span></button>
    </div>`;
    const team=$('#p-team-link');
    if(team)team.onclick=async()=>{
      S.mode='pro';
      localStorage.setItem('komo_v14_mode','pro');
      history.replaceState(null,'',location.pathname+location.search+'#operator');
      await refresh();
    };
    const logout=$('#p-logout');
    if(logout)logout.onclick=async()=>{window.dispatchEvent(new Event('pulse:operator-signout'));await sb.auth.signOut();location.hash='';authView()};
    $('#pulse-mobile-start-motion')?.addEventListener('click',async event=>{
      const button=event.currentTarget;
      if(button.disabled)return;
      button.disabled=true;
      try{await openMotionLivePatient()}finally{button.disabled=false}
    });
    return;
  }
  const icons={
    operator:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    patients:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20v-2.1c0-3.4 2.5-5.4 6.5-5.4s6.5 2 6.5 5.4V20H5.5Z"/></svg>',
    appointments:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17"/></svg>'
  };
  const nav=navItems().map(([id,label],i)=>`<button type="button" data-route="${id}" class="nav-item ${S.route===id?'active':''}" aria-label="${esc(label)}" ${S.route===id?'aria-current="page"':''}><span class="nav-dot" aria-hidden="true">${S.mode==='pro'?(icons[id]||''):i+1}</span><span>${esc(label)}</span></button>`).join('');
  const demoLink=isOnlineTester()?'<a class="pulse-online-tester-link" href="/online/session/">◎ Ma consultation Online <small>Mode test · démarrer</small></a>':'';
  const mode=hasPro()?`<div class="mode-switch" role="group" aria-label="Choisir votre espace"><button type="button" data-mode="patient" class="${S.mode==='patient'?'active':''}" aria-pressed="${S.mode==='patient'}" ${!S.ownPatient?'disabled title="Aucun dossier personnel lié"':''}>Espace patient</button><button type="button" data-mode="pro" class="${S.mode==='pro'?'active':''}" aria-pressed="${S.mode==='pro'}">Équipe</button></div>`:'';
  $('#app').innerHTML=`<div class="app-shell"><aside class="sidebar"><div><div class="brand">KŌMØ<small>PULSE</small></div><p class="sidebar-caption">Votre santé en mouvement</p></div><nav>${nav}</nav><div class="sidebar-bottom">${demoLink}${mode}<button class="text-button logout" id="logout">Se déconnecter</button></div></aside><main class="page"><header class="page-head"><div><span class="overline" id="pageOverline"></span><h1 id="pageTitle"></h1></div><div class="user-chip"><span>${esc((firstName()||S.user?.email||'K').slice(0,1).toUpperCase())}</span><div><strong>${esc(firstName())}</strong><small>${S.mode==='pro'?'Équipe KŌMØ':'Espace patient'}</small></div></div></header><div class="pulse-mobile-access">${mode}<button type="button" id="pulse-mobile-logout" class="pulse-mobile-logout" aria-label="Se déconnecter de Pulse">Déconnexion</button></div><div id="view"></div></main><button type="button" class="pulse-mobile-start-motion" id="pulse-mobile-start-motion">Bilan Motion au centre <span aria-hidden="true">→</span></button></div>`;
  document.querySelector('.app-shell')?.classList.toggle('app-shell-pro',S.mode==='pro');
  document.querySelector('.app-shell')?.classList.toggle('app-shell-patient',S.mode==='patient');
  document.querySelector('.app-shell')?.setAttribute('data-pulse-view',S.route);
  document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.route});
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=async()=>{if(b.disabled||!hasPro())return;const next=b.dataset.mode;if(next==='patient'&&!S.ownPatient)return;S.mode=next;localStorage.setItem('komo_v14_mode',next);history.replaceState(null,'',location.pathname+location.search+'#'+(next==='pro'?'operator':'home'));await refresh()});
  $('#logout').onclick=async()=>{window.dispatchEvent(new Event('pulse:operator-signout'));await sb.auth.signOut();location.hash='';authView()};
  $('#pulse-mobile-logout').onclick=$('#logout').onclick;
  $('#pulse-mobile-start-motion')?.addEventListener('click',()=>{
    // Operator iPhone is the clinic's webcam: it does NOT require a patient selection.
    window.location.assign('/camera/');
  });
}
function heading(title,over='KŌMØ PULSE'){ $('#pageTitle').textContent=title;$('#pageOverline').textContent=over }
function progressStrip(){
  const p=patientProgress();
  return `<div class="progress-card"><div class="progress-top"><div><span class="overline">VOTRE BILAN</span><strong>${p.completed}/4 étapes terminées</strong></div><span class="progress-value">${p.percent}%</span></div><div class="progress-line"><i style="width:${p.percent}%"></i></div><div class="progress-steps">${p.steps.map((s,i)=>`<button class="progress-step ${s.done?'done':s.id===p.firstPending?'current':''}" onclick="location.hash='${s.id==='results'?'results':s.id==='motion'?'appointments':'baseline'}'"><b>${s.done?'✓':i+1}</b><span>${s.label}<small>${s.detail}</small></span></button>`).join('')}</div></div>`;
}
async function openMotionLivePatient(){
  toast('Le bilan sur place est piloté par le professionnel avec son propre iPhone. Aucun accès caméra patient nécessaire.');
}
function patientLobby(){
  const first=esc(S.profile?.first_name||S.profile?.display_name?.split(' ')[0]||S.user?.email?.split('@')[0]||'');
  const online='https://komolongevity.com/bilan-en-ligne/';
  $('#view').innerHTML=`<div class="pulse-patient-lobby">
    <div class="pulse-lobby-intro"><span>MAISON EPIGENETIC · KŌMØ PULSE</span><h1>Bienvenue ${first}.</h1><p>Choisissez le bilan qui vous correspond. Votre espace personnel reste sécurisé.</p></div>
    <div class="pulse-lobby-options">
      <article class="pulse-lobby-option"><div class="pulse-lobby-type"><small>01 · EN LIGNE</small><strong>39 €</strong></div><h2>Motion Online</h2><p>Un bilan guidé à distance. Découvrez le protocole et accédez au paiement sécurisé.</p><a href="${online}" class="pulse-lobby-action">Découvrir Motion Online <span>→</span></a></article>
      <article class="pulse-lobby-option"><div class="pulse-lobby-type"><small>02 · CANNES · 60 MIN</small><strong>200 €</strong></div><h2>Motion au centre</h2><p>Marche, équilibre, force et mobilité. Votre opérateur crée directement votre dossier lors de la consultation : aucune demande de compte à déposer.</p><button type="button" class="pulse-lobby-action pulse-lobby-action-outline" id="pulseLobbyLiveStart">Comment se déroule le bilan <span>→</span></button></article>
    </div>
    <p class="pulse-lobby-footnote">La synchronisation test suit la progression du bilan ; les résultats restent protégés.</p>
  </div>`;
  $('#pulseLobbyLiveStart')?.addEventListener('click',()=>openMotionLivePatient());
}
function patientHome(){
  const now=Date.now();
  const safeDate=v=>{const t=new Date(v||'').getTime();return Number.isFinite(t)?t:null};
  const all=(S.appointments||[]).filter(a=>a&&a.status!=='cancelled'&&safeDate(a.scheduled_start)!==null);
  const chronological=[...all].sort((a,b)=>safeDate(a.scheduled_start)-safeDate(b.scheduled_start));
  const upcoming=chronological.find(a=>safeDate(a.scheduled_start)>=now&&!['completed','no_show'].includes(a.status))||null;
  const inProgress=chronological.find(a=>['arrived','in_progress'].includes(a.status)&&safeDate(a.scheduled_start)<now&&safeDate(a.scheduled_start)>now-12*60*60*1000)||null;
  const appointment=inProgress||upcoming;
  const history=[...all].filter(a=>a.id!==appointment?.id&&safeDate(a.scheduled_start)<now).sort((a,b)=>safeDate(b.scheduled_start)-safeDate(a.scheduled_start));
  const otherUpcoming=chronological.filter(a=>a.id!==appointment?.id&&safeDate(a.scheduled_start)>=now);
  const activeOnline=(S.onlineSessions||[]).find(x=>!['completed','finalized','released','cancelled'].includes(x.status));
  const lastOnline=(S.onlineSessions||[])[0]||null;
  const hasOnline=!appointment&&Boolean(activeOnline);
  const published=releasedScore();
  const first=esc(firstName()||'');
  const profileImage=S.profilePhotoUrl?`<img src="${esc(S.profilePhotoUrl)}" alt="Photo de profil" decoding="async" loading="lazy">`:'';
  const heroPhoto=S.profilePhotoUrl?`<aside class="p-overview-side p-overview-photo"><img src="${esc(S.profilePhotoUrl)}" alt="" decoding="async" loading="lazy"></aside>`:
    '<aside class="p-overview-side p-overview-empty" aria-hidden="true"><div class="p-side-mini">KŌMØ</div></aside>';
  const bookingUrl='https://app.acuityscheduling.com/schedule.php?owner=40696577';
  const label=appointment?'VOTRE PROCHAIN RENDEZ-VOUS':hasOnline?'VOTRE SÉANCE EN LIGNE':published?'VOTRE DERNIER BILAN':'VOTRE PROCHAINE ÉTAPE';
  const title=appointment?friendlyAppointmentType(appointment.appointment_type):hasOnline?'Votre bilan Online':published?'Votre bilan est disponible':'Aucun rendez-vous à venir';
  const status=appointment?(['scheduled','pending'].includes(appointment.status)?'En attente':inProgress?'En cours':'Confirmé'):hasOnline?'À réaliser':published?'Publié':'À organiser';
  const dateText=appointment?`${fmt(appointment.scheduled_start)} · ${new Date(appointment.scheduled_start).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · ${friendlyMode(appointment.location_mode)}`:'';
  const message=appointment?
    (['scheduled','pending'].includes(appointment.status)?
      'Votre demande est enregistrée mais doit encore être confirmée par l’équipe KŌMØ.':
      inProgress?
      'Votre séance est en cours. Votre compte rendu apparaîtra après sa validation.':
      'Votre rendez-vous est confirmé.'):
    hasOnline?'Séance en ligne disponible.':
    published?'Dernier compte rendu disponible.':
    'Aucun rendez-vous programmé.';
  const primary=appointment?
    '<button type="button" class="p-primary" data-p-open="preparation">Préparer mon bilan <span>↗</span></button>':
    hasOnline?'<a class="p-primary" href="/online/session/">Accéder à ma séance <span>↗</span></a>':
    published?'<button type="button" class="p-primary" data-p-open="result">Consulter mon bilan <span>↗</span></button>':
    `<a class="p-primary" href="${bookingUrl}">Prendre rendez-vous <span>↗</span></a>`;
  const secondary=history.length?
    '<button type="button" class="p-tertiary" data-p-open="history">Voir l’historique</button>':
    appointment?'<button type="button" class="p-tertiary" data-p-open="preparation">Détails du rendez-vous</button>':
    published?`<a class="p-tertiary" href="${bookingUrl}">Prendre un nouveau rendez-vous</a>`:'';
  const scoreValue=published?Number(score()?.overall_score):null;
  const scoredDomains=published?domains().filter(([, ,v])=>Number.isFinite(v)).sort((a,b)=>a[2]-b[2]):[];
  const strength=scoredDomains.at(-1),priority=scoredDomains[0];
  const resultTitle=published?'Compte rendu validé':appointment?'Bilan à venir':'Aucun résultat publié';
  const resultCopy=published?'Dernier bilan publié.':appointment?
    'Votre bilan sera disponible après la séance et sa validation par l’équipe.':
    'Vos résultats apparaîtront ici lorsqu’un bilan aura été réalisé puis validé.';
  const lastPast=history[0]||null;
  const historyTitle=lastPast?friendlyAppointmentType(lastPast.appointment_type):otherUpcoming.length?'Autres rendez-vous':'Historique';
  const historyDate=lastPast?fmtShort(lastPast.scheduled_start):'';
  const historyCopy=lastPast?'Dernier rendez-vous.':otherUpcoming.length?
    'Autres rendez-vous à venir.':'Aucun rendez-vous passé.';
  $('#view').innerHTML=`
    <div class="p-page-heading"><div class="p-greeting"><div class="p-greeting-photo">${profileImage}</div>
      <div><span class="p-eyebrow">Espace personnel</span><h1>Bonjour ${first}.</h1></div></div></div>
    <section class="p-overview" aria-label="Votre prochaine étape">
      <div class="p-overview-main"><span class="p-section-kicker">${esc(label)}</span>
        <div class="p-overview-title-row"><h2>${esc(title)}</h2><span class="p-status">${esc(status)}</span></div>
        <p class="p-overview-copy">${dateText?`${esc(dateText)}<br>`:''}${esc(message)}</p>
        <div class="p-actions">${primary}${secondary}</div>
      </div>
      ${heroPhoto}
    </section>
    <section class="p-live-cta"><div><span class="p-card-kicker">CONSULTATION MOTION · CANNES</span><h3>Prêt pour votre bilan ?</h3><p>Le professionnel mène la consultation sur l’ordinateur et utilise son propre iPhone comme caméra. Votre téléphone n’est pas nécessaire.</p></div><button type="button" class="p-primary" id="pulseHomeLiveStart">Informations sur le bilan <span>→</span></button></section>
    <div class="p-section-label"><h3>Votre dossier</h3></div>
    <div class="p-two-cards">
      <section class="p-info-card"><div class="p-card-top"><span class="p-card-kicker">RÉSULTATS</span>
        <span class="p-small-symbol" aria-hidden="true">◷</span></div>
        <h4>${esc(resultTitle)}</h4><p>${esc(resultCopy)}</p>
        ${published?'<button class="p-plain-action" type="button" data-p-open="result">Consulter mon résultat ↗</button>':''}
      </section>
      <section class="p-info-card"><div class="p-card-top"><span class="p-card-kicker">RENDEZ-VOUS PASSÉS</span>
        <span class="p-small-symbol" aria-hidden="true">↗</span></div>
        <h4>Historique</h4>
        ${lastPast?`<div class="p-history-line"><b>${esc(historyTitle)}</b><span>${esc(historyDate)}</span></div>`:''}
        <p>${esc(historyCopy)}</p>
        ${history.length||otherUpcoming.length?'<button class="p-plain-action" type="button" data-p-open="history">Consulter l’historique ↗</button>':''}
      </section>
    </div>
    ${appointment?`<section class="p-info-card p-expanded" id="p-preparation" hidden><h5>Votre rendez-vous</h5>
      <p>${esc(dateText)}</p>
      <p>Prévoyez une tenue confortable pour les mesures de mouvement. Les consignes particulières sont communiquées par votre équipe.</p>
      ${['teleconsultation','remote'].includes(appointment.location_mode)?'<p>En visioconférence, préparez votre caméra, une connexion stable et un espace dégagé. Le lien sera communiqué séparément.</p>':''}
      ${['scheduled','pending'].includes(appointment.status)?'<p>Ce rendez-vous est en attente de confirmation.</p>':''}
    </section>`:''}
    ${published?`<section class="p-info-card p-expanded" id="p-result" hidden><h5>Votre dernier bilan publié</h5>
      <div class="p-score">${Math.round(scoreValue)} <small>/ 100 · Motion Score</small></div>
      <p>Ce score décrit un état fonctionnel mesuré et ne prédit pas votre espérance de vie.</p>
      ${strength?`<div class="p-expanded-row"><b>Point fort</b><span>${esc(strength[0])}</span></div>`:''}
      ${priority?`<div class="p-expanded-row"><b>Priorité</b><span>${esc(priority[0])}</span></div>`:''}
      <p>Ce résultat est votre dernière publication et n’est pas nécessairement lié au rendez-vous affiché plus haut.</p>
    </section>`:''}
    ${history.length||otherUpcoming.length?`<section class="p-info-card p-expanded" id="p-history" hidden>
      <h5>Vos rendez-vous enregistrés</h5>
      ${otherUpcoming.map(a=>`<div class="p-expanded-row"><b>${esc(friendlyAppointmentType(a.appointment_type))}</b><span>${esc(fmtShort(a.scheduled_start))} · À venir</span></div>`).join('')}
      ${history.map(a=>`<div class="p-expanded-row"><b>${esc(friendlyAppointmentType(a.appointment_type))}</b><span>${esc(fmtShort(a.scheduled_start))} · Passé</span></div>`).join('')}
    </section>`:''}
    <div class="p-footer"><span>Compte personnel sécurisé · KŌMØ Pulse</span>
    <a href="mailto:contact@komolongevity.com">Besoin d’aide ? Contactez-nous</a></div>`;
  $('#pulseHomeLiveStart')?.addEventListener('click',()=>openMotionLivePatient());
  document.querySelectorAll('[data-p-open]').forEach(b=>b.addEventListener('click',()=>{
    const target=$('#p-'+b.dataset.pOpen);if(!target)return;
    target.hidden=false;target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
  }));
}
function baseline(){
  heading('Mon bilan','VOTRE BASELINE KŌMØ');
  const p=patientProgress();
  const cards=[
   ['01','Quelques questions','Santé, sommeil, énergie et mobilité','Elles nous donnent votre contexte avant les mesures.','questions'],
   ['02','Prise de sang','Votre contexte biologique','Les résultats sont intégrés après réception et revue.','biology'],
   ['03','Mesures de mouvement','Force, équilibre, mobilité et marche','Une séance guidée, non invasive, réalisée par l’équipe KŌMØ.','motion'],
   ['04','Vos résultats','Une synthèse claire et personnelle','Votre score et votre plan apparaissent après validation.','results']
  ];
  $('#view').innerHTML=`<section class="intro"><h2>Un bilan complet, en quatre étapes simples.</h2><p>Vous n’avez pas besoin de comprendre les appareils ni les algorithmes. Pulse vous indique seulement ce qui est fait, ce qu’il reste à faire et pourquoi.</p></section><section class="journey">${cards.map(([n,title,sub,text,id],i)=>{const st=p.steps[i];return`<article class="journey-card ${st.done?'done':id===p.firstPending?'current':''}"><div class="journey-num">${st.done?'✓':n}</div><div><span class="status-label">${st.done?'Terminé':id===p.firstPending?'Prochaine étape':'À venir'}</span><h3>${title}</h3><strong>${sub}</strong><p>${text}</p>${id==='motion'&&!st.done?`<button class="button secondary" onclick="location.hash='appointments'">Voir mes rendez-vous</button>`:''}${id==='results'&&st.done?`<button class="button primary" onclick="location.hash='results'">Voir mes résultats</button>`:''}</div></article>`}).join('')}</section><article class="info-note"><strong>Ce que nous ne faisons pas</strong><p>Nous ne transformons pas chaque donnée en une note arbitraire. Les informations médicales ou biologiques qui nécessitent une revue restent séparées de votre Motion Score.</p></article>`;
}
function results(){
  heading('Mes résultats','COMPRENDRE VOTRE MOUVEMENT');
  if(!releasedScore()){
    $('#view').innerHTML=`<section class="locked-state"><div class="lock-symbol">K</div><span class="overline">RÉSULTATS EN PRÉPARATION</span><h2>Vos résultats ne sont pas encore publiés.</h2><p>Ils apparaîtront ici dès que votre bilan sera complet et vérifié par l’équipe KŌMØ.</p><button class="button primary" onclick="location.hash='home'">Revenir à aujourd’hui</button></section>${progressStrip()}`;return;
  }
  const total=Number(score().overall_score),b=band(total),ds=domains(),valid=ds.filter(([, ,v])=>Number.isFinite(v)).sort((a,b)=>a[2]-b[2]),priority=valid[0],asset=valid.at(-1);
  $('#view').innerHTML=`<section class="result-hero"><div><span class="overline light">MOTION SCORE</span><div class="result-score"><strong>${Math.round(total)}</strong><span>/100</span></div><div class="score-band ${b.class}">${b.label}</div><p>Une vue synthétique de vos capacités de mouvement à ce moment précis. L’objectif est surtout de suivre votre évolution dans le temps.</p></div><div class="result-summary"><article><span>Votre point fort</span><strong>${esc(asset?.[0]||'—')}</strong></article><article><span>Votre priorité</span><strong>${esc(priority?.[0]||'—')}</strong></article></div></section><section class="domain-grid">${ds.map(([name,desc,v])=>{const bb=band(v);return`<article class="domain-card"><div class="domain-head"><div><h3>${name}</h3><p>${desc}</p></div><strong>${Number.isFinite(v)?Math.round(v):'—'}</strong></div><div class="meter"><i style="width:${Number.isFinite(v)?Math.max(0,Math.min(100,v)):0}%"></i></div><span class="mini-band ${bb.class}">${bb.label}</span></article>`}).join('')}</section><article class="info-note"><strong>Comment lire ces résultats ?</strong><p>Le score sert à suivre votre profil et votre progression. Il ne remplace pas une consultation médicale et ne résume pas à lui seul votre état de santé.</p><details><summary>Voir comment le score est organisé</summary><p>Il combine locomotion, force, fonction, équilibre et mobilité. Les informations médicales nécessitant une revue sont traitées séparément.</p></details></article>`;
}
function plan(){
  heading('Mon plan','VOTRE TRAJECTOIRE');
  if(!releasedScore()){
    $('#view').innerHTML=`<section class="locked-state"><div class="lock-symbol">12</div><span class="overline">VOTRE PLAN PERSONNALISÉ</span><h2>Votre plan sera construit après votre bilan.</h2><p>Il reposera sur 1 à 2 priorités maximum, avec des étapes simples et des points de contrôle.</p><button class="button primary" onclick="location.hash='baseline'">Voir mon bilan</button></section>`;return;
  }
  const valid=domains().filter(([, ,v])=>Number.isFinite(v)).sort((a,b)=>a[2]-b[2]),primary=valid[0],secondary=valid[1],asset=valid.at(-1);
  $('#view').innerHTML=`<section class="plan-head"><div><span class="overline light">12 SEMAINES</span><h2>Une priorité claire.<br>Une progression mesurable.</h2><p>Votre plan est volontairement simple : travailler ce qui compte le plus, sans perdre vos points forts.</p></div></section><section class="three-col"><article class="priority-card primary-priority"><span>Priorité principale</span><h3>${esc(primary?.[0]||'À définir')}</h3><p>${esc(primary?.[1]||'')}</p></article><article class="priority-card"><span>Priorité secondaire</span><h3>${esc(secondary?.[0]||'—')}</h3><p>${esc(secondary?.[1]||'')}</p></article><article class="priority-card"><span>À préserver</span><h3>${esc(asset?.[0]||'—')}</h3><p>Conserver ce point fort pendant le travail des priorités.</p></article></section><section class="phase-list"><article><b>01</b><div><span>Semaines 1–4</span><h3>Installer les bases</h3><p>Technique, régularité et tolérance à l’effort.</p></div></article><article><b>02</b><div><span>Semaines 5–8</span><h3>Renforcer</h3><p>Progression ciblée sur votre priorité principale.</p></div></article><article><b>03</b><div><span>Semaines 9–12</span><h3>Transférer</h3><p>Transformer les gains en fonction et mouvement réel.</p></div></article></section><section class="checkpoint-card"><div><span class="overline">PROCHAINS CONTRÔLES</span><h3>Mesurer pour ajuster, pas pour juger.</h3></div><div class="checkpoint-row">${S.checkpoints.length?S.checkpoints.slice(0,5).map(c=>`<div><strong>${String(c.checkpoint_type||'').toUpperCase()}</strong><span>${fmtShort(c.scheduled_at)}</span></div>`).join(''):`<div><strong>S2</strong><span>Suivi court</span></div><div><strong>S6</strong><span>Contrôle ciblé</span></div><div><strong>S12</strong><span>Réévaluation</span></div>`}</div></section>`;
}
function appointments(){
  heading('Mes rendez-vous',S.mode==='pro'?'AGENDA':'VOTRE SUIVI');
  const rows=[...S.appointments].sort((a,b)=>new Date(a.scheduled_start||0)-new Date(b.scheduled_start||0));
  $('#view').innerHTML=`<section class="intro"><h2>${S.mode==='pro'?'Agenda patient':'Retrouvez toutes vos prochaines étapes.'}</h2><p>${S.mode==='pro'?'Les rendez-vous du patient sélectionné.':'Les rendez-vous confirmés par votre équipe apparaissent ici avec leur date et leur format.'}</p></section><section class="appointment-list">${rows.length?rows.map(a=>`<article class="appointment-card ${new Date(a.scheduled_start||0)>=new Date()?'upcoming':'past'}"><div class="date-box"><strong>${fmtShort(a.scheduled_start)}</strong><span>${new Date(a.scheduled_start||0).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span></div><div><span class="status-label">${statusLabel(a.status)}</span><h3>${friendlyAppointmentType(a.appointment_type)}</h3><p>${friendlyMode(a.location_mode)}</p></div></article>`).join(''):`<article class="empty-state"><h3>Aucun rendez-vous programmé</h3><p>Dès qu’un rendez-vous est confirmé, il apparaîtra automatiquement ici.</p><a class="button secondary" href="mailto:contact@komolongevity.com">Contacter l’équipe KŌMØ</a></article>`}</section>`;
}
function patients(){
  heading('Patients','KŌMØ OPERATOR TEAM');
  const isDemo=p=>/^(?:DEMO|FRIDAY-DEMO|PULSE-MOTION-REPORT-DEMO|E2E[-_]|TEST[-_])/i.test(String(p.external_reference||''))||
    /^(?:patient k[oō]m[oø] demo|test k[oō]m[oø])/i.test([p.first_name,p.last_name].filter(Boolean).join(' '));
  const active=S.patients.filter(p=>!isDemo(p));
  const demos=S.patients.filter(isDemo);
  const card=p=>{
    const name=[p.first_name,p.last_name].filter(Boolean).join(' ').trim()||'Patient KŌMØ';
    const reference=String(p.external_reference||'Dossier KŌMØ');
    const searchText=(name+' '+reference).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr-FR');
    return `<button type="button" data-patient="${esc(p.id)}" data-search="${esc(searchText)}" aria-label="Ouvrir le dossier de ${esc(name)}"><span class="patient-avatar" aria-hidden="true">${esc(name.slice(0,1).toUpperCase())}</span><span class="op-patient-detail"><strong>${esc(name)}</strong><small>${esc(reference)}</small></span><span class="op-patient-arrow" aria-hidden="true">→</span></button>`;
  };
  $('#view').innerHTML=`<section class="op-patients-app" aria-label="Annuaire des patients">
    <header class="op-patients-context"><span class="op-patients-kicker">CENTRE ACTUEL</span><div class="op-patients-context-row"><h2>${esc(S.org?.name||'Centre KŌMØ')}</h2><span class="op-patients-count">${S.patients.length} dossier${S.patients.length>1?'s':''}</span></div></header>
    <div class="op-patients-toolbar"><button type="button" class="button primary" id="opPatientCreateToggle">+ Créer un dossier patient</button><label class="op-patient-search" for="opPatientSearch"><span aria-hidden="true">⌕</span><input id="opPatientSearch" type="search" placeholder="Rechercher un patient ou une référence" autocomplete="off" aria-label="Rechercher un dossier patient"></label><p id="opPatientResultCount" class="op-patients-search-count" aria-live="polite" hidden></p></div>
    <form id="opPatientCreateForm" class="op-create-patient-form" hidden>
      <h3>Nouveau dossier patient</h3>
      <p>Création directe par l'opérateur du centre. Aucun compte patient ou demande préalable nécessaire.</p>
      <div class="op-create-patient-grid">
        <label><span>Prénom</span><input name="first_name" autocomplete="off" maxlength="100" required></label>
        <label><span>Nom</span><input name="last_name" autocomplete="off" maxlength="100" required></label>
        <label><span>Date de naissance</span><input name="birth_date" type="date" required></label>
        <label><span>Sexe de référence</span><select name="sex_at_birth"><option value="not_stated">Non renseigné</option><option value="female">Femme</option><option value="male">Homme</option><option value="intersex">Intersexe</option></select></label>
      </div>
      <p class="op-create-patient-alert">Environnement non validé pour de vraies données de santé : n'utilisez que des dossiers fictifs tant que les exigences d'hébergement et de sécurité ne sont pas satisfaites.</p>
      <label class="op-create-patient-attestation"><input type="checkbox" name="synthetic_attested" required> Je confirme utiliser uniquement une identité fictive dans cet environnement non encore autorisé pour les données de santé réelles.</label>
      <p id="opPatientCreateFeedback" class="op-create-patient-feedback" aria-live="polite"></p>
      <button class="button primary" type="submit">Créer le dossier et ouvrir la consultation →</button>
    </form>
    <section class="op-patients-section" aria-label="Dossiers patients"><div class="op-patients-section-head"><h3>Patients</h3><span>${active.length}</span></div>
    <div class="patient-list" id="opPatientRegular">${active.map(card).join('')||'<p class="op-patients-empty">Aucun dossier patient hors démonstration dans ce centre.</p>'}</div></section>
    ${demos.length?`<details class="op-demo-group" ${active.length===0?'open':''}><summary><span>Dossiers de démonstration</span><span class="op-demo-count">${demos.length}</span></summary><div class="patient-list" id="opPatientDemos">${demos.map(card).join('')}</div></details>`:''}
    <p id="opPatientNoResult" class="op-patients-no-results" hidden>Aucun dossier ne correspond à votre recherche.</p>
  </section>`;
  const createToggle=$('#opPatientCreateToggle'),createForm=$('#opPatientCreateForm');
  if(createToggle&&createForm){
    createToggle.addEventListener('click',()=>{
      createForm.hidden=!createForm.hidden;
      createToggle.setAttribute('aria-expanded',String(!createForm.hidden));
      if(!createForm.hidden)createForm.querySelector('[name="first_name"]')?.focus();
    });
    createForm.querySelector('[name="birth_date"]').max=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Paris'});
    createForm.addEventListener('submit',async event=>{
      event.preventDefault();
      if(!S.org?.id)return toast('Aucun centre actif pour ce compte.');
      if(!createForm.reportValidity())return;
      const fd=new FormData(createForm);
      const body={action:'create',organization_id:S.org.id,first_name:String(fd.get('first_name')||'').trim(),last_name:String(fd.get('last_name')||'').trim(),birth_date:String(fd.get('birth_date')||''),sex_at_birth:String(fd.get('sex_at_birth')||'not_stated'),create_account:false};
      const feedback=$('#opPatientCreateFeedback'),submit=createForm.querySelector('[type="submit"]');
      if(!body.first_name||!body.last_name||!body.birth_date)return;
      submit.disabled=true;if(feedback)feedback.textContent='Création du dossier…';
      try{
        const {data,error}=await sb.functions.invoke('professional-patient',{body});
        if(error||data?.error||!data?.patient?.id)throw Error(data?.detail||data?.error||error?.message||'Création impossible');
        localStorage.setItem('komo_v14_patient',data.patient.id);
        await loadPro();
        location.hash='operator';render();
        toast('Dossier créé. La session Motion peut être démarrée.');
      }catch(error){
        if(feedback)feedback.textContent=error?.message||'Impossible de créer le dossier.';
      }finally{submit.disabled=false}
    });
  }
  document.querySelectorAll('.op-patients-app [data-patient]').forEach(b=>b.onclick=async()=>{
    localStorage.setItem('komo_v14_patient',b.dataset.patient);
    await loadPro();
    location.hash='operator';
    render();
  });
  const input=$('#opPatientSearch');
  input?.addEventListener('input',()=>{
    const query=input.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('fr-FR');
    let count=0, matchedDemos=0;
    document.querySelectorAll('.op-patients-app [data-patient]').forEach(button=>{
      const match=!query||String(button.dataset.search||'').includes(query);
      button.hidden=!match;
      if(match){count++;if(button.closest('.op-demo-group'))matchedDemos++;}
    });
    const demoGroup=document.querySelector('.op-demo-group');
    if(demoGroup&&query&&matchedDemos)demoGroup.open=true;
    const countLabel=$('#opPatientResultCount');
    if(countLabel){countLabel.hidden=!query;countLabel.textContent=query?count+' résultat'+(count>1?'s':''):'';}
    const noResult=$('#opPatientNoResult');
    if(noResult)noResult.hidden=!(query&&count===0);
  });
}
// Test-only live pairing monitor. Backend verifies the operator JWT and org membership.
const MOTION_LIVE_ENDPOINT='https://uqlolefsiktbznnymriy.supabase.co/functions/v1/motion-live-test';
let motionLiveTimer=null,motionLiveFetching=false,motionLiveSignature='';
let operatorLiveTimer=null;
async function motionLiveAPI(body){
  const {data:{session}}=await sb.auth.getSession();
  if(!session?.access_token)throw Error('Session Operator expirée. Connectez-vous à nouveau.');
  const res=await fetch(MOTION_LIVE_ENDPOINT,{method:'POST',cache:'no-store',headers:{
    'Content-Type':'application/json',apikey:SUPABASE_KEY,Authorization:'Bearer '+session.access_token
  },body:JSON.stringify(body)});
  let data={};try{data=await res.json()}catch{throw Error('Réponse serveur illisible.')}
  if(!res.ok||data.error)throw Error(data.error||'Serveur indisponible.');
  return data;
}
async function openOperatorCamera(sessionId,containerId){
  try{
    const camera=await import('./motion-live-operator-video-v1.js?v=20261110-visible-video-v1');
    await camera.openMotionOperatorVideo({sessionId,signal:motionLiveAPI,containerId});
  }catch(error){console.error('[Operator camera]',error);toast(error.message||'Connexion caméra momentanément indisponible.')}
}
function motionLiveMonitor(){
  heading('En direct','KŌMØ OPERATOR · TEST');
  $('#view').innerHTML=`<div class="op-live-dashboard">
    <header class="op-live-head"><div><span class="overline">CONSULTATION PHYSIQUE · DEUX APPAREILS</span><h2>Connecter mon iPhone</h2><p><strong>Sur ton iPhone :</strong> ouvre <strong>pulse.komolongevity.com/camera/</strong> et connecte-toi avec ton compte Operator. <strong>Sur l’ordinateur :</strong> associe la caméra à ton dossier fictif puis réalise les six tests. Le patient n’utilise pas son téléphone.</p></div><button type="button" class="button secondary" id="opLiveRefresh">Actualiser</button></header>
    <div class="op-live-toolbar"><span id="opLiveCount">Recherche de ton iPhone…</span><button type="button" class="button secondary" id="opLiveCopyCameraLink">Copier le lien iPhone</button><button type="button" class="button secondary" id="opLiveNewPatient">+ Dossier fictif</button></div>
    <div id="opLiveRooms" aria-live="polite"><p>Recherche des sessions…</p></div>
    <p class="op-live-caution">Test de consultation physique : ton iPhone est le capteur vidéo du cabinet ; aucune connexion patient sur le téléphone. Vidéo WebRTC sans enregistrement. Dossiers fictifs uniquement ; résultats exploratoires confirmés par l’opérateur.</p>
  </div>`;
  $('#opLiveRefresh').onclick=()=>loadMotionLiveRooms(true);
  $('#opLiveCopyCameraLink').onclick=async()=>{
    const url='https://pulse.komolongevity.com/camera/';
    try{await navigator.clipboard.writeText(url);toast('Lien caméra copié. Ouvre-le sur ton iPhone.')}
    catch{window.prompt('Copie ce lien sur ton iPhone :',url)}
  };
  $('#opLiveNewPatient').onclick=()=>{clearInterval(motionLiveTimer);motionLiveTimer=null;location.hash='patients'};
  clearInterval(motionLiveTimer);motionLiveSignature='';
  loadMotionLiveRooms(true);
  motionLiveTimer=setInterval(()=>loadMotionLiveRooms(false),2400);
}
async function loadMotionLiveRooms(force=false){
 if(motionLiveFetching||location.hash!=='#live')return;
 const host=$('#opLiveRooms');if(!host)return;
 motionLiveFetching=true;
 try{
  const data=await motionLiveAPI({action:'operator_list'});
  const rooms=(data.sessions||[]).filter(x=>x.operator_user_id===S.user?.id&&x.progress?.camera_owner==='operator');
  const signature=JSON.stringify(rooms.map(x=>[x.id,x.status,x.stage_code,x.step_index,x.progress?.step_status,x.patient_id,x.updated_at,x.patient_last_seen_at]));
  const count=$('#opLiveCount');
  if(count)count.textContent=rooms.filter(x=>['waiting','ready','active'].includes(x.status)).length+' session(s) en cours · actualisation automatique';
  if(force||signature!==motionLiveSignature){
   motionLiveSignature=signature;
   const selected=new Map([...host.querySelectorAll('[data-live-select]')].map(x=>[x.dataset.liveSelect,x.value]));
   const statusLabels={waiting:'En attente',ready:'iPhone prêt',active:'Caméra connectée',completed:'Terminé',closed:'Fermé'};
   const choices=S.patients.filter(p=>p.data_classification==='synthetic'&&p.status==='active');
   host.innerHTML=rooms.length?rooms.map(room=>{
    const patient=S.patients.find(p=>p.id===room.patient_id);
    const online=room.patient_last_seen_at&&Date.now()-new Date(room.patient_last_seen_at).getTime()<18000;
    const stage=OP_STEPS.find(x=>x[0]===room.stage_code)?.[2]||(room.stage_code==='finished'?'Parcours terminé':'En préparation');
    const pct=Math.round(Math.min(6,Number(room.step_index)||0)/6*100);
    const patientName=patient?[patient.first_name,patient.last_name].filter(Boolean).join(' '):'Aucun dossier associé';
    return `<article class="op-live-room" data-room="${esc(room.id)}">
      <header><div><span class="overline">CODE DE TON IPHONE</span><h3>${esc(room.display_code)}</h3></div><span class="op-live-tag">${esc(statusLabels[room.status]||room.status)} · ${online?'iPhone connecté':'iPhone hors ligne'}</span></header>
      <p>${esc(patientName)} · ${esc(stage)}</p>
      <div class="op-live-track"><i style="width:${pct}%"></i></div><small>${pct}% des étapes parcourues · ${room.progress?.step_status==='running'?'Test en cours':'Attente du prochain test'}</small>
      <div class="op-live-actions">${!room.patient_id&&['waiting','ready'].includes(room.status)?`<label>Associer à un dossier fictif<select data-live-select="${esc(room.id)}"><option value="">Choisir un patient</option>${choices.map(p=>`<option value="${esc(p.id)}">${esc([p.first_name,p.last_name].filter(Boolean).join(' '))}</option>`).join('')}</select></label><button type="button" class="button primary" data-live-attach="${esc(room.id)}">Associer et ouvrir la consultation</button>`:`${room.patient_id?'<button type="button" class="button primary" data-live-operator="'+esc(room.patient_id)+'">Ouvrir consultation</button>':''}`}
      <button type="button" class="button secondary" data-live-close="${esc(room.id)}">Clore la salle</button></div>
    </article>`;
   }).join(''):'<div class="op-live-empty">Aucune caméra détectée. Sur ton iPhone, ouvre pulse.komolongevity.com/camera/ puis appuie sur « Ouvrir la caméra ».</div>';
   for(const select of host.querySelectorAll('[data-live-select]')){
    if(selected.has(select.dataset.liveSelect))select.value=selected.get(select.dataset.liveSelect);
    else if(S.patient?.data_classification==='synthetic')select.value=S.patient.id;
   }
   host.querySelectorAll('[data-live-attach]').forEach(b=>b.onclick=()=>attachMotionLive(b.dataset.liveAttach,b));
   host.querySelectorAll('[data-live-operator]').forEach(b=>b.onclick=async()=>{
     localStorage.setItem('komo_v14_patient',b.dataset.liveOperator);
     await loadPro();location.hash='operator';render();
   });
   host.querySelectorAll('[data-live-close]').forEach(b=>b.onclick=async()=>{
     if(!confirm('Fermer cette salle de test ?'))return;
     b.disabled=true;
     try{await motionLiveAPI({action:'operator_close',session_id:b.dataset.liveClose});await loadMotionLiveRooms(true)}
     catch(e){toast(e.message||'Fermeture impossible.');b.disabled=false}
   });
  }
 }catch(error){if(host)host.innerHTML='<p class="op-live-error">'+esc(error.message||'Erreur de synchronisation')+'</p>'}
 finally{motionLiveFetching=false}
}
async function attachMotionLive(id,button){
 const select=$('#opLiveRooms [data-live-select="'+id+'"]');
 const patientId=select?.value||'';
 if(!patientId)return toast('Sélectionnez un dossier fictif.');
 const patient=S.patients.find(p=>p.id===patientId);
 if(!patient||patient.data_classification!=='synthetic')return toast('Dossier fictif requis.');
 button.disabled=true;button.textContent='Association…';
 try{
  const result=await sb.rpc('start_pulse_operator_session_v1',{p_patient_id:patientId,p_assessment_id:null});
  if(result.error||!result.data?.session_id)throw Error(result.error?.message||'Impossible de préparer la consultation.');
  await motionLiveAPI({action:'operator_attach',session_id:id,patient_id:patientId,operator_session_id:result.data.session_id});
  localStorage.setItem('komo_v14_patient',patientId);
  toast('Téléphone associé. La consultation est prête.');
  await loadPro();motionLiveSignature='';location.hash='operator';
 }catch(error){toast(error.message||'Association impossible.');button.disabled=false;button.textContent='Associer et ouvrir la consultation'}
}

async function refreshOperatorLiveStatus(){
 const host=$('#operatorLiveStatus');
 if(!host||!S.patient)return;
 try{
  const data=await motionLiveAPI({action:'operator_list'});
  if(!host.isConnected)return;
  const room=(data.sessions||[]).find(x=>x.patient_id===S.patient.id&&['waiting','ready','active','completed'].includes(x.status));
  if(!room){host.innerHTML='<span class="overline">IPHONE DU PRATICIEN</span><p>Aucune caméra liée à ce dossier.</p><button type="button" class="button secondary" data-open-live>Voir les sessions</button>';}
  else{
   const stage=OP_STEPS.find(x=>x[0]===room.stage_code)?.[2]||'Parcours terminé';
   const pct=Math.round(Math.min(6,Number(room.step_index)||0)/6*100);
   const online=room.patient_last_seen_at&&Date.now()-new Date(room.patient_last_seen_at).getTime()<18000;
   host.innerHTML='<span class="overline">CAMÉRA DU CABINET · '+esc(room.display_code)+'</span><h4>'+esc(stage)+'</h4><p>'+esc(room.status==='active'?'Séance en cours':room.status==='completed'?'Étapes terminées':'Prêt à commencer')+' · '+(online?'Téléphone connecté':'Téléphone hors ligne')+'</p><div class="op-live-track"><i style="width:'+pct+'%"></i></div>'+(room.status==='active'&&room.operator_user_id===S.user?.id?'<button type="button" class="button primary" data-operator-camera="'+esc(room.id)+'">◉ Voir la caméra du téléphone</button>':'')+'<button type="button" class="button secondary" data-open-live>Ouvrir le suivi détaillé</button>';
  }
  host.querySelector('[data-open-live]')?.addEventListener('click',()=>{location.hash='live';render()});
  host.querySelector('[data-operator-camera]')?.addEventListener('click',event=>openOperatorCamera(event.currentTarget.dataset.operatorCamera));
 }catch(error){if(host.isConnected)host.textContent='Synchronisation indisponible : '+(error.message||'erreur réseau');}
}
let motionConsultModule=null;
async function operator(){
  heading('Consultation Motion','KŌMØ PULSE · CONSULTATION AU CABINET');
  $('#view').innerHTML='<div id="motionConsultRoot"></div>';
  const root=$('#motionConsultRoot');
  try{
    motionConsultModule=await import('./motion-live-operator-consult-v1.js?v=20261110-balance30-v1');
    if(root?.isConnected&&S.mode==='pro'&&location.hash==='#operator')
      await motionConsultModule.mountOperatorConsultation({root,patient:S.patient,api:motionLiveAPI,openVideo:openOperatorCamera});
  }catch(error){console.error('[Motion consultation]',error);if(root?.isConnected)root.textContent='Consultation indisponible : '+(error.message||'erreur réseau')}
}

function render(){
  S.route=route();
  // Close any remote camera when leaving the two monitored Operator workspaces.
  if(S.mode!=='pro'||S.route!=='operator')
    window.dispatchEvent(new Event('pulse:operator-signout'));
  if(S.mode==='patient'&&S.route!=='home'){
    // Older emails and bookmarked links still open the same patient screen.
    history.replaceState(null,'',location.pathname+location.search+'#home');
    S.route='home';
  }
  const allowed=navItems().map(x=>x[0]);if(!allowed.includes(S.route)){location.hash=allowed[0];return}
  if(S.route!=='operator')motionConsultModule?.disposeOperatorConsultation();
  shell();
  if(S.route!=='live'&&motionLiveTimer){clearInterval(motionLiveTimer);motionLiveTimer=null;}
  if(S.route!=='operator'&&operatorLiveTimer){clearInterval(operatorLiveTimer);operatorLiveTimer=null;}
  if(S.mode==='pro'){if(S.route==='live')motionLiveMonitor();else if(S.route==='operator')operator();else if(S.route==='patients')patients();else appointments()}
  else{if(S.route==='home'){if(!S.ownPatient&&!S.onlineSessions.length)patientLobby();else patientHome()}else if(S.route==='baseline')baseline();else if(S.route==='results')results();else if(S.route==='plan')plan();else appointments()}
}
async function refresh(){if(S.loading)return;S.loading=true;try{await loadIdentity();await loadAll();render()}finally{S.loading=false}}
async function boot(){const session=(await sb.auth.getSession()).data.session;if(!session)return authView();if(recoveryActive)return passwordRecoveryView();await loadIdentity();await loadAll();render()}
window.addEventListener('hashchange',()=>{if(S.user){S.route=route();render()}});
sb.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY'){recoveryActive=true;passwordRecoveryView();return}if(!session&&event==='SIGNED_OUT')authView()});
boot().catch(()=>authView('Une erreur est survenue. Réessayez dans quelques instants.'));
