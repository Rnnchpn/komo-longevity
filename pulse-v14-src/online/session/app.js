import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { motionMarkup } from './motion-view.js';
import { mountMotionController } from './motion-controller.js';
import { INTAKE_GROUPS } from './intake-model.mjs';
import { intakeMarkup,bindIntake } from './intake-view.js';
import { reportMarkup,bindReport } from './intake-report.js';
import {sharedMotionMedia} from './shared-media.js';
import {TERMINAL_TEST_STATUSES,testNavigatorMarkup,completedTestMarkup,mountTestNavigation} from './test-navigation.js';
import {saveProgress,loadProgress,clearProgress,snapshotProgress} from './session-progress.mjs';
import {createDossierQueue,loadSecureDossier} from './secure-dossier.js';
import {verifyPaidSession,getAppointmentFromBrowser,scopedProgressStorage,keepBooking,clearBooking} from './paid-access.js';

const sb = createClient('https://uqlolefsiktbznnymriy.supabase.co', 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n', {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const root = document.getElementById('online-session-app');
const TEST_USER_ID = 'eef2c1ed-3872-47a7-84da-0f70b975c96f';
const PHASES = ['Bienvenue','Questionnaire','Sécurité','Tests guidés','Synthèse'];
const TESTS = [
  {id:'sts',name:'Se relever de la chaise',detail:'30 secondes · observer les répétitions',seconds:30,unit:'répétitions',instruction:'Placez la caméra à hauteur de hanche, de trois-quarts profil, avec tête et pieds visibles. Utilisez une chaise stable, contre un mur, et ne forcez pas.'},
  {id:'heels',name:'Élévations sur les pointes',detail:'20 secondes · observer les répétitions',seconds:20,unit:'répétitions',instruction:'Placez-vous de profil, pieds et bassin visibles. Gardez un appui stable à proximité. Le comptage est exploratoire et sensible au déplacement du corps.'},
  {id:'unipodal_left',name:'Équilibre unipodal · appui gauche',detail:'20 secondes maximum · chronomètre automatique',seconds:20,unit:'secondes',instruction:'Debout face à la caméra, appui fixe à portée de main. Soulevez doucement le pied droit ; le chrono part automatiquement lorsque la position est détectée.'},
  {id:'unipodal_right',name:'Équilibre unipodal · appui droit',detail:'20 secondes maximum · chronomètre automatique',seconds:20,unit:'secondes',instruction:'Debout face à la caméra, appui fixe à portée de main. Soulevez doucement le pied gauche ; le chrono part automatiquement lorsque la position est détectée.'},
  {id:'arms',name:'Mobilité fonctionnelle des bras',detail:'Mouvements des bras · 20 secondes',seconds:20,unit:'mouvements',instruction:'Placez-vous face à la caméra avec épaules et poignets visibles. Levez puis redescendez les deux bras sans forcer.'},
  {id:'posture',name:'Posture · photo de profil',detail:'Position correcte → 3, 2, 1, Top → photo',seconds:0,unit:'indice',instruction:'Mettez-vous naturellement de profil, les pieds visibles. Pulse décompte automatiquement puis prend la photo sans aucun clic.'}
];
const state = {page:0,questionStep:0,returnToSummary:false,answers:{},checks:new Set(),task:0,results:{},program:null,timer:null,remaining:0,stream:null,request:0,cameraChecked:false,engine:null,tracker:null,bodyReady:false,sessionActive:false,sessionFinished:false,startedAt:0,validFrameTime:0};
const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const q = selector=>root.querySelector(selector);
let currentMotionCleanup=null;
const store=(()=>{try{return window.sessionStorage}catch{return null}})();
let progressStore=store;
let paidContext=null;
let dossierQueue=null;
let paidConsentAccepted=false;
let dossierStatus='';
function persistProgress(){
 saveProgress(progressStore,state);
 if(paidContext&&paidConsentAccepted)dossierQueue?.enqueue(state);
}
function secureSaveStatus(message){dossierStatus=message;const x=q('#remote-save-status');if(x)x.textContent=message;}
const btn = (id,title,secondary=false)=>'<button type="button" class="action'+(secondary?' secondary':'')+'" id="'+id+'">'+title+'</button>';

function stopTimer(){if(state.timer){clearInterval(state.timer);state.timer=null;}}
function stopCamera(release=false){
  if(currentMotionCleanup){
   const cleanup=currentMotionCleanup;
   currentMotionCleanup=null;
   cleanup();
  }
  state.request++;
  if(state.engine){state.engine.stop();state.engine=null;}
  state.bodyReady=false;state.sessionActive=false;state.sessionFinished=false;state.countdownActive=false;
  if(release){sharedMotionMedia.stopAll();state.stream=null;}
  else state.stream=sharedMotionMedia.getStream();
  const v=q('#live-video');
  if(v){v.pause();v.srcObject=null;}
}
function next(){stopTimer();stopCamera(state.page===3);state.page=Math.min(PHASES.length-1,state.page+1);render();}
function previous(){stopTimer();stopCamera(state.page===3);state.page=Math.max(0,state.page-1);render();}
function wrap(body){
  root.innerHTML='<section class="session"><div class="session-top"><span>LONGEVITY IN MOTION · KŌMØ PULSE</span><span class="test-badge">'+(paidContext?'BILAN ONLINE · DOSSIER PRIVÉ':'MODE TEST · AUCUN DOSSIER CRÉÉ')+'</span></div>'+
  '<nav class="steps" aria-label="Étapes de la séance">'+PHASES.map((s,i)=>'<span class="'+(i===state.page?'now':i<state.page?'past':'')+'"><b>'+String(i+1).padStart(2,'0')+'</b>'+s+'</span>').join('')+'</nav>'+
  body+
  '<div class="session-bottom"><p>'+(paidContext?'Votre questionnaire et vos mesures chiffrées sont enregistrés dans votre dossier sécurisé Pulse. Aucune vidéo, photo ni audio n’est archivé.':'Démonstration non médicale · progression conservée 4 h dans cet onglet pour reprendre après actualisation.')+'</p>'+
 '<span id="remote-save-status" role="status" class="dossier-save-status">'+(paidContext?esc(dossierStatus):'')+'</span>'+
 '<button id="leave" type="button">'+(paidContext?'Quitter ma séance':'Quitter et effacer la progression')+'</button></div></section>';
  q('#leave').onclick=async()=>{
  stopTimer();stopCamera(true);
  if(dossierQueue){const saved=await dossierQueue.flush();if(!saved){secureSaveStatus('Enregistrement impossible : ne quittez pas avant de réessayer.');return;}}
  clearProgress(progressStore);if(paidContext)clearBooking(store);dossierQueue?.destroy();window.location.assign('/');
 };
}
function feedback(text){const e=q('#message');if(e)e.textContent=text;}
function welcome(){
  wrap('<div class="intro"><div><span class="overline">'+(paidContext?'VOTRE BILAN ONLINE · RÉSERVATION VÉRIFIÉE':'VOTRE BILAN ONLINE · TESTEUR VÉRIFIÉ')+'</span><h1>Votre mouvement.<br><em>Votre point de départ.</em></h1>'+
  '<p>Votre bilan commence par des questionnaires que vous remplissez vous-même, puis se poursuit par les contrôles de sécurité et les tests fonctionnels. Votre profil déclaré sera restitué séparément du Motion Score fondé sur les mesures.</p>'+
  '<div class="fact-row"><div><b>30 min</b><small>Rendez-vous accompagné</small></div><div><b>06</b><small>Modules observés</small></div><div><b>0</b><small>Vidéo enregistrée</small></div></div>'+ '<div class="device-preflight"><div><strong>Vérifier mon appareil avant de commencer</strong><p>Installez votre ordinateur ou votre téléphone de façon stable, avec le corps entier visible. La caméra est nécessaire pour les tests, mais le microphone est facultatif.</p></div><button type="button" id="check-device" class="action secondary">Tester ma caméra</button><p id="device-feedback" class="message" role="status">Test facultatif : autorisation de la caméra uniquement pendant la vérification, puis arrêt immédiat.</p></div>'+
  btn('go',paidContext?'Démarrer mon bilan →':'Démarrer ma consultation test →')+'</div><aside class="intro-side"><span class="orb">K</span><p>Une expérience fluide et guidée : chaque étape vous explique ce qu’il faut faire, avant de passer à la suivante.</p></aside></div>'+
  '<p class="notice">'+(paidContext?'Bilan fonctionnel non médical. Vos réponses et mesures sont enregistrées dans un dossier privé pour reprendre la séance. Le rapport PDF reste téléchargé séparément. Les estimations webcam ne sont pas des diagnostics.':'Cette version est réservée à votre compte testeur. Elle n’implique aucun paiement, n’ouvre aucun accès patient tiers et ne constitue pas une consultation médicale. Utilisez des réponses fictives.')+'</p>'+
 (paidContext?'<label class="dossier-consent"><input type="checkbox" id="dossier-consent" '+(paidConsentAccepted?'checked':'')+'><span>J’accepte l’enregistrement sécurisé de mes réponses de mobilité, de douleur et de mes mesures fonctionnelles dans mon espace Pulse, afin de pouvoir reprendre ce bilan. Je comprends que la vidéo, les photos et le microphone ne sont pas enregistrés.</span></label><p class="message" id="dossier-consent-feedback" role="status"></p>':''));
 const checkDevice=q('#check-device');
 if(checkDevice)checkDevice.onclick=async()=>{
  const label=q('#device-feedback');
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){label.textContent='Caméra indisponible ici : utilisez HTTPS dans Safari ou Chrome récent. Vous pouvez néanmoins remplir le questionnaire.';return;}
  checkDevice.disabled=true;label.textContent='Vérification de la webcam : confirmez l’autorisation demandée par votre navigateur.';
  let stream=null;
  try{
   stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:720},height:{ideal:480}}});
   if(!stream.getVideoTracks().some(track=>track.readyState==='live'))throw Error('no_active_video_track');
   label.textContent='Caméra détectée et fonctionnelle. Elle est immédiatement arrêtée après ce test. Vous pourrez lancer les six épreuves.';
  }catch(error){
   label.textContent=error?.name==='NotAllowedError'?'Accès caméra refusé. Autorisez la caméra dans les réglages du navigateur avant les tests.':error?.name==='NotFoundError'?'Aucune caméra détectée. Essayez un autre appareil.':'Test caméra impossible. Vérifiez les permissions, les applications utilisant déjà la webcam et réessayez.';
  }finally{stream?.getTracks().forEach(track=>track.stop());checkDevice.disabled=false;}
 };
 q('#go').onclick=async()=>{
  if(!paidContext){next();return;}
  if(!paidConsentAccepted){
   if(!q('#dossier-consent')?.checked){
    q('#dossier-consent-feedback').textContent='Veuillez accepter l’enregistrement privé du bilan pour continuer.';
    return;
   }
   const button=q('#go');button.disabled=true;
   const ok=await dossierQueue.firstSave(state);
   if(!ok){button.disabled=false;q('#dossier-consent-feedback').textContent='Impossible de créer le dossier sécurisé. Vérifiez la connexion et réessayez.';return;}
   paidConsentAccepted=true;
  }
  next();
 };
}
function choice(key,title,items){
  return '<fieldset class="question"><legend>'+title+'</legend><div class="choices">'+items.map(x=>'<label><input name="'+key+'" value="'+x[0]+'" type="radio" '+(state.answers[key]===x[0]?'checked':'')+'><span>'+x[1]+'</span></label>').join('')+'</div></fieldset>';
}
function questionnaire(){
 wrap(intakeMarkup(state.answers,state.questionStep));
 bindIntake(root,state.answers,state.questionStep,{
  next(){
   if(state.questionStep<INTAKE_GROUPS.length-1){state.questionStep++;render();return;}
   if(state.returnToSummary){state.returnToSummary=false;state.page=4;render();return;}
   next();
  },
  back(){
   if(state.questionStep>0){state.questionStep--;render();}
   else {state.returnToSummary=false;previous();}
  }
 });
}
function safety(){
  const issue=state.answers.safety==='yes';
  wrap('<div class="paper"><span class="overline">02 / PRÉPARATION & SÉCURITÉ</span><h1>Votre sécurité,<br><em>avant le mouvement.</em></h1>'+
   '<p>En situation réelle, un opérateur confirme que les tests conviennent à la personne. Aucun exercice ne doit être réalisé seul sur la base de cette page.</p>'+
   choice('safety','Malaise, vertiges importants, douleur thoracique, essoufflement inhabituel ou problème récent rendant l’effort risqué ?', [['yes','Oui, au moins un signe'],['no','Non, aucun de ces signes']])+
   (issue?'<div class="notice danger"><b>Tests suspendus.</b> Ne commencez pas les exercices ; demandez un avis professionnel adapté. En cas d’urgence, contactez les secours.</div>':'')+
   '<div class="checklist">'+[['chair','Une chaise stable contre un mur'],['space','Un espace dégagé et éclairé'],['support','Un appui fixe à portée'],['device','Un appareil chargé et stable']].map(item=>'<label><input type="checkbox" value="'+item[0]+'" '+(state.checks.has(item[0])?'checked':'')+'><span>'+item[1]+'</span></label>').join('')+'</div>'+
   '<div class="actions">'+btn('back','← Retour',true)+btn('go',issue?'Passer à la synthèse →':'Commencer les tests →')+'</div><p class="message" id="message" role="status"></p></div>');
  root.querySelectorAll('input[name="safety"]').forEach(el=>el.onchange=()=>{state.answers.safety=el.value;render()});
  root.querySelectorAll('.checklist input').forEach(el=>el.onchange=()=>{if(el.checked)state.checks.add(el.value);else state.checks.delete(el.value)});
  q('#back').onclick=previous;
  q('#go').onclick=()=>{
    if(!state.answers.safety)return feedback('Répondez à la question de sécurité.');
    if(issue){state.page=4;render();return;}
    if(state.checks.size!==4)return feedback('Vérifiez les quatre conditions avant de poursuivre.');
    next();
  };
}
function jumpToTest(index){
 if(state.page!==3&&state.page!==4)return false;
 if(state.answers.safety!=='no')return false;
 if(!Number.isInteger(index)||index<0||index>=TESTS.length)return false;
 if(state.page===3&&(state.sessionActive||state.countdownActive))return false;
 state.page=3;state.task=index;state.remaining=0;
 render();
 return true;
}
function test(){
 const t=TESTS[state.task],record=state.results[t.id]||{value:0,status:'pending',source:'webcam'};
 const existing=TERMINAL_TEST_STATUSES.has(record.status);
 state.sessionActive=false;state.sessionFinished=false;state.countdownActive=false;
 const body=existing?completedTestMarkup(t,record):motionMarkup(t,state.task,TESTS.length);
 wrap(testNavigatorMarkup(TESTS,state.results,state.task)+body);
 mountTestNavigation(root,TESTS,state.results,jumpToTest,state.task);
 if(existing){
  q('#redo-stored-test').onclick=()=>{
   // The old value is dropped only on explicit retake, never when merely visiting.
   delete state.results[t.id];
   sharedMotionMedia.resetReady(t.id);
   persistProgress();render();
  };
  q('#stop-review-camera').onclick=()=>{sharedMotionMedia.stopAll();state.stream=null;q('#stop-review-camera').textContent='Caméra et micro arrêtés';q('#stop-review-camera').disabled=true;};
  q('#keep-stored-test').onclick=()=>{
   if(state.task<TESTS.length-1){state.task++;render();}
   else {state.page=4;render();}
  };
  return;
 }
 currentMotionCleanup=mountMotionController(root,t,record,state,{
  checkpoint(){persistProgress();},
  advance(){
   state.remaining=0;
   if(state.task<TESTS.length-1)state.task++;
   else state.page=4;
   render();
  },
  back(){
   state.remaining=0;
   if(state.task>0)state.task--;
   else state.page=2;
   render();
  }
 });
}
function summary(){
 const blocked=state.answers.safety==='yes';
 wrap((blocked?'':testNavigatorMarkup(TESTS,state.results,null))+
  reportMarkup(state.answers,state.results,blocked,Boolean(paidContext),state.program));
 if(!blocked)mountTestNavigation(root,TESTS,state.results,jumpToTest,null);
 bindReport(root,state.answers,state.results,{
  checkpoint(){persistProgress();},
  isPaid:Boolean(paidContext),
  appointmentId:paidContext?.appointmentId||null,
  async beforeDownload(){
   if(!paidContext)return true;
   persistProgress();
   const saved=await dossierQueue?.flush();
   if(!saved)secureSaveStatus('Sauvegarde du bilan à terminer avant téléchargement');
   return Boolean(saved);
  },
  getProgram(){return state.program;},
  updateProgram(program){state.program=program;persistProgress();},
  back(){state.returnToSummary=true;state.page=1;state.questionStep=0;render();},
  restart(){
   stopTimer();stopCamera(true);clearProgress(progressStore);
   state.page=0;state.questionStep=0;state.returnToSummary=false;
   state.task=0;state.answers={};state.checks.clear();state.results={};state.program=null;state.remaining=0;
   render();
  }
 },state.answers.safety==='yes');
}
function render(){
 stopTimer();stopCamera(state.page!==3);
 persistProgress();
 if(state.page===0)welcome();
 else if(state.page===1)questionnaire();
 else if(state.page===2)safety();
 else if(state.page===3)test();
 else summary();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){state.sessionActive=false;stopTimer();stopCamera(true);persistProgress();const v=q('#live-video');if(v){v.hidden=true;const off=q('#camera-off');if(off)off.hidden=false;const start=q('#start-camera');if(start)start.disabled=false;const stop=q('#stop-camera');if(stop)stop.disabled=true;}}});
window.addEventListener('pagehide',()=>{stopTimer();stopCamera(true)});
async function boot(){
 try{
  const {data,error}=await sb.auth.getUser();
  if(error||!data?.user)throw Error('login');
  const user=data.user;
  if(!user.email_confirmed_at)throw Error('email_not_verified');
  let adminTester=false;
  if(user.id===TEST_USER_ID){
   const role=await sb.from('account_roles').select('role').eq('user_id',user.id).maybeSingle();
   adminTester=!role.error&&role.data?.role==='admin';
  }
  let remoteSnapshot=null;
  if(!adminTester){
   const session=await sb.auth.getSession();
   if(!session.data?.session?.access_token)throw Error('login');
   const bookingId=getAppointmentFromBrowser(window.location.search,store);
   if(!bookingId)throw Error('booking_required');
   // No client-controlled role, query parameter or localStorage flag can
   // bypass the authenticated, current Acuity payment check.
   const verified=await verifyPaidSession({
    accessToken:session.data.session.access_token,
    appointmentId:bookingId
   });
   if(!verified.ok)throw Error(verified.error);
   paidContext={userId:user.id,appointmentId:bookingId};
   progressStore=scopedProgressStorage(store,user.id,bookingId);
   keepBooking(store,bookingId);
   dossierQueue=createDossierQueue({accessToken:session.data.session.access_token,
    appointmentId:bookingId,onStatus:secureSaveStatus});
   const server=await loadSecureDossier(session.data.session.access_token,bookingId);
   if(server.found){
    paidConsentAccepted=true;remoteSnapshot=server.snapshot;
    secureSaveStatus('Dossier privé retrouvé dans Pulse');
   }else clearProgress(progressStore);
  }
  const restored=paidContext?(remoteSnapshot?snapshotProgress(remoteSnapshot):null):loadProgress(progressStore);
  if(restored){
   state.page=restored.page;state.questionStep=restored.questionStep;state.task=restored.task;
   state.answers=restored.answers;state.results=restored.results;state.program=restored.program??null;
   state.checks=new Set(restored.checks);state.returnToSummary=restored.returnToSummary;
   if(state.page===3&&state.answers.safety!=='no')state.page=2;
  }
  root.addEventListener('change',()=>persistProgress());
  render();
 }catch(error){
  const reason=String(error?.message||'booking_verification_failed');
  const loginNeeded=reason==='login';
  const pending=reason==='paid_session_not_enabled';
  const bookingMissing=reason==='booking_required';
  const rawId=new URLSearchParams(location.search).get('appointment')||'';
  const prefilled=/^[1-9][0-9]{0,11}$/.test(rawId)?'?appointment='+encodeURIComponent(rawId):'';
  const activationLink='/online/activate/'+prefilled;
  const title=loginNeeded?'Connectez-vous pour réaliser votre bilan.':pending?'Votre réservation est vérifiée.':'Activez votre accès Online.';
  const message=loginNeeded?'Identifiez-vous sur Pulse avec votre adresse de réservation.':
    pending?'La consultation client est momentanément fermée pendant la mise en service de l’archivage sécurisé des résultats. Votre réservation reste valable.':
    bookingMissing?'Pour commencer, vérifiez votre réservation Acuity réglée avec le même compte Pulse.':
    'Impossible de vérifier une réservation Online active et intégralement réglée pour ce compte. Vérifiez l’adresse e-mail, le numéro du rendez-vous et le paiement.';
  root.innerHTML='<section class="paper access"><span class="overline">ACCÈS SÉCURISÉ AU BILAN ONLINE</span><h1>'+
   esc(title)+'</h1><p>'+esc(message)+'</p><a class="action" href="'+
   (loginNeeded?'/?#connexion':activationLink)+'">'+
   (loginNeeded?'Me connecter à Pulse':'Vérifier ma réservation →')+'</a>'+
   (loginNeeded?'<p class="access-help">Première connexion après réservation ? <a href="'+esc(activationLink)+'">Activez votre compte avec votre e-mail Acuity →</a></p>':'')+
   '<p class="access-help">Besoin d’aide ? <a href="mailto:contact@komolongevity.com">Contacter KŌMØ</a></p></section>';
 }
}
boot();
