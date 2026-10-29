import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { motionMarkup } from './motion-view.js';
import { mountMotionController } from './motion-controller.js';

const sb = createClient('https://uqlolefsiktbznnymriy.supabase.co', 'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n', {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const root = document.getElementById('online-session-app');
const TEST_USER_ID = 'eef2c1ed-3872-47a7-84da-0f70b975c96f';
const PHASES = ['Bienvenue','Questionnaire','Sécurité','Tests guidés','Synthèse'];
const TESTS = [
  {id:'sts',name:'Se relever de la chaise',detail:'30 secondes · observer les répétitions',seconds:30,unit:'répétitions',instruction:'Placez la caméra à hauteur de hanche, de trois-quarts profil, avec tête et pieds visibles. Utilisez une chaise stable, contre un mur, et ne forcez pas.'},
  {id:'heels',name:'Élévations sur les pointes',detail:'20 secondes · observer les répétitions',seconds:20,unit:'répétitions',instruction:'Placez-vous de profil, pieds et bassin visibles. Gardez un appui stable à proximité. Le comptage est exploratoire et sensible au déplacement du corps.'},
  {id:'balance',name:'Équilibre statique sécurisé',detail:'10 secondes · observer le maintien',seconds:10,unit:'secondes',instruction:'Près d’un support fixe, yeux ouverts. Le détecteur mesure le temps où votre corps reste visible, pas la stabilité posturale.'},
  {id:'arms',name:'Mobilité fonctionnelle des bras',detail:'Observation qualitative · sans angle chiffré',seconds:20,unit:'mouvements',instruction:'Placez-vous face à la caméra avec épaules et poignets visibles. Levez puis redescendez les deux bras sans forcer.'}
];
const state = {page:0,answers:{},checks:new Set(),task:0,results:{},timer:null,remaining:0,stream:null,request:0,cameraChecked:false,engine:null,tracker:null,bodyReady:false,sessionActive:false,sessionFinished:false,startedAt:0,validFrameTime:0};
const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const q = selector=>root.querySelector(selector);
let currentMotionCleanup=null;
const btn = (id,title,secondary=false)=>'<button type="button" class="action'+(secondary?' secondary':'')+'" id="'+id+'">'+title+'</button>';

function stopTimer(){if(state.timer){clearInterval(state.timer);state.timer=null;}}
function stopCamera(){
  if(currentMotionCleanup){
   const cleanup=currentMotionCleanup;
   currentMotionCleanup=null;
   cleanup();
  }
  state.request++;
  if(state.engine){state.engine.stop();state.engine=null;}
  state.bodyReady=false;
  if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}
  const v=q('#live-video');
  if(v){v.pause();v.srcObject=null;}
}
function next(){stopTimer();stopCamera();state.page=Math.min(PHASES.length-1,state.page+1);render();}
function previous(){stopTimer();stopCamera();state.page=Math.max(0,state.page-1);render();}
function wrap(body){
  root.innerHTML='<section class="session"><div class="session-top"><span>LONGEVITY IN MOTION · KŌMØ PULSE</span><span class="test-badge">MODE TEST · AUCUN DOSSIER CRÉÉ</span></div>'+
  '<nav class="steps" aria-label="Étapes de la séance">'+PHASES.map((s,i)=>'<span class="'+(i===state.page?'now':i<state.page?'past':'')+'"><b>'+String(i+1).padStart(2,'0')+'</b>'+s+'</span>').join('')+'</nav>'+
  body+
  '<div class="session-bottom"><p>Démonstration non médicale · aucune réponse, vidéo ou mesure enregistrée sur un serveur.</p><button id="leave" type="button">Quitter le mode test</button></div></section>';
  q('#leave').onclick=()=>{stopTimer();stopCamera();window.location.assign('/')};
}
function feedback(text){const e=q('#message');if(e)e.textContent=text;}
function welcome(){
  wrap('<div class="intro"><div><span class="overline">VOTRE BILAN ONLINE · TESTEUR VÉRIFIÉ</span><h1>Votre mouvement.<br><em>Votre point de départ.</em></h1>'+
  '<p>Bienvenue dans votre expérience KŌMØ Motion Online. Vous allez parcourir le questionnaire, les contrôles de sécurité et les tests guidés, exactement dans l’ordre prévu pour un futur client.</p>'+
  '<div class="fact-row"><div><b>30 min</b><small>Bilan accompagné</small></div><div><b>04</b><small>Tests fonctionnels</small></div><div><b>0</b><small>Vidéo enregistrée</small></div></div>'+
  btn('go','Démarrer ma consultation test →')+'</div><aside class="intro-side"><span class="orb">K</span><p>Une expérience fluide et guidée : chaque étape vous explique ce qu’il faut faire, avant de passer à la suivante.</p></aside></div>'+
  '<p class="notice">Cette version est réservée à votre compte testeur. Elle n’implique aucun paiement, n’ouvre aucun accès patient tiers et ne constitue pas une consultation médicale. Utilisez des réponses fictives.</p>');
  q('#go').onclick=next;
}
function choice(key,title,items){
  return '<fieldset class="question"><legend>'+title+'</legend><div class="choices">'+items.map(x=>'<label><input name="'+key+'" value="'+x[0]+'" type="radio" '+(state.answers[key]===x[0]?'checked':'')+'><span>'+x[1]+'</span></label>').join('')+'</div></fieldset>';
}
function questionnaire(){
  wrap('<div class="paper"><span class="overline">01 / QUESTIONNAIRE</span><h1>Avant de bouger,<br><em>parlons de vous.</em></h1>'+
  '<p>Quatre questions pour préparer le bilan. Saisissez des réponses fictives dans cet environnement test ; aucune donnée n’est conservée.</p>'+
  choice('goal','Votre objectif principal ?', [['independence','Préserver mon autonomie'],['walk','Marcher avec aisance'],['strength','Entretenir ma force'],['understand','Comprendre ma mobilité']])+
  choice('chair','Vous relever d’une chaise semble…',[['easy','Facile'],['medium','Un peu difficile'],['hard','Très difficile']])+
  choice('stairs','Monter un étage semble…',[['easy','Facile'],['medium','Un peu difficile'],['hard','Très difficile']])+
  choice('activity','Votre activité physique habituelle ?', [['low','Rarement'],['medium','1 à 3 jours par semaine'],['high','4 jours ou plus par semaine']])+
  '<div class="actions">'+btn('back','← Retour',true)+btn('go','Vérifier ma sécurité →')+'</div><p class="message" id="message" role="status"></p></div>');
  ['goal','chair','stairs','activity'].forEach(key=>q('fieldset input[name="'+key+'"]')&&root.querySelectorAll('input[name="'+key+'"]').forEach(el=>el.onchange=()=>{state.answers[key]=el.value}));
  q('#back').onclick=previous;
  q('#go').onclick=()=>{
    if(!['goal','chair','stairs','activity'].every(k=>state.answers[k]))return feedback('Répondez aux quatre questions pour poursuivre.');
    next();
  };
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
function test(){
 const t=TESTS[state.task],record=state.results[t.id]||{value:0,status:'pending',source:'webcam'};
 wrap(motionMarkup(t,state.task,TESTS.length));
 currentMotionCleanup=mountMotionController(root,t,record,state,{
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
 const rows=TESTS.map(t=>{
  const r=state.results[t.id];
  let result='Non réalisé';
  if(r?.status==='done'||r?.status==='review')result=r.value+' '+t.unit+' ('+(r.source||'webcam')+(r.status==='review'?', à vérifier':'')+')';
  return '<div><span>'+esc(t.name)+'</span><strong>'+esc(result)+'</strong></div>';
 }).join('');
 wrap('<div class="paper"><span class="overline">04 / SYNTHÈSE DE DÉMONSTRATION</span><h1>Votre mouvement,<br><em>plus lisible.</em></h1>'+
 (blocked?'<div class="notice danger"><b>Tests suspendus pour raisons de sécurité.</b> Cette démonstration ne fournit pas d’avis médical.</div>':'<p>Voici les observations que l’opérateur pourrait retrouver en fin de séance. Ce ne sont pas des mesures cliniquement validées.</p>')+
 '<div class="result-list">'+rows+'</div><p class="notice">Aucune réponse ni vidéo n’a été enregistrée. Les nombres issus de la détection webcam sont exploratoires et restent uniquement dans cette page. Ils disparaissent lorsque vous la quittez ; ils ne sont pas enregistrés dans un dossier patient.</p>'+
 '<div class="actions">'+btn('back','← Revenir aux tests',true)+btn('restart','Recommencer la démonstration →')+'</div></div>');
 q('#back').onclick=()=>{state.task=0;state.page=blocked?2:3;render()};
 q('#restart').onclick=()=>{stopTimer();stopCamera();state.page=0;state.task=0;state.answers={};state.checks.clear();state.results={};state.remaining=0;render()};
}
function render(){
 stopTimer();stopCamera();
 if(state.page===0)welcome();
 else if(state.page===1)questionnaire();
 else if(state.page===2)safety();
 else if(state.page===3)test();
 else summary();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){state.sessionActive=false;stopTimer();stopCamera();const v=q('#live-video');if(v){v.hidden=true;const off=q('#camera-off');if(off)off.hidden=false;const start=q('#start-camera');if(start)start.disabled=false;const stop=q('#stop-camera');if(stop)stop.disabled=true;}}});
window.addEventListener('pagehide',()=>{stopTimer();stopCamera()});
async function boot(){
 try{
  const {data,error}=await sb.auth.getUser();
  if(error||!data.user)throw Error('login');
  const user=data.user;
  if(user.id!==TEST_USER_ID||!user.email_confirmed_at)throw Error('not_tester');
  const role=await sb.from('account_roles').select('role').eq('user_id',user.id).maybeSingle();
  if(role.error||role.data?.role!=='admin')throw Error('not_tester');
  render();
 }catch(error){
  const signedOut=error.message==='login';
  root.innerHTML='<section class="paper access"><span class="overline">ACCÈS AU BILAN ONLINE</span><h1>'+(signedOut?'Connectez-vous à Pulse.':'Accès de démonstration réservé.')+'</h1><p>'+(signedOut?'Identifiez-vous sur Pulse avec votre compte testeur, puis choisissez « Ma consultation Online ».':'Le module test nécessite le compte administrateur vérifié. Les réservations payées ne sont pas encore reliées automatiquement à cette page.')+'</p><a class="action" href="/'+(signedOut?'#connexion':'')+'">Retour à Pulse →</a></section>';
 }
}
boot();
